# Barberina · Mi acompañamiento (España) — PWA

App em **espanhol de Espanha** para quem compra o **Barberina Max** (frasco, pagamento contra-reembolso).
Mesma ideia do app do Brasil (turma + ranking + prêmio), mas aqui a cliente **recebe o frasco** em vez de preparar a receita:
o app é liberado na hora do pedido, **porém quase tudo fica bloqueado até o frasco chegar** (ela só paga ao receber).

## Fluxo
1. A equipe cria a clienta no Supabase (`bm_crear_clienta`) → recebe o **link próprio** `/a/<token>` e manda por WhatsApp. Alternativa: a clienta entra em **/entrar** com o email do pedido.
2. **/bienvenida** — "¡Hola, María!" (nome vem do banco) + peso atual, objetivo, avatar.
3. **Esperando o pedido**: aviso "Estamos esperando que recibas tu pedido…", rastreio de 5 passos e tudo **borrado com cadeado** (registro, recetas, plan, evolución, compartir). Grupo/ranking visível.
4. **Entrega**: a equipe roda `bm_marcar_envio(<email|tel|pedido|token>, 'entregado')` → o app libera sozinho (abre/volta ao app ou a cada 60 s) → **/recibido**.
5. **Ativo**: registro diário de 20 s, progresso, consejo semanal do Dr., ranking com pontos e prêmio de 150 €.

👉 Documento completo para operação: **`GUIA-PARA-OUTRA-IA.md`**.

## Grupo de la semana (perfis de roteiro) — `lib/grupo.js`
- 20 mulheres espanholas (nome curto + cidade), **iguais para todas as usuárias**, ancoradas no dia em que a usuária entrou.
- **Dia 1**: 4 já têm o frasco (veteranas + Carmen V., que recebeu na véspera e mostra **−1,2 kg no 1º dia**); 15 estão esperando.
- Os frascos chegam em ondas nos dias 2–7 (com estados "en camino" / "en reparto · llega mañana").
- Depois de receber, a perda é rápida no início e desacelera. Curvas `rayo`/`rayo2` = **−1,0 a −1,2 kg no 1º dia** (Lucía, Isabel, Conchi, Nuria, Silvia, Carmen V.); outras com 0,3–0,7 kg, uma com meseta.
- Feed do dia: "📦 recebeu o frasco", "🔥 −1,0 kg no primeiro dia", "🚚 em reparto, chega amanhã", marcos de 2/3/5 kg, 1ª semana completa.
- A posição da usuária é **real**: mesma fórmula de pontos da view `app_ranking_semana` (+10/dia registrado, +25/kg na semana, +4/ponto de sono acima de 3, +5/dia com cápsula). Empate → usuária na frente.
- Desligar perfis de roteiro: `NEXT_PUBLIC_GRUPO_MODO=off` (mostra só usuárias reais).

## Teste rápido
Abra **/prueba** (não aparece no menu): pula para o dia 1…7 do grupo, simula "frasco recibido hoy / ayer / hace 5 / 10 días".

## Supabase
Rodar **`supabase/BARBERINA-ES-COMPLETO.sql`** (Supabase → SQL Editor → New query → colar → Run). É o único SQL necessário.
O app usa só a chave **anon**; as tabelas têm RLS fechada e o acesso é só por funções que validam o token.

## Rodar / deploy
```bash
npm install
npm run dev     # http://localhost:3100  (sem env do Supabase = modo demonstração)
```
Vercel: importar o repositório com **Root Directory = `barberina-es`** e as env vars de `.env.example`. Domínio sugerido `app.noctalev.online`.

> Barberina Max é um complemento alimenticio. No sustituye una dieta variada y equilibrada.

## Visual
Design novo: cabeçalhos com foto, cartões verde-escuro/dourado, tabbar flutuante, pódio, cards de receitas com foto.
Fotos com licença livre (CC / domínio público) — créditos em `public/img/CREDITOS.txt`. Algumas receitas ainda usam ilustração (emoji) até termos fotos próprias.
