// tests/profile-validation.test.js
// Testes unitários para validarAtualizacaoPerfil e formatarEnderecoCompleto
// Executar: node tests/profile-validation.test.js

import { validarAtualizacaoPerfil, formatarEnderecoCompleto } from '../src/js/register-validation.js';

let passou = 0;
let falhou = 0;

function assert(descricao, condicao) {
  if (condicao) {
    console.log(`  ✅ ${descricao}`);
    passou++;
  } else {
    console.error(`  ❌ ${descricao}`);
    falhou++;
  }
}

// Dados válidos base
const BASE = {
  nome: 'Maria Souza',
  email: 'maria@email.com',
  idade: '28',
  telefone: '11999887766',
  senha: '',
  rua: 'Rua das Flores',
  numero: '42',
  bairro: 'Centro',
  cidade: 'São Paulo',
};

// ── GRUPO 1: nome ──────────────────────────────────────────────────────────
console.log('\n[ GRUPO 1 ] Nome');

let r;

r = validarAtualizacaoPerfil(BASE);
assert('Dados válidos completos retornam valido=true', r.valido === true);

r = validarAtualizacaoPerfil({ ...BASE, nome: '' });
assert('Nome vazio retorna erro', r.valido === false && typeof r.erro === 'string');

r = validarAtualizacaoPerfil({ ...BASE, nome: 'AB' });
assert('Nome com menos de 3 caracteres retorna erro', r.valido === false);

// ── GRUPO 2: email ─────────────────────────────────────────────────────────
console.log('\n[ GRUPO 2 ] Email');

r = validarAtualizacaoPerfil({ ...BASE, email: 'naoeumemail' });
assert('Email inválido (sem @) retorna erro', r.valido === false);

r = validarAtualizacaoPerfil({ ...BASE, email: 'user@' });
assert('Email inválido (sem domínio) retorna erro', r.valido === false);

r = validarAtualizacaoPerfil({ ...BASE, email: 'valido@exemplo.com.br' });
assert('Email válido aceito', r.valido === true);

// ── GRUPO 3: senha (opcional) ──────────────────────────────────────────────
console.log('\n[ GRUPO 3 ] Senha (opcional)');

r = validarAtualizacaoPerfil({ ...BASE, senha: '' });
assert('Senha vazia é aceita (campo opcional)', r.valido === true);

r = validarAtualizacaoPerfil({ ...BASE, senha: '123' });
assert('Senha com menos de 4 caracteres retorna erro', r.valido === false);

r = validarAtualizacaoPerfil({ ...BASE, senha: '1234' });
assert('Senha com 4+ caracteres é aceita', r.valido === true);

// ── GRUPO 4: idade ─────────────────────────────────────────────────────────
console.log('\n[ GRUPO 4 ] Idade');

r = validarAtualizacaoPerfil({ ...BASE, idade: '11' });
assert('Idade menor que 12 retorna erro', r.valido === false);

r = validarAtualizacaoPerfil({ ...BASE, idade: '121' });
assert('Idade maior que 120 retorna erro', r.valido === false);

r = validarAtualizacaoPerfil({ ...BASE, idade: '25' });
assert('Idade válida (25) é aceita', r.valido === true);

// ── GRUPO 5: endereço ──────────────────────────────────────────────────────
console.log('\n[ GRUPO 5 ] Endereço');

r = validarAtualizacaoPerfil({ ...BASE, rua: '' });
assert('Rua vazia retorna erro', r.valido === false);

r = validarAtualizacaoPerfil({ ...BASE, numero: '' });
assert('Número vazio retorna erro', r.valido === false);

r = validarAtualizacaoPerfil({ ...BASE, bairro: '' });
assert('Bairro vazio retorna erro', r.valido === false);

r = validarAtualizacaoPerfil({ ...BASE, cidade: '' });
assert('Cidade vazia retorna erro', r.valido === false);

// ── GRUPO 6: telefone ──────────────────────────────────────────────────────
console.log('\n[ GRUPO 6 ] Telefone');

r = validarAtualizacaoPerfil({ ...BASE, telefone: '1234567' });
assert('Telefone com menos de 8 dígitos retorna erro', r.valido === false);

r = validarAtualizacaoPerfil({ ...BASE, telefone: '12345678' });
assert('Telefone com 8+ dígitos é aceito', r.valido === true);

// ── GRUPO 7: formatarEnderecoCompleto ──────────────────────────────────────
console.log('\n[ GRUPO 7 ] formatarEnderecoCompleto');

const end1 = formatarEnderecoCompleto({
  rua: 'Rua A', numero: '10', complemento: 'Apto 2',
  bairro: 'Centro', cidade: 'SP', cep: '01000-000',
});
assert('Formata endereço completo corretamente',
  end1.includes('Rua A') && end1.includes('10') && end1.includes('Centro'));

const end2 = formatarEnderecoCompleto({
  rua: 'Rua B', numero: '5', complemento: '',
  bairro: 'Bela Vista', cidade: 'RJ', cep: '',
});
assert('Endereço sem complemento contém rua e número',
  end2.includes('Rua B') && end2.includes('5'));

// ── Resumo ─────────────────────────────────────────────────────────────────
console.log(`\n${'─'.repeat(50)}`);
console.log(`Total: ${passou + falhou} testes | ✅ ${passou} passaram | ❌ ${falhou} falharam`);
if (falhou > 0) process.exit(1);
