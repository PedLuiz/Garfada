# Relatório de Testes Unitários

Este relatório descreve as suítes unitárias implementadas no backend e no frontend do Garfada. Ele não inclui a suíte de integração do backend, que depende de PostgreSQL.

## Resumo

| Pacote | Executor | Arquivos de teste | Total de testes | Foco |
| --- | --- | ---: | ---: | --- |
| Backend | Jest | 7 | 55 | Utilitários, middleware, transações, repositórios com fakes e rotas com mocks |
| Frontend | Vitest + Testing Library | 17 | 77 | Utilitários, serviços, hooks, componentes, páginas, layouts e roteamento |

## Backend

### `backend/tests/unit/errors.test.js`

Suíte: `AppError`

Valida o erro esperado da aplicação e o contrato usado pelo middleware de erros.

| Teste | Casos cobertos |
| --- | --- |
| `armazena status HTTP e detalhes opcionais` | Garante que `AppError` herda de `Error`, preserva mensagem, `name`, `statusCode` e objeto `details`. |
| `usa requisição inválida como padrão sem detalhes` | Confirma os defaults do construtor: status `400` e `details = null`. |

Suíte: `isUniqueViolation`

Valida o helper que identifica violações de unicidade do PostgreSQL.

| Teste | Casos cobertos |
| --- | --- |
| `detecta qualquer violação de unicidade do Postgres sem constraint informada` | Reconhece erro `23505` independentemente do nome da constraint. |
| `compara com a constraint esperada quando informada` | Retorna verdadeiro apenas quando a constraint do erro coincide com a esperada. |
| `rejeita erros ausentes ou que não são de unicidade` | Trata erros nulos ou códigos diferentes de `23505` como não únicos. |

### `backend/tests/unit/utils/ids.test.js`

Suíte: `createId`

Valida a geração de ids legíveis por domínio.

| Teste | Casos cobertos |
| --- | --- |
| `monta um id legível com prefixo, timestamp e hex aleatório` | Usa mocks de `Date.now` e `crypto.randomBytes` para conferir prefixo, timestamp em base 36 e bytes aleatórios em hexadecimal. |

### `backend/tests/unit/utils/password.test.js`

Suíte: `utilitários de senha`

Valida hash e verificação de senhas com PBKDF2.

| Teste | Casos cobertos |
| --- | --- |
| `gera hash e verifica uma senha usando os parâmetros codificados` | Confere formato do hash, valida senha correta e rejeita senha incorreta. |
| `usa um salt único para cada hash` | Garante que a mesma senha gera hashes diferentes e ambos continuam verificáveis. |
| `rejeita hashes malformados sem lançar erro` | Cobre valores ausentes, nulos, esquema errado e iterações inválidas. |

### `backend/tests/unit/middleware/auth.test.js`

Suíte: `signAccessToken`

Valida a criação de JWTs de acesso.

| Teste | Casos cobertos |
| --- | --- |
| `assina um JWT com o id do usuário no campo sub` | Decodifica o token e confirma `sub`, `iat` e `exp`. |

Suíte: `requireAuth`

Valida o middleware de autenticação de rotas privadas.

| Teste | Casos cobertos |
| --- | --- |
| `anexa dados de autenticação quando o token Bearer é válido` | Injeta `req.auth` com `userId`, token original e payload do JWT. |
| `rejeita token Bearer ausente ou malformado` | Retorna `AppError` 401 para cabeçalho inválido ou sem token. |
| `rejeita tokens inválidos com erro de sessão` | Converte falhas de `jwt.verify` em erro de sessão 401. |
| `rejeita JWTs válidos sem subject` | Garante erro 401 quando o token não possui `sub`. |

### `backend/tests/unit/db.test.js`

Suíte: `módulo de banco de dados`

Valida o wrapper de acesso ao PostgreSQL com `pg` mockado.

