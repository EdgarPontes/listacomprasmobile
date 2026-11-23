import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as z from 'zod';

import { register as registerUser } from '@/api/auth';
import { getApiErrorMessage } from '@/api/client';
import { useAuth } from '@/auth/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

const schema = z.object({
  email: z.string().email('Informe um e-mail válido'),
  password: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres'),
});

type FormValues = z.infer<typeof schema>;

export default function LoginScreen() {
  const { signIn } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [apiError, setApiError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const insets = useSafeAreaInsets();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = handleSubmit(async values => {
    setApiError(null);
    setInfo(null);

    try {
      if (mode === 'login') {
        await signIn(values.email.trim(), values.password);
      } else {
        await registerUser(values.email.trim(), values.password);
        setInfo('Conta criada com sucesso! Agora faça login.');
        setMode('login');
        reset({ email: values.email.trim(), password: '' });
      }
    } catch (error) {
      setApiError(getApiErrorMessage(error));
    }
  });

  function toggleMode() {
    setMode(current => (current === 'login' ? 'register' : 'login'));
    setApiError(null);
    setInfo(null);
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        className="bg-zinc-50"
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'center',
          paddingHorizontal: 24,
          paddingTop: insets.top + 24,
          paddingBottom: insets.bottom + 24,
        }}
        keyboardShouldPersistTaps="handled">
        <View className="mb-8 gap-2">
          <Text className="text-3xl font-bold text-zinc-900">Lista de Compras</Text>
          <Text className="text-zinc-500">
            {mode === 'login'
              ? 'Entre na sua conta para continuar.'
              : 'Crie sua conta para começar.'}
          </Text>
        </View>

        <View className="gap-4 rounded-2xl border border-zinc-200 bg-white p-5">
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="E-mail"
                autoCapitalize="none"
                autoComplete="email"
                keyboardType="email-address"
                placeholder="voce@exemplo.com"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.email?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Senha"
                secureTextEntry
                autoCapitalize="none"
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                placeholder="••••••"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.password?.message}
              />
            )}
          />

          {apiError ? <Text className="text-sm text-danger">{apiError}</Text> : null}
          {info ? <Text className="text-sm text-success">{info}</Text> : null}

          <Button
            label={mode === 'login' ? 'Entrar' : 'Criar conta'}
            onPress={() => {
              void onSubmit();
            }}
            loading={isSubmitting}
          />

          <Button
            label={mode === 'login' ? 'Criar conta' : 'Já tenho conta'}
            variant="ghost"
            onPress={toggleMode}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
