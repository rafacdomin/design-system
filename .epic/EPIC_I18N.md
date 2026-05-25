# Épico: Internacionalização (i18n) do Storybook e Componentes (EPIC_I18N.md)

Este documento descreve o progresso global da implementação de internacionalização (i18n) no Storybook e componentes do design system. Atua como o quadro Kanban e o índice de todas as issues do i18n.

---

## Tabela de Issues e Progresso

| ID       | Issue                                                                                                                                                            | Dependências | Estimativa | Status          |
| :------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------- | :----------- | :--------- | :-------------- |
| **#021** | [Componentes: Customização de Textos ARIA (core & carousel)](file:///home/rafacdomin/projetos/design-system/.epic/issues/i18n/021_core_components_text_props.md) | Nenhuma      | P          | `[ ] Planejada` |
| **#022** | [Storybook: Infraestrutura e Tradução de Histórias (@ds/docs)](file:///home/rafacdomin/projetos/design-system/.epic/issues/i18n/022_docs_i18n_infrastructure.md) | #021         | M          | `[ ] Planejada` |
| **#023** | [Documentação: Tradução MDX de Design Tokens e Guias](file:///home/rafacdomin/projetos/design-system/.epic/issues/i18n/023_translate_mdx_documentations.md)      | #022         | M          | `[ ] Planejada` |

---

## Ordem de Execução Recomendada

1. **Customização de Props nos Componentes (`#021`)**: Garantir que as bibliotecas permaneçam agnósticas adicionando as novas propriedades (`removeAriaLabel`, `slideAriaLabelFormat`, `dotAriaLabelFormat`) e adaptando seus testes correspondentes.
2. **Infraestrutura i18n no Storybook (`#022`)**: Implementar o `LocaleContext`, o provedor, o componente `<Language>`, o decorator global `withI18n` e a lógica de tradução dinâmica de props.
3. **Tradução das Páginas MDX (`#023`)**: Adaptar todas as páginas de documentação para suportar alternância de idioma baseada em `<Language>`.
