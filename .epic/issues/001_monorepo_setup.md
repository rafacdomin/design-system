# #001 — Setup do Monorepo & Tooling

## Status
`[ ] A Fazer`  `[ ] Em progresso`  `[ ] Concluído`

## Objetivo
Configurar a fundação do monorepo utilizando Turborepo e pnpm workspaces, bem como configurar as ferramentas de qualidade globais: TypeScript, ESLint (flat config), Prettier e Husky com lint-staged na raiz do repositório.

## Critérios de Aceite
- [ ] Inicializar `package.json` na raiz configurado para monorepo privado (`"private": true`) com workspaces definidos para `packages/*`.
- [ ] Criar arquivo `pnpm-workspace.yaml` contendo a especificação dos workspaces (`packages/*`).
- [ ] Configurar `tsconfig.json` na raiz com as regras estritas globais (TypeScript 5, strict mode, etc.) para que pacotes possam herdá-lo.
- [ ] Configurar `.eslintrc.json` e `.prettierrc` globais garantindo padrões uniformes de formatação e linting.
- [ ] Inicializar o Husky (`.husky/pre-commit`) para executar o `lint-staged` antes de cada commit.
- [ ] Configurar `.lintstagedrc.json` na raiz para rodar prettier e eslint apenas nos arquivos staged.
- [ ] Configurar a base do `turbo.json` especificando as pipelines de build, test, lint e storybook.
- [ ] Criar esqueleto inicial da pasta `packages/core` e `packages/docs` com seus respectivos arquivos `package.json` provisórios.

## Cenários de Validação
- [ ] O comando `pnpm run lint` ou equivalente na raiz deve varrer o projeto sem erros.
- [ ] O comando `pnpm run format` deve formatar arquivos de acordo com o `.prettierrc`.
- [ ] Ao tentar fazer um commit com código mal formatado ou com erros de lint, o Husky deve interceptar e abortar o commit.

## Arquivos a Criar/Modificar
- `package.json` (Criar/Modificar na raiz)
- `pnpm-workspace.yaml` (Criar na raiz)
- `turbo.json` (Modificar na raiz)
- `tsconfig.json` (Criar na raiz)
- `.eslintrc.json` (Criar na raiz)
- `.prettierrc` (Criar na raiz)
- `.lintstagedrc.json` (Criar na raiz)
- `.husky/pre-commit` (Criar na raiz)
- `packages/core/package.json` (Criar)
- `packages/docs/package.json` (Criar)

## Dependências Externas
- `turbo`, `typescript`, `eslint`, `prettier`, `husky`, `lint-staged`

## Dependências de Issues
Nenhuma (Setup Inicial)

## Estimativa
M
