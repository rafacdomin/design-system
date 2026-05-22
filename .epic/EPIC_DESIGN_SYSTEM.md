# Épico: Fundação e Componentes do Design System (EPIC_DESIGN_SYSTEM.md)

Este documento descreve o progresso global da implementação do mini design system. Atua como o quadro Kanban e o índice de todas as issues do projeto.

---

## Tabela de Issues e Progresso

| ID       | Issue                                                                                                                          | Dependências           | Estimativa | Status          |
| :------- | :----------------------------------------------------------------------------------------------------------------------------- | :--------------------- | :--------- | :-------------- |
| **#001** | [Setup do Monorepo & Tooling](file:///home/rafacdomin/projetos/design-system/.epic/issues/001_monorepo_setup.md)               | Nenhuma                | M          | `[x] Concluído` |
| **#002** | [Configuração dos Design Tokens](file:///home/rafacdomin/projetos/design-system/.epic/issues/002_design_tokens.md)             | #001                   | P          | `[x] Concluído` |
| **#003** | [Sistema de Temas (ThemeProvider / HOC)](file:///home/rafacdomin/projetos/design-system/.epic/issues/003_theme_system.md)      | #001, #002             | P          | `[x] Concluído` |
| **#004** | [Configuração do Storybook 8](file:///home/rafacdomin/projetos/design-system/.epic/issues/004_storybook_setup.md)              | #001                   | M          | `[x] Concluído` |
| **#005** | [Componente: Button](file:///home/rafacdomin/projetos/design-system/.epic/issues/005_button_component.md)                      | #001, #002, #003, #004 | M          | `[x] Concluído` |
| **#006** | [Componente: Input](file:///home/rafacdomin/projetos/design-system/.epic/issues/006_input_component.md)                        | #001, #002, #003, #005 | M          | `[x] Concluído` |
| **#007** | [Componente: Textarea](file:///home/rafacdomin/projetos/design-system/.epic/issues/007_textarea_component.md)                  | #001, #002, #003, #006 | P          | `[x] Concluído` |
| **#008** | [Componente: Dropdown (Radix Select)](file:///home/rafacdomin/projetos/design-system/.epic/issues/008_dropdown_component.md)   | #001, #002, #003       | M          | `[x] Concluído` |
| **#009** | [Componente: Modal (Radix Dialog)](file:///home/rafacdomin/projetos/design-system/.epic/issues/009_modal_component.md)         | #001, #002, #003       | M          | `[x] Concluído` |
| **#010** | [Componente: Card](file:///home/rafacdomin/projetos/design-system/.epic/issues/010_card_component.md)                          | #001, #002, #003       | P          | `[x] Concluído` |
| **#011** | [Componente: Tag](file:///home/rafacdomin/projetos/design-system/.epic/issues/011_tag_component.md)                            | #001, #002, #003       | P          | `[x] Concluído` |
| **#012** | [Componente: Avatar](file:///home/rafacdomin/projetos/design-system/.epic/issues/012_avatar_component.md)                      | #001, #002, #003       | P          | `[x] Concluído` |
| **#013** | [Componente: Carousel (Embla Carousel)](file:///home/rafacdomin/projetos/design-system/.epic/issues/013_carousel_component.md) | #001, #002, #003, #004 | G          | `[x] Concluído` |

---

## Ordem de Execução Recomendada

1.  **Fundação e Infraestrutura:** `#001` (Monorepo), `#002` (Design Tokens), `#003` (Theme System), `#004` (Storybook Setup).
2.  **Componentes Fundamentais:** `#005` (Button) — valida todo o pipeline de testes, Storybook e compilação de CSS.
3.  **Componentes de Formulário:** `#006` (Input), `#007` (Textarea), `#008` (Dropdown).
4.  **Componentes de Layout/Apresentação:** `#009` (Modal), `#010` (Card), `#011` (Tag), `#012` (Avatar).
5.  **Componente Pesado/Extra:** `#013` (Carousel) — criação do pacote separado `@ds/carousel`.
