# #017 — Pipelines de Release das Bibliotecas (@rafacdomin/ds-core e @rafacdomin/ds-carousel)

## Status

`[ ] A Fazer` `[ ] Em progresso` `[x] Concluído`

## Objetivo

Configurar os workflows do GitHub Actions para a publicação manual das bibliotecas `@rafacdomin/ds-core` e `@rafacdomin/ds-carousel` no NPM, permitindo que o desenvolvedor escolha o incremento de versão semântico (SemVer) no momento do disparo.

## Critérios de Aceite

- [ ] Criar o arquivo `.github/workflows/release-core.yml` para publicação do `@rafacdomin/ds-core`.
- [ ] Criar o arquivo `.github/workflows/release-carousel.yml` para publicação do `@rafacdomin/ds-carousel`.
- [ ] Ambos os workflows devem ter disparos **exclusivamente manuais** (`workflow_dispatch`).
- [ ] Definir o input `version_increment` como escolha obrigatória de SemVer (`patch`, `minor`, `major`) com padrão `patch`.
- [ ] Configurar os workflows para usar cache do PNPM e do Turborepo para agilizar a instalação de dependências e builds.
- [ ] Incluir uma etapa de verificação executando linter (`pnpm lint`), testes unitários (`pnpm test`) e testes visuais do Playwright (`pnpm test:visual`) antes do build final.
- [ ] Adicionar etapa de incremento de versão automática no `package.json` baseada no input (ex: `pnpm version ${{ github.event.inputs.version_increment }} --no-git-tag-version`).
- [ ] Realizar a compilação do pacote específico antes de publicar (`pnpm --filter <pacote> build`).
- [ ] Executar publicação condicional usando `pnpm publish --no-git-checks --access public`, garantindo que só publique se `NPM_TOKEN` (passado como `secrets.NPM_TOKEN`) estiver configurado.
- [ ] Garantir que segredos sensíveis não sejam logados no console do GitHub Actions.

## Cenários de Validação

- [ ] Simular o disparo manual do workflow escolhendo `patch` e verificar se a versão local no `package.json` é incrementada corretamente.
- [ ] Garantir que falhas em etapas de testes (unitários ou visuais) interrompam o pipeline e abortem o processo de publicação.
- [ ] Validar se a ausência de `NPM_TOKEN` apenas pula a publicação real de forma controlada sem quebrar silenciosamente os passos anteriores.

## Arquivos a Criar/Modificar

- `.github/workflows/release-core.yml` (Criar)
- `.github/workflows/release-carousel.yml` (Criar)

## Dependências Externas

Nenhuma.

## Depende de

#001 (Setup do Monorepo), #013 (Carousel Component), #014 (Playwright Local Setup)

## Estimativa

M

---

## Pesquisa

### 1. Declaração do Workflow Dispatch com Parâmetros

O GitHub Actions permite coletar escolhas do usuário usando a sintaxe `choice` no bloco `inputs`. Isso restringe as opções no painel do GitHub:

```yaml
on:
  workflow_dispatch:
    inputs:
      version_increment:
        description: 'Tipo de incremento de versão (SemVer)'
        required: true
        default: 'patch'
        type: choice
        options:
          - patch
          - minor
          - major
```

### 2. Autenticação e Configuração do Registro NPM no Setup-Node

Para evitar vazamentos de tokens e simplificar a configuração de credenciais, utilizamos a action oficial `actions/setup-node` passando a URL do registro correspondente:

```yaml
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: 18
    cache: 'pnpm'
    registry-url: 'https://registry.npmjs.org'
```

Isso configura automaticamente o arquivo `.npmrc` interno do container para ler o token de acesso da variável de ambiente `NODE_AUTH_TOKEN`.

### 3. Incremento de Versão no Workspace do pnpm

O comando `pnpm version <tipo> --no-git-tag-version` é ideal para pipelines pois altera o arquivo `package.json` no workspace indicado sem criar commits locais ou tags de Git desnecessárias antes do upload.

