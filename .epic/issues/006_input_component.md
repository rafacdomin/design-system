# #006 — Componente: Input

## Status

`[ ] A Fazer` `[ ] Em progresso` `[ ] Concluído`

## Objetivo

Implementar o componente `Input` para entrada de texto em formulários seguindo TDD. O componente deve suportar labels associadas, ícones no início/fim do campo, mensagens de ajuda (helper texts) e estados de validação de erro de forma acessível.

## Critérios de Aceite

- [ ] Renderizar elemento `<input>` nativo envolvido em uma estrutura que suporta label flutuante ou estático acima do campo.
- [ ] Suportar propriedades de ícone inicial (`startIcon`) e ícone final (`endIcon`).
- [ ] Suportar propriedade `error` que altera a cor de borda para vermelho (`--ds-color-danger`) e renderiza uma mensagem de erro abaixo do campo.
- [ ] Suportar propriedade `helperText` para exibir texto de instrução abaixo do campo (quando não houver erro).
- [ ] Associação explícita do rótulo visual (label) com o input através de `htmlFor` / `id`.
- [ ] Definição adequada de `aria-invalid="true"` e vinculação do erro e helperText através de `aria-describedby` para leitores de tela.
- [ ] Encaminhamento de referências através do `forwardRef`.
- [ ] Testes cobrindo digitação (`userEvent.type`), estados de erro, disabled e conformidade a11y com `jest-axe`.

## Props

| Prop         | Tipo              | Default | Descrição                                                           |
| ------------ | ----------------- | ------- | ------------------------------------------------------------------- |
| `label`      | `string`          | -       | Rótulo do campo                                                     |
| `error`      | `string`          | -       | Mensagem de erro que altera o estado do campo e é exibida no rodapé |
| `helperText` | `string`          | -       | Texto de ajuda exibido abaixo do input                              |
| `startIcon`  | `React.ReactNode` | -       | Ícone posicionado no início do input                                |
| `endIcon`    | `React.ReactNode` | -       | Ícone posicionado no fim do input                                   |

## Cenários de Teste

- [ ] Digitar no input atualiza seu valor corretamente.
- [ ] Exibe a mensagem de erro se a prop `error` for fornecida, e aplica borda de perigo.
- [ ] Desabilita o input e impede interação se `disabled` for verdadeiro.
- [ ] Garante que leitor de tela anuncia o erro através de `aria-describedby`.

## Arquivos a Criar

- `packages/core/src/components/Input/Input.tsx`
- `packages/core/src/components/Input/Input.test.tsx`
- `packages/core/src/components/Input/Input.stories.tsx`
- `packages/core/src/components/Input/Input.module.scss`
- `packages/core/src/components/Input/index.ts`

## Dependências de Issues

#001 (Monorepo), #002 (Tokens), #003 (Themes), #005 (Button)

## Estimativa

M
