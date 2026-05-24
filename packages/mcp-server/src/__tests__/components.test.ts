import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import * as fs from 'fs'
import * as path from 'path'
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js'
import {
  scanComponents,
  parseComponentApi,
  parseComponentSpec,
  ListComponentsSchema,
  GetComponentApiSchema,
  GetComponentSpecSchema,
} from '../tools/components'

vi.mock('fs', async (importOriginal) => {
  const actual = await importOriginal<typeof import('fs')>()
  const mockExistsSync = vi.fn()
  const mockReadFileSync = vi.fn()
  const mockReaddir = vi.fn()
  const mockReadFile = vi.fn()

  const actualObj = actual as unknown as Record<string, unknown>
  const actualDefault = (actualObj.default || {}) as Record<string, unknown>
  const actualDefaultPromises = (actualDefault.promises || {}) as Record<
    string,
    unknown
  >

  return {
    ...actual,
    existsSync: mockExistsSync,
    readFileSync: mockReadFileSync,
    promises: {
      ...actual.promises,
      readdir: mockReaddir,
      readFile: mockReadFile,
    },
    default: {
      ...actualDefault,
      existsSync: mockExistsSync,
      readFileSync: mockReadFileSync,
      promises: {
        ...actualDefaultPromises,
        readdir: mockReaddir,
        readFile: mockReadFile,
      },
    },
  }
})

const mockTsxContent = `
import React from 'react'

/**
 * Propriedades para o componente Button
 */
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Variante estética */
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  /** Se verdadeiro, renderiza um spinner */
  loading?: boolean
}

export interface ButtonIconProps {
  /** Nome do ícone */
  name: string
}
`

const mockSpecMarkdownContent = `# Especificações de Componentes (COMPONENT_SPEC.md)

Este documento especifica a API, variantes, estados e acessibilidade exigidos.

---

## 1. Button

Botão de ação principal, secundário ou utilitário.

### 1.1 Props

\`\`\`typescript
export interface ButtonProps {}
\`\`\`

### 1.2 Comportamentos e Estados

- **Hover/Focus:** Transição suave.
- **Acessibilidade:** Ativado com Enter.

---

## 2. Input

Campo de entrada de texto de linha única.

### 2.1 Props

\`\`\`typescript
export interface InputProps {}
\`\`\`
`

describe('Components MCP Tools - Unit Tests', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  describe('scanComponents', () => {
    it('should scan components directories and return metadata', async () => {
      const mockReaddir = vi.mocked(fs.promises.readdir)
      const mockExistsSync = vi.mocked(fs.existsSync)
      const mockReadFile = vi.mocked(fs.promises.readFile)

      // Mocking core components readdir
      mockReaddir.mockResolvedValueOnce([
        { name: 'Button', isDirectory: () => true },
        { name: 'RandomFile.txt', isDirectory: () => false },
      ] as unknown as never)

      // Mocking carousel components readdir
      mockReaddir.mockResolvedValueOnce([
        { name: 'Carousel', isDirectory: () => true },
      ] as unknown as never)

      // Mock tsx exists checks
      mockExistsSync.mockReturnValue(true)

      // Mock findSubcomponents read
      mockReadFile.mockResolvedValue('Button.Icon = ...\nButton.Text = ...')

      const result = await scanComponents('all')

      expect(result).toHaveLength(2)
      expect(result[0]).toEqual({
        name: 'Button',
        package: 'core',
        path: expect.stringContaining('Button'),
        subcomponents: ['Icon', 'Text'],
      })
      expect(result[1].name).toBe('Carousel')
    })

    it('should filter components by package', async () => {
      const mockReaddir = vi.mocked(fs.promises.readdir)
      const mockExistsSync = vi.mocked(fs.existsSync)
      const mockReadFile = vi.mocked(fs.promises.readFile)

      mockReaddir.mockResolvedValueOnce([
        { name: 'Button', isDirectory: () => true },
      ] as unknown as never)

      mockExistsSync.mockReturnValue(true)
      mockReadFile.mockResolvedValue('')

      const result = await scanComponents('core')
      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('Button')
      expect(result[0].package).toBe('core')
      expect(mockReaddir).toHaveBeenCalledTimes(1)
    })
  })

  describe('parseComponentApi', () => {
    it('should parse TypeScript AST and return properties with JSDoc comments', () => {
      const mockReadFileSync = vi.mocked(fs.readFileSync)
      mockReadFileSync.mockReturnValue(mockTsxContent)

      const result = parseComponentApi('dummy/Button.tsx')

      expect(result).toHaveLength(2)
      expect(result[0].name).toBe('ButtonProps')
      expect(result[0].props).toHaveLength(2)

      expect(result[0].props[0]).toEqual({
        name: 'variant',
        type: "'primary' | 'secondary' | 'ghost' | 'danger'",
        isOptional: true,
        description: 'Variante estética',
      })

      expect(result[0].props[1]).toEqual({
        name: 'loading',
        type: 'boolean',
        isOptional: true,
        description: 'Se verdadeiro, renderiza um spinner',
      })

      expect(result[1].name).toBe('ButtonIconProps')
      expect(result[1].props[0]).toEqual({
        name: 'name',
        type: 'string',
        isOptional: false,
        description: 'Nome do ícone',
      })
    })
  })

  describe('parseComponentSpec', () => {
    it('should slice COMPONENT_SPEC.md and return requested sections', () => {
      const mockExistsSync = vi.mocked(fs.existsSync)
      const mockReadFileSync = vi.mocked(fs.readFileSync)

      mockExistsSync.mockReturnValue(true)
      mockReadFileSync.mockReturnValue(mockSpecMarkdownContent)

      const result = parseComponentSpec('Button')

      expect(result).not.toBeNull()
      if (result) {
        expect(result.name).toBe('Button')
        expect(result.description).toContain('Botão de ação principal')
        expect(result.sections['Props']).toBeDefined()
        expect(result.sections['Comportamentos e Estados']).toContain(
          'Hover/Focus'
        )
      }
    })

    it('should return null for non-existent component in spec', () => {
      const mockExistsSync = vi.mocked(fs.existsSync)
      const mockReadFileSync = vi.mocked(fs.readFileSync)

      mockExistsSync.mockReturnValue(true)
      mockReadFileSync.mockReturnValue(mockSpecMarkdownContent)

      const result = parseComponentSpec('NonExistent')
      expect(result).toBeNull()
    })
  })
})

