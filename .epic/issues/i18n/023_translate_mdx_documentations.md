# 023 - Documentação: Tradução MDX de Design Tokens e Guias

## Status

[ ] Planejada [ ] Em desenvolvimento [ ] Concluída

## Objetivo

Traduzir todo o conteúdo explicativo dos tokens de design e guias introdutórios do Storybook para inglês (`en-US`), mantendo a versão em português (`pt-BR`) ativa por meio do encapsulamento condicional `<Language>`.

## Critérios de Aceite

- [ ] Integrar o componente `<Language>` importado do pacote `@ds/docs` nas páginas MDX.
- [ ] Traduzir `Introduction.mdx` (Guia de Instalação, Theming e Acessibilidade).
- [ ] Traduzir `Colors.mdx` (Documentação de tokens de cores).
- [ ] Traduzir `Typography.mdx` (Fontes, pesos, tamanhos e alturas de linha).
- [ ] Traduzir `Spacing.mdx` (Espaçamentos internos e margens).
- [ ] Traduzir `Borders.mdx` (Raio de arredondamento e espessura de borda).
- [ ] Traduzir `Shadows.mdx` (Elevações e sombras projetadas).
- [ ] Garantir que ao alternar o idioma na toolbar do Storybook, toda a documentação da página aberta mude instantaneamente sem erros de renderização.

## Arquivos a Modificar

- `packages/docs/src/docs/Introduction.mdx`
- `packages/docs/src/docs/Colors.mdx`
- `packages/docs/src/docs/Typography.mdx`
- `packages/docs/src/docs/Spacing.mdx`
- `packages/docs/src/docs/Borders.mdx`
- `packages/docs/src/docs/Shadows.mdx`

## Dependências Externas

Nenhuma

## Depende de

#022

## Pesquisa

### Renderização de Markdown dentro de Componentes JSX no MDX

No MDX, componentes JSX (como o componente `<Language>` customizado) podem encapsular conteúdo Markdown normal. No entanto, o parser do MDX possui regras estritas para determinar se o conteúdo de uma tag JSX deve ser processado como Markdown ou como HTML/texto literal:

1. **Linhas em branco (Blank lines)**: É obrigatório que haja uma linha em branco imediatamente após a tag de abertura JSX e antes da tag de fechamento JSX. Caso contrário, o conteúdo Markdown não será parseado corretamente e poderá ser renderizado como texto puro ou causar falhas de compilação.
   - _Exemplo Incorreto:_
     ```mdx
     <Language locale="pt-BR"># Introdução Conteúdo aqui.</Language>
     ```
   - _Exemplo Correto:_

     ```mdx
     <Language locale="pt-BR">

     # Introdução

     Conteúdo aqui.

     </Language>
     ```

2. **Indentação**: O conteúdo Markdown dentro das tags JSX não deve ser indentado com espaços ou tabulações nas margens esquerdas. A indentação pode fazer com que o parser do MDX interprete o texto como um bloco de código indentado (tag `<pre>` ou markdown indentation code block).

### Melhores Práticas para Traduções Lado a Lado em MDX

Ao contrário de frameworks de páginas web que usam roteamento de arquivos separados (como `doc.pt.mdx` e `doc.en.mdx`), no Storybook a alternância de locale é dinâmica na toolbar global.

- **Componente `<Language>`**: Esse componente acessa o estado do locale ativo de forma reativa a partir de um `LocaleContext` fornecido globalmente na visualização de documentos. Ele compara a propriedade `locale` fornecida com o locale atual do Storybook e renderiza condicionalmente o conteúdo apenas se houver correspondência, retornando `null` caso contrário.
- **Sincronização de Layouts e Tokens**: Elementos não traduzíveis (ex: paletas de cores renderizadas dinamicamente, valores em pixels, importações de código) podem ficar fora do componente `<Language>` ou ter apenas os trechos de strings traduzidos dentro dele para evitar duplicação redundante de HTML complexo.

---

## Implementação Planejada

### Mapeamento de Arquivos MDX a Modificar

Todos os arquivos abaixo devem ser modificados para importar o componente `<Language>` e envolver seus blocos textuais nos respectivos locales `pt-BR` e `en-US`:

1. **`packages/docs/src/docs/Introduction.mdx`**
   - Envolver seções de introdução, guias de instalação, theming e diretrizes de acessibilidade.
2. **`packages/docs/src/docs/Colors.mdx`**
   - Envolver textos conceituais de cores, além de traduzir as descrições textuais das paletas neutras, de semântica e suporte (ex: "Fundo principal da página", "Bordas de foco").
3. **`packages/docs/src/docs/Typography.mdx`**
   - Envolver explicações de fontes, tamanhos, pesos e alturas de linha.
4. **`packages/docs/src/docs/Spacing.mdx`**
   - Envolver explicações dos tokens de espaçamento geométrico baseados em `rem`.
5. **`packages/docs/src/docs/Borders.mdx`**
   - Envolver explicações de raios de arredondamento (`border-radius`) e espessura (`border-width`).
6. **`packages/docs/src/docs/Shadows.mdx`**
   - Envolver explicações de elevações e sombras.

### Exemplo de Uso do Componente `<Language>`

As documentações MDX devem importar o componente `<Language>` do pacote `@ds/docs` (por meio de caminho relativo, uma vez que estão no mesmo pacote):

