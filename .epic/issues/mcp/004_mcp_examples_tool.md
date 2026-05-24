# 004 — Ferramenta: get_component_examples

## Status

[ ] Planejada [ ] Em desenvolvimento [x] Concluída

## Objetivo

Implementar a ferramenta MCP `get_component_examples` que permite a agentes de IA receberem snippets de código funcionais e corretos sobre como importar e usar os componentes do design system em aplicações React, incluindo variantes e temas.

## Critérios de Aceite

- [x] Registro da ferramenta `get_component_examples` com o parâmetro `componentName`.
- [x] Lógica para ler e expor os stories de exemplo a partir de `packages/docs/src/stories/` correspondentes ao componente solicitado.
- [x] Inclusão de exemplos básicos, variações de estado (loading, disabled) e variantes estéticas (primary, secondary, etc.).
- [x] Fornecer snippets de código que incluam importações corretas de pacotes (`@ds/core` e `@ds/carousel`) e a envelopagem necessária (como uso de wrapper ou classes corretas).
- [x] Retorno da ferramenta estruturado contendo o código em texto limpo.
- [x] Garantia de tratamento de erros amigável caso não haja exemplos documentados para um componente solicitado.

## Arquivos a Criar/Modificar

- `packages/mcp-server/src/tools/examples.ts` — implementação da ferramenta de exemplos
- `packages/mcp-server/src/tools/index.ts` — registro e exportação da ferramenta

## Pesquisa

### 1. Formato Component Story Format (CSF v3) no Storybook 8

Os stories em `packages/docs/src/stories/` seguem o padrão CSF v3. Esse formato expressa histórias como objetos exportados, em vez de funções, o que facilita a análise estática:

- **Default Export (Meta):** Define metadados do componente, como o componente em si (`component`), título de documentação (`title`) e, opcionalmente, um template de renderização padrão (`render: (args) => <Component {...args} />`).
- **Named Exports (Stories):** Cada objeto exportado representa um caso de uso ou variação (ex: `Playground`, `Primary`, `AsChild`, `Controlled`).
- **Args:** Objeto plano contendo os valores das propriedades passadas ao componente naquele estado específico.

### 2. Mapeamento de Imports no Monorepo

Os componentes e utilitários são organizados nos seguintes pacotes NPM:

- **`@ds/core`:** Componentes de uso geral (`Button`, `Input`, `Textarea`, `Dropdown`, `Modal`, `Card`, `Tag`, `Avatar`), `ThemeProvider`, `withTheme`, `useTheme`.
- **`@ds/carousel`:** Componente complexo `Carousel` (baseado em Embla e dependências pesadas).
  A leitura estática de importações em arquivos `.stories.tsx` permite identificar de qual desses pacotes o componente e seus dependentes devem ser importados.

### 3. Integração de Temas

Todo componente gerado pelo design system é envolvido no HOC `withTheme`. Para que as variáveis customizadas de CSS (como cores e fontes de `references/DESIGN_TOKENS.md`) funcionem, a aplicação consumidora precisa ser envolvida por `<ThemeProvider defaultTheme="light|dark">`. A ferramenta de exemplos deve gerar um snippet especial mostrando essa envelopagem.

---

## Implementação Planejada

### Estrutura de Arquivos Proposta

No novo pacote `packages/mcp-server`, teremos:

```text
packages/mcp-server/src/tools/
├── index.ts          # Registro de ferramentas
└── examples.ts       # Implementação de get_component_examples & parser de stories
```

### Pseudocódigo de Leitura e Formatação usando a API do Compilador TypeScript

