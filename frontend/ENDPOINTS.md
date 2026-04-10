# ENDPOINTS Esperados - Garfada Frontend

Este documento descreve os contratos HTTP esperados para a futura integração do frontend com backend real.

## Autenticação

### `POST /api/auth/register`
- Payload:
```json
{
  "name": "Pedro Salles",
  "email": "pedro@email.com",
  "username": "pedrins",
  "password": "senhaSegura"
}
```
- Resposta `201`:
```json
{
  "token": "jwt-token",
  "user": {
    "id": "u1",
    "name": "Pedro Salles",
    "email": "pedro@email.com",
    "username": "pedrins",
    "avatarUrl": "https://...",
    "bio": "...",
    "favoriteCuisines": ["Brasileira", "Japonesa"]
  }
}
```

### `POST /api/auth/login`
- Payload:
```json
{
  "identifier": "pedrins",
  "password": "senhaSegura"
}
```
- Resposta `200`:
```json
{
  "token": "jwt-token",
  "user": {
    "id": "u1",
    "name": "Pedro Salles",
    "username": "pedrins"
  }
}
```

### `GET /api/auth/me`
- Headers: `Authorization: Bearer <token>`
- Resposta `200`:
```json
{
  "id": "u1",
  "name": "Pedro Salles",
  "username": "pedrins",
  "email": "pedro@email.com",
  "avatarUrl": "https://...",
  "bio": "...",
  "favoriteCuisines": ["Brasileira", "Japonesa"]
}
```

## Restaurantes

### `GET /api/restaurants`
- Query params opcionais:
  - `search`
  - `location`
  - `cuisine`
  - `priceRange`
  - `minRating`
- Exemplo: `/api/restaurants?search=sushi&location=Belo%20Horizonte&cuisine=Japonesa&priceRange=$$$&minRating=4`
- Resposta `200`:
```json
[
  {
    "id": "r2",
    "name": "Sakura Izakaya",
    "cuisine": "Japonesa",
    "priceRange": "$$$",
    "description": "...",
    "address": "...",
    "photos": ["https://..."],
    "menuPreview": [{ "item": "Omakase", "price": "R$ 198" }],
    "stats": {
      "averageRating": 4.7,
      "reviewsCount": 48,
      "commentsCount": 45,
      "visitsCount": 120
    }
  }
]
```

### `GET /api/restaurants/:id`
- Resposta `200`: mesmo formato do item de restaurante, com detalhes completos.

## Reviews

### `GET /api/restaurants/:id/reviews`
- Resposta `200`:
```json
[
  {
    "id": "rev10",
    "restaurantId": "r2",
    "userId": "u3",
    "rating": 4.5,
    "comment": "Excelente experiência",
    "createdAt": "2026-04-05T20:10:00.000Z",
    "user": {
      "id": "u3",
      "name": "João",
      "username": "joaonog",
      "avatarUrl": "https://..."
    }
  }
]
```

### `POST /api/restaurants/:id/reviews`
- Payload:
```json
{
  "rating": 4.5,
  "comment": "Excelente experiência"
}
```
- Resposta `201`:
```json
{
  "id": "rev11",
  "restaurantId": "r2",
  "userId": "u1",
  "rating": 4.5,
  "comment": "Excelente experiência",
  "createdAt": "2026-04-10T18:30:00.000Z"
}
```

## Lista de Desejos

### `GET /api/me/wishlist`
- Resposta `200`:
```json
[
  {
    "userId": "u1",
    "restaurantId": "r8",
    "addedAt": "2026-04-03T09:20:00.000Z",
    "restaurant": { "id": "r8", "name": "Boulangerie Lumière" }
  }
]
```

### `POST /api/restaurants/:id/wishlist`
- Resposta `201`:
```json
{
  "active": true,
  "item": {
    "userId": "u1",
    "restaurantId": "r8",
    "addedAt": "2026-04-10T18:31:00.000Z"
  }
}
```

### `DELETE /api/restaurants/:id/wishlist`
- Resposta `200`:
```json
{
  "active": false
}
```

## Visitados

### `GET /api/me/visited`
- Resposta `200`:
```json
[
  {
    "userId": "u1",
    "restaurantId": "r2",
    "visitedAt": "2026-03-22T22:15:00.000Z",
    "userRating": 4.5,
    "restaurant": { "id": "r2", "name": "Sakura Izakaya" }
  }
]
```

### `POST /api/restaurants/:id/visited`
- Payload opcional:
```json
{
  "userRating": 4.0
}
```
- Resposta `201`:
```json
{
  "active": true,
  "item": {
    "userId": "u1",
    "restaurantId": "r2",
    "visitedAt": "2026-04-10T18:31:00.000Z",
    "userRating": 4.0
  }
}
```

### `DELETE /api/restaurants/:id/visited`
- Resposta `200`:
```json
{
  "active": false
}
```

## Perfil

### `GET /api/me`
- Resposta `200`:
```json
{
  "id": "u1",
  "name": "Pedro Salles",
  "username": "pedrins",
  "bio": "...",
  "avatarUrl": "https://...",
  "favoriteCuisines": ["Brasileira"],
  "reviewsCount": 12,
  "visitedCount": 9,
  "wishlistCount": 5,
  "followersCount": 34,
  "followingCount": 18
}
```

### `PUT /api/me`
- Payload:
```json
{
  "name": "Pedro Salles",
  "username": "pedrins",
  "bio": "Nova bio",
  "avatarUrl": "https://...",
  "favoriteCuisines": ["Italiana", "Japonesa"]
}
```
- Resposta `200`: perfil atualizado no formato de `GET /api/me`.

### `GET /api/users/:id`
- Resposta `200`:
```json
{
  "id": "u2",
  "name": "Camila Prado",
  "username": "camilaprado",
  "bio": "...",
  "avatarUrl": "https://...",
  "favoriteCuisines": ["Francesa"],
  "reviewsCount": 20,
  "visitedCount": 14,
  "wishlistCount": 8,
  "followersCount": 45,
  "followingCount": 12,
  "isFollowing": true
}
```

## Social

### `GET /api/feed`
- Resposta `200`:
```json
[
  {
    "id": "feed1",
    "type": "review",
    "userId": "u2",
    "restaurantId": "r4",
    "reviewId": "rev6",
    "createdAt": "2026-04-02T21:30:00.000Z"
  }
]
```

### `GET /api/users/search?q=...`
- Exemplo: `/api/users/search?q=cami`
- Resposta `200`:
```json
[
  {
    "id": "u2",
    "name": "Camila Prado",
    "username": "camilaprado",
    "avatarUrl": "https://...",
    "isFollowing": false
  }
]
```

### `POST /api/users/:id/follow`
- Resposta `201`:
```json
{
  "isFollowing": true,
  "followersCount": 46
}
```

### `DELETE /api/users/:id/follow`
- Resposta `200`:
```json
{
  "isFollowing": false,
  "followersCount": 45
}
```

## Contratos de Entidades

Modelos tipados no frontend:
- `User`
- `Restaurant`
- `Review`
- `FeedItem`
- `WishlistItem`
- `VisitedItem`
- `AuthSession`
- `RestaurantStats`

Referência local: `src/types/models.js`.
