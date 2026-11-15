import { normalizarTexto, buscar, obterPratoPorId } from '../src/js/search.js';

function testar(descricao, condicao) {
  if (!condicao) {
    throw new Error(`FALHOU: ${descricao}`);
  }
  console.log(`PASSOU: ${descricao}`);
}

const mockRestaurantes = [
  { id: 1, name: 'Burger House', category: 'Hambúrgueres suculentos', time: '30-40 min', badge: 'Entrega grátis' },
  { id: 2, name: 'Bella Italia', category: 'Massas e Pizzas artesanais', time: '40-50 min', badge: 'Entrega grátis' },
  { id: 3, name: 'Sushi Kai', category: 'Comida japonesa fresca', time: '25-35 min', badge: 'Entrega grátis' },
  { id: 4, name: 'Sabor do Brasil', category: 'Comida típica e caseira', time: '35-45 min', badge: 'Entrega grátis' }
];

const mockMenusData = {
  1: [
    { id: 101, name: 'Burger Clássico', price: 28.90, description: 'Pão brioche, hambúrguer 180g, queijo, alface e molho especial.', image: 'img1.jpg' },
    { id: 102, name: 'Smash Bacon Duplo', price: 34.50, description: 'Dois hambúrgueres, cheddar cremoso, bacon crocante e molho da casa.', image: 'img2.jpg' },
    { id: 103, name: 'Batata Supreme', price: 18.00, description: 'Batatas crocantes cobertas com cheddar e bacon.', image: 'img3.jpg' }
  ],
  2: [
    { id: 201, name: 'Pizza Margherita', price: 45.00, description: 'Molho de tomate, mozzarella, tomate fresco e manjericão.', image: 'img4.jpg' },
    { id: 202, name: 'Spaghetti Carbonara', price: 38.00, description: 'Massa italiana com pancetta, queijo e molho cremoso.', image: 'img5.jpg' }
  ],
  3: [
    { id: 301, name: 'Combo Hot Roll (12 peças)', price: 32.00, description: 'Hot rolls crocantes recheados com salmão.', image: 'img6.jpg' },
    { id: 302, name: 'Temaki de Salmão', price: 26.50, description: 'Cone de alga crocante recheado com salmão fresco.', image: 'img7.jpg' }
  ],
  4: [
    { id: 401, name: 'Feijoada Completa', price: 48.00, description: 'Feijoada acompanhada de arroz, couve, farofa e laranja.', image: 'img8.jpg' },
    { id: 402, name: 'Pudim de Leite', price: 12.00, description: 'Pudim tradicional de leite condensado com calda de caramelo.', image: 'img9.jpg' }
  ]
};

// Teste 1: Termo vazio
const resVazio = buscar('', mockRestaurantes, mockMenusData);
testar('busca com termo vazio retorna encontrado: false e 0 resultados',
  resVazio.encontrado === false && resVazio.totalResultados === 0 && resVazio.restaurantes.length === 0 && resVazio.pratos.length === 0
);

// Teste 2: Termo com apenas espaços
const resEspacos = buscar('   ', mockRestaurantes, mockMenusData);
testar('busca com apenas espaços retorna encontrado: false',
  resEspacos.encontrado === false && resEspacos.totalResultados === 0
);

// Teste 3: Busca restaurante por nome
const resRestNome = buscar('Bella Italia', mockRestaurantes, mockMenusData);
testar('busca restaurante por nome encontra o restaurante correto',
  resRestNome.encontrado === true &&
  resRestNome.restaurantes.some(r => r.name === 'Bella Italia')
);

// Teste 4: Busca restaurante por categoria
const resRestCat = buscar('japonesa', mockRestaurantes, mockMenusData);
testar('busca restaurante por categoria encontra Sushi Kai',
  resRestCat.encontrado === true &&
  resRestCat.restaurantes.some(r => r.name === 'Sushi Kai')
);

// Teste 5: Busca insensível a maiúsculas e minúsculas
const resCase = buscar('sUsHi', mockRestaurantes, mockMenusData);
testar('busca é insensível a maiúsculas/minúsculas',
  resCase.encontrado === true &&
  resCase.restaurantes.some(r => r.name === 'Sushi Kai')
);

// Teste 6: Busca insensível a acentuação (ex: 'hamburguer' sem acento acha categoria 'Hambúrgueres')
const resAcento = buscar('hamburguer', mockRestaurantes, mockMenusData);
testar('busca ignora acentuação em restaurantes e pratos',
  resAcento.encontrado === true &&
  resAcento.restaurantes.some(r => r.name === 'Burger House') &&
  resAcento.pratos.some(p => p.name === 'Burger Clássico')
);

// Teste 7: Busca por prato pelo nome
const resPratoNome = buscar('Hot Roll', mockRestaurantes, mockMenusData);
testar('busca por nome de prato retorna o prato correto',
  resPratoNome.encontrado === true &&
  resPratoNome.pratos.some(p => p.name.includes('Hot Roll'))
);

// Teste 8: Busca por prato pela descrição
const resPratoDesc = buscar('cheddar cremoso', mockRestaurantes, mockMenusData);
testar('busca por descrição do prato encontra o Smash Bacon Duplo',
  resPratoDesc.encontrado === true &&
  resPratoDesc.pratos.some(p => p.name === 'Smash Bacon Duplo')
);

// Teste 9: Prato encontrado contém dados do restaurante associado
testar('prato retornado contém restauranteId e restauranteNome',
  resPratoDesc.pratos[0].restauranteId === 1 &&
  resPratoDesc.pratos[0].restauranteNome === 'Burger House'
);

// Teste 10: Termo inexistente retorna encontrado: false
const resNaoExiste = buscar('churrascaria alemã inexistente', mockRestaurantes, mockMenusData);
testar('termo inexistente retorna encontrado: false e 0 resultados',
  resNaoExiste.encontrado === false &&
  resNaoExiste.totalResultados === 0 &&
  resNaoExiste.restaurantes.length === 0 &&
  resNaoExiste.pratos.length === 0
);

// Teste 11: Termo que corresponde a restaurante e prato simultaneamente
const resMisto = buscar('Burger', mockRestaurantes, mockMenusData);
testar('termo comum encontra tanto restaurantes quanto pratos',
  resMisto.encontrado === true &&
  resMisto.restaurantes.length > 0 &&
  resMisto.pratos.length > 0
);

// Teste 12: Helper obterPratoPorId
const pratoEncontrado = obterPratoPorId(201, mockMenusData);
testar('obterPratoPorId localiza o prato 201 (Pizza Margherita)',
  pratoEncontrado !== null && pratoEncontrado.name === 'Pizza Margherita'
);

const pratoInexistente = obterPratoPorId(9999, mockMenusData);
testar('obterPratoPorId retorna null para prato inexistente',
  pratoInexistente === null
);

console.log('Todos os testes da ferramenta de busca foram executados com sucesso!');
