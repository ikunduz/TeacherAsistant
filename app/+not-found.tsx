import { Link, Stack } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '../src/constants/Colors';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!', headerShown: false }} />
      <View style={styles.container}>
        <Text style={styles.emoji}>🔍</Text>
        <Text style={styles.title}>Bu sayfa bulunamadı.</Text>
        <Text style={styles.subtitle}>Aradığınız sayfa mevcut değil veya taşınmış olabilir.</Text>

        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>Ana Sayfaya Dön</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: Colors.iosBg,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  link: {
    paddingVertical: 14,
    paddingHorizontal: 28,
    backgroundColor: Colors.primary,
    borderRadius: 14,
  },
  linkText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
});