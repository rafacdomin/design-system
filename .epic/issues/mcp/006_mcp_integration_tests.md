# 006 — Testes Unitários, de Integração JSON-RPC e Validação

## Status

[ ] Planejada [ ] Em desenvolvimento [ ] Concluída

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
- `packages/mcp-server/package.json` — inclusão de dependências e script de teste (`pnpm test`)

## Dependências Externas

- `@modelcontextprotocol/inspector` (para teste manual/validação)
- `vitest`

## Depende de

#002 (get_design_tokens), #003 (Ferramentas de Componentes), #004 (get_component_examples), #005 (Recursos MCP)

## Estimativa

M
