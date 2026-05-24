import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import fs from 'fs/promises'
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js'
import {
  locateDesignTokensPath,
  parseDesignTokens,
  filterTokens,
  DesignTokens,
  GetDesignTokensSchema,
} from '../tools/tokens'

vi.mock('fs/promises')

const mockMarkdownContent = `# Design Tokens (DESIGN_TOKENS.md)

## 1. Tipografia

### 1.1 Famílias de Fontes (Font Families)

- **Sans-serif / Interface (Padrão):** \`Inter\`
  - Token: \`--ds-font-family-sans\`
  - Valor: \`'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif\`
- **Heading / Headings (Destaque):** \`Poppins\`
  - Token: \`--ds-font-family-heading\`
  - Valor: \`'Poppins', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif\`

### 1.2 Tamanhos de Fonte (Font Sizes)

- \`--ds-font-size-xs\`: \`0.75rem\` (12px)
- \`--ds-font-size-sm\`: \`0.875rem\` (14px)

### 1.3 Pesos de Fonte (Font Weights)

- \`--ds-font-weight-regular\`: \`400\`
- \`--ds-font-weight-medium\`: \`505\`

### 1.4 Altura de Linha (Line Heights)

- \`--ds-line-height-none\`: \`1\`
- \`--ds-line-height-tight\`: \`1.25\`

---

## 2. Cores (Escala Monocromática Premium)

### 2.1 Escala Neutra (Neutral Scale)

| Token                     | Light Theme Value (HEX / HSL) | Dark Theme Value (HEX / HSL) | Uso Sugerido                                           |
| :------------------------ | :---------------------------- | :--------------------------- | :----------------------------------------------------- |
| \`--ds-color-neutral-0\`    | \`#ffffff\` (hsl(0, 0%, 100%))  | \`#0a0a0a\` (hsl(0, 0%, 4%))   | Fundo principal da página                              |
| \`--ds-color-neutral-50\`   | \`#f9f9f9\` (hsl(0, 0%, 98%))   | \`#121212\` (hsl(0, 0%, 7%))   | Fundo secundário (ex: cards)                           |

### 2.2 Cores de Acento (Interactive / Focus Styles)

- \`--ds-color-focus-ring\`: \`hsl(0, 0%, 0%)\` no Light e \`hsl(0, 0%, 100%)\` no Dark.
- \`--ds-color-danger\`: \`hsl(0, 84%, 48%)\` no Light e \`hsl(0, 96%, 65%)\` no Dark.

---

## 3. Espaçamento (Spacing)

- \`--ds-spacing-1\`: \`0.25rem\` (4px)
- \`--ds-spacing-2\`: \`0.5rem\` (8px)

---

## 4. Bordas (Borders and Radius)

### 4.1 Raio de Borda (Border Radius)

- \`--ds-border-radius-sm\`: \`2px\` (estética mais angular e moderna)
- \`--ds-border-radius-md\`: \`4px\` (padrão para botões e inputs)

### 4.2 Espessura de Borda (Border Width)

- \`--ds-border-width-sm\`: \`1px\` (padrão)

---

## 5. Sombras (Shadows)

- \`--ds-shadow-sm\`: \`0 1px 2px 0 rgba(0, 0, 0, 0.05)\`

---

## 6. Breakpoints

- \`--ds-breakpoint-sm\`: \`640px\`
`

