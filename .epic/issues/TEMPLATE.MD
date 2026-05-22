# 000 - TEMPLATE DE ISSUE

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
- [ ] Stories do Storybook: Story Playground principal com controls + stories de variações/estados secundários usando a tag `!dev` (ocultas do menu lateral)
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
- `packages/core/src/components/Button/Button.module.scss`
- `packages/core/src/components/Button/index.ts`
- `packages/docs/src/stories/Button.stories.tsx`

## Dependências Externas

- `@radix-ui/react-slot`
- `clsx`
- `class-variance-authority`

## Depende de

#001 (monorepo), #002 (tokens), #003 (themes)

## Estimativa

M
