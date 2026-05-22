# #008 — Componente: Dropdown (Select)

## Status

`[ ] A Fazer` `[ ] Em progresso` `[ ] Concluído`

## Objetivo

Implementar o componente `Dropdown` (Select) encapsulando os primitivos do `@radix-ui/react-select`. O componente deve suportar renderização estilizada monocromática, placeholders, suporte a estados de erro e acessibilidade nativa via teclado.

## Critérios de Aceite

- [ ] Criar o componente de seleção customizado utilizando `@radix-ui/react-select` (Trigger, Value, Icon, Portal, Content, Viewport, Item, ItemText).
- [ ] Aplicar estilo monocromático customizado (bordas angulares `--ds-border-radius-sm`, cores neutras para o menu overlay).
- [ ] Suportar propriedades `label`, `error`, `helperText` e `disabled` integradas de forma consistente aos componentes `Input`/`Textarea`.
- [ ] Suporte nativo a navegação por teclado (WAI-ARIA Select): setas para navegar, `Enter` / `Espaço` para abrir/selecionar, `Escape` para fechar.
- [ ] Permitir a passagem de um array de opções tipadas (`DropdownOption`).
- [ ] Criar testes cobrindo renderização, seleção de itens através de simulação de cliques/teclado e validações `jest-axe`.

## Props

| Prop           | Tipo                      | Default | Descrição                                                              |
| -------------- | ------------------------- | ------- | ---------------------------------------------------------------------- |
| `label`        | `string`                  | -       | Rótulo exibido acima do dropdown                                       |
| `placeholder`  | `string`                  | -       | Texto padrão quando nenhuma opção estiver selecionada                  |
| `options`      | `DropdownOption[]`        | -       | Lista de opções `{ label: string, value: string, disabled?: boolean }` |
| `value`        | `string`                  | -       | Valor selecionado (modo controlado)                                    |
| `defaultValue` | `string`                  | -       | Valor selecionado inicialmente (modo não controlado)                   |
| `onChange`     | `(value: string) => void` | -       | Callback acionado na alteração do valor                                |
| `error`        | `string`                  | -       | Mensagem de erro que altera a cor das bordas                           |
| `disabled`     | `boolean`                 | `false` | Se verdadeiro, impede interações                                       |

## Cenários de Teste

- [ ] Exibe o placeholder inicialmente se não houver valor.
- [ ] Clicar no gatilho abre o menu flutuante exibindo as opções.
- [ ] Selecionar uma opção fecha o menu e altera o texto do gatilho para o valor selecionado.
- [ ] Acessibilidade por teclado e axe compliance.

## Arquivos a Criar

- `packages/core/src/components/Dropdown/Dropdown.tsx`
- `packages/core/src/components/Dropdown/Dropdown.test.tsx`
- `packages/core/src/components/Dropdown/Dropdown.stories.tsx`
- `packages/core/src/components/Dropdown/Dropdown.module.scss`
- `packages/core/src/components/Dropdown/index.ts`

## Dependências Externas

- `@radix-ui/react-select`

## Dependências de Issues

#001 (Monorepo), #002 (Tokens), #003 (Themes)

## Estimativa

M
