# GUIA TÉCNICO — App "Barberina · Mi acompañamiento" (España)
Documento para a IA / pessoa que vai operar o app (criar clientes, liberar entregas, integrar com pedidos, WhatsApp da Camila).
Versão 2 · 07/10/2026 · Dono: Joaquim (NoctaLev).

---
## 1. O que é
PWA mobile em **espanhol de Espanha** para quem comprou **Barberina Max** (frasco, pagamento contra-reembolso / COD).
- A clienta recebe um **link próprio** (`https://<DOMINIO>/a/<token>`) e entra direto, **já com o nome dela**. Não digita nome, nem telefone, nem senha.
- Alternativa: em `https://<DOMINIO>/entrar` ela digita o **email do pedido**.
- No 1º acesso pedimos só **peso atual** e **quantos kg quer perder** (+ avatar).
- **Enquanto o pedido não é entregue**, o app mostra o aviso *"Estamos esperando que recibas tu pedido… liberamos automáticamente tu acceso completo"* com um rastreio de 5 passos, e **quase tudo aparece borrado com cadeado** (registro diário, recetas, plan semanal, evolución, compartir). O grupo/ranking fica visível (prova social).
- **Quando a equipe marca o pedido como `entregado` no Supabase**, o app libera sozinho (verifica ao abrir, ao voltar para o app e a cada 60 s) e mostra uma tela de celebração.

Stack: Next.js 14 (App Router, JS) + Tailwind · Supabase (só chave **anon** no app) · Vercel.
Código: repo GitHub privado **`Noctalev01/barberina-es`** (raiz = app). Cópia também em `Noctalev01/Noctalev`, pasta `barberina-es/`.

---
## 2. Banco de dados (Supabase)
Arquivo único: **`supabase/BARBERINA-ES-COMPLETO.sql`** — rodar uma vez (pode repetir, é idempotente).

### Como rodar (passo a passo)
1. Entrar em https://supabase.com/dashboard → abrir o projeto (`ctnyilyoyzutpqlnleqx`).
2. Menu da esquerda → ícone **SQL Editor** (símbolo `>_`, "SQL Editor").
3. Botão **"+ New query"**.
4. Copiar TODO o conteúdo de `BARBERINA-ES-COMPLETO.sql`, colar e clicar em **Run** (ou Ctrl/Cmd + Enter).
5. Deve aparecer "Success. No rows returned". Pronto.

### Tabelas
**`bm_clientas`** (1 linha por clienta)
| coluna | uso |
|---|---|
| `id` uuid | interno |
| `token` text único | parte final do link `/a/<token>` (gerado sozinho, 12 caracteres) |
| `nombre` | como aparece no app e no grupo — usar nome curto: **"María J."** |
| `email` | login alternativo (minúsculas, único) |
| `telefono` | 9 dígitos (o gatilho limpa "+34 612 345 678" → "612345678"). **Nunca aparece no app** |
| `ciudad`, `pedido_id` | opcionais |
| `estado_envio` | `preparando` · `enviado` · `reparto` · **`entregado`** · `devuelto` · `cancelado` |
| `entregado_em` | preenchido sozinho quando vira `entregado` |
| `peso_inicial`, `objetivo`, `altura`, `edad`, `avatar`, `publico` | preenchidos pela clienta no app |
| `ultimo_acceso` | última vez que abriu o app |

**`bm_registros`** (1 linha por clienta por dia): `fecha`, `peso`, `sueno` (1-5), `despertares`, `energia`, `antojos`, `tomo` (tomou a cápsula), `nota`.

Ambas com **RLS ligada e sem policies** → a chave anon (app) não lê nada direto; só pelas funções.

### Funções da EQUIPE (só service_role / SQL Editor — o app NÃO consegue chamar)
```sql
-- criar (ou atualizar, se o email/telefone já existir) e obter o token do link
select bm_crear_clienta('María J.', 'maria@gmail.com', '612345678', 'Madrid', 'PED-1001');
-- → {"ok": true, "token": "a1b2c3d4e5f6", "nombre": "María J.", "id": "..."}
-- link para enviar: https://<DOMINIO>/a/a1b2c3d4e5f6

-- mudar estado do envio (busca por token, email, telefone ou pedido_id)
select bm_marcar_envio('maria@gmail.com', 'enviado');
select bm_marcar_envio('612345678', 'reparto');
select bm_marcar_envio('PED-1001', 'entregado');   -- ← LIBERA o app (em até 60 s)
select bm_marcar_envio('maria@gmail.com', 'devuelto'); -- bloqueia o acesso
```
Consultas úteis:
```sql
select nombre, email, telefono, estado_envio, token, ultimo_acceso from bm_clientas order by creado_em desc;
select c.nombre, r.* from bm_registros r join bm_clientas c on c.id = r.clienta_id order by r.fecha desc limit 50;
```

### Via API REST (para automações / outra IA com a service_role key)
```
POST https://ctnyilyoyzutpqlnleqx.supabase.co/rest/v1/rpc/bm_crear_clienta
Headers: apikey: <SERVICE_ROLE_KEY>   Authorization: Bearer <SERVICE_ROLE_KEY>   Content-Type: application/json
Body: {"p_nombre":"María J.","p_email":"maria@gmail.com","p_telefono":"612345678","p_ciudad":"Madrid","p_pedido_id":"PED-1001"}

POST https://ctnyilyoyzutpqlnleqx.supabase.co/rest/v1/rpc/bm_marcar_envio
Body: {"p_busca":"PED-1001","p_estado":"entregado"}
```
⚠️ A **service_role key** nunca vai para o app nem para o Vercel. Só no backend / automação.

