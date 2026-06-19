import http from 'k6/http';
import { sleep, check } from 'k6';
import { environments } from '../config/enviroments.js'; 
import { getAuthToken } from '../helpers/auth.js';
import { buildIniciarVendaPayload, buildConcluirVendaPayload } from '../helpers/payloads.js';
import { checkJsonResponse, checkStatus } from '../helpers/check.js'; 

export const options = {
    stages: [
        { duration: '15s', target: 5 },  // Carga moderada para focar na precisão matemática
        { duration: '30s', target: 5 },
        { duration: '15s', target: 0 },
    ],
    thresholds: {
        http_req_failed: ['rate<0.01'],
        http_req_duration: ['p(95)<2500']
    }
};

export function setup() {
    const token = getAuthToken(environments.admin.email, environments.admin.senha); 
    return { token };
}

export default function (data) {
    const params = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${data.token}`
        }
    };

    // IDs simulados (Mocks). 
    // Deverá substituir por IDs reais de um utilizador e de um produto existentes na sua base de dados local.
    const vendedorIdMock = "vendedor-id-real-aqui";
    const produtoIdMock = "produto-id-real-aqui";
    const quantidadeCompra = 3; // O CT02 pede a compra de 3 itens

    // ========================================================
    // PASSO 1: Iniciar Venda (Criar o Carrinho)
    // ========================================================
    const urlIniciar = `${environments.api}/api/vendas/iniciar`;
    const payloadIniciar = buildIniciarVendaPayload(vendedorIdMock);

    const resIniciar = http.post(urlIniciar, payloadIniciar, Object.assign({}, params, { tags: { endpoint: 'post-vendas-iniciar' } }));
    
    checkJsonResponse(resIniciar, 201, 'CT02: Iniciar Venda');

    let vendaId = null;
    if (resIniciar.status === 201) {
        vendaId = resIniciar.json('id');
    }

    sleep(0.5);

    // ========================================================
    // PASSO 2: Concluir Venda e Validar Matemática (BUG-02)
    // ========================================================
    if (vendaId) {
        const urlConcluir = `${environments.api}/api/vendas/${vendaId}/concluir`;
        const payloadConcluir = buildConcluirVendaPayload(produtoIdMock, quantidadeCompra);

        const resConcluir = http.patch(urlConcluir, payloadConcluir, Object.assign({}, params, { tags: { endpoint: 'patch-vendas-concluir' } }));

        checkStatus(resConcluir, 200, 'CT02: Concluir Venda');

        // Lógica para validar o BUG-02: Garantir que a soma exata dos itens bate com o valor total devolvido pela API
        check(resConcluir, {
            'CT02 / BUG-02: Valor Total é matematicamente exato': (r) => {
                try {
                    const body = r.json();
                    const valorTotalApi = body.valorTotal;
                    
                    // Soma os subtotais devolvidos nos itens da venda
                    let valorTotalCalculado = 0;
                    body.itens.forEach(item => {
                        valorTotalCalculado += (item.precoPraticado * item.quantidade);
                    });

                    // Verifica se há a quebra de centavos relatada
                    // Usamos toFixed(2) para garantir a comparação segura de casas decimais em JavaScript
                    return Number(valorTotalApi).toFixed(2) === Number(valorTotalCalculado).toFixed(2);
                } catch (e) {
                    return false;
                }
            }
        });
    }

    sleep(1);
}