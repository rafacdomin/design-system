import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { PassThrough } from 'node:stream'
import * as fs from 'fs'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { createServer } from '../server.js'
import { McpTestClient } from './mcp-test-client.js'
import { DOCS_MAP } from '../resources/index.js'

vi.mock('fs', async (importOriginal) => {
  const actual = await importOriginal<typeof import('fs')>()
  const mockExistsSync = vi.fn()
  const mockReadFile = vi.fn()
  const mockReaddir = vi.fn()

  const actualObj = actual as unknown as Record<string, unknown>
  const actualDefault = (actualObj.default || {}) as Record<string, unknown>
  const actualDefaultPromises = (actualDefault.promises || {}) as Record<
    string,
    unknown
  >

  return {
    ...actual,
    existsSync: mockExistsSync,
    promises: {
      ...actual.promises,
      readFile: mockReadFile,
      readdir: mockReaddir,
    },
    default: {
      ...actualDefault,
      existsSync: mockExistsSync,
      promises: {
        ...actualDefaultPromises,
        readFile: mockReadFile,
        readdir: mockReaddir,
      },
    },
  }
})

describe('MCP Server Integration JSON-RPC Tests', () => {
  let clientInput: PassThrough
  let clientOutput: PassThrough
  let transport: StdioServerTransport
  let client: McpTestClient
  let serverPromise: Promise<void>

  beforeEach(async () => {
    vi.restoreAllMocks()
    clientInput = new PassThrough()
    clientOutput = new PassThrough()
    transport = new StdioServerTransport(clientInput, clientOutput)

    const server = createServer()
    serverPromise = server.connect(transport)
    client = new McpTestClient(clientInput, clientOutput)

    // Complete the MCP Handshake
    const initResponse = await client.sendRequest(
      'initialize',
      {
        protocolVersion: '2024-11-05',
        capabilities: {},
        clientInfo: { name: 'test-client', version: '1.0.0' },
      },
      1
    )
    expect(initResponse.error).toBeUndefined()
    client.sendNotification('notifications/initialized')
  })

  afterEach(async () => {
    client.destroy()
    await transport.close()
    await serverPromise
  })

  it('deve retornar a lista de ferramentas disponiveis', async () => {
    const response = await client.sendRequest('tools/list', {}, 2)
    expect(response.error).toBeUndefined()
    const result = response.result as { tools: Array<{ name: string }> }
    expect(result.tools).toBeDefined()
    const names = result.tools.map((t) => t.name)
    expect(names).toContain('get_design_tokens')
    expect(names).toContain('list_components')
    expect(names).toContain('get_component_api')
    expect(names).toContain('get_component_spec')
    expect(names).toContain('get_component_examples')
    expect(names).toContain('ping')
  })

  it('deve executar a ferramenta ping com sucesso', async () => {
    const response = await client.sendRequest(
      'tools/call',
      {
        name: 'ping',
        arguments: {},
      },
      3
    )
    expect(response.error).toBeUndefined()
    const result = response.result as {
      content: Array<{ type: string; text: string }>
    }
    expect(result.content[0].text).toContain('pong!')
  })

  it('deve listar os recursos de documentação disponíveis', async () => {
    const response = await client.sendRequest('resources/list', {}, 4)
    expect(response.error).toBeUndefined()
    const result = response.result as {
      resources: Array<{ uri: string; title: string }>
    }
    expect(result.resources).toBeDefined()
    expect(result.resources.length).toBe(Object.keys(DOCS_MAP).length)

    const uris = result.resources.map((r) => r.uri)
    expect(uris).toContain('design-system://docs/accessibility')
    expect(uris).toContain('design-system://docs/theming')
  })

  it('deve ler um recurso de documentacao com sucesso', async () => {
    const mockExistsSync = vi.mocked(fs.existsSync)
    const mockReadFile = vi.mocked(fs.promises.readFile)

    mockExistsSync.mockReturnValue(true)
    mockReadFile.mockResolvedValue('# Accessibility Doc Content')

    const response = await client.sendRequest(
      'resources/read',
      {
        uri: 'design-system://docs/accessibility',
      },
      5
    )

    expect(response.error).toBeUndefined()
    const result = response.result as {
      contents: Array<{ uri: string; text: string }>
    }
    expect(result.contents[0].text).toBe('# Accessibility Doc Content')
  })

  it('deve retornar erro ao chamar ferramenta inexistente', async () => {
    const response = await client.sendRequest(
      'tools/call',
      {
        name: 'ferramenta_inexistente',
        arguments: {},
      },
      6
    )
    if (response.error) {
      expect(response.error).toBeDefined()
    } else {
      const result = response.result as { isError?: boolean }
      expect(result.isError).toBe(true)
    }
  })

  it('deve retornar erro ao chamar metodo JSON-RPC inexistente', async () => {
    const response = await client.sendRequest('non_existent_method', {}, 99)
    expect(response.error).toBeDefined()
    expect(response.error?.code).toBe(-32601) // Method not found
  })

  it('deve retornar erro de validacao ao passar argumentos invalidos para get_design_tokens', async () => {
    const response = await client.sendRequest(
      'tools/call',
      {
        name: 'get_design_tokens',
        arguments: {
          theme: 'invalid-theme',
        },
      },
      7
    )
    if (response.error) {
      expect(response.error).toBeDefined()
    } else {
      const result = response.result as { isError?: boolean }
      expect(result.isError).toBe(true)
    }
  })

  it('deve retornar erro ao tentar ler um recurso inexistente', async () => {
    const response = await client.sendRequest(
      'resources/read',
      {
        uri: 'design-system://docs/recurso_inexistente',
      },
      8
    )
    expect(response.error).toBeDefined()
  })

  it('deve falhar por timeout se o servidor nao responder', async () => {
    const dummyInput = new PassThrough()
    const dummyOutput = new PassThrough()
    const offlineClient = new McpTestClient(dummyInput, dummyOutput)

    await expect(
      offlineClient.sendRequest('tools/list', {}, 999, 50)
    ).rejects.toThrow('Request timed out after 50ms')

    offlineClient.destroy()
  })
})
