import http from 'k6/http';
import { sleep } from 'k6';
import { environments } from '../config/enviroments.js'; 
import { getAuthToken } from '../helpers/auth.js';
import { checkStatus } from '../helpers/check.js'; 

export const options = {
    vus: 1, // Teste funcional isolado, precisamos de apenas 1 VU
    iterations: 1
};

export function setup() {
    const token = getAuthToken(environments.admin.email, environments.admin.senha); 
    return { token };
}

export default function (data) {
    const params = {
        headers: {
            'Authorization': `Bearer ${data.token}`
        },
        tags: { endpoint: 'delete-registro' }
    };

    // ID simulado. Substitua por um ID válido de uma venda ou registo que possa ser apagado.
    const registroIdMock = "id-do-registro-aqui";
    
    // ========================================================
    // BUG-05: Teste de Exclusão Direta na API
    // ========================================================
    const url = `${environments.api}/api/vendas/${registroIdMock}`;

    const res = http.del(url, null, params);

    // O padrão REST para exclusão com sucesso é 204 No Content (ou 200 OK).
    // Se este check passar, a API funciona e o bug do botão está no Frontend.
    checkStatus(res, 204, 'BUG-05: Exclusão via API (Esperado 204)');

    sleep(1);
}