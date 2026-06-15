# Gestor Tintas - Testes de Performance (k6)

Repositório centralizado para os testes de carga, stress e performance da API do Gestor Tintas, utilizando [k6](https://k6.io/).

## 🏗 Estrutura do Projeto

* `config/`: Configurações globais e mapeamento de ambientes.
* `helpers/`: Módulos utilitários (autenticação, geração de dados dinâmicos, validações padronizadas).
* `tests/`: Scripts de teste divididos por fluxo de negócio.

## 🚀 Como Executar Localmente

Para proteger os dados da API, a URL base não está versionada no código. É necessário passá-la dinamicamente no momento da execução via variável de ambiente.

1. Instale o k6 na sua máquina.
2. Execute o teste desejado injetando a variável `BASE_URL`:

```bash
k6 run -e BASE_URL=http://localhost:8080 tests/01-cadastro-fornecedor.js
```

> **Nota:** Nunca adicione URLs sensíveis, senhas ou tokens diretamente nos scripts. Sempre utilize variáveis de ambiente (`-e NOME_VAR=valor`).

## 🌿 Padrões de Contribuição

* Trabalhe em sua própria branch (ex: `feature/teste-fornecedor` ou `test/carga-produtos`).
* Utilize **Conventional Commits** para manter o histórico semântico (ex: `test: adiciona fluxo de cadastro de fornecedor`, `chore: configura utilitário de autenticação`).