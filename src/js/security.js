/**
 * Módulo de utilitários de segurança e proteção de dados — DeliveryFast
 * Especificação: SPEC/2026-11-17-seguranca-protecao-dados.md
 *
 * Implementado em JavaScript puro (zero dependências externas) para funcionar
 * de forma síncrona tanto no navegador (ES Modules) quanto nos testes em Node.js.
 */

const MAPA_ENTIDADES_HTML = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
};

/**
 * Escapa caracteres especiais HTML (&, <, >, ", ') para prevenir XSS
 * ao interpolar dados de usuários ou do localStorage em templates innerHTML.
 *
 * @param {*} valor - Valor a ser convertido e escapado.
 * @returns {string} String segura com entidades HTML escapadas.
 */
export function escaparHtml(valor) {
  if (valor === null || valor === undefined) {
    return '';
  }

  return String(valor).replace(/[&<>"']/g, (char) => MAPA_ENTIDADES_HTML[char]);
}

/**
 * Implementação síncrona de SHA-256 (FIPS 180-4) em JavaScript puro (UTF-8).
 * Permite gerar hashes criptográficos de senhas de forma síncrona no navegador
 * e no Node.js sem introduzir dependências externas nem quebrar contratos síncronos.
 *
 * @param {string} mensagem - Texto de entrada.
 * @returns {string} Hash SHA-256 em hexadecimal (64 caracteres).
 */
export function sha256Hex(mensagem) {
  const bytes = codificarUtf8(String(mensagem ?? ''));

  const K = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
  ];

  let h0 = 0x6a09e667;
  let h1 = 0xbb67ae85;
  let h2 = 0x3c6ef372;
  let h3 = 0xa54ff53a;
  let h4 = 0x510e527f;
  let h5 = 0x9b05688c;
  let h6 = 0x1f83d9ab;
  let h7 = 0x5be0cd19;

  const bitLen = bytes.length * 8;
  const padded = [...bytes, 0x80];
  while ((padded.length % 64) !== 56) {
    padded.push(0x00);
  }

  const highBits = Math.floor(bitLen / 0x100000000);
  const lowBits = bitLen >>> 0;
  padded.push(
    (highBits >>> 24) & 0xff, (highBits >>> 16) & 0xff, (highBits >>> 8) & 0xff, highBits & 0xff,
    (lowBits >>> 24) & 0xff, (lowBits >>> 16) & 0xff, (lowBits >>> 8) & 0xff, lowBits & 0xff
  );

  const W = new Array(64);
  const rotr = (n, x) => (x >>> n) | (x << (32 - n));

  for (let i = 0; i < padded.length; i += 64) {
    for (let t = 0; t < 16; t++) {
      const idx = i + t * 4;
      W[t] = ((padded[idx] << 24) | (padded[idx + 1] << 16) | (padded[idx + 2] << 8) | padded[idx + 3]) >>> 0;
    }

    for (let t = 16; t < 64; t++) {
      const s0 = (rotr(7, W[t - 15]) ^ rotr(18, W[t - 15]) ^ (W[t - 15] >>> 3)) >>> 0;
      const s1 = (rotr(17, W[t - 2]) ^ rotr(19, W[t - 2]) ^ (W[t - 2] >>> 10)) >>> 0;
      W[t] = (W[t - 16] + s0 + W[t - 7] + s1) >>> 0;
    }

    let a = h0;
    let b = h1;
    let c = h2;
    let d = h3;
    let e = h4;
    let f = h5;
    let g = h6;
    let h = h7;

    for (let t = 0; t < 64; t++) {
      const S1 = (rotr(6, e) ^ rotr(11, e) ^ rotr(25, e)) >>> 0;
      const ch = ((e & f) ^ (~e & g)) >>> 0;
      const temp1 = (h + S1 + ch + K[t] + W[t]) >>> 0;
      const S0 = (rotr(2, a) ^ rotr(13, a) ^ rotr(22, a)) >>> 0;
      const maj = ((a & b) ^ (a & c) ^ (b & c)) >>> 0;
      const temp2 = (S0 + maj) >>> 0;

      h = g;
      g = f;
      f = e;
      e = (d + temp1) >>> 0;
      d = c;
      c = b;
      b = a;
      a = (temp1 + temp2) >>> 0;
    }

    h0 = (h0 + a) >>> 0;
    h1 = (h1 + b) >>> 0;
    h2 = (h2 + c) >>> 0;
    h3 = (h3 + d) >>> 0;
    h4 = (h4 + e) >>> 0;
    h5 = (h5 + f) >>> 0;
    h6 = (h6 + g) >>> 0;
    h7 = (h7 + h) >>> 0;
  }

  return [h0, h1, h2, h3, h4, h5, h6, h7]
    .map((v) => v.toString(16).padStart(8, '0'))
    .join('');
}

function codificarUtf8(str) {
  if (typeof TextEncoder !== 'undefined') {
    return Array.from(new TextEncoder().encode(str));
  }
  const utf8 = unescape(encodeURIComponent(str));
  const bytes = [];
  for (let i = 0; i < utf8.length; i++) {
    bytes.push(utf8.charCodeAt(i));
  }
  return bytes;
}

/**
 * Gera um hash unidirecional determinístico com salt para a senha do usuário (RF-01).
 *
 * @param {string} senha - Senha informada pelo usuário.
 * @param {string} [salt] - Salt opcional (ex: e-mail normalizado ou salt aleatório).
 * @returns {string} Hash formatado no padrão `sha256$<salt>$<digest>`.
 */
export function gerarHashSenha(senha, salt = '') {
  if (!senha || typeof senha !== 'string') {
    throw new Error('A senha informada é inválida para geração de hash.');
  }

  const saltNormalizado = (salt && String(salt).trim().toLowerCase()) || 'df_default_salt';
  const digest = sha256Hex(`deliveryfast::${saltNormalizado}::${senha}`);
  return `sha256$${saltNormalizado}$${digest}`;
}

/**
 * Verifica se uma senha em texto corresponde ao hash armazenado.
 *
 * @param {string} senhaDigitada - Senha informada para verificação.
 * @param {string} senhaHashArmazenado - Hash no formato `sha256$<salt>$<digest>`.
 * @returns {boolean} `true` se a senha corresponder ao hash.
 */
export function verificarSenha(senhaDigitada, senhaHashArmazenado) {
  if (!senhaDigitada || typeof senhaDigitada !== 'string') return false;
  if (!senhaHashArmazenado || typeof senhaHashArmazenado !== 'string') return false;

  const partes = senhaHashArmazenado.split('$');
  if (partes.length !== 3 || partes[0] !== 'sha256') {
    return false;
  }

  const salt = partes[1];
  const hashCalculado = gerarHashSenha(senhaDigitada, salt);
  return hashCalculado === senhaHashArmazenado;
}

/**
 * Remove campos sensíveis (`senha` e `senhaHash`) do objeto de usuário antes de
 * armazená-lo na sessão ativa (`df_usuario_logado`) ou retorná-lo para a UI (RF-01).
 *
 * @param {Object|null} usuario - Objeto completo do usuário.
 * @returns {Object|null} Cópia sanitizada sem credenciais.
 */
export function sanitizarUsuarioSessao(usuario) {
  if (!usuario || typeof usuario !== 'object') {
    return null;
  }

  const copia = { ...usuario };
  delete copia.senha;
  delete copia.senhaHash;
  return copia;
}

/**
 * Filtra a lista global de pedidos para retornar exclusivamente os pedidos
 * pertencentes ao usuário autenticado na sessão atual (RF-04, RF-05, RN-01..RN-03).
 *
 * Pedidos sem `usuarioId` (ou pertencentes a outros usuários) não são retornados.
 *
 * @param {Array} listaPedidos - Lista completa de pedidos do localStorage.
 * @param {Object|null} usuarioLogado - Objeto do usuário logado na sessão.
 * @returns {Array} Lista filtrada contendo apenas os pedidos do usuário logado.
 */
export function filtrarPedidosPorUsuario(listaPedidos, usuarioLogado) {
  if (!Array.isArray(listaPedidos) || !usuarioLogado || usuarioLogado.id === undefined || usuarioLogado.id === null) {
    return [];
  }

  return listaPedidos.filter((pedido) => {
    if (!pedido || typeof pedido !== 'object') return false;
    if (pedido.usuarioId === undefined || pedido.usuarioId === null) return false;
    return String(pedido.usuarioId) === String(usuarioLogado.id);
  });
}
