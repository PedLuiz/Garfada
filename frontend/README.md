# Garfada Frontend

Frontend do Garfada construído com React, Tailwind CSS e React Router, com dados 100% mockados para demonstração completa do produto.

## Stack
- React
- Tailwind CSS
- React Router
- Mocks locais + camada de services
- Docker

## Estrutura
```text
src/
  components/
  hooks/
  layouts/
  mocks/
  pages/
  router/
  services/
  types/
  utils/
```

## Telas Implementadas
- `/` Landing
- `/cadastro`
- `/login`
- `/catalogo`
- `/restaurantes/:id`
- `/lista-desejos`
- `/visitados`
- `/meu-perfil`
- `/perfil/editar`
- `/usuarios/:id`
- `/feed`

## Rodando com Docker
Na raiz do repositório:

```bash
docker compose up --build
```

A aplicação ficará disponível em:
- `http://localhost:5173`

Hot reload está habilitado via volume montado do diretório `frontend`.

## Rodando sem Docker
```bash
cd frontend
npm install
npm run dev -- --host
```

## Contratos de integração
Veja o arquivo:
- `ENDPOINTS.md`

## Observações
- Não há backend real conectado.
- Não há autenticação real.
- Toda persistência é mockada em memória durante a sessão do app.
