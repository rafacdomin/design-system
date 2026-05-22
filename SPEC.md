# Especificação Geral — Design System de Portfólio (SPEC.md)

Este documento atua como a única fonte da verdade para o escopo, arquitetura, design tokens e componentes deste mini design system de portfólio.

---

## 1. Visão Geral

Este projeto consiste em um **Mini Design System** altamente otimizado para portfólios pessoais e profissionais. O objetivo é fornecer componentes de UI consistentes, acessíveis (WCAG 2.1 AA) e com uma estética premium e minimalista (baseada em uma paleta monocromática de alto contraste).

O sistema é construído como um **Monorepo** usando Turborepo, facilitando o isolamento de pacotes principais (`@ds/core`), pacotes com dependências pesadas (`@ds/carousel`) e documentação em Storybook (`@ds/docs`).

---

## 2. Stack Técnica

Abaixo estão as definições de tecnologia e as justificativas arquiteturais do projeto:

- **Framework Principal:** React 18 + TypeScript 5 (Strict Mode).
- **Gerenciador de Pacotes:** `pnpm` Workspaces (velocidade, eficiência de disco e suporte nativo a monorepos).
- **Monorepo Tooling:** Turborepo (para cache de builds, pipelines eficientes de lint/teste/build).
- **Estilização:** SCSS Modules. Não será utilizado CSS-in-JS nem Tailwind CSS. Toda a estilização deve ser feita através de classes CSS scoped e utilizando variáveis CSS globais fornecidas pelos Design Tokens.
- **Documentação e Sandbox:** Storybook 8 (instalado no pacote `@ds/docs`).
- **Testes Unitários/Integração:** Vitest + React Testing Library (TDD é obrigatório: os testes devem ser escritos antes da implementação).
- **Acessibilidade:** `jest-axe` nos testes de unidade para validação WCAG 2.1 AA. Primitivos da `@radix-ui` para garantir navegação por teclado e semântica ARIA adequadas em componentes complexos.
- **Qualidade e Linter:** ESLint (Flat Config), Prettier, Husky + lint-staged (impedindo commits fora de conformidade).
- **Regressão Visual:** Playwright rodando testes locais de regressão a partir dos Stories do Storybook, estruturado de forma a suportar execução remota no Browserstack via variáveis de ambiente `BROWSERSTACK_USERNAME` e `BROWSERSTACK_ACCESS_KEY`.

---

## 3. Estrutura do Monorepo

O repositório é configurado com a seguinte estrutura de diretórios e pacotes:

```
design-system/
├── .agent/                      # Workflows e Skills do Agente
├── .epic/                       # Planejamento de Issues e Épicos
├── references/                  # Guias e Referências Técnicas
├── packages/
│   ├── core/                    # Componentes base e sem dependências pesadas
│   │   ├── src/
│   │   │   ├── components/      # Button, Input, Textarea, Dropdown, Modal, Card, Tag, Avatar
│   │   │   ├── tokens/          # Variáveis CSS e definições de tokens
│   │   │   ├── themes/          # HOC withTheme e contextos de tema
│   │   │   └── index.ts         # Ponto de entrada de exports
│   │   └── package.json
│   ├── carousel/                # Componente de Carrossel (com Embla Carousel)
│   │   ├── src/
│   │   └── package.json
│   └── docs/                    # Storybook para documentar e visualizar componentes
│       ├── .storybook/
│       └── package.json
├── package.json                 # Configuração de workspaces da raiz
├── turbo.json                   # Configuração de pipelines do Turborepo
├── tsconfig.json                # Configuração TypeScript global da raiz
├── pnpm-workspace.yaml          # Configura workspaces do pnpm
└── README.md
```

---

## 4. Design Tokens (Resumo)

Os design tokens serão definidos como variáveis CSS customizadas (`--ds-*`) vinculadas aos temas do sistema. A escala de tokens inclui:

- **Fontes:**
  - `--ds-font-family-sans`: `'Inter', -apple-system, BlinkMacSystemFont, sans-serif` (padrão de interface/corpo de texto).
  - `--ds-font-family-heading`: `'Poppins', 'Inter', sans-serif` (destaque, títulos, seções).
- **Cores (Escala Monocromática):**
  - Cores neutras de cinza premium (do branco `--ds-color-neutral-0` ao preto puro `--ds-color-neutral-1000`).
  - Variantes de marca e acento de alto contraste para estados interativos e focos.
