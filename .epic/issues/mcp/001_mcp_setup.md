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
