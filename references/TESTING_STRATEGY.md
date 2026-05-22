# Estratégia de Testes

## Pirâmide
1. Unitários (Vitest + RTL) — 80%
2. Integration (Vitest + RTL) — 15%
3. Visual Regression (Playwright + Browserstack) — 5%

## Cobertura mínima
Statements: 90% / Branches: 85% / Functions: 90%

## Template
```typescript
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { ComponentName } from './ComponentName'

describe('<ComponentName />', () => {
  describe('Rendering', () => {
    it('should render without errors', () => {
      render(<ComponentName />)
      expect(screen.getByRole('...')).toBeInTheDocument()
    })
  })
  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(<ComponentName />)
      expect(await axe(container)).toHaveNoViolations()
    })
  })
})
```

## Visual Regression
- Rodado em CI via Browserstack
- Baseline gerada a partir dos stories do Storybook
- Threshold: 0.1% de diferença aceito
- Stories com estado isolado (sem animações, sem timers)