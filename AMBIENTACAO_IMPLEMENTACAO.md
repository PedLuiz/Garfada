# Ambientação Técnica de Implementação - Garfada

Este documento foi gerado a partir da análise do código presente no repositório local `PedLuiz/Garfada`. Ele descreve a implementação real encontrada em frontend, backend, banco de dados, rotas, funções, arquivos centrais e configuração.

## 1. Visão geral do sistema

O Garfada é uma aplicação web de catálogo, avaliação e socialização de experiências em restaurantes. Pelo `README.md`, o objetivo é funcionar como uma plataforma inspirada em sistemas de avaliação como IMDb/Letterboxd, mas aplicada a restaurantes.

O sistema permite que usuários:

- criem conta e façam login;
- pesquisem restaurantes por nome, descrição, endereço, cozinha, faixa de preço e nota mínima;
- visualizem detalhes de restaurantes, fotos, cardápio e estatísticas;
- salvem restaurantes em lista de desejos;
- marquem restaurantes como visitados;
- criem ou atualizem avaliações com nota e comentário;
- editem perfil, bio, avatar e culinárias favoritas;
- vejam perfis de outros usuários;
- sigam outros usuários;
- consultem um feed de atividades.

Os usuários principais parecem ser clientes/usuários finais interessados em registrar experiências gastronômicas, descobrir restaurantes e acompanhar recomendações da comunidade.

A divisão de camadas é:

- Frontend: React + Vite em `frontend/`, responsável pelas telas, rotas, estado de sessão e chamadas HTTP.
- Backend: Node.js + Express em `backend/`, responsável por autenticação JWT, validação básica, endpoints REST e acesso ao PostgreSQL.
- Banco: PostgreSQL inicializado por `db/init.sql`, com tabelas, índices, views e seeds.

Fluxo geral:

Usuário → página React → service frontend → `fetch` via `apiClient` → endpoint Express → função em `repositories.js` → PostgreSQL → JSON de resposta → atualização de estado na UI.

## 2. Tecnologias utilizadas

### Frontend

| Tecnologia | Onde aparece | Uso |
|---|---|---|
| React | `frontend/package.json`, `frontend/src/main.jsx`, `frontend/src/pages/*.jsx` | Implementação da interface por componentes. |
| Vite | `frontend/package.json`, `frontend/vite.config.js`, `frontend/index.html` | Dev server e build do frontend. |
| JavaScript/JSX | `frontend/src/**/*.js`, `frontend/src/**/*.jsx` | Código da aplicação. Não há TypeScript no código analisado. |
| Tailwind CSS 4 | `frontend/package.json`, `frontend/vite.config.js`, `frontend/src/index.css` | Estilização utilitária via `@import 'tailwindcss'` e plugin `@tailwindcss/vite`. |
| React Router DOM | `frontend/package.json`, `frontend/src/router/AppRouter.jsx` | Roteamento SPA, rotas protegidas e redirecionamentos. |
| Fetch API | `frontend/src/services/apiClient.js` | Requisições HTTP para o backend. |
| ESLint | `frontend/eslint.config.js`, `frontend/package.json` | Lint de JS/JSX, hooks React e React Refresh. |

Não foi encontrado uso de Axios, Redux, Zustand, React Query, TypeScript ou bibliotecas de UI externas.

### Backend

| Tecnologia | Onde aparece | Uso |
|---|---|---|
| Node.js | `backend/package.json`, `backend/Dockerfile` | Runtime do backend. |
| Express 5 | `backend/package.json`, `backend/src/server.js` | API REST, middlewares e handlers de rota. |
| CommonJS | `backend/package.json` com `"type": "commonjs"` | Sistema de módulos do backend. |
| `pg` | `backend/package.json`, `backend/src/db.js` | Acesso direto ao PostgreSQL via pool de conexões. |
| `jsonwebtoken` | `backend/src/middleware/auth.js` | Geração e validação de JWT. |
| `cors` | `backend/src/server.js` | Configuração de CORS para o frontend. |
| `dotenv` | `backend/src/server.js` | Carregamento de variáveis de ambiente. |
| `crypto` nativo | `backend/src/utils/password.js`, `backend/src/utils/ids.js` | Hash de senha PBKDF2 e criação de IDs. |
| Nodemon | `backend/package.json` | Execução em desenvolvimento com reload. |

Não foi encontrado backend em Python, FastAPI, NestJS, Prisma ou ORM/query builder.

### Banco de dados

| Tecnologia | Onde aparece | Uso |
|---|---|---|
| PostgreSQL | `docker-compose.yml`, `db/init.sql`, `backend/src/db.js` | Banco relacional principal. |
| SQL manual | `db/init.sql`, `backend/src/repositories.js` | Schema, seeds, views e queries da aplicação. |
| Views PostgreSQL | `db/init.sql` | `v_restaurant_stats` e `v_user_stats` para estatísticas agregadas. |
| Migrations SQL | `db/init.sql` | Há um bootstrap SQL único, mas não uma pasta de migrations incrementais. |

Não foi encontrado Supabase, SQLite, Prisma, migrations versionadas, RLS ou triggers.

### Infraestrutura e ferramentas

| Tecnologia | Onde aparece | Uso |
|---|---|---|
| Docker Compose | `docker-compose.yml` | Sobe `db`, `backend` e `frontend`. |
| Dockerfiles | `backend/Dockerfile`, `frontend/Dockerfile` | Imagens Node para backend e frontend. |
| `.env.example` | `.env.example` | Lista variáveis esperadas. |
| `.env` | `.env` | Arquivo local existente; valores sensíveis não devem ser expostos. |
| npm scripts | `frontend/package.json`, `backend/package.json` | Scripts de dev, build, lint e start. |
| `.gitignore`/`.dockerignore` | raiz, `frontend/`, `backend/` | Ignoram `node_modules`, `dist`, `.env` e logs. |

Não foi encontrada pasta `.github/`, portanto não há GitHub Actions no código analisado. O script de teste do backend é apenas placeholder (`echo "Error: no test specified" && exit 1`) e não há scripts de teste no frontend.

## 3. Organização de diretórios

Árvore resumida:

```text
.
├── README.md
├── AMBIENTACAO_IMPLEMENTACAO.md
├── commit_guide.md
├── style_guide.md
├── docker-compose.yml
├── db/
│   └── init.sql
├── backend/
│   ├── Dockerfile
│   ├── package.json
│   └── src/
│       ├── server.js
│       ├── db.js
│       ├── repositories.js
│       ├── errors.js
│       ├── middleware/
│       │   └── auth.js
│       └── utils/
│           ├── ids.js
│           └── password.js
└── frontend/
    ├── Dockerfile
    ├── ENDPOINTS.md
    ├── README.md
    ├── index.html
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── index.css
        ├── router/
        ├── layouts/
        ├── pages/
        ├── components/
        ├── hooks/
        ├── services/
        ├── utils/
        ├── types/
        ├── mocks/
        └── assets/
```

Pastas principais:

| Pasta/arquivo | Camada | Função | Arquivos importantes |
|---|---|---|---|
| `frontend/` | Frontend | Aplicação React/Vite. | `src/main.jsx`, `src/router/AppRouter.jsx`, `src/services/apiClient.js`. |
| `frontend/src/pages/` | Frontend | Telas roteáveis. | `CatalogPage.jsx`, `RestaurantDetailPage.jsx`, `FeedPage.jsx`, `MyProfilePage.jsx`. |
| `frontend/src/components/common/` | Frontend | Componentes de domínio reutilizáveis. | `RestaurantCard.jsx`, `RestaurantFilters.jsx`, `ReviewForm.jsx`, `FeedActivityCard.jsx`. |
| `frontend/src/components/ui/` | Frontend | Componentes visuais base. | `Button.jsx`, `Input.jsx`, `Tabs.jsx`, `Badge.jsx`, `Avatar.jsx`. |
| `frontend/src/services/` | Frontend | Cliente HTTP e services por domínio. | `apiClient.js`, `authService.js`, `restaurantService.js`, `reviewService.js`, `userService.js`, `socialService.js`. |
| `frontend/src/hooks/` | Frontend | Estado global/local reutilizável. | `useAuth.jsx`, `useAsyncData.js`, `useDebouncedValue.js`. |
| `frontend/src/mocks/` | Frontend/legado | Dados e banco mockado em memória. | `seed.js`, `mockDb.js`. Não são importados pela aplicação atual. |
| `backend/` | Backend | API Node/Express. | `src/server.js`, `src/repositories.js`, `src/db.js`. |
| `backend/src/middleware/` | Backend | Middlewares Express. | `auth.js`. |
| `backend/src/utils/` | Backend | Utilitários de senha e ID. | `password.js`, `ids.js`. |
| `db/` | Banco | Bootstrap SQL do PostgreSQL. | `init.sql`. |
| raiz | Configuração/docs | Docker, env, guias e README. | `docker-compose.yml`, `.env.example`, `README.md`, `style_guide.md`. |

