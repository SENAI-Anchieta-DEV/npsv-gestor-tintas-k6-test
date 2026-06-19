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

// helpers/payloads.js (Adicionar no final do ficheiro)

/**
 * Payload para Iniciar uma Venda (RF09)
 * Simula a abertura do carrinho por um vendedor.
 */
export function buildIniciarVendaPayload(vendedorId) {
    return JSON.stringify({
        vendedorId: vendedorId
    });
}

/**
 * Payload para Concluir Venda / Carrinho (RF09 e BUG-02)
 * Envia itens e forma de pagamento para testarmos se o backend 
 * calcula o valor total corretamente (sem o erro de centavos).
 */
export function buildConcluirVendaPayload(produtoId, quantidade) {
    return JSON.stringify({
        formaPagamento: "PIX",
        itens: [
            {
                produtoId: produtoId,
                quantidade: quantidade
            }
            // Para simular o BUG-02 com mais rigor, o ideal no teste
            // será passar quantidades quebradas ou adicionar mais itens no array.
        ]
    });
}

/**
 * Payload para Cadastro de Cliente/Usuário com E-mail Inválido (BUG-04)
 * Força propositadamente a falha da anotação @Email do Spring Boot
 * para provar se a API bloqueia a submissão de lixo.
 */
export function buildEmailInvalidoPayload() {
    const timestamp = new Date().getTime();
    
    return JSON.stringify({
        nome: `Teste Email Invalido ${timestamp}`,
        cpf: "12345678909", // CPF mocado (como as validações estão relaxadas)
        telefone: "11999999999",
        endereco: "Rua do Bug, 404",
        // E-mail propositadamente SEM o "@" para testar a vulnerabilidade do BUG-04
        email: `email.invalido.sem.arroba.${timestamp}.com` 
    });
}