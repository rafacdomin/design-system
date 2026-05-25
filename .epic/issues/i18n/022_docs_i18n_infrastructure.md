# 022 - Storybook: Infraestrutura e Tradução de Histórias (@ds/docs)

## Status

[ ] Planejada [ ] Em desenvolvimento [ ] Concluída

## Objetivo

Implementar a estrutura e o sistema de i18n exclusivo do Storybook no pacote `@ds/docs`, integrando um seletor de idioma na toolbar e traduzindo automaticamente as propriedades das stories com base no idioma ativo.

## Critérios de Aceite

- [ ] Criar o `LocaleContext`, `LocaleProvider` e o hook `useLocale` no pacote `@ds/docs`.
- [ ] Criar o componente `<Language>` para exibição condicional em documentações MDX.
- [ ] Configurar o seletor `locale` em `globalTypes` no arquivo `.storybook/preview.tsx` com as opções `pt-BR` e `en-US`.
- [ ] Criar o decorator `withI18n` para prover o `LocaleProvider` a todas as histórias.
- [ ] Criar um dicionário estático no Storybook para traduzir strings (como labels, placeholders, erros e aria-labels) usadas nas stories de português para inglês.
- [ ] Implementar a tradução recursiva automatizada de `args` passados para os componentes.
- [ ] Atualizar o `DocsThemeContainer` para reagir à alteração de `locale` na global toolbar de modo que as páginas MDX recarreguem instantaneamente no idioma correto.

## Arquivos a Criar/Modificar

- `packages/docs/src/context/LocaleContext.tsx`
- `packages/docs/src/components/Language.tsx`
- `packages/docs/.storybook/preview.tsx`

## Dependências Externas

Nenhuma

## Depende de

#021

## Estimativa

M

## Pesquisa

### 1. Storybook 8 i18n e `globalTypes`

No Storybook 8, o gerenciamento de configurações globais que afetam todas as histórias (como tema e idioma) é feito através da propriedade `globalTypes` no arquivo `.storybook/preview.tsx`. Ao configurar o seletor `locale`, o Storybook adiciona automaticamente um botão do tipo toolbar na barra superior.
O valor selecionado fica disponível para os decorators através do objeto `context.globals.locale`.

### 2. Sincronização em Documentações MDX (Docs Page)

Diferente das histórias individuais (que re-renderizam automaticamente através dos decorators), as páginas de documentação MDX usam o `DocsContainer`.
Para reagir dinamicamente a mudanças nos globals do Storybook sem recarregar a página inteira, a infraestrutura do Storybook expõe um canal de comunicação via eventos (`addons.getChannel()`). Ao ouvir o evento `GLOBALS_UPDATED`, o custom `DocsContainer` pode capturar a mudança do locale global e atualizar o estado do `LocaleProvider` local, propagando reatividade instantânea para os componentes `<Language>` presentes no MDX.

### 3. Tradução Recursiva de Args via Decorators

O decorator `withI18n` intercepta os parâmetros de entrada (`args`) que serão injetados nos componentes das histórias. Como os componentes do design system são agnósticos, podemos interceptar recursivamente qualquer string presente no objeto de `args` (por exemplo, `label`, `placeholder`, `error`, `helperText` e `children` de texto) e traduzi-la usando um dicionário estático caso o idioma ativo seja `en-US`.
Para evitar quebras com propriedades complexas ou elementos React passados via `args` (ex: `trigger: <Button>Abrir</Button>`), a função de tradução deve validar o tipo de cada propriedade e usar `React.cloneElement` de forma recursiva apenas para propriedades seguras.

---

## Implementação Planejada

### Estrutura de Arquivos

```text
packages/docs/
├── .storybook/
│   └── preview.tsx                 # Atualização para incluir toolbar, decorator e sincronização de docs
├── src/
│   ├── components/
│   │   └── Language.tsx            # Componente utilitário para renderização condicional em MDX
│   ├── context/
│   │   └── LocaleContext.tsx       # Contexto e Provider para o estado de idioma
│   ├── i18n/
│   │   └── translations.ts         # Dicionário estático pt-BR -> en-US
│   └── index.ts                    # Exportação pública da infraestrutura de i18n
```

### Dicionário de Tradução (`packages/docs/src/i18n/translations.ts`)

