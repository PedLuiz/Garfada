## Cenarios cobertos

### Autenticacao

Arquivo: `backend/tests/integration/auth.integration.test.js`

- Cadastro persiste usuario, retorna token JWT e nao vaza `passwordHash`.
- Login com usuario recem-criado retorna sessao valida.
- `GET /api/auth/me` rejeita requisicao sem token.
- `GET /api/auth/me` retorna o usuario autenticado com token Bearer valido.
- Cadastro rejeita e-mail duplicado com `409 Conflict`.
- Cadastro rejeita username duplicado com `409 Conflict`.

### Restaurantes

Arquivo: `backend/tests/integration/restaurants.integration.test.js`

- `GET /api/restaurants` retorna 8 restaurantes seedados.
- Cada restaurante vem com fotos, previa de menu e estatisticas agregadas.
- Filtros por busca, cozinha, faixa de preco e nota minima retornam o restaurante esperado.
- Restaurante inexistente retorna `404`.

### Reviews e feed

Arquivo: `backend/tests/integration/reviews-feed.integration.test.js`

- Usuario autenticado cria review em restaurante.
- Review criada aparece em `GET /api/restaurants/:id/reviews`.
- Estatisticas do restaurante refletem a nova avaliacao.
- Evento de review aparece no topo de `GET /api/feed`.
- Nota fora do intervalo permitido retorna `400`.

### Wishlist e visitados

Arquivo: `backend/tests/integration/collections.integration.test.js`

- Usuario autenticado adiciona item na wishlist.
- Wishlist lista o item com dados agregados do restaurante.
- Remocao da wishlist deixa a lista vazia para o usuario de teste.
- Insercao duplicada na wishlist retorna `409`.
- Usuario autenticado marca restaurante como visitado com nota.
- Lista de visitados retorna restaurante e nota do usuario.
- Remocao de visitado deixa a lista vazia para o usuario de teste.
- Nota de visita fora do intervalo permitido retorna `400`.

### Perfil

Arquivo: `backend/tests/integration/profile.integration.test.js`

- `PUT /api/me` atualiza nome, username, bio, avatar e cozinhas favoritas.
- Cozinhas favoritas sao normalizadas, deduplicadas e retornadas ordenadas.
- `GET /api/me` confirma os dados persistidos e estatisticas iniciais do usuario.

### Social

Arquivo: `backend/tests/integration/social.integration.test.js`

- Busca de usuarios exclui o proprio usuario autenticado.
- Follow cria relacao entre usuarios e atualiza contagem de seguidores.
- Follow duplicado retorna `409`.
- Perfil publico do usuario seguido retorna `isFollowing=true`.
- Unfollow remove relacao e atualiza contagem de seguidores.
- Auto-follow retorna `400`.

## Como executar

### Backend unitario

Os testes unitarios nao dependem do PostgreSQL. Eles usam mocks/fakes para
middlewares, repositorios, transacoes e handlers HTTP.

```bash
cd backend
npm run test:unit
npm run test:coverage
```

O gate de cobertura do backend exige no minimo 70% em statements, branches,
functions e lines.

### Backend integracao

Na maquina local, a partir de `backend/`:

```bash
cd backend
npm run test:integration
```

Quando os testes forem executados dentro do container backend do Docker Compose, use o host interno do servico PostgreSQL e informe onde o `init.sql` esta disponivel:

```bash
docker compose cp db/init.sql backend:/tmp/garfada-init.sql
docker compose exec -e TEST_PGHOST=db -e TEST_INIT_SQL_PATH=/tmp/garfada-init.sql backend npm run test:integration
```

Se o banco do container tiver sido criado com senha diferente do fallback
`postgres`, informe tambem `TEST_PGPASSWORD` com o mesmo valor usado em
`POSTGRES_PASSWORD`/`PGPASSWORD` no ambiente local.

### Frontend unitario

A partir de `frontend/`:

```bash
cd frontend
npm test
npm run test:coverage
```

O frontend usa Vitest + jsdom + Testing Library. O gate de cobertura tambem
exige no minimo 70% em statements, branches, functions e lines.

## Ultima verificacao registrada

Comando executado:

```bash
docker compose exec -e TEST_PGHOST=db -e TEST_INIT_SQL_PATH=/tmp/garfada-init.sql backend npm test
```

Resultado:

- 6 suites passaram.
- 16 testes passaram.
- 0 falhas.

## Observacoes

- A suite recria o schema e os seeds apenas no banco `garfada_test`.
- O banco de desenvolvimento `garfada` nao deve ser usado pelos testes.
- Se houver outro PostgreSQL local na porta `5432`, execute via Docker Compose com `TEST_PGHOST=db` ou ajuste as variaveis `TEST_PG*`.
- A suite roda com `jest --runInBand` para evitar concorrencia sobre o mesmo banco de teste.
