# SPEC: Ícone do Carrinho Clicável no Header

**Data:** 2026-11-17  
**Status:** Implementado  
**Autor:** Gemini (assistente IA)

---

## Objetivo

Tornar o ícone 🛒 no header clicável, de forma que ao clicar ele **destaque e exiba o widget flutuante** do carrinho que já existe no canto inferior direito da tela.

---

## Requisitos Funcionais

### RF-01 — Ícone do header clicável
- O ícone 🛒 no header passa de `<div>` para `<button>` com `onclick="abrirCarrinho()"`.
- Visual: mantém o mesmo estilo, adiciona `hover:bg-red-800` e cursor pointer.

### RF-02 — Comportamento ao clicar

**Caso A — carrinho com itens:**
- O widget flutuante já está visível no canto inferior direito.
- Executa uma animação de pulso (3× scale 1.04 → 1) chamando a atenção.
- Faz scroll suave até o widget.

**Caso B — carrinho vazio:**
- Cria/exibe o widget flutuante temporariamente.
- Mostra a mensagem: *"Seu carrinho está vazio — Adicione itens do cardápio para começar!"*.
- Oculta automaticamente após 2,5 segundos.

---

## Arquivos Modificados

| Arquivo | Alteração |
|---|---|
| `src/index.html` | Substituído `<div>` pelo `<button onclick="abrirCarrinho()">` |
| `src/components/cart.js` | Adicionada `abrirCarrinhoWidget()` e `window.abrirCarrinho` |
| `src/main.js` | Import de `abrirCarrinhoWidget`; registro de `window.abrirCarrinho` |

---

## Critérios de Aceitação

- [x] Clicar no ícone 🛒 do header chama `abrirCarrinho()`.
- [x] Com itens: widget pulsa e rola até ele.
- [x] Sem itens: mensagem temporária aparece por 2,5s.
- [x] Sintaxe válida em todos os arquivos alterados.
