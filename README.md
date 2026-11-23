# Lista de Compras — App Android (Expo)

App mobile (Android) para gerenciar listas de compras e importar itens a partir
do cupom fiscal (NFC-e). Consome a API do projeto `lista-compras`.

## Stack

- **Expo SDK 58** (React Native 0.88, React 19.3)
- **expo-router** (rotas em `src/app`)
- **NativeWind** (Tailwind CSS 3.4)
- **TanStack Query** (dados/cache)
- **axios** (HTTP)
- **react-hook-form + zod** (formulários)
- **expo-secure-store** (token JWT)
- **expo-camera** (leitura de QR/EAN)

## Requisitos

- **Node.js 22.13+** (o SDK 58 não roda no Node 20).
  - Neste ambiente, o Node 22 está em `~/.local/node22`.
- Backend rodando (`http://localhost:3001`).

## Como rodar

```bash
# usar o Node 22 instalado localmente
export PATH="$HOME/.local/node22/bin:$PATH"

cd ~/StudioProjects/listacompras
npm install        # se ainda não instalou
npx expo start --android
```

- **Emulador Android**: o app usa `http://10.0.2.2:3001` (host da máquina).
- **Dispositivo físico**: edite `.env` e use `http://<IP-da-rede>:3001`.

### Backend

```bash
cd /home/edgar/workspace/listacompras
npm run dev:backend
```

> A base URL fica em `.env` (`EXPO_PUBLIC_API_URL`).

## Configuração

### `.env`

```env
EXPO_PUBLIC_API_URL=http://10.0.2.2:3001
```

### `app.json`

- Permissão de câmera (`expo-camera`).
- `expo-secure-store`.
- `expo-build-properties` com `usesCleartextTraffic: true` (HTTP no dev).

## Scripts

```bash
npm start            # inicia o Expo
npm run android      # abre no emulador/dispositivo Android
npm run web          # versão web (dev)
npm run lint         # ESLint
npm run typecheck    # tsc --noEmit
```

## Estrutura

```
src/
├── app/                    # rotas (expo-router)
│   ├── _layout.tsx         # providers + auth gate
│   ├── (auth)/login.tsx    # login (+ cadastro)
│   └── (app)/
│       ├── index.tsx       # dashboard
│       └── lists/new.tsx   # nova lista + cupom fiscal
├── api/                    # cliente axios e endpoints
├── auth/                   # AuthContext + secure store
├── components/             # UI, scanner e preview
├── hooks/                  # queries/mutations
├── lib/                    # mapeamento NFC-e e formatação
└── types/                  # DTOs da API
```

## Funcionalidades (MVP)

- **Login** com JWT (armazenado no `expo-secure-store`) e cadastro.
- **Dashboard** com listas, total em R$, listas compartilhadas, pull-to-refresh e logout.
- **Nova lista**:
  1. Informe o nome.
  2. Toque em **Importar da Nota Fiscal** e escaneie o QR code da NFC-e.
  3. Revise/edite os itens importados.
  4. Toque em **Criar lista**.

## Integração com a API

| Recurso | Endpoint |
|---|---|
| Login | `POST /api/auth/login` |
| Cadastro | `POST /api/auth/register` |
| Listas | `GET/POST /api/lists` |
| Cupom fiscal | `POST /api/nfce/parse-nfce` |
| Código de barras | `GET /api/products/barcode/:barcode` |

> O endpoint de código de barras foi adicionado ao backend
> (`backend/src/routes/productRoutes.ts`).

## Solução de problemas

| Problema | Causa provável / solução |
|---|---|
| `Não foi possível conectar ao servidor` | Backend parado ou `EXPO_PUBLIC_API_URL` errado |
| Emulador não conecta | Use `10.0.2.2`, não `localhost` |
| HTTP bloqueado em build | `usesCleartextTraffic` (dev) ou use HTTPS |
| `429` no login | Rate limit de 30 tentativas/15 min por e-mail |
| Deslogado após 1h | O JWT expira em 1h (refresh na Fase 2) |
| Node incompatível | Use Node 22: `export PATH="$HOME/.local/node22/bin:$PATH"` |

## Próximos passos (Fase 2)

- Detalhe da lista (itens, marcar comprado, editar/remover).
- Busca de produto por código de barras na UI.
- Compartilhamento de listas.
- Refresh token / sessão mais longa.
