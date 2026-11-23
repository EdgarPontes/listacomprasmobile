import { CameraView, useCameraPermissions, type BarcodeType } from 'expo-camera';
import { useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

import { Button } from './ui/Button';

interface BarcodeScannerProps {
  onScan: (data: string) => void;
  barcodeTypes?: BarcodeType[];
}

export function BarcodeScanner({
  onScan,
  barcodeTypes = ['qr'],
}: BarcodeScannerProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  if (!permission) {
    return (
      <View className="h-40 items-center justify-center">
        <ActivityIndicator color="#2563eb" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View className="items-center justify-center gap-3 rounded-2xl border border-zinc-200 bg-white p-6">
        <Text className="text-center text-zinc-700">
          Precisamos de acesso à câmera para ler o código.
        </Text>
        <Button label="Permitir câmera" onPress={requestPermission} />
      </View>
    );
  }

  return (
    <View className="h-[420px] overflow-hidden rounded-2xl bg-black">
      <CameraView
        style={{ flex: 1 }}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes }}
        onBarcodeScanned={
          scanned
            ? undefined
            : ({ data }) => {
                setScanned(true);
                onScan(data);
              }
        }
      />
      {scanned ? (
        <View className="absolute bottom-4 left-0 right-0 items-center">
          <Button label="Escanear novamente" onPress={() => setScanned(false)} />
        </View>
      ) : null}
    </View>
  );
}
