# SPEC 01 — Segurança e Proteção de Dados no DeliveryFast

- **Identificação:** `SPEC-01-SEGURANCA-PROTECAO-DADOS`
- **Arquivo:** `SPEC/2026-11-17-seguranca-protecao-dados.md`
- **Data da especificação:** 2026-11-17
- **Referência de origem:** [Issue #1 — Primeiras impressões: Auditoria técnica e alinhamento com os autores originais](https://github.com/Dracpyto/dsai-ap2--Delivery-/issues/1)
- **Estado do repositório verificado em:** commit `d2d16b5` (após integração do commit `dacf0c7`) e revalidado em `214fe19`
- **Status:** Implementada na branch `feature/protecao-dados` (todos os critérios `CA-01` a `CA-07` atendidos)

---

## 1. Problema identificado

Durante a auditoria técnica inicial do **DeliveryFast** (registrada na Issue #1) e a reinspeção direta do código-fonte atual (commit `d2d16b5`), foi constatado que a aplicação manipula credenciais, dados pessoais de entrega e entradas livres do usuário sem mecanismos de proteção, sanitização ou isolamento entre contas.

Os problemas concretos deste domínio dividem-se em cinco frentes:

1. **Armazenamento de senhas em texto puro e exposição em logs do console:** As senhas informadas no cadastro são salvas diretamente sem qualquer transformação nas chaves `df_usuarios` e `df_usuario_logado` do `localStorage`, além de serem impressas no DevTools do navegador via `console.log`.
2. **Vulnerabilidade de Cross-Site Scripting (XSS) armazenado e refletido:** Dados controlados pelo usuário (`nome` no cadastro/saudação, `endereco` no checkout e `termo` na barra de busca recém-adicionada no commit `dacf0c7`) são interpolados diretamente em templates HTML inseridos via `innerHTML` sem escape de caracteres especiais (`<`, `>`, `&`, `"`, `'`).
3. **Compartilhamento indevido de pedidos e endereços entre usuários distintos:** Todos os pedidos realizados no navegador são gravados em uma única lista global (`deliveryfast_pedidos`) sem vínculo com o identificador do usuário autenticado (`usuarioId`). Quando um usuário sai da conta (funcionalidade agora visível no cabeçalho após a inclusão de `#area-usuario` no commit `dacf0c7`) e outro usuário se cadastra no mesmo dispositivo, o novo usuário visualiza integralmente os pedidos, nomes e endereços residenciais dos usuários anteriores.
4. **Risco potencial de Path Traversal no servidor estático local (`server.js`):** O utilitário `server.js` (adicionado no commit `dacf0c7`) valida o caminho usando `filePath.startsWith(BASE_DIR)` sem separador final ou `path.relative`, padrão que pode permitir acesso a diretórios irmãos com mesmo prefixo.
5. **Limitações arquiteturais inerentes à ausência de backend:** Toda a persistência ocorre no `window.localStorage`, o que significa que não há fronteira de segurança real entre cliente e servidor.

> **Nota sobre evolução recente do repositório (verificação cruzada com a Issue #1):**  
> Ao revisar os arquivos atuais em relação à Issue #1, verificou-se que o commit `dacf0c7` (*"Criação de um motor de busca"*) adicionou `<div id="area-usuario">` em `src/index.html` (linhas 42–44) e filtros rápidos em `src/components/restaurants.js` (linhas 20048–20056). Isso tornou o botão `"Sair"` funcional na interface, o que **agrava na prática** os problemas de isolamento de pedidos e de XSS na saudação do cabeçalho, além de introduzir dois novos pontos de interpolação sem escape em `src/components/search.js` (linhas 41 e 190).

---

## 2. Evidências encontradas no código

Todas as evidências abaixo foram confirmadas diretamente nos arquivos do repositório no estado atual (`d2d16b5`):

### 2.1. Senha em texto puro no `localStorage` e vazamento via `console.log`
- **Arquivos:** `src/components/register.js` (linhas 38–44) e `src/js/database.js` (linhas 25020–25034).
- **Trecho em `src/js/database.js`:**
  ```javascript
  // Linhas 25020-25034
  const usuario = {
    id: Date.now(),
    ...novoUsuario, // Contém { nome, email, senha } em texto puro
    dataCadastro: new Date().toLocaleString('pt-BR')
  };

  usuarios.push(usuario);
  usuarioLogado = usuario;

  // Guarda as alterações no localStorage
  localStorage.setItem('df_usuarios', JSON.stringify(usuarios));
  localStorage.setItem('df_usuario_logado', JSON.stringify(usuarioLogado));

  console.log('Utilizador logado:', usuarioLogado);
  ```
- **Evidência prática:** Ao cadastrar um usuário, a chave `df_usuarios` armazena `[{"id":...,"nome":"...","email":"...","senha":"1",...}]`, a chave `df_usuario_logado` replica o campo `senha` na sessão ativa e o objeto completo é exibido no console do navegador.

### 2.2. XSS armazenado e refletido via `innerHTML`
- **Ponto 1 — Histórico de Pedidos (`src/components/orders.js`, linhas 20092–20097):**
  ```javascript
  ${pedido.nome ? `
    <div class="mb-3 text-sm text-gray-600">
      <p><strong>Cliente:</strong> ${pedido.nome}</p>
      <p><strong>Endereço:</strong> ${pedido.endereco}</p>
    </div>
  ` : ''}
  ```
  *Evidência:* Informar `<img src=x onerror="window.__xss=1">` no `prompt()` de endereço (`src/components/cart.js`, linha 20134) dispara a execução do JavaScript injetado assim que `renderPedidos()` é chamado (inclusive a cada 5 segundos pelo `setInterval` nas linhas 20120–20125).
- **Ponto 2 — Saudação do Usuário no Cabeçalho (`src/main.js`, linhas 15–22):**
  ```javascript
  areaUsuario.innerHTML = `
    ...
    <span class="w-7 h-7 ...">${usuario.nome.charAt(0).toUpperCase()}</span>
    <span class="text-sm">Olá, ${usuario.nome.split(' ')[0]}</span>
  `;
  ```
  *Evidência:* Como `<div id="area-usuario">` agora existe em `src/index.html` (linha 42), um nome cadastrado contendo `<img src=x onerror=alert(1)>` (sem espaços) é injetado diretamente no cabeçalho em todas as navegações.
- **Ponto 3 — Resultados da Busca (`src/components/search.js`, linhas 41 e 190):**
  ```javascript
  // Linha 41 (quando não há resultados):
  <span class="font-semibold text-gray-800">"${termo || ''}"</span>
  // Linha 190 (quando há resultados):
  Resultados para "${termo}"
  ```
  *Evidência:* Qualquer termo digitado em `#input-busca` com tags HTML é renderizado sem sanitização em `#app`.

### 2.3. Compartilhamento de pedidos entre usuários distintos
- **Arquivos:** `src/components/cart.js` (linhas 20150–20157) e `src/components/orders.js` (linhas 20000, 20016–20037 e 20056–20069).
- **Trecho em `src/components/orders.js`:**
  ```javascript
  // Linhas 20016-20030
  export function adicionarPedidoAoHistorico(itensCarrinho, total, nome, endereco) {
    const agora = Date.now();
    const novoPedido = {
      id: `PED-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: agora,
      data: new Date(agora).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }),
      itens: [...itensCarrinho],
      total: total,
      nome: nome || '',
      endereco: endereco || ''
      // Ausência de usuarioId / email do autor do pedido
    };
  ```
  ```javascript
  // Linhas 20056-20069
  historicoPedidos = JSON.parse(localStorage.getItem('deliveryfast_pedidos')) || [];
  ...
  const listaPedidosHtml = historicoPedidos.map(pedido => { ... });
  ```
- **Evidência prática:** `renderPedidos()` nem sequer consulta `obterUsuarioLogado()`. Qualquer pessoa usando o navegador (mesmo deslogada após clicar em `"Sair"`, ou logada com um segundo cadastro) vê todos os pedidos de `deliveryfast_pedidos`.

---

## 3. Objetivo da melhoria

Estabelecer controles técnicos de segurança no cliente e higiene no tratamento de dados do **DeliveryFast**, mantendo a arquitetura atual (SPA em Vanilla JS + ES Modules + `localStorage`), para:
1. Eliminar o armazenamento de senhas em texto puro, a presença de credenciais no objeto de sessão ativa (`df_usuario_logado`) e o registro de dados sensíveis em logs do console.
2. Erradicar vulnerabilidades de XSS (armazenado e refletido) em todas as renderizações dinâmicas da interface por meio de codificação/escape sistemático de saída HTML.
3. Isolar o histórico e a criação de pedidos por usuário autenticado (`usuarioId`), impedindo que usuários deslogados ou outras contas visualizem pedidos alheios na interface.
4. Documentar de forma transparente as limitações de segurança decorrentes da arquitetura sem backend (uso de `localStorage`).

---

## 4. Justificativa e impacto para o negócio

- **Proteção contra execução de scripts maliciosos (XSS):** Em uma aplicação que armazena dados em `localStorage`, uma única falha de XSS permite que um script injetado leia todas as chaves do `localStorage` (`df_usuarios`, `df_usuario_logado`, `deliveryfast_pedidos`), altere preços de itens no carrinho ou desfigure a interface.
- **Privacidade e conformidade (LGPD):** Expor o nome completo, endereço residencial e histórico de consumo de um cliente para o próximo usuário do mesmo navegador (ex.: computadores compartilhados em residências, laboratórios ou escritórios) configura vazamento direto de dados pessoais na interface.
- **Redução de exposição de credenciais:** Usuários frequentemente reutilizam senhas pessoais em protótipos e sistemas acadêmicos. Gravar a senha em texto puro no `localStorage` e imprimi-la no `console.log` expõe essas credenciais a qualquer inspeção casual do navegador.

---

## 5. Perfil dos usuários afetados

1. **Clientes finais da plataforma:** Afetados diretamente pela exposição de suas senhas, nomes e endereços de entrega, especialmente ao utilizarem dispositivos compartilhados ou ao trocarem de conta pelo botão `"Sair"`.
2. **Avaliadores e desenvolvedores da equipe de manutenção:** Afetados pelo vazamento de dados sensíveis no console e pela ausência de funções utilitárias seguras para renderização no DOM.

---

## 6. Requisitos funcionais

- **RF-01 — Remoção de senha em texto puro no cadastro e na sessão:**
  - O módulo `src/js/database.js` nunca deve persistir a propriedade `senha` em texto puro na chave `df_usuarios`.
  - A senha deve ser transformada antes da persistência utilizando uma função de hash unidirecional determinística com *salt* (preferencialmente `crypto.subtle.digest('SHA-256', ...)` da Web Crypto API nativa ou função equivalente compatível com Node.js e navegador), armazenando apenas `senhaHash` (e `salt`, se aplicável).
  - O objeto salvo em `df_usuario_logado` e retornado por `obterUsuarioLogado()` deve conter exclusivamente dados públicos da sessão (`{ id, nome, email, dataCadastro }`), **sem incluir** `senha` nem `senhaHash`.
- **RF-02 — Eliminação de logs contendo dados sensíveis:**
  - Remover o `console.log('Utilizador logado:', usuarioLogado)` de `src/js/database.js` (linha 25033) e proibir que funções de cadastro/autenticação imprimam credenciais ou endereços no console.
- **RF-03 — Escape e sanitização contra XSS na renderização:**
  - Criar uma função utilitária pura `escaparHtml(valor)` (ex.: em `src/js/security.js` ou módulo compartilhado) que converta `&`, `<`, `>`, `"` e `'` em suas respectivas entidades HTML (`&amp;`, `&lt;`, `&gt;`, `&quot;`, `&#39;`).
  - Aplicar `escaparHtml()` obrigatoriamente sobre todos os dados oriundos do usuário ou do `localStorage` antes de interpolá-los em strings atribuídas a `innerHTML`, incluindo:
    - `usuario.nome` (e inicial do nome) em `src/main.js`;
    - `pedido.id`, `pedido.data`, `pedido.nome`, `pedido.endereco` e nomes de itens em `src/components/orders.js`;
    - `termo` pesquisado em `src/components/search.js`;
    - Nomes e descrições de itens no carrinho em `src/components/cart.js`.
