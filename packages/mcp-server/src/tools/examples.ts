import * as fs from 'fs'
import * as path from 'path'
import * as ts from 'typescript'
import { z } from 'zod'
import { findProjectRoot } from './utils.js'

export const GetComponentExamplesSchema = z.object({
  componentName: z.string().min(1),
})

export interface StoryExample {
  name: string
  description?: string
  code: string
}

export interface ComponentExamplesResult {
  componentName: string
  imports: string[]
  examples: StoryExample[]
}

interface ArgVal {
  text: string
  isString: boolean
  isBoolean: boolean
  isTrue: boolean
}

/**
 * Encontra recursivamente um elemento JSX dentro de um nó AST
 */
function findJsxElement(node: ts.Node): ts.Node | undefined {
  if (
    ts.isJsxElement(node) ||
    ts.isJsxSelfClosingElement(node) ||
    ts.isJsxFragment(node)
  ) {
    return node
  }
  if (ts.isParenthesizedExpression(node)) {
    return findJsxElement(node.expression)
  }
  if (ts.isBlock(node)) {
    for (const stmt of node.statements) {
      if (ts.isReturnStatement(stmt) && stmt.expression) {
        const found = findJsxElement(stmt.expression)
        if (found) return found
      }
    }
  }
  return ts.forEachChild(node, findJsxElement)
}

/**
 * Converte um literal de propriedades em um mapa de valores brutos
 */