| Teste | Casos cobertos |
| --- | --- |
| `cria um pool e delega consultas simples` | Verifica criação de `Pool` com variáveis de ambiente e delegação para `pool.query`. |
| `verifica conectividade com SELECT 1` | Confirma que `checkConnection` executa `SELECT 1`. |
| `confirma transações bem-sucedidas e libera o client` | Cobre ordem `BEGIN`, operação do handler, `COMMIT` e `release`. |
| `desfaz transações com falha e libera o client` | Cobre erro no handler, `ROLLBACK`, propagação do erro e `release`. |

### `backend/tests/unit/repositories.test.js`

Suíte: `proteções de entidade dos repositórios`

Valida guards que protegem operações sobre entidades inexistentes.

| Teste | Casos cobertos |
| --- | --- |
| `ensureRestaurantExists é resolvida quando o restaurante existe` | Usa executor fake com `rowCount = 1` e confere consulta por id. |
| `ensureRestaurantExists lança 404 quando o restaurante não existe` | Garante `AppError` 404 para restaurante ausente. |
| `ensureUserExists lança 404 quando o usuário não existe` | Garante `AppError` 404 para usuário ausente. |

Suíte: `leituras dos repositórios`

Valida consultas de leitura usando executores fake.

| Teste | Casos cobertos |
| --- | --- |
| `findUserForAuthByIdentifier retorna a primeira linha de autenticação ou null` | Cobre usuário encontrado e ausência de resultado. |
| `listRestaurants monta filtros parametrizados e mapeia linhas JSON de restaurante` | Confere filtros de busca, localização, cozinha, preço e nota mínima com parâmetros seguros. |
| `getRestaurantById retorna JSON do restaurante ou null` | Cobre restaurante encontrado e não encontrado. |
| `remoção de itens de coleção informa se uma linha foi apagada` | Valida retorno booleano de remoções em wishlist e visitados. |
| `searchUsers normaliza a busca e exclui o visualizador` | Confere trim/lowercase, `LIKE` e exclusão do próprio usuário. |
| `getUserCollections agrega reviews, wishlist e visitados de um usuário existente` | Verifica composição das coleções após confirmar existência do usuário. |

Suíte: `escritas dos repositórios`

Valida operações transacionais, conflitos e eventos de feed.

| Teste | Casos cobertos |
| --- | --- |
| `createUser insere um usuário em transação e retorna o contrato de autenticação` | Confere dados inseridos, id gerado e retorno via `getAuthUserById`. |
| `createUser traduz violações de unicidade em conflitos amigáveis` | Converte erro `23505` de username em `AppError` 409 com mensagem específica. |
| `updateMeProfile atualiza campos enviados e sincroniza cozinhas favoritas` | Cobre update parcial, sanitização/deduplicação de cozinhas e vínculo na tabela relacional. |
| `updateMeProfile verifica existência quando campos relacionais são omitidos` | Cobre payload vazio e usuário inexistente. |
| `upsertReview verifica restaurante, faz upsert e cria evento de feed` | Confere guard de restaurante, `INSERT ... ON CONFLICT` e criação de evento `review`. |
| `addWishlistItem retorna conflito quando o item já existe` | Converte duplicidade de wishlist em `AppError` 409. |
| `addVisitedItem insere a visita e cria evento de feed` | Confere inserção de visitado com nota e evento `visited`. |

Suíte: `fluxos sociais dos repositórios`

Valida follows, unfollows e feed.

| Teste | Casos cobertos |
| --- | --- |
| `followUser rejeita seguir o próprio perfil antes de abrir transação` | Impede auto-follow e confirma que transação não é aberta. |
| `followUser insere relação, evento de feed e retorna contagem de seguidores` | Cobre criação da relação social, evento `follow` e contagem atualizada. |
| `followUser traduz relações duplicadas em conflitos` | Converte duplicidade de follow em `AppError` 409. |
| `unfollowUser apaga relação e retorna a contagem atualizada` | Confere delete da relação e retorno com `isFollowing = false`. |
| `listFeed retorna linhas de eventos do feed pelo executor` | Garante delegação da consulta de feed e retorno das linhas. |

### `backend/tests/unit/server.test.js`

Suíte: `saúde e erros do servidor`

Valida endpoints e middleware global de erro usando `supertest` e repositórios mockados.

