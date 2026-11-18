import { cadastrarUsuario, usuarios } from '../js/database.js';
import { validarEtapa1, validarEtapa2, formatarEnderecoCompleto } from '../js/register-validation.js';
import { escaparHtml } from '../js/security.js';

let dadosCadastro = {
  nome: '',
  email: '',
  senha: '',
  idade: '',
  telefone: '',
  cep: '',
  rua: '',
  numero: '',
  complemento: '',
  bairro: '',
  cidade: '',
  referencia: '',
  preferenciaAlimentar: 'Sem restrições',
  pagamentoPreferido: 'PIX'
};

/**
 * Renderiza o container principal da tela de cadastro.
 */
export function renderRegister() {
  return `
    <div class="max-w-xl mx-auto bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100 mt-4 mb-10">
      
      <!-- Indicador de progresso em 2 etapas -->
      <div class="mb-6">
        <div class="flex items-center justify-between text-xs font-bold text-gray-400 mb-2">
          <span id="step-label-1" class="text-red-600 flex items-center gap-1.5">
            <span class="w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center text-xs">1</span>
            Conta de Acesso
          </span>
          <span class="border-b border-gray-200 flex-1 mx-3"></span>
          <span id="step-label-2" class="flex items-center gap-1.5">
            <span class="w-5 h-5 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center text-xs">2</span>
            Perfil e Entrega
          </span>
        </div>
      </div>

      <div id="register-step-container">
        ${renderEtapa1Html()}
      </div>

    </div>
  `;
}

/**
 * HTML da Etapa 1: Nome, E-mail e Senha.
 */
function renderEtapa1Html() {
  return `
    <div>
      <div class="text-center mb-6">
        <h2 class="text-2xl font-bold text-gray-900">Criar sua Conta</h2>
        <p class="text-sm text-gray-500 mt-1">Passo 1: Informe seus dados de acesso</p>
      </div>

      <form id="form-register-step1" class="flex flex-col gap-4">
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1">Nome Completo *</label>
          <input
            type="text"
            id="reg-nome"
            value="${escaparHtml(dadosCadastro.nome || '')}"
            required
            class="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 transition text-sm"
            placeholder="Ex: Maria dos Santos"
          />
        </div>

        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1">E-mail *</label>
          <input
            type="email"
            id="reg-email"
            value="${escaparHtml(dadosCadastro.email || '')}"
            required
            class="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 transition text-sm"
            placeholder="seu@email.com"
          />
        </div>

        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1">Senha *</label>
          <input
            type="password"
            id="reg-senha"
            value="${escaparHtml(dadosCadastro.senha || '')}"
            required
            minlength="4"
            class="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 transition text-sm"
            placeholder="Mínimo de 4 dígitos"
          />
        </div>

        <button
          type="submit"
          class="w-full bg-red-600 hover:bg-red-700 active:scale-98 text-white py-3 rounded-xl font-bold transition shadow-sm mt-3 flex items-center justify-center gap-2"
        >
          <span>Avançar para Dados de Entrega</span>
          <span>→</span>
        </button>

        <p class="text-xs text-center text-gray-400 mt-2">
          Já tem uma conta? Ao cadastrar, seu acesso é liberado instantaneamente.
        </p>
      </form>
    </div>
  `;
}

/**
 * HTML da Etapa 2: Idade, Endereço onde mora, Telefone e preferências de delivery.
 */
