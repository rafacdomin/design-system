# #007 — Componente: Textarea

## Status
`[ ] A Fazer`  `[ ] Em progresso`  `[ ] Concluído`

## Objetivo
Implementar o componente `Textarea` para entrada de textos longos ou multilinhas, integrando opções de auto-redimensionamento baseado no volume do texto inserido.

## Critérios de Aceite
- [ ] Renderizar elemento `<textarea>` HTML associado a uma label.
- [ ] Suportar propriedades `error` (borda vermelha e texto no rodapé) e `helperText`.
- [ ] Suportar propriedade opcional `autoResize`. Se verdadeiro, o textarea deve aumentar/diminuir sua altura dinamicamente para acomodar o conteúdo digitado (evitando barras de rolagem desnecessárias).
- [ ] Associação a11y via `htmlFor`/`id` e propriedades `aria-invalid` / `aria-describedby`.
- [ ] Encaminhamento de referências com `forwardRef`.
- [ ] Escrever testes unitários e histórias cobrindo os estados do textarea.

## Props
| Prop | Tipo | Default | Descrição |
|------|------|---------|-----------|
| `label` | `string` | - | Rótulo do campo |
| `error` | `string` | - | Mensagem de erro que altera a cor da borda |
| `helperText` | `string` | - | Texto auxiliar de ajuda |
| `autoResize` | `boolean` | `false` | Se verdadeiro, auto-ajusta a altura do campo com base no conteúdo |

## Cenários de Teste
- [ ] Verifica digitação e atualização do valor.
- [ ] Se `autoResize` for ativo, valida que o `scrollHeight` altera o `height` do elemento após inserções de quebras de linha (`\n`).
- [ ] Valida comportamento a11y (axe compliance).

## Arquivos a Criar
- `packages/core/src/components/Textarea/Textarea.tsx`
- `packages/core/src/components/Textarea/Textarea.test.tsx`
- `packages/core/src/components/Textarea/Textarea.stories.tsx`
- `packages/core/src/components/Textarea/Textarea.module.scss`
- `packages/core/src/components/Textarea/index.ts`

## Dependências de Issues
#001 (Monorepo), #002 (Tokens), #003 (Themes), #006 (Input)

## Estimativa
P
