import {
  createContext,
  use,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';

import * as authApi from '@/api/auth';
import { setUnauthorizedHandler } from '@/api/client';
import { clearToken, getToken, setToken } from '@/auth/storage';
import type { User } from '@/types/api';

export type AuthStatus = 'loading' | 'signedIn' | 'signedOut';

interface AuthContextValue {
  status: AuthStatus;
  user: User | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    let mounted = true;

    getToken()
      .then(token => {
        if (mounted) {
          setStatus(token ? 'signedIn' : 'signedOut');
        }
      })
      .catch(() => {
        if (mounted) {
          setStatus('signedOut');
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      setUser(null);
      setStatus('signedOut');
    });

    return () => setUnauthorizedHandler(null);
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const data = await authApi.login(email, password);
    await setToken(data.token);
    setUser(data.user);
    setStatus('signedIn');
  }, []);

  const signOut = useCallback(async () => {
    await clearToken();
    setUser(null);
    setStatus('signedOut');
  }, []);

  const value = useMemo(
    () => ({ status, user, signIn, signOut }),
    [status, user, signIn, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = use(AuthContext);

  if (!context) {
    throw new Error('useAuth deve ser usado dentro de <AuthProvider>');
  }

  return context;
}
