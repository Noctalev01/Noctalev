# BRIEFING COMPLETO — App "Barberina · Mi acompañamiento" (España)
**Para a IA que vai dar sequência.** Estado em 07/10/2026. Dono: Joaquim (NoctaLev).
Leia este documento inteiro antes de mexer em qualquer coisa: ele explica o produto, o que já está pronto e funcionando em produção, como o banco funciona e como operar.

---
## 0. Resumo em 30 segundos
- **O que é:** app (PWA, abre no navegador do celular e pode ser instalado na tela inicial) em **espanhol de Espanha** para as clientes que compraram o suplemento **Barberina Max** (frasco).
- **Venda COD (contra-reembolso):** a cliente só paga quando recebe o frasco. Por isso o app dá acesso logo após o pedido, mas **quase tudo fica bloqueado (borrado, com cadeado) até a entrega**. Isso ajuda a reduzir recusa na entrega: ela vê o que vai ganhar e quer receber.
- **Liberação:** a EQUIPE marca o pedido como `entregado` no Supabase → o app libera sozinho (sem código).
- **Acesso da cliente:** por **link próprio** (`/a/<token>`) ou pelo **email do pedido**. O nome já vem do banco: ela não digita nome.
- **Produção:** https://barberina-es.vercel.app — já conectado ao Supabase e testado de ponta a ponta.
- **Código:** GitHub privado `Noctalev01/barberina-es` (o Vercel publica sozinho a cada push na branch `main`).

