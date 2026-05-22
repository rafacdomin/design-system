# #011 — Componente: Tag

## Status

`[ ] A Fazer` `[ ] Em progresso` `[ ] Concluído`

## Objetivo

Implementar o componente `Tag` (Badge) para rotulagem de categorias ou tecnologias no portfólio. Deve suportar variantes visuais, tamanhos e opção para comportamento removível/interativo.

## Critérios de Aceite

- [ ] Criar componente Tag como elemento `<span>` (ou `<button>` se for interativo).
- [ ] Variantes estéticas: `neutral` (fundo cinza sutil, texto escuro), `outline` (borda fina sem fundo) e `interactive` (adiciona hover e comportamento clicável).
- [ ] Tamanhos: `sm` (pequeno) e `md` (médio).
- [ ] Suportar prop `onRemove` (callback). Se fornecido, exibe um ícone de fechar (X) acionável à direita do texto.
- [ ] No caso de ser removível, o botão de remoção interno deve ter acessibilidade garantida: tag `aria-label="Remover [nome da tag]"` e ser focável/ativável via teclado.
- [ ] Escrever testes unitários verificando a renderização, ativação do clique e a chamada do `onRemove`.

## Props

| Prop       | Tipo                                      | Default     | Descrição                             |
| ---------- | ----------------------------------------- | ----------- | ------------------------------------- |
| `variant`  | `'neutral' \| 'outline' \| 'interactive'` | `'neutral'` | Variante visual estética              |
| `size`     | `'sm' \| 'md'`                            | `'md'`      | Tamanho da tag                        |
| `onRemove` | `() => void`                              | -           | Callback opcional para remoção da tag |

## Cenários de Teste

- [ ] Renderiza texto corretamente.
- [ ] Exibe botão de fechar quando `onRemove` for fornecido e dispara o callback ao clicar.
- [ ] Acessibilidade e contraste em ambos os temas atendem WCAG 2.1 AA.

## Arquivos a Criar

- `packages/core/src/components/Tag/Tag.tsx`
- `packages/core/src/components/Tag/Tag.test.tsx`
- `packages/core/src/components/Tag/Tag.stories.tsx`
- `packages/core/src/components/Tag/Tag.module.scss`
- `packages/core/src/components/Tag/index.ts`

## Dependências de Issues

#001 (Monorepo), #002 (Tokens), #003 (Themes)

## Estimativa

P
