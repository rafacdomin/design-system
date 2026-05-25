# Arquitetura do Design System

## Monorepo

- Turborepo + pnpm workspaces
- Pacotes: `@rafacdomin/ds-core`, `@rafacdomin/ds-carousel`, `@rafacdomin/ds-docs`

## Estrutura de um componente

packages/core/src/components/ComponentName/
├── ComponentName.tsx
├── ComponentName.test.tsx
├── ComponentName.module.scss
└── index.ts

## Estrutura de Stories (Storybook)

packages/docs/src/stories/
└── ComponentName.stories.tsx

## Dependências externas permitidas

- @radix-ui/\* — primitivos acessíveis
- @radix-ui/react-slot — pattern asChild
- class-variance-authority (cva) — variantes type-safe
- clsx — composição de classNames
- embla-carousel-react — apenas no pacote @rafacdomin/ds-carousel

## Quando separar em pacote próprio

Dependência > ~10kb gzipped = pacote separado.
Embla (~15kb), Recharts (~300kb) = pacotes próprios.

## Compound Component Pattern

Para componentes compostos que envolvem subcomponentes acoplados (ex: `Dropdown` e `Dropdown.Item`, ou `Input` e `Input.StartIcon`), devemos seguir os seguintes padrões:

- **Propagação de Props e Tipagem**: Apenas o componente principal exporta suas props e tipos principais no `index.ts`. Os subcomponentes têm suas props definidas em interfaces locais (ex: `DropdownItemProps`) e são exportados no namespace do componente pai.
- **Exportação via Object.assign**: O export do componente principal deve anexar os subcomponentes utilizando `Object.assign` logo após aplicar HOCs como `withTheme`:
  ```tsx
  const ThemedDropdown = withTheme<HTMLButtonElement, DropdownProps>(
    DropdownComponent
  )
  export const Dropdown = Object.assign(ThemedDropdown, {
    Item: DropdownItem,
  })
  ```
- **Hierarquia de Nomes (displayName)**: O `displayName` dos subcomponentes deve seguir estritamente o formato de namespace `ComponentePai.Subcomponente` para depuração e documentação limpas:
  ```tsx
  DropdownItem.displayName = 'Dropdown.Item'
  InputStartIcon.displayName = 'Input.StartIcon'
  ```
- **Inspeção de Elementos Filhos**: Quando o componente pai precisar detectar subcomponentes específicos (ex: slots de ícones no `Input`), use `React.Children` com verificação de tipo para obter e renderizar os subcomponentes em suas respectivas posições de layout de forma de composição limpa.

## Regras de Tipagem e Qualidade de Código

- **Proibição Estrita de `any`**: O uso de `any` é estritamente proibido em qualquer arquivo `.ts` ou `.tsx` do projeto, incluindo arquivos de teste (`.test.tsx`), stories (`.stories.tsx`), arquivos de utilitários ou de configuração.
  - Para casos em que o tipo não é conhecido ou é dinâmico, utilize `unknown`.
  - Mocks globais ou asserções de testes (ex: mocking de APIs do navegador como `PointerEvent` em ambientes jsdom) devem usar alternativas seguras baseadas em `as unknown as typeof TargetClass` em vez de `as any`.
- **Modo Estrito (Strict Mode)**: O TypeScript deve rodar sempre com as opções de `strict` habilitadas no `tsconfig.json`.

## Internacionalização (i18n)

Adotamos uma arquitetura de internacionalização híbrida que prioriza a leveza dos pacotes de componentes de produção:

- **Componentes Locale-Agnósticos**: Os pacotes de componentes `@rafacdomin/ds-core` e `@rafacdomin/ds-carousel` não possuem dependências de tradução em tempo de execução (como `i18next`). Todas as strings e formatos de acessibilidade (ARIA) são passados como propriedades parametrizáveis (ex: `removeAriaLabel` no `Tag`, `slideAriaLabelFormat` no `Carousel`), garantindo que o bundle final permaneça enxuto e flexível para os consumidores.
- **Estrutura de Tradução no `@rafacdomin/ds-docs`**: Toda a inteligência de tradução e a interface multilíngue (português/inglês) são contidas exclusivamente na sandbox e documentação:
  - **LocaleContext & Provider**: Prover a reatividade de idioma e registrar eventos do Storybook (como `GLOBALS_UPDATED`) para atualizar dinamicamente a interface.
  - **Componente `<Language>`**: Utilitário MDX para renderização condicional de blocos de texto com base no idioma selecionado na toolbar (`pt-BR` ou `en-US`).
  - **Decorator `withI18n`**: Traduz recursivamente os `args` das stories usando um dicionário de traduções centralizado (`translations.ts`), convertendo strings em tempo de execução de forma transparente.
