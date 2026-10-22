# Especificação: site do PDI do Gabriel Jesus

Versão 1.0 · 15/10/2026 · fonte das decisões: sessão de grilling de 15/10/2026

## 1. Objetivo

Publicar o PDI do Gabriel como site público, editável só por ele, que mostra:

- a trajetória SE Pleno → SE Sênior → Solutions Architect (sem gestão);
- 5 trilhas de estudo com bloco semanal fixo;
- as disciplinas da graduação (Engenharia da Computação, UNOPAR) mapeadas nas trilhas, com domínio e fase;
- metas por ciclo trimestral (Ciclo 1 = out a dez/2026, com os projetos P1 a P5 em versão pública);
- certificações AWS (CLF-C02 em jan/2027, SAA-C03 no 2º semestre de 2027).

Referência visual e de navegação: o site de referência do template (pdi-template), que é a instância publicada do template.

## 2. Decisões fechadas

| Tema | Decisão |
|---|---|
| Base | Fork de `pdi-template` (autor e origem no README) |
| Hospedagem | Cloudflare Workers + D1, subdomínio `*.workers.dev`, domínio próprio depois |
| Repositório | GitHub pessoal do Gabriel, público |
| Idioma | PT-BR. Versão EN fica para o Ciclo 2 (não construir i18n agora) |
| Visual | Tricolor azul, vermelho e branco. Fjalla One nos títulos, IBM Plex Sans no corpo, IBM Plex Mono em números |
| Régua de progresso | Domínio por item: `domino`, `estudando`, `preciso-estudar` |
| Card de disciplina | Completo: trilha, ementa curta, onde aparece no trabalho, 1 recurso, 1 entregável, domínio, tag de fase |
| Remover disciplina | Arquivar com motivo. Some do público, fica no admin, pode ser restaurada |
| Disciplinas fora das trilhas | Cadastradas já arquivadas, com motivo |
| Dependência acadêmica | Visível só no admin |
| Contadores do Sobre | Dias até o fim do ciclo atual + tempo até a formatura |
| Seções | Sobre, Objetivo, Metas, Roadmap, Contribuições, Soft Skills, Eventos |
| Negócio e Comunicação | Não são trilhas. Aparecem como Soft Skills |

## 3. Rotas e seções

| Rota | Conteúdo | Mudança sobre o template |
|---|---|---|
| `/` Sobre | Hero (nome, cargo, stack, bio, GitHub, LinkedIn), card lateral (empresa, área, curso, ciclo atual com datas, 2 contadores, última atualização), grade semanal das 5 trilhas, Eventos | Troca `InternshipTimer` por `CycleCountdown` + `GraduationCountdown`; adiciona `WeeklyGrid` |
| `/objetivo-carreira` | 3 etapas de carreira + metas em andamento | Só conteúdo |
| `/metas` | Metas filtráveis por ciclo (abas: Ciclo atual, Próximo, Todas) e por status; contadores total, em progresso, concluídas | Filtro por ciclo; categoria vira trilha |
| `/roadmap` | Resumo (quantos itens em cada domínio, somando tecnologias e disciplinas ativas). Um bloco por trilha: nome, dia e horas, chips de tecnologias, cards de disciplinas. Filtros: trilha e fase. Admin: botão "Arquivadas (n)" | Principal mudança: disciplinas dentro das trilhas |
| `/contribuicoes` | Cards de contribuição | Categorias novas |
| `/soft-skills` | "Já pratico" e "Em desenvolvimento" | Só conteúdo |
| `/admin/login` | Login por senha | Sem mudança |

Ordem do menu: Sobre, Objetivo, Metas, Roadmap, Contribuições, Soft Skills.

## 4. Modelo de dados

### 4.1 Migration `0005_pdi_gabriel.sql`

