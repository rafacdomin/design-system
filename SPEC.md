# Especificação Geral — Design System de Portfólio (SPEC.md)

Este documento atua como a única fonte da verdade para o escopo, arquitetura e especificações de testes de regressão visual com Playwright e Browserstack neste mini design system.

---

## 1. Visão Geral

Este projeto consiste em um **Mini Design System** de portfólio pessoal e profissional com estética premium minimalista.

Toda a infraestrutura base, design tokens, sistema de temas (HOC `withTheme` e `ThemeProvider`) e a biblioteca de componentes principais já foram implementados com sucesso. O foco atual do projeto é a **especificação e implementação da suíte de Testes de Regressão Visual** com Playwright e integração com Browserstack.

---

## 2. Stack Técnica Atualizada

Abaixo estão as tecnologias adotadas para a infraestrutura geral e especificamente para a suíte de regressão visual:

- **Core:** React 18 + TypeScript 5 (Strict Mode).
- **Gerenciador de Pacotes:** `pnpm` Workspaces (v11.2.2).
- **Monorepo Tooling:** Turborepo.
- **Estilização:** SCSS Modules + CSS Custom Properties dos Design Tokens (sem CSS-in-JS, sem Tailwind).
- **Sandbox e Documentação:** Storybook 8 (instalado em [packages/docs](file:///home/rafacdomin/projetos/design-system/packages/docs)).
- **Testes Unitários e Acessibilidade:** Vitest + React Testing Library (RTL) + `jest-axe`.
- **Suíte de Regressão Visual:** Playwright (instalado em [packages/docs](file:///home/rafacdomin/projetos/design-system/packages/docs)), rodando testes locais contra a build estática do Storybook, e configurado para execução remota no Browserstack.
- **CI/CD Integration:** Browserstack Automate (utilizando variáveis de ambiente `BROWSERSTACK_USERNAME` e `BROWSERSTACK_ACCESS_KEY` para autenticação e túnel local seguro).

---

## 3. Estrutura do Monorepo (Foco em Testes Visuais)

Abaixo está a estrutura do repositório, destacando onde a suíte de testes de regressão visual do Playwright ficará localizada:

```
design-system/
├── packages/
│   ├── core/                    # Componentes base, tokens e temas (Implementados)
│   ├── carousel/                # Componente de carrossel (Implementado)
│   └── docs/                    # Storybook + Suíte de Testes Visuais
│       ├── .storybook/          # Configurações do Storybook 8
│       ├── playwright.config.ts # Configuração do Playwright (Local e Browserstack)
│       ├── src/
│       │   ├── stories/         # Stories dos componentes (Button, Input, etc.)
│       │   └── test-visual/     # Suíte de regressão visual
│       │       ├── visual.spec.ts  # Teste automatizado de varredura dinâmica de stories
│       │       └── snapshots/   # Imagens de referência locais (baselines)
│       └── package.json
├── package.json                 # Scripts globais do monorepo
├── turbo.json                   # Configuração de pipelines do Turborepo
└── SPEC.md                      # Esta especificação
```

---

## 4. Escopo Implementado (Fase Anterior)

Os seguintes componentes e infraestrutura foram implementados e estão cobertos por testes unitários e de acessibilidade (Vitest + RTL + `jest-axe`):

1. **Fundação:** Setup do Monorepo, Design Tokens de cores, fontes, espaçamentos e bordas, e o Provedor de Temas (`ThemeProvider` + `withTheme`).
2. **Componentes Fundamentais:** `Button` (variantes, tamanhos, estados de carregamento e desabilitado).
3. **Componentes de Formulário:** `Input` (ícones, erros, labels), `Textarea` (redimensionamento dinâmico), e `Dropdown` (menu acessível com Radix UI).
4. **Componentes de Layout/Apresentação:** `Modal` (diálogo acessível com Radix UI), `Card` (agrupamento de conteúdo), `Tag` (rótulos de tecnologia), e `Avatar` (iniciais e fallback).
5. **Componente Complexo:** `Carousel` (carrossel de imagens com Embla Carousel).

As especificações detalhadas das APIs e comportamentos destes componentes podem ser consultadas em [COMPONENT_SPEC.md](file:///home/rafacdomin/projetos/design-system/references/COMPONENT_SPEC.md).

---

## 5. Especificação Técnica: Testes de Regressão Visual (Playwright + Browserstack)

Os testes de regressão visual servem para capturar desvios de layout, imperfeições visuais e quebras de CSS não detectáveis em testes unitários convencionais.

### 5.1 Escopo de Execução

Os testes devem cobrir **todas as histórias (stories) ativas** do Storybook nos seguintes cenários:

- **Temas:** Light (`data-theme="light"`) e Dark (`data-theme="dark"`).
- **Viewports (Resoluções):**
  - `mobile`: 375x812 (simulando iPhone 12/13/14)
  - `tablet`: 768x1024 (simulando iPad Portrait)
  - `desktop`: 1280x800 (resolução básica de laptop)
- **Engines de Renderização (Browsers):** Chromium, Firefox, e WebKit (Safari).

### 5.2 Mapeamento Dinâmico de Stories

Para evitar a necessidade de atualizar scripts de teste manualmente a cada novo componente ou story, o arquivo [visual.spec.ts](file:///home/rafacdomin/projetos/design-system/packages/docs/src/test-visual/visual.spec.ts) deve ler dinamicamente o arquivo `packages/docs/storybook-static/index.json` gerado pelo comando `storybook build`.

1. O script lê a lista de `entries`.
2. Filtra entradas válidas do tipo `story` (ignorando páginas de documentação).
3. Para cada story, gera casos de teste parametrizados que visitam a URL isolada do iframe do Storybook:
   `http://localhost:6006/iframe.html?id=${storyId}&viewMode=story`
4. Se uma story possuir a tag `'skip-visual'`, ela deve ser ignorada na suíte de testes.

### 5.3 Mitigação de Flakiness (Instabilidades Visuais)

Para garantir que os testes de imagem sejam consistentes e livres de falsos positivos devido a tempos de carregamento e animações:

1. **Desativação global de animações e transições:**
   O Playwright deve injetar um estilo CSS global na página antes de tirar o screenshot:
   ```css
   *,
   *::before,
   *::after {
     transition: none !important;
     animation: none !important;
     transition-duration: 0s !important;
     animation-duration: 0s !important;
   }
   ```
2. **Ocultar Caret do Cursor:** Habilitar a opção `animations: 'disabled'` e `caret: 'initial'` no Playwright.
3. **Aguardar carregamento completo:** O teste deve esperar até que o elemento raiz esteja montado e a rede esteja em repouso (`networkidle`).
4. **Paralisação de timers:** stories com lógica de tempo (ex: `Carousel` com autoplay) devem ter opções que desativem interações automáticas, ou ter as animações/avanços desativados por padrão.
5. **Threshold (Tolerância):** A comparação visual usará o limite estrito de `0.1%` de diferença tolerada de pixels (`maxDiffPixelRatio: 0.001` ou `threshold: 0.1` na função de comparação).

### 5.4 Fluxo de Teste de Temas

Para cada história e viewport, o teste realizará o seguinte ciclo:

1. Visitar a URL da história no Storybook.
2. Injetar o atributo `data-theme="light"` na tag `body` ou `html`.
3. Tirar screenshot da história (seja o viewport completo ou apenas o elemento delimitador do componente) e comparar com o baseline Light correspondente.
4. Alterar o atributo para `data-theme="dark"`.
5. Tirar novo screenshot e comparar com o baseline Dark correspondente.

### 5.5 Configuração do Playwright (`packages/docs/playwright.config.ts`)

O arquivo de configuração do Playwright deve prever duas modalidades de execução:

1. **Local (Default):**
   - Utiliza browsers Chromium, Firefox e WebKit locais.
   - Usa o `webServer` do Playwright para servir a pasta `storybook-static` na porta `6006` antes de iniciar os testes (ex: `http-server storybook-static -p 6006 --silent`).
   - Salva snapshots em `src/test-visual/snapshots/local`.
2. **Remote (Browserstack - CI/CD):**
   - Ativado quando as variáveis de ambiente `BROWSERSTACK_ACCESS_KEY` e `BROWSERSTACK_USERNAME` estiverem definidas.
   - Configura conexões WebSocket usando a URL do Browserstack:
     `wss://cdp.browserstack.com/playwright?caps=${encodeURIComponent(JSON.stringify(caps))}`
   - Executa os testes contra uma matriz de sistemas operacionais e browsers reais fornecida pelo Browserstack.
   - Faz o upload dos resultados e logs para a plataforma.

### 5.6 CLI e Scripts Disponíveis

Abaixo estão os scripts a serem adicionados no `packages/docs/package.json`:

- `"test:visual"`: Compila o Storybook em modo estático e roda os testes visuais do Playwright localmente.
  `"build-storybook && playwright test --config=playwright.config.ts"`
- `"test:visual:update"`: Atualiza os baselines visuais locais.
  `"playwright test --config=playwright.config.ts --update-snapshots"`
- `"test:visual:ci"`: Executa a suíte de testes contra a grade do Browserstack (utilizado no pipeline de CI).

---

## 6. Critérios de Done para Regressão Visual

Uma funcionalidade ou componente novo é considerado concluído se, além dos critérios anteriores, satisfizer os seguintes requisitos visuais:

1. **Stories Completos:** Contém stories no Storybook cobrindo todas as variantes críticas e estados interativos.
2. **Geração de Baselines:** Novas histórias têm baselines válidas geradas localmente (`pnpm test:visual:update`) tanto para o tema `light` quanto para o `dark`.
3. **Zero Regressões Visuais:** A suíte de testes de regressão visual local (`pnpm test:visual`) executa e passa com sucesso (0% de desvios visuais acima do limiar de `0.1%`).
4. **Conformidade em CI:** Pipeline de CI executa e valida as imagens no Browserstack sem erros.
