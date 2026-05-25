import * as fs from 'fs'
import * as path from 'path'
import * as ts from 'typescript'
import { z } from 'zod'
import { findProjectRoot } from './utils.js'

// Types safe from 'any'
export interface ComponentMetadata {
  name: string
  package: 'core' | 'carousel'
  path: string
  subcomponents: string[]
}

export interface PropMetadata {
  name: string
  type: string
  isOptional: boolean
  description: string
}

export interface InterfaceMetadata {
  name: string
  props: PropMetadata[]
}

export interface ComponentSpecMetadata {
  name: string
  description: string
  sections: Record<string, string>
}

// Zod validation schemas
export const ListComponentsSchema = z.object({
  package: z.enum(['core', 'carousel', 'all']).optional().default('all'),
})

export const GetComponentApiSchema = z.object({
  componentName: z.string().min(1),
})

export const GetComponentSpecSchema = z.object({
  componentName: z.string().min(1),
})

/**
 * Varre as pastas de componentes e retorna seus metadados
 */
export async function scanComponents(
  packageFilter: 'core' | 'carousel' | 'all' = 'all'
): Promise<ComponentMetadata[]> {
  const rootDir = findProjectRoot()
  const packages = [
    {
      name: 'core' as const,
      dir: path.join(rootDir, 'packages/core/src/components'),
    },
    {
      name: 'carousel' as const,
      dir: path.join(rootDir, 'packages/carousel/src/components'),
    },
  ]

  const results: ComponentMetadata[] = []

  for (const pkg of packages) {
    if (packageFilter !== 'all' && packageFilter !== pkg.name) continue
    if (!fs.existsSync(pkg.dir)) continue

    const dirs = await fs.promises.readdir(pkg.dir, { withFileTypes: true })
    for (const dir of dirs) {
      if (!dir.isDirectory()) continue

      const compName = dir.name
      const compPath = path.join(pkg.dir, compName)
      const tsxPath = path.join(compPath, `${compName}.tsx`)

      if (fs.existsSync(tsxPath)) {
        const subcomponents = await findSubcomponents(compName, tsxPath)
        results.push({
          name: compName,
          package: pkg.name,
          path: path.relative(rootDir, compPath),
          subcomponents,
        })
      }
    }
  }

  return results
}

/**
 * Procura subcomponentes compostos baseados na atribuição do Compound Pattern
 */
async function findSubcomponents(
  parentName: string,
  tsxPath: string
): Promise<string[]> {
  try {
    const content = await fs.promises.readFile(tsxPath, 'utf-8')
    const regex = new RegExp(`${parentName}\\.([A-Za-z0-9_]+)`, 'g')
    const matches = content.matchAll(regex)
    const subs = new Set<string>()
    for (const match of matches) {
      if (match[1] && match[1] !== 'displayName') {
        subs.add(match[1])
      }
    }
    return Array.from(subs)
  } catch {
    return []
  }
}

/**
 * Limpa comentários de bloco / JSDoc removendo asteriscos e barras
 */
function cleanComment(comment: string): string {
  return comment
    .replace(/\/\*\*|\*\/|\*\s?/g, '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .join(' ')
}

/**
 * Analisa as interfaces Props de um componente usando TypeScript AST
 */
export async function parseComponentApi(
  tsxPath: string
): Promise<InterfaceMetadata[]> {
  const content = await fs.promises.readFile(tsxPath, 'utf-8')
  const sourceFile = ts.createSourceFile(
    tsxPath,
    content,
    ts.ScriptTarget.Latest,
    true
  )

  const interfaces: InterfaceMetadata[] = []

  function visit(node: ts.Node) {
    if (ts.isInterfaceDeclaration(node)) {
      const interfaceName = node.name.text
      if (interfaceName.endsWith('Props')) {
        const props: PropMetadata[] = []

        for (const member of node.members) {
          if (ts.isPropertySignature(member)) {
            const propName = member.name.getText(sourceFile)
            const propType = member.type
              ? member.type.getText(sourceFile)
              : 'unknown'
            const isOptional = !!member.questionToken

            // Extração segura de comentários JSDoc sem 'any'
            let description = ''
            const jsDocContainer = member as unknown as { jsDoc?: ts.JSDoc[] }
            if (jsDocContainer.jsDoc && jsDocContainer.jsDoc.length > 0) {
              const comment = jsDocContainer.jsDoc[0].comment
              if (typeof comment === 'string') {
                description = comment
              } else if (Array.isArray(comment)) {
                description = comment.map((c) => c.text).join(' ')
              } else if (comment) {
                description = (comment as { text?: string }).text || ''
              }
            }

            // Fallback usando Leading Comment Ranges
            if (!description.trim()) {
              const commentRanges = ts.getLeadingCommentRanges(
                content,
                member.pos
              )
              if (commentRanges && commentRanges.length > 0) {
                const rawComment = content.substring(
                  commentRanges[0].pos,
                  commentRanges[0].end
                )
                description = cleanComment(rawComment)
              }
            }

            props.push({
              name: propName,
              type: propType,
              isOptional,
              description: description.trim(),
            })
          }
        }

        interfaces.push({
          name: interfaceName,
          props,
        })
      }
    }
    ts.forEachChild(node, visit)
  }

  visit(sourceFile)
  return interfaces
}

/**
 * Fatias as especificações do COMPONENT_SPEC.md para um componente
 */
export async function parseComponentSpec(
  componentName: string
): Promise<ComponentSpecMetadata | null> {
  const rootDir = findProjectRoot()
  const specPath = path.join(rootDir, 'references/COMPONENT_SPEC.md')
  if (!fs.existsSync(specPath)) {
    throw new Error('COMPONENT_SPEC.md não encontrado em references/')
  }

  const content = await fs.promises.readFile(specPath, 'utf-8')
  // Divide pelas seções ## [0-9]+\. Componente
  const sections = content.split(/(?=^## \d+\.)/m)

  for (const section of sections) {
    const lines = section.split('\n')
    if (lines.length === 0) continue
    const heading = lines[0].trim()

    // Match "## 1. Button" ou "## 4. Dropdown (Select)" ou "## 5. Grid2"
    const match = heading.match(/^## \d+\.\s+([A-Za-z0-9]+)/)
    if (!match) continue

    const parsedName = match[1]
    if (parsedName.toLowerCase() !== componentName.toLowerCase()) continue

    // Dividir subseções por ### X.Y
    const subSections = section.split(/(?=^### \d+\.\d+)/m)

    // A primeira seção contém a descrição curta
    const headerLines = subSections[0].split('\n').slice(1)
    const description = headerLines
      .map((line) => line.trim())
      .filter((line) => line !== '' && !line.startsWith('---'))
      .join(' ')

    const sectionsMap: Record<string, string> = {}

    for (let i = 1; i < subSections.length; i++) {
      const subSec = subSections[i]
      const subLines = subSec.split('\n')
      if (subLines.length === 0) continue
      const subHeading = subLines[0].trim()

      const titleMatch = subHeading.match(/^### \d+\.\d+\s+(.+)$/)
      if (titleMatch) {
        const title = titleMatch[1].trim()
        const body = subLines.slice(1).join('\n').trim()
        sectionsMap[title] = body
      }
    }

    return {
      name: parsedName,
      description,
      sections: sectionsMap,
    }
  }

  return null
}
