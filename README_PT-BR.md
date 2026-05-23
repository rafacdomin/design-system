# Design System 🖤

> [Go to documentation in EN-US](https://github.com/rafacdomin/design-system/blob/main/README.md)

Este é o **Design System**, uma biblioteca de componentes React minimalista baseada em uma escala monocromática de alto contraste. Projetado para aplicações web de portfólio pessoal e profissional, o sistema preza pela performance, acessibilidade estrita (WCAG 2.1 AA) e estabilidade visual garantida por testes automatizados locais e na nuvem.

---

## 🚀 Stack Técnica

O projeto é estruturado utilizando práticas modernas de monorepo e testes automatizados:

- **Core & Runtime:** React 18 + TypeScript 5 (Strict Mode)
- **Estilização:** SCSS Modules + CSS Custom Properties (zero CSS-in-JS, zero Tailwind)
- **Monorepo Tooling:** Turborepo + `pnpm` workspaces
- **Sandbox & Documentação:** Storybook 8
- **Testes de Unidade & Acessibilidade:** Vitest + React Testing Library + `jest-axe`
- **Testes de Regressão Visual:** Playwright + BrowserStack Automate (WebSocket CDP + Túnel Local)
- **Qualidade de Código:** ESLint (flat config), Prettier, Husky + lint-staged

---

## 📦 Estrutura do Monorepo

O repositório é gerenciado através do Turborepo e dividido em workspaces no diretório `packages/`:

```
design-system/
├── packages/
│   ├── core/         # Componentes core sem dependências pesadas, design tokens e temas
│   ├── carousel/     # Componente complexo de Carrossel (separado por depender do Embla Carousel)
│   └── docs/         # Sandbox do Storybook 8 e suíte de Testes de Regressão Visual do Playwright
├── .epic/            # Planejamento estratégico e issues de desenvolvimento (Spec-Driven Development)
├── references/       # Diretrizes detalhadas de arquitetura, acessibilidade, testes e workflow
├── package.json      # Atalhos globais e dependências de tooling da raiz
├── turbo.json        # Configuração de pipelines e cache de tarefas do Turborepo
└── SPEC.md           # Especificação técnica detalhada das APIs dos componentes
```

- **Por que separar `@ds/carousel`?** Mantemos a regra de que qualquer componente com dependência pesada (>10kb gzipped) deve residir em seu próprio subpacote para otimizar o tamanho de bundle final da aplicação core.

---

## 🎨 Design Tokens

Todos os design tokens estão declarados como propriedades customizadas de CSS sob o prefixo `--ds-` e mudam dinamicamente dependendo do tema ativo.

### 1. Cores (Escala Monocromática Premium)

| Token                     | Light Theme Value (HEX / HSL) | Dark Theme Value (HEX / HSL) | Uso Sugerido                             |
| :------------------------ | :---------------------------- | :--------------------------- | :--------------------------------------- |
| `--ds-color-neutral-0`    | `#ffffff` (hsl(0, 0%, 100%))  | `#0a0a0a` (hsl(0, 0%, 4%))   | Fundo principal da página                |
| `--ds-color-neutral-50`   | `#f9f9f9` (hsl(0, 0%, 98%))   | `#121212` (hsl(0, 0%, 7%))   | Fundo secundário (ex: cards)             |
| `--ds-color-neutral-100`  | `#f1f1f1` (hsl(0, 0%, 95%))   | `#1a1a1a` (hsl(0, 0%, 10%))  | Hover de fundos sutis                    |
| `--ds-color-neutral-200`  | `#e2e2e2` (hsl(0, 0%, 89%))   | `#262626` (hsl(0, 0%, 15%))  | Bordas de input e divisores              |
| `--ds-color-neutral-300`  | `#d4d4d4` (hsl(0, 0%, 83%))   | `#3a3a3a` (hsl(0, 0%, 23%))  | Bordas focadas, background disabled      |
| `--ds-color-neutral-400`  | `#a3a3a3` (hsl(0, 0%, 64%))   | `#525252` (hsl(0, 0%, 32%))  | Placeholders e bordas ativas             |
| `--ds-color-neutral-500`  | `#737373` (hsl(0, 0%, 45%))   | `#737373` (hsl(0, 0%, 45%))  | Texto secundário / auxiliar              |
| `--ds-color-neutral-600`  | `#525252` (hsl(0, 0%, 32%))   | `#a3a3a3` (hsl(0, 0%, 64%))  | Hover em textos secundários              |
| `--ds-color-neutral-700`  | `#404040` (hsl(0, 0%, 25%))   | `#d4d4d4` (hsl(0, 0%, 83%))  | Texto de leitura regular (Body)          |
| `--ds-color-neutral-800`  | `#262626` (hsl(0, 0%, 15%))   | `#e2e2e2` (hsl(0, 0%, 89%))  | Títulos e textos de destaque médio       |
| `--ds-color-neutral-900`  | `#171717` (hsl(0, 0%, 9%))    | `#f1f1f1` (hsl(0, 0%, 95%))  | Títulos proeminentes                     |
| `--ds-color-neutral-1000` | `#0a0a0a` (hsl(0, 0%, 4%))    | `#ffffff` (hsl(0, 0%, 100%)) | Fundo de botões primários e chips        |
| `--ds-color-focus-ring`   | `hsl(0, 0%, 0%)`              | `hsl(0, 0%, 100%)`           | Anel visual de foco (`:focus-visible`)   |
| `--ds-color-danger`       | `hsl(0, 84%, 48%)`            | `hsl(0, 96%, 65%)`           | Cores de feedback de erro ou destrutivas |

### 2. Tipografia

- **Escala de Tamanhos:** Baseada em `rem` (xs: `0.75rem`, sm: `0.875rem`, md: `1rem`, lg: `1.125rem`, xl: `1.25rem`, 2xl: `1.5rem`, 3xl: `1.875rem`, 4xl: `2.25rem`).
- **Famílias:** Interface/Sans-serif (`--ds-font-family-sans` com `Inter`) e Títulos/Destaques (`--ds-font-family-heading` com `Poppins`).
- **Pesos:** Regular (`400`), Medium (`500` / `505`), Semibold (`600`), Bold (`700`).

### 3. Outros Tokens

- **Espaçamento:** Escala base linear de `4px` (`--ds-spacing-1` de `4px` a `--ds-spacing-16` de `64px`).
- **Bordas:** Arredondamento moderno e sutil (sm: `2px`, md: `4px`, lg: `8px`, full: `9999px`) e espessuras (sm: `1px`, md: `2px`).
- **Sombras:** Três elevações translúcidas (`--ds-shadow-sm`, `--ds-shadow-md`, `--ds-shadow-lg`).
- **Breakpoints:** Media-queries padronizadas (sm: `640px`, md: `768px`, lg: `1024px`, xl: `1280px`, 2xl: `1536px`).

---

## 🌗 Sistema de Temas

O design system utiliza variáveis de ambiente de CSS (Custom Properties) encapsuladas em atributos HTML para alternar os temas instantaneamente sem re-renderizar a árvore de componentes:

- **Provider:** `<ThemeProvider defaultTheme="light">` gerencia o estado do tema e aplica o atributo `data-theme` na tag de wrapper.
- **HOC `withTheme`**: Injeta a propriedade `data-theme` e sincroniza o contexto para componentes individuais quando necessário.
- **Utilização no SCSS**: Todos os estilos SCSS referenciam apenas as propriedades do tema (ex: `background-color: var(--ds-color-neutral-0)`), nunca valores hex/rgb literais.

---

## 🧩 Arquitetura de Componentes

Seguimos regras estritas de componentização para manter a base de código escalável:

1. **Assinaturas forwardRef e forwardProps**: Todos os componentes expõem referências de DOM nativas completas e tipadas.
2. **Propriedades Tipadas**: Interfaces TypeScript declaradas explicitamente (ex: `interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>`). Nunca utilizar aliases de tipo (`type`).
3. **Compound Component Pattern**: Para componentes compostos como `Dropdown` (com Radix UI) e `Input` (com slots de ícone), os subcomponentes são agregados diretamente na raiz do componente principal usando `Object.assign`:
   ```tsx
   export const Dropdown = Object.assign(ThemedDropdownComponent, {
     Item: DropdownItemComponent,
     Trigger: DropdownTriggerComponent,
   })
   ```
   Os subcomponentes não são exportados individualmente no `index.ts` principal e seus `displayName`s refletem a hierarquia (ex: `Dropdown.Item`).

---

## 🧪 Estratégia de Testes

Garantimos a confiabilidade dos componentes através de três camadas de testes automatizados:

### 1. Testes Unitários e Integração (Vitest + React Testing Library)

- Cobertura de comportamento, disparo de eventos, ciclos de vida de estado e chamadas de API.
- Cobertura mínima: **90% de Statements**, **85% de Branches** e **90% de Funções**.

### 2. Acessibilidade (WCAG 2.1 AA via `jest-axe`)

- Cada componente possui uma suíte dedicada para verificar erros de estrutura HTML, contraste de cores inicial, hierarquia ARIA e conformidade geral.
- Gerenciamento de foco do teclado estrito, incluindo focus traps em modais e navegação por setas em dropdowns.

### 3. Regressão Visual (Playwright + BrowserStack)

- **Varredura Dinâmica:** O runner [visual.spec.ts](https://github.com/rafacdomin/design-system/blob/main/packages/docs/src/test-visual/visual.spec.ts) lê dinamicamente as histórias ativas do Storybook em `storybook-static/index.json`.
- **Cenários:** Executado sob as viewports de 375x812 (Mobile), 768x1024 (Tablet) e 1280x800 (Desktop) sob ambos os temas (Light e Dark).
- **Estabilidade:** Injeção automática de CSS para remover animações, transições e piscar de cursores de texto durante as capturas para mitigar flakiness.
- **BrowserStack Integration:** Ativado em ambiente de CI automaticamente via flags `BROWSERSTACK_USERNAME` e `BROWSERSTACK_ACCESS_KEY`, roteando os testes através de um túnel local seguro (`browserstack-local`) para validar em navegadores reais em Windows 11 e macOS.

---

## 🛠️ Scripts Disponíveis

Comandos executáveis a partir do diretório raiz:

| Comando                   | Descrição                                                                        |
| :------------------------ | :------------------------------------------------------------------------------- |
| `pnpm dev`                | Inicia o pipeline de desenvolvimento do Turborepo em paralelo                    |
| `pnpm build`              | Compila todos os pacotes e gera a build estática do Storybook                    |
| `pnpm lint`               | Roda as verificações de código do ESLint em todos os workspaces                  |
| `pnpm format`             | Formata todo o código do repositório utilizando Prettier                         |
| `pnpm test`               | Executa todos os testes de unidade e acessibilidade com Vitest                   |
| `pnpm test:visual`        | Executa a suíte de testes de regressão visual localmente contra a build estática |
| `pnpm test:visual:update` | Atualiza as imagens de referência (snapshots) locais dos testes visuais          |
| `pnpm storybook`          | Inicia o servidor local do Storybook para desenvolvimento na porta `6006`        |

Para mais detalhes sobre como contribuir, regras de desenvolvimento de componentes e padronização de commits, consulte o [Guia de Contribuição (CONTRIBUTING.md)](https://github.com/rafacdomin/design-system/blob/main/CONTRIBUTING_PT-BR.md).
