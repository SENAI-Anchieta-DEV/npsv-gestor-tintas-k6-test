import http from 'k6/http';
import { sleep } from 'k6';
import { environments } from '../config/enviroments.js'; 
import { buildEmailInvalidoPayload } from '../helpers/payloads.js';
import { checkStatus } from '../helpers/check.js'; 

export const options = {
    vus: 1, 
    iterations: 1
};

// Não precisamos de setup() de token se o cadastro de cliente for uma rota pública.
// Caso exija autenticação, basta adicionar o setup() como nos scripts anteriores.

export default function () {
    const url = `${environments.api}/api/clientes`; // Assumindo que o bug ocorre no registo de clientes
    const payload = buildEmailInvalidoPayload();
    
    const params = {
        headers: {
            'Content-Type': 'application/json'
        },
        tags: { endpoint: 'post-email-invalido' }
    };

    // ========================================================
    // BUG-04: Envio de E-mail Malformado (Sem '@')
    // ========================================================
    const res = http.post(url, payload, params);

    // Esperamos que o servidor bloqueie a operação devolvendo um erro 400.
    checkStatus(res, 400, 'BUG-04: API bloqueou o e-mail inválido? (Esperado 400)');

    sleep(1);
}