const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const source = fs.readFileSync(require('node:path').join(__dirname, '../src/lib/permission-state.ts'), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
const sandbox = { exports: {} }; vm.runInNewContext(compiled, sandbox);
const { clasificar, esParcial, esRecurso } = sandbox.exports;
const response = (status, canAskAgain) => ({ status, granted: status === 'granted', canAskAgain });
test('los cuatro estados distinguen carga, acceso y posibilidad real de preguntar', () => {
  assert.equal(clasificar(null), 'cargando');
  assert.equal(clasificar(response('undetermined', true)), 'preguntable');
  assert.equal(clasificar(response('denied', true)), 'preguntable');
  assert.equal(clasificar(response('denied', false)), 'bloqueado');
  assert.equal(clasificar(response('granted', false)), 'concedido');
});
test('la autorización provisional habilita avisos sin confundirla con bloqueo', () => {
  assert.equal(clasificar(response('denied', false), true), 'concedido');
});
test('el matiz parcial detecta fotos limitadas y ambas plataformas de ubicación', () => {
  assert.equal(esParcial(null), false);
  assert.equal(esParcial({ ...response('granted', true), accessPrivileges: 'limited' }), true);
  assert.equal(esParcial({ ...response('granted', true), android: { accuracy: 'coarse' } }), true);
  assert.equal(esParcial({ ...response('granted', true), ios: { accuracy: 'reduced' } }), true);
  assert.equal(esParcial({ ...response('granted', true), ios: { accuracy: 'full' } }), false);
});
test('no admite recursos arbitrarios ni parámetros repetidos de una URL', () => {
  assert.equal(esRecurso('camara'), true);
  assert.equal(esRecurso('microfono'), false);
  assert.equal(esRecurso(['camara']), false);
  assert.equal(esRecurso(undefined), false);
});