- **RF-04 — Vinculação de pedidos ao usuário autenticado (`usuarioId`):**
  - Ao criar um pedido em `adicionarPedidoAoHistorico` (`src/components/orders.js`) a partir de `window.finalizarPedido` (`src/components/cart.js`), o objeto do pedido deve registrar obrigatoriamente o identificador único do usuário logado (`usuarioId: usuario.id`, além de `usuarioEmail: usuario.email` como referência secundária).
- **RF-05 — Isolamento na visualização do histórico de pedidos:**
  - A tela `"Meus Pedidos"` (`renderPedidos()` em `src/components/orders.js`) deve consultar `obterUsuarioLogado()`.
  - Caso **não exista usuário logado**, a tela não deve exibir nenhum pedido armazenado no navegador; em vez disso, deve exibir uma mensagem orientando o usuário a entrar ou criar uma conta para visualizar seus pedidos (com botão de atalho para a tela de cadastro/autenticação).
  - Caso **exista usuário logado**, `renderPedidos()` deve filtrar `historicoPedidos` exibindo exclusivamente os pedidos cujo `usuarioId` corresponda a `usuario.id` (ver seção de Decisões Pendentes quanto a pedidos legados sem `usuarioId`).
- **RF-06 — Limpeza visual ao realizar Logout (`sairDaConta`):**
  - Ao acionar `window.sairDaConta()` (`src/main.js`), além de remover `df_usuario_logado`, a aplicação deve garantir que dados privados da sessão anterior (como a visualização aberta de `"Meus Pedidos"` ou itens deixados no carrinho em memória) não permaneçam expostos na tela para o próximo usuário.
