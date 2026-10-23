import React from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
export const colors = { bg: '#F3F5F9', ink: '#162239', muted: '#637087', blue: '#315BE8', border: '#DCE2EE', green: '#127852' };
export function Screen({ children, title, subtitle }: React.PropsWithChildren<{ title: string; subtitle?: string }>) {
  return <SafeAreaView style={s.safe} edges={['left', 'right', 'bottom']}><ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={s.screen}>
    <Text style={s.eyebrow}>IPF / MANTENIMIENTO</Text><Text accessibilityRole="header" style={s.title}>{title}</Text>
    {subtitle && <Text style={s.subtitle}>{subtitle}</Text>}{children}
  </ScrollView></SafeAreaView>;
}
export function Card({ children }: React.PropsWithChildren) { return <View style={s.card}>{children}</View>; }
export function Button({ title, onPress, secondary = false, disabled = false }: { title: string; onPress: () => void; secondary?: boolean; disabled?: boolean }) {
  return <Pressable accessibilityRole="button" accessibilityState={{ disabled }} disabled={disabled} onPress={onPress}
    style={({ pressed }) => [s.button, secondary && s.secondary, (pressed || disabled) && { opacity: 0.5 }]}><Text style={[s.buttonText, secondary && { color: colors.blue }]}>{title}</Text></Pressable>;
}
export function Field({ label, ...props }: TextInputProps & { label: string }) { return <View style={{ gap: 7 }}><Text style={s.label}>{label}</Text><TextInput accessibilityLabel={label} placeholderTextColor={colors.muted} {...props} style={[s.input, props.multiline && { minHeight: 110, textAlignVertical: 'top' }, props.style]} /></View>; }
export function Body({ children }: React.PropsWithChildren) { return <Text style={s.body}>{children}</Text>; }
export function Heading({ children }: React.PropsWithChildren) { return <Text style={s.heading}>{children}</Text>; }
export function Notice({ children }: React.PropsWithChildren) { return <View accessibilityLiveRegion="polite" style={s.notice}><Text style={s.body}>{children}</Text></View>; }
export function Loading() { return <View style={{ padding: 24, gap: 12 }}><ActivityIndicator color={colors.blue} /><Body>Consultando…</Body></View>; }
export function Badge({ text }: { text: string }) { return <Text style={s.badge}>{text}</Text>; }
export const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg }, screen: { padding: 22, gap: 18, paddingBottom: 40, maxWidth: 720, width: '100%', alignSelf: 'center' },
  eyebrow: { fontSize: 11, fontWeight: '800', letterSpacing: 2, color: colors.blue, marginTop: 8 }, title: { fontSize: 32, fontWeight: '800', color: colors.ink, letterSpacing: -1 },
  subtitle: { fontSize: 16, color: colors.muted, lineHeight: 24 }, card: { padding: 20, borderRadius: 20, backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border, gap: 13 },
  button: { backgroundColor: colors.blue, minHeight: 50, padding: 14, borderRadius: 13, justifyContent: 'center', alignItems: 'center' }, secondary: { backgroundColor: '#EBEFFF' },
  buttonText: { fontSize: 15, color: '#fff', fontWeight: '700', textAlign: 'center' }, label: { fontSize: 14, fontWeight: '700', color: colors.ink }, input: { backgroundColor: '#fff', padding: 14, borderRadius: 12, borderColor: colors.border, borderWidth: 1, color: colors.ink, fontSize: 16 },
  body: { color: colors.muted, lineHeight: 23, fontSize: 15 }, heading: { fontWeight: '700', fontSize: 19, color: colors.ink }, notice: { padding: 16, borderRadius: 13, backgroundColor: '#E9EEFF' }, badge: { alignSelf: 'flex-start', color: colors.green, backgroundColor: '#E5F5EC', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, fontSize: 12, fontWeight: '700' },
});
