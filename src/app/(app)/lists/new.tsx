import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getApiErrorMessage } from '@/api/client';
import { BarcodeScanner } from '@/components/BarcodeScanner';
import { ImportPreview } from '@/components/ImportPreview';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useCreateList } from '@/hooks/useCreateList';
import { useParseNfce } from '@/hooks/useParseNfce';
import { mapNfceToItems } from '@/lib/nfce';
import type { CreateListItem } from '@/types/api';

export default function NewListScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [title, setTitle] = useState('');
  const [items, setItems] = useState<CreateListItem[]>([]);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [receiptName, setReceiptName] = useState<string | null>(null);

  const parseNfce = useParseNfce();
  const createList = useCreateList();

  async function handleScan(data: string) {
    setScannerOpen(false);

    if (!/^https?:\/\//i.test(data)) {
      Alert.alert(
        'QR code inválido',
        'O QR code lido não parece ser um cupom fiscal válido.'
      );
      return;
    }

    try {
      const result = await parseNfce.mutateAsync(data);
      const mapped = mapNfceToItems(result.produtos ?? []);

      if (mapped.length === 0) {
        Alert.alert('Cupom sem itens', 'Nenhum item foi encontrado no cupom fiscal.');
        return;
      }

      setItems(current => [...current, ...mapped]);
      setReceiptName(result.emitente?.nome ?? null);
      Alert.alert(
        'Cupom importado',
        `${mapped.length} ${mapped.length === 1 ? 'item adicionado' : 'itens adicionados'} a partir do cupom fiscal.`
      );
    } catch (scanError) {
      Alert.alert('Erro ao importar cupom', getApiErrorMessage(scanError));
    }
  }

  async function handleCreate() {
    if (!title.trim()) {
      Alert.alert('Dados inválidos', 'Informe um nome para a lista.');
      return;
    }

    const sanitizedItems = items
      .map(item => ({
        ...item,
        quantity: Math.max(1, Math.round(item.quantity || 1)),
        unitPrice: Math.max(0, item.unitPrice || 0),
      }))
      .filter(item => item.productName.trim().length > 0);

    try {
      const created = await createList.mutateAsync({
        title: title.trim(),
        items: sanitizedItems,
      });

      router.replace({ pathname: '/lists/[id]', params: { id: created.id } });
    } catch (createError) {
      Alert.alert('Erro ao criar lista', getApiErrorMessage(createError));
    }
  }

  return (
    <ScrollView
      className="flex-1 bg-zinc-50"
      contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 40, gap: 16 }}
      keyboardShouldPersistTaps="handled">
      <Text className="text-zinc-500">
        Dê um nome à lista e importe os itens do cupom fiscal (QR code da NFC-e).
      </Text>

      <Input
        label="Nome da lista"
        placeholder="Ex.: Compras do mês"
        value={title}
        onChangeText={setTitle}
      />

      <Button
        label={scannerOpen ? 'Fechar câmera' : 'Importar da Nota Fiscal'}
        variant="outline"
        onPress={() => setScannerOpen(current => !current)}
      />

      {scannerOpen ? (
        <BarcodeScanner
          onScan={data => {
            void handleScan(data);
          }}
        />
      ) : null}

      {parseNfce.isPending ? (
        <Text className="text-primary">Lendo cupom fiscal...</Text>
      ) : null}
      {receiptName ? (
        <Text className="text-sm text-zinc-500">Cupom: {receiptName}</Text>
      ) : null}

      <ImportPreview items={items} onChange={setItems} />

      <Button
        label="Criar lista"
        onPress={() => {
          void handleCreate();
        }}
        loading={createList.isPending}
      />
    </ScrollView>
  );
}