- **RF-07 — Proteção contra Path Traversal no servidor local (`server.js`):**
  - Ajustar a validação de caminho em `server.js` (linha 26) utilizando `path.resolve` e verificando se o arquivo resolvido está estritamente dentro de `BASE_DIR + path.sep` (ou é igual a `BASE_DIR`).

---

## 7. Requisitos não funcionais

- **RNF-01 — Preservação da stack e zero dependências externas:** Todas as funções de sanitização e hashing devem utilizar exclusivamente recursos nativos da linguagem JavaScript / Web APIs / Node.js, sem adicionar bibliotecas npm de terceiros.
- **RNF-02 — Testabilidade em Node.js:** Os utilitários de segurança (escape de HTML, geração/verificação de hash de senha e filtragem de pedidos por usuário) devem ser exportados como funções puras ou desacopladas do DOM para que possam ser testados diretamente via `node tests/...`.
- **RNF-03 — Desempenho:** A sanitização de strings e a filtragem de pedidos não devem adicionar latência perceptível (`< 5ms` por renderização, inclusive durante o ciclo de `setInterval` de 5 segundos em `orders.js`).

---

## 8. Regras de negócio

- **RN-01:** Nenhum pedido pode ser registrado sem estar associado a um `usuario.id` válido de um cliente autenticado na sessão.
- **RN-02:** Um usuário autenticado $A$ jamais pode visualizar na interface pedidos pertencentes a um usuário $B$ ($A.id \neq B.id$).
- **RN-03:** Visitantes não autenticados (`obterUsuarioLogado() === null`) não têm permissão para visualizar a listagem de pedidos em `"Meus Pedidos"`.
- **RN-04:** Caracteres especiais como `<`, `>`, `"`, `'` e `&` inseridos no nome do cliente, no endereço de entrega ou na busca são permitidos como texto literal (ex.: `"Rua A & B, nº 10 <Fundos>"`), devendo ser exibidos literalmente na tela sem jamais serem interpretados como marcação HTML ou script.

