# SPEC — Ferramenta de Busca do DeliveryFast

Data: 2026-11-15

## Objetivo

Implementar uma ferramenta de busca no DeliveryFast, permitindo que o usuário pesquise facilmente por restaurantes e por pratos do cardápio, com retorno estruturado dos resultados e mensagem clara de "não encontrado" caso o item pesquisado não exista na aplicação.

## Motivação

Com a expansão da variedade de restaurantes e pratos disponíveis, os usuários necessitam de um mecanismo rápido e intuitivo para localizar seus alimentos e estabelecimentos favoritos sem precisar navegar manualmente por cada cardápio.

## Critérios de Aceitação

1. **Campo de busca:** A interface deve fornecer um campo de busca acessível na aplicação (com ícone, placeholder explicativo e botão para limpar o termo).
2. **Busca por restaurantes:** A pesquisa deve localizar estabelecimentos através de correspondência no nome do restaurante ou em sua categoria.
3. **Busca por pratos:** A pesquisa deve localizar itens do cardápio através de correspondência no nome do prato ou em sua descrição, indicando a qual restaurante o prato pertence.
4. **Tolerância a formatação:** A busca deve ser insensível a maiúsculas/minúsculas (case-insensitive) e ignorar acentuação (ex: "hamburguer" localiza "Hambúrguer", "sashimi" localiza "Sashimi").
5. **Retorno de resultados:**
   - Se encontrar restaurantes correspondentes, exibe os cards dos restaurantes com opção de acessar o cardápio.
   - Se encontrar pratos correspondentes, exibe os cards com foto, preço, restaurante de origem e botão de "+ Adicionar" direto ao carrinho.
6. **Mensagem de não encontrado:** Caso a busca não localize nenhum restaurante e nenhum prato, a aplicação deve exibir uma mensagem explícita e amigável informando que nenhum resultado foi encontrado para o termo pesquisado, sugerindo termos alternativos e botão para retornar à lista geral.
7. **Limpeza da busca:** Ao limpar o campo de busca ou clicar em voltar/início, a aplicação restaura a listagem padrão de restaurantes.
8. **Testes automatizados:** O projeto deve conter testes unitários automatizados cobrindo as regras da ferramenta de busca (busca por restaurante, prato, descrição, acentuação, termo vazio e termo não existente).

## Fora do Escopo

- Busca por geolocalização / raio de distância.
- Filtro avançado por faixa de preço ou tempo de entrega.