Observação: existem `node_modules/` e `frontend/dist/` no workspace local, mas são dependências/build gerado e não devem ser tratados como fonte principal.

## 4. Como o frontend funciona

O ponto de entrada do frontend está em `frontend/src/main.jsx`. Ele monta o React em `#root`, importa `index.css`, envolve a aplicação com `AuthProvider` e renderiza `App`.

`frontend/src/App.jsx` apenas delega para `AppRouter`.

O roteamento está em `frontend/src/router/AppRouter.jsx`, usando `BrowserRouter`, `Routes`, `Route`, `Navigate` e `Outlet`.

Há dois wrappers de rota:

- `ProtectedRoute`: exige sessão autenticada; se não houver sessão, redireciona para `/login`.
- `PublicOnlyRoute`: impede usuário autenticado de acessar landing/login/cadastro; redireciona para `/catalogo`.

O estado de autenticação fica em `frontend/src/hooks/useAuth.jsx`, que:

- lê token salvo no `localStorage`;
- valida sessão com `authService.getSession()`;
- busca perfil com `userService.getMe()`;
- expõe `login`, `register`, `logout`, `refreshMe` e `setMe`.

As chamadas HTTP ficam em `frontend/src/services/apiClient.js`. A variável `VITE_API_URL` define a base da API; por padrão é `http://localhost:3001`. O token JWT é salvo em `localStorage` com a chave `garfada.auth.token`.

Estados de tela são controlados principalmente com `useState`, `useEffect`, `useMemo`, `useCallback` e o hook local `useAsyncData`. Não foi encontrado gerenciador global externo.

### Tabela de páginas/telas

| Página/Tela | Rota | Arquivo provável | Função da página | Dados usados |
|---|---|---|---|---|
| Landing | `/` | `frontend/src/pages/LandingPage.jsx` | Página pública de apresentação e CTA. | Dados estáticos locais. |
| Cadastro | `/cadastro` | `frontend/src/pages/RegisterPage.jsx` | Cria usuário e sessão. | `POST /api/auth/register`. |
| Login | `/login` | `frontend/src/pages/LoginPage.jsx` | Autentica usuário. | `POST /api/auth/login`. |
| Catálogo | `/catalogo` | `frontend/src/pages/CatalogPage.jsx` | Lista restaurantes com filtros e ações de wishlist/visitado. | `GET /api/restaurants`, `GET /api/me/wishlist`, `GET /api/me/visited`. |
| Detalhe de restaurante | `/restaurantes/:id` | `frontend/src/pages/RestaurantDetailPage.jsx` | Mostra fotos, cardápio, estatísticas, reviews e ações. | `GET /api/restaurants/:id`, `GET /api/restaurants/:id/reviews`, wishlist, visitados, `POST /reviews`. |
| Lista de desejos | `/lista-desejos` | `frontend/src/pages/WishlistPage.jsx` | Exibe restaurantes salvos. | `GET /api/me/wishlist`, `GET /api/me/visited`. |
| Visitados | `/visitados` | `frontend/src/pages/VisitedPage.jsx` | Exibe restaurantes visitados. | `GET /api/me/visited`, `GET /api/me/wishlist`. |
| Meu perfil | `/meu-perfil` | `frontend/src/pages/MyProfilePage.jsx` | Mostra perfil próprio, estatísticas e coleções. | `GET /api/me`, `GET /api/me/collections`. |
| Editar perfil | `/perfil/editar` | `frontend/src/pages/EditProfilePage.jsx` | Atualiza nome, username, bio, avatarUrl e culinárias favoritas. | `PUT /api/me`. |
| Perfil de usuário | `/usuarios/:id` | `frontend/src/pages/UserProfilePage.jsx` | Mostra perfil público, coleções e seguir/deixar de seguir. | `GET /api/users/:id`, `GET /api/users/:id/collections`, `POST/DELETE follow`. |
| Feed | `/feed` | `frontend/src/pages/FeedPage.jsx` | Mostra atividades e busca usuários. | `GET /api/feed`, `GET /api/users/search`. |
| Not found | `*` | `frontend/src/pages/NotFoundPage.jsx` | Fallback de rota inexistente. | Nenhum dado remoto. |

### Página importante: `frontend/src/pages/CatalogPage.jsx`

Responsabilidade: listar restaurantes e permitir filtros por busca, localização, cozinha, faixa de preço e avaliação mínima.

Componentes usados:

- `PageHeading`
- `RestaurantFilters`
- `RestaurantCard`
- `RestaurantCardSkeleton`
- `EmptyState`
- `ErrorState`
- `Button`

Estados principais:

- `filters`: objeto com `search`, `location`, `cuisine`, `priceRange`, `minRating`.
- `feedbackMessage`: mensagem curta após salvar/remover/marcar visita.
- `data`, `loading`, `error`: vindos de `useAsyncData`.

Funções principais:

- `updateFilter(field, value)`: altera um filtro.
- `resetFilters()`: volta aos filtros padrão.
- `loadCatalog()`: busca restaurantes, wishlist e visitados em paralelo.
- `handleToggleWishlist(restaurantId)`: chama toggle de wishlist e atualiza IDs locais.
- `handleToggleVisited(restaurantId)`: chama toggle de visitados e atualiza IDs locais.

Fluxo:

`CatalogPage` calcula filtros debounced com `useDebouncedValue`, monta `requestFilters`, chama `restaurantService.list(requestFilters)` e também busca `getWishlist()`/`getVisited()` para saber quais cards estão ativos. Depois renderiza `RestaurantCard` com `isWishlisted` e `isVisited`.

### Página importante: `frontend/src/pages/RestaurantDetailPage.jsx`

Responsabilidade: exibir um restaurante completo, avaliações, galeria, cardápio, estatísticas e ações de usuário.

Componentes usados:

- `PageHeading`
- `StatsGrid`
- `ReviewForm`
- `ReviewCard`
- `Badge`
- `Button`
- `LoadingState`, `ErrorState`, `EmptyState`

Estados principais:

- `showReviewForm`
- `quickRating`
- `feedbackMessage`
- `data` com `restaurant`, `reviews`, `wishlistIds`, `visitedIds`

Chamadas de API:

- `restaurantService.getById(id)`
- `reviewService.listByRestaurant(id)`
- `restaurantService.getWishlist()`
- `restaurantService.getVisited()`
- `reviewService.create(id, payload)`
- `restaurantService.toggleWishlist(id)`
- `restaurantService.toggleVisited(id)`

Fluxo:

Ao carregar, a página faz quatro requisições em paralelo. Para avaliação, o usuário escolhe nota por estrelas e pode enviar só a nota (`handleSubmitQuickRating`) ou nota + comentário (`handleCreateReview`). Após criar avaliação, a página sincroniza restaurante e reviews de novo para refletir médias e comentários.

### Página importante: `frontend/src/pages/EditProfilePage.jsx`

Responsabilidade: editar dados do usuário autenticado.

Estados principais:

- `form`: `name`, `username`, `bio`, `avatarUrl`, `favoriteCuisines`.
- `errors`
- `isSaving`
- `submitError`

Funções principais:

- `bootstrap()` dentro de `useEffect`: popula o formulário com `me` ou busca `refreshMe()`.
- `handleFileChange()`: cria uma URL temporária com `URL.createObjectURL(file)`.
- `validate()`: exige nome e username, e username com no mínimo 3 caracteres.
- `handleSubmit()`: envia `userService.updateProfile(...)`.

Atenção: o upload de avatar não envia arquivo para servidor/storage. O código apenas gera uma URL temporária local e salva o texto em `avatarUrl`. Não foi possível identificar com certeza a partir do código analisado uma implementação real de upload persistente de imagem.

### Página importante: `frontend/src/pages/FeedPage.jsx`

Responsabilidade: renderizar feed de atividades e sugestões/busca de usuários.

Chamadas:

- `socialService.getFeed()` → `GET /api/feed`
- `socialService.searchUsers(debouncedQuery)` → `GET /api/users/search?q=...`
- `socialService.followUser(userId)` → tenta `POST /api/users/:id/follow`; em conflito, faz `DELETE`.

O backend retorna o feed global mais recente; não foi encontrado filtro do feed somente por usuários seguidos.