### Decisões pendentes de validação com os autores originais (🔶 Não presumidas)

Em conformidade com as restrições da AP2, os seguintes pontos **dependem de resposta dos autores originais na Issue #1** e não devem ter regras definitivas inventadas sem alinhamento:

1. 🔶 **Tratamento de pedidos legados sem `usuarioId`:** Pedidos gravados na versão da AP1 não possuem o campo `usuarioId`. Deve ser definido com os autores se esses registros antigos devem ser ocultados por padrão (comportamento mais seguro e recomendado por esta SPEC) ou associados/descartados na migração.
2. 🔶 **Política de complexidade mínima de senha:** Atualmente o cadastro aceita senhas de 1 caractere (`"1"`). A definição de tamanho mínimo (ex.: 6 ou 8 caracteres) será tratada na SPEC de Autenticação/Validação após confirmação com os autores.
3. 🔶 **Comportamento do carrinho ao trocar de usuário (`sairDaConta`):** Confirmar se ao clicar em `"Sair"` o carrinho deve ser esvaziado imediatamente para não misturar compras entre clientes diferentes no mesmo aparelho.

---

## 9. Limitações de segurança decorrentes da ausência de backend

Esta especificação registra explicitamente que, por requisito arquitetural do projeto (SPA estática sem servidor backend e sem banco de dados remoto), **o uso de `localStorage` não oferece segurança real contra um atacante com acesso local ao navegador**:

