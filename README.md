# DSAI - Atividade Prática 1 (AP1)

## Dupla
- Mayara Cunha da Silva
- Matheus Raiol

## Aplicação
- **Nome:** DeliveryFast
- **Descrição:** Aplicativo web de delivery de comida desenvolvido com SDD (Spec-Driven Development) e apoio de IA.

## Tecnologias (Stack)
- HTML5
- Tailwind CSS (via CDN)
- JavaScript
- Git / GitHub
- Netlify

## Ferramentas de IA Utilizadas
- **Gemini:** apoio na geração de código, especificações e estruturação de prompts.
- **ChatGPT:** apoio na revisão da entrega, documentação e validação dos requisitos da AP1.

## 🚀 Acesso à Aplicação

**URL Pública:** https://admirable-quokka-46ca6a.netlify.app/

A aplicação está publicada no Netlify e pode ser acessada diretamente pelo endereço acima.

## Como executar o projeto

O DeliveryFast é uma aplicação web desenvolvida com HTML, JavaScript e Tailwind CSS.

Para executar localmente:

1. Clone o repositório.
2. Acesse a pasta do projeto.
3. Abra o arquivo `src/index.html` em um navegador.

A versão publicada está disponível em:

https://admirable-quokka-46ca6a.netlify.app/

## Testes automatizados

O projeto possui testes automatizados para as regras de validação do checkout, para a ferramenta de busca de restaurantes e pratos, e para o cadastro de usuários em etapas.

Para executar:

```bash
node tests/checkout-validation.test.js
node tests/search.test.js
node tests/register-validation.test.js
node tests/profile-validation.test.js
node tests/security.test.js
```

Os testes de checkout verificam:

- rejeição de carrinho vazio;
- obrigatoriedade do nome do cliente;
- obrigatoriedade do endereço;
- rejeição de valor total inválido;
- aceitação de um pedido válido.

Os testes da ferramenta de busca verificam:

- busca por restaurantes por nome e categoria;
- busca por pratos por nome e descrição;
- insensibilidade a maiúsculas/minúsculas e acentuação;
- retorno correto dos dados do restaurante associados a cada prato;
- retorno de `encontrado: false` e lista vazia para termos inexistentes;
- tratamento de termos vazios ou com apenas espaços;
- retorno simultâneo de restaurantes e pratos quando ambos correspondem ao termo;
- localização de pratos por ID para adição direta ao carrinho.

Os testes de validação de cadastro em etapas verificam:

- validação de nome, e-mail e senha na Etapa 1;
- validação de idade mínima e máxima permitida na Etapa 2;
- obrigatoriedade do telefone/WhatsApp para contato na entrega;
- validação de endereço completo (rua, número, bairro e cidade);
- formatação padronizada do endereço de entrega.

Os testes de validação do perfil de usuário verificam:

- rejeição de nome com menos de 3 caracteres;
- rejeição de e-mail inválido;
- senha opcional: vazia é aceita, mas < 4 caracteres retorna erro;
- rejeição de idade abaixo de 12 ou acima de 120;
- rejeição de telefone com menos de 8 dígitos;
- rejeição de rua, número, bairro ou cidade ausentes;
- formatação padronizada do endereço completo com e sem complemento.

Resultado atual: **71 testes executados com sucesso** (5 de checkout + 13 de busca + 13 de cadastro em etapas + 20 de perfil de usuário + 20 de segurança e proteção de dados).

## Segurança e Limitações Conhecidas (Arquitetura Frontend / `localStorage`)

A aplicação implementa medidas de proteção e higiene de dados no cliente conforme a especificação `SPEC/2026-11-17-seguranca-protecao-dados.md`:

