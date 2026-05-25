# Especificação de Internacionalização (i18n) do Storybook e Componentes

Este documento detalha as especificações para implementar o suporte a múltiplos idiomas (`pt-BR` e `en-US`) no Storybook e a tradução das documentações e demonstrações, mantendo as bibliotecas de componentes agnósticas.

---

## 1. Visão Geral

O objetivo desta especificação é permitir que desenvolvedores e usuários acessem a documentação interativa (Storybook) em português brasileiro (`pt-BR`) ou inglês (`en-US`), com alternância em tempo de execução a partir de um seletor na barra de ferramentas.

Para evitar complexidade e acoplamento desnecessário nas bibliotecas de componentes (`core` e `carousel`), toda a inteligência e mapeamentos de idiomas ficarão concentrados no pacote de documentação `@ds/docs`. Os componentes serão agnósticos a i18n, aceitando propriedades descritivas que viabilizam a customização de seus textos internos.

---

## 2. Stack Técnica de i18n

- **Controle de Locale no Storybook**: Toolbar global (`globalTypes`) com o identificador `locale` e as opções `pt-BR` (padrão) e `en-US`.
- **Gerenciamento de Contexto**: Contexto React local (`LocaleContext`, `LocaleProvider` e `useLocale`) no pacote `@ds/docs`.
- **Tradução Automática de Histórias**: Decorador do Storybook (`withI18n`) que intercepta e traduz as `args` enviadas às stories recursivamente com base em um dicionário estático central.
- **Estruturação de Documentação**: Renderização condicional em arquivos MDX usando o componente utilitário `<Language>`.

---

## 3. Customizações de Rótulos em Componentes (Agnósticos)

Os textos internos de acessibilidade e legendas com fallback nativo em português devem ser customizáveis por meio de propriedades normais dos componentes.

### 3.1 `@ds/core` - Componente `Tag`

- **Nova Prop**: `removeAriaLabel?: string`
- **Comportamento**: Define o atributo `aria-label` do botão de remoção.
- **Fallback**: Caso não fornecida, usa a string padrão em português:
  - Se o conteúdo (children) for texto: `"Remover " + children`
  - Caso contrário: `"Remover"`

### 3.2 `@ds/carousel` - Componente `Carousel`

- **Novas Props**:
  - `slideAriaLabelFormat?: string` (Padrão: `'Slide {index} de {total}'`)
  - `dotAriaLabelFormat?: string` (Padrão: `'Ir para slide {index}'`)
- **Comportamento**: O componente renderizará dinamicamente os rótulos interpolando as marcações `{index}` (posição baseada em 1) e `{total}` (número total de slides).
  - Em `Carousel.Item`: aplica o `slideAriaLabelFormat`.
  - Em `Carousel.Dots` (botão de ponto): aplica o `dotAriaLabelFormat`.

---

## 4. Infraestrutura de i18n no Storybook (`@ds/docs`)

Toda a complexidade de i18n reside no pacote de documentação:

### 4.1 Release Core (`.github/workflows/release-core.yml`)

Responsável por validar e publicar o pacote `@ds/core`.

- **Gatilhos (Triggers):**
  - **Apenas disparo manual (`workflow_dispatch`).**
  - **Inputs do Workflow:**
    - `version_increment` (Choice: `patch`, `minor`, `major`, padrão: `patch`) - Define o tipo de incremento SemVer que será aplicado ao pacote.
- **Etapas da Pipeline:**
  1. **Install:** Checkout do código, configuração do Node.js (versão 22.20.0), cache de dependências e `pnpm install --frozen-lockfile`.
  2. **Test:** Execução dos testes unitários e de acessibilidade via `pnpm --filter @ds/core test` e `pnpm --filter @ds/core lint`.
  3. **Visual Regression Test:** Build estática do Storybook e execução dos testes do Playwright (`pnpm --filter @ds/docs test:visual`, que roda no Browserstack se as credenciais estiverem configuradas nos segredos do repositório, ou localmente caso contrário).
  4. **Bump Version:** Incrementa a versão do pacote no `package.json` de acordo com a seleção (ex: `pnpm --filter @ds/core version ${{ github.event.inputs.version_increment }} --no-git-tag-version`).
  5. **Build:** Compilação dos componentes do `@ds/core` para distribuição pública (ESM/CJS).
  6. **Publication:** Publicação no NPM (`pnpm --filter @ds/core publish --no-git-checks --access public`) autenticada por meio da variável `NPM_TOKEN`.
  7. **Commit & Push:** Realiza commit e push automático do novo incremento de versão de volta para o repositório.
  8. **Notification:** Envio de payload via webhook informando o status final da execução.

### 4.2 Release Carousel (`.github/workflows/release-carousel.yml`)

Responsável por validar e publicar o pacote `@ds/carousel`.

