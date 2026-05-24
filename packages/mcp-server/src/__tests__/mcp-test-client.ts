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
          } catch (e: unknown) {
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
