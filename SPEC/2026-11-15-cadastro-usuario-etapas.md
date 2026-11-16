# SPEC — Cadastro de Usuário em Etapas (Perfil e Entrega)

Data: 2026-11-15

## Objetivo

Aprimorar o fluxo de cadastro de usuários no DeliveryFast, dividindo-o em duas etapas ("janelas"): a primeira focada nos dados de acesso (nome, e-mail e senha) e a segunda dedicada aos dados pessoais, endereço de entrega e preferências do cliente (idade, telefone, endereço completo, ponto de referência e preferências alimentares).

## Motivação

Em aplicações de delivery de comida, além da conta de acesso, é fundamental coletar endereço de entrega, telefone para contato e preferências alimentares para agilizar o checkout e garantir que os pedidos cheguem com precisão. Uma experiência em etapas torna o formulário menos intimidador e mais organizado.

## Critérios de Aceitação

1. **Etapa 1 — Conta de Acesso:**
   - Campo para Nome Completo.
   - Campo para E-mail.
   - Campo para Senha.
   - Validação de preenchimento obrigatório e verificação de e-mail já existente antes de avançar.
   - Botão para avançar para a próxima janela/etapa.

2. **Etapa 2 — Dados Pessoais e de Entrega:**
   - Confirmação do Nome.
   - Campo para Idade (número positivo).
   - Campo para Telefone / WhatsApp de contato.
   - Endereço completo dividido em:
     - Rua / Logradouro;
     - Número;
     - Complemento (opcional);
     - Bairro;
     - Cidade / UF;
     - CEP (opcional).
   - Ponto de referência para a entrega (opcional).
   - Preferências alimentares (Sem restrições, Vegetariano, Vegano, Sem lactose, Sem glúten).
   - Forma de pagamento preferida (PIX, Cartão de Crédito, Cartão de Débito, Dinheiro).
   - Botão para voltar à primeira etapa sem perder os dados preenchidos.
   - Botão para concluir o cadastro.

3. **Armazenamento e Integração:**
   - Todos os dados coletados devem ser salvos no objeto de usuário no `localStorage`.
   - O endereço cadastrado deve ficar disponível e ser sugerido automaticamente no momento do checkout/finalização de pedidos.
   - A barra de navegação deve ser atualizada com o usuário recém-cadastrado e logado.

4. **Testes Automatizados:**
   - Criação de testes unitários para as regras de validação do cadastro em etapas.