| Teste | Casos cobertos |
| --- | --- |
| `GET /health retorna ok quando o banco responde` | Confirma resposta 200 com `{ ok: true }`. |
| `GET /health retorna indisponível quando a verificação do banco falha` | Confirma resposta 503 e mensagem do erro. |
| `rotas desconhecidas retornam 404 em JSON` | Cobre handler final de rota inexistente. |
| `erros de cast do Postgres retornam requisição inválida` | Converte erro `22P02` em resposta 400. |

Suíte: `rotas de autenticação do servidor`

Valida regras de cadastro, login e sessão.

| Teste | Casos cobertos |
| --- | --- |
| `register valida campos obrigatórios e formatados` | Cobre campos ausentes, e-mail inválido, username curto e senha curta. |
| `register normaliza campos, cria usuário e retorna sessão` | Confere trim dos campos, hash da senha, avatar padrão e token retornado. |
| `login valida credenciais e retorna sessão para senha válida` | Cobre busca por identificador, verificação de senha e retorno de sessão. |
| `login rejeita credenciais ausentes ou inválidas` | Cobre payload vazio e usuário/senha inválidos. |
| `GET /api/auth/me exige autenticação e retorna usuário autenticado` | Cobre ausência de token e sucesso com JWT válido. |

Suíte: `rotas de restaurantes e coleções do servidor`

Valida endpoints de catálogo, reviews, wishlist e visitados.

| Teste | Casos cobertos |
| --- | --- |
| `lista restaurantes e retorna 404 para detalhe inexistente` | Cobre listagem com filtros e detalhe de restaurante ausente. |
| `cria reviews apenas com notas válidas` | Rejeita nota fora do intervalo e cria review com comentário normalizado. |
| `busca reviews depois de verificar existência do restaurante` | Confirma chamada ao guard antes de listar reviews. |
| `alterna wishlist e visitados para usuários autenticados` | Cobre POST/DELETE de wishlist, POST/DELETE de visitados e nota vazia como `null`. |

Suíte: `rotas de perfil e social do servidor`

Valida perfil autenticado, perfil público e endpoints sociais.

| Teste | Casos cobertos |
| --- | --- |
| `atualiza perfil após sanitizar campos permitidos` | Cobre trim de campos permitidos e descarte de campos ignorados. |
| `atualização de perfil rejeita payloads inválidos` | Rejeita nome vazio, username curto e `favoriteCuisines` fora do formato esperado. |
| `serve perfil autenticado, coleções, feed e endpoints sociais` | Cobre `/api/me`, coleções, feed, busca de usuários, follow, unfollow e perfil público. |

## Frontend

### `frontend/src/__tests__/App.test.jsx`

Suíte: `App`

Valida a composição raiz da aplicação.

| Teste | Casos cobertos |
| --- | --- |
| `renderiza o roteador da aplicação` | Usa mock de `AppRouter` para confirmar que `App` delega a renderização ao roteador. |

### `frontend/src/router/__tests__/AppRouter.test.jsx`

Suíte: `AppRouter`

Valida regras de roteamento público e protegido com páginas/layouts mockados.

| Teste | Casos cobertos |
| --- | --- |
| `mostra estado de inicialização antes de resolver rotas protegidas` | Cobre `isBootstrapping` em rota privada. |
| `redireciona usuários não autenticados de rotas privadas para login` | Garante redirecionamento de `/catalogo` para `/login` sem sessão. |
| `redireciona usuários autenticados para fora de rotas apenas públicas` | Garante redirecionamento de `/login` para `/catalogo` com sessão. |
| `renderiza a página inicial pública e rotas alternativas` | Cobre rota `/` e rota alternativa `*`. |

### `frontend/src/layouts/__tests__/layouts.test.jsx`

Suíte: `layouts`

Valida os layouts público e privado com `Outlet`.