### Serviços HTTP

| Service | Arquivo | Responsabilidade |
|---|---|---|
| `apiClient` | `frontend/src/services/apiClient.js` | Monta URL base, serializa JSON, anexa Bearer token, trata erro HTTP. |
| `authService` | `frontend/src/services/authService.js` | Login, cadastro, logout e bootstrap de sessão. |
| `restaurantService` | `frontend/src/services/restaurantService.js` | Catálogo, detalhe, wishlist e visitados. |
| `reviewService` | `frontend/src/services/reviewService.js` | Listagem e criação/upsert de avaliações. |
| `userService` | `frontend/src/services/userService.js` | Perfil próprio, perfil público e coleções. |
| `socialService` | `frontend/src/services/socialService.js` | Feed, busca de usuários e follow/unfollow. |

## 5. Como o backend funciona

O backend está concentrado em `backend/src/server.js` e `backend/src/repositories.js`.

Arquitetura encontrada:

- `server.js`: cria o app Express, configura CORS/JSON, define rotas, faz validações básicas de payload e tratamento global de erro.
- `repositories.js`: concentra a camada de acesso ao banco e a maior parte da regra de negócio transacional.
- `db.js`: cria `Pool` do `pg`, expõe `query`, `checkConnection` e `transaction`.
- `middleware/auth.js`: gera JWT e valida `Authorization: Bearer <token>`.
- `utils/password.js`: faz hash e verificação de senha com PBKDF2.
- `errors.js`: define `AppError` e helper para violação de unicidade.

Não há separação formal em arquivos de routes/controllers/services. Os handlers das rotas ficam diretamente em `server.js`, e os services/repositories ficam em `repositories.js`.

### Tabela de endpoints encontrados

| Método | Endpoint/Rota | Arquivo | O que faz | Entrada esperada | Saída esperada |
|---|---|---|---|---|---|
| GET | `/health` | `backend/src/server.js` | Verifica conexão com banco. | Nenhuma. | `{ ok, service }` ou erro 503. |
| POST | `/api/auth/register` | `backend/src/server.js` | Cria usuário e sessão. | Body `name`, `email`, `username`, `password`. | `201 { token, user }`. |
| POST | `/api/auth/login` | `backend/src/server.js` | Autentica por email ou username. | Body `identifier`, `password`. | `200 { token, user }`. |
| GET | `/api/auth/me` | `backend/src/server.js` | Retorna usuário autenticado básico. | Bearer token. | Objeto de usuário autenticado. |
| GET | `/api/restaurants` | `backend/src/server.js` | Lista restaurantes filtrados. | Query `search`, `location`, `cuisine`, `priceRange`, `minRating`. | Lista de restaurantes com stats. |
| GET | `/api/restaurants/:id` | `backend/src/server.js` | Detalhe de restaurante. | Param `id`. | Restaurante ou 404. |
| GET | `/api/restaurants/:id/reviews` | `backend/src/server.js` | Lista reviews de um restaurante. | Param `id`. | Lista de reviews com usuário. |
| POST | `/api/restaurants/:id/reviews` | `backend/src/server.js` | Cria ou atualiza avaliação do usuário. | Bearer token; body `rating`, `comment`. | `201` review criada/atualizada. |
| GET | `/api/me/wishlist` | `backend/src/server.js` | Lista wishlist do usuário logado. | Bearer token. | Lista com restaurantes. |
| POST | `/api/restaurants/:id/wishlist` | `backend/src/server.js` | Adiciona restaurante à wishlist. | Bearer token; param `id`. | `201 { active: true, item }`. |
| DELETE | `/api/restaurants/:id/wishlist` | `backend/src/server.js` | Remove restaurante da wishlist. | Bearer token; param `id`. | `200 { active: false }`. |
| GET | `/api/me/visited` | `backend/src/server.js` | Lista restaurantes visitados. | Bearer token. | Lista com restaurantes. |
| POST | `/api/restaurants/:id/visited` | `backend/src/server.js` | Marca restaurante como visitado. | Bearer token; param `id`; body opcional `userRating`. | `201 { active: true, item }`. |
| DELETE | `/api/restaurants/:id/visited` | `backend/src/server.js` | Remove restaurante de visitados. | Bearer token; param `id`. | `200 { active: false }`. |
| GET | `/api/me` | `backend/src/server.js` | Perfil completo do usuário logado. | Bearer token. | Perfil com contadores. |
| PUT | `/api/me` | `backend/src/server.js` | Atualiza perfil do usuário logado. | Bearer token; campos opcionais de perfil. | Perfil atualizado. |
| GET | `/api/me/collections` | `backend/src/server.js` | Retorna reviews, wishlist e visitados do usuário logado. | Bearer token. | `{ reviews, wishlist, visited }`. |
| GET | `/api/feed` | `backend/src/server.js` | Lista feed de atividades recentes. | Bearer token. | Lista de eventos com usuário/restaurante/review. |
| GET | `/api/users/search` | `backend/src/server.js` | Busca usuários por nome/username. | Bearer token; query `q`. | Lista de usuários com `isFollowing`. |
| POST | `/api/users/:id/follow` | `backend/src/server.js` | Segue usuário. | Bearer token; param `id`. | `201 { isFollowing: true, followersCount }`. |
| DELETE | `/api/users/:id/follow` | `backend/src/server.js` | Deixa de seguir usuário. | Bearer token; param `id`. | `200 { isFollowing: false, followersCount }`. |
| GET | `/api/users/:id/collections` | `backend/src/server.js` | Coleções de outro usuário. | Bearer token; param `id`. | `{ reviews, wishlist, visited }`. |
| GET | `/api/users/:id` | `backend/src/server.js` | Perfil público de outro usuário. | Bearer token; param `id`. | Perfil com stats e `isFollowing`. |

### Endpoint importante: `POST /api/auth/register`

- Método: `POST`
- Caminho: `/api/auth/register`
- Arquivo: `backend/src/server.js`
- Função de banco: `repositories.createUser(...)`
- Entrada: `name`, `email`, `username`, `password`.
- Validações:
  - campos obrigatórios;
  - email com regex simples;
  - username com no mínimo 3 caracteres;
  - senha com no mínimo 6 caracteres.
- Operações:
  - `hashPassword(password)` em `backend/src/utils/password.js`;
  - `INSERT INTO users` em `repositories.createUser`;
  - geração de avatar default por URL `https://i.pravatar.cc/160?u=...`;
  - retorno de JWT via `buildSessionResponse`.
- Possíveis erros:
  - 400 por payload inválido;
  - 409 por email/username já existentes.

### Endpoint importante: `POST /api/restaurants/:id/reviews`

- Método: `POST`
- Caminho: `/api/restaurants/:id/reviews`
- Arquivo: `backend/src/server.js`
- Middleware: `requireAuth`
- Função chamada: `repositories.upsertReview(...)`
- Entrada: param `id`, body `rating`, `comment`.
- Validações:
  - nota numérica entre 1 e 5;
  - restaurante existe em `ensureRestaurantExists`.
- Operações no banco:
  - transação;
  - `INSERT INTO reviews ... ON CONFLICT (user_id, restaurant_id) DO UPDATE`;
  - `INSERT INTO feed_events` com tipo `review`.
- Resposta: review com `id`, `restaurantId`, `userId`, `rating`, `comment`, `createdAt`.
- Possíveis erros:
  - 400 nota inválida;
  - 401 sem token;
  - 404 restaurante não encontrado.

### Endpoint importante: `PUT /api/me`

- Método: `PUT`
- Caminho: `/api/me`
- Arquivo: `backend/src/server.js`
- Funções chamadas:
  - `sanitizeProfileUpdatePayload`
  - `repositories.updateMeProfile`
- Entrada: campos opcionais `name`, `username`, `bio`, `avatarUrl`, `favoriteCuisines`.
- Validações:
  - `name` e `username`, se enviados, não podem ficar vazios;
  - `username` precisa ter ao menos 3 caracteres;
  - `bio` e `avatarUrl` devem ser texto;
  - `favoriteCuisines` deve ser lista.
- Operações:
  - `UPDATE users`;
  - se houver `favoriteCuisines`, apaga preferências antigas e reinsere em `user_favorite_cuisines`;
  - cria cozinhas novas em `cuisines` quando necessário.
- Resposta: perfil atualizado com contadores.

### Endpoint importante: `POST /api/users/:id/follow`

- Método: `POST`
- Caminho: `/api/users/:id/follow`
- Arquivo: `backend/src/server.js`
- Função chamada: `repositories.followUser`
- Entrada: usuário autenticado e `id` do usuário alvo.
- Validações:
  - usuário não pode seguir a si mesmo;
  - usuário alvo precisa existir.
