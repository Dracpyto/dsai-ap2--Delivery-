import { renderCarrinho } from './cart.js';

/**
 * Renderiza os resultados da busca na tela principal (#app).
 * 
 * @param {string} termo - Termo digitado.
 * @param {Object} resultados - Objeto contendo os resultados da busca (restaurantes, pratos, encontrado, etc).
 */
export function renderResultadosBusca(termo, resultados) {
  const container = document.getElementById('app');
  const btnInicio = document.getElementById('btn-inicio');

  if (!container) return;

  if (btnInicio) {
    btnInicio.classList.remove('hidden');
  }

  // Caso não encontre nenhum restaurante e nenhum prato
  if (!resultados || !resultados.encontrado) {
    container.innerHTML = `
      <div class="py-8 max-w-xl mx-auto">
        <button
          onclick="window.voltarParaRestaurantes()"
          class="text-red-600 hover:text-red-700 font-semibold mb-6 flex items-center gap-1.5 transition-colors"
        >
          ← Voltar aos restaurantes
        </button>

        <div class="bg-white p-8 sm:p-12 rounded-2xl shadow-sm border border-gray-100 text-center">
          <div class="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-5 text-4xl shadow-inner">
            🔍
          </div>

          <h2 class="text-2xl font-bold text-gray-900 mb-2">
            Nenhum resultado encontrado
          </h2>

          <p class="text-gray-500 mb-6 text-sm leading-relaxed">
            Não encontramos nenhum restaurante ou prato correspondente a 
            <span class="font-semibold text-gray-800">"${termo || ''}"</span> na aplicação.
          </p>

          <div class="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-100">
            <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Sugestões de pesquisa:
            </p>
            <div class="flex flex-wrap justify-center gap-2">
              <button onclick="window.buscarPorTermo('Burger')" class="bg-white hover:bg-red-50 hover:text-red-600 border border-gray-200 text-gray-700 text-xs font-medium px-3 py-1.5 rounded-full transition shadow-sm">
                🍔 Burger
              </button>
              <button onclick="window.buscarPorTermo('Pizza')" class="bg-white hover:bg-red-50 hover:text-red-600 border border-gray-200 text-gray-700 text-xs font-medium px-3 py-1.5 rounded-full transition shadow-sm">
                🍕 Pizza
              </button>
              <button onclick="window.buscarPorTermo('Sushi')" class="bg-white hover:bg-red-50 hover:text-red-600 border border-gray-200 text-gray-700 text-xs font-medium px-3 py-1.5 rounded-full transition shadow-sm">
                🍣 Sushi
              </button>
              <button onclick="window.buscarPorTermo('Feijoada')" class="bg-white hover:bg-red-50 hover:text-red-600 border border-gray-200 text-gray-700 text-xs font-medium px-3 py-1.5 rounded-full transition shadow-sm">
                🍲 Feijoada
              </button>
              <button onclick="window.buscarPorTermo('Picanha')" class="bg-white hover:bg-red-50 hover:text-red-600 border border-gray-200 text-gray-700 text-xs font-medium px-3 py-1.5 rounded-full transition shadow-sm">
                🥩 Picanha
              </button>
              <button onclick="window.buscarPorTermo('Sobremesa')" class="bg-white hover:bg-red-50 hover:text-red-600 border border-gray-200 text-gray-700 text-xs font-medium px-3 py-1.5 rounded-full transition shadow-sm">
                🍰 Sobremesa
              </button>
            </div>
          </div>

          <button
            onclick="window.voltarParaRestaurantes()"
            class="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-2.5 rounded-xl transition shadow active:scale-95"
          >
            Ver todos os restaurantes
          </button>
        </div>
      </div>
    `;
    return;
  }

  // Monta HTML de restaurantes encontrados
  let restaurantesHtml = '';
  if (resultados.restaurantes.length > 0) {
    const cardsRestaurantes = resultados.restaurantes.map(rest => `
      <div
        onclick="window.verCardapio(${rest.id})"
        class="bg-white p-6 rounded-xl shadow-sm hover:shadow-md cursor-pointer transition border border-gray-100 flex flex-col justify-between hover:border-red-200 group"
      >
        <div>
          <div class="flex items-center justify-between mb-1">
            <h4 class="text-lg font-bold text-gray-900 group-hover:text-red-600 transition-colors">
              ${rest.name}
            </h4>
            <span class="text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded font-semibold">Restaurante</span>
          </div>
          <p class="text-sm text-gray-500 mt-1">${rest.category}</p>
        </div>
        <div class="mt-4 flex gap-2">
          <span class="bg-green-100 text-green-800 text-xs px-2.5 py-0.5 rounded font-medium">${rest.badge}</span>
          <span class="bg-yellow-100 text-yellow-800 text-xs px-2.5 py-0.5 rounded font-medium">${rest.time}</span>
        </div>
      </div>
    `).join('');

    restaurantesHtml = `
      <div class="mb-10">
        <h3 class="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          🏪 Restaurantes correspondentes (${resultados.restaurantes.length})
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          ${cardsRestaurantes}
        </div>
      </div>
    `;
  }

  // Monta HTML de pratos encontrados
  let pratosHtml = '';
  if (resultados.pratos.length > 0) {
    const cardsPratos = resultados.pratos.map(prato => `
      <article class="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg transition duration-300 flex flex-col justify-between">
        <div>
          <div class="relative">
            <img
              src="${prato.image}"
              alt="${prato.name}"
              class="w-full h-44 object-cover"
              loading="lazy"
            />
            <span class="absolute top-3 left-3 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs font-bold text-gray-800 shadow">
              🏪 ${prato.restauranteNome}
            </span>
          </div>

          <div class="p-5">
            <h4 class="font-bold text-gray-900 text-lg">
              ${prato.name}
            </h4>
            <p class="text-sm text-gray-500 mt-2 min-h-[40px] leading-relaxed">
              ${prato.description}
            </p>
          </div>
        </div>

        <div class="px-5 pb-5">
          <div class="flex items-center justify-between pt-3 border-t border-gray-50 mb-3">
            <div>
              <span class="text-xs text-gray-400 block">Preço</span>
              <span class="font-bold text-xl text-gray-900">
                R$ ${prato.price.toFixed(2).replace('.', ',')}
              </span>
            </div>
            <button
              type="button"
              onclick="window.verCardapio(${prato.restauranteId})"
              class="text-xs text-red-600 hover:text-red-700 font-semibold hover:underline"
            >
              Ver cardápio completo →
            </button>
          </div>

          <button
            type="button"
            onclick="window.adicionarItem(${prato.id})"
            class="w-full bg-red-600 hover:bg-red-700 active:scale-95 text-white font-semibold py-2 px-4 rounded-xl transition shadow-sm flex items-center justify-center gap-1.5"
          >
            <span>+</span> Adicionar ao Carrinho
          </button>
        </div>
      </article>
    `).join('');

    pratosHtml = `
      <div class="mb-10">
        <h3 class="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          🍽️ Pratos encontrados (${resultados.pratos.length})
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          ${cardsPratos}
        </div>
      </div>
    `;
  }

  container.innerHTML = `
    <div class="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-200">
      <div>
        <h2 class="text-2xl font-bold text-gray-900">
          Resultados para "${termo}"
        </h2>
        <p class="text-gray-500 text-sm mt-1">
          ${resultados.totalResultados} ${resultados.totalResultados === 1 ? 'item encontrado' : 'itens encontrados'}
        </p>
      </div>

      <button
        type="button"
        onclick="window.voltarParaRestaurantes()"
        class="text-red-600 hover:text-red-700 font-semibold text-sm flex items-center gap-1.5 self-start sm:self-auto hover:underline"
      >
        ← Voltar aos restaurantes
      </button>
    </div>

    ${restaurantesHtml}
    ${pratosHtml}
  `;

  renderCarrinho();
}