describe('Design Tokens MCP Tool - Unit Tests', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  describe('locateDesignTokensPath', () => {
    it('should find path directly in references/DESIGN_TOKENS.md if it exists', async () => {
      const accessMock = vi.mocked(fs.access)
      accessMock.mockResolvedValueOnce(undefined) // first access success

      const result = await locateDesignTokensPath()
      expect(result).toContain('references/DESIGN_TOKENS.md')
      expect(accessMock).toHaveBeenCalledTimes(1)
    })

    it('should try fallback path if direct path fails', async () => {
      const accessMock = vi.mocked(fs.access)
      accessMock.mockRejectedValueOnce(new Error('ENOENT')) // first fails
      accessMock.mockResolvedValueOnce(undefined) // fallback succeeds

      const result = await locateDesignTokensPath()
      expect(result).toContain('references/DESIGN_TOKENS.md')
      expect(accessMock).toHaveBeenCalledTimes(2)
    })

    it('should throw error if both paths fail', async () => {
      const accessMock = vi.mocked(fs.access)
      accessMock.mockRejectedValue(new Error('ENOENT'))

      await expect(locateDesignTokensPath()).rejects.toThrow(
        'Não foi possível localizar o arquivo references/DESIGN_TOKENS.md'
      )
    })
  })

  describe('parseDesignTokens', () => {
    it('should parse markdown content correctly into structured object', async () => {
      vi.mocked(fs.readFile).mockResolvedValueOnce(mockMarkdownContent)

      const result = await parseDesignTokens('dummy-path')

      // Typography
      expect(result.typography.fontFamilies.sans).toEqual({
        token: '--ds-font-family-sans',
        value:
          "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        description: 'Sans-serif / Interface (Padrão)',
      })
      expect(result.typography.fontFamilies.heading).toEqual({
        token: '--ds-font-family-heading',
        value:
          "'Poppins', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        description: 'Heading / Headings (Destaque)',
      })

      expect(result.typography.fontSizes.xs).toEqual({
        token: '--ds-font-size-xs',
        value: '0.75rem',
        pixelEquivalent: '12px',
      })

      expect(result.typography.fontWeights.regular).toEqual({
        token: '--ds-font-weight-regular',
        value: '400',
      })

      expect(result.typography.lineHeights.none).toEqual({
        token: '--ds-line-height-none',
        value: '1',
      })

      // Colors
      expect(result.colors.neutral['0']).toEqual({
        token: '--ds-color-neutral-0',
        light: '#ffffff',
        dark: '#0a0a0a',
        suggestedUse: 'Fundo principal da página',
      })
      expect(result.colors.neutral['50']).toEqual({
        token: '--ds-color-neutral-50',
        light: '#f9f9f9',
        dark: '#121212',
        suggestedUse: 'Fundo secundário (ex: cards)',
      })

      expect(result.colors.accent['focus-ring']).toEqual({
        token: '--ds-color-focus-ring',
        light: 'hsl(0, 0%, 0%)',
        dark: 'hsl(0, 0%, 100%)',
      })
      expect(result.colors.accent['danger']).toEqual({
        token: '--ds-color-danger',
        light: 'hsl(0, 84%, 48%)',
        dark: 'hsl(0, 96%, 65%)',
      })

      // Spacing
      expect(result.spacing['1']).toEqual({
        token: '--ds-spacing-1',
        value: '0.25rem',
        pixelEquivalent: '4px',
      })

      // Borders
      expect(result.borders.radius['sm']).toEqual({
        token: '--ds-border-radius-sm',
        value: '2px',
        description: 'estética mais angular e moderna',
      })
      expect(result.borders.width['sm']).toEqual({
        token: '--ds-border-width-sm',
        value: '1px',
        description: 'padrão',
      })

      // Shadows
      expect(result.shadows['sm']).toEqual({
        token: '--ds-shadow-sm',
        value: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      })

      // Breakpoints
      expect(result.breakpoints['sm']).toEqual({
        token: '--ds-breakpoint-sm',
        value: '640px',
      })
    })
  })

  describe('filterTokens', () => {
    const sampleTokens: DesignTokens = {
      typography: {
        fontFamilies: {
          sans: {
            token: '--ds-font-family-sans',
            value: 'sans-val',
            description: 'Sans',
          },
        },
        fontSizes: {
          xs: {
            token: '--ds-font-size-xs',
            value: 'xs-val',
            pixelEquivalent: '12px',
          },
        },
        fontWeights: {
          regular: { token: '--ds-font-weight-regular', value: '400' },
        },
        lineHeights: {
          none: { token: '--ds-line-height-none', value: '1' },
        },
      },
      colors: {
        neutral: {
          '0': {
            token: '--ds-color-neutral-0',
            light: '#ffffff',
            dark: '#000000',
            suggestedUse: 'Main background',
          },
        },
        accent: {
          'focus-ring': {
            token: '--ds-color-focus-ring',
            light: 'black',
            dark: 'white',
          },
        },
      },
      spacing: {
        '1': {
          token: '--ds-spacing-1',
          value: '0.25rem',
          pixelEquivalent: '4px',
        },
      },
      borders: {
        radius: {
          sm: {
            token: '--ds-border-radius-sm',
            value: '2px',
            description: 'Small radius',
          },
        },
        width: {
          sm: { token: '--ds-border-width-sm', value: '1px' },
        },
      },
      shadows: {
        sm: { token: '--ds-shadow-sm', value: 'shadow-val' },
      },
      breakpoints: {
        sm: { token: '--ds-breakpoint-sm', value: '640px' },
      },
    }

    it('should return all tokens if category and theme are not specified', () => {
      const result = filterTokens(sampleTokens)
      expect(result).toEqual(sampleTokens)
    })

    it('should filter by category typography', () => {
      const result = filterTokens(sampleTokens, 'typography')
      expect(result).toEqual({ typography: sampleTokens.typography })
    })

    it('should filter by category colors', () => {
      const result = filterTokens(sampleTokens, 'colors')
      expect(result).toEqual({ colors: sampleTokens.colors })
    })

    it('should throw error for invalid category', () => {
      expect(() => filterTokens(sampleTokens, 'invalid_cat')).toThrow(
        "Categoria 'invalid_cat' não existe nos design tokens."
      )
    })

    it('should resolve colors for light theme', () => {
      const result = filterTokens(
        sampleTokens,
        undefined,
        'light'
      ) as DesignTokens
      expect(result.colors.neutral['0']).toEqual({
        token: '--ds-color-neutral-0',
        value: '#ffffff',
        suggestedUse: 'Main background',
      })
      expect(result.colors.accent['focus-ring']).toEqual({
        token: '--ds-color-focus-ring',
        value: 'black',
      })
    })

    it('should resolve colors for dark theme', () => {
      const result = filterTokens(
        sampleTokens,
        undefined,
        'dark'
      ) as DesignTokens
      expect(result.colors.neutral['0']).toEqual({
        token: '--ds-color-neutral-0',
        value: '#000000',
        suggestedUse: 'Main background',
      })
      expect(result.colors.accent['focus-ring']).toEqual({
        token: '--ds-color-focus-ring',
        value: 'white',
      })
    })

    it('should filter category colors and resolve light theme', () => {
      const result = filterTokens(sampleTokens, 'colors', 'light') as Record<
        string,
        Record<string, Record<string, unknown>>
      >
      expect(result.colors.neutral['0']).toEqual({
        token: '--ds-color-neutral-0',
        value: '#ffffff',
        suggestedUse: 'Main background',
      })
      expect(result.typography).toBeUndefined()
    })
  })
})

