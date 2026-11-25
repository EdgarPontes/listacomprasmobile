import { useState } from 'react';
import { Modal, Text, View } from 'react-native';

import { Button } from './ui/Button';
import { Input } from './ui/Input';

interface RenameListModalProps {
  currentTitle: string;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (title: string) => void;
}

export function RenameListModal({
  currentTitle,
  loading = false,
  onClose,
  onSubmit,
}: RenameListModalProps) {
  const [title, setTitle] = useState(currentTitle);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit() {
    const trimmed = title.trim();

    if (!trimmed) {
      setError('Informe um nome para a lista.');
      return;
    }

    if (trimmed.length > 120) {
      setError('O nome deve ter no máximo 120 caracteres.');
      return;
    }

    setError(null);
    onSubmit(trimmed);
  }

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 justify-center bg-black/40 px-5">
        <View className="gap-4 rounded-2xl bg-white p-5">
          <Text className="text-xl font-bold text-zinc-900">Renomear lista</Text>

          <Input
            label="Nome da lista"
            value={title}
            onChangeText={setTitle}
            autoFocus
            error={error ?? undefined}
          />

          <View className="flex-row gap-2">
            <Button
              label="Cancelar"
              variant="outline"
              className="flex-1"
              disabled={loading}
              onPress={onClose}
            />
            <Button label="Salvar" className="flex-1" loading={loading} onPress={handleSubmit} />
          </View>
        </View>
      </View>
    </Modal>
  );
}