- Operações:
  - `INSERT INTO user_follows`;
  - `INSERT INTO feed_events` com tipo `follow`;
  - consulta `v_user_stats` para novo total de seguidores.
- Possíveis erros:
  - 400 self-follow;
  - 404 usuário alvo inexistente;
  - 409 já segue este usuário.

## 6. Banco de dados

O banco é definido em `db/init.sql`. O arquivo faz `DROP VIEW`, `DROP TABLE`, cria tabelas, índices, views e insere seeds. Isso é adequado para bootstrap local, mas não é uma estratégia de migrations incrementais para produção.

Views encontradas:

- `v_restaurant_stats`: agrega média de avaliações, quantidade de reviews, comentários e visitas por restaurante.
- `v_user_stats`: agrega reviews, visitados, wishlist, seguidores e seguindo por usuário.

Não foram encontradas políticas RLS, triggers ou stored procedures/functions SQL.

### Tabela: `users`

| Coluna | Tipo | Obrigatória? | Descrição provável |
|---|---|---|---|
| `id` | `TEXT` | Sim | Identificador do usuário, gerado pela aplicação. |
| `name` | `TEXT` | Sim | Nome exibido. |
| `email` | `TEXT` | Sim | Email de login. |
| `username` | `TEXT` | Sim | Nome público único. |
| `password_hash` | `TEXT` | Sim | Hash PBKDF2 da senha. |
| `avatar_url` | `TEXT` | Não | URL do avatar. |
| `bio` | `TEXT` | Sim | Bio do perfil, default `''`. |
| `created_at` | `TIMESTAMPTZ` | Sim | Data de criação. |
| `updated_at` | `TIMESTAMPTZ` | Sim | Data de atualização. |

Chave primária: `id`.

Índices/constraints:

- `ux_users_email_ci` em `LOWER(email)`;
- `ux_users_username_ci` em `LOWER(username)`;
- checks para nome, email e username não vazios.

Uso: autenticação, perfil, autoria de reviews, follows, wishlist, visitados e feed.

### Tabela: `cuisines`

| Coluna | Tipo | Obrigatória? | Descrição provável |
|---|---|---|---|
| `id` | `BIGINT GENERATED BY DEFAULT AS IDENTITY` | Sim | Identificador da cozinha. |
| `name` | `TEXT` | Sim | Nome da culinária/cozinha. |

Chave primária: `id`.

Constraints:

- `name` único;
- check para nome não vazio.

Uso: categoriza restaurantes e preferências de usuários.

### Tabela: `user_favorite_cuisines`

| Coluna | Tipo | Obrigatória? | Descrição provável |
|---|---|---|---|
| `user_id` | `TEXT` | Sim | FK para `users.id`. |
| `cuisine_id` | `BIGINT` | Sim | FK para `cuisines.id`. |

Chave primária: `(user_id, cuisine_id)`.

Relacionamentos:

- `user_id` → `users(id)` com `ON DELETE CASCADE`;
- `cuisine_id` → `cuisines(id)` com `ON DELETE CASCADE`.

Índice: `idx_user_favorite_cuisines_cuisine_id`.

Uso: lista de culinárias favoritas exibidas no perfil.

### Tabela: `restaurants`

| Coluna | Tipo | Obrigatória? | Descrição provável |
|---|---|---|---|
| `id` | `TEXT` | Sim | Identificador do restaurante. |
| `name` | `TEXT` | Sim | Nome do restaurante. |
| `cuisine_id` | `BIGINT` | Sim | FK para `cuisines.id`. |
| `price_range` | `TEXT` | Sim | Faixa de preço: `$`, `$$`, `$$$`, `$$$$`. |
| `description` | `TEXT` | Sim | Descrição do restaurante. |
| `address` | `TEXT` | Sim | Endereço. |
| `created_at` | `TIMESTAMPTZ` | Sim | Data de criação. |
| `updated_at` | `TIMESTAMPTZ` | Sim | Data de atualização. |

Chave primária: `id`.

Relacionamento:

- `cuisine_id` → `cuisines(id)` com `ON DELETE RESTRICT`.

Índices:

- `idx_restaurants_cuisine_id`;
- `idx_restaurants_price_range`;
- `idx_restaurants_name_lower`;
- `idx_restaurants_address_lower`.

Uso: entidade principal do catálogo.

### Tabela: `restaurant_photos`

| Coluna | Tipo | Obrigatória? | Descrição provável |
|---|---|---|---|
| `id` | `BIGINT GENERATED BY DEFAULT AS IDENTITY` | Sim | Identificador da foto. |
| `restaurant_id` | `TEXT` | Sim | FK para restaurante. |
| `photo_url` | `TEXT` | Sim | URL da foto. |
| `sort_order` | `INTEGER` | Sim | Ordem de exibição. |

Chave primária: `id`.

Constraints:

- FK `restaurant_id` → `restaurants(id)` com `ON DELETE CASCADE`;
- `sort_order >= 1`;
- `UNIQUE (restaurant_id, sort_order)`.

Uso: galeria de restaurantes e imagem dos cards.

### Tabela: `restaurant_menu_items`

| Coluna | Tipo | Obrigatória? | Descrição provável |
|---|---|---|---|
| `id` | `BIGINT GENERATED BY DEFAULT AS IDENTITY` | Sim | Identificador do item. |
| `restaurant_id` | `TEXT` | Sim | FK para restaurante. |
| `item_name` | `TEXT` | Sim | Nome do prato/item. |
| `price_label` | `TEXT` | Sim | Preço formatado como texto. |
| `sort_order` | `INTEGER` | Sim | Ordem de exibição. |

Chave primária: `id`.

Constraints:

- FK `restaurant_id` → `restaurants(id)` com `ON DELETE CASCADE`;
- `UNIQUE (restaurant_id, sort_order)`;
- checks de texto não vazio e `sort_order >= 1`.

Uso: prévia de cardápio no detalhe do restaurante.

### Tabela: `reviews`

| Coluna | Tipo | Obrigatória? | Descrição provável |
|---|---|---|---|
| `id` | `TEXT` | Sim | Identificador da avaliação. |
| `restaurant_id` | `TEXT` | Sim | FK para restaurante. |
| `user_id` | `TEXT` | Sim | FK para usuário autor. |
| `rating` | `NUMERIC(2,1)` | Sim | Nota de 1 a 5. |
| `comment` | `TEXT` | Sim | Comentário textual, default `''`. |
| `created_at` | `TIMESTAMPTZ` | Sim | Data de criação. |
| `updated_at` | `TIMESTAMPTZ` | Sim | Data de atualização. |

Chave primária: `id`.

Relacionamentos:

- `restaurant_id` → `restaurants(id)` com `ON DELETE CASCADE`;
- `user_id` → `users(id)` com `ON DELETE CASCADE`.

Constraints/índices:

- nota entre 1 e 5;
- `UNIQUE (user_id, restaurant_id)`, permitindo uma review por usuário/restaurante;
- `idx_reviews_restaurant_created_at`;
- `idx_reviews_user_created_at`.

Uso: avaliações públicas e cálculo de estatísticas.

### Tabela: `wishlist_items`

| Coluna | Tipo | Obrigatória? | Descrição provável |
|---|---|---|---|
| `user_id` | `TEXT` | Sim | FK para usuário. |
| `restaurant_id` | `TEXT` | Sim | FK para restaurante. |
| `added_at` | `TIMESTAMPTZ` | Sim | Data em que foi salvo. |

Chave primária: `(user_id, restaurant_id)`.

Relacionamentos:

- `user_id` → `users(id)` com `ON DELETE CASCADE`;
- `restaurant_id` → `restaurants(id)` com `ON DELETE CASCADE`.

Índices:

- `idx_wishlist_items_user_added_at`;
- `idx_wishlist_items_restaurant_id`.

Uso: lista de desejos.

### Tabela: `visited_restaurants`

| Coluna | Tipo | Obrigatória? | Descrição provável |
|---|---|---|---|
| `user_id` | `TEXT` | Sim | FK para usuário. |
| `restaurant_id` | `TEXT` | Sim | FK para restaurante. |
| `visited_at` | `TIMESTAMPTZ` | Sim | Data da marcação de visita. |
| `user_rating` | `NUMERIC(2,1)` | Não | Nota pessoal da visita. |

Chave primária: `(user_id, restaurant_id)`.

Constraints:

- `user_rating` nulo ou entre 1 e 5.

Índices:

- `idx_visited_restaurants_user_visited_at`;
- `idx_visited_restaurants_restaurant_id`.