function renderEtapa2Html() {
  const primeiroNome = escaparHtml((dadosCadastro.nome || 'Cliente').split(' ')[0]);

  return `
    <div>
      <div class="text-center mb-6">
        <h2 class="text-2xl font-bold text-gray-900">Endereço e Perfil</h2>
        <p class="text-sm text-gray-500 mt-1">Passo 2: Quase lá, ${primeiroNome}! Onde você quer receber seus pedidos?</p>
      </div>

      <form id="form-register-step2" class="flex flex-col gap-4">
        
        <!-- Confirmação do Nome e Idade -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div class="sm:col-span-2">
            <label class="block text-xs font-semibold text-gray-700 mb-1">Nome no Perfil *</label>
            <input
              type="text"
              id="reg-nome-confirm"
              value="${escaparHtml(dadosCadastro.nome || '')}"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
            />
          </div>
          <div>
            <label class="block text-xs font-semibold text-gray-700 mb-1">Idade *</label>
            <input
              type="number"
              id="reg-idade"
              value="${escaparHtml(dadosCadastro.idade || '')}"
              min="12"
              max="120"
              required
              placeholder="Ex: 24"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
            />
          </div>
        </div>

        <!-- Telefone / WhatsApp -->
        <div>
          <label class="block text-xs font-semibold text-gray-700 mb-1">Telefone / WhatsApp para entrega *</label>
          <input
            type="tel"
            id="reg-telefone"
            value="${escaparHtml(dadosCadastro.telefone || '')}"
            required
            placeholder="Ex: (11) 98765-4321"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
          />
        </div>

        <div class="border-t border-gray-100 pt-3">
          <h4 class="text-xs font-bold text-gray-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            📍 Onde você mora (Endereço de Entrega)
          </h4>
        </div>

        <!-- Rua e Número -->
        <div class="grid grid-cols-3 gap-3">
          <div class="col-span-2">
            <label class="block text-xs font-semibold text-gray-700 mb-1">Rua / Logradouro *</label>
            <input
              type="text"
              id="reg-rua"
              value="${escaparHtml(dadosCadastro.rua || '')}"
              required
              placeholder="Ex: Av. Paulista"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
            />
          </div>
          <div>
            <label class="block text-xs font-semibold text-gray-700 mb-1">Número *</label>
            <input
              type="text"
              id="reg-numero"
              value="${escaparHtml(dadosCadastro.numero || '')}"
              required
              placeholder="123"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
            />
          </div>
        </div>

        <!-- Complemento e Bairro -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-semibold text-gray-700 mb-1">Complemento (opcional)</label>
            <input
              type="text"
              id="reg-complemento"
              value="${escaparHtml(dadosCadastro.complemento || '')}"
              placeholder="Apto 42, Bloco B"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
            />
          </div>
          <div>
            <label class="block text-xs font-semibold text-gray-700 mb-1">Bairro *</label>
            <input
              type="text"
              id="reg-bairro"
              value="${escaparHtml(dadosCadastro.bairro || '')}"
              required
              placeholder="Ex: Bela Vista"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
            />
          </div>
        </div>

        <!-- Cidade e CEP -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-semibold text-gray-700 mb-1">Cidade / UF *</label>
            <input
              type="text"
              id="reg-cidade"
              value="${escaparHtml(dadosCadastro.cidade || '')}"
              required
              placeholder="Ex: São Paulo - SP"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
            />
          </div>
          <div>
            <label class="block text-xs font-semibold text-gray-700 mb-1">CEP (opcional)</label>
            <input
              type="text"
              id="reg-cep"
              value="${escaparHtml(dadosCadastro.cep || '')}"
              placeholder="01310-100"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
            />
          </div>
        </div>

        <!-- Ponto de Referência -->
        <div>
          <label class="block text-xs font-semibold text-gray-700 mb-1">Ponto de Referência para o Entregador</label>
          <input
            type="text"
            id="reg-referencia"
            value="${escaparHtml(dadosCadastro.referencia || '')}"
            placeholder="Ex: Em frente à farmácia, interfone 42"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
          />
        </div>

        <!-- Preferências Adicionais -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-gray-100 pt-3">
          <div>
            <label class="block text-xs font-semibold text-gray-700 mb-1">Preferência Alimentar</label>
            <select
              id="reg-preferencia"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:outline-none bg-white"
            >
              <option value="Sem restrições" ${dadosCadastro.preferenciaAlimentar === 'Sem restrições' ? 'selected' : ''}>Sem restrições</option>
              <option value="Vegetariano" ${dadosCadastro.preferenciaAlimentar === 'Vegetariano' ? 'selected' : ''}>🥗 Vegetariano</option>
              <option value="Vegano" ${dadosCadastro.preferenciaAlimentar === 'Vegano' ? 'selected' : ''}>🌱 Vegano</option>
              <option value="Sem lactose" ${dadosCadastro.preferenciaAlimentar === 'Sem lactose' ? 'selected' : ''}>🥛 Sem lactose</option>
              <option value="Sem glúten" ${dadosCadastro.preferenciaAlimentar === 'Sem glúten' ? 'selected' : ''}>🌾 Sem glúten</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-semibold text-gray-700 mb-1">Pagamento Preferido</label>
            <select
              id="reg-pagamento"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:outline-none bg-white"
            >
              <option value="PIX" ${dadosCadastro.pagamentoPreferido === 'PIX' ? 'selected' : ''}>⚡ PIX (Instantâneo)</option>
              <option value="Cartão de Crédito" ${dadosCadastro.pagamentoPreferido === 'Cartão de Crédito' ? 'selected' : ''}>💳 Cartão de Crédito</option>
              <option value="Cartão de Débito" ${dadosCadastro.pagamentoPreferido === 'Cartão de Débito' ? 'selected' : ''}>💳 Cartão de Débito</option>
              <option value="Dinheiro" ${dadosCadastro.pagamentoPreferido === 'Dinheiro' ? 'selected' : ''}>💵 Dinheiro na Entrega</option>
            </select>
          </div>
        </div>

        <!-- Botões de Ação -->
        <div class="flex items-center gap-3 mt-4 pt-2">
          <button
            type="button"
            id="btn-voltar-step1"
            class="w-1/3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2.5 rounded-xl transition text-sm"
          >
            ← Voltar
          </button>
          
          <button
            type="submit"
            class="w-2/3 bg-green-600 hover:bg-green-700 active:scale-98 text-white font-bold py-2.5 rounded-xl transition shadow text-sm flex items-center justify-center gap-1.5"
          >
            <span>Concluir Cadastro</span>
            <span>🎉</span>
          </button>
        </div>

      </form>
    </div>
  `;
}

