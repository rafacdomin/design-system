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

Carrossel responsivo para slides de conteúdo ou imagens de projetos, isolado sob o pacote `@ds/carousel` devido à dependência externa do `embla-carousel-react`.

### 9.1 Props e Subcomponentes

```typescript
export interface CarouselProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Array de elementos/slides a serem exibidos */
  children: React.ReactNode[]
  /** Exibe setas de navegação anteriores/próximos (Padrão: true) */
  showArrows?: boolean
  /** Exibe indicadores de dots no rodapé (Padrão: true) */
  showDots?: boolean
  /** Iniciar em modo de reprodução automática (Padrão: false) */
  autoplay?: boolean
  /** Intervalo em milissegundos para o autoplay (Padrão: 4000) */
  autoplayInterval?: number
  /** Habilita rotação cíclica infinita (Padrão: false) */
  loop?: boolean
  /**
   * Define o número máximo de slides exibidos simultaneamente.
   * Pode ser um número ou um objeto contendo os breakpoints para mobile, tablet e desktop.
   * Limites de segurança impostos: máximo de 1 em mobile, 2 em tablet e 3 em desktop.
   */
  slidesPerView?:
    | number
    | { mobile?: number; tablet?: number; desktop?: number }
}

export interface CarouselContentProps extends React.HTMLAttributes<HTMLDivElement> {}

export interface CarouselItemProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Índice do slide corrente (0-indexed) */
  index: number
}

export interface CarouselPreviousProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}
export interface CarouselNextProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}
export interface CarouselDotsProps extends React.HTMLAttributes<HTMLDivElement> {}
```

#### Arquitetura Compound

O componente expõe subcomponentes sob o namespace `Carousel` via `Object.assign`. O componente raiz `<Carousel>` provê o contexto implicitamente:

- `Carousel.Content`: Container viewport do Embla.
- `Carousel.Item`: Item individual que envelopa cada slide, controlando visibilidade e atributos de acessibilidade.
- `Carousel.Previous`: Botão de navegação para retornar ao slide anterior.
- `Carousel.Next`: Botão de navegação para avançar para o próximo slide.
- `Carousel.Dots`: Dots de navegação rápida/paginação.

Também é exportado o hook helper `useCarousel` para acessar dados do contexto interno do carrossel em implementações customizadas.

### 9.2 Comportamentos e Estados

- **Slides por View e Responsividade:** A prop `slidesPerView` permite limitar a quantidade de slides exibidos por viewport. Por padrão (e como valor máximo permitido), é exibido 1 slide em mobile (<768px), 2 em tablet (768px - 1023px) e 3 em desktop (>=1024px). Caso valores inferiores sejam passados, a quantidade solicitada é exibida.
- **Autoplay Reativo:** O carrossel avança automaticamente no intervalo definido por `autoplayInterval`. O ciclo pausa temporariamente quando o mouse entra no carrossel (`mouseenter`) ou quando este recebe foco (`focus`), e retoma de onde parou ao sair (`mouseleave`/`blur`).
- **Navegação por Teclado:** Quando focado, o carrossel intercepta as teclas `ArrowLeft` e `ArrowRight` para rolar os slides para a esquerda ou direita, respectivamente.

### 9.3 Acessibilidade (WAI-ARIA Pattern)

- **Container Principal:** Possui `role="region"`, `aria-roledescription="carousel"` e recebe foco via teclado (`tabIndex={0}`).
- **Container Viewport:** Atribuído com um `id` dinâmico único e associado aos botões e dots controladores via `aria-controls`.
- **Slides (Carousel.Item):** Possui `role="group"`, `aria-roledescription="slide"`, `aria-label="Slide X de Y"` (facilitando leitura por leitores de tela) e `aria-hidden="true"` quando fora do viewport visível atual.
- **Botões Controladores:** Possuem `aria-label` descritivos ("Slide anterior", "Próximo slide"), estado desabilitado dinâmico baseado na possibilidade de rolar (`disabled`) e referência via `aria-controls`.
- **Dots de Paginação:** Calculados dinamicamente com base nos snaps ativos do carrossel (sincronizados dinamicamente se a quantidade de slides mudar). O dot selecionado recebe `aria-current="true"`.
