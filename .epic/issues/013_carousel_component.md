# #013 — Componente: Carousel (Embla)

## Status

`[ ] A Fazer` `[ ] Em progresso` `[x] Concluído`

## Objetivo

Implementar o componente `Carousel` para exibição sequencial de slides ou imagens de projetos no portfólio. Este componente será criado em um pacote separado (`@ds/carousel`) devido à dependência do `embla-carousel-react`, visando a otimização de bundle sizes conforme a arquitetura.

## Critérios de Aceite

- [x] Inicializar o pacote `@ds/carousel` em `packages/carousel` com seu respectivo `package.json` dependente de `embla-carousel-react`.
- [x] Implementar o componente `Carousel` integrando o hook `useEmblaCarousel`.
- [x] Fornecer navegação através de botões de setas Anterior/Próximo e indicadores de pontos (dots/paginação) opcionais no rodapé do carrossel.
- [x] Suportar propriedade `autoplay` opcional utilizando o plugin `embla-carousel-autoplay` ou implementação reativa de timer do React (com limpeza do timer no desmonte).
- [x] Acessibilidade robusta:
  - Teclas de setas esquerda/direita do teclado navegam entre slides quando o carrossel está focado.
  - Slides devem ter `role="group"`, `aria-roledescription="slide"` e rótulos acessíveis descritivos (ex: "Slide 1 de 5").
  - Botões de navegação e dots devem ter `aria-label` adequados e indicar o estado ativo/selecionado com `aria-current="true"` ou similar.
- [x] Escrever testes unitários e histórias cobrindo renderização, navegação e interações de teclado.

## Props

| Prop               | Tipo                                                               | Default | Descrição                                                          |
| ------------------ | ------------------------------------------------------------------ | ------- | ------------------------------------------------------------------ |
| `children`         | `React.ReactNode[]`                                                | -       | Lista de elementos/slides a exibir                                 |
| `showArrows`       | `boolean`                                                          | `true`  | Exibe setas de navegação nas laterais                              |
| `showDots`         | `boolean`                                                          | `true`  | Exibe dots de paginação no rodapé                                  |
| `autoplay`         | `boolean`                                                          | `false` | Se verdadeiro, avança slides automaticamente em intervalos fixos   |
| `autoplayInterval` | `number`                                                           | `4000`  | Intervalo em milissegundos para o autoplay                         |
| `loop`             | `boolean`                                                          | `false` | Se verdadeiro, permite navegação cíclica infinita                  |
| `slidesPerView`    | `number \| { mobile?: number; tablet?: number; desktop?: number }` | -       | Define a quantidade de slides exibidos por view (limites: 1, 2, 3) |

## Cenários de Teste

- [x] Renderiza a quantidade correta de slides.
- [x] Setas e dots efetuam a transição entre slides ao serem clicadas.
- [x] Setas do teclado esquerda/direita navegam entre os slides.
- [x] Limpeza correta de timers se `autoplay` estiver habilitado.
- [x] Sem violações no axe.

## Arquivos a Criar

- `packages/carousel/package.json` (Modificar/Criar dependência)
- `packages/carousel/src/components/Carousel/Carousel.tsx`
- `packages/carousel/src/components/Carousel/Carousel.test.tsx`
- `packages/carousel/src/components/Carousel/Carousel.stories.tsx`
- `packages/carousel/src/components/Carousel/Carousel.module.scss`
- `packages/carousel/src/components/Carousel/index.ts`
- `packages/carousel/src/index.ts`

## Dependências Externas

- `embla-carousel-react`

## Dependências de Issues

#001 (Monorepo), #002 (Tokens), #003 (Themes), #004 (Storybook)

## Estimativa

G

## Pesquisa

### Embla Carousel React Hook

O Embla Carousel é a biblioteca recomendada por ser agnóstica e extremamente performática. A integração no React é feita via hook:

```typescript
import useEmblaCarousel from 'embla-carousel-react'

// Uso básico:
const [emblaRef, emblaApi] = useEmblaCarousel(options)
```

### Acessibilidade (WAI-ARIA Carousel Pattern)

Para conformidade com WCAG 2.1 AA:

1. **Container Principal (`role="region"`, `aria-roledescription="carousel"`)**: Identifica o carrossel. Deve conter um `aria-label` descritivo.
2. **Slides (`role="group"`, `aria-roledescription="slide"`, `aria-label="N de M"`)**: Identifica cada slide. O slide ativo deve ter `aria-hidden="false"`, e os inativos `aria-hidden="true"` se houver foco dentro.
3. **Controles**: Botões de navegação devem conter `aria-label` ("Slide anterior", "Próximo slide") e `aria-controls` apontando para o contêiner de slides. Dots de paginação devem indicar o estado ativo com `aria-current="true"`.
4. **Navegação por Teclado**: O carrossel deve interceptar eventos de teclas `ArrowLeft` e `ArrowRight` quando focado, efetuando a transição correspondente.
5. **Autoplay**: Deve pausar ao passar o mouse (`mouseenter`) ou receber foco (`focus`), retomando após sair (`mouseleave` / `blur`).

