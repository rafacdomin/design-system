# Guia: Design System com Spec Driven Development + Antigravity CLI

> Guia completo para montar um mini design system de portfólio usando Antigravity CLI com workflow Spec → Break → Plan → Execute.

---

## Índice

1. [Estrutura do Repositório](#1-estrutura-do-repositório)
2. [Arquivos .md que você precisa criar](#2-arquivos-md-que-você-precisa-criar)
3. [AGENTS.md — O arquivo mais importante](#3-agentsmd--o-arquivo-mais-importante)
4. [Workflows (Slash Commands)](#4-workflows-slash-commands)
5. [Workflow: Spec → Break → Plan → Execute](#5-workflow-spec--break--plan--execute)
6. [Pasta references/](#6-pasta-references)
7. [MCPs recomendados](#7-mcps-recomendados)
8. [Configuração do Monorepo](#8-configuração-do-monorepo)
9. [Ordem de execução sugerida](#9-ordem-de-execução-sugerida)
10. [Templates prontos](#10-templates-prontos)

---

## 1. Estrutura do Repositório

```
my-design-system/
│
├── .agent/                           # Configuração do Antigravity CLI
│   ├── workflows/                    # Slash commands (/spec, /break, /plan, /execute)
│   │   ├── spec.md                   # /spec — fase de planejamento
│   │   ├── break.md                  # /break — quebrar em issues
│   │   ├── plan.md                   # /plan — refinar issue
│   │   ├── execute.md                # /execute — implementar
│   │   ├── test.md                   # /test — gerar testes
│   │   ├── story.md                  # /story — gerar stories do Storybook
│   │   └── review.md                 # /review — code review automático
│   ├── rules/                        # Regras adicionais (complementam o AGENTS.md)
│   │   └── ds-rules.md
│   └── skills/                       # Agent Skills (ativadas automaticamente pelo agente)
│       ├── component-builder/
│       │   └── SKILL.md              # Skill para criar componentes React
│       ├── storybook-writer/
│       │   └── SKILL.md              # Skill para escrever stories
│       └── test-writer/
│           └── SKILL.md              # Skill para escrever testes
│
├── .epic/                            # Épicos e issues geradas pelo /break
│   ├── EPIC_DESIGN_SYSTEM.md
│   └── issues/
│       ├── 001_monorepo_setup.md
│       ├── 002_design_tokens.md
│       ├── 003_theme_system.md
│       ├── 004_button_component.md
│       ├── 005_input_component.md
│       ├── 006_textarea_component.md
│       ├── 007_dropdown_component.md
│       ├── 008_modal_component.md
│       ├── 009_card_component.md
│       ├── 010_tag_component.md
│       ├── 011_avatar_component.md
│       └── 012_storybook_setup.md
│
├── references/                       # Fonte da verdade técnica
│   ├── ARCHITECTURE.md
│   ├── DESIGN_TOKENS.md
│   ├── COMPONENT_SPEC.md
│   ├── TESTING_STRATEGY.md
│   ├── WORKFLOW.md
│   ├── ACCESSIBILITY.md
│   └── THEMING.md
│
├── AGENTS.md                         # Contexto global para o Antigravity CLI (= CLAUDE.md)
├── SPEC.md                           # Fonte da verdade do projeto
│
├── packages/
│   ├── core/
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   └── Button/
│   │   │   │       ├── Button.tsx
│   │   │   │       ├── Button.stories.tsx
│   │   │   │       ├── Button.test.tsx
│   │   │   │       ├── Button.module.scss
│   │   │   │       └── index.ts
│   │   │   ├── tokens/
│   │   │   ├── themes/
│   │   │   └── index.ts
│   │   └── package.json
│   ├── carousel/
│   │   └── package.json
│   └── docs/
│       ├── .storybook/
│       └── package.json
│
├── turbo.json
├── package.json
└── README.md
```

---

## 2. Arquivos .md que você precisa criar

### Prioridade 1 — Antes de qualquer código

| Arquivo                        | Quando criar  | Responsabilidade                   |
| ------------------------------ | ------------- | ---------------------------------- |
| `AGENTS.md`                    | Antes de tudo | Contexto global do Antigravity CLI |
| `SPEC.md`                      | Fase /spec    | Visão geral do projeto             |
| `references/ARCHITECTURE.md`   | Fase /spec    | Regras técnicas imutáveis          |
| `references/DESIGN_TOKENS.md`  | Fase /spec    | Tokens de design                   |
| `references/COMPONENT_SPEC.md` | Fase /spec    | Spec visual e comportamental       |

### Prioridade 2 — Antes de implementar

| Arquivo                          | Quando criar      | Responsabilidade     |
| -------------------------------- | ----------------- | -------------------- |
| `.epic/EPIC_DESIGN_SYSTEM.md`    | Fase /break       | Épico principal      |
| `.epic/issues/XXX_component.md`  | Fase /break       | Issue por componente |
| `references/TESTING_STRATEGY.md` | Antes do /execute | Como testar          |
| `references/THEMING.md`          | Antes do /execute | HOCs de tema         |

### Prioridade 3 — Workflows e Skills

| Arquivo                                    | Descrição                               |
| ------------------------------------------ | --------------------------------------- |
| `.agent/workflows/spec.md`                 | Comando /spec                           |
| `.agent/workflows/break.md`                | Comando /break                          |
| `.agent/workflows/plan.md`                 | Comando /plan                           |
| `.agent/workflows/execute.md`              | Comando /execute                        |
| `.agent/skills/component-builder/SKILL.md` | Skill auto-ativada ao criar componentes |
| `.agent/skills/test-writer/SKILL.md`       | Skill auto-ativada ao escrever testes   |

---

## 3. AGENTS.md — O arquivo mais importante

No Antigravity CLI, o arquivo `AGENTS.md` na raiz é lido automaticamente em toda sessão.
É equivalente ao `CLAUDE.md` no Claude Code — o briefing permanente do agente.

> **Nota:** `GEMINI.md` também funciona (legado do Gemini CLI). Use `AGENTS.md` — é o nome
> canônico do padrão aberto e funciona em qualquer agente compatível.

```markdown
# Design System — Contexto para Antigravity CLI

## O que é este projeto

Mini design system de portfólio, inspirado na estrutura do PagBank.
Monorepo com Turborepo. Pacotes: `core` (componentes sem deps externas) e pacotes extras
por dependência pesada (ex: carousel com Embla).

## Stack obrigatória

- React 18 + TypeScript 5 (strict mode)
- SCSS Modules (sem CSS-in-JS, sem Tailwind)
- Storybook 8
- Vitest + React Testing Library
- Playwright + Browserstack (Visual Regression a partir dos stories)
- ESLint (flat config), Prettier, Husky + lint-staged
- Turborepo para monorepo

## Regras absolutas (nunca violar)

1. Todo componente DEVE ter: `.tsx`, `.stories.tsx`, `.test.tsx`, `.module.scss`, `index.ts`
2. Testes vêm ANTES da implementação (TDD)
3. Acessibilidade WCAG 2.1 AA é requisito, não feature
4. Zero `any` no TypeScript
5. Props tipadas com interface, nunca type alias para componentes
6. Exports apenas pelo `index.ts` de cada componente
7. Temas via HOC `withTheme`, nunca hardcoded
8. SCSS: usar apenas CSS custom properties dos tokens, nunca valores literais

## Onde encontrar as regras

- Arquitetura: `references/ARCHITECTURE.md`
- Tokens de design: `references/DESIGN_TOKENS.md`
- Spec dos componentes: `references/COMPONENT_SPEC.md`
- Estratégia de testes: `references/TESTING_STRATEGY.md`
- Temas: `references/THEMING.md`

## Fluxo de desenvolvimento

Spec → Break → Plan → Execute (ver `references/WORKFLOW.md`)

## Comandos disponíveis

- `/spec` — criar/atualizar SPEC.md
- `/break` — quebrar SPEC em issues em `.epic/issues/`
- `/plan` — refinar uma issue (ex: `/plan 004`)
- `/execute` — implementar a issue planejada (ex: `/execute 004`)
- `/test` — gerar testes (ex: `/test Button`)
- `/story` — gerar stories do Storybook (ex: `/story Button`)
- `/review` — revisar código contra as references

## Não faça sem perguntar

- Mudar o bundler
- Adicionar CSS-in-JS
- Criar abstrações não documentadas em references/
- Instalar dependências externas não listadas na issue
```

---

## 4. Workflows (Slash Commands)

No Antigravity CLI, arquivos em `.agent/workflows/*.md` viram slash commands `/nome-do-arquivo`.
O funcionamento é idêntico aos comandos do Claude Code — basta digitar `/spec`, `/break`, etc.

> **Como funciona:** O agente busca `.agent/workflows/deploy.md` quando você digita `/deploy`.
> Use `$ARGUMENTS` para passar parâmetros: `/plan 004` passa `004` como argumento.

### `.agent/workflows/spec.md`

```markdown
---
description: Criar ou atualizar o SPEC.md com a especificação completa do design system
---

Você é um arquiteto de software sênior especializado em Design Systems.

Sua tarefa é criar ou atualizar o arquivo `SPEC.md` na raiz do projeto.

O SPEC.md deve conter:

1. **Visão Geral**: O que é o projeto, qual problema resolve
2. **Stack Técnica**: Tecnologias, versões, justificativas
3. **Estrutura do Monorepo**: Pacotes, responsabilidades
4. **Design Tokens**: Cores, tipografia, espaçamento, bordas, sombras, breakpoints
5. **Componentes**: Lista completa com variantes, props, estados, a11y e dependências externas
6. **Sistema de Temas**: HOC withTheme, tokens por tema
7. **Estratégia de Testes**: Cobertura esperada por tipo
8. **Critérios de Done**: O que significa um componente estar pronto

Leia os arquivos em `references/` antes de começar.
Se alguma informação não existir nas references, pergunte antes de inventar.
```

### `.agent/workflows/break.md`

```markdown
---
description: Quebrar o SPEC.md em issues executáveis dentro de .epic/issues/
---

Você é um tech lead quebrando um épico em tarefas executáveis.

Leia o arquivo `SPEC.md` e crie issues dentro de `.epic/issues/`.

## Regras para criação de issues

- Uma issue por componente
- Uma issue para configuração do monorepo/tooling
- Uma issue para o sistema de tokens
- Uma issue para o sistema de temas (HOC withTheme)
- Numere sequencialmente: `001_nome.md`, `002_nome.md`, etc.
- Ordene por dependência (tokens antes de componentes, setup antes de tudo)

## Estrutura de cada issue

# [ID] — Nome da Issue

## Objetivo

O que será entregue ao final desta issue.

## Critérios de Aceite

- [ ] Critério 1

## Cenários de Teste

### Happy Path / Edge Cases / Estados de Erro

## Arquivos a Criar/Modificar

- `path/to/file.tsx` — descrição

## Dependências Externas

## Dependências de Issues

## Estimativa P / M / G

Crie também `.epic/EPIC_DESIGN_SYSTEM.md` com a lista de todas as issues e ordem de execução.
```

### `.agent/workflows/plan.md`

```markdown
---
description: Refinar uma issue antes da implementação com pesquisa e plano detalhado
---

Você é um engenheiro sênior refinando a issue $ARGUMENTS antes da implementação.

## Sua tarefa

1. Leia a issue em `.epic/issues/$ARGUMENTS*.md` (busque pelo número ou nome)
2. Leia os arquivos relevantes em `references/`
3. Busque no codebase por padrões reutilizáveis
4. Pesquise na web por:
   - Implementações de referência em Radix UI, Base UI, shadcn/ui
   - Documentação de acessibilidade (WAI-ARIA patterns)
   - Melhores práticas para o componente específico
5. Atualize a issue com:
   - `## Pesquisa` — links e trechos relevantes
   - `## Implementação Planejada` — estrutura de arquivos e pseudocódigo
   - `## Decisões Técnicas` — por que usar Radix vs implementar do zero, etc.
   - `## Checklist de Implementação` — granular, com 15-20 itens

Não implemente ainda — apenas planeje.
```

### `.agent/workflows/execute.md`

```markdown
---
description: Implementar a issue planejada seguindo TDD e os padrões do design system
---

Você é um engenheiro de Design Systems implementando a issue $ARGUMENTS.

## Sua tarefa

1. Leia a issue em `.epic/issues/$ARGUMENTS*.md`
2. Confirme que as dependências de issues estão concluídas
3. Siga estritamente o AGENTS.md e os arquivos em references/
4. Implemente nesta ordem (TDD):
   a. Testes unitários PRIMEIRO — arquivo `.test.tsx`
   b. Tipagem TypeScript — interfaces e types
   c. Implementação do componente — arquivo `.tsx`
   d. Estilos SCSS — arquivo `.module.scss` usando apenas tokens
   e. Stories do Storybook — arquivo `.stories.tsx`
   f. Export no `index.ts`

## Regras de implementação

- Zero `any`
- `forwardRef` quando relevante
- `displayName` definido em todo componente
- Props com JSDoc
- ARIA attributes completos
- Keyboard navigation implementada
- `data-testid` em elementos interativos

## Ao finalizar

- Rode: `pnpm test --filter=core`
- Atualize o checklist da issue
- Liste arquivos criados/modificados
```

### `.agent/workflows/test.md`

```markdown
---
description: Gerar testes completos para um componente seguindo a estratégia de testes do projeto
---

Gere testes completos para o componente $ARGUMENTS seguindo `references/TESTING_STRATEGY.md`.

## Estrutura obrigatória

describe('<ComponentName />', () => {
describe('Rendering', () => { })
describe('Behavior', () => { })
describe('Accessibility', () => { /_ jest-axe _/ })
describe('Props', () => { })
describe('Edge Cases', () => { })
})

Ferramentas: @testing-library/react, @testing-library/user-event, vitest, jest-axe.
Não implemente o componente — apenas os testes. Eles devem falhar inicialmente (TDD).
```

---

## 5. Agent Skills

Diferente dos Workflows (ativados manualmente via /comando), as **Skills** são ativadas
**automaticamente pelo agente** quando ele identifica que a tarefa se encaixa na descrição.
Use para padrões que devem ser seguidos sempre, sem precisar lembrar de invocar.

### `.agent/skills/component-builder/SKILL.md`

````markdown
---
name: component-builder
description: Criar componentes React para o Design System seguindo a estrutura padrão do projeto
---

Ao criar qualquer componente React neste design system, siga OBRIGATORIAMENTE:

## Estrutura de arquivos

Crie sempre os 5 arquivos: `.tsx`, `.test.tsx`, `.stories.tsx`, `.module.scss`, `index.ts`

## Template de componente

```typescript
interface ComponentNameProps {
  /** Descrição para Storybook ArgTable */
  variant?: 'primary' | 'secondary'
  children: React.ReactNode
  className?: string
}

export const ComponentName = React.forwardRef<HTMLElement, ComponentNameProps>(
  ({ variant = 'primary', children, className, ...props }, ref) => (
    <element
      ref={ref}
      className={clsx(styles.root, styles[variant], className)}
      data-variant={variant}
      {...props}
    >
      {children}
    </element>
  )
)
ComponentName.displayName = 'ComponentName'
```
````

## Regras de SCSS

- Apenas CSS custom properties: `var(--ds-color-primary-500)`
- Variantes via data attributes: `[data-variant="secondary"] { }`
- Sem valores literais de cor, espaçamento ou fonte

````

### `.agent/skills/test-writer/SKILL.md`

```markdown
---
name: test-writer
description: Escrever testes unitários para componentes React seguindo TDD com Vitest e RTL
---

Ao escrever testes de componentes:

1. Testes vêm ANTES da implementação
2. Use sempre `jest-axe` para verificação de acessibilidade
3. Use `@testing-library/user-event` para interações (não `fireEvent`)
4. Estruture com: Rendering → Behavior → Accessibility → Props → Edge Cases
5. Prefira queries por role/label (acessíveis) sobre `getByTestId`
6. `data-testid` apenas como último recurso
````

---

## 6. Workflow: Spec → Break → Plan → Execute

### Fase 0 — Setup (manual, uma vez)

```bash
# Estrutura de pastas
mkdir -p .agent/workflows .agent/rules .agent/skills/component-builder \
  .agent/skills/storybook-writer .agent/skills/test-writer \
  .epic/issues references packages/core/src packages/docs

# Arquivos principais
touch AGENTS.md SPEC.md
touch references/{ARCHITECTURE,DESIGN_TOKENS,COMPONENT_SPEC,TESTING_STRATEGY,THEMING,WORKFLOW,ACCESSIBILITY}.md
touch .agent/workflows/{spec,break,plan,execute,test,story,review}.md
touch .agent/skills/component-builder/SKILL.md
touch .agent/skills/test-writer/SKILL.md

# Instalar Antigravity CLI (se ainda não tiver)
# Acesse antigravity.google para o instalador — é o binário `agy`

# Iniciar sessão no projeto
cd my-design-system
agy  # ou abrir o Antigravity desktop e apontar para a pasta
```

### Fase 1 — /spec

```
/spec
```

O agente lê as `references/`, faz perguntas sobre o que estiver faltando e gera o `SPEC.md`.
Revise, ajuste tokens e props, confirme.

### Fase 2 — /break

```
/break
```

O agente lê o `SPEC.md` e gera todos os arquivos em `.epic/issues/`. Revise a ordem das issues — setup e tokens devem vir antes de qualquer componente.

### Fase 3 — /plan [número]

```
/plan 004
```

O agente pesquisa na web (Radix UI, shadcn, WAI-ARIA), lê a issue, e a atualiza com
plano detalhado, decisões técnicas e checklist. **Sempre faça isso antes do /execute.**

### Fase 4 — /execute [número]

```
/execute 004
```

O agente implementa na ordem TDD: test → types → component → scss → stories → export.

---

## 7. Pasta references/

### `references/ARCHITECTURE.md`

```markdown
# Arquitetura do Design System

## Monorepo

- Turborepo + pnpm workspaces
- Pacotes: `@ds/core`, `@ds/carousel`, `@ds/docs`

## Estrutura de um componente

packages/core/src/components/ComponentName/
├── ComponentName.tsx
├── ComponentName.test.tsx
├── ComponentName.stories.tsx
├── ComponentName.module.scss
└── index.ts

## Dependências externas permitidas

- @radix-ui/\* — primitivos acessíveis
- @radix-ui/react-slot — pattern asChild
- class-variance-authority (cva) — variantes type-safe
- clsx — composição de classNames
- embla-carousel-react — apenas no pacote @ds/carousel

## Quando separar em pacote próprio

Dependência > ~10kb gzipped = pacote separado.
Embla (~15kb), Recharts (~300kb) = pacotes próprios.
```

### `references/TESTING_STRATEGY.md`

````markdown
# Estratégia de Testes

## Pirâmide

1. Unitários (Vitest + RTL) — 80%
2. Integration (Vitest + RTL) — 15%
3. Visual Regression (Playwright + Browserstack) — 5%

## Cobertura mínima

Statements: 90% / Branches: 85% / Functions: 90%

## Template

```typescript
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { ComponentName } from './ComponentName'

describe('<ComponentName />', () => {
  describe('Rendering', () => {
    it('should render without errors', () => {
      render(<ComponentName />)
      expect(screen.getByRole('...')).toBeInTheDocument()
    })
  })
  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(<ComponentName />)
      expect(await axe(container)).toHaveNoViolations()
    })
  })
})
```
````

## Visual Regression

- Rodado em CI via Browserstack
- Baseline gerada a partir dos stories do Storybook
- Threshold: 0.1% de diferença aceito
- Stories com estado isolado (sem animações, sem timers)

````

### `references/THEMING.md`

```markdown
# Sistema de Temas

## Estratégia: CSS Custom Properties + HOC

```scss
[data-theme="light"] {
  --ds-color-bg-primary: #ffffff;
  --ds-color-text-primary: #1a1a1a;
  --ds-color-brand-primary: #0066ff;
}
[data-theme="dark"] {
  --ds-color-bg-primary: #0f0f0f;
  --ds-color-text-primary: #f5f5f5;
  --ds-color-brand-primary: #4d94ff;
}
````

## HOC withTheme

```typescript
export const ThemeProvider: React.FC<{
  defaultTheme?: 'light' | 'dark'
  children: React.ReactNode
}> = ({ defaultTheme = 'light', children }) => {
  const [theme, setTheme] = useState(defaultTheme)
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <div data-theme={theme}>{children}</div>
    </ThemeContext.Provider>
  )
}

export function withTheme<P extends object>(Component: React.ComponentType<P>) {
  const WithTheme = (props: P) => {
    const { theme } = useTheme()
    return <Component {...props} data-theme={theme} />
  }
  WithTheme.displayName = `withTheme(${Component.displayName})`
  return WithTheme
}
```

````

---

## 8. MCPs recomendados

```bash
# Context7 — docs atualizadas de Radix, shadcn, Storybook em tempo real
agy mcp add context7 -- npx -y @upstash/context7-mcp

# GitHub MCP — criar issues, PRs, gerenciar branches
agy mcp add github
````

No `.agent/workflows/plan.md`, instrua o agente a usar o Context7:

```markdown
Use a ferramenta `resolve-library-id` do Context7 para buscar documentação atualizada de:

- radix-ui/{componente}
- shadcn/ui
- storybookjs/storybook
- testing-library/react
```

---

## 9. Configuração do Monorepo

### `turbo.json`

```json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": { "dependsOn": ["^build"], "outputs": ["dist/**"] },
    "test": { "dependsOn": ["^build"] },
    "storybook": { "cache": false, "persistent": true },
    "lint": {}
  }
}
```

### Pacotes e quando separar

| Pacote         | Conteúdo                                | Motivo                      |
| -------------- | --------------------------------------- | --------------------------- |
| `@ds/core`     | Button, Input, Tag, Avatar, Card, Modal | Base sem deps pesadas       |
| `@ds/carousel` | Carousel (Embla)                        | Embla ~15kb — opcional      |
| `@ds/docs`     | Storybook                               | Nunca publicado como pacote |

---

## 10. Ordem de execução sugerida

```
Semana 1 — Fundação
├── Setup manual do repo (turbo, tsconfig, eslint, prettier, husky)
├── /spec — gerar SPEC.md
├── /break — gerar issues
├── /plan 001 → /execute 001 — Monorepo setup
└── /plan 002 → /execute 002 — Design Tokens

Semana 2 — Infraestrutura de componentes
├── /plan 003 → /execute 003 — Theme system (HOC withTheme)
├── /plan 004 → /execute 004 — Button (valida todo o fluxo)
└── /plan 012 → /execute 012 — Storybook setup

Semana 3 — Componentes de formulário
├── /plan 005 → /execute 005 — Input
├── /plan 006 → /execute 006 — Textarea
└── /plan 007 → /execute 007 — Dropdown (Radix Select)

Semana 4 — Componentes de UI
├── /plan 008 → /execute 008 — Modal (Radix Dialog)
├── /plan 009 → /execute 009 — Card
├── /plan 010 → /execute 010 — Tag
└── /plan 011 → /execute 011 — Avatar

Semana 5 — Qualidade
├── Visual Regression (Playwright + Browserstack)
├── CI/CD
└── npm publish / GitHub Packages
```

---

## 11. Template de issue

### `.epic/issues/004_button_component.md`

```markdown
# 004 — Button Component

## Status

[ ] Planejada [ ] Em desenvolvimento [ ] Concluída

## Objetivo

Implementar o componente `Button` com variantes, tamanhos, estados e pattern `asChild`.

## Critérios de Aceite

- [ ] Variantes: primary, secondary, ghost, danger
- [ ] Tamanhos: sm, md, lg
- [ ] Estados: default, hover, focus, active, disabled, loading
- [ ] Pattern asChild via @radix-ui/react-slot
- [ ] forwardRef implementado
- [ ] Cobertura ≥ 90%
- [ ] Story para cada variante e estado
- [ ] Zero violações axe
- [ ] Keyboard: Enter e Space ativam o botão

## Props

| Prop     | Tipo                                            | Default   | Descrição              |
| -------- | ----------------------------------------------- | --------- | ---------------------- |
| variant  | 'primary' \| 'secondary' \| 'ghost' \| 'danger' | 'primary' | Variante visual        |
| size     | 'sm' \| 'md' \| 'lg'                            | 'md'      | Tamanho                |
| disabled | boolean                                         | false     | Estado desabilitado    |
| loading  | boolean                                         | false     | Estado de carregamento |
| asChild  | boolean                                         | false     | Herda o elemento filho |

## Arquivos a Criar

- `packages/core/src/components/Button/Button.tsx`
- `packages/core/src/components/Button/Button.test.tsx`
- `packages/core/src/components/Button/Button.stories.tsx`
- `packages/core/src/components/Button/Button.module.scss`
- `packages/core/src/components/Button/index.ts`

## Dependências Externas

- `@radix-ui/react-slot`
- `clsx`
- `class-variance-authority`

## Depende de

#001 (monorepo), #002 (tokens), #003 (themes)

## Estimativa

M
```

---

## Resumo: o que criar agora

```bash
mkdir -p .agent/workflows .agent/rules \
  .agent/skills/component-builder \
  .agent/skills/test-writer \
  .epic/issues references

touch AGENTS.md SPEC.md
touch references/{ARCHITECTURE,DESIGN_TOKENS,COMPONENT_SPEC,TESTING_STRATEGY,THEMING,WORKFLOW,ACCESSIBILITY}.md
touch .agent/workflows/{spec,break,plan,execute,test,story,review}.md
touch .agent/skills/component-builder/SKILL.md
touch .agent/skills/test-writer/SKILL.md

# Primeiro passo no Antigravity CLI:
agy
# > /spec
```

**O maior erro é pular para o /execute sem um SPEC.md sólido.**
Invista nas fases Spec e Plan — é onde o agente performa melhor e onde você economiza mais retrabalho.
