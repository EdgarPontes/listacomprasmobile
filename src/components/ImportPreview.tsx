import { Text, TextInput, View } from 'react-native';

import { Button } from './ui/Button';
import { formatCurrency } from '@/lib/nfce';
import type { CreateListItem } from '@/types/api';

interface ImportPreviewProps {
  items: CreateListItem[];
  onChange: (items: CreateListItem[]) => void;
}

function parseNumber(text: string): number {
  const parsed = Number(text.replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : 0;
}

export function ImportPreview({ items, onChange }: ImportPreviewProps) {
  if (items.length === 0) {
    return null;
  }

  const total = items.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0);

  function updateItem(index: number, patch: Partial<CreateListItem>) {
    onChange(items.map((item, current) => (current === index ? { ...item, ...patch } : item)));
  }

  function removeItem(index: number) {
    onChange(items.filter((_, current) => current !== index));
  }

  return (
    <View className="gap-3">
      <View className="flex-row items-center justify-between">
        <Text className="text-lg font-semibold text-zinc-900">Itens importados</Text>
        <Text className="text-sm text-zinc-500">
          Total: <Text className="font-semibold text-zinc-900">{formatCurrency(total)}</Text>
        </Text>
      </View>

      {items.map((item, index) => (
        <View key={`${item.barcode}-${index}`} className="rounded-xl border border-zinc-200 bg-white p-3">
          <View className="mb-2 flex-row items-start justify-between gap-2">
            <View className="flex-1">
              <Text className="font-medium text-zinc-900">{item.productName}</Text>
              <Text className="text-xs text-zinc-500">{item.barcode || 'Sem código'}</Text>
            </View>
            <Button
              label="Remover"
              variant="ghost"
              className="px-2 py-1"
              onPress={() => removeItem(index)}
            />
          </View>

          <View className="flex-row gap-3">
            <View className="flex-1 gap-1">
              <Text className="text-xs text-zinc-500">Qtd.</Text>
              <TextInput
                value={String(item.quantity)}
                onChangeText={text => updateItem(index, { quantity: parseNumber(text) })}
                keyboardType="numeric"
                className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900"
              />
            </View>
            <View className="flex-1 gap-1">
              <Text className="text-xs text-zinc-500">Preço unit.</Text>
              <TextInput
                value={String(item.unitPrice)}
                onChangeText={text => updateItem(index, { unitPrice: parseNumber(text) })}
                keyboardType="decimal-pad"
                className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900"
              />
            </View>
            <View className="flex-1 items-end justify-end gap-1 pb-2">
              <Text className="text-xs text-zinc-500">Total</Text>
              <Text className="font-semibold text-zinc-900">
                {formatCurrency(item.quantity * item.unitPrice)}
              </Text>
            </View>
          </View>
        </View>
      ))}
    </View>
  );
}
