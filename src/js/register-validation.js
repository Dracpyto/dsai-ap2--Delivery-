/**
 * Módulo de validação para o cadastro de usuários em etapas
 * e para a atualização do perfil do usuário.
 */

export function validarEtapa1(dados = {}) {
  const { nome, email, senha } = dados;

  if (!nome || typeof nome !== 'string' || nome.trim().length < 3) {
    return { valido: false, erro: 'O nome completo deve ter pelo menos 3 caracteres.' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || typeof email !== 'string' || !emailRegex.test(email.trim())) {
    return { valido: false, erro: 'Informe um e-mail válido.' };
  }

  if (!senha || typeof senha !== 'string' || senha.length < 4) {
    return { valido: false, erro: 'A senha deve conter no mínimo 4 caracteres.' };
  }

  return { valido: true, erro: null };
}

export function validarEtapa2(dados = {}) {
  const { idade, telefone, rua, numero, bairro, cidade } = dados;

  const idadeNum = Number(idade);
  if (!idade || isNaN(idadeNum) || idadeNum < 12 || idadeNum > 120) {
    return { valido: false, erro: 'Informe uma idade válida (entre 12 e 120 anos).' };
  }

  if (!telefone || typeof telefone !== 'string' || telefone.replace(/\D/g, '').length < 8) {
    return { valido: false, erro: 'Informe um telefone/celular válido para entrega.' };
  }

  if (!rua || typeof rua !== 'string' || rua.trim().length === 0) {
    return { valido: false, erro: 'O logradouro/rua é obrigatório.' };
  }

  if (!numero || typeof numero !== 'string' || numero.trim().length === 0) {
    return { valido: false, erro: 'O número do endereço é obrigatório.' };
  }

  if (!bairro || typeof bairro !== 'string' || bairro.trim().length === 0) {
    return { valido: false, erro: 'O bairro é obrigatório.' };
  }

  if (!cidade || typeof cidade !== 'string' || cidade.trim().length === 0) {
    return { valido: false, erro: 'A cidade é obrigatória.' };
  }

  return { valido: true, erro: null };
}

export function formatarEnderecoCompleto(end = {}) {
  const { rua, numero, complemento, bairro, cidade, cep } = end;
  const partes = [];

  if (rua && numero) {
    partes.push(`${rua.trim()}, ${numero.trim()}`);
  }
  if (complemento && complemento.trim()) {
    partes.push(complemento.trim());
  }
  if (bairro && bairro.trim()) {
    partes.push(bairro.trim());
  }
  if (cidade && cidade.trim()) {
    partes.push(cidade.trim());
  }
  if (cep && cep.trim()) {
    partes.push(`CEP: ${cep.trim()}`);
  }

  return partes.join(' - ');
}

/**
 * Valida os dados de atualização de perfil (edição pelo usuário logado).
 * A senha é opcional: se deixada em branco, mantém a anterior.
 * @param {Object} dados
 * @returns {{ valido: boolean, erro: string|null }}
 */
export function validarAtualizacaoPerfil(dados = {}) {
  const { nome, email, senha, idade, telefone, rua, numero, bairro, cidade } = dados;

  if (!nome || typeof nome !== 'string' || nome.trim().length < 3) {
    return { valido: false, erro: 'O nome completo deve ter pelo menos 3 caracteres.' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || typeof email !== 'string' || !emailRegex.test(email.trim())) {
    return { valido: false, erro: 'Informe um e-mail válido.' };
  }

  // Senha é opcional na edição — só valida se foi preenchida
  if (senha !== undefined && senha !== '' && typeof senha === 'string' && senha.length < 4) {
    return { valido: false, erro: 'A nova senha deve ter no mínimo 4 caracteres.' };
  }

  const idadeNum = Number(idade);
  if (!idade || isNaN(idadeNum) || idadeNum < 12 || idadeNum > 120) {
    return { valido: false, erro: 'Informe uma idade válida (entre 12 e 120 anos).' };
  }

  if (!telefone || typeof telefone !== 'string' || telefone.replace(/\D/g, '').length < 8) {
    return { valido: false, erro: 'Informe um telefone/celular válido.' };
  }

  if (!rua || typeof rua !== 'string' || rua.trim().length === 0) {
    return { valido: false, erro: 'O logradouro/rua é obrigatório.' };
  }

  if (!numero || typeof numero !== 'string' || numero.trim().length === 0) {
    return { valido: false, erro: 'O número do endereço é obrigatório.' };
  }

  if (!bairro || typeof bairro !== 'string' || bairro.trim().length === 0) {
    return { valido: false, erro: 'O bairro é obrigatório.' };
  }

  if (!cidade || typeof cidade !== 'string' || cidade.trim().length === 0) {
    return { valido: false, erro: 'A cidade é obrigatória.' };
  }

  return { valido: true, erro: null };
}
