# Design System — Contexto para Antigravity CLI ou qualquer Agente

## O que é este projeto

Mini design system de portfólio.
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

1. Todo componente DEVE ter: `.tsx`, `.test.tsx`, `.module.scss`, `index.ts`
2. Testes vêm ANTES da implementação (TDD)
3. Acessibilidade WCAG 2.1 AA é requisito, não feature
4. Zero `any` no TypeScript (proibido usar `any` em assinaturas, variáveis, mocks, retornos ou asserções de tipo como `as any`; utilize tipos estritos ou `unknown` se necessário)
5. Props tipadas com interface, nunca type alias para componentes
6. Exports apenas pelo `index.ts` de cada componente
7. Temas via HOC `withTheme`, nunca hardcoded
8. SCSS: usar apenas CSS custom properties dos tokens, nunca valores literais
9. Padrão Compound: Componentes compostos (ex: Dropdown e itens, Input e slots de ícone) DEVEM utilizar o Compound Component Pattern via `Object.assign`. Subcomponentes não devem ser exportados separadamente no `index.ts` de exportação e seus `displayName`s devem refletir a hierarquia do componente pai (ex: `'Dropdown.Item'`, `'Input.StartIcon'`).

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

## Referências externas

Consulte `references/INSPIRATIONS.md` antes de tomar decisões de API de componente,
nomenclatura de props ou comportamento de acessibilidade.