```sql
CREATE TABLE trilhas (
  id TEXT PRIMARY KEY,                 -- cloud | dados | automacao | ia | ingles
  nome TEXT NOT NULL,
  icon TEXT NOT NULL,                  -- nome de ícone lucide
  dia_semana TEXT NOT NULL,            -- segunda..sexta
  horas_semana REAL NOT NULL,
  foco TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE ciclos (
  id TEXT PRIMARY KEY,                 -- ciclo-1, ciclo-2
  nome TEXT NOT NULL,
  inicio TEXT NOT NULL,                -- YYYY-MM-DD
  fim TEXT NOT NULL,                   -- YYYY-MM-DD
  foco TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL CHECK (status IN ('planejado','atual','concluido')),
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE disciplinas (
  id TEXT PRIMARY KEY,
  nome TEXT NOT NULL,
  semestre INTEGER NOT NULL CHECK (semestre BETWEEN 1 AND 10),
  fase TEXT NOT NULL CHECK (fase IN ('cursada','cursando','futura')),
  trilha_id TEXT REFERENCES trilhas(id),   -- NULL quando arquivada sem trilha
  ementa_resumo TEXT NOT NULL DEFAULT '',
  ementa_fonte TEXT NOT NULL DEFAULT 'generica', -- generica | plano-de-ensino
  aplicacao_trabalho TEXT NOT NULL DEFAULT '',
  recurso_titulo TEXT NOT NULL DEFAULT '',
  recurso_url TEXT,
  entregavel TEXT NOT NULL DEFAULT '',
  dominio TEXT NOT NULL CHECK (dominio IN ('domino','estudando','preciso-estudar')),
  arquivada INTEGER NOT NULL DEFAULT 0 CHECK (arquivada IN (0,1)),
  motivo_arquivamento TEXT,
  visibilidade TEXT NOT NULL DEFAULT 'publica' CHECK (visibilidade IN ('publica','admin')),
  nota_admin TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  CHECK (arquivada = 0 OR (motivo_arquivamento IS NOT NULL AND length(trim(motivo_arquivamento)) >= 3))
);

CREATE INDEX idx_disciplinas_publico ON disciplinas (arquivada, visibilidade, trilha_id);

ALTER TABLE goals ADD COLUMN ciclo_id TEXT;
ALTER TABLE goals ADD COLUMN trilha_id TEXT;
ALTER TABLE goals ADD COLUMN visibilidade TEXT NOT NULL DEFAULT 'publica';
```

`roadmap_areas` continua como está. Convenção: `roadmap_areas.id` = `trilhas.id`, mais uma área `certificacoes`.

Este DDL foi testado em SQLite 3 sobre as migrations 0001 e 0003 do template, com as 24 disciplinas dos seeds e o CHECK de motivo rejeitando arquivamento sem motivo. Não confirmei no D1 em si. O agente `schema-api` aplica a migration no D1 local antes de seguir.

### 4.2 Seeds

`seeds/*.json` é a fonte de verdade do conteúdo inicial. O agente `seed-builder` gera `migrations/0006_seed_gabriel.sql` a partir deles e esvazia o conteúdo da autora em `0002_seed.sql` e `0004_seed_events_career.sql` (mantém os arquivos, troca os INSERTs por um comentário). Campos que começam com `_` nos JSON são notas para humanos e não vão para o banco.

| Arquivo | Tabela |
|---|---|
| `profile.json` | `src/data/profile.ts` (não é tabela) |
| `trilhas.json` | `trilhas` |
| `ciclos.json` | `ciclos` |
| `disciplinas.json` | `disciplinas` |
| `roadmap.json` | `roadmap_areas` |
| `metas.json` | `goals` |
| `carreira.json` | `career_steps`, `career_goals` |
| `contribuicoes.json` | `contributions` |
| `soft-skills.json` | `soft_skills` |
| `eventos.json` | `events` (vazio no início) |

## 5. Server functions

Padrão do template: `createServerFn`, zod em `inputValidator`, `adminMiddleware` em mutation.

1. Exportar de `src/api/auth.ts` um `isAdminRequest(): Promise<boolean>` que reutiliza `verifySession`. Leituras usam isso para decidir o filtro.
2. `src/api/disciplinas.ts`
   - `listDisciplinas()`: visitante recebe só `arquivada = 0 AND visibilidade = 'publica'`, e o objeto devolvido não contém `nota_admin` nem `motivo_arquivamento`. Admin recebe tudo.
   - `upsertDisciplina(data)`: admin. Zod com `refine`: se `arquivada` for true, `motivo_arquivamento` precisa ter 3 ou mais caracteres.
   - `arquivarDisciplina({ id, motivo })` e `restaurarDisciplina({ id })`: admin.
3. `src/api/trilhas.ts` e `src/api/ciclos.ts`: list público, upsert e delete admin.
4. `src/api/goals.ts`: aceitar `ciclo_id`, `trilha_id`, `visibilidade`; mesmo filtro de visibilidade do item 2.
5. Testes obrigatórios (`*.test.ts`, no estilo dos testes existentes):
   - lista pública não traz disciplina arquivada nem `visibilidade = 'admin'`;
   - lista pública não traz `nota_admin` nem `motivo_arquivamento`;
   - arquivar sem motivo é rejeitado;
   - mutation sem sessão é rejeitada.

## 6. Interface

### 6.1 Tokens de design

Substituir os tokens do `:root` e do `.dark` em `src/styles.css`. Manter os nomes que o template já usa (`--primary`, `--accent`, `--success`...) para não quebrar componentes, mudando só os valores.