```typescript
export const translations: Record<string, string> = {
  // Common UI terms
  Enviar: 'Submit',
  Salvar: 'Save',
  Cancelar: 'Cancel',
  Confirmar: 'Confirm',
  Limpar: 'Clear',

  // Input Component
  Nome: 'Name',
  'Digite seu nome': 'Enter your name',
  'Campo obrigatório': 'Required field',
  'E-mail': 'Email',
  'Digite seu e-mail': 'Enter your email',
  Senha: 'Password',
  'Digite sua senha': 'Enter your password',
  Username: 'Username',
  Search: 'Search',
  'Search projects...': 'Search projects...',
  'Email Address': 'Email Address',
  'Enter your username': 'Enter your username',
  'Enter your email': 'Enter your email',
  'Enter your password': 'Enter your password',
  'Must be at least 8 characters long.': 'Must be at least 8 characters long.',
  'Please enter a valid email address.': 'Please enter a valid email address.',

  // Dropdown Component
  'Selecione...': 'Select...',
  'Escolha uma stack...': 'Choose a stack...',
  'Tecnologia Principal': 'Primary Technology',
  'Selecione a tecnologia de maior domínio para o portfólio.':
    'Select the technology you dominate the most for the portfolio.',
  Stack: 'Stack',
  'A stack será exibida em destaque no cabeçalho do perfil.':
    'The stack will be displayed prominently in the profile header.',
  'É necessário selecionar pelo menos uma stack.':
    'It is required to select at least one stack.',
  'Stack Controlada': 'Controlled Stack',
  'Valor selecionado no estado pai:': 'Selected value in parent state:',

  // Modal Component
  'Visualizar Detalhes': 'View Details',
  'Confira as informações detalhadas deste item do portfólio.':
    'Check the detailed information of this portfolio item.',
  'Abrir Modal': 'Open Modal',
  Confirmação: 'Confirmation',
  'Tem certeza que deseja prosseguir?': 'Are you sure you want to proceed?',
  'Excluir Item': 'Delete Item',
  'Projeto Detalhado': 'Detailed Project',
  'Documentação completa com imagens e detalhes técnicos.':
    'Complete documentation with images and technical details.',
  'Ver Mais': 'See More',
  'Modal Sem Descrição': 'Modal Without Description',
  'Abrir Simples': 'Open Simple',
  'Abrir Modal Controlado': 'Open Controlled Modal',
  'Estado Controlado': 'Controlled State',
  'Este modal tem seu estado `open` gerenciado inteiramente pelo componente pai.':
    'This modal has its `open` state entirely managed by the parent component.',
  'Fechar Via Código': 'Close Via Code',

  // Tag Component
  Remover: 'Remove',
  'Remover Tag': 'Remove Tag',
  'Remover filtro': 'Remove filter',
  Tecnologia: 'Technology',
  Design: 'Design',
  Música: 'Music',
  'Playground Tag': 'Playground Tag',
  'Neutral Color Tag': 'Neutral Color Tag',
  'Primary Color Tag': 'Primary Color Tag',
  'Secondary Color Tag': 'Secondary Color Tag',
  'Danger Color Tag': 'Danger Color Tag',
  'Neutral Tag': 'Neutral Tag',
  'Outline Tag': 'Outline Tag',
  'Interactive Tag': 'Interactive Tag',
  'Small Tag': 'Small Tag',
  'Medium Tag': 'Medium Tag',
  'Removable Tag': 'Removable Tag',
  'Interactive & Removable': 'Interactive & Removable',
  'Remover clicado!': 'Remove clicked!',
  'Tag clicada!': 'Tag clicked!',

  // Carousel Component
  'Exibe setas de navegação nas laterais':
    'Displays navigation arrows on the sides',
  'Exibe dots de paginação no rodapé': 'Displays pagination dots in the footer',
  'Se verdadeiro, avança slides automaticamente':
    'If true, advances slides automatically',
  'Intervalo de tempo do autoplay (em ms)': 'Autoplay time interval (in ms)',
  'Habilita loop infinito nos slides': 'Enables infinite loop on slides',
  'Quantidade de slides exibidos simultaneamente. Pode ser um número ou objeto com chaves mobile, tablet e desktop.':
    'Number of slides displayed simultaneously. Can be a number or an object with mobile, tablet, and desktop keys.',
  'Plataforma de automação e agentes de desenvolvimento para grandes codebases.':
    'Automation platform and development agents for large codebases.',
  'Compilação multi-plataforma de design tokens em tempo real com múltiplos temas.':
    'Multi-platform compilation of design tokens in real time with multiple themes.',
  'Interface interativa para acompanhamento de execução de testes unitários e de regressão.':
    'Interactive interface to track the execution of unit and regression tests.',
  'Módulo de carrossel de alta performance com suporte a arrastar e gestos mobile.':
    'High-performance carousel module with support for dragging and mobile gestures.',
  'Biblioteca de componentes React robusta, acessível e totalmente customizável.':
    'Robust, accessible, and fully customizable React component library.',
  'Pipeline de regressão visual integrado com Browserstack e CI/CD.':
    'Visual regression pipeline integrated with Browserstack and CI/CD.',
  Projeto: 'Project',
  'Layout Customizado (Uso Interno Compound Component)':
    'Customized Layout (Compound Component Internal Use)',
  'Use as setas do teclado para navegar': 'Use keyboard arrows to navigate',
  'Foque no carrossel acima para testar a navegação.':
    'Focus on the carousel above to test navigation.',
  'Exibe exatamente 1 card por vez em todas as resoluções de tela.':
    'Displays exactly 1 card at a time in all screen resolutions.',
  'Sobrescreve a exibição responsiva padrão: 1 card em mobile, 2 em tablet e 3 em desktop.':
    'Overrides default responsive display: 1 card on mobile, 2 on tablet, and 3 on desktop.',

  // Textarea Component
  'Textarea Label': 'Textarea Label',
  'Type your text here...': 'Type your text here...',
  'This is a helper text.': 'This is a helper text.',
  Comments: 'Comments',
  'Type comments...': 'Type comments...',
  'Comments cannot be empty.': 'Comments cannot be empty.',
  'Auto Resizing Textarea': 'Auto Resizing Textarea',
  'Type long paragraphs or insert newlines to see the height adjust automatically...':
    'Type long paragraphs or insert newlines to see the height adjust automatically...',
  'Disabled Textarea': 'Disabled Textarea',
  'Cannot type here...': 'Cannot type here...',
}
```

