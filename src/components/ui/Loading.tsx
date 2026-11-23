import { ActivityIndicator, Text, View } from 'react-native';

interface LoadingProps {
  message?: string;
}

export function Loading({ message = 'Carregando...' }: LoadingProps) {
  return (
    <View className="flex-1 items-center justify-center gap-3 bg-zinc-50">
      <ActivityIndicator size="large" color="#2563eb" />
      <Text className="text-zinc-500">{message}</Text>
    </View>
  );
}
