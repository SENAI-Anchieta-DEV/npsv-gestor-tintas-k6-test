import http from 'k6/http';
import { sleep, check } from 'k6';
import { environments } from '../config/environments.js'; 
import { getAuthToken } from '../helpers/auth.js';
import { checkStatus, checkJsonResponse } from '../helpers/checks.js'; 

export const options = {
    stages: [
        { duration: '15s', target: 5 },  
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

    // IDs mocados: Presume-se que a Produção 3 consuma insumos suficientes
    // para derrubar o saldo do Insumo 3 para baixo ou igual ao seu "estoqueMinimo"
    const producaoIdAlerta = 3; // Ainda não existente
    const insumoIdAlerta = 3; // Ainda não existente

    // ========================================================
    // PASSO 1: Enviar PATCH para concluir a produção
    // ========================================================
    const urlPatch = `${environments.api}/api/producoes/${producaoIdAlerta}/concluir`;
    const resPatch = http.patch(urlPatch, null, Object.assign({}, params, { tags: { endpoint: 'patch-concluir-alerta' } }));
    
    checkStatus(resPatch, 200, 'CT-04: Concluir Producao (Baixa)');

    // ========================================================
    // PASSO 2 e 3: Consultar o insumo e Validar o Alerta (RF11)
    // ========================================================
    // Só validamos o alerta se a baixa foi feita com sucesso (status 200)
    if (resPatch.status === 200) {
        const urlGet = `${environments.api}/api/produtos/${insumoIdAlerta}`;
        const resGet = http.get(urlGet, Object.assign({}, params, { tags: { endpoint: 'get-produto-alerta' } }));

        checkJsonResponse(resGet, 200, 'CT-04: Consultar Insumo');

        check(resGet, {
            // Verifica se a flag mudou para true com base no nome real do DTO
            'CT-04: estoqueEmAlerta é TRUE': (r) => r.json('estoqueEmAlerta') === true,
            // (Opcional) Valida matematicamente se o estoque atual realmente ficou menor ou igual ao mínimo
            'CT-04: quantidadeEstoque atingiu o mínimo': (r) => r.json('quantidadeEstoque') <= r.json('estoqueMinimo')
        });
    }

    sleep(1);
}