| Teste | Casos cobertos |
| --- | --- |
| `AppLayout renderiza navbar e conteúdo privado aninhado` | Confirma navbar e renderização do conteúdo de rota filha. |
| `PublicLayout omite o cabeçalho na rota da página inicial` | Cobre layout especial da página inicial sem cabeçalho. |
| `PublicLayout renderiza cabeçalho da marca fora da rota da página inicial` | Cobre cabeçalho de marca em páginas como login/cadastro. |

### `frontend/src/hooks/__tests__/useAuth.test.jsx`

Suíte: `AuthProvider/useAuth`

Valida o contexto de autenticação e seus efeitos.

| Teste | Casos cobertos |
| --- | --- |
| `inicializa uma sessão existente e o perfil` | Cobre `getSession`, carregamento de perfil e estado autenticado. |
| `limpa o estado quando a inicialização falha` | Garante sessão/perfil nulos e finalização do bootstrap em erro. |
| `login, refreshMe e logout atualizam o estado do contexto` | Cobre fluxo completo de login, atualização de perfil e logout. |
| `register armazena a nova sessão e o perfil` | Cobre cadastro com sessão e perfil retornados. |
| `refreshMe retorna null quando não há sessão` | Evita chamada ao serviço de perfil sem sessão ativa. |
| `useAuth lança erro fora do AuthProvider` | Garante erro de uso indevido do hook. |

### `frontend/src/hooks/__tests__/useAsyncData.test.jsx`

Suíte: `useAsyncData`

Valida carregamento assíncrono reutilizável.

| Teste | Casos cobertos |
| --- | --- |
| `carrega dados na montagem e expõe reload` | Cobre estado de carregamento, sucesso inicial e recarregamento manual. |
| `armazena instâncias de Error e usa alternativa para lançamentos que não são Error` | Cobre erro bruto e `Error` real. |
| `permite que chamadores atualizem os dados diretamente` | Confirma exposição e funcionamento de `setData`. |

### `frontend/src/hooks/__tests__/useDebouncedValue.test.jsx`

Suíte: `useDebouncedValue`

Valida debounce com timers fake.

| Teste | Casos cobertos |
| --- | --- |
| `mantém o valor anterior até o delay expirar` | Confere atraso antes de atualizar o valor debounced. |
| `cancela atualizações antigas quando o valor muda novamente` | Garante que timeouts antigos são limpos. |

### `frontend/src/services/__tests__/apiClient.test.js`

Suíte: `helpers de armazenamento do apiClient`

Valida helpers de token em `localStorage`.

| Teste | Casos cobertos |
| --- | --- |
| `armazena, lê e limpa o token de autenticação` | Cobre `setStoredToken`, `getStoredToken` e `clearStoredToken`. |

Suíte: `apiRequest`

Valida a camada HTTP base.

| Teste | Casos cobertos |
| --- | --- |
| `envia corpo JSON e cabeçalho de autenticação para caminhos relativos` | Cobre URL base, cabeçalho de token, `Content-Type` e serialização do corpo. |
| `não anexa autenticação quando desabilitada e preserva URLs absolutas` | Cobre opção `auth: false` e URLs externas. |
| `lê respostas de texto como payloads de mensagem` | Converte resposta `text/plain` em `{ message }`. |
| `lança ApiError com mensagem, status e payload para respostas com falha` | Cobre erro HTTP com payload JSON. |
| `ApiError expõe status e payload` | Confirma propriedades customizadas da classe. |

### `frontend/src/services/__tests__/authService.test.js`

Suíte: `authService`

Valida regras de autenticação no frontend.

| Teste | Casos cobertos |
| --- | --- |
| `getSession retorna null quando nenhum token está armazenado` | Evita chamada ao backend sem token local. |
| `getSession valida o token armazenado e retorna uma sessão` | Cobre token local válido e montagem da sessão. |
| `getSession limpa tokens armazenados inválidos` | Remove token quando `/api/auth/me` falha. |
| `login valida, normaliza credenciais e armazena o token retornado` | Cobre trim, chamada sem auth e persistência do token. |
| `register valida, normaliza payload e armazena o token retornado` | Cobre validação local, trim e persistência. |
| `rejeita payloads vazios de login/register e limpa token no logout` | Cobre erros locais e logout. |

