/**
 * Suíte de testes automatizados de Segurança e Proteção de Dados — DeliveryFast
 * Especificação: SPEC/2026-11-17-seguranca-protecao-dados.md
 *
 * Execução: node tests/security.test.js
 */

import {
  escaparHtml,
  sha256Hex,
  gerarHashSenha,
  verificarSenha,
  sanitizarUsuarioSessao,
  filtrarPedidosPorUsuario
} from '../src/js/security.js';

let totalTestes = 0;
let passaram = 0;

function testar(descricao, condicao) {
  totalTestes++;
  if (!condicao) {
    throw new Error(`FALHOU: ${descricao}`);
  }
  passaram++;
  console.log(`PASSOU: ${descricao}`);
}

// ======================================================
// 1. TESTES DE PREVENÇÃO CONTRA XSS (RF-03 / CA-03 / CA-04)
// ======================================================

testar(
  'escaparHtml converte tags <script> em entidades HTML seguras',
  escaparHtml('<script>window.__xss=1</script>') === '&lt;script&gt;window.__xss=1&lt;/script&gt;'
);

testar(
  'escaparHtml neutraliza payload <img src=x onerror=alert(1)> no endereço',
  escaparHtml('<img src=x onerror="window.__xss=1">') === '&lt;img src=x onerror=&quot;window.__xss=1&quot;&gt;'
);

testar(
  'escaparHtml escapa aspas simples, aspas duplas e e-comercial (&)',
  escaparHtml(`Rua A & B, "Fundos" 'Bloco 1'`) === 'Rua A &amp; B, &quot;Fundos&quot; &#39;Bloco 1&#39;'
);

testar(
  'escaparHtml trata null e undefined retornando string vazia',
  escaparHtml(null) === '' && escaparHtml(undefined) === ''
);

testar(
  'escaparHtml converte valores numéricos para string sem perda',
  escaparHtml(12345) === '12345'
);

// ======================================================
// 2. TESTES DE HASHING E PROTEÇÃO DE SENHAS (RF-01 / CA-01)
// ======================================================

testar(
  'sha256Hex produz o vetor oficial FIPS 180-4 para "abc"',
  sha256Hex('abc') === 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad'
);

const senhaTeste = 'MinhaSenhaSecreta123!';
const hashGerado = gerarHashSenha(senhaTeste, 'cliente@teste.com');

testar(
  'gerarHashSenha nunca armazena a senha em texto puro no hash resultante',
  !hashGerado.includes(senhaTeste) && hashGerado.startsWith('sha256$cliente@teste.com$')
);

testar(
  'verificarSenha retorna true para a senha correta e false para senha incorreta',
  verificarSenha(senhaTeste, hashGerado) === true &&
  verificarSenha('SenhaErrada999', hashGerado) === false
);

testar(
  'gerarHashSenha gera hashes distintos para a mesma senha quando o salt (email) muda',
  gerarHashSenha(senhaTeste, 'usuario1@teste.com') !== gerarHashSenha(senhaTeste, 'usuario2@teste.com')
);

// ======================================================
// 3. TESTES DE HIGIENIZAÇÃO DA SESSÃO ATIVA (RF-01 / CA-01)
// ======================================================

const usuarioBruto = {
  id: 1001,
  nome: 'Maria Silva',
  email: 'maria@teste.com',
  senha: '1234',
  senhaHash: hashGerado,
  endereco: 'Rua das Flores, 100'
};

const usuarioSessao = sanitizarUsuarioSessao(usuarioBruto);

testar(
  'sanitizarUsuarioSessao remove os campos senha e senhaHash do objeto de sessão',
  usuarioSessao.senha === undefined &&
  usuarioSessao.senhaHash === undefined &&
  usuarioSessao.id === 1001 &&
  usuarioSessao.nome === 'Maria Silva' &&
  usuarioSessao.email === 'maria@teste.com'
);

testar(
  'sanitizarUsuarioSessao retorna null para entradas inválidas',
  sanitizarUsuarioSessao(null) === null && sanitizarUsuarioSessao(undefined) === null
);

// ======================================================
// 4. TESTES DE ISOLAMENTO DE PEDIDOS POR USUÁRIO (RF-04 / RF-05 / CA-05 / CA-06)
// ======================================================

const pedidosSimulados = [
  { id: 'PED-1001', usuarioId: 10, nome: 'Usuário A', endereco: 'Rua A, 10', total: 45.0 },
  { id: 'PED-1002', usuarioId: 20, nome: 'Usuário B', endereco: 'Rua B, 20', total: 60.0 },
  { id: 'PED-1003', usuarioId: 10, nome: 'Usuário A', endereco: 'Rua A, 10', total: 32.0 },
  { id: 'PED-LEGADO', nome: 'Pedido Antigo Sem UsuarioId', endereco: 'Rua Antiga, 1', total: 28.9 }
];

