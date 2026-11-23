import { ActivityIndicator, Pressable, Text, type PressableProps } from 'react-native';

type Variant = 'primary' | 'outline' | 'ghost' | 'danger';

interface ButtonProps extends Omit<PressableProps, 'children'> {
  label: string;
  variant?: Variant;
  loading?: boolean;
  className?: string;
}

const containerStyles: Record<Variant, string> = {
  primary: 'bg-primary',
  outline: 'border border-primary bg-transparent',
  ghost: 'bg-transparent',
  danger: 'bg-danger',
};

const labelStyles: Record<Variant, string> = {
  primary: 'text-white',
  outline: 'text-primary',
  ghost: 'text-primary',
  danger: 'text-white',
};

export function Button({
  label,
  variant = 'primary',
  loading = false,
  disabled,
  className = '',
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={isDisabled}
      className={`flex-row items-center justify-center rounded-xl px-4 py-3 ${
        containerStyles[variant]
      } ${isDisabled ? 'opacity-50' : 'active:opacity-80'} ${className}`}
      {...props}>
      {loading ? (
        <ActivityIndicator
          color={variant === 'outline' || variant === 'ghost' ? '#2563eb' : '#ffffff'}
        />
      ) : (
        <Text className={`text-base font-semibold ${labelStyles[variant]}`}>{label}</Text>
      )}
    </Pressable>
  );
}
