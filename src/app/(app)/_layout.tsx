import { Stack } from 'expo-router';

export default function AppLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen
        name="lists/new"
        options={{
          title: 'Nova lista',
          headerTitleAlign: 'center',
          headerTintColor: '#2563eb',
          headerStyle: { backgroundColor: '#ffffff' },
        }}
      />
    </Stack>
  );
}