---
## 1. Acesso para o dono testar (contas de teste reais no banco)
| Email (entrar em https://barberina-es.vercel.app/entrar) | Link direto | Estado |
|---|---|---|
| **admin@admin.com** | https://barberina-es.vercel.app/a/601b442e3541 | `entregado` → vê o app **completo/liberado** |
| **espera@admin.com** | https://barberina-es.vercel.app/a/9bc4e4254309 | `reparto` → vê o app **bloqueado, esperando o pedido** |

- Na 1ª entrada pede só peso e objetivo (qualquer valor serve).
- Para testar como cliente diferente no mesmo celular: Perfil → **Cerrar sesión** e entrar com o outro email.
- Para alternar o estado: `select bm_marcar_envio('espera@admin.com', 'entregado');` (ou `'reparto'` para voltar).
- Essas 2 contas aparecem no banco como clientes "Admin" e "Espera". **Apagar antes do lançamento:**
  `delete from bm_clientas where email in ('admin@admin.com','espera@admin.com');`
- Não existe "painel admin" ainda. Hoje a administração é pelo SQL Editor do Supabase (ver §4). Um painel é uma melhoria sugerida (§9).

---
## 2. Contexto do negócio (o que o vídeo de vendas promete)
No final da VSL o **Dr. Castellanos** diz que existe "una aplicación gratuita donde entras en **el grupo de la semana**: mujeres como tú, que cada mañana apuntan su sueño y su peso… ves las evoluciones de todas y la tuya… hay un **ranking**, **mis consejos cada semana**, y las que más avanzan **reciben un premio**."
- O prêmio é **150 € por semana** para quem mais se destacar. Esse valor **só aparece dentro do app** (nunca no vídeo, nunca na tela de entrada, nunca no WhatsApp).
- **Camila** = atendente no WhatsApp (`5554920011946`), que envia o link do app e tira dúvidas.
- Objetivos: (1) reduzir recusa na entrega (COD); (2) prova social (prints do ranking viram anúncios); (3) manter a cliente por 3 meses (recompra); (4) dar dados à Camila para conversar.
- Público: mulheres 40–65 anos, pouca familiaridade com tecnologia → UX muito simples.
- Idioma: es-ES, sempre **"tú"** (nunca "usted"), "vosotras". Decimais com vírgula (77,6 kg). Datas tipo "martes 7 de octubre". Fuso **Europe/Madrid**.
- Este app é a versão espanhola de um app brasileiro do mesmo dono (NoctaLev, repo `Noctalev01/Noctalev`, pt-BR). Lá a cliente prepara uma receita; aqui ela **recebe um frasco**. A ideia de "turma + ranking + prêmio" vem do app brasileiro.

---
## 3. Como o app funciona (fluxo da cliente)
1. **Pedido feito** → a equipe cria a cliente no banco → Camila envia o link `https://barberina-es.vercel.app/a/<token>`.
2. **Abre o link** → entra direto. 1º acesso (`/bienvenida`): "¡Hola, María! 👋" + **peso atual**, **quantos kg quer perder**, avatar (emoji) e "aparecer en el ranking" (sim/não).
3. **Esperando o pedido** (estado inicial):
   - Tela Hoy: cartão verde-escuro com o frasco: *"Estamos esperando que recibas tu pedido, María. En cuanto tu Barberina Max sea entregado, liberamos automáticamente tu acceso completo…"* + rastreio de 5 passos (Pedido confirmado → Preparando → En camino → En reparto → Entregado) + selos "Pagas al recibir" / "Acceso automático".
   - **Borrado com cadeado:** registro diário, progresso, todas as receitas, plano semanal, Mi evolución, compartilhar progresso. As abas Recetas e Evolución têm um cadeado dourado no menu de baixo.
   - **Visível:** o grupo e o ranking (prova social), o conselho do Dr. "para a espera" e o botão de WhatsApp da Camila.
4. **Entrega** → a equipe marca `entregado` → o app verifica **ao abrir, ao voltar para o app e a cada 60 s** → abre sozinho a tela de celebração (`/recibido`, confete) → tudo liberado.
5. **Ativa:**
   - No dia da entrega: só "peso de partida" + aviso "esta noche, tu primera cápsula".
   - Daí em diante, **registro diário (20 s):** como dormiu (5 carinhas), peso, se tomou a cápsula; opcionais: despertares, energia, vontade de doce, nota. Contador de dias seguidos (streak) e confete ao salvar.
   - Progresso (kg perdidos, barra até o objetivo, sono médio, dias, pontos), conselho do Dr. da semana (4 conselhos rotativos), resumo do grupo.

### Telas (rotas)
| Rota | Conteúdo |
|---|---|
| `/a/<token>` | link próprio → entra direto (erro amigável se o link é inválido, cancelado ou sem rede) |
| `/entrar` | entrar pelo email do pedido (aceita também `?t=<token>`) |
| `/bienvenida` | 1º acesso: peso, objetivo, avatar, ranking on/off |
| `/` Hoy | modo espera ou modo ativo (ver acima) |
| `/grupo` | prêmio 150 € com contagem até domingo 23:59, posição da cliente, pódio 🥇🥈🥉, novidades do dia, abas **Ranking / Todas / Ganadoras**, compartilhar progresso (gera imagem 1080×1350 para WhatsApp/Instagram) |
| `/plan` | 14 receitas fit espanholas + plano semanal (café / almoço / jantar) + guia da cápsula |
| `/evolucion` | gráfico de peso, barras de sono (14 dias), calendário de constância (5 semanas), histórico, botão Camila |
| `/perfil` | cidade, objetivo, altura, idade, avatar, ranking on/off, sair. **O nome não é editável** (vem do banco) |
| `/recibido` | celebração da entrega |
| `/prueba` | ferramenta de teste local (simula dias e estados; não está no menu). Só altera o celular de quem usa |

### Ranking / pontos (mesma fórmula para todas)
**+10 pts por dia registrado · +25 pts por kg perdido na semana · +4 pts por ponto de sono médio acima de 3 · +5 pts por dia com cápsula.** A semana vai de segunda a domingo (hora de Madrid). Em empate a cliente real fica na frente.

### "Grupo de la semana" — perfis de roteiro (IMPORTANTE)
- Arquivo `lib/grupo.js`: **20 perfis fictícios** de mulheres espanholas (nome curto + cidade, ex. "Lucía G. · Madrid"), **os mesmos para todas as clientes**, ancorados no dia em que a cliente entrou no app.
- Roteiro: no dia 1, **4 já têm o frasco** (veteranas + "Carmen V.", que recebeu na véspera e mostra −1,2 kg no 1º dia) e **15 estão esperando**. Os frascos chegam em ondas nos dias 2–7, com estados "en camino" e "en reparto · llega mañana".
- Depois que recebem: perda rápida no início, que desacelera. Seis perfis perdem **1,0–1,2 kg no 1º dia**; outros 0,3–0,7 kg; um tem estagnação (meseta).
- A **posição da cliente é real** (calculada pelos registros dela).
- "Ganadoras" de semanas anteriores também são de roteiro.
- Desligar os perfis: variável `NEXT_PUBLIC_GRUPO_MODO=off` → mostra só a cliente real.
- ⚠️ **Risco legal (Espanha):** perfis fictícios com resultados de peso podem violar a lei de consumo e as regras de publicidade de suplementos. O próprio briefing original dizia "nunca inventar participantes". **Decisão do dono.** Há um aviso de complemento alimentar no Perfil.
- Ainda **não existe ranking entre clientes reais** (as clientes reais não se veem umas às outras). Ver §9.

---
## 4. Banco de dados (Supabase) — JÁ INSTALADO E FUNCIONANDO
- **Projeto:** `ctnyilyoyzutpqlnleqx` (https://ctnyilyoyzutpqlnleqx.supabase.co).
- **SQL completo** em `supabase/BARBERINA-ES-COMPLETO.sql`. Já foi rodado; é idempotente, pode rodar de novo após mudanças.
- **Onde roda SQL:** supabase.com/dashboard → projeto → menu da esquerda **SQL Editor** (ícone `>_`) → **+ New query** → colar → **Run**.

### Tabelas
**`bm_clientas`** (uma linha por cliente)
| coluna | uso |
|---|---|
| `token` | final do link `/a/<token>` (12 caracteres, gerado sozinho) |
| `nombre` | como aparece no app e no grupo — usar nome curto: **"María J."** |
| `email` | login alternativo (salvo em minúsculas, único) |
| `telefono` | 9 dígitos (o gatilho limpa "+34 612 345 678"). **Nunca aparece no app** |
| `ciudad`, `pedido_id` | opcionais |
| `estado_envio` | `preparando` · `enviado` · `reparto` · **`entregado`** · `devuelto` · `cancelado` |
| `entregado_em` | preenchido sozinho quando vira `entregado` |
| `peso_inicial`, `objetivo`, `altura`, `edad`, `avatar`, `publico` | preenchidos pela cliente no app |
| `ultimo_acceso`, `creado_em`, `actualizado_em` | controle |

**`bm_registros`** (um por cliente por dia): `fecha`, `peso`, `sueno` (1–5), `despertares`, `energia`, `antojos`, `tomo` (tomou a cápsula), `nota`.

**Segurança:** RLS ligada e **sem policies** → a chave anon (usada pelo app) não lê as tabelas. O app só usa funções que validam o token, então uma cliente só vê e edita os próprios dados. As funções da equipe só funcionam com a **service_role** (ou no SQL Editor). Testado e confirmado em produção.

### Comandos da EQUIPE (SQL Editor)
```sql
-- 1) criar cliente (ou atualizar, se o email/telefone já existir) → devolve o token
select bm_crear_clienta('María J.', 'maria@gmail.com', '612345678', 'Madrid', 'PED-1001');
-- link: https://barberina-es.vercel.app/a/<token>

-- 2) mudar o estado do envio (busca por email, telefone, pedido_id ou token)
select bm_marcar_envio('PED-1001', 'enviado');
select bm_marcar_envio('612345678', 'reparto');
select bm_marcar_envio('maria@gmail.com', 'entregado');   -- ← LIBERA o app
select bm_marcar_envio('maria@gmail.com', 'devuelto');    -- bloqueia o link

-- consultas
select nombre, email, telefono, estado_envio, token, ultimo_acceso from bm_clientas order by creado_em desc;
select c.nombre, r.* from bm_registros r join bm_clientas c on c.id = r.clienta_id order by r.fecha desc limit 50;
```

### Pela API (automação / outra IA — exige a SERVICE_ROLE key, nunca no app)
```
POST https://ctnyilyoyzutpqlnleqx.supabase.co/rest/v1/rpc/bm_crear_clienta
Headers: apikey: <SERVICE_ROLE>   Authorization: Bearer <SERVICE_ROLE>   Content-Type: application/json
Body: {"p_nombre":"María J.","p_email":"maria@gmail.com","p_telefono":"612345678","p_ciudad":"Madrid","p_pedido_id":"PED-1001"}
→ {"ok":true,"token":"a1b2c3d4e5f6","nombre":"María J.","id":"..."}

POST .../rest/v1/rpc/bm_marcar_envio
Body: {"p_busca":"PED-1001","p_estado":"entregado"}
→ {"ok":true,"actualizadas":1}
```

### Funções que o APP usa (chave anon)
`bm_acceso(p_token)` · `bm_acceso_email(p_email)` · `bm_estado(p_token)` · `bm_perfil(p_token, p_peso_inicial, p_objetivo, p_altura, p_edad, p_avatar, p_publico, p_ciudad)` · `bm_registrar(p_token, p_fecha, p_peso, p_sueno, p_despertares, p_energia, p_antojos, p_tomo, p_nota)` · `bm_mis_registros(p_token)`.

> No mesmo projeto Supabase também existem as tabelas do **app brasileiro** (profiles, rituais, compradoras etc.). **Não mexer nelas.** Tudo do app espanhol usa o prefixo `bm_`.

---
## 5. Operação recomendada (dia a dia)
1. Novo pedido COD → `bm_crear_clienta(...)` → Camila envia no WhatsApp:
   > "¡Hola María! 🌙 Este es tu acceso a la app de acompañamiento de Barberina Max: https://barberina-es.vercel.app/a/<token> — Ábrelo y guárdalo en tu móvil. Cuando recibas tu pedido, se activa todo automáticamente."
2. Despachado → `'enviado'`. Saiu para entrega → `'reparto'`. (Opcional: sem esses estados, o rastreio estima o passo pelos dias desde o cadastro.)
3. Entregue e pago → `'entregado'` → o app libera sozinho.
4. Recusado ou devolvido → `'devuelto'` (o link deixa de funcionar).
5. Cliente perdeu o link → ela entra em `/entrar` com o email, ou Camila reenvia o link (consultar o token em `bm_clientas`).

**Ainda NÃO automatizado (para a outra IA fazer):**
- Criar a cliente automaticamente quando entra um pedido (webhook da loja ou checkout → `bm_crear_clienta`).
- Marcar `entregado` automaticamente pela transportadora (webhook ou API) ou pela Camila.
- Camila enviar o link automaticamente.
- Prêmio semanal: fechar a semana, escolher a ganhadora real e pagar 150 € (Bizum ou transferência) — hoje não há nada no backend.

---
## 6. Stack, código e deploy
- **Next.js 14** (App Router, JavaScript, sem TypeScript) + **Tailwind 3** + `@supabase/supabase-js`. Fontes Sora (títulos) e Inter (texto).
- **Repo:** `Noctalev01/barberina-es` (privado). Cópia também em `Noctalev01/Noctalev`, pasta `barberina-es/` (PR #4).
- **Vercel:** projeto `barberina-es`, plano Hobby (grátis), ligado ao repo → **cada push na `main` publica sozinho**.
- **Variáveis de ambiente já configuradas** (Vercel → projeto → Settings → Environment Variables; grátis no Hobby):
  - `NEXT_PUBLIC_SUPABASE_URL` = `https://ctnyilyoyzutpqlnleqx.supabase.co`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = chave anon public
  - opcionais: `NEXT_PUBLIC_WHATSAPP` (padrão `5554920011946`), `NEXT_PUBLIC_GRUPO_MODO` (`demo` padrão | `off`)
- Sem as variáveis do Supabase o app roda em **modo demonstração** (qualquer `/a/xxx` entra como "María J.", dados só no celular).
- Rodar local: `npm install && npm run dev` (porta 3100).
- Domínio próprio (sugestão): `app.noctalev.online` → Vercel → Settings → Domains → CNAME `cname.vercel-dns.com` no Cloudflare (proxy desligado).

### Mapa dos arquivos
```
app/
  a/[token]/page.js   entrada pelo link próprio
  entrar/page.js      entrada por email
  bienvenida/page.js  1º acesso (peso, objetivo, avatar)
  page.js             HOY (ModoEspera / ModoActivo)
  grupo/page.js       ranking, prêmio, pódio, abas
  plan/page.js        receitas + plano semanal
  evolucion/page.js   gráficos e histórico
  perfil/page.js      perfil + sair
  recibido/page.js    celebração da entrega
  prueba/page.js      ferramenta de teste
  layout.js, globals.css (design system: .card, .card-tinta, .card-oro, .vidrio, .borrado, botões, animações)
components/
  ui.js        Logo, Splash (botão "¿Tarda mucho?" após 6 s), TabBar flutuante, HeroFoto, Bloqueo (conteúdo borrado + cadeado), Modal, Confeti, Avatar
  Frasco.js    AvisoPedido (aviso de espera), Rastreo (5 passos), FranjaEspera
  Registro.js  registro diário + "peso de partida"
lib/
  store.js     sessão (token em localStorage "barberina_es_v2"), chamadas bm_*, registros, pontos
  useSesion.js redirecionamentos + checagem automática da entrega (60 s)
  grupo.js     perfis de roteiro, ranking, novidades, ganhadoras
  contenido.js conselhos do Dr., 14 receitas, plano semanal, guia da cápsula
  fechas.js    datas em Madrid, formatos es-ES
  config.js    WhatsApp, prêmio, abas bloqueadas
  compartir.js imagem para compartilhar (canvas)
public/
  img/ (frasco.png + fotos; créditos em img/CREDITOS.txt), icon-192/512, manifest.json, sw.js
supabase/BARBERINA-ES-COMPLETO.sql
```

### Design atual
Fundo creme `#F6F2EA`, verde-floresta `#0E3B2B`/`#145238`, dourado `#E0A63A`/`#C9862A`, vermelho da marca `#C8102E`. Cabeçalhos com foto de fundo, cartões arredondados (24 px), menu flutuante (pílula branca), conteúdo bloqueado com `filter: blur`. Imagem do produto: `public/img/frasco.png`.
**Fotos:** licença livre (CC / domínio público), créditos em `public/img/CREDITOS.txt`. **6 das 14 receitas têm foto**; as outras 8 mostram um emoji. Melhoria: gerar fotos próprias com IA (frasco em cena, receitas que faltam, Dr. Castellanos).

---
## 7. Histórico de decisões (para não refazer)
1. **v1:** login com telefone +34 e PIN, liberação digitando um código do folheto → **descartado** pelo dono.
2. **v2:** liberação pela equipe via tabela (sem código) + redesign com fotos + tudo bloqueado borrado.
3. **v3 (atual):** acesso por **link próprio ou email**, nome vindo do banco, **SQL único** `bm_*` (substitui os antigos "SQL-6 / app_usuarias", que nunca foram usados aqui).
4. **Bug "travado no carregamento do pote verde":** o service worker servia JavaScript antigo. Corrigido: o SW v3 busca sempre a rede primeiro, e o Splash mostra o botão "¿Tarda mucho? Toca aquí" após 6 s (limpa o cache e recarrega).
5. **Bug corrigido:** cliente marcada como `entregado` **antes** do 1º acesso ficava pulando entre telas; agora passa primeiro por `/bienvenida`.

---
## 8. Problemas comuns
- **"Este enlace no es válido"** → token errado, ou a cliente está `devuelto`/`cancelado`.
- **Não liberou após marcar entregado** → conferir `estado_envio='entregado'`; a cliente precisa abrir ou voltar para o app (ou esperar até 60 s com ele aberto).
- **Carregamento infinito** → tocar em "¿Tarda mucho?" ou limpar os dados do site; conferir as variáveis de ambiente no Vercel.
- **404 em `/rpc/bm_…`** → o SQL não foi rodado; rode-o de novo ou execute `notify pgrst, 'reload schema';`.
- **Vercel pedindo "Pro"** → as variáveis de ambiente DO PROJETO são grátis (projeto → Settings → Environment Variables). As "Shared" do time é que pedem Pro.

---
## 9. Próximos passos sugeridos (backlog)
**Alta prioridade**
- [ ] **Painel admin** (`/admin`, protegido): listar clientes, criar cliente e copiar o link, mudar o estado do envio com 1 clique, ver registros. Precisa de rota de servidor com a service_role (nunca no navegador) ou login de admin via Supabase Auth.
- [ ] Automação pedido → `bm_crear_clienta` → envio do link pela Camila.
- [ ] Automação entrega (transportadora ou Camila) → `bm_marcar_envio(...,'entregado')`.
- [ ] Apagar as contas de teste antes do lançamento.
**Média**
- [ ] Ranking com clientes **reais** misturadas aos perfis (view pública só com nome curto, cidade, kg e pontos de quem tem `publico=true`), e desligar gradualmente os perfis fictícios.
- [ ] Fechamento semanal do prêmio (cron às segundas 00:10 Madrid): ganhadora real, aviso no app e para o Joaquim.
- [ ] Notificações push (lembrete às 8h para o registro e às 22h para a cápsula).
- [ ] Fotos próprias geradas por IA (receitas que faltam, frasco em cena, Dr. Castellanos) e áudio do Dr. no conselho da semana.
- [ ] Domínio próprio `app.noctalev.online`.
**Baixa**
- [ ] Mais receitas e conselhos (hoje são 14 e 4).
- [ ] Banner "Instalar en tu móvil" (PWA) após o 1º registro.
- [ ] Meta Pixel / CAPI para eventos (como no app BR).
