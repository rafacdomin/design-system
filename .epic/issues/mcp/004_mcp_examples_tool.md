# 004 — Ferramenta: get_component_examples

## Status

[ ] Planejada [ ] Em desenvolvimento [ ] Concluída

## Objetivo

Implementar a ferramenta MCP `get_component_examples` que permite a agentes de IA receberem snippets de código funcionais e corretos sobre como importar e usar os componentes do design system em aplicações React, incluindo variantes e temas.

## Critérios de Aceite

- [ ] Registro da ferramenta `get_component_examples` com o parâmetro `componentName`.
- [ ] Lógica para ler e expor os stories de exemplo a partir de `packages/docs/src/stories/` correspondentes ao componente solicitado.
- [ ] Inclusão de exemplos básicos, variações de estado (loading, disabled) e variantes estéticas (primary, secondary, etc.).
- [ ] Fornecer snippets de código que incluam importações corretas de pacotes (`@ds/core` e `@ds/carousel`) e a envelopagem necessária (como uso de wrapper ou classes corretas).
- [ ] Retorno da ferramenta estruturado contendo o código em texto limpo.
- [ ] Garantia de tratamento de erros amigável caso não haja exemplos documentados para um componente solicitado.

## Arquivos a Criar/Modificar

- `packages/mcp-server/src/tools/examples.ts` — implementação da ferramenta de exemplos
- `packages/mcp-server/src/tools/index.ts` — registro e exportação da ferramenta

## Dependências Externas

Nenhuma

## Depende de

#001 (Setup do Pacote MCP Server), #003 (Ferramentas de Componentes)

## Estimativa

P
