---
description: Gerar testes completos para um componente seguindo a estratégia de testes do projeto
---

Gere testes completos para o componente $ARGUMENTS seguindo `references/TESTING_STRATEGY.md`.

## Estrutura obrigatória

describe('<ComponentName />', () => {
describe('Rendering', () => { })
describe('Behavior', () => { })
describe('Accessibility', () => { /_ jest-axe _/ })
describe('Props', () => { })
describe('Edge Cases', () => { })
})

Ferramentas: @testing-library/react, @testing-library/user-event, vitest, jest-axe.
Não implemente o componente — apenas os testes. Eles devem falhar inicialmente (TDD).
