# 🛠️ Setup do Supabase

## ✅ PASSO 1 — Criar as tabelas do banco (JÁ FEITO!)

1. Abra o SQL Editor do seu projeto (link direto):
   **https://supabase.com/dashboard/project/ctnyilyoyzutpqlnleqx/sql/new**
2. Abra o arquivo **`supabase/schema.sql`** deste projeto, copie TODO o conteúdo
3. Cole no editor e clique em **RUN** (botão verde, canto inferior direito)
4. Deve aparecer "Success. No rows returned" ✅

## ✅ PASSO 2 — Email? NÃO PRECISA MAIS! 🎉

O login agora é **instantâneo**: a cliente digita o email da compra e entra
na hora — **nenhum email é enviado**, nada de código, nada de confirmação.

Como funciona por baixo dos panos:
1. Cliente compra na Cakto → o **webhook** grava o email na tabela `compradoras`
2. Cliente digita o email no app → `/api/entrar` confere se está em `compradoras`
3. Se sim, o servidor gera um token de sessão internamente (`generateLink`)
   e o app entra direto — **sem passar pelo sistema de emails do Supabase**
4. Reembolso na Cakto → webhook remove o email → acesso bloqueado na hora

> 🔒 A segurança vem da própria compra: só quem comprou tem o email na lista.
> Não é necessário plano PRO nem configurar templates/SMTP.

## ✅ Como saber que funcionou

Testado de ponta a ponta em 26/08/2026:
- ✅ Email sem compra → bloqueado com mensagem amigável
- ✅ Webhook "compra aprovada" → email liberado na tabela `compradoras`
- ✅ Login instantâneo → sessão criada sem enviar email
- ✅ Webhook "reembolso" → acesso revogado imediatamente

---

## 📋 Referência — variáveis de ambiente (para o deploy na Vercel)

| Variável | Valor |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://ctnyilyoyzutpqlnleqx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | (anon public key) |
| `SUPABASE_SERVICE_ROLE_KEY` | (service_role secret) |
| `ADMIN_PIN` | PIN do painel /admin (troque o 2026!) |
| `CAKTO_WEBHOOK_SECRET` | segredo do webhook (troque!) |
| `GATE_BY_PURCHASE` | `true` = só compradora entra (produção) / `false` = qualquer email (testes) |

## 🔗 Webhook da Cakto (o passo que automatiza tudo)

Na Cakto, em **Integrações → Webhooks**, cadastre a URL:

```
https://SEU-DOMINIO.vercel.app/api/webhook/cakto?secret=SEU_CAKTO_WEBHOOK_SECRET
```

Eventos: **Compra aprovada** (obrigatório) e **Reembolso/Chargeback** (recomendado —
o app já trata os dois e revoga o acesso automaticamente).

Com isso, o fluxo fica 100% automático:
**compra na Cakto → acesso liberado em segundos → cliente entra só com o email** 🚀

## 🆘 Liberação manual (sem esperar webhook)

Se precisar liberar alguém na mão (ex.: compra antiga, troca de email):
abra **`/admin`** no app → aba **"Acesso"** → digite o email → **Liberar**.
