# 🌙 NoctaLev — Protocolo Noturno (PWA)

App PWA em **pt-BR** que entrega o "Protocolo Noturno" de emagrecimento baseado em melhorar o sono.
Mobile-first, tema noturno, visual fiel aos mockups oficiais.

## ✨ Funcionalidades implementadas

| Área | Status |
|---|---|
| Onboarding (login + 3 slides + questionário de 5 perguntas) | ✅ |
| Personalização real da receita pelo perfil (ansiedade, madrugada, refluxo…) | ✅ |
| Preparo Guiado passo a passo com **countdown de 24h** + conquista "Alquimista" | ✅ |
| Home dinâmica: anel de sono, sparkline de peso, ritual, barra Fase 2, gamificação | ✅ |
| Check-in diário (sono + horas + peso, 1×/dia, editável no mesmo dia) | ✅ |
| Ritual noturno separado (registra horário, +5 pts) | ✅ |
| **Progressão oculta**: 7 dias internos + mín. 4 check-ins (máx. 14), curva % acelerada, **nunca exibe dias** | ✅ |
| Tela de celebração 🎉 do desbloqueio da Fase 2 com CTA de checkout configurável | ✅ |
| Gamificação: pontos, streak com proteção, 6 conquistas | ✅ |
| Progresso: gráfico de peso 7/14/30d, heatmap de sono, recorde, frase inteligente | ✅ |
| Bônus: 3 conteúdos liberados progressivamente | ✅ |
| Configurações + disclaimer de segurança | ✅ |
| Painel `/admin`: dashboard, perfil da usuária, histórico, ações manuais, notas, config JSON, export CSV | ✅ |
| PWA: manifest, service worker (offline p/ leitura), ícones, instalável | ✅ |
| Schema Supabase completo com RLS (`supabase/schema.sql`) | ✅ |

## 🗂 Estrutura

```
app/
  page.js           → Home (dashboard)
  onboarding/       → login + slides + questionário
  preparo/          → preparo guiado + countdown 24h
  receita/          → receita Fase 1 personalizada + fases bloqueadas
  checkin/          → check-in diário (3 telas + recompensa)
  ritual/           → ritual noturno
  progresso/        → gráficos + conquistas
  bonus/            → conteúdos extras
  config/           → configurações + disclaimer
  celebracao/       → desbloqueio Fase 2 + CTA checkout
  admin/            → painel administrativo (PIN: 2026 no protótipo)
lib/store.js        → estado + toda a lógica de negócio (progressão oculta, streak, pontos)
lib/receitas.js     → conteúdo oficial das receitas
supabase/schema.sql → schema Postgres + RLS pronto para produção
public/             → manifest, sw.js, ícones
```

## 🚀 Rodar localmente

```bash
npm install
npm run dev   # http://localhost:3000
```

## 🔐 Progressão oculta (regra §5 do briefing)

- Interno: libera Fase 2 após `diasInternos` (7) dias corridos do **preparo**, com mínimo `minCheckins` (4); máximo `maxDias` (14) libera sempre.
- Externo: **nunca** mostra dias/prazos — apenas % com curva acelerada (`dia1≈30% … dia7=100%`).
- Todos os parâmetros são editáveis no `/admin` → aba Config (JSON), sem deploy.

## 🧪 Testar o fluxo completo rapidamente

1. `/onboarding` → cadastre-se
2. `/preparo` → siga os passos (no passo 24h use "Pular espera")
3. Faça check-ins; no `/admin` → Ações → "📅 Ajustar dia do protocolo" para simular 7 dias
4. Volte à Home → tela de celebração da Fase 2 🎉

## 📦 Produção (Vercel + Supabase)

Este protótipo usa `localStorage` (1 usuária = 1 dispositivo), com a camada de dados isolada em `lib/store.js` — pronta para trocar por Supabase:

1. Crie o projeto no Supabase e rode `supabase/schema.sql`
2. Adicione `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Substitua as funções de `lib/store.js` por chamadas ao Supabase (mesma interface)
4. Marque `role='admin'` no seu perfil para acessar `/admin` em produção
5. Deploy na Vercel


## ☁️ Integração Supabase (IMPLEMENTADA)

- **Login sem senha**: email + código de 6 dígitos (OTP) — `supabase.auth.signInWithOtp`
- **Sync local-first**: app funciona offline; `lib/sync.js` faz pull no login/abertura e push após cada ação
- **Gate de compra**: `/api/acesso` verifica a tabela `compradoras` antes de enviar o código (ativar com `GATE_BY_PURCHASE=true`)
- **Webhook Cakto**: `/api/webhook/cakto?secret=...` — compra aprovada libera acesso/fases automaticamente; trata reembolso
- **Admin real**: `/api/admin` (service_role) — lista todas as usuárias, detalhe, ações manuais, notas, CSV da base
- **Setup**: siga o passo a passo em `SETUP_SUPABASE.md` (2 passos de copiar/colar)

### Variáveis de ambiente (`.env.local` / Vercel)
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ADMIN_PIN=
CAKTO_WEBHOOK_SECRET=
GATE_BY_PURCHASE=false
```

## ⚠️ Aviso

Este protocolo não substitui acompanhamento médico. Não indicado para grávidas, lactantes e crianças.
