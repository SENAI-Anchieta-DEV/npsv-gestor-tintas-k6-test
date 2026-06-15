// tests/02-fluxo-producao.js
import http from 'k6/http';
import { sleep } from 'k6';
import { environments } from '../config/environments.js';
import { getAuthToken } from '../helpers/auth.js';
import { buildProdutoPayload } from '../helpers/payloads.js';
import { checkJsonResponse, checkStatus } from '../helpers/checks.js';

export const options = {
  stages: [
    { duration: '30s', target: 20 }, // Simula 20 usuários simultâneos
    { duration: '1m', target: 20 },
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    http_req_failed: ['rate<0.05'], // Tolerância um pouco maior em testes de fluxo complexo
    http_req_duration: ['p(95)<2500'] 
  },
};

export function setup() {
  const token = getAuthToken('admin@gestortintas.com', 'senha');
  
  // PRE-REQUISITO: Opcionalmente, você poderia criar a Categoria/Fórmula base aqui no setup 
  // para garantir que o ambiente tenha as FKs necessárias antes dos VUs começarem.
  
  return { token };
}

export default function (data) {
  const params = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${data.token}`
    }
  };

  // ========================================================
  // CT-01: Cadastro de Insumo (Produto) [RF02]
  // ========================================================
  const urlProduto = `${environments.api}/api/produtos`;
  const payloadProduto = buildProdutoPayload(1); // Categoria ID 1
  
  // Tagging para separar as métricas dessa requisição
  const resProduto = http.post(urlProduto, payloadProduto, Object.assign({}, params, { tags: { endpoint: 'cadastro-produto' } }));
  checkJsonResponse(resProduto, 201, 'CT-01: Cadastro Produto');
  
  let produtoId = null;
  if (resProduto.status === 201) {
      produtoId = resProduto.json('id');
  }

  sleep(1); // Think time

  // ========================================================
  // CT-02 & CT-04: Baixa Automática e Alerta [RF07, RF11]
  // ========================================================
  // *Nota: Para simplificar no k6, simulamos a requisição de conclusão direto na Produção.
  // Assumimos que existe uma Produção com ID fixo (ex: 1) para ser concluída, 
  // ou você cria a Produção via POST antes do PATCH.*
  
  // Para fins de demonstração, simularemos uma requisição PATCH em uma produção ID 1.
  // Em um cenário real, você teria que criar a Produção via POST, pegar o ID, e depois fazer o PATCH.
  const producaoIdMock = 1; 
  const urlConcluirProducao = `${environments.api}/api/producoes/${producaoIdMock}/concluir`;
  
  const resBaixa = http.patch(urlConcluirProducao, null, Object.assign({}, params, { tags: { endpoint: 'concluir-producao' } }));
  
  // CT-02: Se a Produção for concluída (200 OK), a baixa no estoque ocorreu.
  checkStatus(resBaixa, 200, 'CT-02: Concluir Producao (Baixa Estoque)');

  sleep(1);
}