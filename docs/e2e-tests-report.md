# Testes E2E com Playwright

## Escopo

A suíte E2E valida os principais fluxos reais do Garfada no navegador:

- autenticação, cadastro, login, logout e rotas protegidas;
- catálogo, filtros, detalhe de restaurante e navegação;
- lista de desejos e restaurantes visitados;
- avaliação por estrelas e publicação de comentário;
- edição de perfil, busca de usuários e seguir perfil;
- smoke mobile em Chromium.

## Ambiente

Os testes usam uma stack Docker isolada em `docker-compose.e2e.yml`:

- frontend: `http://127.0.0.1:5174`;
- backend: `http://127.0.0.1:3002`;
- Postgres: porta `5433`, banco `garfada_e2e`.
- runner Playwright: container `mcr.microsoft.com/playwright:v1.60.0-noble`.

O volume do banco E2E é recriado a cada execução pelo script
`test:e2e`, garantindo seeds limpos a partir de `db/init.sql`.
O serviço do runner fica no profile `runner`, então os comandos usados pelo
modo UI/headed sobem apenas `db`, `backend` e `frontend`, sem disparar outra
execução de testes em paralelo.

## Como Executar

O caminho recomendado roda tudo em Docker, incluindo o navegador:

```bash
cd frontend
npm run test:e2e
```

Para execução local interativa no host, instale o navegador usado pelo
Playwright:

```bash
npm run test:e2e:install
```

Se o Chromium local falhar com erro de biblioteca ausente, como
`libnspr4.so`, instale também as dependências nativas do Playwright:

```bash
sudo npx playwright install-deps chromium
```

Com interface visual:

```bash
npm run test:e2e:ui
```

Com navegador visível:

```bash
npm run test:e2e:headed
```

Nesses dois modos interativos, o Playwright abre o navegador no host. Por isso,
a stack E2E sobe o frontend com `VITE_API_URL=http://127.0.0.1:3002`, garantindo
que os formulários reais de login e cadastro consigam chamar o backend exposto
fora da rede Docker.

Para abrir o relatório HTML depois de uma execução:

```bash
npm run test:e2e:report
```

## Observações

- A suíte roda com `workers: 1` porque manipula estado compartilhado de banco.
- Cada teste cria usuários próprios via API para evitar dependência de usuários seedados mutáveis.
- Erros de console e `pageerror` fazem o teste falhar.
- Screenshots, vídeos e traces são mantidos apenas em falhas e ficam fora do Git.
- O comando `test:e2e` roda em Docker e grava artefatos com o UID/GID do
  usuário local para evitar erros de permissão ao abrir ou sobrescrever
  relatórios depois.
