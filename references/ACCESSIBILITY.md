# Diretrizes de Acessibilidade (ACCESSIBILITY.md)

Este documento estabelece as diretrizes de acessibilidade que **devem** ser seguidas no desenvolvimento de todos os componentes deste design system, visando a conformidade com as diretrizes **WCAG 2.1 nível AA**.

---

## 1. Contraste de Cores

O contraste visual de elementos textuais e interativos contra o fundo deve obedecer aos seguintes limites mínimos:

*   **Texto Normal (abaixo de 18pt/24px ou 14pt/18.66px em negrito):** Contraste mínimo de **4.5:1** contra o fundo correspondente.
*   **Texto Grande (acima de 18pt/24px ou 14pt/18.66px em negrito):** Contraste mínimo de **3.0:1**.
*   **Componentes de Interface Ativos e Gráficos:** Bordas de inputs, ícones e estados focados de botões devem ter um contraste mínimo de **3.0:1** contra o fundo.

No nosso tema monocromático (preto e branco), o contraste é naturalmente alto. Ao usar cinzas intermediários (ex: `--ds-color-neutral-400` para placeholder ou `--ds-color-neutral-500` para textos secundários), verifique a conformidade.

---

## 2. Navegação por Teclado e Gerenciamento de Foco

Qualquer usuário deve conseguir operar a interface inteiramente através do teclado.

### 2.1 Indicador de Foco (Focus Ring)
*   **Regra de Ouro:** O indicador de foco (`:focus` ou `:focus-visible`) **nunca** deve ser ocultado ou removido (`outline: none`) sem que seja fornecido um substituto visual óbvio e de alto contraste.
*   O anel de foco padrão do design system deve usar:
    ```css
    outline: 2px solid var(--ds-color-focus-ring);
    outline-offset: 2px;
    ```

### 2.2 Ordem de Tabulação (Tab Order)
*   A ordem de foco via tecla `Tab` deve ser lógica e sequencial (da esquerda para a direita, de cima para baixo).
*   Não altere a ordem natural usando `tabindex` positivo (ex: `tabindex="1"`). Use apenas `tabindex="0"` para tornar elementos focáveis ou `tabindex="-1"` para remover do fluxo de tabulação mas manter focável via script.

### 2.3 Navegação Direcional e Atalhos
*   **Menus, Selects e Dropdowns:** Devem permitir navegação vertical pelas opções usando as setas do teclado (`ArrowUp` / `ArrowDown`).
*   **Carrosséis:** Devem permitir alternar slides usando as setas direita/esquerda quando focados.
*   **Modais / Overlays:**
    *   **Focus Trap:** O foco deve ser contido dentro do modal enquanto ele estiver aberto. O usuário não pode dar `Tab` para fora do modal.
    *   **Escape:** O modal deve fechar imediatamente ao pressionar a tecla `Escape`.
    *   **Retorno do Foco:** Ao fechar o modal, o foco do teclado deve retornar exatamente para o botão/elemento que disparou sua abertura.

---

## 3. Semântica HTML e ARIA (Accessible Rich Internet Applications)

### 3.1 Uso de Tags Nativas
Prefira sempre elementos HTML nativos por possuírem semântica e comportamentos de acessibilidade integrados:
*   Use `<button>` em vez de `<div onClick={...}>`.
*   Use `<a>` para navegação entre páginas.

### 3.2 Atributos ARIA Essenciais
Quando tags nativas não forem suficientes ou ao criar padrões baseados no Radix UI, os seguintes atributos devem ser gerenciados:
*   `aria-expanded`: `"true"` ou `"false"` para indicar o estado de menus abertos/fechados.
*   `aria-invalid`: `"true"` em inputs quando a validação falhar, ajudando leitores de tela a reportar o erro.
*   `aria-describedby`: Aponta para o `id` da mensagem de ajuda ou de erro associada ao input.
*   `aria-label` / `aria-labelledby`: Fornece um nome acessível para elementos sem texto visual (ex: botão de fechar representado por um ícone "X" deve ter `aria-label="Fechar"`).

---

## 4. Testes de Acessibilidade no Ciclo de TDD

Para validar a acessibilidade, o projeto usa testes automatizados integrados com o Jest Axe e verificações manuais de navegação:

### 4.1 Teste Automatizado com `jest-axe`
Todo componente deve conter um teste que verifica violações de acessibilidade na estrutura renderizada. Exemplo:

```typescript
import { render } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { Button } from './Button'

expect.extend(toHaveNoViolations)

it('should have no accessibility violations', async () => {
  const { container } = render(<Button>Enviar</Button>)
  const results = await axe(container)
  expect(results).toHaveNoViolations()
})
```

### 4.2 Lista de Verificação Manual
1.  Consigo interagir com todos os elementos apenas usando o teclado?
2.  Onde está o meu foco atual (o indicador visual está claro a cada clique no `Tab`)?
3.  O leitor de tela anuncia corretamente a função do elemento (ex: "Botão, Fechar" ao focar no "X" do modal)?
