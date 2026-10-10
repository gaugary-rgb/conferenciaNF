# Entrega de Notas Fiscais (celular + pistola)

App mobile: **bipe o código de barras da DANFE (chave 44 dígitos)** → extrai só o **número da NF-e (posições 26–34)** → salva no backend configurado.

Backend trocável (`src/lib/backend.js`): `sheets` (padrão hoje) | `supabase` (quando escalar). Troca no app em **Configurar destino** ou via `VITE_BACKEND_PROVIDER` — sem reescrever o app.

Funciona com:
- 🔫 **Pistola Bluetooth/USB** (modo principal — ela "digita" + Enter, o app captura sozinho)
- 📷 **Câmera do celular** (aba secundária, sem pistola)
- ⌨️ Digitação manual da chave

## 1. Planilha (5 min, uma vez)

1. Crie a planilha (ex.: `Entrega NFe`).
2. **Extensões > Apps Script** → apague tudo → cole o `Code.gs` deste repo → Salvar.
3. **Implantar > Nova implantação > Aplicativo da Web**:
   - Executar como: **Eu**
   - Acesso: **Qualquer pessoa** (obrigatório)
   - Copie a URL `.../exec`.
4. No app: **Configurar planilha** → cole a URL. Pronto.

Colunas gravadas: `Data/Hora | Numero NFe | Chave Completa | Entregador`.

## 2. Rodar local

```bat
"C:\Program Files\nodejs\npm.cmd" install
"C:\Program Files\nodejs\npm.cmd" run dev -- --host
```

Abra no celular `http://SEU-IP:5173`.

## 3. Publicar na Vercel (recomendado)

Por que Vercel e não Supabase? Seu banco é o **Google Sheets** — você precisa só de **hospedagem do frontend**. Vercel faz isso de graça com HTTPS (a câmera exige HTTPS). Supabase é backend (banco/auth) — só faria sentido se você quisesse trocar o Sheets por banco próprio.

Passos:
1. Suba este projeto p/ o GitHub.
2. Em `vercel.com` → **Add New Project** → importe o repo (framework: Vite).
3. (Opcional) em **Environment Variables** adicione `VITE_GOOGLE_SCRIPT_URL` = URL `/exec`.
4. **Deploy** → use a URL no celular e **Adicionar à tela inicial**.

`vercel.json` e `public/manifest.webmanifest` já estão no repo.

## 4. Migrar para Supabase (quando precisar)

Sinais: bipagem simultânea, duplicadas, precisa de login/relatório.

1. Crie o projeto em `supabase.com` → **SQL Editor** → rode o `supabase.sql` (cria `public.entregas` + RLS p/ anon).
2. Pegue **Project URL** + **anon key** (Settings > API).
3. No app: **Configurar destino → Backend = Supabase** → cole URL + key. Ou na Vercel defina `VITE_BACKEND_PROVIDER=supabase`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.
4. Diferenças vs Sheets: resposta real (não opaca), duplicada detectada pelo banco (`UNIQUE(chave)` → “já estava salva”), base para dashboard/auth depois.

## Uso na doca/entrega

1. Abra o app, toque no campo azul (foco automático).
2. Bipe a etiqueta → o número aparece gigante + bip sonoro + vibração.
3. Com **Salvar automático** ligado, já grava e libera p/ próxima bipagem.
4. Sem internet? Entra na **fila de pendentes** e tem botão **Reenviar agora**.

## Build

```bat
"C:\Program Files\nodejs\npm.cmd" run build
```
