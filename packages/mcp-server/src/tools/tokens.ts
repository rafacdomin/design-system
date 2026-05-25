import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import { z } from 'zod'

// Types safe from 'any' as requested by absolute rules
export interface DesignTokens {
  typography: {
    fontFamilies: Record<
      string,
      { token: string; value: string; description?: string }
    >
    fontSizes: Record<
      string,
      { token: string; value: string; pixelEquivalent?: string }
    >
    fontWeights: Record<string, { token: string; value: string }>
    lineHeights: Record<string, { token: string; value: string }>
  }
  colors: {
    neutral: Record<
      string,
      { token: string; light: string; dark: string; suggestedUse?: string }
    >
    accent: Record<
      string,
      { token: string; light: string; dark: string; description?: string }
    >
  }
  spacing: Record<
    string,
    { token: string; value: string; pixelEquivalent?: string }
  >
  borders: {
    radius: Record<
      string,
      { token: string; value: string; description?: string }
    >
    width: Record<
      string,
      { token: string; value: string; description?: string }
    >
  }
  shadows: Record<string, { token: string; value: string }>
  breakpoints: Record<string, { token: string; value: string }>
}

// Zod schema matching GetDesignTokensInput
export const GetDesignTokensSchema = z.object({
  category: z
    .enum([
      'typography',
      'colors',
      'spacing',
      'borders',
      'shadows',
      'breakpoints',
    ])
    .optional()
    .describe('Categoria específica dos design tokens a serem retornados.'),
  theme: z
    .enum(['light', 'dark'])
    .optional()
    .describe(
      'Filtro de tema. Se informado, simplifica o retorno das cores para os valores correspondentes apenas a este tema.'
    ),
})

export type GetDesignTokensInput = z.infer<typeof GetDesignTokensSchema>

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/**
 * Localiza dinamicamente o arquivo DESIGN_TOKENS.md no monorepo
 */
export async function locateDesignTokensPath(): Promise<string> {
  const directPath = path.resolve(process.cwd(), 'references/DESIGN_TOKENS.md')
  try {
    await fs.access(directPath)
    return directPath
  } catch {
    const parentPath = path.resolve(
      __dirname,
      '../../../references/DESIGN_TOKENS.md'
    )
    try {
      await fs.access(parentPath)
      return parentPath
    } catch {
      throw new Error(
        'Não foi possível localizar o arquivo references/DESIGN_TOKENS.md'
      )
    }
  }
}

/**
 * Lê e analisa o arquivo references/DESIGN_TOKENS.md retornando a estrutura JSON de tokens
 */
