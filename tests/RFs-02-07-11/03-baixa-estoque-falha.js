import http from 'k6/http';
import { sleep, check } from 'k6';
import { environments } from '../config/environments.js'; 
import { getAuthToken } from '../helpers/auth.js';
import { checkStatus } from '../helpers/checks.js'; 

export const options = {
    stages: [
        { duration: '15s', target: 5 },  
        { duration: '30s', target: 5 },  
        { duration: '15s', target: 0 },  
    ],
    thresholds: {
        // Removido o http_req_failed pois esperamos retornos 422 (que o k6 lê como falha)
        http_req_duration: ['p(95)<2500'] // A latência de rejeição também deve ser rápida
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

    // ID de uma produção mocado que sabemos que consumirá mais estoque do que o disponível
    const producaoSemEstoqueId = 2; // Ainda não existente

    // ========================================================
    // CT-03: Enviar PATCH esperando Falha por Estoque Baixo
    // ========================================================
    const urlPatch = `${environments.api}/api/producoes/${producaoSemEstoqueId}/concluir`;
    
    // Dispara a tentativa de conclusão
    const resPatch = http.patch(urlPatch, null, Object.assign({}, params, { tags: { endpoint: 'patch-concluir-falha' } }));

    // Valida se o status da resposta é exatamente 422 Unprocessable Entity
    checkStatus(resPatch, 422, 'CT-03: Rejeição por Estoque Baixo (422)');

    // Validação extra: Garante que o corpo do erro aponta para a regra de negócio correta
    check(resPatch, {
        'CT-03: possui código RN02 (Baixa de Estoque)': (r) => r.json('codigoRegraNegocio') === 'RN02 - Baixa de Estoque'
    });

    sleep(1);
}