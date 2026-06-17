import http from 'k6/http';
import { sleep } from 'k6';
import { environments } from '../config/environments.js'
import { getAuthToken } from '../helpers/auth.js';
import { buildProdutoPayload } from '../helpers/payloads.js';
import { checkJsonResponse } from '../helpers/checks.js';

// Configuração da Carga de Teste
export const options = {
    stages: [
        { duration: '10s', target: 10 }, // Ramp-up: sobe gradativamente até 10 VUs
        { duration: '30s', target: 10 }, // Manutenção: sustenta a carga de 10 VUs por 30s
        { duration: '10s', target: 0 },  // Ramp-down: encerra os VUs gradativamente
    ],
    thresholds: {
        // Exigências de Performance para Aprovação
        http_req_failed: ['rate<0.01'],   // Máximo de 1% de requisições falhas
        http_req_duration: ['p(95)<2000'] // 95% das respostas abaixo de 2 segundos
    }
};

// SETUP: Autenticação (Executado 1 única vez antes dos VUs iniciarem)
export function setup() {
    // Insira credenciais válidas do seu banco local de desenvolvimento com perfil ADMIN
    const token = getAuthToken(environments.admin.email, environments.admin.senha);
    return { token };
}

// VU (Virtual User): Fluxo principal executado em repetição
export default function (data) {
    const url = `${environments.api}/api/produtos`;
    const payload = buildProdutoPayload("ef2e4aa6-a95f-41c3-b3a4-88319db1ff17"); // Usando Categoria ID 1 por padrão

    const params = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${data.token}`
        },
        tags: {
            name: 'POST /api/produtos' // Facilita a leitura das métricas no terminal
        }
    };

    // Ação: Dispara a requisição
    const res = http.post(url, payload, params);

    // Validação: Garante que o retorno é 201 Created (Conforme esperado no CT-01)
    checkJsonResponse(res, 201, 'CT-01: Cadastro Insumo');

    // Think time: Simula o intervalo de tempo entre ações de um usuário real
    sleep(1);
}