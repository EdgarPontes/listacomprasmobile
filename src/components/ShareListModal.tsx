import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  Text,
  View,
} from 'react-native';

import { getApiErrorMessage } from '@/api/client';
import type { SharePermission } from '@/api/share';
import { useShareList } from '@/hooks/useShareList';

import { Button } from './ui/Button';
import { Input } from './ui/Input';

interface ShareListModalProps {
  listId: string;
  listTitle: string;
  onClose: () => void;
}

const permissionOptions: { value: SharePermission; label: string }[] = [
  { value: 'view', label: 'Somente leitura' },
  { value: 'edit', label: 'Pode editar' },
];

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function ShareListModal({ listId, listTitle, onClose }: ShareListModalProps) {
  const shareListMutation = useShareList();

  const [email, setEmail] = useState('');
  const [permissions, setPermissions] = useState<SharePermission>('view');
  const [error, setError] = useState<string | null>(null);

  async function handleShare() {
    const trimmedEmail = email.trim().toLowerCase();
    setError(null);

    if (!EMAIL_PATTERN.test(trimmedEmail)) {
      setError('Informe um e-mail válido.');
      return;
    }

    try {
      await shareListMutation.mutateAsync({ listId, email: trimmedEmail, permissions });
      onClose();
      Alert.alert(
        'Lista compartilhada',
        `"${listTitle}" foi compartilhada com ${trimmedEmail} (${
          permissions === 'edit' ? 'edição' : 'leitura'
        }).`
      );
    } catch (shareError) {
      Alert.alert('Erro', getApiErrorMessage(shareError));
    }
  }

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView
        className="flex-1 justify-center bg-black/40 px-5"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View className="gap-4 rounded-2xl bg-white p-5">
          <Text className="text-xl font-bold text-zinc-900">Compartilhar lista</Text>
          <Text className="text-sm text-zinc-500">
            Compartilhe &quot;{listTitle}&quot; com outro usuário pelo e-mail.
          </Text>

          <Input
            label="E-mail"
            placeholder="usuario@exemplo.com"
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />

          <View className="gap-2">
            <Text className="text-sm font-medium text-zinc-700">Permissões</Text>
            <View className="flex-row gap-2">
              {permissionOptions.map(option => {
                const selected = permissions === option.value;

                return (
                  <Pressable
                    key={option.value}
                    accessibilityRole="radio"
                    accessibilityState={{ selected }}
                    onPress={() => setPermissions(option.value)}
                    className={`flex-1 items-center rounded-xl border px-3 py-2 ${
                      selected
                        ? 'border-primary bg-primary-muted'
                        : 'border-zinc-300 bg-white active:opacity-70'
                    }`}>
                    <Text
                      className={`text-sm font-medium ${
                        selected ? 'text-primary' : 'text-zinc-600'
                      }`}>
                      {option.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {error ? <Text className="text-sm text-danger">{error}</Text> : null}

          <View className="flex-row gap-2">
            <Button
              label="Cancelar"
              variant="outline"
              className="flex-1"
              disabled={shareListMutation.isPending}
              onPress={onClose}
            />
            <Button
              label="Compartilhar"
              className="flex-1"
              loading={shareListMutation.isPending}
              onPress={() => {
                void handleShare();
              }}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