export async function parseDesignTokens(
  filePath: string
): Promise<DesignTokens> {
  const fileContent = await fs.readFile(filePath, 'utf-8')
  const lines = fileContent.split('\n')

  const tokens: DesignTokens = {
    typography: {
      fontFamilies: {},
      fontSizes: {},
      fontWeights: {},
      lineHeights: {},
    },
    colors: { neutral: {}, accent: {} },
    spacing: {},
    borders: { radius: {}, width: {} },
    shadows: {},
    breakpoints: {},
  }

  let currentSection = ''
  let currentSubSection = ''

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue

    // Detectar Seção Principal
    if (line.startsWith('## ')) {
      const heading = line.replace('## ', '').toLowerCase()
      if (heading.includes('typography') || heading.includes('tipografia')) {
        currentSection = 'typography'
      } else if (heading.includes('colors') || heading.includes('cores')) {
        currentSection = 'colors'
      } else if (
        heading.includes('spacing') ||
        heading.includes('espaçamento')
      ) {
        currentSection = 'spacing'
      } else if (heading.includes('borders') || heading.includes('bordas')) {
        currentSection = 'borders'
      } else if (heading.includes('shadows') || heading.includes('sombras')) {
        currentSection = 'shadows'
      } else if (heading.includes('breakpoints')) {
        currentSection = 'breakpoints'
      } else {
        currentSection = ''
      }
      currentSubSection = ''
      continue
    }

    // Detectar Subseção
    if (line.startsWith('### ')) {
      const heading = line.replace('### ', '').toLowerCase()
      if (currentSection === 'typography') {
        if (heading.includes('famílias') || heading.includes('families')) {
          currentSubSection = 'fontFamilies'
        } else if (heading.includes('tamanhos') || heading.includes('sizes')) {
          currentSubSection = 'fontSizes'
        } else if (heading.includes('pesos') || heading.includes('weights')) {
          currentSubSection = 'fontWeights'
        } else if (heading.includes('altura') || heading.includes('heights')) {
          currentSubSection = 'lineHeights'
        }
      } else if (currentSection === 'colors') {
        if (heading.includes('neutra') || heading.includes('neutral')) {
          currentSubSection = 'neutral'
        } else if (
          heading.includes('acento') ||
          heading.includes('accent') ||
          heading.includes('focus')
        ) {
          currentSubSection = 'accent'
        }
      } else if (currentSection === 'borders') {
        if (heading.includes('raio') || heading.includes('radius')) {
          currentSubSection = 'radius'
        } else if (heading.includes('espessura') || heading.includes('width')) {
          currentSubSection = 'width'
        }
      }
      continue
    }

    // Clean line by removing backticks for easier parsing
    const cleanLine = line.replace(/`/g, '')

    // Processar linhas com base na seção corrente
    if (currentSection === 'typography') {
      if (currentSubSection === 'fontFamilies') {
        if (line.startsWith('- **')) {
          const boldMatch = line.match(/-\s+\*\*(.*?)\*\*/)
          if (boldMatch) {
            const rawDesc = boldMatch[1]
            const desc = rawDesc.endsWith(':')
              ? rawDesc.slice(0, -1).trim()
              : rawDesc.trim()
            let token = ''
            let value = ''
            let nextIndex = i + 1
            while (nextIndex < lines.length) {
              const nextLineTrimmed = lines[nextIndex].trim()
              if (!nextLineTrimmed) {
                nextIndex++
                continue
              }
              if (
                nextLineTrimmed.startsWith('- **') ||
                nextLineTrimmed.startsWith('##') ||
                nextLineTrimmed.startsWith('---')
              ) {
                break
              }
              if (
                lines[nextIndex].startsWith(' ') ||
                lines[nextIndex].startsWith('\t') ||
                nextLineTrimmed.startsWith('-')
              ) {
                const innerClean = nextLineTrimmed.replace(/`/g, '')
                if (innerClean.toLowerCase().includes('token:')) {
                  const tokenMatch = innerClean.match(/token:\s*([^\s]+)/i)
                  if (tokenMatch) token = tokenMatch[1]
                } else if (innerClean.toLowerCase().includes('valor:')) {
                  const valMatch = innerClean.match(/valor:\s*(.*)/i)
                  if (valMatch) value = valMatch[1].trim()
                }
                nextIndex++
              } else {
                break
              }
            }
            if (token) {
              const key = token.replace('--ds-font-family-', '')
              tokens.typography.fontFamilies[key] = {
                token,
                value,
                description: desc,
              }
            }
          }
        }
      } else if (currentSubSection === 'fontSizes') {
        const match = cleanLine.match(
          /-\s+(--ds-font-size-([a-z0-9]+)):\s*([^\s(]+)(?:\s*\((.*?)\))?/
        )
        if (match) {
          const [, token, key, value, pixel] = match
          tokens.typography.fontSizes[key] = {
            token,
            value,
            pixelEquivalent: pixel || undefined,
          }
        }
      } else if (currentSubSection === 'fontWeights') {
        const match = cleanLine.match(
          /-\s+(--ds-font-weight-([a-z0-9]+)):\s*([^\s(]+)/
        )
        if (match) {
          const [, token, key, value] = match
          tokens.typography.fontWeights[key] = { token, value }
        }
      } else if (currentSubSection === 'lineHeights') {
        const match = cleanLine.match(
          /-\s+(--ds-line-height-([a-z0-9]+)):\s*([^\s(]+)/
        )
        if (match) {
          const [, token, key, value] = match
          tokens.typography.lineHeights[key] = { token, value }
        }
      }
    } else if (currentSection === 'colors') {
      if (currentSubSection === 'neutral') {
        // Tabela Markdown
        if (
          line.startsWith('|') &&
          !line.includes('Token') &&
          !line.includes('---') &&
          !line.includes(':---')
        ) {
          const parts = line.split('|').map((p) => p.trim())
          if (parts.length >= 5) {
            const token = parts[1].replace(/`/g, '')
            const light = parts[2].replace(/`/g, '').split(' ')[0].trim()
            const dark = parts[3].replace(/`/g, '').split(' ')[0].trim()
            const use = parts[4]
            if (token.startsWith('--ds-')) {
              const key = token.replace('--ds-color-neutral-', '')
              tokens.colors.neutral[key] = {
                token,
                light,
                dark,
                suggestedUse: use || undefined,
              }
            }
          }
        }
      } else if (currentSubSection === 'accent') {
        const match = cleanLine.match(
          /-\s+(--ds-color-([a-z0-9-]+)):\s*(hsl\(.*?\)|#?[a-f0-9]+)(?:\s*\((.*?)\))?\s+no\s+Light\s+(?:e|and)\s+(hsl\(.*?\)|#?[a-f0-9]+)\s+no\s+Dark/i
        )
        if (match) {
          const [, token, key, light, desc, dark] = match
          tokens.colors.accent[key] = {
            token,
            light,
            dark,
            description: desc || undefined,
          }
        }
      }
    } else if (currentSection === 'spacing') {
      const match = cleanLine.match(
        /-\s+(--ds-spacing-([0-9]+)):\s*([^\s(]+)(?:\s*\((.*?)\))?/
      )
      if (match) {
        const [, token, key, value, pixel] = match
        tokens.spacing[key] = {
          token,
          value,
          pixelEquivalent: pixel || undefined,
        }
      }
    } else if (currentSection === 'borders') {
      if (currentSubSection === 'radius') {
        const match = cleanLine.match(
          /-\s+(--ds-border-radius-([a-z0-9]+)):\s*([^\s(]+)(?:\s*\((.*?)\))?/
        )
        if (match) {
          const [, token, key, value, desc] = match
          tokens.borders.radius[key] = {
            token,
            value,
            description: desc || undefined,
          }
        }
      } else if (currentSubSection === 'width') {
        const match = cleanLine.match(
          /-\s+(--ds-border-width-([a-z0-9]+)):\s*([^\s(]+)(?:\s*\((.*?)\))?/
        )
        if (match) {
          const [, token, key, value, desc] = match
          tokens.borders.width[key] = {
            token,
            value,
            description: desc || undefined,
          }
        }
      }
    } else if (currentSection === 'shadows') {
      const match = cleanLine.match(/-\s+(--ds-shadow-([a-z0-9]+)):\s*(.*)/)
      if (match) {
        const [, token, key, value] = match
        tokens.shadows[key] = { token, value }
      }
    } else if (currentSection === 'breakpoints') {
      const match = cleanLine.match(/-\s+(--ds-breakpoint-([a-z0-9]+)):\s*(.*)/)
      if (match) {
        const [, token, key, value] = match
        tokens.breakpoints[key] = { token, value }
      }
    }
  }

  return tokens
}

/**
 * Filtra e resolve o payload dos tokens dependendo dos argumentos passados
 */
export function filterTokens(
  tokens: DesignTokens,
  category?: string,
  theme?: 'light' | 'dark'
): unknown {
  let result: Record<string, unknown> = {}

  if (category) {
    if (category in tokens) {
      result = { [category]: tokens[category as keyof DesignTokens] }
    } else {
      throw new Error(`Categoria '${category}' não existe nos design tokens.`)
    }
  } else {
    // Deep clone basic object structure
    result = JSON.parse(JSON.stringify(tokens)) as Record<string, unknown>
  }

  if (theme) {
    if (result.colors) {
      const colors = result.colors as DesignTokens['colors']
      const filteredNeutral: Record<
        string,
        { token: string; value: string; suggestedUse?: string }
      > = {}
      const filteredAccent: Record<
        string,
        { token: string; value: string; description?: string }
      > = {}

      if (colors.neutral) {
        for (const [key, val] of Object.entries(colors.neutral)) {
          filteredNeutral[key] = {
            token: val.token,
            value: theme === 'light' ? val.light : val.dark,
            suggestedUse: val.suggestedUse,
          }
        }
      }

      if (colors.accent) {
        for (const [key, val] of Object.entries(colors.accent)) {
          filteredAccent[key] = {
            token: val.token,
            value: theme === 'light' ? val.light : val.dark,
            description: val.description,
          }
        }
      }

      result.colors = {
        neutral: filteredNeutral,
        accent: filteredAccent,
      }
    }
  }

  return result
}
