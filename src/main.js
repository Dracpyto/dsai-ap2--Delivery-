import { renderRestaurantes, restaurantes } from './components/restaurants.js';
import { renderPedidos } from './components/orders.js';
import { renderPerfil, renderEdicaoPerfil } from './components/profile.js';
import { menusData } from './components/menu.js';
import { buscar } from './js/search.js';
import { renderResultadosBusca } from './components/search.js';
import { obterUsuarioLogado, sairUsuario } from './js/database.js';
import { abrirCarrinhoWidget, limparCarrinho } from './components/cart.js';
import { escaparHtml } from './js/security.js';

// Expõe o botão do carrinho no header
window.abrirCarrinho = abrirCarrinhoWidget;

// Atualiza a área do utilizador na barra de navegação
export function atualizarNavegacao() {
  const usuario = obterUsuarioLogado();
  const areaUsuario = document.getElementById('area-usuario');

  if (areaUsuario) {
    if (usuario) {
      const nomeSeguro = escaparHtml(usuario.nome || '');
      const primeiroNomeSeguro = escaparHtml((usuario.nome || '').split(' ')[0]);
      const inicialSegura = escaparHtml((usuario.nome || '').charAt(0).toUpperCase());

      areaUsuario.innerHTML = `
        <div class="flex items-center gap-2">
          <button
            onclick="window.abrirPerfil()"
            title="${nomeSeguro}"
            class="flex items-center gap-2 text-gray-800 font-semibold bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-full border border-gray-200 transition"
          >
            <span class="w-7 h-7 rounded-full bg-red-600 text-white flex items-center justify-center font-bold text-sm">
              ${inicialSegura}
            </span>
            <span class="text-sm hidden sm:inline">Olá, ${primeiroNomeSeguro}</span>
          </button>

          <button
            onclick="window.sairDaConta()"
            title="Sair da conta"
            class="flex items-center gap-1 bg-white text-red-600 border border-red-300 hover:bg-red-50 font-semibold px-3 py-1.5 rounded-full text-sm transition"
          >
            <span>⏏</span>
            <span class="hidden sm:inline">Sair</span>
          </button>
        </div>
      `;
    } else {
      areaUsuario.innerHTML = `
        <button onclick="window.abrirTelaCadastro()" class="text-gray-700 hover:text-red-600 font-medium transition-colors">
          Cadastrar
        </button>
      `;
    }
  }
}

// Executa a busca de restaurantes e pratos
window.executarBusca = (termo) => {
  const inputBusca = document.getElementById('input-busca');
  const btnLimpar = document.getElementById('btn-limpar-busca');

  const termoLimpo = (termo !== undefined ? termo : (inputBusca?.value || '')).trim();

  if (!termoLimpo) {
    window.voltarParaRestaurantes();
    return;
  }

  if (btnLimpar) {
    btnLimpar.classList.remove('hidden');
  }

  const resultados = buscar(termoLimpo, restaurantes, menusData);
  renderResultadosBusca(termoLimpo, resultados);
};

// Limpa a busca e retorna à tela inicial
window.limparBusca = () => {
  const inputBusca = document.getElementById('input-busca');
  const btnLimpar = document.getElementById('btn-limpar-busca');

  if (inputBusca) {
    inputBusca.value = '';
    inputBusca.focus();
  }

  if (btnLimpar) {
    btnLimpar.classList.add('hidden');
  }

  window.voltarParaRestaurantes();
};

// Executa a busca a partir de um termo predefinido (ex: chips de categorias ou sugestões)
window.buscarPorTermo = (termo) => {
  const inputBusca = document.getElementById('input-busca');
  if (inputBusca) {
    inputBusca.value = termo;
  }
  window.executarBusca(termo);
};

// Função para voltar à tela inicial
window.voltarParaRestaurantes = () => {
  renderRestaurantes();
  const btnInicio = document.getElementById('btn-inicio');
  if (btnInicio) {
    btnInicio.classList.add('hidden');
  }

  const inputBusca = document.getElementById('input-busca');
  const btnLimpar = document.getElementById('btn-limpar-busca');
  if (inputBusca) inputBusca.value = '';
  if (btnLimpar) btnLimpar.classList.add('hidden');

  atualizarNavegacao();
};

window.sairDaConta = () => {
  sairUsuario();
  limparCarrinho();
  atualizarNavegacao();
  renderRestaurantes();
  alert('Você saiu da conta. Agora outro usuário pode se cadastrar.');
};

// Função para abrir a tela de Pedidos
window.verPedidos = () => {
  renderPedidos();
  const btnInicio = document.getElementById('btn-inicio');
  if (btnInicio) {
    btnInicio.classList.remove('hidden');
  }

  const inputBusca = document.getElementById('input-busca');
  const btnLimpar = document.getElementById('btn-limpar-busca');
  if (inputBusca) inputBusca.value = '';
  if (btnLimpar) btnLimpar.classList.add('hidden');
};

// Função para abrir a tela de Cadastro
window.abrirTelaCadastro = async () => {
  const container = document.getElementById('app');
  const btnInicio = document.getElementById('btn-inicio');

  if (container) {
    try {
      const { renderRegister, initRegisterEvents } = await import('./components/register.js');
      container.innerHTML = renderRegister();

      if (btnInicio) {
        btnInicio.classList.remove('hidden');
      }

      const inputBusca = document.getElementById('input-busca');
      const btnLimpar = document.getElementById('btn-limpar-busca');
      if (inputBusca) inputBusca.value = '';
      if (btnLimpar) btnLimpar.classList.add('hidden');

      initRegisterEvents(() => {
        atualizarNavegacao();
        window.voltarParaRestaurantes();
      });
    } catch (err) {
      console.error('Erro ao carregar a tela de cadastro:', err);
    }
  }
};

// Inicializa os ouvintes de eventos da barra de busca
function inicializarEventosBusca() {
  const inputBusca = document.getElementById('input-busca');
  const btnLimpar = document.getElementById('btn-limpar-busca');

  if (inputBusca) {
    inputBusca.addEventListener('input', (e) => {
      const valor = e.target.value;
      if (valor.trim().length > 0) {
        if (btnLimpar) btnLimpar.classList.remove('hidden');
        window.executarBusca(valor);
      } else {
        if (btnLimpar) btnLimpar.classList.add('hidden');
        window.voltarParaRestaurantes();
      }
    });

    inputBusca.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        window.limparBusca();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        window.executarBusca(inputBusca.value);
      }
    });
  }
}

// ── Funções globais de navegação do Perfil ──────────────────────────────────

window.abrirPerfil = () => {
  renderPerfil();
  const btnInicio = document.getElementById('btn-inicio');
  if (btnInicio) btnInicio.classList.remove('hidden');
  const inputBusca = document.getElementById('input-busca');
  const btnLimpar  = document.getElementById('btn-limpar-busca');
  if (inputBusca) inputBusca.value = '';
  if (btnLimpar)  btnLimpar.classList.add('hidden');
};

window.abrirEdicaoPerfil = () => {
  renderEdicaoPerfil();
  const btnInicio = document.getElementById('btn-inicio');
  if (btnInicio) btnInicio.classList.remove('hidden');
};

// Expõe atualizarNavegacao para o profile.js chamar após salvar
window.atualizarNavegacaoGlobal = () => atualizarNavegacao();

// Arranque da aplicação
function iniciarApp() {
  renderRestaurantes();
  atualizarNavegacao();
  inicializarEventosBusca();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', iniciarApp);
} else {
  iniciarApp();
}