### Contexto e Provider de Locale (`packages/docs/src/context/LocaleContext.tsx`)

```typescript
import React from 'react'

export type Locale = 'pt-BR' | 'en-US'

export interface LocaleContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
}

export const LocaleContext = React.createContext<LocaleContextType | undefined>(undefined)

export interface LocaleProviderProps {
  locale?: Locale
  children: React.ReactNode
}

export const LocaleProvider: React.FC<LocaleProviderProps> = ({ locale: propLocale, children }) => {
  const [locale, setLocale] = React.useState<Locale>(propLocale || 'pt-BR')

  React.useEffect(() => {
    if (propLocale) {
      setLocale(propLocale)
    }
  }, [propLocale])

  return (
    <LocaleContext.Provider value={{ locale, setLocale }}>
      {children}
    </LocaleContext.Provider>
  )
}

export const useLocale = (): LocaleContextType => {
  const context = React.useContext(LocaleContext)
  if (!context) {
    throw new Error('useLocale must be used within a LocaleProvider')
  }
  return context
}
```

### Componente `<Language>` (`packages/docs/src/components/Language.tsx`)

```typescript
import React from 'react'
import { useLocale, Locale } from '../context/LocaleContext'

export interface LanguageProps {
  locale: Locale
  children: React.ReactNode
}

export const Language: React.FC<LanguageProps> = ({ locale, children }) => {
  const { locale: currentLocale } = useLocale()
  if (currentLocale !== locale) {
    return null
  }
  return <>{children}</>
}

Language.displayName = 'Language'
```

### Utilitários e Decorator em preview.tsx (`packages/docs/.storybook/preview.tsx`)

```typescript
import { translations } from '../src/i18n/translations'

export function translateValue(value: unknown, locale: 'pt-BR' | 'en-US'): unknown {
  if (locale === 'pt-BR') {
    return value
  }

  if (typeof value === 'string') {
    return translations[value] || value
  }

  if (React.isValidElement(value)) {
    const element = value as React.ReactElement<Record<string, unknown>>
    const newProps: Record<string, unknown> = {}
    for (const key of Object.keys(element.props)) {
      if (key !== 'children') {
        newProps[key] = translateValue(element.props[key], locale)
      }
    }
    const children = translateValue(element.props.children, locale)
    return React.cloneElement(element, newProps, children as React.ReactNode)
  }

  if (Array.isArray(value)) {
    return value.map((item) => translateValue(item, locale))
  }

  if (value !== null && typeof value === 'object') {
    const translatedObj: Record<string, unknown> = {}
    for (const key of Object.keys(value)) {
      translatedObj[key] = translateValue((value as Record<string, unknown>)[key], locale)
    }
    return translatedObj
  }

  return value
}

export function translateArgs(
  args: Record<string, unknown> | undefined,
  locale: 'pt-BR' | 'en-US'
): Record<string, unknown> | undefined {
  if (!args || locale === 'pt-BR') {
    return args
  }
  return translateValue(args, locale) as Record<string, unknown>
}

// Decorator withI18n
const withI18n = (Story: React.ComponentType, context: any) => {
  const locale = (context.globals.locale || 'pt-BR') as 'pt-BR' | 'en-US'
  context.args = translateArgs(context.args, locale)

  return (
    <LocaleProvider locale={locale}>
      <Story />
    </LocaleProvider>
  )
}
```