### Funções que o APP usa (chave anon)
`bm_acceso(p_token)` · `bm_acceso_email(p_email)` · `bm_estado(p_token)` · `bm_perfil(p_token, …)` · `bm_registrar(p_token, p_fecha, …)` · `bm_mis_registros(p_token)`.
Todas validam o token; uma clienta só vê/edita os próprios dados.

---
## 3. Fluxo operacional recomendado
1. **Pedido criado** (COD) → `bm_crear_clienta(...)` → pegar `token` → Camila envia no WhatsApp:
   > "¡Hola María! Este es tu acceso a la app de acompañamiento de Barberina Max: https://<DOMINIO>/a/<token> 🌙 Ábrelo y guárdalo en tu móvil."
2. **Pedido despachado** → `bm_marcar_envio(<pedido>, 'enviado')`.
3. **Saiu para entrega** → `'reparto'`.
4. **Entregue e pago** → `'entregado'` → o app libera sozinho e mostra a celebração.
5. **Recusado / devolvido** → `'devuelto'` (o link deixa de funcionar).
Se não houver integração com a transportadora, basta marcar só `entregado` (o rastreio estima os passos pelos dias).

---
## 4. Telas do app
| rota | o quê |
|---|---|
| `/a/<token>` | link próprio → entra direto |
| `/entrar` | entrar por email (ou `?t=<token>`) |
| `/bienvenida` | 1º acesso: "¡Hola, María!" + peso, objetivo, avatar, aparecer no ranking |
| `/` (Hoy) | espera: aviso + rastreio + prévias borradas · ativo: registro diário 20 s, progresso, consejo do Dr., resumo do grupo |
| `/grupo` | prêmio **150 €/semana** (só dentro do app) + contador até domingo 23:59, pódio, novedades, Ranking / Todas / Ganadoras, compartir |
| `/plan` | 14 recetas fit + plan semanal + guia da cápsula (borrado na espera) |
| `/evolucion` | gráficos de peso e sono, calendário, histórico (borrado na espera) |
| `/perfil` | cidade, objetivo, altura, idade, avatar, ranking on/off, sair. **Nome não é editável** (vem do banco) |
| `/recibido` | celebração da entrega |
| `/prueba` | ferramenta de teste local (simula dias/estados — não aparece no menu) |

Ranking (mesma fórmula para todas): **+10 pts/dia registrado · +25 pts/kg perdido na semana · +4 pts por ponto de sono médio acima de 3 · +5 pts/dia com cápsula**. Semana = segunda→domingo, hora de Madrid.

**Grupo de motivação:** `lib/grupo.js` contém 20 perfis de roteiro (mulheres espanholas, nome curto + cidade), iguais para todas, ancorados no dia em que a clienta entrou: no dia 1 a maioria está esperando o pedido; os pedidos chegam nos dias 2–7; algumas perdem ~1 kg no primeiro dia. A posição da clienta é real. Desligar: env `NEXT_PUBLIC_GRUPO_MODO=off` (mostra só a clienta real).
⚠️ Risco legal (Espanha — consumo/publicidade de suplementos): perfis fictícios com resultados de peso. Decisão do dono.

---
## 5. Deploy (Vercel)
Variáveis de ambiente (Project → Settings → Environment Variables):
| nome | valor |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://ctnyilyoyzutpqlnleqx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | chave **anon public** (Supabase → Project Settings → API) |
| `NEXT_PUBLIC_WHATSAPP` | `5554920011946` (WhatsApp da Camila, só dígitos) |
| `NEXT_PUBLIC_GRUPO_MODO` | `demo` (ou `off`) |
Importar o repo `Noctalev01/barberina-es` no Vercel (Add New → Project → Import), sem Root Directory. (Se usar o repo `Noctalev01/Noctalev`, definir **Root Directory = `barberina-es`**.) Framework: Next.js (detecta sozinho). Depois de mudar env vars → **Redeploy**.
Domínio sugerido: `app.noctalev.online` (CNAME → `cname.vercel-dns.com` no Cloudflare, proxy desligado).

Sem as variáveis do Supabase o app roda em **modo demonstração** (qualquer link `/a/xxx` entra como "María J.", dados só no aparelho).

---
## 6. Arquivos principais
- `lib/store.js` — sessão (token), chamadas às funções `bm_*`, registros, pontos
- `lib/useSesion.js` — redirecionamentos + verificação automática da entrega (60 s)
- `lib/grupo.js` — grupo de motivação e ranking
- `lib/contenido.js` — consejos do Dr., recetas, plan semanal, guia da cápsula
- `components/Frasco.js` — aviso de espera e rastreio
- `components/ui.js` — design system (Splash com botão de recuperação após 6 s, Bloqueo borrado, TabBar)
- `public/sw.js` — service worker (rede primeiro para páginas/JS → nunca prende versão velha)
- `supabase/BARBERINA-ES-COMPLETO.sql` — banco completo

## 7. Problemas comuns
- **"Este enlace no es válido"** → token errado ou clienta `devuelto/cancelado`. Conferir em `bm_clientas`.
- **Não libera depois de marcar entregado** → conferir `estado_envio = 'entregado'`; a clienta precisa abrir o app (ou esperar até 60 s com ele aberto).
- **Fica no carregamento** → após 6 s aparece "¿Tarda mucho? Toca aquí" (limpa cache e recarrega). Verificar se as env vars estão certas no Vercel.
- **Funções não encontradas (404 em /rpc/bm_…)** → o SQL não foi rodado, ou rodar `notify pgrst, 'reload schema';`.
