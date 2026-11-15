/**
 * Módulo de busca do DeliveryFast
 * Responsável pela lógica de busca por restaurantes e pratos.
 */

/**
 * Remove acentuação, espaços extras e converte o texto para minúsculas.
 * @param {string} texto
 * @returns {string}
 */
export function normalizarTexto(texto) {
  if (!texto || typeof texto !== 'string') return '';
  return texto
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

/**
 * Realiza a busca de restaurantes e pratos a partir de um termo de pesquisa.
 * 
 * @param {string} termo - Termo digitado pelo usuário.
 * @param {Array<Object>} restaurantes - Lista de restaurantes disponíveis.
 * @param {Object} menusData - Dicionário de pratos por id de restaurante.
 * @returns {Object} Resultado com termo, restaurantes encontrados, pratos encontrados e indicador booleano.
 */
export function buscar(termo, restaurantes = [], menusData = {}) {
  const termoFormatado = normalizarTexto(termo);

  if (!termoFormatado) {
    return {
      termo: termo ? termo.trim() : '',
      restaurantes: [],
      pratos: [],
      totalResultados: 0,
      encontrado: false
    };
  }

  // 1. Busca por restaurantes (por nome ou categoria)
  const restaurantesEncontrados = restaurantes.filter(rest => {
    const nome = normalizarTexto(rest.name);
    const categoria = normalizarTexto(rest.category);
    return nome.includes(termoFormatado) || categoria.includes(termoFormatado);
  });

  // 2. Busca por pratos (por nome ou descrição em todos os cardápios)
  const pratosEncontrados = [];

  for (const rest of restaurantes) {
    const cardapio = menusData[rest.id] || [];
    for (const prato of cardapio) {
      const nomePrato = normalizarTexto(prato.name);
      const descPrato = normalizarTexto(prato.description);

      if (nomePrato.includes(termoFormatado) || descPrato.includes(termoFormatado)) {
        pratosEncontrados.push({
          ...prato,
          restauranteId: rest.id,
          restauranteNome: rest.name
        });
      }
    }
  }

  const totalResultados = restaurantesEncontrados.length + pratosEncontrados.length;

  return {
    termo: termo.trim(),
    restaurantes: restaurantesEncontrados,
    pratos: pratosEncontrados,
    totalResultados,
    encontrado: totalResultados > 0
  };
}

/**
 * Busca um prato pelo ID em qualquer cardápio do sistema.
 * @param {number} itemId 
 * @param {Object} menusData 
 * @returns {Object|null}
 */
export function obterPratoPorId(itemId, menusData = {}) {
  for (const restId in menusData) {
    const lista = menusData[restId] || [];
    const prato = lista.find(p => p.id === itemId);
    if (prato) return prato;
  }
  return null;
}
