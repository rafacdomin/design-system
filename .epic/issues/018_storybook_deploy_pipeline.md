# #018 — Pipeline de Deploy do Storybook no GitHub Pages

## Status

`[ ] A Fazer` `[ ] Em progresso` `[x] Concluído`

## Objetivo

Configurar o workflow do GitHub Actions para gerar a build estática do Storybook e publicá-la automaticamente no GitHub Pages sempre que uma biblioteca for publicada com sucesso, ou manualmente quando solicitado.

## Critérios de Aceite

- [ ] Criar o arquivo `.github/workflows/deploy-storybook.yml`.
- [ ] Definir o gatilho automático escutando a conclusão com sucesso dos workflows de release das libs (`workflow_run` com workflows `Release Core Package` e `Release Carousel Package` e tipo `completed`).
- [ ] Definir o gatilho manual (`workflow_dispatch`).
- [ ] Declarar as permissões de gravação exigidas pelo GitHub Pages no arquivo do workflow (`pages: write`, `id-token: write`).
- [ ] Adicionar controle de concorrência (`concurrency`) para evitar deploys simultâneos corrompendo a build ativa do GitHub Pages.
- [ ] Executar o build estático de todo o monorepo (`pnpm build`) antes do Storybook para garantir que as dependências internas do workspaces estejam resolvidas.
- [ ] Gerar o Storybook estático utilizando o script `pnpm --filter @ds/docs build-storybook` direcionando para a pasta `packages/docs/storybook-static`.
- [ ] Realizar o deploy usando as actions oficiais e recomendadas pelo GitHub:
  - `actions/configure-pages@v5`
  - `actions/upload-pages-artifact@v3` (apontando para a pasta estática gerada)
  - `actions/deploy-pages@v4` (recuperando a URL do deploy correspondente).

## Cenários de Validação

- [ ] Verificar se o workflow é iniciado de forma correta ao disparar manualmente.
- [ ] Garantir que se a pipeline de origem (`release-core` ou `release-carousel`) falhar, o deploy automático não é acionado (usando a validação condicional de sucesso no job).
- [ ] Confirmar se o deploy é publicado na URL pública do GitHub Pages do repositório.

## Arquivos a Criar/Modificar

- `.github/workflows/deploy-storybook.yml` (Criar)

## Dependências Externas

Nenhuma.

## Depende de

#004 (Storybook Setup), #017 (Release Pipelines)

## Estimativa

M

---

## Pesquisa

### 1. Gatilho Dinâmico workflow_run

O evento `workflow_run` é acionado sempre que um workflow do repositório especificado conclui sua execução. Para executar tarefas apenas quando esse workflow tem sucesso, validamos a conclusão no bloco condicional:

```yaml
on:
  workflow_run:
    workflows:
      - 'Release Core Package'
      - 'Release Carousel Package'
    types:
      - completed

jobs:
  deploy:
    if: ${{ github.event_name == 'workflow_dispatch' || github.event.workflow_run.conclusion == 'success' }}
```

### 2. Deploy Nativo sem Branch Auxiliar

Tradicionalmente, deploys em GitHub Pages exigiam a criação e push em uma branch como `gh-pages`. Com as novas APIs de Gravação e Deploys de Páginas, o GitHubActions pode empacotar e fazer o deploy diretamente de um diretório usando OIDC e tokens de gravação de tempo de execução:

```yaml
permissions:
  pages: write
  id-token: write
```

---

## Implementação Planejada

### 1. Estrutura do Workflow

O arquivo `.github/workflows/deploy-storybook.yml` definirá o job de deploy direcionado ao ambiente `github-pages`:

- Executará a compilação do design system (`pnpm build`) para satisfazer as resoluções de pacotes locais.
- Executará a build estática do docs (`pnpm --filter @ds/docs build-storybook`).
- Fará o upload da pasta `packages/docs/storybook-static` e acionará o deploy.

### 2. Tratamento de Concorrência

Como deploys de site estático possuem filas únicas de entrega no servidor do GitHub, utilizaremos a cláusula `concurrency` para enfileirar as execuções de deploys caso duas releases ocorram muito próximas:

```yaml
concurrency:
  group: 'pages'
  cancel-in-progress: false
```

---

## Decisões Técnicas

- **Decisão: Separação em Workflow Independente do Release das Libs**
  _Justificativa:_ Manter as esteiras desacopladas permite que alterações de documentação (como novos stories ou mudanças em páginas MDX no `@ds/docs`) sejam publicadas de forma manual a qualquer momento sem a necessidade de gerar novas versões das bibliotecas `@ds/core` e `@ds/carousel` no NPM.
- **Decisão: Deploy via OIDC nativo**
  _Justificativa:_ Segurança e performance. Não é necessário manter chaves de deploy (SSH deploy keys) ou tokens pessoais de acesso (PAT), e elimina-se a poluição do histórico do git com arquivos compilados.

---

## Checklist de Implementação

- [x] Criar o arquivo `.github/workflows/deploy-storybook.yml`.
- [x] Definir o nome do workflow como `Deploy Storybook Documentation`.
- [x] Configurar trigger manual `workflow_dispatch`.
- [x] Configurar trigger automático `workflow_run` vinculando os workflows `Release Core Package` e `Release Carousel Package` com tipo `completed`.
- [x] Adicionar declaração global de `permissions` exigindo `pages: write`, `id-token: write` e `contents: read`.
- [x] Configurar controle de concorrência com o grupo `"pages"` e `cancel-in-progress: false`.
- [x] Criar o job `deploy-storybook` rodando em `ubuntu-latest`.
- [x] Adicionar a validação condicional `if` para certificar execução apenas em disparos manuais ou em execuções concluídas com sucesso.
- [x] Configurar o bloco `environment` definindo `name: github-pages` e `url: ${{ steps.deployment.outputs.page_url }}`.
- [x] Configurar etapa de checkout do código (`actions/checkout@v4`).
- [x] Configurar a action de setup do pnpm `pnpm/action-setup@v3` (v11.2.2).
- [x] Configurar setup do Node.js v18 com cache de dependências de pnpm (`actions/setup-node@v4`).
- [x] Instalar as dependências do monorepo usando `pnpm install --frozen-lockfile`.
- [x] Executar build de produção geral do monorepo (`pnpm build`) para compilar dependências locais.
- [x] Compilar Storybook de forma estática via `pnpm --filter @ds/docs build-storybook`.
- [x] Adicionar a action de preparação de ambiente `actions/configure-pages@v5`.
- [x] Adicionar a action de upload `actions/upload-pages-artifact@v3` apontando para o caminho `packages/docs/storybook-static`.
- [x] Adicionar a action de deploy final `actions/deploy-pages@v4` com ID `deployment`.
- [x] Configurar envio condicional de notificações de sucesso e erro (Slack/Discord/Teams).