Uso: histórico de visitas do usuário e contagem de visitas por restaurante.

### Tabela: `user_follows`

| Coluna | Tipo | Obrigatória? | Descrição provável |
|---|---|---|---|
| `follower_user_id` | `TEXT` | Sim | Usuário que segue. |
| `followed_user_id` | `TEXT` | Sim | Usuário seguido. |
| `created_at` | `TIMESTAMPTZ` | Sim | Data do follow. |

Chave primária: `(follower_user_id, followed_user_id)`.

Relacionamentos:

- ambos referenciam `users(id)` com `ON DELETE CASCADE`.

Constraints/índices:

- `follower_user_id <> followed_user_id`;
- `idx_user_follows_followed_user_id`.

Uso: relação social e estatísticas de seguidores/seguindo.

### Tabela: `feed_events`

| Coluna | Tipo | Obrigatória? | Descrição provável |
|---|---|---|---|
| `id` | `TEXT` | Sim | Identificador do evento. |
| `type` | `TEXT` | Sim | `review`, `visited`, `wishlist` ou `follow`. |
| `user_id` | `TEXT` | Sim | Usuário que gerou evento. |
| `target_user_id` | `TEXT` | Não | Usuário alvo para evento de follow. |
| `restaurant_id` | `TEXT` | Não | Restaurante envolvido. |
| `review_id` | `TEXT` | Não | Review envolvida. |
| `created_at` | `TIMESTAMPTZ` | Sim | Data do evento. |

Chave primária: `id`.

Constraints:

- tipo limitado a `review`, `visited`, `wishlist`, `follow`;
- `target_user_id` não pode ser o próprio `user_id`;
- `feed_events_payload_chk` exige combinação válida de colunas conforme o tipo.

Índices:

- `idx_feed_events_created_at_desc`;
- `idx_feed_events_user_created_at`;
- `idx_feed_events_target_user_created_at`;
- `idx_feed_events_restaurant_created_at`.

Uso: feed social.

## 7. Fluxo dos dados no sistema

### Fluxo: login

Usuário → `LoginPage` → `handleSubmit` → `useAuth.login` → `authService.login` → `POST /api/auth/login` → `repositories.findUserForAuthByIdentifier` → `users` → `verifyPassword` → JWT → `localStorage` → redirecionamento para `/catalogo`.

Detalhes:

1. O usuário preenche email/username e senha em `frontend/src/pages/LoginPage.jsx`.
2. `validate()` confere campos obrigatórios.
3. `useAuth.login()` chama `authService.login()`.
4. `authService.login()` envia `identifier` e `password` para `/api/auth/login`.
5. O backend busca o usuário por `LOWER(email)` ou `LOWER(username)`.
6. `verifyPassword` compara PBKDF2 com `crypto.timingSafeEqual`.
7. O backend retorna `{ token, user }`.
8. O frontend salva o token e busca `/api/me`.
9. A UI navega para `/catalogo`.

### Fluxo: listagem do catálogo com filtros

Usuário → `CatalogPage`/`RestaurantFilters` → `updateFilter` → `useDebouncedValue` → `restaurantService.list` → `GET /api/restaurants` → `repositories.listRestaurants` → `restaurants`, `cuisines`, `v_restaurant_stats`, fotos e menu → lista JSON → grid de `RestaurantCard`.

Detalhes:

1. Usuário altera filtros.
2. Busca/localização passam por debounce de 400ms.
3. `loadCatalog` chama em paralelo:
   - `GET /api/restaurants?...`
   - `GET /api/me/wishlist`
   - `GET /api/me/visited`
4. O backend monta condições SQL dinamicamente.
5. O SQL retorna cada restaurante como JSON com `photos`, `menuPreview` e `stats`.
6. O frontend cruza IDs de wishlist/visitados e renderiza estados ativos nos cards.

### Fluxo: criação/atualização de avaliação

Usuário → `RestaurantDetailPage` → estrelas + `ReviewForm` ou botão `Avaliar` → `reviewService.create` → `POST /api/restaurants/:id/reviews` → `repositories.upsertReview` → `reviews` + `feed_events` → resposta → `syncDetailData` → UI atualizada.

Detalhes:

1. Usuário escolhe nota entre 1 e 5.
2. Pode publicar só nota ou nota com comentário.
3. Frontend valida nota em `reviewService.create`.
4. Backend valida nota e autenticação.
5. `upsertReview` abre transação.
6. A review é inserida ou atualizada por `ON CONFLICT (user_id, restaurant_id)`.
7. Um evento `review` é inserido em `feed_events`.
8. Frontend recarrega restaurante e reviews para atualizar médias, contadores e comentários.

### Fluxo: edição de perfil e culinárias favoritas

Usuário → `EditProfilePage` → `handleSubmit` → `userService.updateProfile` → `PUT /api/me` → `sanitizeProfileUpdatePayload` → `repositories.updateMeProfile` → `users`, `cuisines`, `user_favorite_cuisines`, `v_user_stats` → perfil atualizado → `setMe` → navegação para `/meu-perfil`.

Detalhes:

1. A página carrega dados de `me` ou chama `refreshMe`.
2. Usuário edita campos.
3. `favoriteCuisines` é convertido de texto separado por vírgulas para array.
4. Backend valida tipos e campos mínimos.
5. `UPDATE users` atualiza dados textuais.
6. Se `favoriteCuisines` foi enviado:
   - apaga preferências anteriores;
   - cria cozinhas ausentes;
   - insere relações em `user_favorite_cuisines`.
7. Backend retorna perfil com stats.
8. Frontend atualiza o contexto de autenticação.

### Fluxo: seguir usuário

Usuário → `FeedPage` ou `UserProfilePage` → botão `Seguir` → `socialService.followUser` → `POST /api/users/:id/follow` → `repositories.followUser` → `user_follows` + `feed_events` → contagem em `v_user_stats` → UI atualizada.

Detalhes:

1. Usuário clica em seguir.
2. Backend impede seguir a si mesmo.
3. Insere relação em `user_follows`.
4. Cria evento `follow`.
5. Retorna `isFollowing` e `followersCount`.
6. Frontend atualiza perfil ou recarrega feed/sugestões.

## 8. Arquivos importantes do projeto

| Arquivo | Camada | O que implementa | Por que é importante |
|---|---|---|---|
| `frontend/src/main.jsx` | Frontend | Bootstrap React e `AuthProvider`. | Ponto de entrada real da SPA. |
| `frontend/src/router/AppRouter.jsx` | Frontend | Rotas públicas/protegidas. | Define todas as telas acessíveis. |
| `frontend/src/hooks/useAuth.jsx` | Frontend | Contexto de autenticação. | Controla sessão, usuário logado e logout. |
| `frontend/src/services/apiClient.js` | Frontend | Cliente HTTP com token. | Todas as chamadas ao backend passam por ele. |
| `frontend/src/pages/CatalogPage.jsx` | Frontend | Catálogo filtrável. | Tela central de descoberta. |
| `frontend/src/pages/RestaurantDetailPage.jsx` | Frontend | Detalhe e avaliação. | Concentra review, wishlist e visitados. |
| `backend/src/server.js` | Backend | Express app e endpoints. | Entrada da API. |
| `backend/src/repositories.js` | Backend | Queries SQL e regras de negócio. | Camada mais crítica de dados. |
| `backend/src/db.js` | Backend | Pool e transações PostgreSQL. | Base do acesso ao banco. |
| `backend/src/middleware/auth.js` | Backend | JWT e middleware `requireAuth`. | Protege endpoints autenticados. |
| `backend/src/utils/password.js` | Backend | Hash/verificação de senha. | Segurança de autenticação. |
| `db/init.sql` | Banco | Schema, índices, views e seeds. | Define o modelo de dados. |
| `docker-compose.yml` | Infra | Sobe banco, backend e frontend. | Caminho principal de execução local completa. |
| `.env.example` | Config | Variáveis esperadas. | Base para ambiente local. |

### Arquivo: `backend/src/server.js`

Objetivo: iniciar Express, configurar CORS e JSON, declarar rotas REST e padronizar erros.

Principais imports:

- `express`, `cors`, `dotenv`;
- `db`;
- `repositories`;
- `AppError`;
- `signAccessToken`, `requireAuth`;
- `hashPassword`, `verifyPassword`.

Principais funções locais:

- `asyncHandler`: captura rejeições de promises e passa para middleware de erro.
- `trimOrEmpty`: normaliza strings de request.
- `buildSessionResponse`: retorna `{ token, user }`.
- `sanitizeProfileUpdatePayload`: valida payload do `PUT /api/me`.