```typescript
import * as ts from 'typescript'
import * as fs from 'fs/promises'
import * as path from 'path'

interface StoryExample {
  name: string
  description?: string
  code: string
}

interface ComponentExamplesResult {
  componentName: string
  imports: string[]
  examples: StoryExample[]
}

export async function getComponentExamples(
  componentName: string,
  storiesDir: string
): Promise<ComponentExamplesResult> {
  // 1. Localizar o arquivo do componente de forma case-insensitive
  const storyFileName = await findStoryFile(componentName, storiesDir)
  if (!storyFileName) {
    throw new Error(
      `Stories para o componente "${componentName}" não foram encontrados.`
    )
  }

  const filePath = path.join(storiesDir, storyFileName)
  const fileContent = await fs.readFile(filePath, 'utf-8')

  // 2. Inicializar o parser AST do TypeScript
  const sourceFile = ts.createSourceFile(
    filePath,
    fileContent,
    ts.ScriptTarget.Latest,
    true
  )

  const imports: string[] = []
  let metaRenderNode: ts.Node | undefined = undefined
  let metaComponentRef: string = componentName
  const stories: Array<{
    name: string
    args: Record<string, any>
    renderNode?: ts.Node
    description?: string
  }> = []

  // Navegar pelo AST para extrair informações relevantes
  function traverse(node: ts.Node) {
    // Extrai os imports da biblioteca
    if (ts.isImportDeclaration(node)) {
      const moduleSpecifier = node.moduleSpecifier
        .getText(sourceFile)
        .replace(/['"]/g, '')
      if (moduleSpecifier.startsWith('@ds/') || moduleSpecifier === 'react') {
        imports.push(node.getText(sourceFile))
      }
    }

    // Extrai informações do meta (export default)
    if (ts.isExportAssignment(node) && node.expression) {
      if (ts.isObjectLiteralExpression(node.expression)) {
        extractMetaInfo(node.expression)
      }
    } else if (ts.isVariableStatement(node)) {
      // Caso meta seja definido em uma variável e depois exportado
      node.declarationList.declarations.forEach((decl) => {
        if (
          ts.isVariableDeclaration(decl) &&
          decl.name.getText(sourceFile) === 'meta' &&
          decl.initializer &&
          ts.isObjectLiteralExpression(decl.initializer)
        ) {
          extractMetaInfo(decl.initializer)
        }
      })
    }

    // Extrai os stories (named exports)
    if (ts.isVariableStatement(node) && isExported(node)) {
      node.declarationList.declarations.forEach((decl) => {
        if (
          ts.isVariableDeclaration(decl) &&
          decl.initializer &&
          ts.isObjectLiteralExpression(decl.initializer)
        ) {
          const storyName = decl.name.getText(sourceFile)
          const { args, renderNode, description } = parseStoryObject(
            decl.initializer
          )
          stories.push({ name: storyName, args, renderNode, description })
        }
      })
    }

    ts.forEachChild(node, traverse)
  }

  function extractMetaInfo(obj: ts.ObjectLiteralExpression) {
    obj.properties.forEach((prop) => {
      if (ts.isPropertyAssignment(prop)) {
        const name = prop.name.getText(sourceFile)
        if (name === 'component') {
          metaComponentRef = prop.initializer.getText(sourceFile)
        } else if (name === 'render') {
          metaRenderNode = prop.initializer
        }
      }
    })
  }

  function parseStoryObject(obj: ts.ObjectLiteralExpression) {
    let args: Record<string, any> = {}
    let renderNode: ts.Node | undefined = undefined
    let description: string | undefined = undefined

    obj.properties.forEach((prop) => {
      if (ts.isPropertyAssignment(prop)) {
        const name = prop.name.getText(sourceFile)
        if (name === 'args' && ts.isObjectLiteralExpression(prop.initializer)) {
          args = parseObjectLiteral(prop.initializer)
        } else if (name === 'render') {
          renderNode = prop.initializer
        } else if (
          name === 'parameters' &&
          ts.isObjectLiteralExpression(prop.initializer)
        ) {
          description = extractDescription(prop.initializer)
        }
      }
    })

    return { args, renderNode, description }
  }

  // Executa travessia do AST
  traverse(sourceFile)

  // 3. Formatador e montador de exemplos práticos
  const examples: StoryExample[] = stories.map((story) => {
    let code = ''
    const activeRenderNode = story.renderNode || metaRenderNode

    if (activeRenderNode) {
      // Extrair o trecho JSX do render e injetar os args formatados
      const rawRenderCode = extractJsxFromRenderNode(activeRenderNode)
      code = replaceArgsInJsx(rawRenderCode, story.args)
    } else {
      // Geração simplificada de tags baseada nas props explicitadas nos args
      const children =
        typeof story.args.children === 'string' ? story.args.children : ''
      const jsxProps = formatPropsToJsx(story.args)
      code = jsxProps
        ? `<${metaComponentRef} ${jsxProps}>\n  ${children}\n</${metaComponentRef}>`
        : `<${metaComponentRef}>\n  ${children}\n</${metaComponentRef}>`
    }

    return {
      name: story.name,
      description: story.description,
      code: cleanSnippet(code),
    }
  })

  // 4. Injetar exemplo padrão de envelopagem de tema (ThemeProvider)
  const basicExample =
    examples.find((e) => e.name === 'Playground' || e.name === 'Basic') ||
    examples[0]
  if (basicExample) {
    const themedSnippet = `import { ThemeProvider } from '@ds/core';\n\nfunction App() {\n  return (\n    <ThemeProvider defaultTheme="dark">\n      ${basicExample.code.split('\n').join('\n      ')}\n    </ThemeProvider>\n  );\n}`
    examples.unshift({
      name: 'ThemedIntegration',
      description:
        'Exemplo demonstrando a integração com o sistema de temas global.',
      code: themedSnippet,
    })
  }

  return {
    componentName,
    imports,
    examples,
  }
}
```

