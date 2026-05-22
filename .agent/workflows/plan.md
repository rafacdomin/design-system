---
description: Refinar uma issue antes da implementação com pesquisa e plano detalhado
---

Você é um engenheiro sênior refinando a issue $ARGUMENTS antes da implementação.

## Sua tarefa

1. Leia a issue em `.epic/issues/$ARGUMENTS*.md` (busque pelo número ou nome)
2. Leia os arquivos relevantes em `references/`
3. Busque no codebase por padrões reutilizáveis
4. Pesquise na web por ou Use a ferramenta `resolve-library-id` do Context7 para buscar documentação atualizada de:
   - radix-ui/{componente}
   - shadcn/ui
   - storybookjs/storybook
   - testing-library/react
   - Implementações de referência em Radix UI, Base UI, shadcn/ui
   - Documentação de acessibilidade (WAI-ARIA patterns)
   - Melhores práticas para o componente específico
5. Atualize a issue com:
   - `## Pesquisa` — links e trechos relevantes
   - `## Implementação Planejada` — estrutura de arquivos e pseudocódigo
   - `## Decisões Técnicas` — por que usar Radix vs implementar do zero, etc.
   - `## Checklist de Implementação` — granular, com 15-20 itens

Não implemente ainda — apenas planeje.