describe('Components MCP Tools - Integration Tests', () => {
  let server: McpServer
  let client: Client
  let serverTransport: InMemoryTransport
  let clientTransport: InMemoryTransport

  beforeEach(async () => {
    server = new McpServer({
      name: 'test-components-server',
      version: '1.0.0',
    })

    // Register actual list_components
    server.registerTool(
      'list_components',
      {
        description: 'List tools',
        inputSchema: ListComponentsSchema.shape,
      },
      async (args) => {
        const comps = await scanComponents(args.package)
        return {
          content: [{ type: 'text', text: JSON.stringify(comps) }],
        }
      }
    )

    // Register actual get_component_api
    server.registerTool(
      'get_component_api',
      {
        description: 'Get API',
        inputSchema: GetComponentApiSchema.shape,
      },
      async (args) => {
        try {
          const comps = await scanComponents('all')
          const target = comps.find(
            (c) => c.name.toLowerCase() === args.componentName.toLowerCase()
          )
          if (!target) {
            throw new Error(
              `Componente '${args.componentName}' não encontrado no projeto.`
            )
          }
          const absolutePath = path.resolve(
            process.cwd(),
            target.path,
            `${target.name}.tsx`
          )
          const api = parseComponentApi(absolutePath)
          return {
            content: [{ type: 'text', text: JSON.stringify(api) }],
          }
        } catch (err: unknown) {
          return {
            isError: true,
            content: [
              {
                type: 'text',
                text: err instanceof Error ? err.message : String(err),
              },
            ],
          }
        }
      }
    )

    // Register actual get_component_spec
    server.registerTool(
      'get_component_spec',
      {
        description: 'Get spec',
        inputSchema: GetComponentSpecSchema.shape,
      },
      async (args) => {
        try {
          const spec = parseComponentSpec(args.componentName)
          if (!spec) {
            throw new Error(
              `Especificação do componente '${args.componentName}' não encontrada.`
            )
          }
          return {
            content: [{ type: 'text', text: JSON.stringify(spec) }],
          }
        } catch (err: unknown) {
          return {
            isError: true,
            content: [
              {
                type: 'text',
                text: err instanceof Error ? err.message : String(err),
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

  it('should call list_components', async () => {
    const mockReaddir = vi.mocked(fs.promises.readdir)
    const mockExistsSync = vi.mocked(fs.existsSync)
    const mockReadFile = vi.mocked(fs.promises.readFile)

    mockReaddir.mockResolvedValue([
      { name: 'Button', isDirectory: () => true },
    ] as unknown as never)
    mockExistsSync.mockReturnValue(true)
    mockReadFile.mockResolvedValue('')

    const response = (await client.callTool({
      name: 'list_components',
      arguments: {},
    })) as { content: Array<{ type: string; text?: string }> }

    expect(response.content).toHaveLength(1)
    const comps = JSON.parse(response.content[0].text as string) as Array<{
      name: string
    }>
    expect(comps[0].name).toBe('Button')
  })

  it('should call get_component_api successfully', async () => {
    const mockReaddir = vi.mocked(fs.promises.readdir)
    const mockExistsSync = vi.mocked(fs.existsSync)
    const mockReadFile = vi.mocked(fs.promises.readFile)
    const mockReadFileSync = vi.mocked(fs.readFileSync)

    mockReaddir.mockResolvedValue([
      { name: 'Button', isDirectory: () => true },
    ] as unknown as never)
    mockExistsSync.mockReturnValue(true)
    mockReadFile.mockResolvedValue('')
    mockReadFileSync.mockReturnValue(mockTsxContent)

    const response = (await client.callTool({
      name: 'get_component_api',
      arguments: { componentName: 'Button' },
    })) as { content: Array<{ type: string; text?: string }> }

    expect(response.content).toHaveLength(1)
    const api = JSON.parse(response.content[0].text as string) as Array<{
      name: string
    }>
    expect(api[0].name).toBe('ButtonProps')
  })

  it('should return error response from get_component_api if component is not found', async () => {
    const mockReaddir = vi.mocked(fs.promises.readdir)
    mockReaddir.mockResolvedValue([])

    const response = (await client.callTool({
      name: 'get_component_api',
      arguments: { componentName: 'NonExistent' },
    })) as {
      content: Array<{ type: string; text?: string }>
      isError?: boolean
    }

    expect(response.isError).toBe(true)
    expect(response.content[0].text).toContain(
      "Componente 'NonExistent' não encontrado"
    )
  })
})
