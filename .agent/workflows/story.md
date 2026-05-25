---
description: Gerar stories do Storybook para um componente seguindo o padrão de agrupamento de documentação
---

Gere o arquivo `.stories.tsx` para o componente $ARGUMENTS seguindo as diretrizes de visualização unificada do design system.

## Regras de Stories (Storybook 8)

1. **Agrupamento de Documentação**: Cada componente deve possuir apenas uma entrada principal no menu lateral do Storybook (ex: `Components/ComponentName`).
2. **Página de Documentação (autodocs)**:
   - Defina `tags: ['autodocs']` no objeto `meta` padrão.
3. **Playground Interativo**:
   - Defina uma story chamada `Playground` como a primeira exportada do arquivo.
   - Configure controles (_controls_) na propriedade `argTypes` do `meta` para permitir a customização interativa do componente no topo da documentação.
4. **Variações Ocultas**:
   - Crie stories individuais para cada variação de estilo (variants), tamanho (sizes), estado (disabled, loading, etc.) e casos de uso específicos (como `asChild`).
   - **IMPORTANTE**: Adicione `tags: ['!dev']` em cada uma dessas stories secundárias. Isso evita que apareçam como páginas separadas no menu lateral do Storybook, mantendo-as visíveis apenas na página de documentação geral (`Docs`) do componente.

## Exemplo de Estrutura

```typescript
import type { Meta, StoryObj } from '@storybook/react'
import React from 'react'
import { ComponentName } from '@rafacdomin/ds-core'

const meta: Meta<typeof ComponentName> = {
  title: 'Components/ComponentName',
  component: ComponentName,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['primary', 'secondary'],
    },
  },
}

export default meta
type Story = StoryObj<typeof ComponentName>

export const Playground: Story = {
  args: {
    variant: 'primary',
    children: 'Text',
  },
}

export const Primary: Story = {
  tags: ['!dev'],
  args: {
    variant: 'primary',
    children: 'Primary ComponentName',
  },
}

export const Secondary: Story = {
  tags: ['!dev'],
  args: {
    variant: 'secondary',
    children: 'Secondary ComponentName',
  },
}
```
