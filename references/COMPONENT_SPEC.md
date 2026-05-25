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
export interface InputIconProps {
  /** Conteúdo do ícone */
  children: React.ReactNode
  /** Classe CSS adicional */
  className?: string
}

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Rótulo visual do campo */
  label?: string
  /** Mensagem de erro que altera o estado do campo e é exibida no rodapé */
  error?: string
  /** Texto de ajuda auxiliar exibido abaixo do input */
  helperText?: string
  /** Modo do label (estático acima ou flutuante dentro do campo) */
  labelMode?: 'static' | 'floating'
  /** Ícones adicionais do input (Input.StartIcon ou Input.EndIcon) */
  children?: React.ReactNode
}
```

### 2.2 Comportamentos e Estados

- **Disabled:** Fundo cinza suave (`--ds-color-neutral-100`), texto em `--ds-color-neutral-400`.
- **Error:** Bordas e textos auxiliares em `--ds-color-danger`.
- **Compound Pattern:** Ícones adicionais no início e no fim do input devem ser passados como filhos usando os subcomponentes `<Input.StartIcon>` e `<Input.EndIcon>`. Eles são acoplados via `Object.assign`.
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
export interface DropdownProps {
  /** Rótulo opcional acima do campo */
  label?: string
  /** Texto placeholder exibido quando nenhuma opção é selecionada */
  placeholder?: string
  /** Valor selecionado para componente controlado */
  value?: string
  /** Valor selecionado inicial para componente não controlado */
  defaultValue?: string
  /** Callback acionado ao alterar o valor */
  onChange?: (value: string) => void
  /** Mensagem de erro de validação */
  error?: string
  /** Mensagem auxiliar exibida abaixo do campo */
  helperText?: string
  /** Desabilita as interações quando verdadeiro */
  disabled?: boolean
  /** Classe CSS adicional */
  className?: string
  /** Identificador HTML único */
  id?: string
  /** Itens do dropdown (opções) usando Dropdown.Item */
  children: React.ReactNode
}

export interface DropdownItemProps {
  /** Valor correspondente à opção */
  value: string
  /** Se a opção está desabilitada */
  disabled?: boolean
  /** Conteúdo do item/opção */
  children: React.ReactNode
  /** Classe CSS adicional */
  className?: string
}
```

### 4.2 Comportamentos e Estados

- **Compound Pattern:** O componente de menu de seleção utiliza a estrutura composta via `Object.assign`. As opções devem ser passadas como filhos de `<Dropdown>` usando o subcomponente `<Dropdown.Item>`.
- **Acessibilidade:** Suporte total a WAI-ARIA pelo Radix Select. Navegação pelas opções via setas (`ArrowUp`/`ArrowDown`), seleção por `Enter`/`Espaço`, fechamento por `Escape`.

---

## 5. Modal (Dialog)

Janela sobreposta bloqueante. Baseada no `@radix-ui/react-dialog`.

### 5.1 Props

```typescript
export interface ModalProps {
  /** Controle manual de abertura (modo controlado) */
  open?: boolean
  /** Estado padrão de abertura (modo não controlado) */
  defaultOpen?: boolean
  /** Callback invocado na alteração do estado de abertura */
  onOpenChange?: (open: boolean) => void
  /** Título do modal (opcional na composição manual, mas obrigatório para acessibilidade) */
  title?: string
  /** Descrição auxiliar do modal */
  description?: string
  /** Elemento clicável que dispara a abertura do modal (opcional no modo simplificado) */
  trigger?: React.ReactNode
  /** Tamanho da largura do modal */
  size?: 'sm' | 'md' | 'lg'
  /** Conteúdo interno da janela do modal */
  children: React.ReactNode
}

export interface ModalTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  asChild?: boolean
}

export interface ModalCloseProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  asChild?: boolean
}

export interface ModalContentProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Título do cabeçalho (obrigatório) */
  title: string
  /** Descrição do cabeçalho */
  description?: string
  /** Tamanho da largura do modal */
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
}
```

### 5.2 Comportamentos e Estados