/**
 * Atualiza visualmente os indicadores das etapas no topo.
 */
function atualizarIndicadorPasso(passo) {
  const label1 = document.getElementById('step-label-1');
  const label2 = document.getElementById('step-label-2');

  if (passo === 1) {
    if (label1) {
      label1.className = 'text-red-600 font-bold flex items-center gap-1.5';
      label1.innerHTML = `<span class="w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center text-xs">1</span> Conta de Acesso`;
    }
    if (label2) {
      label2.className = 'text-gray-400 flex items-center gap-1.5';
      label2.innerHTML = `<span class="w-5 h-5 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center text-xs">2</span> Perfil e Entrega`;
    }
  } else if (passo === 2) {
    if (label1) {
      label1.className = 'text-green-600 font-semibold flex items-center gap-1.5';
      label1.innerHTML = `<span class="w-5 h-5 rounded-full bg-green-600 text-white flex items-center justify-center text-xs">✓</span> Conta`;
    }
    if (label2) {
      label2.className = 'text-red-600 font-bold flex items-center gap-1.5';
      label2.innerHTML = `<span class="w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center text-xs">2</span> Perfil e Entrega`;
    }
  }
}

/**
 * Vincula os eventos da Etapa 1.
 */
function vincularEventosEtapa1(onSuccess) {
  const form = document.getElementById('form-register-step1');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const nome = document.getElementById('reg-nome').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const senha = document.getElementById('reg-senha').value;

    const validacao = validarEtapa1({ nome, email, senha });
    if (!validacao.valido) {
      alert(validacao.erro);
      return;
    }

    // Verifica se já existe um usuário com esse e-mail
    const jaExiste = usuarios.some(u => u.email.toLowerCase() === email.toLowerCase());
    if (jaExiste) {
      alert('⚠️ Este e-mail já está cadastrado no DeliveryFast! Tente outro e-mail.');
      return;
    }

    // Salva os dados da etapa 1
    dadosCadastro.nome = nome;
    dadosCadastro.email = email;
    dadosCadastro.senha = senha;

    // Transita para a Etapa 2 ("Mais uma janela")
    const stepContainer = document.getElementById('register-step-container');
    if (stepContainer) {
      stepContainer.innerHTML = renderEtapa2Html();
      atualizarIndicadorPasso(2);
      vincularEventosEtapa2(onSuccess);
    }
  });
}

/**
 * Vincula os eventos da Etapa 2.
 */
