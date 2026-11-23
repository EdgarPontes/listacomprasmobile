import { Text, TextInput, View, type TextInputProps } from 'react-native';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerClassName?: string;
}

export function Input({
  label,
  error,
  containerClassName = '',
  className = '',
  ...props
}: InputProps) {
  return (
    <View className={`gap-1 ${containerClassName}`}>
      {label ? <Text className="text-sm font-medium text-zinc-700">{label}</Text> : null}
      <TextInput
        placeholderTextColor="#9ca3af"
        className={`rounded-xl border bg-white px-4 py-3 text-base text-zinc-900 ${
          error ? 'border-danger' : 'border-zinc-300'
        } ${className}`}
        {...props}
      />
      {error ? <Text className="text-xs text-danger">{error}</Text> : null}
    </View>
  );
}