- **Comportamento e Modos:** Suporta dois modos de renderização. O modo unificado simples (quando `title` ou `trigger` são passados como props no `<Modal>`) e o modo flexível composto utilizando os subcomponentes `<Modal.Trigger>`, `<Modal.Close>` e `<Modal.Content>` (definidos via `Object.assign`).
- **Acessibilidade:** Foco automaticamente retido dentro do modal (focus trap). Fechamento via clique no overlay, botão fechar (X) ou tecla `Escape`.

---

## 6. Card

Container flexível para agrupamento de conteúdos (como informações de projetos).

### 6.1 Props

````typescript
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Variante visual de elevação */
  variant?: 'flat' | 'bordered' | 'elevated'
  /** Se verdadeiro, adiciona efeito de hover de elevação e cursor pointer */
  interactive?: boolean
  /** Se verdadeiro, delega a renderização para o elemento filho direto */
  asChild?: boolean
}
```,StartLine:153,TargetContent:

### 6.2 Comportamentos e Estados

- **Interactive:** Hover adiciona uma transição de sombra `--ds-shadow-md` e escala sutil.
- **Acessibilidade:** Se for clicável (interactive), o card deve atuar semanticamente como um link ou botão se `asChild` for fornecido.

---

## 7. Tag

Label indicador de atributos ou tags de tecnologia (ex: "React").

### 7.1 Props

```typescript
export interface TagProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'onClick' | 'color'> {
  /** Variante estética */
  variant?: 'neutral' | 'outline' | 'interactive'
  /** Tamanho da tag */
  size?: 'sm' | 'md'
  /** Variante de cor estética */
  color?: 'neutral' | 'primary' | 'secondary' | 'danger'
  /** Callback acionado ao clicar no botão de remoção */
  onRemove?: () => void
  /** Callback acionado ao clicar na tag interativa */
  onClick?: (
    event: React.MouseEvent<HTMLButtonElement | HTMLSpanElement>
  ) => void
  /** Rótulo de acessibilidade para o botão de remoção */
  removeAriaLabel?: string
}
```,StartLine:176,TargetContent:

### 7.2 Comportamentos e Estados

- **Removível:** Renderiza um ícone "X" interativo com `aria-label="Remover"`.

---

## 8. Avatar

Foto de perfil com fallback para texto (iniciais).

### 8.1 Props

```typescript
export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  /** URL da imagem do avatar */
  src?: string
  /** Descrição acessível da imagem (opcional se 'name' for fornecido) */
  alt?: string
  /** Iniciais para fallback (opcional se 'name' for fornecido) */
  fallback?: string
  /** Nome completo para gerar iniciais e alt automaticamente */
  name?: string
  /** Tamanho do avatar */
  size?: 'sm' | 'md' | 'lg'
}
```,StartLine:199,TargetContent:

### 8.2 Comportamentos e Estados

- **Comportamento:** Carrega a imagem. Se falhar ou estiver carregando, exibe o contêiner de fallback com as iniciais centralizadas em fonte `--ds-font-family-heading`.

---

## 9. Carousel

Carrossel responsivo para slides de conteúdo ou imagens de projetos, isolado sob o pacote `@rafacdomin/ds-carousel` devido à dependência externa do `embla-carousel-react`.

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
  /** Rótulo descritivo acessível do botão anterior */
  prevAriaLabel?: string
  /** Rótulo descritivo acessível do botão seguinte */
  nextAriaLabel?: string
  /** Formato do leitor de tela para o grupo de slide (ex: "Slide {index} de {total}") */
  slideAriaLabelFormat?: string
  /** Formato do leitor de tela para o indicador de paginação (ex: "Ir para slide {index}") */
  dotAriaLabelFormat?: string
}

export interface CarouselContentProps extends React.HTMLAttributes<HTMLDivElement> {}

export interface CarouselItemProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Índice do slide corrente (0-indexed) */
  index: number
}

export interface CarouselPreviousProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}
export interface CarouselNextProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}
export interface CarouselDotsProps extends React.HTMLAttributes<HTMLDivElement> {}
````

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
