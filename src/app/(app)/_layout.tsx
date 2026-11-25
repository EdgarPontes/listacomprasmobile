import { Stack } from 'expo-router';

const listScreenOptions = {
  headerTitleAlign: 'center' as const,
  headerTintColor: '#2563eb',
  headerStyle: { backgroundColor: '#ffffff' },
};

export default function AppLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen
        name="lists/new"
        options={{ ...listScreenOptions, title: 'Nova lista' }}
      />
      <Stack.Screen
        name="lists/[id]"
        options={{ ...listScreenOptions, title: 'Lista' }}
      />
    </Stack>
  );
}
