# 021 - Customização de Textos ARIA (core & carousel)

## Status

[ ] Planejada [ ] Em desenvolvimento [x] Concluída

## Objetivo

Tornar os componentes `@ds/core` e `@ds/carousel` locale-agnósticos, permitindo que todas as strings internas descritivas de acessibilidade (ARIA) sejam parametrizadas via props de chamada, com fallbacks automáticos para português se omitidos.

## Critérios de Aceite

- [x] Modificar `Tag` para aceitar a prop opcional `removeAriaLabel: string`.
- [x] No `Tag`, a lógica de fallback se `removeAriaLabel` for omitido deve manter a regra atual (`"Remover " + children` se string, ou `"Remover"`).
- [x] Modificar `Carousel` para aceitar as props opcionais `slideAriaLabelFormat: string` e `dotAriaLabelFormat: string`.
- [x] No `Carousel`, interpolar `{index}` e `{total}` reativamente conforme o snap e slide ativo.
- [x] Cobertura de testes unitários ≥ 90% para os novos fluxos de renderização de ARIA.
- [x] Validar acessibilidade via axe (zero violações).

## Props

### Tag

| Prop            | Tipo   | Default   | Descrição                                        |
| :-------------- | :----- | :-------- | :----------------------------------------------- |
| removeAriaLabel | string | undefined | Rótulo de acessibilidade para o botão de remoção |

### Carousel

| Prop                 | Tipo   | Default                    | Descrição                                               |
| :------------------- | :----- | :------------------------- | :------------------------------------------------------ |
| slideAriaLabelFormat | string | 'Slide {index} de {total}' | Formato de legenda ARIA dos slides                      |
| dotAriaLabelFormat   | string | 'Ir para slide {index}'    | Formato de legenda ARIA dos botões de controle de slide |

## Arquivos a Modificar

- `packages/core/src/components/Tag/Tag.tsx`
- `packages/core/src/components/Tag/Tag.test.tsx`
- `packages/carousel/src/components/Carousel/Carousel.tsx`
- `packages/carousel/src/components/Carousel/Carousel.test.tsx`

## Dependências Externas

Nenhuma

## Depende de

#011 (Tag), #013 (Carousel)

## Estimativa

P

## Pesquisa

A customização e internacionalização de acessibilidade em bibliotecas de componentes (Design Systems) deve priorizar a flexibilidade e evitar o acoplamento com frameworks de tradução específicos.

1. **Padrão WAI-ARIA para Carrosséis (WAI-ARIA APG)**:
   - Slides individuais devem possuir o atributo `role="group"` com um `aria-roledescription="slide"` e um rótulo legível via `aria-label` que situe o usuário do leitor de tela (ex: `"Slide 1 de 3"`).
   - Botões de paginação (dots/bullets) exigem nomes acessíveis para evitar serem anunciados de maneira vaga (ex: "botão"). O rótulo ideal é `"Ir para slide {index}"`.
2. **Abordagem Headless/Locale-Agnostic**:
   - Bibliotecas como Radix UI e React Aria não incluem pacotes de tradução internos. Em vez disso, fornecem propriedades de customização de ARIA ou props de formatação (ex: `aria-label` ou formatos de string contendo chaves como `{index}` e `{total}`).
   - Ao adotar strings de formato como `'Slide {index} de {total}'`, a interpolação em tempo de execução via replace de strings simples evita dependências externas no bundle final, mantendo os componentes leves e universais.
3. **Botão de Ação Oculto em Elementos (Tag Close/Remove)**:
   - Botões de fechamento/remoção que contêm apenas representações gráficas (como um ícone "X") exigem um atributo `aria-label` descritivo. No caso da `Tag`, a prop `removeAriaLabel` permite substituir o fallback estático em português brasileiro.

## Implementação Planejada

### Estrutura de Arquivos

Nenhum arquivo novo será criado. Os seguintes componentes e testes serão atualizados em seus caminhos padrão:

- `packages/core/src/components/Tag/Tag.tsx`
- `packages/core/src/components/Tag/Tag.test.tsx`
- `packages/carousel/src/components/Carousel/Carousel.tsx`
- `packages/carousel/src/components/Carousel/Carousel.test.tsx`

### Modificações no Código

#### 1. `packages/core/src/components/Tag/Tag.tsx`

Definição da nova prop e lógica de fallback para a acessibilidade do botão de remoção:

```typescript
export interface TagProps
  extends
    Omit<React.HTMLAttributes<HTMLSpanElement>, 'onClick' | 'color'>,
    VariantProps<typeof tagVariants> {
  /** Callback acionado ao clicar no botão de remoção */
  onRemove?: () => void
  /** Callback acionado ao clicar na tag interativa */
  onClick?: (
    event: React.MouseEvent<HTMLButtonElement | HTMLSpanElement>
  ) => void
  /** Rótulo de acessibilidade personalizado para o botão de remoção */
  removeAriaLabel?: string
}

// ...
const removeLabel =
  removeAriaLabel ||
  (typeof children === 'string' ? `Remover ${children}` : 'Remover')
```

#### 2. `packages/carousel/src/components/Carousel/Carousel.tsx`

