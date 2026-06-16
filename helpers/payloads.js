/**
 * Gera um Código de Barras numérico aleatório de 13 dígitos.
 * Fundamental para evitar o erro 409 (Conflict) sob alta concorrência e contornar o BUG-02.
 */
export function gerarCodigoBarrasSimples() {
    return Math.floor(Math.random() * 10000000000000).toString().padStart(13, '0');
}

/**
 * Constrói o payload para o Cadastro de Produto (Insumo).
 * Referência: CT-01 e RF02.
 */
export function buildProdutoPayload(categoriaId = 1) {
    const timestamp = new Date().getTime();
    const hash = Math.random().toString(36).substring(2, 7);

    return JSON.stringify({
        codigoBarras: gerarCodigoBarrasSimples(),
        descricao: `Tinta Carga ${timestamp} ${hash}`,
        quantidadeEstoque: 100.0, // Estoque inicial alto para viabilizar os testes de baixa (CT-02, CT-03 e CT-04)
        unidadeMedida: "L",
        precoCusto: 50.0,
        precoVenda: 100.0,
        estoqueMinimo: 20.0,
        categoriaId: categoriaId
    });
}

/**
 * Constrói o payload para iniciar ou atualizar uma Produção.
 * Referência: Necessário para preparar o ambiente para as baixas de estoque (CT-02 e CT-04).
 */
export function buildProducaoPayload(formulaId = 1, quantidadePlanejada = 10.0) {
    return JSON.stringify({
        formulaId: formulaId,
        quantidadePlanejada: quantidadePlanejada
    });
}