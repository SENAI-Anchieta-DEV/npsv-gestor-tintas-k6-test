import http from 'k6/http';
import { check } from 'k6';
import { environments } from '../config/environments.js';

export function getAuthToken(email, senha) {
    const url = `${environments.local}/auth/login`; 
    
    const payload = JSON.stringify({
        email: email,
        senha: senha
    });

    const params = {
        headers: {
            'Content-Type': 'application/json',
        },
    };

    const res = http.post(url, payload, params);

    check(res, {
        'login com sucesso (status 200)': (r) => r.status === 200,
        'token retornado': (r) => r.json('token') !== undefined,
    });

    return res.json('token'); 
}