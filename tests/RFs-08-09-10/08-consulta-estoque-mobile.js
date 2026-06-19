import http from 'k6/http';
import { sleep, check } from 'k6';
import { environments } from '../config/enviroments.js'; 
import { getAuthToken } from '../helpers/auth.js';
import { checkJsonResponse } from '../helpers/check.js'; 

export const options = {
    stages: [
        { duration: '15s', target: 20 }, // Simula 20 aparelhos mobile conectando simultaneamente
        { duration: '30s', target: 20 }, 
        { duration: '15s', target: 0 },  
    ],
    thresholds: {
        http_req_failed: ['rate<0.01'], 
        // Dispositivos móveis exigem respostas rápidas. Definimos o limite de 95% em 1.5 segundos.
        http_req_duration: ['p(95)<1500'] 
    }
};

export function setup() {
    // O endpoint de produtos permite ADMIN, VENDEDOR ou COLORISTA. 
    // Usaremos as credenciais configuradas no environments.
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
            endpoint: 'get-produtos-mobile'
        }
    };

    // ========================================================
    // CT01: Consulta de produtos/estoque (App Mobile)
    // ========================================================
    const url = `${environments.api}/api/produtos`;
    const res = http.get(url, params);

    // Verifica se a resposta foi 200 OK e se retornou um JSON válido
    checkJsonResponse(res, 200, 'CT01: Consulta Estoque Mobile');

    // Validação extra: Verifica se a API retornou de facto um array de produtos
    check(res, {
        'CT01: Retornou uma lista (array)': (r) => {
            try {
                const body = r.json();
                return Array.isArray(body);
            } catch (e) {
                return false;
            }
        }
    });

    sleep(1); // Simula o tempo de navegação do utilizador no App
}