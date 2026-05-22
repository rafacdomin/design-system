# #012 — Componente: Avatar

## Status
`[ ] A Fazer`  `[ ] Em progresso`  `[ ] Concluído`

## Objetivo
Implementar o componente `Avatar` para exibir a foto de perfil do autor ou imagens redondas de usuários. O componente deve prever um estado de fallback (iniciais) com renderização elegante quando a imagem falhar ou não for fornecida.

## Critérios de Aceite
- [ ] Renderizar imagem circular (`--ds-border-radius-full`).
- [ ] Suportar propriedades `src` (URL da foto), `alt` (texto descritivo) e `fallback` (texto de iniciais, ex: "RD").
- [ ] Implementar carregamento assíncrono: enquanto a imagem carrega ou caso ocorra erro no carregamento, exibir container com as iniciais (`fallback`) centralizadas.
- [ ] O container de fallback deve ter fundo contrastante (preto no light e branco no dark, ou tons neutros proeminentes) e tipografia em `Poppins` negrito.
- [ ] Tamanhos pré-definidos: `sm` (24px), `md` (40px) e `lg` (64px).
- [ ] Acessibilidade: a imagem deve conter o atributo `alt` consistente. Se a imagem falhar, o fallback deve ter papel de imagem `role="img"` com `aria-label` apropriado.
- [ ] Escrever testes unitários validando a transição de carregamento, fallback por erro e conformidade a11y.

## Props
| Prop | Tipo | Default | Descrição |
|------|------|---------|-----------|
| `src` | `string` | - | URL da imagem do avatar |
| `alt` | `string` | - | Descrição acessível da imagem (obrigatório) |
| `fallback` | `string` | - | Iniciais a serem mostradas em caso de falha/ausência de imagem |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Tamanho do avatar |

## Cenários de Teste
- [ ] Exibe a imagem caso o carregamento seja bem sucedido.
- [ ] Exibe o fallback com as iniciais caso `src` seja omitido ou a imagem falhe em carregar (`trigger onError`).
- [ ] A acessibilidade (`jest-axe`) passa em todos os estados de carregamento e fallback.

## Arquivos a Criar
- `packages/core/src/components/Avatar/Avatar.tsx`
- `packages/core/src/components/Avatar/Avatar.test.tsx`
- `packages/core/src/components/Avatar/Avatar.stories.tsx`
- `packages/core/src/components/Avatar/Avatar.module.scss`
- `packages/core/src/components/Avatar/index.ts`

## Dependências de Issues
#001 (Monorepo), #002 (Tokens), #003 (Themes)

## Estimativa
P
