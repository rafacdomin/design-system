# Especificação de Internacionalização (i18n) do Storybook e Componentes

Este documento detalha as especificações para implementar o suporte a múltiplos idiomas (`pt-BR` e `en-US`) no Storybook e a tradução das documentações e demonstrações, mantendo as bibliotecas de componentes agnósticas.

---

## 1. Visão Geral

O objetivo desta especificação é permitir que desenvolvedores e usuários acessem a documentação interativa (Storybook) em português brasileiro (`pt-BR`) ou inglês (`en-US`), com alternância em tempo de execução a partir de um seletor na barra de ferramentas.

Para evitar complexidade e acoplamento desnecessário nas bibliotecas de componentes (`core` e `carousel`), toda a inteligência e mapeamentos de idiomas ficarão concentrados no pacote de documentação `@ds/docs`. Os componentes serão agnósticos a i18n, aceitando propriedades descritivas que viabilizam a customização de seus textos internos.

---

## 2. Stack Técnica de i18n

- **Controle de Locale no Storybook**: Toolbar global (`globalTypes`) com o identificador `locale` e as opções `pt-BR` (padrão) e `en-US`.
- **Gerenciamento de Contexto**: Contexto React local (`LocaleContext`, `LocaleProvider` e `useLocale`) no pacote `@ds/docs`.
- **Tradução Automática de Histórias**: Decorador do Storybook (`withI18n`) que intercepta e traduz as `args` enviadas às stories recursivamente com base em um dicionário estático central.
- **Estruturação de Documentação**: Renderização condicional em arquivos MDX usando o componente utilitário `<Language>`.

---

## 3. Customizações de Rótulos em Componentes (Agnósticos)

Os textos internos de acessibilidade e legendas com fallback nativo em português devem ser customizáveis por meio de propriedades normais dos componentes.

### 3.1 `@ds/core` - Componente `Tag`

- **Nova Prop**: `removeAriaLabel?: string`
- **Comportamento**: Define o atributo `aria-label` do botão de remoção.
- **Fallback**: Caso não fornecida, usa a string padrão em português:
  - Se o conteúdo (children) for texto: `"Remover " + children`
  - Caso contrário: `"Remover"`

### 3.2 `@ds/carousel` - Componente `Carousel`

- **Novas Props**:
  - `slideAriaLabelFormat?: string` (Padrão: `'Slide {index} de {total}'`)
  - `dotAriaLabelFormat?: string` (Padrão: `'Ir para slide {index}'`)
- **Comportamento**: O componente renderizará dinamicamente os rótulos interpolando as marcações `{index}` (posição baseada em 1) e `{total}` (número total de slides).
  - Em `Carousel.Item`: aplica o `slideAriaLabelFormat`.
  - Em `Carousel.Dots` (botão de ponto): aplica o `dotAriaLabelFormat`.

---

## 4. Infraestrutura de i18n no Storybook (`@ds/docs`)

Toda a complexidade de i18n reside no pacote de documentação:

1. **LocaleContext / LocaleProvider**:
   - Mantém e compartilha o estado do locale ativo (`locale`, `setLocale`).
2. **Componente `<Language>`**:
   - Utilitário exclusivo do pacote de documentação para envelopar blocos MDX.
   - Props: `locale: 'pt-BR' | 'en-US'`.
   - Exemplo:
     ```mdx
     <Language locale="pt-BR"># Introdução</Language>
     <Language locale="en-US"># Introduction</Language>
     ```
3. **Decorator `withI18n`**:
   - Assina os estados globais do Storybook.
   - Aplica tradução automatizada sobre `args` mapeados (como `label`, `placeholder`, `error`, `helperText`, `title`, `description`, `children` se string) usando um dicionário estruturado.
   - Envolve as stories com o `LocaleProvider` local.
4. **Dicionário Centralizado de Traduções**:
   - Contém o mapeamento das strings utilizadas em todas as histórias de componentes de português para inglês.

---

## 5. Critérios de Done (Critérios de Conclusão)

1. Os componentes `@ds/core` e `@ds/carousel` não possuem referências, imports ou lógicas de internacionalização direta ou dicionários internos de tradução.
2. Todas as páginas MDX (`Introduction.mdx`, `Colors.mdx`, `Typography.mdx`, `Spacing.mdx`, `Borders.mdx`, `Shadows.mdx`) exibem o conteúdo em português quando a localidade selecionada for `pt-BR` e em inglês quando for `en-US`.
3. A troca de localidade na barra de ferramentas do Storybook atualiza dinamicamente as histórias dos componentes, traduzindo as propriedades de texto em tela.
4. Testes de unidade adicionados cobrem as propriedades `removeAriaLabel` e os formatos de legenda ARIA do Carrossel.