| Token | Claro | Escuro | Uso |
|---|---|---|---|
| `--background` | `#F6F8FC` | `#0A1220` | Fundo da página |
| `--card` | `#FFFFFF` | `#111C2E` | Cards |
| `--foreground` | `#0D1B2E` | `#E8EEF7` | Texto |
| `--muted-foreground` | `#4A5A70` | `#9AA9BF` | Texto secundário |
| `--border` | `#D9E1EC` | `#22314A` | Bordas |
| `--primary` (azul) | `#0B3D91` | `#5B8DEF` | Botões, links, nav ativo |
| `--primary-deep` | `#072A66` | `#8FB3FF` | Números dos contadores |
| `--accent` (vermelho) | `#C8102E` | `#FF5A6E` | Destaques, CTA secundário |
| `--success` (domino) | `#1B7F4A` | `#4CC38A` | Domínio "domino" |
| `--warning` (estudando) | `#9A6700` | `#E3B341` | Domínio "estudando" |
| `--destructive` (preciso estudar) | `#C8102E` | `#FF5A6E` | Domínio "preciso-estudar" |
| `--gradient-primary` | `linear-gradient(135deg, #0B3D91 0%, #3A5FB0 50%, #C8102E 100%)` | igual com as cores escuras | Nome no hero e botões principais |

O template usa `oklch`; pode converter os hex acima para `oklch` se preferir, desde que o valor visual seja o mesmo.

Faixa tricolor: barra de 4 px no topo do `Navbar` com três faixas iguais (azul, branco, vermelho). No modo escuro, a faixa branca vira `#E8EEF7`.

Domínio no chip e no card: cor de fundo suave + texto na cor forte + ícone (check, livro, alerta). A cor nunca é o único sinal: o rótulo aparece escrito ("Domino", "Estudando", "Preciso estudar").

Contraste mínimo WCAG AA (4,5:1 para texto normal) em todas as combinações acima. O `qa-verifier` confere.

### 6.2 Tipografia

- Títulos (`h1` a `h3`, nome no hero, títulos de seção): Fjalla One.
- Corpo, labels, botões: IBM Plex Sans 400/500/600.
- Contadores, datas, horas, porcentagens: IBM Plex Mono 500, `font-variant-numeric: tabular-nums`.
- Carregar via Google Fonts com `display=swap`.

### 6.3 Componentes novos ou alterados

| Componente | Comportamento |
|---|---|
| `CycleCountdown` | Lê o ciclo com `status = 'atual'`. Mostra nome do ciclo, datas e "faltam N dias". Atualiza a cada 60 s, como o timer atual |
| `GraduationCountdown` | Lê `profile.graduationDate`. Mostra meses e dias até a formatura. Se `profile.graduationDateConfirmed` for false, mostra "data prevista" abaixo |
| `WeeklyGrid` | 5 colunas (seg a sex) com trilha, horas e foco. Em tela < 640 px vira lista |
| `TrilhaBlock` | Cabeçalho da trilha + chips de tecnologia + grade de `DisciplinaCard` |
| `DisciplinaCard` | Nome, semestre, tag de fase, chip de domínio, ementa curta, "No trabalho:", "Recurso:" (link se houver URL), "Entregável:". Lápis de edição só para admin |
| `DisciplinaModal` | Edita todos os campos. Checkbox "Arquivar" abre campo de motivo obrigatório |
| `ArquivadasDrawer` | Admin. Lista arquivadas e `visibilidade = 'admin'`, com motivo e botão "Restaurar" |
| `GoalCard` | Mostra a trilha e o ciclo como tags |

### 6.4 Layout

- Largura máxima de conteúdo 1152 px (`max-w-6xl`, como hoje), gutter de 16 px no mobile.
- Sem scroll horizontal em 375 px.
- Modo escuro: manter o toggle do template.

## 7. Limpeza do template

- Remover `public/images/*` da autora. Foto de perfil nova: `public/images/profile.jpg` (o Gabriel fornece; até lá, avatar com iniciais "GJ").
- Trocar `head` de todas as rotas: título no formato "Sobre · PDI Gabriel Jesus", descrição própria.
- README novo com: o que é, stack, como rodar, como fazer deploy, crédito ao template original com link.
- Template não tem LICENSE. Antes de tornar o repositório público, o Gabriel decide como tratar (ver `prompts/KICKOFF.md`, Fase 5).

## 8. Critérios de aceite

- [ ] `npm ci` sem `--legacy-peer-deps` termina com exit 0
- [ ] `npm run build` termina com exit 0
- [ ] `npm test` passa, incluindo os 4 testes novos da seção 5
- [ ] `npm run dev` sobe com D1 local migrado e mostra o conteúdo dos seeds
- [ ] Visitante não autenticado: nenhuma disciplina arquivada ou de admin no HTML nem na resposta das server functions (conferir no DevTools, aba Network)
- [ ] Admin consegue arquivar com motivo, ver em "Arquivadas" e restaurar
- [ ] Nenhuma ocorrência de texto, imagem ou nome da autora do template (`grep -ri "julia\|krisnarane\|itaú" src public migrations` vazio, exceto o crédito no README)
- [ ] Nenhuma ocorrência de `#FF009B`, `#192D37` ou nomes internos da empresa listados no `CLAUDE.md`
- [ ] Contraste AA nos pares de cor da seção 6.1, nos dois temas
- [ ] Layout sem scroll horizontal em 375 px e correto em 1440 px
- [ ] `.dev.vars`, `.env` e `.wrangler/` no `.gitignore` e fora do histórico do git
