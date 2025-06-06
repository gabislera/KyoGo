# Documentação das Rotas da API

## Autenticação e Usuário

### 1. Registrar usuário

- **POST** `/users`
- **Body:**
  \`\`\`json
  {
    "name": "string",
    "email": "string (email)",
    "password": "string"
  }
  \`\`\`
- **Resposta:** `201 Created` (sem body em caso de sucesso)
- **Erros:** `409 Conflict` se o e-mail já estiver cadastrado

---

### 2. Login (autenticação)

- **POST** `/sessions`
- **Body:**
  \`\`\`json
  {
    "email": "string (email)",
    "password": "string"
  }
  \`\`\`
- **Resposta:** `200 OK`
  \`\`\`json
  {
    "token": "jwt_token",
    "user": {
      "id": "string",
      "name": "string",
      "email": "string",
      "created_at": "date",
      "role": "USER | ADMIN"
    }
  }
  \`\`\`
  - Também retorna um cookie `refreshToken` (httpOnly) para renovação de sessão.
- **Erros:** `400 Bad Request` para credenciais inválidas

---

### 3. Refresh Token

- **PATCH** `/token/refresh`
- **Headers:** Cookie `refreshToken` obrigatório
- **Resposta:** `200 OK`
  \`\`\`json
  {
    "token": "jwt_token"
  }
  \`\`\`
  - Também retorna um novo cookie `refreshToken`.

---

### 4. Perfil do usuário autenticado

- **GET** `/me`
- **Headers:** `Authorization: Bearer <token>`
- **Resposta:** `200 OK`
  \`\`\`json
  {
    "user": {
      "id": "string",
      "name": "string",
      "email": "string",
      "created_at": "date",
      "role": "USER | ADMIN"
    }
  }
  \`\`\`

---

## Academias (Gyms)

> Todas as rotas abaixo exigem autenticação (`Authorization: Bearer <token>`).

### 5. Criar academia (apenas ADMIN)

- **POST** `/gyms`
- **Headers:** `Authorization: Bearer <token de ADMIN>`
- **Body:**
  \`\`\`json
  {
    "title": "string",
    "description": "string|null",
    "phone": "string|null",
    "latitude": number (-90 a 90),
    "longitude": number (-180 a 180)
  }
  \`\`\`
- **Resposta:** `201 Created` (sem body)

---

### 6. Buscar academias por nome

- **GET** `/gyms/search?q=termo&page=1`
- **Query Params:**
  - `q`: termo de busca (obrigatório)
  - `page`: número da página (opcional, default 1)
- **Resposta:** `200 OK`
  \`\`\`json
  {
    "gyms": [
      /* array de academias */
    ]
  }
  \`\`\`

---

### 7. Buscar academias próximas

- **GET** `/gyms/nearby?latitude=-27.2&longitude=-49.6`
- **Query Params:**
  - `latitude`: número (-90 a 90)
  - `longitude`: número (-180 a 180)
- **Resposta:** `200 OK`
  \`\`\`json
  {
    "gyms": [
      /* array de academias próximas */
    ]
  }
  \`\`\`

---

## Check-ins

> Todas as rotas abaixo exigem autenticação (`Authorization: Bearer <token>`).

### 8. Realizar check-in em uma academia

- **POST** `/gyms/:gymId/check-ins`
- **Body:**
  \`\`\`json
  {
    "latitude": number (-90 a 90),
    "longitude": number (-180 a 180)
  }
  \`\`\`
- **Resposta:** `201 Created` (sem body)

---

### 9. Histórico de check-ins do usuário

- **GET** `/check-ins/history?page=1`
- **Query Params:**
  - `page`: número da página (opcional, default 1)
- **Resposta:** `200 OK`
  \`\`\`json
  {
    "checkIns": [
      /* array de check-ins do usuário */
    ]
  }
  \`\`\`

---

### 10. Métricas de check-ins do usuário

- **GET** `/check-ins/metrics`
- **Resposta:** `200 OK`
  \`\`\`json
  {
    "checkInsCount": number
  }
  \`\`\`

---

### 11. Validar check-in (apenas ADMIN)

- **PATCH** `/check-ins/:checkInId/validate`
- **Headers:** `Authorization: Bearer <token de ADMIN>`
- **Resposta:** `204 No Content` (sem body)

---

## Observações Gerais

- Todas as rotas protegidas exigem autenticação JWT via header `Authorization: Bearer <token>`.
- Rotas de ADMIN exigem que o usuário autenticado tenha o papel `ADMIN`.
- O backend utiliza cookies httpOnly para refresh token.
- As respostas de erro seguem o padrão HTTP (400, 401, 409, etc).