---

## Decisões Técnicas

### 1. Dicionário Estático Centralizado vs. i18next nos Componentes

Optamos por centralizar todas as traduções das stories e documentações no pacote `@ds/docs` através de um dicionário estático no Storybook e tradução recursiva automatizada de `args`.

- **Preservação do Design System Puro**: Manter os pacotes `@ds/core` e `@ds/carousel` livres de dependências de runtime de i18n (como `i18next`, `react-i18next` ou arquivos JSON de tradução). Os componentes permanecem 100% agnósticos, aceitando suas labels de acessibilidade e textos customizados via propriedades.
- **Performance e Bundle Size**: Evita o overhead de carregar bibliotecas de tradução adicionais no bundle final dos componentes de produção.
- **Redução de Duplicação nas Stories**: O decorator traduz os argumentos de forma automatizada e recursiva. Escrevemos a story apenas uma vez (em português brasileiro) e ela se torna dinamicamente multilíngue dependendo do idioma selecionado no Storybook.

### 2. Contexto de Locale Contido Exclusivamente no `@ds/docs`

Como o escopo da internacionalização neste momento é exclusivamente focado na apresentação do Storybook e nas páginas de documentação MDX, toda a infraestrutura do contexto (`LocaleContext`, `LocaleProvider`, `useLocale` e o componente `<Language>`) residirá no pacote de documentação `@ds/docs`. Se no futuro houver necessidade de i18n em aplicações consumidoras, estas implementarão seus próprios provedores, consumindo as propriedades explícitas de internacionalização e acessibilidade expostas nos componentes core.

---

## Checklist de Implementação

- [ ] Criar o arquivo `packages/docs/src/context/LocaleContext.tsx`
- [ ] Definir os tipos strict `Locale` e `LocaleContextType`
- [ ] Criar o React Context `LocaleContext`
- [ ] Implementar e exportar o componente `LocaleProvider` suportando controle interno e prop externa `locale`
- [ ] Implementar e exportar o hook customizado `useLocale` com validação de inicialização
- [ ] Criar o arquivo `packages/docs/src/components/Language.tsx`
- [ ] Implementar e exportar o componente `<Language>` usando `useLocale` para exibição condicional do `children`
- [ ] Definir o `displayName = 'Language'` no componente `<Language>`
- [ ] Criar o arquivo `packages/docs/src/i18n/translations.ts`
- [ ] Cadastrar os termos e sentenças em português das histórias de `Tag`, `Carousel`, `Dropdown` e `Modal` mapeados para inglês no dicionário
- [ ] Exportar `LocaleContext`, `LocaleProvider`, `useLocale` e `Language` a partir de `packages/docs/src/index.ts`
- [ ] Configurar a globalType `locale` em `packages/docs/.storybook/preview.tsx` com as opções `pt-BR` e `en-US` e ícone `globe`
- [ ] Implementar a função utilitária `translateValue` com recursão e suporte seguro a elementos React em `preview.tsx`
- [ ] Implementar a função utilitária `translateArgs` em `preview.tsx`
- [ ] Criar o decorator `withI18n` em `preview.tsx` integrando a tradução de args e envolvendo a história com o `LocaleProvider`
- [ ] Adicionar o decorator `withI18n` à lista global de `decorators` em `preview.tsx`
- [ ] Atualizar o `DocsThemeContainer` em `preview.tsx` para sincronizar o estado local de `locale` via evento `GLOBALS_UPDATED`
- [ ] Envolver o `DocsContainer` com o `LocaleProvider` na renderização do `DocsThemeContainer`
- [ ] Validar a compilação de todo o monorepo executando `pnpm build`
- [ ] Iniciar o Storybook localmente, testar a toolbar de `Language` e certificar-se de que os argumentos das histórias e as seções condicionais do MDX são atualizados instantaneamente em tempo de execução
