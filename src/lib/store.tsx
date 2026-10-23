import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';
import { Ubicacion } from './ubicacion';

export const categorias = ['electricidad', 'agua', 'mobiliario', 'equipos'] as const;
export type Borrador = { titulo: string; descripcion: string; aula: string; categoria: typeof categorias[number]; foto?: string; sector: string; ubicacion?: Ubicacion };
export type Reporte = Borrador & { id: string; estado: 'pendiente' | 'en curso' | 'resuelto'; fecha: string };
export type Aviso = { id: string; reporteId: string; texto: string; fecha: string };
type Datos = { reportes: Reporte[]; avisos: Aviso[]; notificar: boolean; borrador: Borrador };
const nuevo = (): Borrador => ({ titulo: '', descripcion: '', aula: '', categoria: 'electricidad', sector: '' });
const inicial: Datos = { reportes: [], avisos: [], notificar: false, borrador: nuevo() };
type Contexto = Datos & { cargando: boolean; error: string; editar: (p: Partial<Borrador>) => void; crear: () => Promise<string>;
  cambiarEstado: (id: string, estado: Reporte['estado']) => void; setNotificar: (value: boolean) => void; guardarFoto: (uri: string) => Promise<void> };
const Context = createContext<Contexto | null>(null);
const KEY = 'mantenimiento-ipf-v1';
export function StoreProvider({ children }: React.PropsWithChildren) {
  const [datos, setDatos] = useState<Datos>(inicial);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const escritura = useRef(Promise.resolve());
  useEffect(() => { void (async () => {
    try {
      const raw = await AsyncStorage.getItem(KEY);
      if (raw) { const value = JSON.parse(raw); if (!Array.isArray(value.reportes) || !Array.isArray(value.avisos)) throw new Error(); setDatos({ ...inicial, ...value }); }
    } catch { setError('No pudimos recuperar los datos guardados en este dispositivo.'); }
    finally { setCargando(false); }
  })(); }, []);
  useEffect(() => {
    if (cargando) return;
    escritura.current = escritura.current.then(() => AsyncStorage.setItem(KEY, JSON.stringify(datos)))
      .catch(() => { setError('No se pudieron guardar los cambios. Comprobá el espacio del dispositivo.'); });
  }, [datos, cargando]);
  const editar = (p: Partial<Borrador>) => setDatos(d => ({ ...d, borrador: { ...d.borrador, ...p } }));
  const crear = async () => {
    if (!datos.borrador.titulo.trim() || !datos.borrador.descripcion.trim() || !datos.borrador.aula.trim()) throw new Error('Completá título, descripción y aula.');
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    setDatos(d => ({ ...d, reportes: [{ ...d.borrador, titulo: d.borrador.titulo.trim(), descripcion: d.borrador.descripcion.trim(), aula: d.borrador.aula.trim(), id, estado: 'pendiente', fecha: new Date().toISOString() }, ...d.reportes], borrador: nuevo() }));
    return id;
  };
  const cambiarEstado = (id: string, estado: Reporte['estado']) => setDatos(d => {
    const r = d.reportes.find(r => r.id === id);
    if (!r || r.estado === estado || r.estado === 'resuelto') return d;
    const aviso = { id: `resuelto-${id}`, reporteId: id, texto: `Se resolvió tu reporte: ${r.titulo}`, fecha: new Date().toISOString() };
    return { ...d, reportes: d.reportes.map(r => r.id === id ? { ...r, estado } : r), avisos: estado === 'resuelto' ? [aviso, ...d.avisos] : d.avisos };
  });
  const guardarFoto = async (uri: string) => {
    if (!FileSystem.documentDirectory) throw new Error('El almacenamiento de fotos requiere Android o iOS.');
    const carpeta = FileSystem.documentDirectory + 'reportes/';
    await FileSystem.makeDirectoryAsync(carpeta, { intermediates: true });
    const destino = carpeta + Date.now() + '.jpg';
    await FileSystem.copyAsync({ from: uri, to: destino });
    editar({ foto: destino });
  };
  return <Context.Provider value={{ ...datos, cargando, error, editar, crear, cambiarEstado, guardarFoto,
    setNotificar: notificar => setDatos(d => ({ ...d, notificar })) }}>{children}</Context.Provider>;
}
export function useStore() { const ctx = useContext(Context); if (!ctx) throw new Error('Falta StoreProvider'); return ctx; }
