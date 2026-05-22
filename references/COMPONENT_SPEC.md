# Especificações de Componentes (COMPONENT_SPEC.md)

Este documento especifica a API, variantes, estados e acessibilidade exigidos para cada componente do design system.

---

## 1. Button

Botão de ação principal, secundário ou utilitário. Deve suportar polimorfismo via `asChild`.

### 1.1 Props

```typescript
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Variante estética */
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  /** Tamanho do botão */
  size?: 'sm' | 'md' | 'lg'
  /** Se verdadeiro, renderiza um spinner e desabilita interações */
  loading?: boolean
  /** Se verdadeiro, delega a renderização para o elemento filho */
  asChild?: boolean
}
```

### 1.2 Comportamentos e Estados

- **Hover/Focus:** Transição suave de cor de fundo. Foco deve ter outline de contraste evidente (`2px solid var(--ds-color-focus-ring)`).
- **Disabled/Loading:** Eventos de ponteiro desativados (`pointer-events: none`), opacidade reduzida (`0.6`).
- **Acessibilidade (Keyboard):** Ativado com as teclas `Enter` e `Espaço`. Atributo `aria-disabled` quando `loading` for verdadeiro.

---

## 2. Input

Campo de entrada de texto de linha única.

### 2.1 Props

```typescript
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Rótulo visual do campo */
  label?: string
  /** Mensagem de erro ou feedback */
  error?: string
  /** Texto de ajuda auxiliar abaixo do campo */
  helperText?: string
  /** Elemento posicionado no início do input (ex: ícone) */
  startIcon?: React.ReactNode
  /** Elemento posicionado no fim do input (ex: botão de limpar) */
  endIcon?: React.ReactNode
}
```

### 2.2 Comportamentos e Estados

- **Disabled:** Fundo cinza suave (`--ds-color-neutral-100`), texto em `--ds-color-neutral-400`.
- **Error:** Bordas e textos auxiliares em `--ds-color-danger`.
- **Acessibilidade:** Label associado ao input via `htmlFor`/`id`. Uso de `aria-invalid="true"` e `aria-describedby` apontando para o erro quando aplicável.

---

## 3. Textarea

Campo de texto multilinhas.

### 3.1 Props

```typescript
export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  helperText?: string
  /** Se verdadeiro, expande automaticamente conforme o texto é digitado */
  autoResize?: boolean
}
```

### 3.2 Comportamentos e Estados

- **Comportamento:** Bordas e focos idênticos ao componente `Input`.
- **Acessibilidade:** Vinculação via `htmlFor`, atribuição de `aria-invalid="true"` se houver erros.

---

## 4. Dropdown (Select)

Menu de seleção única. Baseado no primitivo `@radix-ui/react-select`.

### 4.1 Props

```typescript
export interface DropdownOption {
  label: string
  value: string
  disabled?: boolean
}

export interface DropdownProps {
  label?: string
  placeholder?: string
  options: DropdownOption[]
  value?: string
  defaultValue?: string
  onChange?: (value: string) => void
  error?: string
  disabled?: boolean
  className?: string
}
```

### 4.2 Comportamentos e Estados

- **Acessibilidade:** Suporte total a WAI-ARIA pelo Radix Select. Navegação pelas opções via setas (`ArrowUp`/`ArrowDown`), seleção por `Enter`/`Espaço`, fechamento por `Escape`.

---

## 5. Modal (Dialog)

Janela sobreposta bloqueante. Baseada no `@radix-ui/react-dialog`.

### 5.1 Props

```typescript
export interface ModalProps {
  /** Controla a visibilidade do modal */
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  /** Título do modal (obrigatório para acessibilidade) */
  title: string
  /** Descrição do modal */
  description?: string
  /** Conteúdo interno */
  children: React.ReactNode
  /** Elemento gatilho (opcional) */
  trigger?: React.ReactNode
  /** Tamanho do container */
  size?: 'sm' | 'md' | 'lg'
}
```

### 5.2 Comportamentos e Estados

- **Acessibilidade:** Foco automaticamente retido dentro do modal (focus trap). Fechamento via clique no overlay, botão fechar (X) ou tecla `Escape`.

---

## 6. Card

Container flexível para agrupamento de conteúdos (como informações de projetos).

### 6.1 Props

```typescript
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Variante visual de elevação */
  variant?: 'flat' | 'bordered' | 'elevated'
  /** Se verdadeiro, adiciona efeito de hover de elevação e cursor pointer */
  interactive?: boolean
  asChild?: boolean
}
```

### 6.2 Comportamentos e Estados

- **Interactive:** Hover adiciona uma transição de sombra `--ds-shadow-md` e escala sutil.
- **Acessibilidade:** Se for clicável (interactive), o card deve atuar semanticamente como um link ou botão se `asChild` for fornecido.

---

## 7. Tag

Label indicador de atributos ou tags de tecnologia (ex: "React").

### 7.1 Props

```typescript
export interface TagProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Estilo visual */
  variant?: 'neutral' | 'outline' | 'interactive'
  /** Tamanho da tag */
  size?: 'sm' | 'md'
  /** Ação ao clicar na tag (ex: remover ou filtrar) */
  onRemove?: () => void
}
```

### 7.2 Comportamentos e Estados

- **Removível:** Renderiza um ícone "X" interativo com `aria-label="Remover"`.

---

## 8. Avatar

Foto de perfil com fallback para texto (iniciais).

### 8.1 Props

```typescript
export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  /** URL da imagem */
  src?: string
  /** Texto alternativo para a imagem */
  alt: string
  /** Iniciais para fallback (ex: "RD") */
  fallback: string
  /** Tamanho do avatar */
  size?: 'sm' | 'md' | 'lg'
}
```

### 8.2 Comportamentos e Estados

- **Comportamento:** Carrega a imagem. Se falhar ou estiver carregando, exibe o contêiner de fallback com as iniciais centralizadas em fonte `--ds-font-family-heading`.

---

## 9. Carousel

Carrossel responsivo para imagens de projetos. Baseado em `@ds/carousel` utilizando `embla-carousel-react`.

### 9.1 Props

```typescript
export interface CarouselProps {
  /** Array de elementos ou slides a serem exibidos */
  children: React.ReactNode[]
  /** Exibe setas de navegação anteriores/próximos */
  showArrows?: boolean
  /** Exibe indicadores de dots no rodapé */
  showDots?: boolean
  /** Iniciar em modo de reprodução automática */
  autoplay?: boolean
  className?: string
}
```

### 9.2 Comportamentos e Estados

- **Acessibilidade:** Teclas de setas esquerda/direita navegam entre slides quando o carrossel está focado. Atributos `aria-roledescription="carousel"`, `role="group"`, e `aria-label` para slides individuais.
