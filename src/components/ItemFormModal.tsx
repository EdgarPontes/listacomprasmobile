import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BarcodeScanner } from './BarcodeScanner';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { useProductByBarcode } from '@/hooks/useProductByBarcode';
import type { ListItem } from '@/types/api';

const BARCODE_TYPES = ['ean13', 'ean8', 'upc_a', 'upc_e', 'code128'] as const;

export interface ItemFormValues {
  productName: string;
  barcode: string;
  quantity: number;
  unitPrice: number;
}

interface ItemFormModalProps {
  title: string;
  submitLabel: string;
  initialValues?: ListItem;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (values: ItemFormValues) => void;
}

function parseNumber(text: string): number {
  const parsed = Number(text.replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : NaN;
}

export function ItemFormModal({
  title,
  submitLabel,
  initialValues,
  loading = false,
  onClose,
  onSubmit,
}: ItemFormModalProps) {
  const insets = useSafeAreaInsets();
  const productLookup = useProductByBarcode();

  const [productName, setProductName] = useState(initialValues?.product_name ?? '');
  const [barcode, setBarcode] = useState(initialValues?.barcode ?? '');
  const [quantity, setQuantity] = useState(
    initialValues ? String(initialValues.quantity) : '1'
  );
  const [unitPrice, setUnitPrice] = useState(
    initialValues ? String(initialValues.unit_price) : '0'
  );
  const [scannerOpen, setScannerOpen] = useState(false);
  const [info, setInfo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleScan(data: string) {
    setBarcode(data);
    setScannerOpen(false);
    setInfo(null);

    try {
      const product = await productLookup.mutateAsync(data);

      if (product.Status === '200' && product.Nome) {
        setProductName(product.Nome);
        setInfo(`Produto encontrado: ${product.Nome}`);
      } else {
        setInfo('Produto não encontrado. Informe o nome manualmente.');
      }
    } catch {
      setInfo('Não foi possível consultar o produto. Informe o nome manualmente.');
    }
  }

  function handleSubmit() {
    setError(null);

    const trimmedName = productName.trim();
    const parsedQuantity = parseNumber(quantity);
    const parsedPrice = parseNumber(unitPrice);

    if (!trimmedName) {
      setError('Informe o nome do produto.');
      return;
    }

    if (!Number.isInteger(parsedQuantity) || parsedQuantity <= 0) {
      setError('A quantidade deve ser um número inteiro maior que zero.');
      return;
    }

    if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
      setError('O preço não pode ser negativo.');
      return;
    }

    onSubmit({
      productName: trimmedName,
      barcode: barcode.trim(),
      quantity: parsedQuantity,
      unitPrice: parsedPrice,
    });
  }

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        className="flex-1 justify-end bg-black/40"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View className="max-h-[92%] rounded-t-3xl bg-white">
          <ScrollView
            contentContainerStyle={{
              padding: 20,
              paddingBottom: insets.bottom + 24,
              gap: 12,
            }}
            keyboardShouldPersistTaps="handled">
            <View className="mb-1 flex-row items-center justify-between gap-3">
              <Text className="flex-1 text-xl font-bold text-zinc-900">{title}</Text>
              <Button
                label="Fechar"
                variant="ghost"
                className="px-2 py-1"
                disabled={loading}
                onPress={onClose}
              />
            </View>

            <Input
              label="Produto"
              placeholder="Ex.: Leite"
              value={productName}
              onChangeText={setProductName}
            />

            <View className="flex-row items-end gap-2">
              <Input
                label="Código de barras"
                placeholder="Opcional"
                containerClassName="flex-1"
                keyboardType="number-pad"
                value={barcode}
                onChangeText={setBarcode}
              />
              <Button
                label={scannerOpen ? 'Fechar' : 'Escanear'}
                variant="outline"
                className="px-3 py-3"
                onPress={() => setScannerOpen(current => !current)}
              />
            </View>

            {scannerOpen ? (
              <BarcodeScanner
                barcodeTypes={[...BARCODE_TYPES]}
                onScan={data => {
                  void handleScan(data);
                }}
              />
            ) : null}

            {productLookup.isPending ? (
              <Text className="text-sm text-primary">Consultando produto...</Text>
            ) : null}
            {info ? <Text className="text-sm text-zinc-500">{info}</Text> : null}

            <View className="flex-row gap-3">
              <Input
                label="Quantidade"
                containerClassName="flex-1"
                keyboardType="number-pad"
                value={quantity}
                onChangeText={setQuantity}
              />
              <Input
                label="Preço unitário"
                containerClassName="flex-1"
                keyboardType="decimal-pad"
                value={unitPrice}
                onChangeText={setUnitPrice}
              />
            </View>

            {error ? <Text className="text-sm text-danger">{error}</Text> : null}

            <View className="mt-2 flex-row gap-2">
              <Button
                label="Cancelar"
                variant="outline"
                className="flex-1"
                disabled={loading}
                onPress={onClose}
              />
              <Button label={submitLabel} className="flex-1" loading={loading} onPress={handleSubmit} />
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
