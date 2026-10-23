import { router } from 'expo-router';
import { Body, Button, Screen } from '../components/UI';
export default function NoEncontrada() { return <Screen title="Esta pantalla no existe"><Body>Volvé al inicio para ver tus reportes.</Body><Button title="Ir al inicio" onPress={() => router.replace('/')} /></Screen>; }
