import { Text, View } from 'react-native';

import { Button } from './Button';

interface ErrorViewProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorView({ message, onRetry }: ErrorViewProps) {
  return (
    <View className="flex-1 items-center justify-center gap-4 bg-zinc-50 px-6">
      <Text className="text-center text-lg font-semibold text-zinc-900">Algo deu errado</Text>
      <Text className="text-center text-zinc-500">{message}</Text>
      {onRetry ? <Button label="Tentar novamente" onPress={onRetry} /> : null}
    </View>
  );
}