O que entender antes de modificar:

- O arquivo mistura camada HTTP e validações. Alterações de contrato devem ser espelhadas nos services do frontend.
- Endpoints autenticados precisam usar `requireAuth`.
- Erros de domínio devem usar `AppError` para status adequado.

### Arquivo: `backend/src/repositories.js`

Objetivo: concentrar acesso ao PostgreSQL e regras de negócio relacionadas a usuário, restaurante, avaliações, coleções e feed.

Principais constantes SQL:

- `FAVORITE_CUISINES_SQL`: subconsulta JSON para culinárias favoritas.
- `RESTAURANT_JSON_SQL`: constrói JSON completo de restaurante com fotos, menu e stats.

Principais funções:

- `createUser`
- `updateMeProfile`
- `listRestaurants`
- `upsertReview`
- `addWishlistItem`
- `addVisitedItem`
- `followUser`
- `listFeed`

O que entender antes de modificar:

- Muitas operações usam transação (`db.transaction`) para manter consistência entre entidade principal e `feed_events`.
- A API depende dos aliases SQL em camelCase (`"restaurantId"`, `"avatarUrl"` etc.) para casar com o frontend.
- `RESTAURANT_JSON_SQL` é reutilizado em várias consultas; mudanças nele afetam catálogo, detalhe, wishlist, visitados e coleções.

### Arquivo: `frontend/src/services/apiClient.js`

Objetivo: abstrair `fetch`, base URL, headers, JSON e erros.

Principais funções:

- `buildUrl(path)`;
- `readPayload(response)`;
- `getStoredToken`, `setStoredToken`, `clearStoredToken`;
- `apiRequest(path, options)`;
- `apiClient.get/post/put/delete`.

O que entender antes de modificar:

- `auth` é `true` por padrão; endpoints públicos passam `{ auth: false }`.
- Erros HTTP viram `ApiError` com `status` e `payload`.
- `VITE_API_URL` é lida de `import.meta.env`.

### Arquivo: `db/init.sql`

Objetivo: criar toda a estrutura local do banco e popular seeds.

Conteúdo:

- `DROP VIEW` e `DROP TABLE`;
- `CREATE TABLE` para 10 tabelas;
- índices;
- views agregadas;
- inserts iniciais de usuários, cozinhas, restaurantes, fotos, cardápio, reviews, wishlist, visitados, follows e feed.

O que entender antes de modificar:

- Reexecutar esse arquivo recria tudo do zero.
- Alterar tabelas exige atualizar `backend/src/repositories.js` e possivelmente `frontend/src/types/models.js`.
- Não há migrations incrementais; cuidado para não tratar `init.sql` como migração reversível.

## 9. Funções importantes

| Função | Arquivo | Responsabilidade | Entrada | Saída |
|---|---|---|---|---|
| `apiRequest` | `frontend/src/services/apiClient.js` | Executar HTTP, serializar JSON, anexar token e tratar erros. | `path`, `options`. | Payload JSON ou lança `ApiError`. |
| `AuthProvider` | `frontend/src/hooks/useAuth.jsx` | Manter sessão e usuário autenticado. | `children`. | Contexto React. |
| `useAsyncData` | `frontend/src/hooks/useAsyncData.js` | Carregar dados assíncronos com loading/error/reload. | `fetcher`. | `{ data, setData, loading, error, reload }`. |
| `CatalogPage` | `frontend/src/pages/CatalogPage.jsx` | Tela de catálogo e filtros. | Nenhuma direta. | JSX. |
| `RestaurantDetailPage` | `frontend/src/pages/RestaurantDetailPage.jsx` | Detalhe, avaliação e ações de restaurante. | Param `id`. | JSX. |
| `sanitizeProfileUpdatePayload` | `backend/src/server.js` | Validar payload de perfil. | Body da request. | Objeto sanitizado ou `AppError`. |
| `requireAuth` | `backend/src/middleware/auth.js` | Validar JWT Bearer. | `req`, `res`, `next`. | `req.auth` ou erro 401. |
| `hashPassword` | `backend/src/utils/password.js` | Gerar hash PBKDF2. | Senha em texto. | Hash codificado. |
| `verifyPassword` | `backend/src/utils/password.js` | Verificar senha contra hash. | Senha e hash. | Boolean. |
| `createUser` | `backend/src/repositories.js` | Inserir usuário. | Dados de usuário. | Usuário sem senha. |
| `listRestaurants` | `backend/src/repositories.js` | Consultar catálogo com filtros. | Objeto de filtros. | Lista de restaurantes. |
| `upsertReview` | `backend/src/repositories.js` | Criar/atualizar review e feed. | `{ userId, restaurantId, rating, comment }`. | Review. |
| `updateMeProfile` | `backend/src/repositories.js` | Atualizar perfil e culinárias favoritas. | `userId`, payload. | Perfil atualizado. |
| `followUser` | `backend/src/repositories.js` | Criar relação social e feed. | `followerUserId`, `followedUserId`. | `{ isFollowing, followersCount }`. |
| `listFeed` | `backend/src/repositories.js` | Buscar eventos recentes do feed. | Opcional executor. | Lista de eventos. |

### Função: `apiRequest`

Local: `frontend/src/services/apiClient.js`.

Passo a passo:

1. Define método padrão `GET`.
2. Adiciona `Content-Type: application/json` se houver body.
3. Se `auth` for verdadeiro, lê token de `localStorage`.
4. Envia request com `fetch`.
5. Lê JSON ou texto da resposta.
6. Se `response.ok` for falso, lança `ApiError`.
7. Retorna payload.

Trecho relevante:

```js
if (auth) {
  const token = getStoredToken()

  if (token) {
    requestHeaders.Authorization = `Bearer ${token}`
  }
}
```

Efeito colateral: nenhuma escrita, exceto chamadas HTTP externas. O token é apenas lido.

### Função: `requireAuth`

Local: `backend/src/middleware/auth.js`.

Passo a passo:

1. Lê header `Authorization`.
2. Extrai token se o esquema for `Bearer`.
3. Valida token com `jwt.verify`.
4. Exige `payload.sub`.
5. Grava `req.auth = { userId, token, tokenPayload }`.
6. Chama `next()`.

Se houver falha, retorna erro 401 com mensagem de sessão inválida/expirada.

### Função: `upsertReview`

Local: `backend/src/repositories.js`.

Passo a passo:

1. Abre transação.
2. Confere se o restaurante existe.
3. Gera novo ID de review.
4. Executa `INSERT INTO reviews`.
5. Em conflito por `(user_id, restaurant_id)`, atualiza nota, comentário e `updated_at`.
6. Cria evento de feed `review`.
7. Retorna a review.

Trecho relevante:

```sql
ON CONFLICT (user_id, restaurant_id)
DO UPDATE SET
  rating = EXCLUDED.rating,
  comment = EXCLUDED.comment,
  updated_at = NOW()
```

Efeitos colaterais: altera `reviews` e insere em `feed_events`.

### Função: `syncFavoriteCuisines`

Local: `backend/src/repositories.js`.

Passo a passo:

1. Sanitiza nomes, removendo duplicados case-insensitive.
2. Remove preferências anteriores do usuário.
3. Busca cozinhas já existentes.
4. Insere cozinhas ausentes com `ON CONFLICT (name) DO NOTHING`.
5. Busca IDs das cozinhas.
6. Insere relações em `user_favorite_cuisines`.

Efeitos colaterais: altera `cuisines` e `user_favorite_cuisines`.

### Função: `listRestaurants`

Local: `backend/src/repositories.js`.

Passo a passo:

1. Recebe filtros opcionais.
2. Monta lista de condições SQL e parâmetros.
3. Faz busca textual em `name`, `description` e `address`.
4. Filtra por localização, cozinha, preço e nota mínima.
5. Usa `RESTAURANT_JSON_SQL` para devolver formato esperado pelo frontend.
6. Ordena por média de rating desc e nome asc.

Tabelas/views acessadas: `restaurants`, `cuisines`, `restaurant_photos`, `restaurant_menu_items`, `v_restaurant_stats`.

### Função: `handleSubmit` em `EditProfilePage`

Local: `frontend/src/pages/EditProfilePage.jsx`.

Passo a passo:

1. Previne submit padrão.
2. Valida nome e username.
3. Monta payload com strings trimadas.
4. Converte culinárias favoritas separadas por vírgula em array.
5. Chama `userService.updateProfile`.
6. Atualiza `me` no contexto.
7. Navega para `/meu-perfil`.

## 10. Consultas SQL e operações no banco

