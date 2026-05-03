# Garfada

Repositório do Garfada com frontend React + backend Node/Express integrado ao PostgreSQL.

## Stack

- Frontend: React + Vite
- Backend: Node.js + Express + pg
- Banco: PostgreSQL (schema e seeds em `db/init.sql`)

## Subindo tudo com Docker

Na raiz do projeto:

```bash
docker compose up --build
```

Serviços:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3001`
- PostgreSQL: `localhost:5432`

O schema é carregado automaticamente a partir de `db/init.sql` na primeira subida do banco.

## Variáveis de ambiente

Copie `.env.example` para `.env` e ajuste se necessário.

Principais variáveis:

- `PGHOST`, `PGPORT`, `PGDATABASE`, `PGUSER`, `PGPASSWORD`
- `JWT_SECRET`, `JWT_EXPIRES_IN`
- `PORT`
- `VITE_API_URL`

## Credenciais seed para login

Os usuários seedados usam a senha:

```text
garfada123
```

Exemplo:

- email: `pedro@garfada.app`
- username: `pedrins`
- senha: `garfada123`

## Endpoints do frontend

Contratos esperados no frontend:

- `frontend/ENDPOINTS.md`


