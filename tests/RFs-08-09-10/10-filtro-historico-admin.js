import http from 'k6/http';
import { sleep, check } from 'k6';
import { environments } from '../config/enviroments.js'; 
import { getAuthToken } from '../helpers/auth.js';
import { checkJsonResponse } from '../helpers/check.js'; 

export const options = {
    stages: [
        { duration: '15s', target: 10 }, // Carga para testar se o filtro aguenta paginação/buscas simultâneas
        { duration: '30s', target: 10 },
        { duration: '15s', target: 0 },
    ],
    thresholds: {
        http_req_failed: ['rate<0.01'],
        http_req_duration: ['p(95)<2000']
    }
};

export function setup() {
    // Apenas ADMIN deve ter acesso a este relatório irrestrito
    const token = getAuthToken(environments.admin.email, environments.admin.senha); 
    return { token };
}

export default function (data) {
    const params = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${data.token}`
        },
        tags: {
            endpoint: 'get-vendas-vendedor'
        }
    };

    // Mocks: Deve substituir pelo ID real e pelo Nome exato do vendedor no banco de dados
    const vendedorIdMock = "id-do-vendedor-aqui";
    const nomeVendedorEsperado = "Nome Exato do Vendedor";

    // ========================================================
    // CT03: Filtro de Histórico por Funcionário
    // ========================================================
    const url = `${environments.api}/api/vendas/vendedor/${vendedorIdMock}`;
    
    const res = http.get(url, params);

    checkJsonResponse(res, 200, 'CT03: Histórico de Vendas');

    // ========================================================
    // Validação do BUG-03 (Filtro Ignorado)
    // ========================================================
    if (res.status === 200) {
        check(res, {
            'CT03 / BUG-03: Retornou apenas vendas do vendedor filtrado': (r) => {
                try {
                    const vendas = r.json();
                    
                    // Se a lista estiver vazia, o filtro tecnicamente não falhou (não trouxe os outros)
                    if (vendas.length === 0) return true; 

                    // Verifica se TODOS os registros (every) possuem o nome do vendedor correto
                    // Conforme o VendaResponseDTO, a propriedade chama-se 'nomeVendedor'
                    return vendas.every(venda => venda.nomeVendedor === nomeVendedorEsperado);
                } catch (e) {
                    return false;
                }
            }
        });
    }

    sleep(1);
}