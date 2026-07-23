# Agendamento.app - Backend

Backend da plataforma SaaS de agendamento **Agendamento.app**.

## 🚀 Stack de Tecnologias

- **Node.js 18+**
- **Express.js** - Framework web
- **TypeScript** - Tipagem estática
- **PostgreSQL** - Banco de dados
- **Prisma** - ORM
- **JWT** - Autenticação
- **Helmet** - Segurança HTTP
- **CORS** - Controle de origem cruzada

## 📁 Estrutura do Projeto

```
src/
├── config/          # Configurações da aplicação
├── controllers/     # Controladores (lógica de requisição)
├── routes/          # Rotas da API
├── middleware/      # Middlewares (autenticação, validação, etc)
├── services/        # Serviços (lógica de negócio)
├── utils/          # Utilitários
└── index.ts        # Arquivo principal

prisma/
├── schema.prisma   # Schema do banco de dados
└── migrations/     # Migrações do banco

```

## 📋 Pré-requisitos

- Node.js 18 ou superior
- npm ou yarn
- PostgreSQL 12 ou superior

## 🔧 Instalação

1. **Clonar o repositório**
```bash
git clone <repo-url>
cd agendamento-backend
```

2. **Instalar dependências**
```bash
npm install
```

3. **Configurar variáveis de ambiente**
```bash
cp .env.example .env
```

Editar `.env` com suas configurações:
```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/agendamento_db
JWT_SECRET=seu_secret_super_seguro
JWT_EXPIRE=24h
CORS_ORIGIN=http://localhost:3001
```

4. **Inicializar o banco de dados**
```bash
# Gerar cliente Prisma
npm run prisma:generate

# Executar migrações
npm run prisma:migrate
```

## 🏃 Executando o Projeto

### Modo Desenvolvimento
```bash
npm run dev
```

O servidor será iniciado em `http://localhost:3000`

### Modo Produção
```bash
npm run build
npm start
```

## 📚 API Endpoints

### Autenticação

#### Registrar novo usuário
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "name": "John Doe",
  "password": "senha123"
}
```

**Resposta (201 Created):**
```json
{
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "John Doe"
  },
  "token": "eyJhbGc..."
}
```

#### Login
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "senha123"
}
```

**Resposta (200 OK):**
```json
{
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "John Doe"
  },
  "token": "eyJhbGc..."
}
```

#### Refresh Token
```http
POST /api/v1/auth/refresh
Authorization: Bearer eyJhbGc...
```

**Resposta (200 OK):**
```json
{
  "token": "eyJhbGc..."
}
```

### Usuários

#### Obter perfil autenticado
```http
GET /api/v1/users/me
Authorization: Bearer eyJhbGc...
```

**Resposta (200 OK):**
```json
{
  "id": "user_id",
  "email": "user@example.com",
  "name": "John Doe",
  "avatar": "https://...",
  "role": "user",
  "active": true,
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

#### Atualizar perfil
```http
PATCH /api/v1/users/profile
Authorization: Bearer eyJhbGc...
Content-Type: application/json

{
  "name": "Jane Doe",
  "avatar": "https://example.com/avatar.jpg"
}
```

#### Alterar senha
```http
POST /api/v1/users/change-password
Authorization: Bearer eyJhbGc...
Content-Type: application/json

{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword123"
}
```

#### Deletar conta
```http
DELETE /api/v1/users/account
Authorization: Bearer eyJhbGc...
```

## 🔐 Autenticação

A API utiliza **JWT (JSON Web Tokens)** para autenticação.

Ao fazer login ou registrar, você receberá um token que deve ser enviado em todas as requisições autenticadas no header:

```http
Authorization: Bearer <seu_token>
```

## 📝 Scripts Disponíveis

```bash
npm run dev              # Iniciar em modo desenvolvimento
npm run build            # Compilar TypeScript
npm start               # Executar versão compilada
npm run lint            # Verificar tipos TypeScript
npm run prisma:generate # Gerar cliente Prisma
npm run prisma:migrate  # Executar migrações
npm run prisma:studio   # Abrir Prisma Studio (GUI)
```

## 📦 Banco de Dados

### Schema Principal

O projeto possui as seguintes tabelas:

- **users** - Usuários da plataforma
- **calendars** - Calendários dos usuários
- **appointments** - Agendamentos
- **availabilities** - Horários de disponibilidade
- **reviews** - Avaliações

## 🛡️ Segurança

- Senhas com hash bcrypt
- JWT para autenticação
- Helmet para headers HTTP seguro
- CORS configurável
- Validação de entrada com express-validator
- Tratamento centralizado de erros

## 🚨 Tratamento de Erros

A API retorna erros padronizados:

```json
{
  "error": {
    "message": "Error message",
    "statusCode": 400,
    "timestamp": "2024-01-01T00:00:00Z",
    "path": "/api/v1/auth/login"
  }
}
```

### Códigos HTTP

- `200` - OK
- `201` - Created
- `400` - Bad Request (erro de validação)
- `401` - Unauthorized (autenticação necessária)
- `403` - Forbidden (sem permissão)
- `404` - Not Found
- `500` - Internal Server Error

## 📖 Próximos Passos

- [ ] Adicionar testes unitários e de integração
- [ ] Implementar endpoints de calendários
- [ ] Implementar endpoints de agendamentos
- [ ] Adicionar integração com email
- [ ] Implementar rate limiting
- [ ] Documentação Swagger/OpenAPI

## 🤝 Contribuindo

1. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
2. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
3. Push para a branch (`git push origin feature/AmazingFeature`)
4. Abra um Pull Request

## 📄 Licença

MIT