1. **Inspeção direta via DevTools:** Qualquer usuário com acesso físico ao navegador pode abrir o painel *Application > Local Storage* (ou executar `localStorage.getItem('deliveryfast_pedidos')` no Console) e ler todos os registros brutos armazenados naquele perfil de navegador, independentemente do filtro aplicado na interface (`RF-05`).
2. **Manipulação de estado no cliente:** Um usuário técnico pode alterar manualmente o conteúdo de `df_usuario_logado` no DevTools para assumir o `id` de outro usuário cadastrado naquele mesmo navegador ou modificar os preços/totais em `deliveryfast_pedidos`.
3. **Hashing no cliente não substitui hashing no servidor:** Armazenar `senhaHash` em vez de `senha` em texto puro evita a leitura imediata da senha por terceiros que olhem o DevTools ou por scripts acidentais, mas o hash continua acessível localmente no `localStorage` e sujeito a ataques de dicionário offline caso a senha seja fraca.
4. **Quando um backend seria necessário:** Para obter isolamento real multiusuário, confidencialidade de endereços, autenticação inviolável no cliente (via sessões HTTP-only/JWT assinados no servidor) e proteção contra adulteração de preços, seria estritamente necessário introduzir uma API backend com banco de dados persistente no servidor. Enquanto a arquitetura serverless/local for mantida na AP2, os controles desta SPEC atuam como **defesa em profundidade na camada de aplicação e interface**.

---

## 10. Critérios de aceitação verificáveis

- [x] **CA-01 (Sem senha em claro):** Após cadastrar um usuário com senha `"MinhaSenha123"`, inspecionar `localStorage.getItem('df_usuarios')` e `localStorage.getItem('df_usuario_logado')` e comprovar que a substring `"MinhaSenha123"` **não existe** em nenhuma das chaves, e que `df_usuario_logado` não possui os campos `senha` nem `senhaHash`.
- [x] **CA-02 (Sem vazamento no console):** Realizar o cadastro de um usuário e verificar que nenhuma chamada a `console.log` imprime o objeto do usuário ou sua senha.
- [x] **CA-03 (Bloqueio de XSS no histórico de pedidos):** Cadastrar um pedido com o endereço `<img src=x onerror="window.__xss=1">` e abrir a tela `"Meus Pedidos"`. Comprovar que `window.__xss` permanece `undefined`, nenhuma requisição para `/x` é disparada e o texto `<img src=x onerror="window.__xss=1">` aparece literalmente renderizado como texto na tela.
- [x] **CA-04 (Bloqueio de XSS no cabeçalho e na busca):** Cadastrar um usuário com nome `<svg/onload="window.__xssNome=1">` e pesquisar por `<script>window.__xssBusca=1</script>`. Comprovar que nenhum script é executado e que ambos os textos são exibidos escapados.
- [x] **CA-05 (Isolamento de pedidos entre usuários na UI):**
  1. Cadastrar o `Usuário A`, realizar 1 pedido e clicar em `"Sair"`.
  2. Abrir `"Meus Pedidos"` deslogado e comprovar que o pedido do `Usuário A` **não é exibido**.
  3. Cadastrar o `Usuário B`, abrir `"Meus Pedidos"` e comprovar que a lista exibe `"Você ainda não fez nenhum pedido"`, sem mostrar o nome ou endereço do `Usuário A`.
- [x] **CA-06 (Persistência de `usuarioId` no pedido):** Verificar no JSON de `deliveryfast_pedidos` que todo novo pedido contém a propriedade `usuarioId` igual ao `id` do usuário que o finalizou.
- [x] **CA-07 (Testes automatizados passando):** Executar a suíte de testes de segurança em Node.js (`node tests/security.test.js`) e verificar 100% de aprovação.

---

## 11. Arquivos e módulos potencialmente envolvidos

| Arquivo | Tipo de intervenção prevista na implementação |
|---|---|
| `src/js/security.js` *(novo)* | Funções puras `escaparHtml(texto)` e `gerarHashSenha(senha, salt)` / `verificarSenha(senha, hash)`. |
| `src/js/database.js` | Substituição do armazenamento de `senha` em claro por hash; sanitização do objeto salvo em `df_usuario_logado`; remoção do `console.log`. |
| `src/main.js` | Aplicação de `escaparHtml` na renderização de `#area-usuario` e limpeza de estado sensível em `window.sairDaConta`. |
| `src/components/orders.js` | Inclusão de `usuarioId` em `adicionarPedidoAoHistorico`, filtro por `obterUsuarioLogado().id` em `renderPedidos()` e aplicação de `escaparHtml` nos campos do pedido. |
| `src/components/cart.js` | Passagem de `usuario.id` para `adicionarPedidoAoHistorico` e escape de nomes no widget do carrinho. |
| `src/components/search.js` | Aplicação de `escaparHtml(termo)` nos títulos e mensagens de resultado da busca. |
| `server.js` | Correção da verificação de diretório base (`path.resolve` + prefixo seguro) contra Path Traversal. |
| `tests/security.test.js` *(novo)* | Testes unitários automatizados para `escaparHtml`, não exposição de senha e isolamento de pedidos por `usuarioId`. |

