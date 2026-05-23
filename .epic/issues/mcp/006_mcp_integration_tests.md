# 006 — Testes Unitários, de Integração JSON-RPC e Validação

## Status

[x] Planejada [ ] Em desenvolvimento [ ] Concluída

## Objetivo

Escrever testes unitários completos e testes de integração JSON-RPC usando `Vitest` para garantir o funcionamento correto e robusto do servidor MCP, seguido de validação em ambiente real utilizando a ferramenta oficial `@modelcontextprotocol/inspector`.

## Critérios de Aceite

- [ ] Suite de testes unitários em `packages/mcp-server/src/__tests__/` com cobertura de 100% nas funções de parse e mapeamento de recursos e ferramentas.
- [ ] Suite de testes de integração JSON-RPC que simula o fluxo do ciclo de vida do servidor (inicialização via handshake, chamada de `list_components`, `get_design_tokens` e leitura de recurso `design-system://docs/accessibility`) escrevendo na stream `stdin` e lendo a stream `stdout` mockadas.
- [ ] Zero uso de tipos `any` nas declarações e asserções de mock de streams ou mocks do SDK do MCP.
- [ ] Validação do build de produção (`pnpm build`) executada sem erros de compilação ou de types.
- [ ] Execução manual com sucesso do inspector de MCP localmente para assegurar a conformidade do servidor com os padrões formais do protocolo.

## Arquivos a Criar/Modificar

- `packages/mcp-server/src/__tests__/server.test.ts` — suite de testes unitários e de integração do servidor MCP
- `packages/mcp-server/src/__tests__/mcp-test-client.ts` — cliente auxiliar de testes JSON-RPC mockando streams
- `packages/mcp-server/package.json` — inclusão de dependências e script de teste (`pnpm test`)
- `packages/mcp-server/vitest.config.ts` — configuração do Vitest para o pacote do servidor MCP

## Dependências Externas

- `@modelcontextprotocol/inspector` (para teste manual/validação)
- `vitest`

## Depende de

#002 (get_design_tokens), #003 (Ferramentas de Componentes), #004 (get_component_examples), #005 (Recursos MCP)

## Estimativa

M

## Pesquisa

A estratégia ideal para testar servidores MCP baseados em `stdio` transport sem levantar processos filhos pesados ou poluir os fluxos de processos globais consiste em injetar streams em memória (`stream.PassThrough` do Node.js) diretamente no construtor de `StdioServerTransport` do SDK do MCP.

### Injeção de Streams no Construtor

No SDK do MCP para Node.js/TypeScript, a classe `StdioServerTransport` possui o seguinte construtor:

```typescript
constructor(
  private _stdin: Readable = process.stdin,
  private _stdout: Writable = process.stdout
)
```

Isso nos permite passar instâncias de `PassThrough` personalizadas:

- `clientInput` (um `PassThrough` atuando como a entrada do servidor, onde o cliente escreve dados).
- `clientOutput` (um `PassThrough` atuando como a saída do servidor, de onde o cliente lê dados).

### Fluxo de Handshake do Protocolo MCP

Antes de qualquer interação (como listar ferramentas ou ler recursos), o protocolo MCP exige que o cliente e o servidor realizem um handshake de inicialização:

1. **Initialize Request (`initialize`):** O cliente envia uma requisição JSON-RPC contendo a versão do protocolo pretendida, capacidades suportadas pelo cliente (`capabilities`), e informações do cliente (`clientInfo`).
2. **Server Response:** O servidor avalia a versão compatível, retorna suas próprias capacidades (como `tools`, `resources` e `prompts`), suas informações identificadoras (`serverInfo`) e atualiza seu estado para `initializing`.
3. **Initialized Notification (`notifications/initialized`):** O cliente responde com uma notificação (método JSON-RPC sem campo `id`) informando que o handshake foi concluído. A partir desse momento, o servidor entra em estado de pleno funcionamento e aceita requisições operacionais.

Qualquer tentativa de consultar `tools/list` ou `resources/read` antes do término do handshake retornará erro ou falhará.

## Implementação Planejada

### Estrutura de Arquivos de Teste

```
packages/mcp-server/
├── vitest.config.ts
├── package.json
└── src/
    ├── index.ts              # Exporta a fábrica/setup do servidor
    └── __tests__/
        ├── mcp-test-client.ts # Auxiliar para mockar a stream e gerenciar JSON-RPC
        └── server.test.ts     # Suite de testes integrados e unitários
```

### Pseudocódigo do Cliente Auxiliar (`mcp-test-client.ts`)

```typescript
import { PassThrough } from 'node:stream'

export interface JsonRpcResponse {
  jsonrpc: '2.0'
  id: number
  result?: unknown
  error?: {
    code: number
    message: string
    data?: unknown
  }
}

export class McpTestClient {
  private input: PassThrough
  private output: PassThrough
  private buffer = ''
  private pendingResolvers: ((message: JsonRpcResponse) => void)[] = []

  constructor(input: PassThrough, output: PassThrough) {
    this.input = input
    this.output = output

    this.output.on('data', (chunk: Buffer | string) => {
      this.buffer += chunk.toString()
      let newlineIndex: number
      while ((newlineIndex = this.buffer.indexOf('\n')) !== -1) {
        const line = this.buffer.slice(0, newlineIndex).trim()
        this.buffer = this.buffer.slice(newlineIndex + 1)
        if (line) {
          try {
            const parsed = JSON.parse(line) as JsonRpcResponse
            const resolver = this.pendingResolvers.shift()
            if (resolver) {
              resolver(parsed)
            }
          } catch (e) {
            console.error('Falha ao interpretar JSON-RPC:', line, e)
          }
        }
      }
    })
  }

  public sendRequest(
    method: string,
    params: Record<string, unknown> = {},
    id: number
  ): Promise<JsonRpcResponse> {
    const request = {
      jsonrpc: '2.0' as const,
      id,
      method,
      params,
    }
    return new Promise<JsonRpcResponse>((resolve) => {
      this.pendingResolvers.push(resolve)
      this.input.write(JSON.stringify(request) + '\n')
    })
  }

  public sendNotification(
    method: string,
    params: Record<string, unknown> = {}
  ): void {
    const notification = {
      jsonrpc: '2.0' as const,
      method,
      params,
    }
    this.input.write(JSON.stringify(notification) + '\n')
  }
}
```

