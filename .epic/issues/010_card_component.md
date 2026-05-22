# #010 — Componente: Card

## Status
`[ ] A Fazer`  `[ ] Em progresso`  `[ ] Concluído`

## Objetivo
Implementar o componente container `Card` seguindo TDD. Ele será utilizado para estruturar sessões e blocos de projetos no portfólio, oferecendo variantes visuais e suporte a interações (hover/elevação de alto contraste).

## Critérios de Aceite
- [ ] Criar o componente Card que atua como wrapper HTML `<div>` polimórfico (`asChild` opcional).
- [ ] Variantes estéticas: `flat` (fundo cinza neutro plano), `bordered` (borda fina sem fundo ou com fundo plano) e `elevated` (sombra sutil).
- [ ] Propriedade `interactive` (booleano): se verdadeiro, adiciona cursor pointer, efeito de hover suave que aumenta ligeiramente a elevação da sombra (`--ds-shadow-md`) e altera levemente as cores de borda/fundo.
- [ ] Garantir que o componente Card se adapte ao tema light/dark através dos tokens CSS.
- [ ] Encaminhamento de referências com `forwardRef`.
- [ ] Testes unitários de renderização e acessibilidade.

## Props
| Prop | Tipo | Default | Descrição |
|------|------|---------|-----------|
| `variant` | `'flat' \| 'bordered' \| 'elevated'` | `'bordered'` | Variante visual estética |
| `interactive` | `boolean` | `false` | Se verdadeiro, adiciona cursor de clique e efeitos de hover de elevação |
| `asChild` | `boolean` | `false` | Delega a renderização ao elemento filho |

## Cenários de Teste
- [ ] Renderiza com o conteúdo interno (children).
- [ ] Se for `interactive`, ao receber foco (via teclado), exibe um anel de foco bem definido.
- [ ] Livre de erros no axe test.

## Arquivos a Criar
- `packages/core/src/components/Card/Card.tsx`
- `packages/core/src/components/Card/Card.test.tsx`
- `packages/core/src/components/Card/Card.stories.tsx`
- `packages/core/src/components/Card/Card.module.scss`
- `packages/core/src/components/Card/index.ts`

## Dependências de Issues
#001 (Monorepo), #002 (Tokens), #003 (Themes)

## Estimativa
P