### Operação: checagem de saúde do banco

- Arquivo: `backend/src/db.js`
- Tipo: `SELECT`
- Tabela(s) envolvidas: nenhuma tabela específica.
- Objetivo: confirmar conexão PostgreSQL.
- Quando é executada: `GET /health`.
- Explicação:

```sql
SELECT 1
```

### Operação: criação de usuário

- Arquivo: `backend/src/repositories.js`
- Tipo: `INSERT`
- Tabela(s): `users`
- Objetivo: criar conta.
- Quando é executada: `POST /api/auth/register`.
- Explicação: insere `id`, `name`, `email`, `username`, `password_hash`, `avatar_url`, `bio`; em violação de unicidade, converte para erro 409.

### Operação: login por email ou username

- Arquivo: `backend/src/repositories.js`
- Tipo: `SELECT`
- Tabela(s): `users`
- Objetivo: localizar usuário para autenticação.
- Quando é executada: `POST /api/auth/login`.
- Explicação:

```sql
WHERE LOWER(email) = LOWER($1)
  OR LOWER(username) = LOWER($1)
LIMIT 1
```

### Operação: listagem de restaurantes

- Arquivo: `backend/src/repositories.js`
- Tipo: `SELECT` com `JOIN` e subconsultas JSON.
- Tabela(s): `restaurants`, `cuisines`, `restaurant_photos`, `restaurant_menu_items`, view `v_restaurant_stats`.
- Objetivo: retornar catálogo no formato do frontend.
- Quando é executada: `GET /api/restaurants`.
- Explicação: usa `RESTAURANT_JSON_SQL` com filtros opcionais e ordena por rating médio.

### Operação: detalhe de restaurante

- Arquivo: `backend/src/repositories.js`
- Tipo: `SELECT`
- Tabela(s): `restaurants`, `cuisines`, view `v_restaurant_stats`, subconsultas de fotos/menu.
- Objetivo: carregar um restaurante por ID.
- Quando é executada: `GET /api/restaurants/:id`.

### Operação: listagem de reviews por restaurante

- Arquivo: `backend/src/repositories.js`
- Tipo: `SELECT` com `JOIN`
- Tabela(s): `reviews`, `users`
- Objetivo: exibir comentários e autor.
- Quando é executada: `GET /api/restaurants/:id/reviews`.
- Explicação: retorna review com objeto `user` via `json_build_object`.

### Operação: upsert de review

- Arquivo: `backend/src/repositories.js`
- Tipo: `INSERT` + `ON CONFLICT DO UPDATE`
- Tabela(s): `reviews`
- Objetivo: permitir uma avaliação por usuário/restaurante.
- Quando é executada: `POST /api/restaurants/:id/reviews`.
- Explicação:

```sql
INSERT INTO reviews (...)
VALUES (...)
ON CONFLICT (user_id, restaurant_id)
DO UPDATE SET
  rating = EXCLUDED.rating,
  comment = EXCLUDED.comment,
  updated_at = NOW()
RETURNING ...
```

### Operação: criação de evento de feed

- Arquivo: `backend/src/repositories.js`
- Tipo: `INSERT`
- Tabela(s): `feed_events`
- Objetivo: registrar atividades sociais.
- Quando é executada: review, wishlist, visited e follow.

### Operação: wishlist

- Arquivo: `backend/src/repositories.js`
- Tipo: `SELECT`, `INSERT`, `DELETE`
- Tabela(s): `wishlist_items`, `restaurants`, `cuisines`, view `v_restaurant_stats`
- Objetivo: listar, adicionar e remover restaurantes salvos.
- Quando é executada:
  - `GET /api/me/wishlist`;
  - `POST /api/restaurants/:id/wishlist`;
  - `DELETE /api/restaurants/:id/wishlist`.

### Operação: visitados

- Arquivo: `backend/src/repositories.js`
- Tipo: `SELECT`, `INSERT`, `DELETE`
- Tabela(s): `visited_restaurants`, `restaurants`, `cuisines`, view `v_restaurant_stats`
- Objetivo: listar, adicionar e remover restaurantes visitados.
- Quando é executada:
  - `GET /api/me/visited`;
  - `POST /api/restaurants/:id/visited`;
  - `DELETE /api/restaurants/:id/visited`.

### Operação: seguir/deixar de seguir

- Arquivo: `backend/src/repositories.js`
- Tipo: `INSERT`, `DELETE`, `SELECT`
- Tabela(s): `user_follows`, `feed_events`, view `v_user_stats`
- Objetivo: manter relação social e contagem de seguidores.
- Quando é executada:
  - `POST /api/users/:id/follow`;
  - `DELETE /api/users/:id/follow`.

### Operação: busca de usuários

- Arquivo: `backend/src/repositories.js`
- Tipo: `SELECT`
- Tabela(s): `users`, `user_follows`, view `v_user_stats`
- Objetivo: buscar usuários por nome/username e indicar se o viewer já segue.
- Quando é executada: `GET /api/users/search?q=...`.
- Explicação: usa `EXISTS` para preencher `isFollowing`.

### Operação: feed

- Arquivo: `backend/src/repositories.js`
- Tipo: `SELECT` com múltiplos `JOIN`
- Tabela(s): `feed_events`, `users`, `restaurants`, `cuisines`, `reviews`
- Objetivo: retornar eventos recentes.
- Quando é executada: `GET /api/feed`.
- Explicação: monta objetos `user`, `targetUser`, `restaurant` e `review`, ordenando por `fe.created_at DESC` e limitando em 100.

### Operação: views estatísticas

- Arquivo: `db/init.sql`
- Tipo: `CREATE VIEW`
- Views:
  - `v_restaurant_stats`;
  - `v_user_stats`.
- Objetivo: calcular agregados para catálogo, detalhes e perfis.

## 11. Variáveis de ambiente e configuração

Arquivos analisados:

- `.env.example`
- `.env`
- `docker-compose.yml`
- `backend/src/db.js`
- `backend/src/middleware/auth.js`
- `backend/src/server.js`
- `frontend/src/services/apiClient.js`

Variáveis encontradas:

| Variável | Camada | Uso | Obrigatória para local? |
|---|---|---|---|
| `POSTGRES_USER` | Docker/DB | Usuário do container PostgreSQL. | Sim no Compose, com default. |
| `POSTGRES_PASSWORD` | Docker/DB | Senha do PostgreSQL. | Sim no Compose, com default. Valor real deve ser tratado como `<valor_sensivel_removido>`. |
| `POSTGRES_DB` | Docker/DB | Nome do banco criado no container. | Sim no Compose, com default. |
| `PGHOST` | Backend | Host usado pelo `pg`. | Sim para backend fora do Docker; default `localhost`. |
| `PGPORT` | Backend | Porta do PostgreSQL. | Sim para backend fora do Docker; default `5432`. |
| `PGDATABASE` | Backend | Banco usado pela API. | Sim para backend fora do Docker; default `garfada`. |
| `PGUSER` | Backend | Usuário usado pela API. | Sim para backend fora do Docker; default `postgres`. |
| `PGPASSWORD` | Backend | Senha usada pela API. | Sim para backend fora do Docker; valor real deve ser `<valor_sensivel_removido>`. |
| `PGPOOL_MAX` | Backend | Tamanho máximo do pool. | Não; default `10`. |
| `PG_IDLE_TIMEOUT_MS` | Backend | Timeout ocioso do pool. | Não; default `30000`. |
| `PG_CONNECTION_TIMEOUT_MS` | Backend | Timeout de conexão. | Não; default `5000`. |
| `DATABASE_URL` | Backend | Connection string alternativa. | Não, mas sobrescreve config individual se presente. |
| `PGSSLMODE` | Backend | Ativa SSL em produção quando `require`. | Não. |
| `NODE_ENV` | Backend | Define debug de erro e SSL em produção. | Não. |
| `PORT` | Backend | Porta Express. | Sim; default `3001`. |
| `JWT_SECRET` | Backend | Segredo para assinar JWT. | Sim; default dev existe, produção deve usar segredo real. |
| `JWT_EXPIRES_IN` | Backend | Expiração do JWT. | Não; default `7d`. |
| `CORS_ORIGIN` | Backend | Origins permitidas. | Recomendado; default no Compose `http://localhost:5173`. |
| `PASSWORD_PBKDF2_ITERATIONS` | Backend | Iterações do hash de senha. | Não; default `120000`. |
| `VITE_API_URL` | Frontend | URL base da API. | Sim para apontar frontend ao backend; default `http://localhost:3001`. |
| `CHOKIDAR_USEPOLLING` | Frontend/Docker | Hot reload dentro do container. | Só no Docker. |