---

## Implementação Planejada

### Estrutura de Arquivos

```text
packages/carousel/
├── package.json
├── tsconfig.json
├── vitest.config.ts
└── src/
    ├── index.ts
    ├── setupTests.ts
    └── components/
        └── Carousel/
            ├── Carousel.tsx
            ├── Carousel.module.scss
            ├── Carousel.test.tsx
            └── index.ts
```

E em `packages/docs/src/stories/Carousel.stories.tsx` para documentação no Storybook.

### Tipagem e API Proposta

```typescript
export interface CarouselProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode[]
  showArrows?: boolean
  showDots?: boolean
  autoplay?: boolean
  autoplayInterval?: number
  loop?: boolean
}

export interface CarouselContentProps extends React.HTMLAttributes<HTMLDivElement> {}
export interface CarouselItemProps extends React.HTMLAttributes<HTMLDivElement> {
  index: number
}
export interface CarouselPreviousProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}
export interface CarouselNextProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}
export interface CarouselDotsProps extends React.HTMLAttributes<HTMLDivElement> {}
```

---

## Decisões Técnicas

1. **Dependência Externa (@ds/carousel)**: Criado como pacote separado para evitar inflar o bundle size do `@ds/core` com o `embla-carousel-react`.
2. **Autoplay Nativo via React (setInterval)**: Optamos por implementar o autoplay reativamente usando `setInterval` no React, facilitando o controle de estados, pausa sob interações (hover/focus) e testes unitários via `vi.useFakeTimers()`, sem a necessidade de dependências adicionais como `embla-carousel-autoplay`.
3. **Compound Component Pattern**: Implementação usando `Object.assign` para expor componentes filhos. O componente `<Carousel>` fornecerá o contexto implicitamente, permitindo tanto o uso flexível (Compound) quanto o uso rápido via props (`showArrows`, `showDots`).

---

## Checklist de Implementação

- [x] 1. Configurar dependências e scripts em `packages/carousel/package.json` (incluir `@ds/core`, `embla-carousel-react`, `vitest`, etc.).
- [x] 2. Adicionar `@ds/carousel` no `package.json` do storybook (`packages/docs`).
- [x] 3. Criar `packages/carousel/vitest.config.ts` herdando regras e integrando suporte a react.
- [x] 4. Criar `packages/carousel/src/setupTests.ts` configurando `jest-axe`.
- [x] 5. Criar `CarouselContext` para compartilhar referência e estado do Embla Carousel.
- [x] 6. Escrever o teste inicial (TDD) para validar renderização básica em `Carousel.test.tsx`.
- [x] 7. Criar `Carousel.tsx` estruturando a API Compound (Content, Item, Previous, Next, Dots) e exportando com `withTheme` e `Object.assign`.
- [x] 8. Implementar hook `useEmblaCarousel` na raiz do componente e prover APIs de navegação no contexto.
- [x] 9. Escrever testes unitários em `Carousel.test.tsx` cobrindo comportamento de clique nos botões de setas.
- [x] 10. Implementar componentes `Carousel.Previous` e `Carousel.Next` consumindo a API Embla do contexto.
- [x] 11. Escrever testes unitários para os Dots de paginação e validação do index ativo.
- [x] 12. Implementar componente `Carousel.Dots` gerando dots dinamicamente com base em `scrollSnapList`.
- [x] 13. Escrever testes unitários cobrindo navegação por teclado (ArrowLeft/ArrowRight).
- [x] 14. Implementar listener `onKeyDown` no wrapper principal do Carousel para gerenciar navegação por setas.
- [x] 15. Escrever testes de acessibilidade estrutural (a11y) validando `role`, `aria-roledescription` e conformidade com `jest-axe`.
- [x] 16. Implementar propriedades ARIA corretas nos slides e botões.
- [x] 17. Escrever testes para funcionalidade de Autoplay (incluindo mock de timers e limpeza ao desmontar).
- [x] 18. Implementar o Autoplay reativo no React com controle de mouseenter/mouseleave e focus/blur.
- [x] 19. Criar `Carousel.module.scss` estendendo os design tokens globais com variáveis CSS customizadas.
- [x] 20. Criar `packages/docs/src/stories/Carousel.stories.tsx` para apresentar histórias do Carousel no Storybook.
- [x] 21. Executar `pnpm lint` e `pnpm test` e verificar cobertura de código e build geral da aplicação.
