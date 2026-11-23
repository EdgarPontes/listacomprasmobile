import { Text, View } from 'react-native';

import { Button } from './Button';

interface EmptyStateProps {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center gap-3 px-8">
      <Text className="text-center text-xl font-semibold text-zinc-900">{title}</Text>
      {description ? (
        <Text className="text-center text-zinc-500">{description}</Text>
      ) : null}
      {actionLabel && onAction ? (
        <Button label={actionLabel} onPress={onAction} className="mt-2" />
      ) : null}
    </View>
  );
}