describe('Design Tokens MCP Tool - Integration Tests', () => {
  let server: McpServer
  let client: Client
  let serverTransport: InMemoryTransport
  let clientTransport: InMemoryTransport

  beforeEach(async () => {
    server = new McpServer({
      name: 'test-design-system-mcp-server',
      version: '1.0.0',
    })

    // Register the actual get_design_tokens tool with error handling
    server.registerTool(
      'get_design_tokens',
      {
        description:
          'Retorna os design tokens do projeto de forma estruturada, com opção de filtro por categoria e por tema.',
        inputSchema: GetDesignTokensSchema.shape,
      },
      async (args) => {
        try {
          const tokensPath = await locateDesignTokensPath()
          const allTokens = await parseDesignTokens(tokensPath)
          const filtered = filterTokens(allTokens, args.category, args.theme)
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(filtered),
              },
            ],
          }
        } catch (error: unknown) {
          const errorMessage =
            error instanceof Error ? error.message : String(error)
          return {
            isError: true,
            content: [
              {
                type: 'text',
                text: `Erro ao carregar design tokens: ${errorMessage}`,
              },
            ],
          }
        }
      }
    )

    const [t1, t2] = InMemoryTransport.createLinkedPair()
    serverTransport = t1
    clientTransport = t2

    client = new Client({
      name: 'test-client',
      version: '1.0.0',
    })

    await Promise.all([
      server.connect(serverTransport),
      client.connect(clientTransport),
    ])
  })

  afterEach(async () => {
    await Promise.all([server.close(), client.close()])
  })

  it('should call get_design_tokens via client request successfully', async () => {
    vi.mocked(fs.access).mockResolvedValue(undefined)
    vi.mocked(fs.readFile).mockResolvedValue(mockMarkdownContent)

    const response = (await client.callTool({
      name: 'get_design_tokens',
      arguments: {
        category: 'spacing',
      },
    })) as { content: Array<{ type: string; text?: string }> }

    expect(response.content).toHaveLength(1)
    expect(response.content[0].type).toBe('text')

    const parsedText = JSON.parse(response.content[0].text as string) as Record<
      string,
      Record<string, unknown>
    >
    expect(parsedText.spacing['1']).toEqual({
      token: '--ds-spacing-1',
      value: '0.25rem',
      pixelEquivalent: '4px',
    })
  })

  it('should return error response when tool parsing fails', async () => {
    vi.mocked(fs.access).mockRejectedValue(new Error('File not found'))

    const response = (await client.callTool({
      name: 'get_design_tokens',
      arguments: {},
    })) as {
      content: Array<{ type: string; text?: string }>
      isError?: boolean
    }

    expect(response.isError).toBe(true)
    expect(response.content).toHaveLength(1)
    expect(response.content[0].type).toBe('text')
    expect(response.content[0].text).toContain(
      'Erro ao carregar design tokens:'
    )
  })
})
