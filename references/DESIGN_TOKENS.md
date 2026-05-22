# Design Tokens (DESIGN_TOKENS.md)

Este documento define todos os design tokens do sistema. Eles serão implementados como propriedades customizadas do CSS (CSS Custom Properties) no arquivo de estilos globais dos temas.

Os tokens seguem o prefixo padrão `--ds-`.

---

## 1. Tipografia

### 1.1 Famílias de Fontes (Font Families)
*   **Sans-serif / Interface (Padrão):** `Inter`
    *   Token: `--ds-font-family-sans`
    *   Valor: `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`
*   **Heading / Headings (Destaque):** `Poppins`
    *   Token: `--ds-font-family-heading`
    *   Valor: `'Poppins', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif`

### 1.2 Tamanhos de Fonte (Font Sizes)
Escala tipográfica baseada em rem (onde 1rem = 16px):
*   `--ds-font-size-xs`: `0.75rem` (12px)
*   `--ds-font-size-sm`: `0.875rem` (14px)
*   `--ds-font-size-md`: `1rem` (16px)
*   `--ds-font-size-lg`: `1.125rem` (18px)
*   `--ds-font-size-xl`: `1.25rem` (20px)
*   `--ds-font-size-2xl`: `1.5rem` (24px)
*   `--ds-font-size-3xl`: `1.875rem` (30px)
*   `--ds-font-size-4xl`: `2.25rem` (36px)

### 1.3 Pesos de Fonte (Font Weights)
*   `--ds-font-weight-regular`: `400`
*   `--ds-font-weight-medium`: `505` (ou `500` padrão)
*   `--ds-font-weight-semibold`: `600`
*   `--ds-font-weight-bold`: `700`

### 1.4 Altura de Linha (Line Heights)
*   `--ds-line-height-none`: `1`
*   `--ds-line-height-tight`: `1.25` (Headings)
*   `--ds-line-height-snug`: `1.375`
*   `--ds-line-height-normal`: `1.5` (Texto corrido / Body)
*   `--ds-line-height-loose`: `2`

---

## 2. Cores (Escala Monocromática Premium)

O tema base do design system é preto e branco de alto contraste, utilizando tons refinados de cinza neutro para suavizar e dar profundidade à interface.

### 2.1 Escala Neutra (Neutral Scale)
Esta escala é usada para fundos, bordas, textos secundários e estados desabilitados.

| Token | Light Theme Value (HEX / HSL) | Dark Theme Value (HEX / HSL) | Uso Sugerido |
| :--- | :--- | :--- | :--- |
| `--ds-color-neutral-0` | `#ffffff` (hsl(0, 0%, 100%)) | `#0a0a0a` (hsl(0, 0%, 4%)) | Fundo principal da página |
| `--ds-color-neutral-50` | `#f9f9f9` (hsl(0, 0%, 98%)) | `#121212` (hsl(0, 0%, 7%)) | Fundo secundário (ex: cards) |
| `--ds-color-neutral-100` | `#f1f1f1` (hsl(0, 0%, 95%)) | `#1a1a1a` (hsl(0, 0%, 10%)) | Hover de fundos secundários, bordas muito sutis |
| `--ds-color-neutral-200` | `#e2e2e2` (hsl(0, 0%, 89%)) | `#262626` (hsl(0, 0%, 15%)) | Bordas de input e divisores |
| `--ds-color-neutral-300` | `#d4d4d4` (hsl(0, 0%, 83%)) | `#3a3a3a` (hsl(0, 0%, 23%)) | Bordas em foco, estado desabilitado (background) |
| `--ds-color-neutral-400` | `#a3a3a3` (hsl(0, 0%, 64%)) | `#525252` (hsl(0, 0%, 32%)) | Texto de placeholder, bordas ativas |
| `--ds-color-neutral-500` | `#737373` (hsl(0, 0%, 45%)) | `#737373` (hsl(0, 0%, 45%)) | Texto secundário / auxiliar |
| `--ds-color-neutral-600` | `#525252` (hsl(0, 0%, 32%)) | `#a3a3a3` (hsl(0, 0%, 64%)) | Hover em textos secundários |
| `--ds-color-neutral-700` | `#404040` (hsl(0, 0%, 25%)) | `#d4d4d4` (hsl(0, 0%, 83%)) | Texto de leitura regular |
| `--ds-color-neutral-800` | `#262626` (hsl(0, 0%, 15%)) | `#e2e2e2` (hsl(0, 0%, 89%)) | Títulos e textos de destaque médio |
| `--ds-color-neutral-900` | `#171717` (hsl(0, 0%, 9%)) | `#f1f1f1` (hsl(0, 0%, 95%)) | Texto principal / Títulos proeminentes |
| `--ds-color-neutral-1000`| `#0a0a0a` (hsl(0, 0%, 4%)) | `#ffffff` (hsl(0, 0%, 100%)) | Fundo de componentes invertidos (ex: botões primários) |

### 2.2 Cores de Acento (Interactive / Focus Styles)
Para manter o design limpo e acessível, o foco utiliza uma cor dedicada ou uma borda de alto contraste invertida:
*   `--ds-color-focus-ring`: `hsl(0, 0%, 0%)` no Light e `hsl(0, 0%, 100%)` no Dark.
*   `--ds-color-danger`: `hsl(0, 84%, 48%)` (Vermelho para ações destrutivas/erros) no Light e `hsl(0, 96%, 65%)` no Dark.

---

## 3. Espaçamento (Spacing)

Escala linear baseada em `4px` para controle rígido do grid:
*   `--ds-spacing-1`: `0.25rem` (4px)
*   `--ds-spacing-2`: `0.5rem` (8px)
*   `--ds-spacing-3`: `0.75rem` (12px)
*   `--ds-spacing-4`: `1rem` (16px)
*   `--ds-spacing-5`: `1.25rem` (20px)
*   `--ds-spacing-6`: `1.5rem` (24px)
*   `--ds-spacing-8`: `2rem` (32px)
*   `--ds-spacing-10`: `2.5rem` (40px)
*   `--ds-spacing-12`: `3rem` (48px)
*   `--ds-spacing-16`: `4rem` (64px)

---

## 4. Bordas (Borders and Radius)

### 4.1 Raio de Borda (Border Radius)
*   `--ds-border-radius-sm`: `2px` (estética mais angular e moderna)
*   `--ds-border-radius-md`: `4px` (padrão para botões e inputs)
*   `--ds-border-radius-lg`: `8px` (para cards, modais e containers maiores)
*   `--ds-border-radius-full`: `9999px` (pílula / avatares redondos)

### 4.2 Espessura de Borda (Border Width)
*   `--ds-border-width-sm`: `1px` (padrão)
*   `--ds-border-width-md`: `2px` (foco / botões proeminentes)

---

## 5. Sombras (Shadows)

Projetadas para dar profundidade e elevação sutis em escalas pretas:
*   `--ds-shadow-sm`: `0 1px 2px 0 rgba(0, 0, 0, 0.05)`
*   `--ds-shadow-md`: `0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)`
*   `--ds-shadow-lg`: `0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)`

---

## 6. Breakpoints

Utilizados em media-queries SCSS:
*   `--ds-breakpoint-sm`: `640px`
*   `--ds-breakpoint-md`: `768px`
*   `--ds-breakpoint-lg`: `1024px`
*   `--ds-breakpoint-xl`: `1280px`
*   `--ds-breakpoint-2xl`: `1536px`