- **Espaçamento:** Escala baseada em múltiplos de `4px` (`4px`, `8px`, `12px`, `16px`, `24px`, `32px`, `48px`, `64px`).
- **Bordas:** Espessuras de borda e raios (`--ds-border-radius-sm`, `--ds-border-radius-md`, `--ds-border-radius-lg`).
- **Sombras:** Sombras leves e premium para elevação de cards/modais (`--ds-shadow-sm`, `--ds-shadow-md`, `--ds-shadow-lg`).
- **Breakpoints:** Escala responsiva padrão (`sm: 640px`, `md: 768px`, `lg: 1024px`, `xl: 1280px`).

_Nota: As definições completas estão em [DESIGN_TOKENS.md](file:///home/rafacdomin/projetos/design-system/references/DESIGN_TOKENS.md)._

---

## 5. Componentes e Escopo

Abaixo, a lista de componentes que serão desenvolvidos. Todos os componentes devem ter suporte nativo a estados (`default`, `hover`, `focus`, `active`, `disabled`), tipagem estrita com `interface`, suporte a polimorfismo/custom node (`asChild`) e acessibilidade completa.

1.  **Button:** Botão básico com variantes `primary`, `secondary`, `ghost`, `danger`, tamanhos `sm`/`md`/`lg` e estado `loading`.
2.  **Input:** Entrada de texto padrão com suporte a ícones prefixo/sufixo, label flutuante ou helper text, e validação visual de erro.
3.  **Textarea:** Caixa de texto multi-linha auto-redimensionável ou com altura fixa, com suporte a limites de caracteres.
4.  **Dropdown:** Menu de seleção baseado no `@radix-ui/react-select`.
5.  **Modal:** Janela de diálogo com overlay de fundo escurecido baseada no `@radix-ui/react-dialog`.
6.  **Card:** Componente de container com variações de borda, sombra e preenchimento para agrupamento de conteúdo de portfólio.
7.  **Tag:** Emblemas/Labels para categorias ou tags de tecnologias de projetos (ex: "React", "TypeScript").
8.  **Avatar:** Representação visual de usuário/autor com fallback para iniciais do nome.
9.  **Carousel:** Carrossel para imagens de projetos de portfólio, isolado em `@ds/carousel` devido à dependência do `embla-carousel-react`.

_Nota: A especificação detalhada de props e comportamento de cada componente está em [COMPONENT_SPEC.md](file:///home/rafacdomin/projetos/design-system/references/COMPONENT_SPEC.md)._

---

## 6. Sistema de Temas

O sistema usará temas baseados no atributo `data-theme` injetado no DOM. A alternância e a propagação de tema serão controladas por um provedor de contexto (`ThemeProvider`) e acessíveis a componentes através do HOC `withTheme`.

O tema padrão será `light`, com opção para alternar para `dark`.

```typescript
// Componentes serão encapsulados sob o data-theme
<div data-theme="dark">
  <Button variant="primary">Enviar</Button>
</div>
```

_Nota: Os detalhes de implementação do HOC e tokens por tema estão em [THEMING.md](file:///home/rafacdomin/projetos/design-system/references/THEMING.md)._

---

## 7. Estratégia de Testes

Os testes são parte central da qualidade do repositório, organizados conforme as seguintes metas:

1.  **Unitários & Integração (Vitest + RTL):** 95% do escopo do repositório. Cobertura mínima obrigatória: **90% de Statements**, **85% de Branches** e **90% de Functions**.
2.  **Acessibilidade:** Uso obrigatório de `jest-axe` em cada arquivo `.test.tsx` para assegurar conformidade com WCAG 2.1 AA.
3.  **Regressão Visual (Playwright):** Garantir que nenhuma alteração visual de CSS quebre o layout. O script gerará baselines locais para cada story no Storybook e as comparará a cada PR.

---

## 8. Critérios de Done (Pronto)

Um componente é considerado **Concluído (Done)** apenas se satisfizer os seguintes critérios sem exceções:

1.  **Arquitetura de Arquivos Completa:**
    - `ComponentName.tsx` (código limpo, tipado com interfaces, displayName setado, refs encaminhadas via `forwardRef`).
    - `ComponentName.module.scss` (sem valores literais, usando exclusivamente tokens).
    - `ComponentName.test.tsx` (testes RTL cobrindo rendering, interações, a11y com jest-axe e edge cases).
    - `ComponentName.stories.tsx` (Stories cobrindo todas as variações e estados).
    - `index.ts` (exportação limpa do componente).
2.  **Build & Tipagem:** Sem erros no compilador do TypeScript (`tsc --noEmit`).
3.  **Qualidade do Código:** ESLint e Prettier executados e sem erros.
4.  **Cobertura de Testes:** Atende ou supera os mínimos definidos na Estratégia de Testes.
5.  **Acessibilidade:** Zero violações no axe local e totalmente navegável via teclado (Focus Rings visíveis).
