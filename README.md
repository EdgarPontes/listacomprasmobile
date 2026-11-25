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
- Backend rodando (`http://localhost:3001`) **ou** o backend público de produção
  (`https://apilistacompras.tecpontes.com.br`).

## Como rodar

```bash
# usar o Node 22 instalado localmente
export PATH="$HOME/.local/node22/bin:$PATH"

cd ~/StudioProjects/listacompras
npm install        # se ainda não instalou
npx expo start --android
```

- **Produção (padrão)**: o app usa `https://apilistacompras.tecpontes.com.br`,
  inclusive quando o `.env` não está presente (ex.: builds via EAS).
- **Emulador Android (dev)**: defina `EXPO_PUBLIC_API_URL=http://10.0.2.2:3001` no `.env`.

### Conectar à produção

O app fala direto com o serviço **backend** (Express) publicado no Easypanel.
O domínio do site (`https://listacompras.tecpontes.com.br`) é o frontend Next.js
e não expõe as rotas `/api/...` usadas pelo app.

1. No Easypanel, no projeto `servidor` → serviço `listacompras` (compose) →
   serviço **backend**, adicione o domínio `apilistacompras.tecpontes.com.br`
   na porta `3001` e **redeploy** do compose (para o backend entrar na rede
   `easypanel`, por onde o Traefik o alcança).
2. Crie o registro DNS `listacompras-api` → IP do servidor, com proxy Cloudflare
   habilitado. O nome precisa ficar **um nível** abaixo de `tecpontes.com.br`:
   o certificado Universal SSL da Cloudflare cobre `*.tecpontes.com.br`, que não
   vale para nomes como `api.listacompras.tecpontes.com.br`.
3. Valide:

   ```bash
   curl https://apilistacompras.tecpontes.com.br/health
   # {"status":"ok"}
   ```

4. O `.env` do app já contém:

   ```env
   EXPO_PUBLIC_API_URL=https://apilistacompras.tecpontes.com.br
   ```

> Variáveis `EXPO_PUBLIC_*` são embutidas no build: após alterar o `.env`,
> reinicie o Metro com cache limpo (`npx expo start -c`) ou refaça o build.

### Backend

```bash
cd /home/edgar/workspace/listacompras
npm run dev:backend
```

> A base URL fica em `.env` (`EXPO_PUBLIC_API_URL`).

## Configuração

### `.env`

```env
# Produção
EXPO_PUBLIC_API_URL=https://apilistacompras.tecpontes.com.br

# Desenvolvimento local (emulador Android)
# EXPO_PUBLIC_API_URL=http://10.0.2.2:3001
```

Modelo em `.env.example`. O `.env` não é versionado.

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

## Gerar APK para instalar no Android

O APK pode ser gerado na nuvem com o EAS Build. Use Node.js **22.13 ou
superior** e, na raiz do projeto, faça login e configure o EAS (na primeira vez):
`

```bash
npx eas-cli@latest login
npx eas-cli@latest build:configure
```

No `eas.json` criado na raiz, adicione ou ajuste o perfil `preview` dentro de
`build` para gerar um APK instalável:

```json
{
  "build": {
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    }
  }
}
```

Se o arquivo já tiver outros perfis, mantenha-os e altere somente o `preview`.
Depois, inicie o build:

```bash
npx eas-cli@latest build --platform android --profile preview
```

Ao terminar, abra o link exibido pelo EAS no celular Android para baixar e
instalar o APK. Se solicitado, permita a instalação de apps provenientes
daquela origem nas configurações do aparelho. Para publicar na Google Play,
gere um **AAB** em vez de um APK.

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

| Recurso          | Endpoint                             |
| ---------------- | ------------------------------------ |
| Login            | `POST /api/auth/login`               |
| Cadastro         | `POST /api/auth/register`            |
| Listas           | `GET/POST /api/lists`                |
| Cupom fiscal     | `POST /api/nfce/parse-nfce`          |
| Código de barras | `GET /api/products/barcode/:barcode` |

> O endpoint de código de barras foi adicionado ao backend
> (`backend/src/routes/productRoutes.ts`).

## Solução de problemas

| Problema                                | Causa provável / solução                                                             |
| --------------------------------------- | ------------------------------------------------------------------------------------ |
| `Não foi possível conectar ao servidor` | Backend indisponível ou `EXPO_PUBLIC_API_URL` errado (a mensagem mostra a URL usada) |
| Emulador não conecta (dev)              | Use `10.0.2.2`, não `localhost`                                                      |
| HTTP bloqueado em build                 | `usesCleartextTraffic` (dev) ou use HTTPS                                            |
| `429` no login                          | Rate limit de 30 tentativas/15 min por e-mail                                        |
| Deslogado após 1h                       | O JWT expira em 1h (refresh na Fase 2)                                               |
| Node incompatível                       | Use Node 22: `export PATH="$HOME/.local/node22/bin:$PATH"`                           |

## Próximos passos (Fase 2)

- Detalhe da lista (itens, marcar comprado, editar/remover).
- Busca de produto por código de barras na UI.
- Compartilhamento de listas.
- Refresh token / sessão mais longa.
