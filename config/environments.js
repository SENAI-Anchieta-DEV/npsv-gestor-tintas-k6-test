export const environments = {
    local: __ENV.BASE_URL || 'http://localhost:8080', 

    admin: {
        email: __ENV.ADMIN_EMAIL || 'admin@gestortintas.com',
        senha: __ENV.ADMIN_SENHA || 'admin'
    }
};