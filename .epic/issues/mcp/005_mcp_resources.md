# 005 — Recursos: design-system://docs/\*

## Status

[ ] Planejada [ ] Em desenvolvimento [ ] Concluída

## Objetivo

Configurar a exposição de recursos estáticos no servidor MCP, disponibilizando os guias técnicos essenciais em `references/` via URIs personalizadas (`design-system://docs/*`) para permitir que agentes de IA carreguem documentações inteiras sobre a11y, temas, tokens e arquitetura.

## Critérios de Aceite

- [ ] Registro dos recursos no MCP Server atendendo ao método `resources/list`.
- [ ] Implementação de mapeamento de URIs de recurso:
  - `design-system://docs/accessibility` -> mapeia para [references/ACCESSIBILITY.md](file:///home/rafacdomin/projetos/design-system/references/ACCESSIBILITY.md)
  - `design-system://docs/theming` -> mapeia para [references/THEMING.md](file:///home/rafacdomin/projetos/design-system/references/THEMING.md)
  - `design-system://docs/tokens` -> mapeia para [references/DESIGN_TOKENS.md](file:///home/rafacdomin/projetos/design-system/references/DESIGN_TOKENS.md)
  - `design-system://docs/architecture` -> mapeia para [references/ARCHITECTURE.md](file:///home/rafacdomin/projetos/design-system/references/ARCHITECTURE.md)
  - `design-system://docs/workflow` -> mapeia para [references/WORKFLOW.md](file:///home/rafacdomin/projetos/design-system/references/WORKFLOW.md)
- [ ] Lógica no método `resources/read` para ler os arquivos markdown em tempo real do sistema de arquivos e retornar o conteúdo como texto puro (`textDocuments`).
- [ ] Testes unitários para validar a resolução correta de caminhos absolutos e se o conteúdo do recurso é retornado corretamente em formato UTF-8.
- [ ] Proteção contra ataques de Directory Traversal no carregamento de arquivos a partir de URIs arbitrárias.

## Arquivos a Criar/Modificar

- `packages/mcp-server/src/resources/index.ts` — implementação e tratamento de recursos do servidor MCP
- `packages/mcp-server/src/index.ts` — registro dos recursos no ciclo de inicialização do servidor

## Dependências Externas

Nenhuma

## Depende de

#001 (Setup do Pacote MCP Server)

## Estimativa

P
