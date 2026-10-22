# PDI de Gabriel Jesus

Site público do Plano de Desenvolvimento Individual de Gabriel Jesus, Solutions Engineer. Em construção com o Claude Code, seguindo `CLAUDE.md` e `docs/SPEC.md`.

Fork de [krisnarane/pdi-template](https://github.com/krisnarane/pdi-template), de Julia Krisnarane. Sem arquivo LICENSE no original; este fork mantém o crédito acima e nenhum conteúdo pessoal da autora original (imagens, textos, seeds foram substituídos).

---


Este repositório foi preparado como um template para você criar seu próprio Plano de Desenvolvimento Individual (PDI) e publicar em uma página web moderna.

Ele já vem com:
- interface pronta para exibir perfil, metas, contribuições, roadmap e soft skills;
- área administrativa protegida por senha;
- banco local e produção com Cloudflare D1;
- estrutura preparada para deploy no Cloudflare.

---

## O que você precisa para usar este template

Antes de começar, tenha instalado:
- Node.js 20+
- npm
- uma conta no Cloudflare
- opcionalmente: Wrangler CLI

---

## 1. Faça o fork ou clone do repositório

1. Clique em "Use this template" no GitHub.
2. Crie um novo repositório com o nome que quiser.
3. Clone o repositório na sua máquina.

```bash
git clone <seu-repositorio>
cd <seu-repositorio>
```

---

## 2. Instale as dependências

Você pode usar o script de setup automático:

```bash
chmod +x scripts/setup-template.sh
./scripts/setup-template.sh
```

Ou instalar manualmente:

```bash
npm install
cp .env.example .env
```

Se quiser usar outro gerenciador, o projeto também suporta o fluxo padrão do Node.js com npm.

---

## 3. Personalize o conteúdo do template

Os principais arquivos a editar são:

- [src/data/profile.ts](src/data/profile.ts): dados do seu perfil
- [migrations/0002_seed.sql](migrations/0002_seed.sql): metas, contribuições e roadmap de exemplo
- [migrations/0004_seed_events_career.sql](migrations/0004_seed_events_career.sql): eventos e objetivo de carreira de exemplo

### Atualize seu perfil
No arquivo [src/data/profile.ts](src/data/profile.ts), troque:
- name
- title
- subtitle
- company
- area
- github
- linkedin
- bio
- lastUpdate

Exemplo:

```ts
export const profile = {
  name: "Seu Nome",
  title: "Desenvolvedor Backend",
  subtitle: "Java | Spring Boot | AWS",
  company: "Sua empresa",
  area: "Backend / Cloud",
  github: "https://github.com/seu-usuario",
  linkedin: "https://linkedin.com/in/seu-perfil",
  bio: "Escreva uma descrição curta sobre você.",
};
```

### Atualize o conteúdo do PDI
Você pode editar os dados de:
- metas
- contribuições
- roadmap técnico
- soft skills
- eventos
- objetivo de carreira

Esses dados estão vinculados ao banco de dados, então a forma mais simples é alterar os seeds ou criar novos registros pelo admin.

---

## 4. Configure as variáveis de ambiente

Crie um arquivo .env ou .dev.vars com as variáveis abaixo:

```env
ADMIN_PASSWORD=troque-esta-senha
SESSION_SECRET=troque-este-segredo
```

O arquivo [.env.example](.env.example) já traz um modelo inicial para você copiar.

> Importante: em produção, use secrets do Cloudflare em vez de deixar essas senhas no código.

---

## 5. Rode o projeto localmente

### Inicie o ambiente local

```bash
npm run dev
```

A aplicação deve abrir em:

```text
http://localhost:3000
```

### Acesse a área administrativa

Acesse a rota:

```text
http://localhost:3000/admin/login
```

Use a senha configurada em .dev.vars.

---

## 6. Banco de dados local com D1

Este projeto usa Cloudflare D1. Para rodar localmente, você precisa aplicar as migrations.

### Execute as migrations

```bash
npx wrangler d1 migrations apply <nome-do-banco> --local
```

Se você estiver utilizando um setup local já configurado pelo projeto, pode ser necessário adaptar o nome do banco para o seu ambiente.

### Seed inicial

Os dados iniciais estão nas migrations SQL. Após aplicar as migrations, você já terá um conteúdo inicial para testar o template.

---

## 7. Deploy no Cloudflare

### Passo 1: crie um projeto no Cloudflare

1. Acesse o Cloudflare.
2. Entre na área de Workers & Pages.
3. Crie um novo projeto.

### Passo 2: crie o banco D1

1. Acesse Workers & Pages > D1.
2. Crie um novo banco.
3. Anote o nome do banco e o ID.

### Passo 3: configure as variáveis de ambiente

No painel do Cloudflare, crie os seguintes secrets:
- ADMIN_PASSWORD
- SESSION_SECRET

### Passo 4: configure os bindings do D1

No projeto do Cloudflare, adicione o binding do D1:
- nome do binding: DB
- banco: o banco D1 que você criou

### Passo 5: faça o deploy

Use o Wrangler para publicar:

```bash
npx wrangler deploy
```

Se o projeto estiver configurado com Pages, siga o fluxo do painel e faça o deploy a partir da interface.

---

## 8. Estrutura do projeto

```text
src/
  api/           # server functions e autenticação
  components/    # layout, seções e UI
  data/          # dados do perfil
  routes/        # páginas do app
  types/         # tipos TypeScript
migrations/      # schema e seed do banco
public/          # imagens e assets públicos
```

---

## 9. Checklist rápida de personalização

- [ ] Troque o nome e os dados do perfil
- [ ] Troque a foto em public/images
- [ ] Atualize as metas e contribuições
- [ ] Ajuste o roadmap técnico
- [ ] Defina uma senha administrativa segura
- [ ] Configure o Cloudflare D1
- [ ] Faça o deploy

---

## 10. Dicas importantes

- Nunca deixe senhas e segredos no repositório público.
- Use sempre secrets no Cloudflare para produção.
- O template foi pensado para ser adaptado, então sinta-se à vontade para modificar o layout e os textos.
- Se quiser, você pode transformar o conteúdo em um portfolio pessoal, currículo digital ou PDI corporativo.

---

## 11. Troubleshooting

### Erro de autenticação
- Verifique se as variáveis ADMIN_PASSWORD e SESSION_SECRET estão corretas.
- Em produção, confirme se os secrets foram configurados no Cloudflare.

### Banco não encontrado
- Confirme se o binding DB está corretamente configurado.
- Verifique se as migrations foram aplicadas no ambiente certo.

### App não sobe localmente
- Confirme se o Node.js está na versão correta.
- Rode npm install novamente.
- Confira se o arquivo .dev.vars existe e está preenchido.