```mdx
import { Meta } from '@storybook/blocks'
import { DocsThemeWrapper } from '../components/DocsThemeWrapper'
import { Language } from '../components/Language'

<Meta title="Tokens/Borders" />

<DocsThemeWrapper>
  <Language locale="pt-BR">

# Bordas e Arredondamento

Os tokens de borda controlam o arredondamento de cantos (`border-radius`) e a espessura de bordas...

  </Language>
  <Language locale="en-US">

# Borders and Radius

Border tokens control corner rounding (`border-radius`) and border width...

  </Language>
</DocsThemeWrapper>
```

---

## Decisões Técnicas

### Centralização de Versões em Arquivo Único (Single MDX File)

Optamos por manter as versões de múltiplos idiomas dentro de um único arquivo MDX em vez de criar múltiplos arquivos correspondentes por idioma na estrutura da sidebar (ex: `Introduction.pt.mdx` e `Introduction.en.mdx`):

1. **Single Source of Truth para Layouts e Exemplos**: Tabelas complexas de visualização de tokens (como grid de cores ou escala de espaçamento) e blocos de código JSX interativos seriam duplicados se usássemos arquivos separados. Qualquer alteração de design token exigiria edição manual sincronizada em dois ou mais arquivos, aumentando o risco de obsolescência e dessincronização.
2. **Integração Fluida com a Toolbar do Storybook**: O Storybook renderiza a documentação via MDX como uma única visualização. Utilizar um componente React (`<Language>`) permite reagir à alteração de locale e remontar dinamicamente o conteúdo da mesma página sem precisar forçar redirecionamento de rotas do Storybook ou poluir a sidebar com tópicos duplicados ("Introdução" e "Introduction").
3. **Redução de Overhead do Bundler**: O framework Storybook+Vite processa e compila menos arquivos MDX na inicialização e no Hot Module Replacement (HMR), acelerando os tempos de compilação em desenvolvimento e builds finais de produção.

---

## Checklist de Implementação

### Fase 1: Alinhamento e Preparação

- [ ] Validar a conclusão da issue #022 e certificar-se de que o componente `Language` e a infraestrutura de i18n (`LocaleProvider` e `withI18n`) estejam implementados e estáveis.
- [ ] Confirmar o caminho de importação correto para o componente `Language` em ambientes MDX.

### Fase 2: Adaptação das Páginas de Tokens e Guias

- [ ] **`Introduction.mdx`**:
  - [ ] Importar o componente `Language`.
  - [ ] Envolver a descrição inicial do design system nas tags `<Language>` para `pt-BR` e `en-US`.
  - [ ] Traduzir a seção de instalação e importação de estilos para `en-US`.
  - [ ] Traduzir os tópicos do guia de Theming (ThemeProvider, useTheme, HOC `withTheme`) e suas explicações de código.
  - [ ] Traduzir a seção de conformidade com acessibilidade (WCAG 2.1 AA) e navegação via teclado.
- [ ] **`Colors.mdx`**:
  - [ ] Importar o componente `Language`.
  - [ ] Traduzir a introdução do sistema de cores monocromático de alto contraste.
  - [ ] Traduzir as strings de descrição de cada card de cor neutra, semântica e suporte para `en-US` mantendo o `pt-BR`.
- [ ] **`Typography.mdx`**:
  - [ ] Importar o componente `Language`.
  - [ ] Traduzir a explicação conceitual sobre o sistema tipográfico Outfit/Inter e legibilidade de tela.
  - [ ] Traduzir as strings de explicação dos pesos, alturas de linha e tamanhos de fonte.
- [ ] **`Spacing.mdx`**:
  - [ ] Importar o componente `Language`.
  - [ ] Traduzir a explicação sobre a proporção geométrica baseada em múltiplos de 4px e escala `rem`.
  - [ ] Traduzir as descrições textuais correspondentes aos tokens de espaçamento na tabela descritiva.
- [ ] **`Borders.mdx`**:
  - [ ] Importar o componente `Language`.
  - [ ] Traduzir os textos sobre a estética geométrica e angular de arredondamento de cantos.
  - [ ] Traduzir as descrições dos tokens de `border-radius` e `border-width`.
- [ ] **`Shadows.mdx`**:
  - [ ] Importar o componente `Language`.
  - [ ] Traduzir as descrições conceituais de elevação e o uso de sombras monocromáticas premium.
  - [ ] Traduzir os detalhes dos níveis de elevação (sm, md, lg).

### Fase 3: Revisão de Formatação e Sintaxe MDX

- [ ] Validar a presença de linhas em branco antes e depois de cada bloco `<Language>` para garantir a correta renderização do Markdown.
- [ ] Certificar-se de que nenhum texto em Markdown sob as tags `<Language>` esteja com indentação de margem esquerda.
- [ ] Executar o formatador de código (Prettier) em todos os arquivos modificados para padronizar o estilo.

### Fase 4: Garantia de Qualidade e Testes

- [ ] Rodar o servidor local do Storybook (`pnpm --filter @ds/docs storybook` ou comando equivalente do monorepo).
- [ ] Testar dinamicamente a alternância de idioma por meio da toolbar global do Storybook em todas as 6 documentações MDX.
- [ ] Verificar se há logs de aviso de hidratação ou erros do React no console do navegador ao alternar os idiomas.
- [ ] Validar a acessibilidade das páginas MDX in both languages usando o addon `@storybook/addon-a11y`.
- [ ] Executar a suite de testes visuais e de regressão (ex: Playwright/Browserstack) para atestar que os layouts não quebraram com a injeção do componente `<Language>`.

## Estimativa

M
