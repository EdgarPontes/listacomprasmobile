import { View, type ViewProps } from 'react-native';

interface CardProps extends ViewProps {
  className?: string;
}

export function Card({ className = '', ...props }: CardProps) {
  return (
    <View
      className={`rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm ${className}`}
      {...props}
    />
  );
}
