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
  private pendingResolvers = new Map<
    number | string,
    {
      resolve: (message: JsonRpcResponse) => void
      reject: (error: Error) => void
    }
  >()
  private dataHandler: (chunk: Buffer | string) => void

  constructor(input: PassThrough, output: PassThrough) {
    this.input = input
    this.output = output

    this.dataHandler = (chunk: Buffer | string) => {
      this.buffer += chunk.toString()
      let newlineIndex: number
      while ((newlineIndex = this.buffer.indexOf('\n')) !== -1) {
        const line = this.buffer.slice(0, newlineIndex).trim()
        this.buffer = this.buffer.slice(newlineIndex + 1)
        if (line) {
          try {
            const parsed = JSON.parse(line) as JsonRpcResponse
            if (parsed.id !== undefined && parsed.id !== null) {
              const handlers = this.pendingResolvers.get(parsed.id)
              if (handlers) {
                this.pendingResolvers.delete(parsed.id)
                handlers.resolve(parsed)
              }
            }
          } catch (e: unknown) {
            console.error('Falha ao interpretar JSON-RPC:', line, e)
          }
        }
      }
    }

    this.output.on('data', this.dataHandler)
  }

  public destroy(): void {
    this.output.off('data', this.dataHandler)
    for (const [id, handlers] of this.pendingResolvers.entries()) {
      handlers.reject(
        new Error(`Client destroyed before response was received: id=${id}`)
      )
    }
    this.pendingResolvers.clear()
  }

  public sendRequest(
    method: string,
    params: Record<string, unknown> = {},
    id: number,
    timeoutMs = 5000
  ): Promise<JsonRpcResponse> {
    const request = {
      jsonrpc: '2.0' as const,
      id,
      method,
      params,
    }
    return new Promise<JsonRpcResponse>((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        if (this.pendingResolvers.has(id)) {
          this.pendingResolvers.delete(id)
          reject(
            new Error(
              `Request timed out after ${timeoutMs}ms: method=${method}, id=${id}`
            )
          )
        }
      }, timeoutMs)

      this.pendingResolvers.set(id, {
        resolve: (response) => {
          clearTimeout(timeoutId)
          resolve(response)
        },
        reject: (error) => {
          clearTimeout(timeoutId)
          reject(error)
        },
      })

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
