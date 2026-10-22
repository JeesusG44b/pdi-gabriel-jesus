# Prompt de kickoff: site do PDI no Claude Code

Cole o bloco abaixo como primeira mensagem de uma sessão nova do Claude Code, aberta na raiz do repositório (depois de seguir o `README.md` deste kit).

---

```markdown
## Objetivo
Transformar este fork do pdi-template no site público do meu PDI, seguindo `docs/SPEC.md`, e deixá-lo pronto para publicar no meu GitHub pessoal e no Cloudflare Workers com D1. O trabalho é dividido entre os subagentes de `.claude/agents/`. Você é o orquestrador: delega, confere o que voltou e me mostra cada checkpoint.

## Contexto (decisões travadas, não reabrir)
- Sou Gabriel Jesus, Solutions Engineer. Alvo: SE Pleno → SE Sênior → Solutions Architect, sem gestão.
- 5 trilhas, 4,5 h/semana: seg Cloud AWS, ter Dados e SQL, qua Automação e integrações, qui IA aplicada, sex Inglês + revisão.
- Disciplinas da graduação (Engenharia da Computação, UNOPAR, 5º ao 8º semestre por enquanto) entram dentro das trilhas. Fora das trilhas: arquivadas com motivo.
- Régua: domínio por item (domino, estudando, preciso-estudar), com tag de fase acadêmica.
- Ciclos trimestrais. Ciclo 1 = out a dez/2026 com os projetos P1 a P5 em versão pública. CLF-C02 em jan/2027, SAA-C03 no 2º semestre de 2027.
- Site público em PT-BR, visual tricolor azul, vermelho e branco, Fjalla One + IBM Plex Sans.
- Hospedagem: Cloudflare Workers + D1 em subdomínio `*.workers.dev`.
- Conteúdo inicial: `seeds/*.json`. Regras de conteúdo e código: `CLAUDE.md`. Especificação: `docs/SPEC.md`.
- O template não builda como veio (detalhes no `CLAUDE.md`, seção "Estado do template"). A Fase 1 resolve isso.

## Estado final
- `npm ci`, `npm run build` e `npm test` verdes, sem `--legacy-peer-deps`.
- Todos os critérios de aceite da `docs/SPEC.md` seção 8 marcados com evidência de comando.
- `privacy-reviewer` com veredito APROVADO.
- Repositório publicado no meu GitHub e site no ar em `*.workers.dev`, somente depois das minhas autorizações nas Fases 5 e 6.

## Como orquestrar
Rode as fases em ordem. Ao fim de cada fase, mostre o checkpoint e PARE até eu responder "segue". Não adiante trabalho da fase seguinte.

Delegue cada fase ao subagente indicado, passando no pedido: a fase, os arquivos que ele deve ler, o que já foi feito e o formato de resposta que está na definição dele. Mantenha no contexto principal só os relatórios, não o conteúdo dos arquivos.

| Fase | Quem executa | Gate para avançar |
|---|---|---|
| 0. Leitura e plano | você | Eu aprovo o plano |
| 1. Infra local | `infra-cloudflare` | build, test, migrate local e dev verdes |
| 2. Dados | `schema-api`, depois `seed-builder` (em sequência) | testes verdes e contagem por tabela igual à esperada |
| 3. Interface | `ui-builder` | Eu confiro as rotas no navegador |
| 4. Revisão | `privacy-reviewer` e `qa-verifier` em paralelo | APROVADO e todos os critérios ✅ |
| 5. GitHub | você, com minha autorização | Repositório publicado |
| 6. Deploy | você, com minha autorização | URL pública no ar e revisão de produção APROVADA |

### Fase 0: leitura e plano
Leia `CLAUDE.md`, `docs/SPEC.md`, a lista de `seeds/`, todos os arquivos de `.claude/agents/`, `package.json`, `vite.config.ts` e `src/api/bindings.ts`. Rode `git status`. Devolva um plano de no máximo 30 linhas: o que cada agente vai fazer, riscos que você viu e qualquer conflito entre SPEC, seeds e código. Não altere nenhum arquivo nesta fase.

### Fase 1: infra local
Delegue ao `infra-cloudflare`. Checkpoint: tabela de verificação dele, pacotes atualizados e URLs consultadas.

### Fase 2: dados
Delegue ao `schema-api`. Só quando ele terminar com testes verdes, delegue ao `seed-builder`. Checkpoint: arquivos alterados, resumo dos testes, contagem por tabela e a lista de problemas de conteúdo que o `seed-builder` encontrou (eu decido cada um).

### Fase 3: interface
Delegue ao `ui-builder`. Ele reporta passo a passo; repasse cada relatório para mim com a rota a conferir. Checkpoint: as 6 rotas listadas com o que eu devo ver em cada uma.

### Fase 4: revisão
Rode `privacy-reviewer` e `qa-verifier` em paralelo. Para cada achado, mande a correção ao agente dono do arquivo:
- `src/api/`, `migrations/0005`, `src/types/` → `schema-api`
- `seeds/` (só reportar para mim), `migrations/0006`, `scripts/` → `seed-builder`
- `src/components/`, `src/routes/`, `src/styles.css`, `public/` → `ui-builder`
- `package.json`, `vite.config.ts`, `wrangler.jsonc`, `.gitignore` → `infra-cloudflare`
No máximo 2 rodadas de correção. Se ainda houver bloqueio, pare e me mostre o que sobrou.

### Fase 5: GitHub (só com "pode publicar no GitHub")
Antes de qualquer comando, me apresente e espere minha resposta para:
1. Licença: o template original não tem arquivo LICENSE. Opções: pedir permissão à autora por issue no repositório dela, publicar com crédito no README e sem licença própria, ou manter o repositório privado até ter resposta. Eu escolho.
2. Nome do repositório (sugestão: `pdi`) e visibilidade.
Depois: rode o `privacy-reviewer` de novo, faça o commit inicial e publique com `gh repo create <nome> --public --source=. --remote=origin --push` (ou o equivalente que eu indicar). Mostre a URL.

### Fase 6: deploy (só com "pode fazer o deploy")
Liste os comandos abaixo e peça confirmação antes de CADA um que toca a conta Cloudflare:
1. `npx wrangler login` (eu faço, é interativo)
2. `npx wrangler d1 create pdi-gabriel-jesus` e atualização do `database_id` no `wrangler.jsonc`
3. `npx wrangler d1 migrations apply pdi-gabriel-jesus --remote`
4. `npx wrangler secret put ADMIN_PASSWORD` e `npx wrangler secret put SESSION_SECRET` (eu digito os valores; você nunca vê nem registra)
5. `npm run deploy`
Depois do deploy: rode o `privacy-reviewer` contra a URL pública (HTML e respostas das server functions) e o `qa-verifier` nas rotas públicas.

## Escopo
- Trabalhe só dentro deste repositório.
- Não altere `docs/SPEC.md`, `seeds/*.json`, `.claude/agents/*` nem `CLAUDE.md`. Se achar erro neles, me reporte.

## Restrições
- Só faça o que a fase atual pede. Sem feature, abstração, arquivo ou dependência fora da SPEC.
- Texto em PT-BR. Sem travessão em texto visível do site.
- Nunca afirme comportamento de Wrangler, D1, TanStack Start ou Tailwind sem consultar a documentação oficial. O que não confirmou, escreva "não confirmei".
- Segredos nunca em código, commit, log ou mensagem.

## Pare e pergunte antes de
- Qualquer comando que toque a conta Cloudflare ou o GitHub remoto
- Apagar arquivo fora de `public/images/` e dos INSERTs de `0002` e `0004`
- Adicionar dependência que não esteja no guia oficial usado na Fase 1
- Alterar migration já aplicada ou renumerar migrations
- Mudar o que está travado em "Contexto"
- Repetir o mesmo passo com falha pela terceira vez

## Progresso
Depois de cada passo concluído: ✅ [o que foi feito] | [arquivos] | [próximo passo]. No fim de cada fase: checkpoint com evidência de comando e a pergunta "segue?".

## Sessão
Use subagentes para todo trabalho de arquivo pesado, para manter o contexto principal limpo. Se o contexto passar da metade, rode /compact com foco em "fase atual, decisões e pendências" antes de seguir.
```

---

## Retomada em sessão nova

Se precisar abrir outra sessão no meio do caminho, cole isto:

```markdown
Retome o kickoff de `prompts/KICKOFF.md` a partir da Fase [N]. Leia `CLAUDE.md`, `docs/SPEC.md` e o `git log --oneline -20` para saber o que já foi feito. Confirme comigo em até 10 linhas o estado atual antes de delegar qualquer coisa.
```
