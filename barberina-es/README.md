# Barberina · Mi acompañamiento (España) — PWA

App em **espanhol de Espanha** para quem compra o **Barberina Max** (frasco, pagamento contra-reembolso).
Mesma ideia do app do Brasil (turma + ranking + prêmio), mas aqui a cliente **recebe o frasco** em vez de preparar a receita:
o app é liberado na hora do pedido, **porém quase tudo fica bloqueado até o frasco chegar** (ela só paga ao receber).

## Fluxo
1. **/entrar** — telefone +34 (9 dígitos) + PIN de 4 dígitos (1º acesso cria o PIN). Deep link `?tel=612345678`.
2. **/bienvenida** — nome curto, cidade, peso atual, objetivo, avatar, aparecer no ranking.
3. **ESPERANDO O FRASCO** (estado inicial)
   - Hoy: rastreio do envio (confirmado → preparando → en camino → en reparto → recibido), checklist "Mientras esperas", guia da cápsula, consejo do Dr. para a espera, resumo do grupo, prévia bloqueada do registro, lista do que será desbloqueado, botão WhatsApp Camila.
   - Grupo: **visível** (prova social) — prêmio 150 €, contador até domingo 23:59, ranking com quem já recebeu e a lista de quem está esperando (ela incluída). Não pontua.
   - Recetas: 2 receitas grátis, resto + plano semanal com cadeado.
   - Evolución: bloqueada (prévia desfocada).
4. **"Ya he recibido mi frasco"** → código de ativação impresso no folheto da caixa (padrão `BMAX`, env `NEXT_PUBLIC_CODIGO_ACTIVACION`) → tela de celebração **/recibido** → tudo liberado.
   - O backend também pode liberar sozinho gravando `app_usuarias.frasco_recibido_em` (lido no login).
5. **ATIVO**: dia da entrega = só "peso de partida"; a partir da manhã seguinte, registro diário de 20 s (sono, peso, cápsula + opcionais), streak, consejo semanal do Dr., progresso, ranking com pontos.

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
- Só a chave **ANON** (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`). Sem env → app roda 100% local.
- RPCs do SQL-6: `app_login`, `app_registrar`, `app_perfil`, `app_mis_registros` (chamadas local-first; se falharem, o app segue funcionando).
- **Rodar `supabase/SQL-7-FRASCO-RECIBIDO.sql`** depois do SQL-6: coluna `frasco_recibido_em`, tabela de códigos e RPC `app_frasco_recibido`.
  > No momento do desenvolvimento o SQL-6 ainda não estava aplicado no projeto `ctnyilyoyzutpqlnleqx` (tabelas `app_*` inexistentes).

## Rodar / deploy
```bash
npm install
npm run dev     # http://localhost:3100
```
Vercel: importar o repositório com **Root Directory = `barberina-es`** e as env vars de `.env.example`. Domínio sugerido `app.noctalev.online`.

> Barberina Max é um complemento alimenticio. No sustituye una dieta variada y equilibrada.
