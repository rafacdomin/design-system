# Épico: Design System MCP Server (EPIC_MCP_SERVER.md)

Este documento descreve o progresso global da implementação do servidor MCP (Model Context Protocol) para o design system. Atua como o quadro Kanban e o índice de todas as issues do épico MCP.

---

## Tabela de Issues e Progresso

| ID       | Issue                                                                                                                                                               | Dependências           | Estimativa | Status          |
| :------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------ | :--------------------- | :--------- | :-------------- |
| **#001** | [Setup do Pacote MCP Server](file:///home/rafacdomin/projetos/design-system/.epic/issues/mcp/001_mcp_setup.md)                                                      | Nenhuma                | M          | `[x] Concluída` |
| **#002** | [Ferramenta: get_design_tokens](file:///home/rafacdomin/projetos/design-system/.epic/issues/mcp/002_mcp_tokens_tool.md)                                             | #001                   | P          | `[x] Concluída` |
| **#003** | [Ferramentas: list_components, get_component_api & get_component_spec](file:///home/rafacdomin/projetos/design-system/.epic/issues/mcp/003_mcp_components_tools.md) | #001                   | M          | `[x] Concluída` |
| **#004** | [Ferramenta: get_component_examples](file:///home/rafacdomin/projetos/design-system/.epic/issues/mcp/004_mcp_examples_tool.md)                                      | #001, #003             | P          | `[x] Concluída` |
| **#005** | [Recursos: design-system://docs/\*](file:///home/rafacdomin/projetos/design-system/.epic/issues/mcp/005_mcp_resources.md)                                           | #001                   | P          | `[x] Concluída` |
| **#006** | [Testes Unitários, de Integração JSON-RPC e Validação](file:///home/rafacdomin/projetos/design-system/.epic/issues/mcp/006_mcp_integration_tests.md)                | #002, #003, #004, #005 | M          | `[x] Planejada` |

---

## Ordem de Execução Recomendada

1. **Setup Inicial da Infraestrutura:** `#001` - Configura a pasta do pacote, typescript, tsup, dependências e cria o boilerplate inicial do servidor MCP escutando via stdin/stdout.
2. **Implementação de Design Tokens:** `#002` - Implementa a ferramenta que expõe os tokens para consumo de agentes.
3. **Implementação de Ferramentas de Componentes:** `#003` - Permite aos agentes descobrirem componentes, suas propriedades TypeScript e regras de acessibilidade.
4. **Implementação da Ferramenta de Exemplos:** `#004` - Fornece código prático e templates para geração de componentes.
5. **Configuração de Recursos:** `#005` - Expõe os arquivos de documentação markdown fundamentais (`references/`) via URIs de recursos do MCP.
6. **Testes e Certificação:** `#006` - Cria a suite de testes automatizados com Vitest e valida o servidor MCP contra o inspector oficial de MCP.
