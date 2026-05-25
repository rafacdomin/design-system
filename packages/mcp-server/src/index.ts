import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { createServer } from './server.js'

async function main() {
  const server = createServer()
  const transport = new StdioServerTransport()
  await server.connect(transport)

  // Apenas logs em stderr são permitidos
  console.error('Design System MCP Server conectado e rodando no canal Stdio.')
}

main().catch((error: unknown) => {
  console.error('Erro fatal ao iniciar o servidor MCP:', error)
  process.exit(1)
})