O arquivo `.env` local existe e contém valores reais de ambiente de desenvolvimento. Esta documentação não replica segredos; qualquer senha/segredo deve ser tratado como `<valor_sensivel_removido>`.

Outras configurações:

- `frontend/vite.config.js`: plugins React e Tailwind.
- `frontend/eslint.config.js`: ESLint para JS/JSX, React Hooks e React Refresh.
- `docker-compose.yml`: sobe PostgreSQL `15-alpine`, backend na porta `3001` e frontend na porta `5173`.

## 12. Como executar o projeto

### Pré-requisitos

- Docker e Docker Compose, para execução completa recomendada.
- Alternativamente, Node.js compatível com os Dockerfiles (`node:20`) e PostgreSQL local.

### Execução com Docker Compose

Na raiz:

```bash
docker compose up --build
```

Serviços esperados:

- PostgreSQL: `localhost:5432`
- Backend: `http://localhost:3001`
- Frontend: `http://localhost:5173`

O `docker-compose.yml` monta `db/init.sql` em `/docker-entrypoint-initdb.d/init.sql`, então o schema e seeds são aplicados na primeira criação do volume `postgres_data`.

### Execução sem Docker

Banco:

1. Subir PostgreSQL local.
2. Criar banco conforme `.env.example`.
3. Executar `db/init.sql` manualmente no banco.

Backend:

```bash
cd backend
npm install
npm run dev
```

ou:

```bash
npm run start
```

Frontend:

```bash
cd frontend
npm install
npm run dev -- --host
```

Scripts úteis:

| Local | Script | O que faz |
|---|---|---|
| `frontend/package.json` | `npm run dev` | Inicia Vite. |
| `frontend/package.json` | `npm run build` | Gera build em `dist`. |
| `frontend/package.json` | `npm run lint` | Executa ESLint. |
| `frontend/package.json` | `npm run preview` | Preview do build Vite. |
| `backend/package.json` | `npm run dev` | Inicia backend com Nodemon. |
| `backend/package.json` | `npm run start` | Inicia backend com Node. |
| `backend/package.json` | `npm test` | Placeholder que falha; não há testes reais configurados. |

Atenção: `frontend/README.md` afirma que o frontend usa dados 100% mockados e que não há backend real conectado. Isso está desatualizado em relação ao código atual, porque os services em `frontend/src/services/` chamam a API real via `apiClient`.

## 13. Perguntas que essa documentação deve conseguir responder

### Quais tecnologias foram usadas na implementação?

React, Vite, JavaScript/JSX, Tailwind CSS, React Router, Fetch API, Node.js, Express, PostgreSQL, `pg`, JWT com `jsonwebtoken`, Docker Compose, ESLint e SQL manual. Não foram encontrados TypeScript, Prisma, Supabase, FastAPI, SQLite, GitHub Actions ou testes automatizados reais.

### Mostre o código que implementa uma certa página; me explique o funcionamento dele.

As páginas ficam em `frontend/src/pages/`. Exemplo: `frontend/src/pages/CatalogPage.jsx` implementa `/catalogo`. Ela guarda filtros em `useState`, usa debounce para busca/localização, carrega restaurantes com `restaurantService.list`, busca wishlist/visitados do usuário e renderiza `RestaurantCard` com botões de salvar e marcar visita.

### Explique alguns endpoints da API do backend.

Os endpoints ficam em `backend/src/server.js`. Exemplos:

- `POST /api/auth/login`: valida credenciais e retorna JWT.
- `GET /api/restaurants`: lista restaurantes com filtros.
- `POST /api/restaurants/:id/reviews`: cria/atualiza review e gera evento de feed.
- `PUT /api/me`: atualiza perfil e culinárias favoritas.
- `GET /api/feed`: retorna eventos recentes.

### Como está organizada a tabela de `[nome da tabela]`?

O schema fica em `db/init.sql`. Exemplo: `reviews` tem `id`, `restaurant_id`, `user_id`, `rating`, `comment`, `created_at`, `updated_at`, FK para `restaurants` e `users`, check de nota entre 1 e 5 e unicidade `(user_id, restaurant_id)`.

### Favor mostrar a organização de diretórios. Para que serve a pasta X do repositório do projeto?

A seção 3 mostra a árvore resumida. Em resumo:

- `frontend/src/pages`: telas roteáveis;
- `frontend/src/components`: componentes comuns e UI;
- `frontend/src/services`: chamadas HTTP;
- `backend/src`: API, banco, repositórios, auth e utilitários;
- `db`: SQL do banco;
- raiz: Docker, env e documentação.

### O que está implementado neste arquivo?

Exemplo: `backend/src/repositories.js` implementa a camada de dados e regras de negócio. Ele contém queries para autenticação, perfis, restaurantes, reviews, wishlist, visitados, follow e feed. É o arquivo mais importante para entender como a API conversa com o banco.

### O que está implementado nesta função?

Exemplo: `upsertReview` em `backend/src/repositories.js` abre transação, valida restaurante, insere ou atualiza uma review por usuário/restaurante e cria um evento em `feed_events`.

### Me mostre a implementação de alguma consulta ou operação SQL.

Exemplo real em `backend/src/repositories.js`:

```sql
INSERT INTO reviews (
  id,
  restaurant_id,
  user_id,
  rating,
  comment,
  created_at,
  updated_at
) VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
ON CONFLICT (user_id, restaurant_id)
DO UPDATE SET
  rating = EXCLUDED.rating,
  comment = EXCLUDED.comment,
  updated_at = NOW()
RETURNING ...
```

Essa operação é usada por `POST /api/restaurants/:id/reviews`.

## 14. Pontos de atenção para novos desenvolvedores

- `backend/src/repositories.js` é central: alterações no formato de retorno podem quebrar várias telas.
- `RESTAURANT_JSON_SQL` alimenta catálogo, detalhe, wishlist, visitados e coleções.
- O frontend espera campos em camelCase, enquanto o banco usa snake_case; os aliases SQL são importantes.
- `db/init.sql` recria tudo do zero. Não trate como migration incremental.
- Não há testes automatizados configurados; mudanças em autenticação, SQL e rotas precisam de validação manual ou criação de testes.
- `frontend/README.md` está desatualizado sobre uso de mocks.
- `frontend/src/mocks/` existe, mas não é importado pela aplicação atual.
- A autenticação depende de `JWT_SECRET`; em produção, não usar default dev.
- Senhas são hashadas com PBKDF2; mudar `PASSWORD_PBKDF2_ITERATIONS` só afeta novos hashes, a verificação lê iterações do hash salvo.
- Wishlist, visitados e follows usam erro 409 para conflito; os services frontend usam isso como toggle.
- O feed é global no backend atual; não foi encontrado filtro apenas por seguidos.
- Upload real de avatar não foi identificado; `EditProfilePage` usa URL temporária local.
- Não foram encontradas políticas RLS, permissões por usuário no SQL ou camada avançada de autorização além do JWT.
- A media query em `frontend/src/index.css` usa `@media (prefers-color-scheme: light)` para definir valores escuros; vale revisar antes de mexer em tema.
- A porta padrão do backend é `3001`, e o frontend depende de `VITE_API_URL`.
- O Compose usa volume `postgres_data`; se o banco já existir, mudanças em `db/init.sql` podem não ser reaplicadas sem recriar o volume.

## 15. Resumo final

O Garfada está dividido em três partes principais:

- frontend React/Vite em `frontend/`;
- backend Express/PostgreSQL em `backend/`;
- schema e seeds PostgreSQL em `db/init.sql`.

O fluxo principal da aplicação começa com autenticação JWT, segue para o catálogo de restaurantes, permite salvar ou marcar visitados, abre detalhes de restaurante e cria avaliações que também geram eventos de feed.

Para entender o projeto rapidamente, um novo desenvolvedor deveria começar por:

1. `README.md` para contexto de produto.
2. `docker-compose.yml` para execução local.
3. `db/init.sql` para modelo de dados.
4. `backend/src/server.js` para endpoints.
5. `backend/src/repositories.js` para regras e SQL.
6. `frontend/src/router/AppRouter.jsx` para rotas de tela.
7. `frontend/src/services/apiClient.js` e services de domínio para integração frontend-backend.
8. `frontend/src/pages/CatalogPage.jsx` e `frontend/src/pages/RestaurantDetailPage.jsx` para o fluxo principal do usuário.

O ponto mais importante é manter alinhados os contratos entre SQL, backend e frontend: nomes de campos, endpoints e formatos JSON aparecem em várias camadas e são a cola real do sistema.
