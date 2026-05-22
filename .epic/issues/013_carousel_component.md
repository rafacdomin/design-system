# #013 — Componente: Carousel (Embla)

## Status

`[ ] A Fazer` `[ ] Em progresso` `[ ] Concluído`

## Objetivo

Implementar o componente `Carousel` para exibição sequencial de slides ou imagens de projetos no portfólio. Este componente será criado em um pacote separado (`@ds/carousel`) devido à dependência do `embla-carousel-react`, visando a otimização de bundle sizes conforme a arquitetura.

## Critérios de Aceite

- [ ] Inicializar o pacote `@ds/carousel` em `packages/carousel` com seu respectivo `package.json` dependente de `embla-carousel-react`.
- [ ] Implementar o componente `Carousel` integrando o hook `useEmblaCarousel`.
- [ ] Fornecer navegação através de botões de setas Anterior/Próximo e indicadores de pontos (dots/paginação) opcionais no rodapé do carrossel.
- [ ] Suportar propriedade `autoplay` opcional utilizando o plugin `embla-carousel-autoplay` ou implementação reativa de timer do React (com limpeza do timer no desmonte).
- [ ] Acessibilidade robusta:
  - Teclas de setas esquerda/direita do teclado navegam entre slides quando o carrossel está focado.
  - Slides devem ter `role="group"`, `aria-roledescription="slide"` e rótulos acessíveis descritivos (ex: "Slide 1 de 5").
  - Botões de navegação e dots devem ter `aria-label` adequados e indicar o estado ativo/selecionado com `aria-current="true"` ou similar.
- [ ] Escrever testes unitários e histórias cobrindo renderização, navegação e interações de teclado.

## Props

| Prop         | Tipo                | Default | Descrição                                                        |
| ------------ | ------------------- | ------- | ---------------------------------------------------------------- |
| `children`   | `React.ReactNode[]` | -       | Lista de elementos/slides a exibir                               |
| `showArrows` | `boolean`           | `true`  | Exibe setas de navegação nas laterais                            |
| `showDots`   | `boolean`           | `true`  | Exibe dots de paginação no rodapé                                |
| `autoplay`   | `boolean`           | `false` | Se verdadeiro, avança slides automaticamente em intervalos fixos |

## Cenários de Teste

- [ ] Renderiza a quantidade correta de slides.
- [ ] Setas e dots efetuam a transição entre slides ao serem clicadas.
- [ ] Setas do teclado esquerda/direita navegam entre os slides.
- [ ] Limpeza correta de timers se `autoplay` estiver habilitado.
- [ ] Sem violações no axe.

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