function parseObjectLiteral(
  obj: ts.ObjectLiteralExpression,
  sourceFile: ts.SourceFile
): Record<string, ArgVal> {
  const result: Record<string, ArgVal> = {}
  obj.properties.forEach((prop) => {
    if (ts.isPropertyAssignment(prop)) {
      const key = prop.name.getText(sourceFile)
      const init = prop.initializer
      const text = init.getText(sourceFile)

      const isString =
        ts.isStringLiteral(init) ||
        init.kind === ts.SyntaxKind.NoSubstitutionTemplateLiteral
      const isBoolean =
        init.kind === ts.SyntaxKind.TrueKeyword ||
        init.kind === ts.SyntaxKind.FalseKeyword
      const isTrue = init.kind === ts.SyntaxKind.TrueKeyword

      let cleanedText = text
      if (isString) {
        cleanedText = text.replace(/^['"`]|['"`]$/g, '')
      }

      result[key] = {
        text: cleanedText,
        isString,
        isBoolean,
        isTrue,
      }
    }
  })
  return result
}

/**
 * Formata os argumentos em atributos JSX
 */
function formatArgsToAttributes(
  args: Record<string, ArgVal>,
  excludeKeys: string[] = []
): string {
  const attrs: string[] = []
  for (const [key, val] of Object.entries(args)) {
    if (excludeKeys.includes(key)) continue
    if (val.isString) {
      attrs.push(`${key}="${val.text}"`)
    } else {
      attrs.push(`${key}={${val.text}}`)
    }
  }
  return attrs.join(' ')
}

/**
 * Limpa o snippet final para remover parênteses ou quebras extras
 */
function cleanSnippet(code: string): string {
  return code.trim()
}

/**
 * Obtém exemplos de uso do componente analisando estaticamente o arquivo de stories
 */
export async function getComponentExamples(
  componentName: string,
  storiesDir?: string
): Promise<ComponentExamplesResult> {
  if (!storiesDir) {
    const rootDir = findProjectRoot()
    storiesDir = path.resolve(rootDir, 'packages/docs/src/stories')
  }

  if (!fs.existsSync(storiesDir)) {
    throw new Error(`Diretório de stories não encontrado: ${storiesDir}`)
  }

  const files = await fs.promises.readdir(storiesDir)
  const storyFile = files.find(
    (f) => f.toLowerCase() === `${componentName.toLowerCase()}.stories.tsx`
  )

  if (!storyFile) {
    throw new Error(
      `Stories para o componente "${componentName}" não foram encontrados.`
    )
  }

  const filePath = path.join(storiesDir, storyFile)
  const fileContent = await fs.promises.readFile(filePath, 'utf-8')

  const sourceFile = ts.createSourceFile(
    filePath,
    fileContent,
    ts.ScriptTarget.Latest,
    true
  )

  const imports: string[] = []
  let metaComponentRef = componentName
  let metaRenderNode: ts.Node | undefined = undefined
  const stories: Array<{
    name: string
    args: Record<string, ArgVal>
    renderNode?: ts.Node
    description?: string
  }> = []

  const helpers: string[] = []

  // Navegar pelas declarações do arquivo
  sourceFile.statements.forEach((stmt) => {
    // 1. Coleta imports
    if (ts.isImportDeclaration(stmt)) {
      const moduleSpecifier = stmt.moduleSpecifier
        .getText(sourceFile)
        .replace(/['"]/g, '')
      if (moduleSpecifier.startsWith('@ds/') || moduleSpecifier === 'react') {
        imports.push(stmt.getText(sourceFile))
      }
      return
    }

    // 2. Ignora Export Default (meta)
    if (ts.isExportAssignment(stmt)) {
      if (ts.isObjectLiteralExpression(stmt.expression)) {
        extractMetaInfo(stmt.expression)
      }
      return
    }

    // 3. Processa variáveis (meta ou stories exportadas)
    if (ts.isVariableStatement(stmt)) {
      const modifiers =
        ts.getModifiers(stmt) ||
        (stmt as unknown as { modifiers?: ts.Modifier[] }).modifiers
      const isExported =
        modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword) ?? false

      let processed = false
      stmt.declarationList.declarations.forEach((decl) => {
        const name = decl.name.getText(sourceFile)
        if (name === 'meta') {
          processed = true
          if (
            decl.initializer &&
            ts.isObjectLiteralExpression(decl.initializer)
          ) {
            extractMetaInfo(decl.initializer)
          }
        } else if (
          isExported &&
          decl.initializer &&
          ts.isObjectLiteralExpression(decl.initializer)
        ) {
          processed = true
          const { args, renderNode, description } = parseStoryObject(
            decl.initializer
          )
          stories.push({ name, args, renderNode, description })
        }
      })
      if (processed) return
    }

    // 4. É um helper!
    helpers.push(stmt.getText(sourceFile))
  })

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
    let args: Record<string, ArgVal> = {}
    let renderNode: ts.Node | undefined = undefined
    let description: string | undefined = undefined

    obj.properties.forEach((prop) => {
      if (ts.isPropertyAssignment(prop)) {
        const name = prop.name.getText(sourceFile)
        if (name === 'args' && ts.isObjectLiteralExpression(prop.initializer)) {
          args = parseObjectLiteral(prop.initializer, sourceFile)
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

  function extractDescription(
    obj: ts.ObjectLiteralExpression
  ): string | undefined {
    let description: string | undefined = undefined
    obj.properties.forEach((prop) => {
      if (
        ts.isPropertyAssignment(prop) &&
        prop.name.getText(sourceFile) === 'docs' &&
        ts.isObjectLiteralExpression(prop.initializer)
      ) {
        prop.initializer.properties.forEach((docsProp) => {
          if (
            ts.isPropertyAssignment(docsProp) &&
            docsProp.name.getText(sourceFile) === 'description' &&
            ts.isObjectLiteralExpression(docsProp.initializer)
          ) {
            docsProp.initializer.properties.forEach((descProp) => {
              if (
                ts.isPropertyAssignment(descProp) &&
                descProp.name.getText(sourceFile) === 'story'
              ) {
                description = descProp.initializer
                  .getText(sourceFile)
                  .replace(/^['"`]|['"`]$/g, '')
              }
            })
          }
        })
      }
    })
    return description
  }

  // Monta os exemplos individuais
  const examples: StoryExample[] = stories.map((story) => {
    let code = ''
    const activeRenderNode = story.renderNode || metaRenderNode

    if (activeRenderNode) {
      const jsxNode = findJsxElement(activeRenderNode)
      if (jsxNode) {
        let jsxText = jsxNode.getText(sourceFile)
        const formattedAttrs = formatArgsToAttributes(story.args, ['children'])

        // Substitui {...args} ou {...props}
        if (/\{\s*\.\.\.\s*(args|props)\s*\}/gi.test(jsxText)) {
          jsxText = jsxText.replace(
            /\{\s*\.\.\.\s*(args|props)\s*\}/gi,
            formattedAttrs
          )
        } else {
          // Se não tiver {...args}, mas tiver atributos vazios
          // (Normalmente render customizado herda props)
        }
        code = jsxText
      } else {
        // Fallback se não encontrar o elemento JSX dentro do render
        code = activeRenderNode.getText(sourceFile)
      }
    } else {
      // Fallback sem render customizado
      const componentRef = metaComponentRef || componentName
      const childrenVal = story.args.children?.text || ''
      const attrsStr = formatArgsToAttributes(story.args, ['children'])
      const space = attrsStr ? ' ' : ''
      if (childrenVal) {
        code = `<${componentRef}${space}${attrsStr}>\n  ${childrenVal}\n</${componentRef}>`
      } else {
        code = `<${componentRef}${space}${attrsStr} />`
      }
    }

    // Injeta helpers associados ao código se forem usados
    let finalCode = cleanSnippet(code)
    helpers.forEach((helper) => {
      const helperNameMatch = helper.match(
        /(?:const|function|let|var)\s+([A-Za-z0-9_]+)/
      )
      if (helperNameMatch) {
        const helperName = helperNameMatch[1]
        if (finalCode.includes(helperName)) {
          finalCode = `${helper}\n\n${finalCode}`
        }
      }
    })

    return {
      name: story.name,
      description: story.description,
      code: finalCode,
    }
  })

  // Adiciona o exemplo de envelopagem com ThemeProvider no início
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
