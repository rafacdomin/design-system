# 001 — Setup do Pacote MCP Server

## Status

[ ] Planejada [ ] Em desenvolvimento [ ] Concluída

## Objetivo

Criar e configurar a infraestrutura básica do novo pacote `packages/mcp-server` no monorepo, instalando o SDK do MCP, configurando o TypeScript em strict mode, o empacotador tsup e implementando o boilerplate do servidor que se comunica via stdio.

## Critérios de Aceite

- [ ] Novo pacote adicionado no workspace pnpm sob `packages/mcp-server`.
- [ ] Configuração de `package.json` com `type: "module"`, dependência de `@modelcontextprotocol/sdk` e scripts de `build`, `start`, `dev` e `test`.
- [ ] Configuração de `tsconfig.json` herdando as regras estritas globais (strict mode).
- [ ] Configuração de `tsup.config.ts` para compilar o código fonte TypeScript para distribuição em formato ESM com permissão de execução (shebang `#!/usr/bin/env node`).
- [ ] Inicialização básica do servidor MCP em `src/index.ts` usando `StdioServerTransport` e registrando as ferramentas básicas.
- [ ] Um comando rápido `pnpm mcp` mapeado na raiz do monorepo para iniciar o servidor facilmente.
- [ ] Compilação do pacote executada com sucesso através de `pnpm --filter @ds/mcp-server build`.

## Arquivos a Criar

- `packages/mcp-server/package.json`
- `packages/mcp-server/tsconfig.json`
- `packages/mcp-server/tsup.config.ts`
- `packages/mcp-server/src/index.ts`

## Dependências Externas

- `@modelcontextprotocol/sdk`
- `tsup`
- `typescript`

## Depende de

#001 (Monorepo setup)

## Estimativa

M

## Pesquisa

- **Estrutura do Protocolo MCP**: O Model Context Protocol (MCP) é um padrão aberto que viabiliza a comunicação segura e padronizada entre modelos de IA (clientes) e fontes de dados/ferramentas externas (servidores).
- **Transporte Stdio**: Utiliza canais padrão de entrada e saída (`process.stdin` e `process.stdout`) de um subprocesso para trafegar mensagens JSON-RPC 2.0.
  > [!IMPORTANT]
  > Como o `stdout` é inteiramente reservado para comunicação de dados do protocolo, o uso de `console.log` causará falhas de parse no cliente. Toda saída de logs, depuração ou erros operacionais deve ser direcionada para o canal de erros padrão `console.error` (`stderr`).
- **Instanciação Básica**: No SDK oficial (`@modelcontextprotocol/sdk`), inicializa-se o servidor utilizando a classe `McpServer` importada de `@modelcontextprotocol/sdk/server/mcp.js`. O transporte local padrão é importado de `@modelcontextprotocol/sdk/server/stdio.js` (`StdioServerTransport`).
- **Configuração ESM**: O SDK utiliza importações de módulos ES nativos (ESM). É obrigatória a declaração `"type": "module"` no `package.json` para evitar erros de importação e assegurar interoperabilidade.

## Implementação Planejada

### Estrutura de Pastas Esperada

```
packages/mcp-server/
├── dist/                # Código compilado gerado pelo build
├── src/
│   └── index.ts        # Ponto de entrada do servidor
├── package.json         # Configuração de deps e scripts
├── tsconfig.json        # Configuração do compilador TS estendido da raiz
└── tsup.config.ts       # Configuração do empacotador tsup
```

### Arquivos e Pseudocódigo de Configuração

#### `packages/mcp-server/package.json`

```json
{
  "name": "@ds/mcp-server",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "main": "./dist/index.js",
  "bin": {
    "ds-mcp-server": "./dist/index.js"
  },
  "files": ["dist"],
  "scripts": {
    "build": "tsup",
    "dev": "tsup --watch",
    "start": "node ./dist/index.js",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.4.1",
    "zod": "^3.23.8"
  },
  "devDependencies": {
    "@types/node": "^20.11.0",
    "tsup": "^8.5.1",
    "typescript": "^6.0.3",
    "vitest": "^4.1.7"
  }
}
```

#### `packages/mcp-server/tsconfig.json`

```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "types": ["node"]
  },
  "include": ["src/**/*"]
}
```

#### `packages/mcp-server/tsup.config.ts`

