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
- @radix-ui/* — primitivos acessíveis
- @radix-ui/react-slot — pattern asChild
- class-variance-authority (cva) — variantes type-safe
- clsx — composição de classNames
- embla-carousel-react — apenas no pacote @ds/carousel

## Quando separar em pacote próprio
Dependência > ~10kb gzipped = pacote separado.
Embla (~15kb), Recharts (~300kb) = pacotes próprios.