import http from 'k6/http';
import { sleep } from 'k6';
import { environments } from '../config/environments.js'; 
import { getAuthToken } from '../helpers/auth.js';
import { checkStatus, checkJsonResponse } from '../helpers/checks.js';

export const options = {
    stages: [
        { duration: '15s', target: 5 },  // Ramp-up: sobe para 5 VUs (carga focada para testar concorrência e o BUG-01)
        { duration: '30s', target: 5 },  // Manutenção: sustenta a carga
        { duration: '15s', target: 0 },  // Ramp-down: encerra os VUs
    ],
    thresholds: {
        http_req_failed: ['rate<0.01'], 
        http_req_duration: ['p(95)<2500'] 
    }
};

// SETUP: Autenticação centralizada
export function setup() {
    const token = getAuthToken(environments.admin.email, environments.admin.senha); 
    return { token };
}

// VU: Fluxo principal de conclusão e verificação de estoque
export default function (data) {
    const params = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${data.token}`
        }
    };

    // NOTA DE AMBIENTE: Para o escopo deste teste (CT-02), assumimos que a 
    // Produção e o Insumo já existem no banco de dados e estão mapeados aqui.
    // Altere esses IDs para corresponderem aos dados reais do seu banco local.
    const producaoId = 1; // Ainda não existente
    const insumoId = "c1c23b33-8dce-457c-833a-5e7816f578ea";

    // ========================================================
    // PASSO 1: Enviar PATCH para /api/producoes/{id}/concluir
    // ========================================================
    const urlPatch = `${environments.api}/api/producoes/${producaoId}/concluir`;
    
    // Dispara a tentativa de conclusão. Alta concorrência aqui testará o BUG-01 (Atomicidade)
    const resPatch = http.patch(urlPatch, null, Object.assign({}, params, { tags: { endpoint: 'patch-concluir' } }));

    // Valida se o status da resposta é 200 OK (Produção Concluída)
    checkStatus(resPatch, 200, 'CT-02: Concluir Producao (PATCH)');

    // ========================================================
    // PASSO 2: Consultar estoque do insumo via GET
    // ========================================================
    const urlGet = `${environments.api}/api/produtos/${insumoId}`;
    const resGet = http.get(urlGet, Object.assign({}, params, { tags: { endpoint: 'get-produto' } }));

    // Valida se o GET retornou com sucesso e se é um JSON válido
    checkJsonResponse(resGet, 200, 'CT-02: Consultar Insumo (GET)');

    // Think time: Pausa entre iterações
    sleep(1);
}