Definição das props de formatação ARIA no componente pai e fornecimento dos valores através do Contexto para que sejam consumidos pelos subcomponentes `Carousel.Item` e `Carousel.Dots`:

```typescript
export interface CarouselProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode[]
  showArrows?: boolean
  showDots?: boolean
  autoplay?: boolean
  autoplayInterval?: number
  loop?: boolean
  slidesPerView?:
    | number
    | { mobile?: number; tablet?: number; desktop?: number }
  prevAriaLabel?: string
  nextAriaLabel?: string
  /** Formato de legenda ARIA dos slides (ex: 'Slide {index} de {total}') */
  slideAriaLabelFormat?: string
  /** Formato de legenda ARIA dos botões de controle de slide (ex: 'Ir para slide {index}') */
  dotAriaLabelFormat?: string
}

interface CarouselContextValue {
  // ... existing context properties ...
  slideAriaLabelFormat: string
  dotAriaLabelFormat: string
}

// No CarouselComponent
const CarouselComponent = React.forwardRef<HTMLDivElement, CarouselProps>(
  (
    {
      children,
      showArrows = true,
      showDots = true,
      autoplay = false,
      autoplayInterval = 4000,
      loop = false,
      slidesPerView,
      className,
      prevAriaLabel = 'Slide anterior',
      nextAriaLabel = 'Próximo slide',
      slideAriaLabelFormat = 'Slide {index} de {total}',
      dotAriaLabelFormat = 'Ir para slide {index}',
      ...props
    },
    ref
  ) => {
    // ... logic ...
    const contextValue: CarouselContextValue = {
      // ... existing value properties ...
      slideAriaLabelFormat,
      dotAriaLabelFormat,
    }
    // ...
  }
)

// No CarouselItemComponent
const CarouselItemComponent = React.forwardRef<
  HTMLDivElement,
  CarouselItemProps
>(({ className, index, children, ...props }, ref) => {
  const { slidesInView, totalSlides, slideAriaLabelFormat } = useCarousel()
  const isInView = slidesInView.includes(index)
  const slideLabel = slideAriaLabelFormat
    .replace('{index}', String(index + 1))
    .replace('{total}', String(totalSlides))

  return (
    <div
      ref={ref}
      className={clsx(styles.slide, className)}
      role="group"
      aria-roledescription="slide"
      aria-label={slideLabel}
      aria-hidden={!isInView ? 'true' : undefined}
      {...props}
    >
      {children}
    </div>
  )
})

// No CarouselDotsComponent
const CarouselDotsComponent = React.forwardRef<
  HTMLDivElement,
  CarouselDotsProps
>((({ className, ...props }, ref) => {
  const { scrollSnaps, selectedIndex, scrollTo, contentId, dotAriaLabelFormat } = useCarousel()

  if (scrollSnaps.length <= 1) return null

  return (
    <div ref={ref} className={clsx(styles.dots, className)} {...props}>
      {scrollSnaps.map((_, index) => {
        const isActive = index === selectedIndex
        const dotLabel = dotAriaLabelFormat.replace('{index}', String(index + 1))

        return (
          <button
            key={index}
            type="button"
            className={clsx(styles.dot, isActive && styles.active)}
            onClick={() => scrollTo(index)}
            aria-label={dotLabel}
            aria-current={isActive ? 'true' : undefined}
            aria-controls={contentId}
          />
        )
      })}
    </div>
  )
}))
```

## Decisões Técnicas

1. **Abordagem Locale-Agnóstica (Isolamento de i18n)**:
   - A inclusão direta de bibliotecas de internacionalização (como `i18next` ou `react-intl`) nos pacotes de componentes `@ds/core` e `@ds/carousel` geraria acoplamento desnecessário, dependências pesadas em tempo de execução e aumentaria o tamanho final do bundle.
   - Manter as bibliotecas de componentes agnósticas a i18n garante que os consumidores possam integrar seus próprios ecossistemas de i18n passando os textos customizados via props normais.
2. **Propriedades de Formato Declarativo (Interpoladores de String)**:
   - _Alternativa_: Receber funções callback nas props, por exemplo: `slideAriaLabel={(index, total) => string}`.
     - _Decisão de descarte_: Embora ofereça grande flexibilidade, funções callbacks não podem ser facilmente mapeadas nos `args` do Storybook ou transmitidas/salvas em formatos estáticos de internacionalização (como dicionários JSON de tradução padrão).
   - _Decisão adotada_: Usar strings de formatação como `'Slide {index} de {total}'` e realizar a substituição textual simples no componente. É seguro, extremamente rápido e de fácil configuração pelo consumidor da biblioteca (incluindo controles interativos do Storybook).
3. **Preservação de Retrocompatibilidade e Fallbacks**:
   - Os padrões atuais (`"Remover {children}"`, `"Slide {index} de {total}"` e `"Ir para slide {index}"`) foram mantidos como fallbacks padrões (português) para garantir que nenhuma aplicação consumidora existente enfrente quebras ou perdas de acessibilidade imediata após a atualização das dependências.

## Checklist de Implementação

