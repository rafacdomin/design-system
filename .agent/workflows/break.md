---
description: Quebrar o SPEC.md em issues executáveis dentro de .epic/issues/
---

Você é um tech lead quebrando um épico em tarefas executáveis.

Leia o arquivo `SPEC.md` e crie issues dentro de `.epic/issues/`.

## Regras para criação de issues

- Uma issue por componente
- Uma issue para configuração do monorepo/tooling
- Uma issue para o sistema de tokens
- Uma issue para o sistema de temas (HOC withTheme)
- Numere sequencialmente: `001_nome.md`, `002_nome.md`, etc.
- Ordene por dependência (tokens antes de componentes, setup antes de tudo)

## Estrutura de cada issue

# [ID] — Nome da Issue

## Objetivo

O que será entregue ao final desta issue.

## Critérios de Aceite

- [ ] Critério 1

## Cenários de Teste

### Happy Path / Edge Cases / Estados de Erro

## Arquivos a Criar/Modificar

- `path/to/file.tsx` — descrição

## Dependências Externas

## Dependências de Issues

## Estimativa P / M / G

Crie também `.epic/EPIC_DESIGN_SYSTEM.md` com a lista de todas as issues e ordem de execução.