### Pseudocódigo de Teste de Integração (`server.test.ts`)

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { PassThrough } from 'node:stream'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { createServer } from '../server.js' // Função fábrica
import { McpTestClient } from './mcp-test-client.js'

describe('MCP Server Integration Tests', () => {
  let clientInput: PassThrough
  let clientOutput: PassThrough
  let transport: StdioServerTransport
  let client: McpTestClient
  let serverPromise: Promise<void>

  beforeEach(() => {
    clientInput = new PassThrough()
    clientOutput = new PassThrough()
    transport = new StdioServerTransport(clientInput, clientOutput)

    const server = createServer()
    serverPromise = server.connect(transport)
    client = new McpTestClient(clientInput, clientOutput)
  })

  afterEach(async () => {
    await transport.close()
    await serverPromise
  })

  it('deve completar o handshake de inicialização e listar ferramentas', async () => {
    // 1. Enviar requisição de initialize
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
    expect(initResponse.result).toBeDefined()

    // 2. Enviar notificação initialized para concluir handshake
    client.sendNotification('notifications/initialized')

    // 3. Executar listagem de ferramentas
    const toolsResponse = await client.sendRequest('tools/list', {}, 2)
    expect(toolsResponse.error).toBeUndefined()
    const result = toolsResponse.result as { tools: Array<{ name: string }> }
    expect(result.tools).toBeDefined()

    const names = result.tools.map((t) => t.name)
    expect(names).toContain('get_design_tokens')
    expect(names).toContain('list_components')
  })
})
```

## Decisões Técnicas

1. **Uso de Streams In-Memory (`PassThrough`):** Evita a necessidade de criar processos filhos (`child_process.fork`), tornando os testes extremamente rápidos, estáveis e fáceis de debugar no ambiente integrado do Vitest.
2. **Desacoplamento do Servidor e Transporte:** O ponto de entrada principal do servidor não inicializará o transporte com efeitos colaterais globais (`process.stdin`/`process.stdout`) diretamente se importado. A inicialização será encapsulada em uma função fábrica (`createServer()`), facilitando a injeção do transporte de testes.
3. **Gerenciamento de Tipagem Rígida (Strict TS):** Como regra absoluta do projeto, não será utilizado o tipo `any` em nenhuma asserção de mock ou tipagem das requisições JSON-RPC. Usaremos interfaces explícitas que espelham o protocolo e a asserção `unknown` se necessário.
4. **Resolução Determinística de Linhas (Buffering):** Devido à natureza assíncrona e em pacotes (`chunks`) das streams do Node, o buffer de entrada do teste concatenará fragmentos e só resolverá os objetos JSON-RPC a partir de quebras de linha (`\n`), garantindo robustez caso uma mensagem longa seja fatiada em trânsito.

## Checklist de Implementação

- [ ] 1. Configurar dependência do `vitest` no `package.json` de `packages/mcp-server`
- [ ] 2. Adicionar script `"test": "vitest run"` no `package.json` do servidor MCP
- [ ] 3. Criar arquivo de configuração `packages/mcp-server/vitest.config.ts` herdando os padrões do monorepo
- [ ] 4. Ajustar `tsconfig.json` do servidor para incluir diretórios e referências de tipos de teste do Vitest
- [ ] 5. Criar `packages/mcp-server/src/__tests__/mcp-test-client.ts` para orquestração de testes JSON-RPC
- [ ] 6. Garantir que nenhuma tipagem do arquivo `mcp-test-client.ts` contenha `any`
- [ ] 7. Implementar parser de quebra de linha com buffer em `mcp-test-client.ts` para processamento correto de pacotes parciais
- [ ] 8. Criar arquivo principal de testes `packages/mcp-server/src/__tests__/server.test.ts`
- [ ] 9. Refatorar o ponto de entrada em `packages/mcp-server/src/index.ts` expor a fábrica `createServer` sem side-effects
- [ ] 10. Implementar teste integrado de Handshake básico (`initialize` + `notifications/initialized`)
- [ ] 11. Implementar teste integrado para chamada à ferramenta `get_design_tokens` após handshake
- [ ] 12. Implementar teste integrado para chamada à ferramenta `list_components`
- [ ] 13. Implementar teste integrado para chamada à ferramenta `get_component_api` e validar erros de parâmetros inválidos
- [ ] 14. Implementar teste integrado para chamada à ferramenta `get_component_spec` e validação do parse de COMPONENT_SPEC.md
- [ ] 15. Implementar teste integrado para chamada à ferramenta `get_component_examples`
- [ ] 16. Implementar teste integrado para leitura de recursos mapeados em `design-system://docs/*`
- [ ] 17. Implementar teste específico de segurança contra Directory Traversal em `resources/read`
- [ ] 18. Adicionar testes unitários com cobertura de 100% nas funções de mapeamento e parsing interno do servidor
- [ ] 19. Validar a execução completa da suíte de testes localmente
- [ ] 20. Executar a validação manual usando o `@modelcontextprotocol/inspector` apontando para o build de produção do servidor
