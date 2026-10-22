# PDI Gabriel Jesus: site público

Site público do Plano de Desenvolvimento Individual do Gabriel Jesus (Solutions Engineer). Fork de `pdi-template` (autor e origem no README), adaptado para trilhas de estudo, disciplinas da graduação e ciclos trimestrais. Especificação completa em `docs/SPEC.md`. Conteúdo inicial em `seeds/*.json`.

## Stack

- React 18 + TypeScript + TanStack Router/Start (server functions em `src/api/`)
- Cloudflare Workers + D1 (binding `DB`), deploy com Wrangler em subdomínio `*.workers.dev`
- UI: Tailwind v4 + componentes shadcn/ui em `src/components/ui/`
- Testes: Vitest (`npm test`)

## Estado do template no momento do fork (verificado em 15/10/2026)

- `npm ci` falha com ERESOLVE: `@tanstack/react-start@1.168.32` pede `vite >=7`, o projeto fixa `vite ^5.4.21`.
- Com `--legacy-peer-deps` instala, mas `npm run build` falha com `Could not resolve entry module "index.html"`: o `vite.config.ts` não tem o plugin do TanStack Start.
- Não existem no repo: `wrangler.jsonc`/`wrangler.toml`, plugin Cloudflare no Vite, dependências `tailwindcss` e `tw-animate-css` (importadas em `src/styles.css`), script `db:migrate:local` (citado no README).
- `npx vitest run` passa: 4 arquivos, 16 testes.
- Não há arquivo LICENSE no template.

A Fase 1 do kickoff existe para resolver isso. Não assuma que algo do README do template funciona sem testar.

## Regras de conteúdo (site é público)

1. Nenhum dado interno da empresa em página pública: nome de lojista, parceiro, número de transação, TPV, valores em R$, nome de canal do Slack, chave de ticket do Jira, nome de workflow n8n, nome de dashboard, nome de tabela do Snowflake, nome de serviço interno. A empresa pode aparecer só como empregador no perfil.
2. Projetos âncora (P1 a P5) aparecem na versão pública dos seeds: método e resultado em ordem de grandeza, nunca o artefato interno.
3. Disciplina com `visibilidade = "admin"` ou `arquivada = 1` NUNCA sai do servidor para visitante não autenticado. O filtro é server-side, no SQL da server function. Esconder só na UI é bug.
4. Nada da identidade visual da empresa (rosa #FF009B, navy #192D37, logo). As fontes Fjalla One e IBM Plex Sans são permitidas.
5. Remover todas as imagens e textos da autora do template (`public/images/*`, `index.tsx` head, seeds 0002 e 0004).

## Regras de código

- Só faça o que a fase atual pede. Sem feature, abstração ou dependência fora da `docs/SPEC.md`.
- Toda mutation passa por `adminMiddleware` (`src/api/auth.ts`). Toda entrada passa por schema zod.
- Tipos novos em `src/types/index.ts`. Server functions novas em `src/api/<entidade>.ts` com teste em `src/api/<entidade>.test.ts`.
- Migrations novas a partir de `0005_`. Não renumere as existentes.
- Texto de interface em PT-BR. Sem travessão (—) em texto visível; use vírgula, dois-pontos ou ponto.
- Antes de afirmar comportamento de Wrangler, D1, TanStack Start ou Tailwind, consulte a documentação oficial (Context7 ou web). Se não confirmou, escreva "não confirmei" no relatório.

## Comandos (válidos depois da Fase 1)

| Ação | Comando |
|---|---|
| Instalar | `npm ci` |
| Dev local | `npm run dev` |
| Migrations local | `npm run db:migrate:local` |
| Testes | `npm test` |
| Build | `npm run build` |
| Deploy | `npm run deploy` (só com autorização explícita do Gabriel) |

## Segredos

`ADMIN_PASSWORD` e `SESSION_SECRET` vivem em `.dev.vars` (local, no `.gitignore`) e em `wrangler secret put` (produção). Nunca em código, seed, commit ou log.

## Agentes do projeto

Definidos em `.claude/agents/`. Fluxo e gates em `prompts/KICKOFF.md`.

| Agente | Faz | Escreve em |
|---|---|---|
| `infra-cloudflare` | Deixa o template instalando, buildando e rodando com D1 local; prepara deploy | `package.json`, `vite.config.ts`, `wrangler.jsonc`, `src/api/bindings.ts`, `src/types/cloudflare.d.ts`, `.gitignore`, `README.md` |
| `schema-api` | Migrations, tipos, server functions, filtros de visibilidade, testes | `migrations/`, `src/api/`, `src/types/` |
| `seed-builder` | Converte `seeds/*.json` em migration SQL e valida | `migrations/0006_seed_gabriel.sql`, `migrations/0002_seed.sql`, `migrations/0004_seed_events_career.sql`, `scripts/` |
| `ui-builder` | Seções, cards, visual tricolor, contadores, admin | `src/components/`, `src/routes/`, `src/styles.css`, `src/data/profile.ts`, `public/` |
| `privacy-reviewer` | Revisão só leitura: vazamento de dado interno, marca, filtros | nada (só relatório) |
| `qa-verifier` | Roda testes, build e checagens de aceite | nada além de testes que faltarem, com aviso |
