# SPEC — Página de Perfil e Edição de Dados do Usuário

Data: 2026-11-16

## Objetivo

Disponibilizar uma área dedicada ao cliente após o cadastro/login, onde ele possa visualizar todos os seus dados cadastrais (dados pessoais, de contato, endereço de entrega detalhado e preferências de delivery) e tenha a possibilidade de editar e atualizar essas informações a qualquer momento.

## Motivação

Em aplicações de delivery, o cliente frequentemente precisa atualizar seu endereço de entrega, mudar de telefone/WhatsApp de contato, ajustar preferências alimentares ou forma preferida de pagamento, além de conferir seus dados salvos. Uma tela de perfil com visualização clara e formulário de edição intuitivo garante autonomia, evita retrabalho e melhora a experiência de uso.

## Critérios de Aceitação

1. **Acesso ao Perfil a partir do Cabeçalho:**
   - Na área do usuário logado no topo da página, tanto o crachá/chip com o nome do cliente (`Olá, [Nome]`) quanto um botão explícito `Perfil` devem abrir diretamente a tela de perfil.
   - O botão `Início` deve ser exibido para permitir o retorno à listagem de restaurantes.

2. **Tela de Visualização do Perfil:**
   - Exibir avatar com as iniciais do usuário e selo de cliente ativo.
   - Exibir dados pessoais: Nome Completo, E-mail, Idade e Telefone / WhatsApp.
   - Exibir endereço de entrega principal em destaque formatado, além da discriminação de cada campo (logradouro, número, complemento, bairro, cidade/UF, CEP e ponto de referência).
   - Exibir preferências de delivery (preferência alimentar e forma de pagamento preferida).
   - Exibir data de cadastro e data da última atualização.
   - Botão de ação em destaque: `✏️ Editar Meus Dados`.
   - Atalhos para acompanhar pedidos ou voltar aos restaurantes.

3. **Modo de Edição dos Dados:**
   - Ao clicar em `Editar Meus Dados`, exibir o formulário com todos os campos atuais pré-preenchidos.
   - Permitir alterar nome, e-mail, idade, telefone, endereço completo e preferências.
   - Permitir alteração opcional de senha (caso deixada em branco, preserva a senha anterior).
   - Botão `Cancelar` para retornar à visualização sem alterar os dados.
   - Botão `Salvar Alterações` para validar e persistir as modificações.

4. **Validação e Persistência:**
   - Os dados alterados devem ser validados pela função `validarAtualizacaoPerfil` (mínimo de caracteres para nome, formato de e-mail, idade entre 12 e 120, telefone válido, campos obrigatórios de endereço).
   - Ao salvar com sucesso, atualizar `usuarioLogado` e a lista `usuarios` no `localStorage`.
   - Atualizar imediatamente a barra de navegação superior (refletindo mudanças no nome).
   - Exibir mensagem de confirmação de sucesso para o usuário.

5. **Testes Automatizados:**
   - Garantir cobertura com testes unitários para a validação da atualização dos dados do perfil.