---

## Decisões Técnicas

- **Uso do TypeScript Compiler API (`typescript`):** Foi escolhida a análise estática AST real em vez de expressões regulares (regex). Expressões regulares falham facilmente com desestruturação de argumentos, quebras de linhas no TSX e comentários. O AST garante a identificação precisa das exportações de stories e preservação de funções de renderização complexas.
- **Herança de Imports:** Extrair os imports diretamente do arquivo de stories permite que a ferramenta saiba exatamente de qual pacote o componente é importado (`@ds/core` vs `@ds/carousel`), mantendo o MCP server desacoplado de mapas de pacotes estáticos difíceis de manter.
- **Estratégia de Fallback:** Caso a história não utilize a propriedade `render` customizada e conte com a função padrão do Storybook para gerar o componente a partir de `args`, o parser gerará o JSX correspondente mapeando as chaves dos `args` para propriedades JSX válidas.
- **Acessibilidade dos Exemplos:** Os exemplos serão gerados mantendo os atributos de acessibilidade (como `aria-invalid`, `aria-describedby` e estruturas de semântica HTML) que estão configurados nas próprias histórias do Storybook.

---

## Checklist de Implementação

O checklist a seguir descreve de forma granular as etapas de desenvolvimento do parser e da ferramenta MCP:

### Infraestrutura e Setup

- [x] 1. Garantir que as dependências de testes e do TypeScript (`typescript`) estejam disponíveis no escopo do pacote `packages/mcp-server`.
- [x] 2. Criar o arquivo `packages/mcp-server/src/tools/examples.ts`.
- [x] 3. Exportar a nova ferramenta a partir de `packages/mcp-server/src/tools/index.ts`.

### Resolução de Caminhos e Erros

- [x] 4. Implementar a lógica para encontrar arquivos de stories em `packages/docs/src/stories/` de maneira case-insensitive (ex: `button` busca por `Button.stories.tsx`).
- [x] 5. Adicionar tratamento de erros robusto e amigável caso o componente especificado não tenha um arquivo de story correspondente, retornando os nomes dos componentes disponíveis.
- [x] 6. Escrever o teste que verifica a falha e o comportamento apropriado do servidor para componentes inexistentes.

### Parsing de AST do Storybook (TypeScript Compiler API)

- [x] 7. Implementar a leitura assíncrona do arquivo de stories usando `fs.promises.readFile`.
- [x] 8. Inicializar o AST do TypeScript a partir do conteúdo do arquivo com `ts.createSourceFile`.
- [x] 9. Implementar a varredura (traverse) para coletar todas as declarações de importações de `@ds/core`, `@ds/carousel` e `react`.
- [x] 10. Implementar o parser para extrair as propriedades do objeto literal default export (`meta`), focando em obter `component` e o `render` raiz.
- [x] 11. Implementar o parser para identificar todas as exportações nomeadas que representam stories válidos no padrão CSF v3 (`Playground`, `Primary`, etc.).
- [x] 12. Implementar a extração dos valores definidos em `args` para cada story individual.

### Geração de Snippets de Código

- [x] 13. Criar uma função utilitária para converter os valores de `args` de volta para o formato de propriedades JSX (ex: `{ disabled: true }` vira `disabled`, `{ label: "User" }` vira `label="User"`).
- [x] 14. Implementar a extração e limpeza do JSX retornado em funções `render` customizadas de stories (ex: desestruturar `render: (args) => (<Button {...args} />)`).
- [x] 15. Escrever a lógica para substituir a expressão `{...args}` (ou `{...props}`) pelos atributos JSX reais montados a partir do objeto `args` do story.
- [x] 16. Implementar um formatador/limpador simples de código para evitar quebras de linhas órfãs e parênteses sobressalentes na string final.
- [x] 17. Inserir de forma programática o exemplo `ThemedIntegration` contendo a envelopagem com `ThemeProvider`.

### Testes e Integração

- [x] 18. Criar o arquivo de testes unitários `packages/mcp-server/src/__tests__/examples.test.ts`.
- [x] 19. Escrever casos de teste validando o parsing de componentes simples (como `Button` com args planos) e componentes compostos (como `Dropdown` ou `Input` com renderizações personalizadas).
- [x] 20. Implementar testes de integração JSON-RPC que emulam uma chamada para a ferramenta `get_component_examples` através de entrada padrão (stdio) e verificam o payload de resposta estruturado com sucesso.

---

## Dependências Externas

- Nenhuma (usa `typescript` já instalado no monorepo).

## Depende de

#001 (Setup do Pacote MCP Server), #003 (Ferramentas de Componentes)

## Estimativa

M
