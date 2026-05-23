# Design System 🖤

> [Ir para documentação em PT-BR](https://github.com/rafacdomin/design-system/blob/main/README_PT-BR.md)

This is the **Design System**, a minimalist React component library based on a high-contrast monochromatic scale. Designed for personal and professional web portfolio applications, the system prioritizes performance, strict accessibility (WCAG 2.1 AA), and visual stability guaranteed by automated testing locally and in the cloud.

---

## 🚀 Technical Stack

The project is structured using modern monorepo and automated testing practices:

- **Core & Runtime:** React 18 + TypeScript 5 (Strict Mode)
- **Styling:** SCSS Modules + CSS Custom Properties (zero CSS-in-JS, zero Tailwind)
- **Monorepo Tooling:** Turborepo + `pnpm` workspaces
- **Sandbox & Documentation:** Storybook 8
- **Unit & Accessibility Testing:** Vitest + React Testing Library + `jest-axe`
- **Visual Regression Testing:** Playwright + BrowserStack Automate (WebSocket CDP + Local Tunnel)
- **Code Quality:** ESLint (flat config), Prettier, Husky + lint-staged

---

## 📦 Monorepo Structure

The repository is managed using Turborepo and divided into workspaces under the `packages/` directory:

```
design-system/
├── packages/
│   ├── core/         # Core components with no heavy dependencies, design tokens, and themes
│   ├── carousel/     # Complex Carousel component (separated due to dependency on Embla Carousel)
│   └── docs/         # Storybook 8 sandbox and Playwright Visual Regression test suite
├── .epic/            # Strategic planning and development issues (Spec-Driven Development)
├── references/       # Detailed guidelines for architecture, accessibility, testing, and workflow
├── package.json      # Global shortcuts and root tooling dependencies
├── turbo.json        # Turborepo pipeline configuration and task caching
└── SPEC.md           # Detailed technical specification of component APIs
```

- **Why separate `@ds/carousel`?** We maintain the rule that any component with a heavy dependency (>10kb gzipped) must reside in its own subpackage to optimize the final bundle size of the core application.

---

## 🎨 Design Tokens

All design tokens are declared as CSS custom properties under the `--ds-` prefix and change dynamically depending on the active theme.

### 1. Colors (Premium Monochromatic Scale)

| Token                     | Light Theme Value (HEX / HSL) | Dark Theme Value (HEX / HSL) | Suggested Usage                      |
| :------------------------ | :---------------------------- | :--------------------------- | :----------------------------------- |
| `--ds-color-neutral-0`    | `#ffffff` (hsl(0, 0%, 100%))  | `#0a0a0a` (hsl(0, 0%, 4%))   | Main page background                 |
| `--ds-color-neutral-50`   | `#f9f9f9` (hsl(0, 0%, 98%))   | `#121212` (hsl(0, 0%, 7%))   | Secondary background (e.g., cards)   |
| `--ds-color-neutral-100`  | `#f1f1f1` (hsl(0, 0%, 95%))   | `#1a1a1a` (hsl(0, 0%, 10%))  | Subtle background hover              |
| `--ds-color-neutral-200`  | `#e2e2e2` (hsl(0, 0%, 89%))   | `#262626` (hsl(0, 0%, 15%))  | Input borders and dividers           |
| `--ds-color-neutral-300`  | `#d4d4d4` (hsl(0, 0%, 83%))   | `#3a3a3a` (hsl(0, 0%, 23%))  | Focused borders, disabled background |
| `--ds-color-neutral-400`  | `#a3a3a3` (hsl(0, 0%, 64%))   | `#525252` (hsl(0, 0%, 32%))  | Placeholders and active borders      |
| `--ds-color-neutral-500`  | `#737373` (hsl(0, 0%, 45%))   | `#737373` (hsl(0, 0%, 45%))  | Secondary / helper text              |
| `--ds-color-neutral-600`  | `#525252` (hsl(0, 0%, 32%))   | `#a3a3a3` (hsl(0, 0%, 64%))  | Hover on secondary texts             |
| `--ds-color-neutral-700`  | `#404040` (hsl(0, 0%, 25%))   | `#d4d4d4` (hsl(0, 0%, 83%))  | Regular body text                    |
| `--ds-color-neutral-800`  | `#262626` (hsl(0, 0%, 15%))   | `#e2e2e2` (hsl(0, 0%, 89%))  | Titles and medium-emphasis texts     |
| `--ds-color-neutral-900`  | `#171717` (hsl(0, 0%, 9%))    | `#f1f1f1` (hsl(0, 0%, 95%))  | Prominent titles                     |
| `--ds-color-neutral-1000` | `#0a0a0a` (hsl(0, 0%, 4%))    | `#ffffff` (hsl(0, 0%, 100%)) | Primary button and chip background   |
| `--ds-color-focus-ring`   | `hsl(0, 0%, 0%)`              | `hsl(0, 0%, 100%)`           | Visual focus ring (`:focus-visible`) |
| `--ds-color-danger`       | `hsl(0, 84%, 48%)`            | `hsl(0, 96%, 65%)`           | Error feedback or destructive colors |

### 2. Typography

- **Size Scale:** Based on `rem` (xs: `0.75rem`, sm: `0.875rem`, md: `1rem`, lg: `1.125rem`, xl: `1.25rem`, 2xl: `1.5rem`, 3xl: `1.875rem`, 4xl: `2.25rem`).
- **Families:** Interface/Sans-serif (`--ds-font-family-sans` with `Inter`) and Titles/Accents (`--ds-font-family-heading` with `Poppins`).
- **Weights:** Regular (`400`), Medium (`500` / `505`), Semibold (`600`), Bold (`700`).

### 3. Other Tokens

- **Spacing:** Linear base scale of `4px` (`--ds-spacing-1` of `4px` to `--ds-spacing-16` of `64px`).
- **Borders:** Modern and subtle rounding (sm: `2px`, md: `4px`, lg: `8px`, full: `9999px`) and thicknesses (sm: `1px`, md: `2px`).
- **Shadows:** Three translucent elevations (`--ds-shadow-sm`, `--ds-shadow-md`, `--ds-shadow-lg`).
- **Breakpoints:** Standardized media-queries (sm: `640px`, md: `768px`, lg: `1024px`, xl: `1280px`, 2xl: `1536px`).

---

## 🌗 Theming System

The design system uses CSS environment variables (Custom Properties) encapsulated in HTML attributes to switch themes instantly without re-rendering the component tree:

- **Provider:** `<ThemeProvider defaultTheme="light">` manages the theme state and applies the `data-theme` attribute to the wrapper tag.
- **HOC `withTheme`**: Injects the `data-theme` property and synchronizes the context for individual components when necessary.
- **Usage in SCSS**: All SCSS styles reference only the theme properties (e.g., `background-color: var(--ds-color-neutral-0)`), never literal hex/rgb values.

---

## 🧩 Component Architecture

We follow strict componentization rules to keep the codebase scalable:

1. **forwardRef and forwardProps Signatures**: All components expose complete, typed native DOM references.
2. **Typed Properties**: TypeScript interfaces explicitly declared (e.g., `interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>`). Never use type aliases (`type`).
3. **Compound Component Pattern**: For compound components like `Dropdown` (with Radix UI) and `Input` (with icon slots), subcomponents are aggregated directly onto the main component root using `Object.assign`:
   ```tsx
   export const Dropdown = Object.assign(ThemedDropdownComponent, {
     Item: DropdownItemComponent,
     Trigger: DropdownTriggerComponent,
   })
   ```
   Subcomponents are not individually exported in the main `index.ts`, and their `displayName`s reflect the hierarchy (e.g., `Dropdown.Item`).

---

## 🧪 Testing Strategy

We guarantee component reliability through three layers of automated testing:

### 1. Unit and Integration Testing (Vitest + React Testing Library)

- Coverage of behavior, event firing, state lifecycles, and API calls.
- Minimum coverage: **90% Statements**, **85% Branches**, and **90% Functions**.

### 2. Accessibility (WCAG 2.1 AA via `jest-axe`)

- Each component has a dedicated suite to verify HTML structure errors, initial color contrast, ARIA hierarchy, and general compliance.
- Strict keyboard focus management, including focus traps in modals and arrow navigation in dropdowns.

### 3. Visual Regression (Playwright + BrowserStack)

- **Dynamic Scanning:** The runner [visual.spec.ts](https://github.com/rafacdomin/design-system/blob/main/packages/docs/src/test-visual/visual.spec.ts) dynamically reads active Storybook stories from `storybook-static/index.json`.
- **Scenarios:** Run under 375x812 (Mobile), 768x1024 (Tablet), and 1280x800 (Desktop) viewports under both light and dark themes.
- **Stability:** Automatic injection of CSS to remove animations, transitions, and text cursor blinking during captures to mitigate flakiness.
- **BrowserStack Integration:** Automatically activated in CI environments via `BROWSERSTACK_USERNAME` and `BROWSERSTACK_ACCESS_KEY` flags, routing tests through a secure local tunnel (`browserstack-local`) to validate on real browsers on Windows 11 and macOS.

---

## 🛠️ Available Scripts

Executable commands from the root directory:

| Command                   | Description                                                            |
| :------------------------ | :--------------------------------------------------------------------- |
| `pnpm dev`                | Starts the Turborepo development pipeline in parallel                  |
| `pnpm build`              | Compiles all packages and generates the Storybook static build         |
| `pnpm lint`               | Runs ESLint checks across all workspaces                               |
| `pnpm format`             | Formats all repository code using Prettier                             |
| `pnpm test`               | Runs all unit and accessibility tests with Vitest                      |
| `pnpm test:visual`        | Runs the visual regression test suite locally against the static build |
| `pnpm test:visual:update` | Updates the local reference images (snapshots) for visual tests        |
| `pnpm storybook`          | Starts the local Storybook development server on port `6006`           |

For more details on how to contribute, component development rules, and commit standardization, see the [Contribution Guide (CONTRIBUTING.md)](https://github.com/rafacdomin/design-system/blob/main/CONTRIBUTING.md).