function vincularEventosEtapa2(onSuccess) {
  const form = document.getElementById('form-register-step2');
  const btnVoltar = document.getElementById('btn-voltar-step1');

  // Botão voltar para a etapa 1
  if (btnVoltar) {
    btnVoltar.addEventListener('click', () => {
      // Salva o que foi preenchido na etapa 2 antes de voltar
      coletarCamposEtapa2();

      const stepContainer = document.getElementById('register-step-container');
      if (stepContainer) {
        stepContainer.innerHTML = renderEtapa1Html();
        atualizarIndicadorPasso(1);
        vincularEventosEtapa1(onSuccess);
      }
    });
  }

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      coletarCamposEtapa2();

      const validacao = validarEtapa2(dadosCadastro);
      if (!validacao.valido) {
        alert(validacao.erro);
        return;
      }

      const enderecoFormatado = formatarEnderecoCompleto({
        rua: dadosCadastro.rua,
        numero: dadosCadastro.numero,
        complemento: dadosCadastro.complemento,
        bairro: dadosCadastro.bairro,
        cidade: dadosCadastro.cidade,
        cep: dadosCadastro.cep
      });

      const usuarioFinal = {
        nome: dadosCadastro.nome,
        email: dadosCadastro.email,
        senha: dadosCadastro.senha,
        idade: Number(dadosCadastro.idade),
        telefone: dadosCadastro.telefone,
        endereco: enderecoFormatado,
        enderecoDetalhes: {
          rua: dadosCadastro.rua,
          numero: dadosCadastro.numero,
          complemento: dadosCadastro.complemento,
          bairro: dadosCadastro.bairro,
          cidade: dadosCadastro.cidade,
          cep: dadosCadastro.cep
        },
        pontoReferencia: dadosCadastro.referencia,
        preferenciaAlimentar: dadosCadastro.preferenciaAlimentar,
        pagamentoPreferido: dadosCadastro.pagamentoPreferido
      };

      try {
        cadastrarUsuario(usuarioFinal);
        alert(`🎉 CADASTRADO COM SUCESSO!\n\nSeja bem-vindo(a), ${usuarioFinal.nome.split(' ')[0]}!\nSeu endereço foi configurado para: ${enderecoFormatado}`);

        // Limpa os dados em memória para o próximo cadastro
        dadosCadastro = {
          nome: '',
          email: '',
          senha: '',
          idade: '',
          telefone: '',
          cep: '',
          rua: '',
          numero: '',
          complemento: '',
          bairro: '',
          cidade: '',
          referencia: '',
          preferenciaAlimentar: 'Sem restrições',
          pagamentoPreferido: 'PIX'
        };

        if (typeof onSuccess === 'function') {
          onSuccess();
        }
      } catch (error) {
        alert(error.message);
      }
    });
  }
}

function coletarCamposEtapa2() {
  const nomeConfirm = document.getElementById('reg-nome-confirm');
  const idade = document.getElementById('reg-idade');
  const telefone = document.getElementById('reg-telefone');
  const rua = document.getElementById('reg-rua');
  const numero = document.getElementById('reg-numero');
  const complemento = document.getElementById('reg-complemento');
  const bairro = document.getElementById('reg-bairro');
  const cidade = document.getElementById('reg-cidade');
  const cep = document.getElementById('reg-cep');
  const referencia = document.getElementById('reg-referencia');
  const preferencia = document.getElementById('reg-preferencia');
  const pagamento = document.getElementById('reg-pagamento');

  if (nomeConfirm) dadosCadastro.nome = nomeConfirm.value.trim();
  if (idade) dadosCadastro.idade = idade.value.trim();
  if (telefone) dadosCadastro.telefone = telefone.value.trim();
  if (rua) dadosCadastro.rua = rua.value.trim();
  if (numero) dadosCadastro.numero = numero.value.trim();
  if (complemento) dadosCadastro.complemento = complemento.value.trim();
  if (bairro) dadosCadastro.bairro = bairro.value.trim();
  if (cidade) dadosCadastro.cidade = cidade.value.trim();
  if (cep) dadosCadastro.cep = cep.value.trim();
  if (referencia) dadosCadastro.referencia = referencia.value.trim();
  if (preferencia) dadosCadastro.preferenciaAlimentar = preferencia.value;
  if (pagamento) dadosCadastro.pagamentoPreferido = pagamento.value;
}

/**
 * Inicializa os eventos da tela de cadastro.
 * @param {Function} onSuccess - Callback chamado após conclusão com sucesso.
 */
export function initRegisterEvents(onSuccess) {
  vincularEventosEtapa1(onSuccess);
}
