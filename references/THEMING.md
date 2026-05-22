# Sistema de Temas

## Estratégia: CSS Custom Properties + HOC

```scss
[data-theme='light'] {
  --ds-color-bg-primary: #ffffff;
  --ds-color-text-primary: #1a1a1a;
  --ds-color-brand-primary: #0066ff;
}
[data-theme='dark'] {
  --ds-color-bg-primary: #0f0f0f;
  --ds-color-text-primary: #f5f5f5;
  --ds-color-brand-primary: #4d94ff;
}
```

## HOC withTheme

```typescript
export const ThemeProvider: React.FC<{
  defaultTheme?: 'light' | 'dark'
  children: React.ReactNode
}> = ({ defaultTheme = 'light', children }) => {
  const [theme, setTheme] = useState(defaultTheme)
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <div data-theme={theme}>{children}</div>
    </ThemeContext.Provider>
  )
}

export function withTheme<P extends object>(Component: React.ComponentType<P>) {
  const WithTheme = (props: P) => {
    const { theme } = useTheme()
    return <Component {...props} data-theme={theme} />
  }
  WithTheme.displayName = `withTheme(${Component.displayName})`
  return WithTheme
}
```