### Fase 1: Alinhamento e Preparação TDD

- [x] Ler as especificações em [SPEC.md](file:///home/rafacdomin/projetos/design-system/SPEC.md) e as diretrizes de acessibilidade em [ACCESSIBILITY.md](file:///home/rafacdomin/projetos/design-system/references/ACCESSIBILITY.md).
- [x] Executar a suíte de testes existente (`pnpm test`) para garantir que os componentes `Tag` e `Carousel` estão íntegros antes de qualquer alteração.

### Fase 2: Componente Tag (`@ds/core`)

- [x] Adicionar a propriedade opcional `removeAriaLabel?: string` à interface `TagProps` no arquivo [Tag.tsx](file:///home/rafacdomin/projetos/design-system/packages/core/src/components/Tag/Tag.tsx).
- [x] Ajustar a inicialização da constante `removeLabel` para usar `removeAriaLabel` se fornecido; do contrário, usar o fallback padrão existente.
- [x] Verificar e garantir que o atributo `aria-label` do botão de fechamento em todas as ramificações de renderização do `TagComponent` (Caso 1 e Caso 3) receba o valor de `removeLabel`.
- [x] Adicionar teste unitário em [Tag.test.tsx](file:///home/rafacdomin/projetos/design-system/packages/core/src/components/Tag/Tag.test.tsx) validando a aplicação do `removeAriaLabel` customizado.
- [x] Adicionar teste unitário em [Tag.test.tsx](file:///home/rafacdomin/projetos/design-system/packages/core/src/components/Tag/Tag.test.tsx) validando que, se omitida a prop, o fallback nativo continua funcionando.
- [x] Executar o teste de acessibilidade `axe` em [Tag.test.tsx](file:///home/rafacdomin/projetos/design-system/packages/core/src/components/Tag/Tag.test.tsx) e garantir que não há violações introduzidas com a customização de ARIA.

### Fase 3: Componente Carousel (`@ds/carousel`)

- [x] Adicionar as propriedades opcionais `slideAriaLabelFormat?: string` e `dotAriaLabelFormat?: string` à interface `CarouselProps` no arquivo [Carousel.tsx](file:///home/rafacdomin/projetos/design-system/packages/carousel/src/components/Carousel/Carousel.tsx).
- [x] Incluir os novos campos `slideAriaLabelFormat: string` and `dotAriaLabelFormat: string` à interface `CarouselContextValue`.
- [x] Definir os valores padrões das propriedades no destructuring de `CarouselComponent` (`slideAriaLabelFormat = 'Slide {index} de {total}'` e `dotAriaLabelFormat = 'Ir para slide {index}'`).
- [x] Atualizar o objeto `contextValue` para passar `slideAriaLabelFormat` e `dotAriaLabelFormat` ao `CarouselContext.Provider`.
- [x] Atualizar o componente interno `CarouselItemComponent` para recuperar `slideAriaLabelFormat` e `totalSlides` via hook `useCarousel()`.
- [x] Interpolar dinamicamente o valor de `slideAriaLabelFormat` no `CarouselItemComponent`, substituindo `{index}` por `index + 1` e `{total}` por `totalSlides`, atribuindo o resultado a `aria-label` do item.
- [x] Atualizar o componente interno `CarouselDotsComponent` para recuperar `dotAriaLabelFormat` via hook `useCarousel()`.
- [x] Interpolar dinamicamente o valor de `dotAriaLabelFormat` na geração de cada dot do `CarouselDotsComponent`, substituindo `{index}` por `index + 1` e atribuindo o resultado ao `aria-label` correspondente.
- [x] Adicionar testes unitários em [Carousel.test.tsx](file:///home/rafacdomin/projetos/design-system/packages/carousel/src/components/Carousel/Carousel.test.tsx) para verificar se os rótulos ARIA padrão dos slides e dos dots de paginação são renderizados corretamente.
- [x] Adicionar testes unitários em [Carousel.test.tsx](file:///home/rafacdomin/projetos/design-system/packages/carousel/src/components/Carousel/Carousel.test.tsx) para verificar a correta formatação dos rótulos ARIA ao passar props customizadas (`slideAriaLabelFormat` e `dotAriaLabelFormat`).
- [x] Executar o teste de acessibilidade `axe` em [Carousel.test.tsx](file:///home/rafacdomin/projetos/design-system/packages/carousel/src/components/Carousel/Carousel.test.tsx) validando zero violações de acessibilidade sob formatos de ARIA personalizados.

### Fase 4: Integração, Qualidade e Builds

- [x] Executar verificação de tipos do TypeScript em todo o monorepo (`pnpm tsc` ou similar) e atestar zero erros e zero uso de `any` no código implementado.
- [x] Executar o linter (`pnpm lint`) e o formatador (`pnpm format`) para garantir conformidade estilística.
- [x] Rodar a suíte completa de testes unitários com cobertura (`pnpm test` ou `pnpm test:cov`) garantindo cobertura de testes de 100% nas novas linhas de lógica do `Tag` e `Carousel`.
- [x] Executar o build geral do monorepo (`pnpm build`) para garantir compatibilidade da compilação e empacotamento.