- **Gatilhos (Triggers):**
  - **Apenas disparo manual (`workflow_dispatch`).**
  - **Inputs do Workflow:**
    - `version_increment` (Choice: `patch`, `minor`, `major`, padrão: `patch`) - Define o tipo de incremento SemVer que será aplicado ao pacote.
- **Etapas da Pipeline:**
  1. **Install:** Instalação das dependências com cache.
  2. **Test:** Execução de testes unitários do `@ds/carousel` e linter.
  3. **Visual Regression Test:** Execução dos testes visuais do Playwright para os stories do carrossel.
  4. **Bump Version:** Incrementa a versão do pacote no `package.json` de acordo com a seleção (ex: `pnpm --filter @ds/carousel version ${{ github.event.inputs.version_increment }} --no-git-tag-version`).
  5. **Build:** Compilação da build de distribuição do `@ds/carousel`.
  6. **Publication:** Publicação no NPM usando o segredo `NPM_TOKEN`.
  7. **Commit & Push:** Realiza commit e push automático do novo incremento de versão de volta para o repositório.
  8. **Notification:** Notificação de status final.

### 4.3 Deploy Storybook (`.github/workflows/deploy-storybook.yml`)

Responsável pelo build e publicação da documentação interativa.

- **Gatilhos (Triggers):**
  - Conclusão bem-sucedida dos workflows "Release Core Package" ou "Release Carousel Package" (via evento `workflow_run`).
  - Disparo manual (`workflow_dispatch`).
- **Permissões GitHub Requeridas:**
  - `pages: write` e `id-token: write` para deploy nativo no GitHub Pages.
- **Etapas da Pipeline:**
  1. **Install:** Setup inicial do Node.js, pnpm e dependências.
  2. **Build:** Geração da build estática de todo o monorepo (`pnpm build`) para garantir links de dependência, seguida por `pnpm --filter @ds/docs build-storybook` para compilar o Storybook estático na pasta `packages/docs/storybook-static/`.
  3. **Publication:** Upload do artefato e publicação no GitHub Pages através dos actions oficiais:
     - `actions/configure-pages@v5`
     - `actions/upload-pages-artifact@v3` (apontando para `packages/docs/storybook-static`)
     - `actions/deploy-pages@v4` (que retorna a URL do deploy na variável `${{ steps.deployment.outputs.page_url }}`).
  4. **Notification:** Notificação de sucesso incluindo a URL direta da documentação publicada.

### 4.4 Verificação de Pull Request (`.github/workflows/pr.yml`)

Responsável por garantir a integridade do código e evitar regressões antes de mesclar alterações nas branches principais.

- **Gatilhos (Triggers):**
  - Disparado automaticamente na criação ou atualização de Pull Requests que tenham como destino as branches `main` ou `master`.
  - Disparo manual (`workflow_dispatch`).
- **Permissões GitHub Requeridas:**
  - `contents: read`
- **Etapas da Pipeline (Executadas em jobs paralelos):**
  - **Job `lint-and-build` (Lint & Build):**
    1. Checkout do código e instalação do Node.js (versão 22.20.0) e pnpm (v11.2.2).
    2. Instalação das dependências com `--frozen-lockfile`.
    3. Execução do linter (`pnpm lint`) e checagem de formatação do Prettier (`pnpm format:check`).
    4. Compilação de todos os pacotes do monorepo (`pnpm build`).
  - **Job `unit-tests` (Unit Tests):**
    1. Instalação do ambiente e dependências.
    2. Execução dos testes unitários e de acessibilidade de todos os pacotes (`pnpm test`).
  - **Job `visual-tests` (Visual Regression):**
    1. Instalação do ambiente e dependências.
    2. Verificação da presença de credenciais do BrowserStack (`BROWSERSTACK_USERNAME` e `BROWSERSTACK_ACCESS_KEY`).
    3. Se presentes, realiza a compilação do Storybook e executa a suíte de testes de regressão visual do Playwright (`pnpm --filter @ds/docs test:visual`).

---

## 5. Critérios de Done (Critérios de Conclusão)

1. Os componentes `@ds/core` e `@ds/carousel` não possuem referências, imports ou lógicas de internacionalização direta ou dicionários internos de tradução.
2. Todas as páginas MDX (`Introduction.mdx`, `Colors.mdx`, `Typography.mdx`, `Spacing.mdx`, `Borders.mdx`, `Shadows.mdx`) exibem o conteúdo em português quando a localidade selecionada for `pt-BR` e em inglês quando for `en-US`.
3. A troca de localidade na barra de ferramentas do Storybook atualiza dinamicamente as histórias dos componentes, traduzindo as propriedades de texto em tela.
4. Testes de unidade adicionados cobrem as propriedades `removeAriaLabel` e os formatos de legenda ARIA do Carrossel.
