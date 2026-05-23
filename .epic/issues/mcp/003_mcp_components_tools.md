# 003 — Ferramentas: list_components, get_component_api & get_component_spec

## Status

[ ] Planejada [ ] Em desenvolvimento [ ] Concluída

## Objetivo

Implementar as ferramentas MCP responsáveis por mapear os componentes do design system (`list_components`), expor suas APIs TypeScript (`get_component_api`) e retornar suas especificações e regras de acessibilidade e estados (`get_component_spec`).

## Critérios de Aceite

- [ ] Registro das ferramentas MCP no servidor principal.
- [ ] Lógica para varrer dinamicamente ou mapear estaticamente a pasta `packages/core/src/components` e `packages/carousel/src/components` no `list_components` para identificar componentes disponíveis.
- [ ] Implementação de parser (usando regex seguro, parser de TS ou mapeamento robusto) no `get_component_api` que lê as assinaturas e interfaces de props (`ButtonProps`, `InputProps`, etc.) do código fonte e extrai as descrições JSDoc.
- [ ] Implementação no `get_component_spec` de um parser markdown que extrai as seções de especificações de comportamento, estados e acessibilidade correspondentes a cada componente a partir do arquivo [COMPONENT_SPEC.md](file:///home/rafacdomin/projetos/design-system/references/COMPONENT_SPEC.md).
- [ ] Tratamento amigável de erro se for solicitado um componente inexistente.
- [ ] Garante que subcomponentes de Compound Components (como `Dropdown.Item` ou `Input.StartIcon`) sejam identificados e documentados na API do componente pai.
- [ ] Zero tipos `any` nas funções de varredura e parse.

## Arquivos a Criar/Modificar

- `packages/mcp-server/src/tools/components.ts` — implementação das ferramentas de componentes
- `packages/mcp-server/src/tools/index.ts` — registro das novas ferramentas
- `packages/mcp-server/src/index.ts` — inicialização das ferramentas no servidor

## Dependências Externas

Nenhuma

## Depende de

#001 (Setup do Pacote MCP Server)

## Estimativa

M