### `frontend/src/services/__tests__/domainServices.test.js`

Suíte: `serviços de domínio`

Valida serviços específicos de restaurantes, reviews, social e usuário.

| Teste | Casos cobertos |
| --- | --- |
| `restaurantService monta strings de consulta normalizadas` | Remove campos vazios/nulos e monta string de consulta. |
| `restaurantService desativa wishlist e visitados em conflitos` | Em erro 409, troca `POST` por `DELETE`. |
| `restaurantService propaga erros inesperados de alternância` | Garante que erros não 409 não são engolidos. |
| `reviewService valida notas e envia payloads normalizados` | Rejeita nota inválida e normaliza comentário ausente. |
| `socialService desativa relação em conflito e codifica busca` | Cobre unfollow por 409 e `encodeURIComponent` na busca. |
| `userService delega endpoints de perfil e coleções` | Confere rotas de perfil próprio, público e coleções. |

### `frontend/src/utils/__tests__/format.test.js`

Suíte: `utilitários de formatação`

Valida helpers de apresentação textual.

| Teste | Casos cobertos |
| --- | --- |
| `formata datas com a convenção pt-BR de mês curto` | Confere `Intl.DateTimeFormat` em `pt-BR`. |
| `formata faixas de preço conhecidas e alternativa` | Cobre rótulos conhecidos, alternativa e ausência de preço. |
| `formata rótulos de ações do feed com alternativa` | Cobre tipos conhecidos e tipo desconhecido. |
| `monta iniciais a partir de um ou dois tokens do nome` | Cobre nomes compostos, simples e vazio. |
| `monta arrays de estrelas com arredondamento` | Cobre rating arredondado e tamanho customizado. |

### `frontend/src/utils/__tests__/imageUrl.test.js`

Suíte: `getOptimizedImageUrl`

Valida otimização de imagens do Pexels.

| Teste | Casos cobertos |
| --- | --- |
| `retorna URLs que não são do Pexels sem alteração` | Preserva URLs locais e valores nulos. |
| `adiciona parâmetros de otimização em URLs do Pexels` | Cobre `auto`, `cs`, largura, altura, `fit`, qualidade e preservação de consulta existente. |

### `frontend/src/utils/__tests__/cn.test.js`

Suíte: `cn`

Valida composição simples de classes CSS.

| Teste | Casos cobertos |
| --- | --- |
| `junta classes verdadeiras e descarta valores falsy` | Cobre strings válidas, vazio, `null`, `undefined` e condição falsa. |

### `frontend/src/utils/__tests__/delay.test.js`

Suíte: `delay`

Valida helper assíncrono de atraso.

| Teste | Casos cobertos |
| --- | --- |
| `resolve após o timeout solicitado` | Usa timers fake para garantir que a Promise só resolve após o tempo esperado. |

### `frontend/src/components/ui/__tests__/uiComponents.test.jsx`

Suíte: `componentes de UI`

Valida componentes base compartilhados.

| Teste | Casos cobertos |
| --- | --- |
| `Button renderiza estado de carregamento e impede cliques` | Cobre texto de carregamento, estado desabilitado e bloqueio de callback. |
| `Input, Textarea e Select conectam labels aos controles e mostram erros/dicas` | Confere acessibilidade de labels, hints, erros e opções de select. |
| `Avatar renderiza imagem quando src existe e iniciais como alternativa` | Cobre imagem com `alt` e alternativa por iniciais. |
| `Badge, LoadingState e Skeleton renderizam conteúdo visível` | Confirma renderização básica de componentes visuais simples. |
| `Tabs informam valores selecionados via onChange` | Cobre callback de seleção de aba. |
| `EmptyState e ErrorState chamam ações opcionais` | Cobre botões de ação e retry. |

### `frontend/src/components/common/__tests__/AppNavbar.test.jsx`

Suíte: `AppNavbar`

Valida navbar autenticada.

| Teste | Casos cobertos |
| --- | --- |
| `renderiza navegação e link do perfil do usuário autenticado` | Confere links principais e link para meu perfil. |
| `chama logout quando o usuário clica em Sair` | Cobre callback de logout. |
| `renderiza sem identidade de perfil quando me está indisponível` | Garante alternativa quando não há perfil carregado. |

