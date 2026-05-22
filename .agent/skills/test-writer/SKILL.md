---
name: test-writer
description: Escrever testes unitários para componentes React seguindo TDD com Vitest e RTL
---

Ao escrever testes de componentes:

1. Testes vêm ANTES da implementação
2. Use sempre `jest-axe` para verificação de acessibilidade
3. Use `@testing-library/user-event` para interações (não `fireEvent`)
4. Estruture com: Rendering → Behavior → Accessibility → Props → Edge Cases
5. Prefira queries por role/label (acessíveis) sobre `getByTestId`
6. `data-testid` apenas como último recurso