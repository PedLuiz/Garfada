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


## Diagramas UML

### Diagrama de Entidade-Relacionamento (ERD)

```mermaid
erDiagram
    USERS ||--o{ REVIEWS : "escreve"
    USERS ||--o{ WISHLIST_ITEMS : "salva"
    USERS ||--o{ VISITED_RESTAURANTS : "marca como visitado"
    USERS ||--o{ USER_FOLLOWS : "segue / é seguido"
    USERS ||--o{ FEED_EVENTS : "gera"
    USERS ||--o{ USER_FAVORITE_CUISINES : "prefere"

    RESTAURANTS ||--o{ REVIEWS : "recebe"
    RESTAURANTS ||--o{ RESTAURANT_PHOTOS : "possui"
    RESTAURANTS ||--o{ RESTAURANT_MENU_ITEMS : "oferece"
    RESTAURANTS ||--o{ WISHLIST_ITEMS : "adicionado a"
    RESTAURANTS ||--o{ VISITED_RESTAURANTS : "registra visita"
    
    CUISINES ||--o{ RESTAURANTS : "categoriza"
    CUISINES ||--o{ USER_FAVORITE_CUISINES : "é favorita de"

    REVIEWS ||--o| FEED_EVENTS : "origina evento"

    USERS {
        string id PK
        string username
        string email
    }
    RESTAURANTS {
        string id PK
        string name
        bigint cuisine_id FK
    }
    REVIEWS {
        string id PK
        string user_id FK
        string restaurant_id FK
        numeric rating
    }
    FEED_EVENTS {
        string id PK
        string type "review, visited, wishlist, follow"
        string user_id FK
    }
```

