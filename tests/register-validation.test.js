import {
  validarEtapa1,
  validarEtapa2,
  formatarEnderecoCompleto
} from '../src/js/register-validation.js';

function testar(descricao, condicao) {
  if (!condicao) {
    throw new Error(`FALHOU: ${descricao}`);
  }
  console.log(`PASSOU: ${descricao}`);
}

// ---------------------------------------------------------
// Testes da Etapa 1 (Conta de Acesso)
// ---------------------------------------------------------

testar('Etapa 1: rejeita nome ausente ou muito curto',
  validarEtapa1({ nome: 'Al', email: 'teste@email.com', senha: '1234' }).valido === false
);

testar('Etapa 1: rejeita email com formato incorreto',
  validarEtapa1({ nome: 'Maria Silva', email: 'emailinvalido', senha: '1234' }).valido === false
);

testar('Etapa 1: rejeita senha com menos de 4 caracteres',
  validarEtapa1({ nome: 'Maria Silva', email: 'maria@email.com', senha: '12' }).valido === false
);

testar('Etapa 1: aceita dados válidos de acesso',
  validarEtapa1({ nome: 'Maria Silva', email: 'maria@email.com', senha: '123456' }).valido === true
);

// ---------------------------------------------------------
// Testes da Etapa 2 (Perfil e Entrega)
// ---------------------------------------------------------

const dadosEtapa2Validos = {
  idade: 28,
  telefone: '11987654321',
  rua: 'Av. Paulista',
  numero: '1578',
  bairro: 'Bela Vista',
  cidade: 'São Paulo'
};

testar('Etapa 2: rejeita idade menor que 12',
  validarEtapa2({ ...dadosEtapa2Validos, idade: 10 }).valido === false
);

testar('Etapa 2: rejeita idade inválida / não numérica',
  validarEtapa2({ ...dadosEtapa2Validos, idade: 'abc' }).valido === false
);

testar('Etapa 2: rejeita telefone com menos de 8 dígitos',
  validarEtapa2({ ...dadosEtapa2Validos, telefone: '123' }).valido === false
);

testar('Etapa 2: rejeita endereço com rua ausente',
  validarEtapa2({ ...dadosEtapa2Validos, rua: '' }).valido === false
);

testar('Etapa 2: rejeita endereço com número ausente',
  validarEtapa2({ ...dadosEtapa2Validos, numero: '  ' }).valido === false
);

testar('Etapa 2: rejeita bairro ausente',
  validarEtapa2({ ...dadosEtapa2Validos, bairro: '' }).valido === false
);

testar('Etapa 2: rejeita cidade ausente',
  validarEtapa2({ ...dadosEtapa2Validos, cidade: '' }).valido === false
);

testar('Etapa 2: aceita dados de entrega e perfil válidos',
  validarEtapa2(dadosEtapa2Validos).valido === true
);

// ---------------------------------------------------------
// Testes de Formatação de Endereço
// ---------------------------------------------------------

const endFormatado = formatarEnderecoCompleto({
  rua: 'Rua das Flores',
  numero: '100',
  complemento: 'Apto 42',
  bairro: 'Jardins',
  cidade: 'São Paulo',
  cep: '01410-000'
});

testar('Formatação de endereço completo inclui todas as partes formatadas',
  endFormatado === 'Rua das Flores, 100 - Apto 42 - Jardins - São Paulo - CEP: 01410-000'
);

console.log('Todos os testes de validação de cadastro em etapas foram executados com sucesso!');
