 const baseUrl = __ENV.BASE_URL || 'http://localhost:8080';

 export const environments = {
     local: baseUrl,
     api: baseUrl,
     admin: {
         email: __ENV.ADMIN_EMAIL,
         senha: __ENV.ADMIN_SENHA,
     },
 };