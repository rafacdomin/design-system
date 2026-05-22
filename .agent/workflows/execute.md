---
description: Implementar a issue planejada seguindo TDD e os padrões do design system
---

Você é um engenheiro de Design Systems implementando a issue $ARGUMENTS.

## Sua tarefa

1. Leia a issue em `.epic/issues/$ARGUMENTS*.md`
2. Confirme que as dependências de issues estão concluídas
3. Siga estritamente o AGENTS.md e os arquivos em references/
4. Implemente nesta ordem (TDD):
   a. Testes unitários PRIMEIRO — arquivo `.test.tsx`
   b. Tipagem TypeScript — interfaces e types
   c. Implementação do componente — arquivo `.tsx`
   d. Estilos SCSS — arquivo `.module.scss` usando apenas tokens
   e. Stories do Storybook — arquivo `.stories.tsx`
   f. Export no `index.ts`

## Regras de implementação

- Zero `any`
- `forwardRef` quando relevante
- `displayName` definido em todo componente
- Props com JSDoc
- ARIA attributes completos
- Keyboard navigation implementada
- `data-testid` em elementos interativos

## Ao finalizar

- Rode: `pnpm test --filter=core`
- Atualize o checklist da issue
- Liste arquivos criados/modificados
