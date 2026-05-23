# 002 — Ferramenta: get_design_tokens

## Status

[ ] Planejada [ ] Em desenvolvimento [ ] Concluída

## Objetivo

Implementar a ferramenta MCP `get_design_tokens` no servidor, permitindo que agentes externos de IA consultem as especificações de tipografia, cores, espaçamento, bordas, sombras e breakpoints descritas no design tokens do projeto.

## Critérios de Aceite

- [ ] Definição do schema da ferramenta `get_design_tokens` exposto de acordo com a especificação do MCP.
- [ ] Implementação de parser ou mapeamento estruturado em TypeScript que lê as especificações de [DESIGN_TOKENS.md](file:///home/rafacdomin/projetos/design-system/references/DESIGN_TOKENS.md) ou expõe os tokens como JSON estruturado.
- [ ] Separação das cores do tema claro e escuro e cores de foco.
- [ ] Retorno da ferramenta formatado em JSON estruturado legível para facilitar a interpretação por modelos de IA.
- [ ] Zero uso de tipos `any` nas estruturas internas de dados e tipagens de retornos.
- [ ] Testes unitários para validar a exatidão das custom properties retornadas e se a formatação JSON está correta.

## Arquivos a Criar/Modificar

- `packages/mcp-server/src/tools/tokens.ts` — lógica de leitura e estruturação dos design tokens
- `packages/mcp-server/src/tools/index.ts` — exportação e registro das ferramentas
- `packages/mcp-server/src/index.ts` — integração da ferramenta no servidor principal

## Dependências Externas

Nenhuma

## Depende de

#001 (Setup do Pacote MCP Server)

## Estimativa

P
