import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import * as fs from 'fs'
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js'
import {
  getComponentExamples,
  GetComponentExamplesSchema,
} from '../tools/examples'

vi.mock('fs', () => {
  return {
    existsSync: vi.fn(),
    readFileSync: vi.fn(),
    promises: {
      readdir: vi.fn(),
      readFile: vi.fn(),
    },
  }
})

const mockButtonStoryContent = `
import type { Meta, StoryObj } from '@storybook/react'
import { Button, ButtonProps } from '@ds/core'

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
}

export default meta
type Story = StoryObj<typeof Button>

export const Playground: Story = {
  args: {
    variant: 'primary',
    children: 'Click me',
    disabled: false,
  },
}

export const AsChild: Story = {
  render: (args: ButtonProps) => (
    <Button {...args} asChild>
      <a href="/test">Link</a>
    </Button>
  ),
  args: {
    variant: 'secondary',
  },
}
`

const mockDropdownStoryContent = `
import type { Meta, StoryObj } from '@storybook/react'
import { Dropdown } from '@ds/core'

const meta: Meta<typeof Dropdown> = {
  title: 'Components/Dropdown',
  component: Dropdown,
  render: (args) => (
    <Dropdown {...args}>
      <Dropdown.Item value="1">Item 1</Dropdown.Item>
    </Dropdown>
  ),
}

export default meta
type Story = StoryObj<typeof Dropdown>

export const Playground: Story = {
  args: {
    label: 'Dropdown Label',
  },
}
`

describe('getComponentExamples - Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should parse a basic story successfully and format attributes', async () => {
    const mockReaddir = vi.mocked(fs.promises.readdir)
    const mockReadFile = vi.mocked(fs.promises.readFile)
    const mockExistsSync = vi.mocked(fs.existsSync)

    mockExistsSync.mockReturnValue(true)
    mockReaddir.mockResolvedValue(['Button.stories.tsx'] as unknown as never)
    mockReadFile.mockResolvedValue(mockButtonStoryContent)

    const result = await getComponentExamples('Button', '/fake/stories')

    expect(result.componentName).toBe('Button')
    expect(result.imports).toContain(
      "import { Button, ButtonProps } from '@ds/core'"
    )

    // Should contain ThemedIntegration, Playground, and AsChild
    expect(result.examples).toHaveLength(3)

    // ThemedIntegration
    expect(result.examples[0].name).toBe('ThemedIntegration')
    expect(result.examples[0].code).toContain(
      '<ThemeProvider defaultTheme="dark">'
    )

    // Playground
    const playground = result.examples.find((e) => e.name === 'Playground')
    expect(playground).toBeDefined()
    expect(playground?.code).toBe(
      '<Button variant="primary" disabled={false}>\n  Click me\n</Button>'
    )

    // AsChild
    const asChild = result.examples.find((e) => e.name === 'AsChild')
    expect(asChild).toBeDefined()
    expect(asChild?.code).toContain('<Button variant="secondary" asChild>')
    expect(asChild?.code).toContain('<a href="/test">Link</a>')
  })

  it('should handle inherited render functions from meta', async () => {
    const mockReaddir = vi.mocked(fs.promises.readdir)
    const mockReadFile = vi.mocked(fs.promises.readFile)
    const mockExistsSync = vi.mocked(fs.existsSync)

    mockExistsSync.mockReturnValue(true)
    mockReaddir.mockResolvedValue(['Dropdown.stories.tsx'] as unknown as never)
    mockReadFile.mockResolvedValue(mockDropdownStoryContent)

    const result = await getComponentExamples('Dropdown', '/fake/stories')

    expect(result.componentName).toBe('Dropdown')
    const playground = result.examples.find((e) => e.name === 'Playground')
    expect(playground).toBeDefined()
    expect(playground?.code).toContain('<Dropdown label="Dropdown Label">')
    expect(playground?.code).toContain(
      '<Dropdown.Item value="1">Item 1</Dropdown.Item>'
    )
  })

  it('should throw error when story file is not found', async () => {
    const mockReaddir = vi.mocked(fs.promises.readdir)
    const mockExistsSync = vi.mocked(fs.existsSync)

    mockExistsSync.mockReturnValue(true)
    mockReaddir.mockResolvedValue(['Dropdown.stories.tsx'] as unknown as never)

    await expect(
      getComponentExamples('Button', '/fake/stories')
    ).rejects.toThrow(
      'Stories para o componente "Button" não foram encontrados.'
    )
  })
})

describe('get_component_examples MCP Tool - Integration Tests', () => {
  let server: McpServer
  let client: Client
  let serverTransport: InMemoryTransport
  let clientTransport: InMemoryTransport

  beforeEach(async () => {
    server = new McpServer({
      name: 'test-examples-server',
      version: '1.0.0',
    })

    server.registerTool(
      'get_component_examples',
      {
        description: 'Get component examples',
        inputSchema: GetComponentExamplesSchema.shape,
      },
      async (args) => {
        try {
          const result = await getComponentExamples(
            args.componentName,
            '/fake/stories'
          )
          return {
            content: [{ type: 'text', text: JSON.stringify(result) }],
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

  it('should execute get_component_examples via client call successfully', async () => {
    const mockReaddir = vi.mocked(fs.promises.readdir)
    const mockReadFile = vi.mocked(fs.promises.readFile)
    const mockExistsSync = vi.mocked(fs.existsSync)

    mockExistsSync.mockReturnValue(true)
    mockReaddir.mockResolvedValue(['Button.stories.tsx'] as unknown as never)
    mockReadFile.mockResolvedValue(mockButtonStoryContent)

    const response = (await client.callTool({
      name: 'get_component_examples',
      arguments: { componentName: 'Button' },
    })) as { content: Array<{ type: string; text?: string }> }

    expect(response.content).toHaveLength(1)
    const result = JSON.parse(response.content[0].text as string)
    expect(result.componentName).toBe('Button')
    expect(result.examples).toBeDefined()
  })
})