### `frontend/src/components/common/__tests__/commonComponents.test.jsx`

Suíte: `componentes comuns`

Valida componentes de domínio reutilizados pelas páginas.

| Teste | Casos cobertos |
| --- | --- |
| `RestaurantCard renderiza detalhes do restaurante e alterna coleções` | Cobre dados do restaurante, link de detalhe e callbacks de wishlist/visitado. |
| `RestaurantCard na variante catálogo renderiza rodapé e rótulos ativos` | Cobre variante visual de catálogo, rodapé e estados ativos. |
| `RestaurantFilters informa mudanças de campo, reset e filtros ativos` | Cobre busca, preço, reset e chips de filtros. |
| `RestaurantFilters na variante compacta renderiza os mesmos controles` | Garante presença dos controles no modo compacto. |
| `ReviewForm valida nota, envia comentários e trata erros de envio` | Cobre nota inválida, envio válido e cancelamento. |
| `ReviewForm exibe falhas de envio` | Mostra mensagem quando `onSubmit` rejeita. |
| `ReviewCard, StatsGrid, FeedActivityCard e UserPreviewCard renderizam conteúdo do domínio` | Cobre review, estatísticas, feed de review/relação social e callback de seguir usuário. |
| `PageHeading renderiza metadados de catálogo e layout alternativo de ação` | Cobre título, descrição, eyebrow, meta e ação. |
| `AuthShowcaseLayout renderiza conteúdo filho, painel de imagem e marcadores opcionais` | Cobre conteúdo filho, imagem, badge, descrição e marcadores. |
| `RestaurantCardSkeleton renderiza blocos reservados` | Confirma blocos reservados de carregamento. |

### `frontend/src/pages/__tests__/pages.test.jsx`

Suíte: `páginas públicas`

Valida telas públicas com navegação e formulários.

| Teste | Casos cobertos |
| --- | --- |
| `LandingPage renderiza navegação principal e CTAs` | Confere hero, links de entrar e criar conta. |
| `LoginPage valida campos obrigatórios e navega após login` | Cobre validação local, envio e redirecionamento para catálogo. |
| `RegisterPage valida campos e envia cadastro aceito` | Cobre validações iniciais, aceite dos termos e envio. |
| `NotFoundPage renderiza uma rota de volta ao início` | Confere título e link para `/`. |

Suíte: `páginas de catálogo e coleções`

Valida fluxos de restaurantes, wishlist e visitados.

| Teste | Casos cobertos |
| --- | --- |
| `CatalogPage carrega restaurantes e alterna wishlist` | Cobre carregamento combinado de restaurantes/listas e feedback ao salvar. |
| `WishlistPage renderiza restaurantes salvos e remove um item` | Cobre listagem de salvos e remoção da wishlist. |
| `VisitedPage renderiza restaurantes visitados e alterna status de visita` | Cobre visitados, nota do usuário e remoção de visitado. |

Suíte: `páginas sociais e de perfil`

Valida feed, perfil próprio, perfil público e edição.

| Teste | Casos cobertos |
| --- | --- |
| `FeedPage renderiza atividades e segue usuários sugeridos` | Cobre feed, sugestões e follow com refresh. |
| `MyProfilePage renderiza estatísticas e troca abas de coleção` | Cobre dados do perfil, estatísticas e abas. |
| `UserProfilePage segue outro usuário e atualiza o botão visível` | Cobre follow em perfil público e atualização local da contagem/estado. |
| `EditProfilePage salva campos de perfil normalizados e navega de volta` | Cobre edição, separação de cozinhas favoritas e redirecionamento. |

Suíte: `página de detalhe do restaurante`

Valida a tela de detalhe e interações principais.

| Teste | Casos cobertos |
| --- | --- |
| `RestaurantDetailPage carrega detalhes, alterna status e envia nota rápida` | Cobre dados do restaurante, wishlist, estrelas e criação de review rápida. |