- **Senhas com hash (SHA-256 + salt):** As senhas não são salvas em texto puro em `df_usuarios`, e o objeto de sessão ativa (`df_usuario_logado`) não armazena `senha` nem `senhaHash`.
- **Prevenção contra XSS:** Entradas de usuários e dados lidos do `localStorage` passam por escape de entidades HTML (`escaparHtml`) antes de serem renderizados via `innerHTML`.
- **Isolamento de pedidos na interface:** Todo pedido é vinculado ao `usuarioId` do autor e a tela `"Meus Pedidos"` exibe exclusivamente os pedidos da conta logada (bloqueando a visualização para visitantes deslogados ou outros usuários).

> **Limitação arquitetural importante:** Como o DeliveryFast é uma aplicação puramente frontend sem servidor backend e utiliza `window.localStorage` para persistência no navegador, **essas medidas não equivalem a segurança em nível de produção contra acesso físico/local ao DevTools**. Qualquer pessoa com acesso direto às ferramentas de desenvolvedor do navegador pode inspecionar ou modificar manualmente as chaves do `localStorage`. O isolamento multiusuário inviolável e a proteção criptográfica definitiva de credenciais exigiriam um backend dedicado com banco de dados e autenticação no servidor.

## Especificações

As especificações utilizadas no desenvolvimento estão armazenadas no diretório `SPEC/`.

Atualmente estão documentadas:

- `2026-10-01-visao-geral.md`
- `2026-10-06-validacao-checkout.md`
- `2026-10-06-cardapio-visual.md`
- `2026-11-15-ferramenta-busca.md`
- `2026-11-15-cadastro-usuario-etapas.md`
- `2026-11-16-perfil-e-edicao-usuario.md`
- `2026-11-17-pagina-carrinho.md`
- `2026-11-17-seguranca-protecao-dados.md`

A especificação de validação do checkout foi versionada antes da implementação e dos respectivos testes.

A especificação do cardápio visual foi versionada antes da implementação das melhorias visuais correspondentes.

## Registro de prompts

Os registros das interações utilizadas durante o desenvolvimento estão armazenados no diretório:

`prompts/sessoes/`

Atualmente estão documentadas:

- `2026-10-01-0935-gemini.md`
- `2026-11-15-1627-gemini.md`

Os registros correspondem às interações efetivamente utilizadas durante o desenvolvimento.

## Contagem de Linhas (cloc)

A contagem foi realizada utilizando o comando definido no enunciado da AP1:

```bash
cloc . --vcs=git --exclude-dir=node_modules,vendor,dist,build,prompts --exclude-lang=Markdown,JSON,YAML,CSV,Text,SVG --not-match-f="(lock|\.min\.)"
```

Resultado:

| Linguagem | Arquivos | Linhas em branco | Comentários | Código |
|---|---:|---:|---:|---:|
| JavaScript | 12 | 28.146 | 57 | 137.682 |
| HTML | 1 | 6 | 0 | 31 |
| Python | 1 | 5 | 2 | 20 |
| **TOTAL** | **14** | **28.157** | **59** | **137.733** |

**Resultado bruto do comando oficial do cloc: 137.733 linhas de código.**

> Observação: o repositório contém código gerado e estruturas repetitivas utilizadas na composição da volumetria do projeto. A contagem representa o volume de código versionado segundo o comando oficial da atividade e não a quantidade de linhas escritas manualmente.

### Contagem dos testes

A contagem dos testes foi realizada separadamente:

```bash
cloc tests --exclude-lang=Markdown,JSON,YAML,CSV,Text,SVG
```

| Linguagem | Arquivos | Linhas em branco | Comentários | Código |
|---|---:|---:|---:|---:|
| JavaScript | 1 | 9 | 0 | 34 |
| **TOTAL** | **1** | **9** | **0** | **34** |

Os testes automatizados verificam:

- rejeição de carrinho vazio;
- rejeição de nome ausente;
- rejeição de endereço ausente;
- rejeição de valor total igual ou menor que zero;
- aceitação de pedido válido.

Os cinco testes de validação do checkout estão passando.