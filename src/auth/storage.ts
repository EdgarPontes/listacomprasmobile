import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const TOKEN_KEY = 'auth_token';

function isWeb() {
  return Platform.OS === 'web';
}

export async function getToken(): Promise<string | null> {
  if (isWeb()) {
    try {
      return globalThis.localStorage?.getItem(TOKEN_KEY) ?? null;
    } catch {
      return null;
    }
  }

  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function setToken(token: string): Promise<void> {
  if (isWeb()) {
    try {
      globalThis.localStorage?.setItem(TOKEN_KEY, token);
    } catch {
      // armazenamento indisponível no web
    }
    return;
  }

  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function clearToken(): Promise<void> {
  if (isWeb()) {
    try {
      globalThis.localStorage?.removeItem(TOKEN_KEY);
    } catch {
      // armazenamento indisponível no web
    }
    return;
  }

  await SecureStore.deleteItemAsync(TOKEN_KEY);
}
