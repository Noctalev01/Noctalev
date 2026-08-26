# 🛠️ Setup do Supabase — 2 passos de copiar e colar (5 minutos)

## PASSO 1 — Criar as tabelas do banco

1. Abra o SQL Editor do seu projeto (link direto):
   **https://supabase.com/dashboard/project/ctnyilyoyzutpqlnleqx/sql/new**
2. Abra o arquivo **`supabase/schema.sql`** deste projeto, copie TODO o conteúdo
3. Cole no editor e clique em **RUN** (botão verde, canto inferior direito)
4. Deve aparecer "Success. No rows returned" ✅

## PASSO 2 — Configurar o email com código de 6 dígitos

Por padrão o Supabase envia um *link*. Para enviar o **código de 6 dígitos**
(melhor para nosso público), ajuste o template:

1. Vá em **Authentication → Emails** (ou "Email Templates"):
   **https://supabase.com/dashboard/project/ctnyilyoyzutpqlnleqx/auth/templates**
2. Selecione o template **"Magic Link"**
3. Substitua o conteúdo por este (pode personalizar depois):

```html
<h2>🌙 Seu código de acesso NoctaLev</h2>
<p>Olá! Use o código abaixo para entrar no seu protocolo:</p>
<h1 style="font-size:42px;letter-spacing:8px;color:#b45309">{{ .Token }}</h1>
<p>O código vale por 1 hora. Se você não pediu este acesso, ignore este email.</p>
<p>Bons sonhos! 💛<br>Equipe NoctaLev</p>
```

4. Clique em **Save**

> 💡 O `{{ .Token }}` é o que faz aparecer o código de 6 dígitos no email.

## (Opcional) PASSO 3 — Aumentar limite de emails

O Supabase grátis envia ~2 emails/hora por padrão (email de teste deles).
Para produção com muitas clientes:
- **Authentication → Rate Limits** → aumente "Email OTP"
- Ideal: conectar um SMTP próprio (Resend, Brevo ou o email do seu domínio)
  em **Project Settings → Auth → SMTP Settings** — o Resend tem plano grátis
  com 3.000 emails/mês e é o mais fácil.

## ✅ Como saber que funcionou

Depois do Passo 1, me avise aqui no chat — eu rodo uma verificação automática
que testa as tabelas, o webhook e a lista de compradoras de ponta a ponta.

---

## 📋 Referência — variáveis de ambiente (para o deploy na Vercel)

| Variável | Valor |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://ctnyilyoyzutpqlnleqx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | (anon public key) |
| `SUPABASE_SERVICE_ROLE_KEY` | (service_role secret) |
| `ADMIN_PIN` | PIN do painel /admin (troque o 2026!) |
| `CAKTO_WEBHOOK_SECRET` | segredo do webhook (troque!) |
| `GATE_BY_PURCHASE` | `false` (testes) → `true` (produção: só compradora entra) |

## 🔗 Webhook da Cakto (quando formos ativar)

Na Cakto, em Integrações → Webhooks, cadastre:

```
https://SEU-DOMINIO.vercel.app/api/webhook/cakto?secret=SEU_CAKTO_WEBHOOK_SECRET
```

Evento: **Compra aprovada** (e "Reembolso", se disponível — o app já trata os dois).
