import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import * as path from 'path'
import {
  GetDesignTokensSchema,
  locateDesignTokensPath,
  parseDesignTokens,
  filterTokens,
  ListComponentsSchema,
  GetComponentApiSchema,
  GetComponentSpecSchema,
  GetComponentExamplesSchema,
  scanComponents,
  parseComponentApi,
  parseComponentSpec,
  getComponentExamples,
  findProjectRoot,
} from './tools/index.js'

// Inicializa o servidor MCP do Design System
const server = new McpServer({
  name: 'design-system-mcp-server',
  version: '1.0.0',
})

// Registro de ferramenta get_design_tokens
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
            text: JSON.stringify(filtered, null, 2),
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

// Registro de ferramenta list_components
server.registerTool(
  'list_components',
  {
    description:
      'Lista todos os componentes disponíveis no Design System, permitindo filtrar por pacote (core, carousel ou all).',
    inputSchema: ListComponentsSchema.shape,
  },
  async (args) => {
    try {
      const components = await scanComponents(args.package)
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(components, null, 2),
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
            text: `Erro ao listar componentes: ${errorMessage}`,
          },
        ],
      }
    }
  }
)

// Registro de ferramenta get_component_api
server.registerTool(
  'get_component_api',
  {
    description:
      'Retorna as interfaces TypeScript e propriedades (API) do componente com seus comentários JSDoc.',
    inputSchema: GetComponentApiSchema.shape,
  },
  async (args) => {
    try {
      const components = await scanComponents('all')
      const target = components.find(
        (c) => c.name.toLowerCase() === args.componentName.toLowerCase()
      )
      if (!target) {
        throw new Error(
          `Componente '${args.componentName}' não encontrado no projeto.`
        )
      }
      const rootDir = findProjectRoot()
      const absolutePath = path.resolve(
        rootDir,
        target.path,
        `${target.name}.tsx`
      )
      const api = parseComponentApi(absolutePath)
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(api, null, 2),
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
            text: `Erro ao obter API do componente: ${errorMessage}`,
          },
        ],
      }
    }
  }
)

// Registro de ferramenta get_component_spec
server.registerTool(
  'get_component_spec',
  {
    description:
      'Retorna as especificações funcionais, regras de acessibilidade WCAG/WAI-ARIA e comportamentos de estados do componente a partir do COMPONENT_SPEC.md.',
    inputSchema: GetComponentSpecSchema.shape,
  },
  async (args) => {
    try {
      const spec = parseComponentSpec(args.componentName)
      if (!spec) {
        throw new Error(
          `Especificação do componente '${args.componentName}' não encontrada no COMPONENT_SPEC.md.`
        )
      }
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(spec, null, 2),
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
            text: `Erro ao obter especificação do componente: ${errorMessage}`,
          },
        ],
      }
    }
  }
)

// Registro de ferramenta get_component_examples
server.registerTool(
  'get_component_examples',
  {
    description:
      'Retorna exemplos de código e snippets de uso prático dos componentes a partir de suas histórias no Storybook.',
    inputSchema: GetComponentExamplesSchema.shape,
  },
  async (args) => {
    try {
      const examples = await getComponentExamples(args.componentName)
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(examples, null, 2),
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
            text: `Erro ao obter exemplos do componente: ${errorMessage}`,
          },
        ],
      }
    }
  }
)

// Registro de ferramenta de teste simples (ping)
server.registerTool(
  'ping',
  {
    description: 'Verifica a conectividade do servidor MCP do Design System',
  },
  async () => {
    return {
      content: [
        {
          type: 'text',
          text: 'pong! O servidor MCP do Design System está online e funcionando.',
        },
      ],
    }
  }
)

async function main() {
  const transport = new StdioServerTransport()
  await server.connect(transport)

  // Apenas logs em stderr são permitidos
  console.error('Design System MCP Server conectado e rodando no canal Stdio.')
}

main().catch((error: unknown) => {
  console.error('Erro fatal ao iniciar o servidor MCP:', error)
  process.exit(1)
})