testar(
  'filtrarPedidosPorUsuario retorna lista vazia quando não há usuário logado (visitante)',
  filtrarPedidosPorUsuario(pedidosSimulados, null).length === 0
);

const pedidosUsuarioA = filtrarPedidosPorUsuario(pedidosSimulados, { id: 10, nome: 'Usuário A' });
testar(
  'filtrarPedidosPorUsuario retorna exclusivamente os pedidos do Usuário A (id=10)',
  pedidosUsuarioA.length === 2 &&
  pedidosUsuarioA.every((p) => p.usuarioId === 10)
);

const pedidosUsuarioB = filtrarPedidosPorUsuario(pedidosSimulados, { id: 20, nome: 'Usuário B' });
testar(
  'filtrarPedidosPorUsuario impede que o Usuário B veja pedidos do Usuário A ou pedidos sem usuarioId',
  pedidosUsuarioB.length === 1 &&
  pedidosUsuarioB[0].id === 'PED-1002' &&
  !pedidosUsuarioB.some((p) => p.nome === 'Usuário A')
);

const pedidosUsuarioC = filtrarPedidosPorUsuario(pedidosSimulados, { id: 30, nome: 'Usuário C' });
testar(
  'filtrarPedidosPorUsuario retorna array vazio para novo usuário sem pedidos próprios',
  pedidosUsuarioC.length === 0
);

// ======================================================
// 5. TESTES DE INTEGRAÇÃO COM DATABASE.JS (localStorage mockado em Node)
// ======================================================

const storeMemoria = {};
globalThis.localStorage = {
  getItem: (k) => (k in storeMemoria ? storeMemoria[k] : null),
  setItem: (k, v) => { storeMemoria[k] = String(v); },
  removeItem: (k) => { delete storeMemoria[k]; }
};

const { cadastrarUsuario, obterUsuarioLogado, atualizarUsuario, sairUsuario } = await import('../src/js/database.js');

const sessaoCriada = cadastrarUsuario({
  nome: 'Cliente Seguranca',
  email: 'seguranca@teste.com',
  senha: 'SenhaForte2026'
});

testar(
  'cadastrarUsuario grava senhaHash em df_usuarios e nunca grava a senha em texto puro',
  !storeMemoria['df_usuarios'].includes('SenhaForte2026') &&
  JSON.parse(storeMemoria['df_usuarios'])[0].senha === undefined &&
  typeof JSON.parse(storeMemoria['df_usuarios'])[0].senhaHash === 'string'
);

testar(
  'df_usuario_logado e obterUsuarioLogado() não contêm senha nem senhaHash',
  !storeMemoria['df_usuario_logado'].includes('SenhaForte2026') &&
  JSON.parse(storeMemoria['df_usuario_logado']).senha === undefined &&
  JSON.parse(storeMemoria['df_usuario_logado']).senhaHash === undefined &&
  obterUsuarioLogado().senha === undefined &&
  obterUsuarioLogado().senhaHash === undefined &&
  sessaoCriada.nome === 'Cliente Seguranca'
);

const hashOriginal = JSON.parse(storeMemoria['df_usuarios'])[0].senhaHash;
atualizarUsuario({ nome: 'Cliente Seguranca Editado', senha: '' });

testar(
  'atualizarUsuario com senha em branco preserva o senhaHash anterior e atualiza o nome',
  JSON.parse(storeMemoria['df_usuarios'])[0].senhaHash === hashOriginal &&
  JSON.parse(storeMemoria['df_usuarios'])[0].senha === undefined &&
  obterUsuarioLogado().nome === 'Cliente Seguranca Editado'
);

atualizarUsuario({ nome: 'Cliente Seguranca Editado', senha: 'NovaSenha888' });

testar(
  'atualizarUsuario com nova senha gera novo senhaHash sem salvar senha em claro',
  !storeMemoria['df_usuarios'].includes('NovaSenha888') &&
  JSON.parse(storeMemoria['df_usuarios'])[0].senhaHash !== hashOriginal &&
  verificarSenha('NovaSenha888', JSON.parse(storeMemoria['df_usuarios'])[0].senhaHash) === true
);

sairUsuario();
testar(
  'sairUsuario limpa a sessão ativa (obterUsuarioLogado() === null)',
  obterUsuarioLogado() === null && storeMemoria['df_usuario_logado'] === undefined
);

console.log(`\nTodos os ${passaram}/${totalTestes} testes de segurança e proteção de dados foram executados com sucesso!`);
