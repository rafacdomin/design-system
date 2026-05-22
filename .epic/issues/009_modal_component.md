# #009 — Componente: Modal (Dialog)

## Status

`[ ] A Fazer` `[ ] Em progresso` `[ ] Concluído`

## Objetivo

Implementar o componente `Modal` encapsulando os primitivos do `@radix-ui/react-dialog`. O modal deve fornecer um contêiner flutuante com fundo escurecido (overlay), foco retido (focus trapping) e fechamento por atalhos de teclado (Escape) de forma totalmente acessível.

## Critérios de Aceite

- [ ] Implementar estrutura do modal utilizando `@radix-ui/react-dialog` (Root, Trigger, Portal, Overlay, Content, Title, Description, Close).
- [ ] Aplicar estilo monocromático: overlay escuro translúcido, caixa de diálogo com fundo plano (`--ds-color-neutral-0`), bordas com raio `--ds-border-radius-lg`.
- [ ] Fornecer botão visual claro no canto superior direito do modal para fechamento (ícone "X" com `aria-label="Fechar"`).
- [ ] Suportar tamanhos pré-definidos: `sm` (estreito), `md` (padrão) e `lg` (largo).
- [ ] Garantir o focus trap automático (o foco não pode sair do modal via `Tab` enquanto aberto) e fechar o modal ao pressionar `Escape` ou clicar fora do conteúdo.
- [ ] Garantir o retorno do foco do teclado para o elemento gatilho após o fechamento.
- [ ] Escrever testes RTL verificando a exibição/ocultação ao interagir com o gatilho/fechar, além de testes a11y via `jest-axe`.

## Props

| Prop           | Tipo                      | Default | Descrição                                                                       |
| -------------- | ------------------------- | ------- | ------------------------------------------------------------------------------- |
| `open`         | `boolean`                 | -       | Controle manual de abertura (modo controlado)                                   |
| `onOpenChange` | `(open: boolean) => void` | -       | Callback invocado na alteração do estado de abertura                            |
| `title`        | `string`                  | -       | Título textual do modal (obrigatório para fins de semântica e leitores de tela) |
| `description`  | `string`                  | -       | Descrição auxiliar do modal                                                     |
| `trigger`      | `React.ReactNode`         | -       | Elemento clicável que dispara a abertura do modal                               |
| `size`         | `'sm' \| 'md' \| 'lg'`    | `'md'`  | Largura do modal                                                                |
| `children`     | `React.ReactNode`         | -       | Conteúdo interno da janela do modal                                             |

## Cenários de Teste

- [ ] O modal não deve estar visível no DOM inicialmente (se `defaultOpen` for false).
- [ ] Interagir com o gatilho renderiza o modal e seu conteúdo no DOM.
- [ ] Pressionar `Escape` ou clicar no botão fechar remove o modal do DOM.
- [ ] Foco é retido dentro do modal ao navegar por `Tab`.
- [ ] Livre de erros de acessibilidade (`jest-axe`).

## Arquivos a Criar

- `packages/core/src/components/Modal/Modal.tsx`
- `packages/core/src/components/Modal/Modal.test.tsx`
- `packages/core/src/components/Modal/Modal.stories.tsx`
- `packages/core/src/components/Modal/Modal.module.scss`
- `packages/core/src/components/Modal/index.ts`

## Dependências Externas

- `@radix-ui/react-dialog`

## Dependências de Issues

#001 (Monorepo), #002 (Tokens), #003 (Themes)

## Estimativa

M
