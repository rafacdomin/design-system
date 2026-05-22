# #005 — Componente: Button

## Status
`[ ] A Fazer`  `[ ] Em progresso`  `[ ] Concluído`

## Objetivo
Implementar o componente principal `Button` seguindo a metodologia TDD. O componente deve suportar variantes, tamanhos, estados (incluindo `loading` e `disabled`) e polimorfismo via pattern `asChild`.

## Critérios de Aceite
- [ ] Variantes de estilo: `primary` (fundo preto, texto branco / invertido no dark), `secondary` (borda fina com texto de destaque), `ghost` (sem fundo, apenas texto interativo) e `danger` (fundo vermelho).
- [ ] Tamanhos: `sm` (pequeno), `md` (médio/padrão) e `lg` (grande).
- [ ] Estados visuais e interativos completos: `default`, `hover`, `focus` (focus ring visível), `active`, `disabled` e `loading`.
- [ ] Integração do estado `loading`: quando ativo, exibe um indicador de progresso (spinner) sutil ao lado/no lugar do texto e desabilita interações (`pointer-events: none`).
- [ ] Suporte a polimorfismo (`asChild`) utilizando a biblioteca `@radix-ui/react-slot`.
- [ ] Tipagem de props com `interface` TypeScript e exports limpos via `index.ts`.
- [ ] Implementar `forwardRef` para garantir o encaminhamento de referências.
- [ ] Cobertura de testes unitários ≥ 90% cobrindo renderização, cliques, estados e acessibilidade (com `jest-axe`).
- [ ] Navegação por teclado: botão deve ser clicável/ativado via `Enter` e `Espaço`.

## Props
| Prop | Tipo | Default | Descrição |
|------|------|---------|-----------|
| `variant` | `'primary' \| 'secondary' \| 'ghost' \| 'danger'` | `'primary'` | Variante visual estética |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Tamanho vertical e horizontal do botão |
| `loading` | `boolean` | `false` | Se verdadeiro, exibe o spinner e desabilita interações |
| `asChild` | `boolean` | `false` | Se verdadeiro, transfere props e comportamento para o elemento filho |

## Cenários de Teste
### Happy Path
- [ ] Renderiza o botão primário com o texto fornecido.
- [ ] Clicar no botão dispara o evento `onClick`.
- [ ] Sem violações de acessibilidade (`jest-axe`).

### Edge Cases & Estados
- [ ] Quando `disabled` é verdadeiro, cliques não disparam `onClick`.
- [ ] Quando `loading` é verdadeiro, cliques não disparam `onClick` e exibe o spinner de carregamento.
- [ ] Foco visual e anel de foco visíveis no clique do teclado.

## Arquivos a Criar
- `packages/core/src/components/Button/Button.tsx` (Componente)
- `packages/core/src/components/Button/Button.test.tsx` (Testes unitários)
- `packages/core/src/components/Button/Button.stories.tsx` (Stories do Storybook)
- `packages/core/src/components/Button/Button.module.scss` (Estilos)
- `packages/core/src/components/Button/index.ts` (Export)

## Dependências Externas
- `@radix-ui/react-slot`, `clsx`, `class-variance-authority`

## Dependências de Issues
#001 (Monorepo), #002 (Tokens), #003 (Themes), #004 (Storybook)

## Estimativa
M
