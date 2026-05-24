import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'

// Inicializa o servidor MCP do Design System
const server = new McpServer({
  name: 'design-system-mcp-server',
  version: '1.0.0',
})

// Registro de ferramenta de teste simples (ping)
server.tool(
  'ping',
  'Verifica a conectividade do servidor MCP do Design System',
  {},
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
