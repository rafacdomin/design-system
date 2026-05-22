# #003 — Sistema de Temas (ThemeProvider & HOC)

## Status

`[ ] A Fazer` `[ ] Em progresso` `[ ] Concluído`

## Objetivo

Criar o provedor de tema (`ThemeProvider`) e o Higher-Order Component (`withTheme`) no pacote `@ds/core`, gerenciando a aplicação e alternância do atributo `data-theme` no DOM de forma tipada e reativa.

## Critérios de Aceite

- [ ] Criar o contexto do React (`ThemeContext`) que mantém o estado do tema (`'light' | 'dark'`) e uma função para alternar o tema (`setTheme`).
- [ ] Criar o componente `ThemeProvider` que injeta o `ThemeContext.Provider` e renderiza um elemento container contendo o atributo `data-theme={theme}`.
- [ ] Criar o hook personalizado `useTheme` para consumir o tema atual e a função de atualização em componentes internos.
- [ ] Criar o HOC `withTheme` que envolve um componente genérico e passa a propriedade `data-theme` baseada no tema atual.
- [ ] Garantir tipagem estrita com TypeScript para as props do HOC (`withTheme`).
- [ ] Criar testes unitários para validar que o `ThemeProvider` aplica o atributo `data-theme` correto no elemento HTML/DOM e que é possível alternar o tema via botão de toggle.
- [ ] Exportar `ThemeProvider`, `withTheme` e `useTheme` no `index.ts` do `@ds/core`.

## Cenários de Validação

- [ ] Fazer render de um elemento envolvido no `ThemeProvider` no RTL e validar se o container pai tem `data-theme="light"`.
- [ ] Invocar a função para alterar para `dark` e validar que o container muda para `data-theme="dark"`.

## Arquivos a Criar/Modificar

- `packages/core/src/themes/ThemeContext.ts` (Criar)
- `packages/core/src/themes/ThemeProvider.tsx` (Criar)
- `packages/core/src/themes/withTheme.tsx` (Criar)
- `packages/core/src/themes/useTheme.ts` (Criar)
- `packages/core/src/themes/themes.test.tsx` (Criar)
- `packages/core/src/index.ts` (Modificar para exportar hooks, provider e HOC)

## Dependências Externas

- `react`, `react-dom`

## Dependências de Issues

#001 (Monorepo), #002 (Tokens)

## Estimativa

P
