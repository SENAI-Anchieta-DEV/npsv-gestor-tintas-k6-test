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