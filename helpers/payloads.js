export function gerarCnpjSimples() {
    return Math.floor(Math.random() * 100000000000000).toString().padStart(14, '0');
}

export function buildFornecedorPayload() {
    const timestamp = new Date().getTime();
    const hash = Math.random().toString(36).substring(2, 7);

    return JSON.stringify({
        razaoSocial: `Fornecedor Teste ${timestamp} ${hash}`,
        cnpj: gerarCnpjSimples(),
        nomeContato: `Contato ${hash}`,
        telefone: "11999999999",
        email: `fornecedor_${timestamp}_${hash}@testecarga.com`,
        endereco: "Rua dos Testes, 123 - SP"
    });
}

export function gerarCodigoBarrasSimples() {
    return Math.floor(Math.random() * 10000000000000).toString().padStart(13, '0');
}

export function buildProdutoPayload(categoriaId) {
    const timestamp = new Date().getTime();
    const hash = Math.random().toString(36).substring(2, 7);

    return JSON.stringify({
        codigoBarras: gerarCodigoBarrasSimples(), // Protege contra o BUG-02
        descricao: `Tinta Carga ${timestamp} ${hash}`,
        quantidadeEstoque: 100.0, // Começamos com estoque cheio para testar a baixa depois
        unidadeMedida: "L", // Conforme CT-01
        categoriaId: categoriaId || 1 // Assumindo ID 1 como padrão se não for fornecido
    });
}

// Payload simples para criar uma Produção 
export function buildProducaoPayload(produtoIdFormula) {
   // A estrutura exata depende do seu DTO, ajustei baseado no contexto
   return JSON.stringify({
        formulaId: 1, // Assumindo uma fórmula pré-existente
        quantidadePlanejada: 10.0 
   });
}