---

## 12. Estratégia de testes

1. **Testes Unitários Automatizados (`node tests/security.test.js`):**
   - Testar `escaparHtml()` com payloads clássicos de XSS (`<script>alert(1)</script>`, `<img src=x onerror=alert(1)>`, `" onclick="alert(1)`, `'&#x3c;`), entradas nulas/indefinidas e números.
   - Testar a função de hash/transformação de senha garantindo que a saída nunca seja igual à senha em texto puro e que a verificação reconheça a senha correta e rejeite senhas incorretas.
   - Testar a função de criação/higienização de usuário garantindo que o objeto de sessão pública não contenha `senha` nem `senhaHash`.
   - Testar a função de filtragem de pedidos garantindo que:
     - Usuário `null` (deslogado) recebe `[]`;
     - Usuário com `id: 1` recebe apenas pedidos com `usuarioId === 1`, ignorando pedidos de `usuarioId === 2` ou sem `usuarioId`.
2. **Testes End-to-End (Navegador):**
   - Reexecutar os cenários 10, 11 e 12 do script de auditoria E2E (inspeção de `df_usuarios`, injeção de XSS no endereço/nome/busca e troca entre 1º e 2º usuário) comprovando que todas as falhas foram neutralizadas.
3. **Testes de Regressão:**
   - Executar `node tests/checkout-validation.test.js` e `node tests/search.test.js` para garantir que nenhuma funcionalidade existente foi quebrada.

---

## 13. Dependências e riscos

- **Dependência com a futura SPEC de Autenticação (Login/Logout):** Como o hash da senha passa a ser armazenado no cadastro (`RF-01`), a futura função de Login deverá utilizar a mesma função `verificarSenha(senhaDigitada, usuario.senhaHash)` definida nesta SPEC.
- **Risco de incompatibilidade entre Web Crypto API (assíncrona) e código síncrono:** `window.crypto.subtle.digest` retorna uma `Promise`, enquanto `cadastrarUsuario` atualmente é síncrona (`src/js/database.js`, linha 25011). Caso se opte por manter `cadastrarUsuario` síncrona para não quebrar chamadas existentes, pode-se utilizar uma função de hash síncrona determinística em JS puro (ou tornar o handler do formulário em `register.js` `async/await`).
- **Risco com dados antigos no `localStorage` do desenvolvedor/usuário:** Contas e pedidos criados antes da implementação desta SPEC no navegador local não terão `senhaHash` nem `usuarioId`. O código deve tratar graciosamente objetos antigos sem lançar exceções (`TypeError`).

---

## 14. Funcionalidades que não fazem parte do escopo

Não fazem parte desta SPEC (serão tratadas em SPECs próprias ou estão fora do escopo da AP2):
- Criação de servidor backend, banco de dados relacional/NoSQL externo ou autenticação baseada em tokens JWT no servidor;
- Implementação da tela de Login de usuários já cadastrados (escopo da SPEC de Autenticação e Sessão);
- Remoção do código volumétrico gerado por `gerador.py` (escopo da SPEC de Manutenibilidade e Limpeza de Código);
- Refatoração das regras de cálculo de frete/subtotal ou validação numérica do checkout (escopo da SPEC de Carrinho e Checkout);
- Correções de layout responsivo em telas de `375px` (escopo da SPEC de Responsividade e UI).

---

## 15. Critérios de conclusão (Definition of Done)

Esta especificação será considerada concluída quando:
1. O documento `SPEC/2026-11-17-seguranca-protecao-dados.md` estiver revisado e versionado no repositório;
2. Todos os requisitos funcionais (`RF-01` a `RF-07`) e não funcionais (`RNF-01` a `RNF-03`) tiverem sido implementados nos módulos listados;
3. Todos os critérios de aceitação (`CA-01` a `CA-07`) tiverem sido verificados com sucesso;
4. A nova suíte `tests/security.test.js` e as suítes existentes (`tests/checkout-validation.test.js` e `tests/search.test.js`) estiverem passando sem erros;
5. As limitações do `localStorage` estiverem documentadas de forma clara no `README.md` do projeto.