```typescript
import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: true,
  clean: true,
  sourcemap: true,
  minify: false,
  banner: {
    js: '#!/usr/bin/env node',
  },
})
```

#### `packages/mcp-server/src/index.ts`

```typescript
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { z } from 'zod'

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

main().catch((error) => {
  console.error('Erro fatal ao iniciar o servidor MCP:', error)
  process.exit(1)
})
```

#### Adição no `package.json` raiz do Monorepo

No bloco `"scripts"`, registrar o comando global para inicialização facilitada:

```json
"mcp": "pnpm --filter @ds/mcp-server start"
```

## Decisões Técnicas

1. **Transporte via Stdio (Standard I/O)**: Escolhido por ser o modelo de comunicação padrão e nativo para hosts integrados localmente (como Claude Desktop, Cursor e Antigravity CLI). Evita o provisionamento de portas TCP locais no host de desenvolvimento, prevenindo conflitos de porta e simplificando o controle de ciclo de vida do processo.
2. **Saída Exclusiva de Logs via `stderr` (`console.error`)**: Como o transporte Stdio requer que o canal de `stdout` permaneça desimpedido e livre para tráfego do protocolo JSON-RPC, qualquer chamada para `console.log` corromperá a comunicação. Adota-se rigidamente `console.error` para logs de status/erro e interceptação no ciclo de vida.
3. **Distribuição em Formato ESM com `tsup`**: Para total compatibilidade com o SDK oficial `@modelcontextprotocol/sdk` (que exige resolução ESM moderna), configuramos a compilação puramente em ESM. O `tsup` nos fornece uma compilação rápida via `esbuild` com geração automática de declarações `.d.ts`.
4. **Permissão de Execução (Shebang Banner)**: Injetamos o cabeçalho `#!/usr/bin/env node` no bundle compilado (`tsup.config.ts`) para possibilitar a execução do binário diretamente na linha de comando e integração em ferramentas do sistema operacional.

## Checklist de Implementação

- [ ] 1. Criar a estrutura física de diretórios em `packages/mcp-server/src`.
- [ ] 2. Criar o arquivo `packages/mcp-server/package.json` com nome `@ds/mcp-server`.
- [ ] 3. Configurar `"type": "module"` no `package.json` do pacote.
- [ ] 4. Instalar as dependências de produção do SDK do MCP (`@modelcontextprotocol/sdk`) e validação de schema (`zod`).
- [ ] 5. Instalar as devDependencies locais (`tsup`, `typescript`, `@types/node`, `vitest`).
- [ ] 6. Criar o arquivo `packages/mcp-server/tsconfig.json` herdando as diretivas estritas do tsconfig raiz.
- [ ] 7. Adicionar o type do `"node"` nas configurações de tipo (`types`) do tsconfig local.
- [ ] 8. Criar o arquivo de configuração `packages/mcp-server/tsup.config.ts`.
- [ ] 9. Habilitar o entrypoint `src/index.ts`, output format `esm` e geração de dts no config do tsup.
- [ ] 10. Inserir a instrução de banner de JavaScript no tsup config para injetar a shebang `#!/usr/bin/env node`.
- [ ] 11. Criar o arquivo de código fonte inicial `packages/mcp-server/src/index.ts`.
- [ ] 12. Importar as classes de servidor e transporte do SDK oficial do MCP.
- [ ] 13. Instanciar o servidor MCP (`McpServer`) definindo metadados adequados.
- [ ] 14. Registrar a ferramenta simples `ping` no servidor usando tipagem estrita para resposta de texto.
- [ ] 15. Criar a função assíncrona `main` para encapsular a inicialização e acoplar o transporte Stdio.
- [ ] 16. Configurar tratamento de erro (`catch`) na inicialização do servidor e redirecionamento de logs de runtime para stderr.
- [ ] 17. Adicionar o script `"mcp": "pnpm --filter @ds/mcp-server start"` no `package.json` na raiz do monorepo.
- [ ] 18. Executar comando de compilação `pnpm --filter @ds/mcp-server build` para assegurar build correto do bundle.
- [ ] 19. Verificar se o bundle compilado em `dist/index.js` foi criado com a shebang correta e sem erros de sintaxe.
- [ ] 20. Executar o servidor localmente de forma manual via linha de comando para certificar que inicia com sucesso sem lançar exceções de runtime.
