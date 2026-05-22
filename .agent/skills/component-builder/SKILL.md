---
name: component-builder
description: Criar componentes React para o Design System seguindo a estrutura padrão do projeto
---

Ao criar qualquer componente React neste design system, siga OBRIGATORIAMENTE:

## Estrutura de arquivos

Crie sempre os 5 arquivos: `.tsx`, `.test.tsx`, `.stories.tsx`, `.module.scss`, `index.ts`

## Template de componente

```typescript
interface ComponentNameProps {
  /** Descrição para Storybook ArgTable */
  variant?: 'primary' | 'secondary'
  children: React.ReactNode
  className?: string
}

export const ComponentName = React.forwardRef<HTMLElement, ComponentNameProps>(
  ({ variant = 'primary', children, className, ...props }, ref) => (
    <element
      ref={ref}
      className={clsx(styles.root, styles[variant], className)}
      data-variant={variant}
      {...props}
    >
      {children}
    </element>
  )
)
ComponentName.displayName = 'ComponentName'
```

## Regras de SCSS

- Apenas CSS custom properties: `var(--ds-color-primary-500)`
- Variantes via data attributes: `[data-variant="secondary"] { }`
- Sem valores literais de cor, espaçamento ou fonte

## Regras de Stories (Storybook)

- **Arquivo Único**: Cada componente deve possuir apenas um arquivo `.stories.tsx`.
- **Menu Lateral Limpo**: O componente deve aparecer como um único item no menu lateral (não deve ter sub-páginas/stories para cada variante no menu).
- **Playground**: Defina a story `Playground` como a primeira exportada para atuar como a visualização principal com os _Controls_.
- **Variações Ocultas**: Adicione `tags: ['!dev']` em todas as stories de variações/estados secundários para ocultá-las do menu lateral enquanto são exibidas na página principal de `Docs`.