---

## Implementação Planejada

### 1. Estrutura das Pipelines

As pipelines manuais serão configuradas no diretório `.github/workflows/` com os seguintes nomes de jobs e tarefas:

- **`ci-cd-core`** no arquivo `release-core.yml`
- **`ci-cd-carousel`** no arquivo `release-carousel.yml`

### 2. Orquestração do Build

Para o `@rafacdomin/ds-carousel`, o script de build deve invocar a compilação do pacote core primeiro. Como configuramos a dependência `"@rafacdomin/ds-core": "workspace:*"` no `packages/carousel/package.json`, o comando `pnpm --filter @rafacdomin/ds-carousel build` chamará automaticamente a build do core graças às regras do Turborepo (`dependsOn: ["^build"]` no `turbo.json`).

---

## Decisões Técnicas

- **Decisão: Disparo estritamente manual (`workflow_dispatch`)**
  _Justificativa:_ Como o monorepo publica bibliotecas públicas no NPM, a decisão de incremento SemVer (major vs minor vs patch) deve ser estritamente controlada e guiada por intenção humana de release, evitando publicações indesejadas a cada push/commit na branch principal.
- **Decisão: Validação de Regressão Visual no Pipeline de Publicação**
  _Justificativa:_ Garantir que nenhuma alteração visual quebrada ou flaky seja publicada nas versões estáveis das bibliotecas. O pipeline executará localmente ou via Browserstack (caso os segredos estejam presentes) os testes do Playwright contra o Storybook compilado antes de iniciar o empacotamento.

---

## Checklist de Implementação

- [x] Criar a pasta `.github/workflows/` na raiz do projeto (caso não exista).
- [x] Criar o arquivo `.github/workflows/release-core.yml`.
- [x] Definir o nome do workflow como `Release Core Package`.
- [x] Configurar trigger `workflow_dispatch` com input `version_increment` (opções: `patch`, `minor`, `major`) no `release-core.yml`.
- [x] Adicionar job `ci-cd-core` rodando sob o runner `ubuntu-latest`.
- [x] Configurar checkout do repositório usando `actions/checkout@v4`.
- [x] Configurar a action de setup do pnpm `pnpm/action-setup@v3` (v11.2.2).
- [x] Configurar setup do Node.js v18 e cache de dependências de pnpm via `actions/setup-node@v4`.
- [x] Executar instalação limpa das dependências com `pnpm install --frozen-lockfile`.
- [x] Adicionar passo para executar linter do pacote core (`pnpm --filter @rafacdomin/ds-core lint`).
- [x] Adicionar passo para executar testes unitários e de acessibilidade do pacote core (`pnpm --filter @rafacdomin/ds-core test`).
- [x] Adicionar passo de compilação estática do Storybook (`pnpm --filter @rafacdomin/ds-docs build-storybook`).
- [x] Configurar execução dos testes visuais do Playwright (`pnpm --filter @rafacdomin/ds-docs test:visual` ou `test:visual:ci`).
- [x] Adicionar passo de incremento da versão do `@rafacdomin/ds-core` de acordo com a seleção de SemVer.
- [x] Executar build de produção para gerar os bundles de distribuição no diretório `dist/` do `@rafacdomin/ds-core`.
- [x] Configurar passo condicional de publicação no NPM usando `NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}`.
- [x] Configurar etapa de notificação de status de sucesso e falha (Slack/Discord/Teams).
- [x] Criar o arquivo `.github/workflows/release-carousel.yml` repetindo o mesmo esqueleto estrutural.
- [x] Ajustar linter, testes, build e passos de publicação do `release-carousel.yml` para filtrar pelo pacote `@rafacdomin/ds-carousel`.
- [x] Validar que o build do `@rafacdomin/ds-carousel` aciona o build dependente do `@rafacdomin/ds-core` de forma nativa e integrada.
