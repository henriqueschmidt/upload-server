# 📤 Upload Server

API de upload de imagens construída com **Fastify** e **TypeScript**, com armazenamento de arquivos no **Cloudflare R2** e persistência de metadados em **PostgreSQL** via **Drizzle ORM**. Permite enviar imagens, listar/paginar uploads e exportar relatórios em CSV.

---

## ✨ Funcionalidades

- 🖼️ **Upload de imagens** com validação de tipo (`jpeg`, `png`, `webp`, `jpg`) e limite de tamanho (2 MB).
- 📃 **Listagem de uploads** com busca, paginação e ordenação.
- 📊 **Exportação em CSV** processada via streaming e enviada direto para o storage (sem carregar tudo em memória).
- 📚 **Documentação OpenAPI** gerada automaticamente e disponível em `/docs` (Swagger UI).
- ✅ **Testes** com Vitest e CI no GitHub Actions.

---

## 🧱 Stack

| Camada         | Tecnologia                                             |
| -------------- | ------------------------------------------------------ |
| Runtime        | Node.js 22+                                            |
| Framework      | [Fastify](https://fastify.dev) 5                       |
| Validação      | [Zod](https://zod.dev) + `fastify-type-provider-zod`   |
| Banco de dados | PostgreSQL + [Drizzle ORM](https://orm.drizzle.team)   |
| Storage        | Cloudflare R2 (`@aws-sdk/client-s3` + `lib-storage`)   |
| Testes         | [Vitest](https://vitest.dev)                           |
| Lint/Format    | [Biome](https://biomejs.dev)                           |
| Gerenciador    | pnpm 11                                                |

---

## 🏛️ Arquitetura

O projeto separa as responsabilidades entre camada de aplicação e infraestrutura:

```
src/
├── app/
│   ├── functions/        # Casos de uso (upload-image, get-upload, export-uploads)
│   └── shared/           # Utilitários (padrão Either para tratamento de erros)
├── infra/
│   ├── db/               # Conexão, schema e migrations do Drizzle
│   ├── http/             # Servidor Fastify e rotas
│   └── storage/          # Cliente e upload para o Cloudflare R2
└── env.ts                # Validação das variáveis de ambiente
```

> As funções de caso de uso retornam um `Either<Error, Success>`, deixando o tratamento de erro explícito e tipado em vez de lançar exceções.

---

## 🚀 Como rodar

### Pré-requisitos

- Node.js 22+
- pnpm 11+
- Docker (para subir o PostgreSQL)

### 1. Instalar dependências

```bash
pnpm install
```

### 2. Configurar variáveis de ambiente

Crie um arquivo `.env` na raiz:

```env
PORT=3333
NODE_ENV=development

# Database
DATABASE_URL="postgresql://docker:docker@localhost:5454/upload"

# Cloudflare R2
CLOUDFLARE_ACCOUNT_ID="seu-account-id"
CLOUDFLARE_ACCESS_KEY_ID="sua-access-key"
CLOUDFLARE_SECRET_KEY_ID="sua-secret-key"
CLOUDFLARE_BUCKET="seu-bucket"
CLOUDFLARE_PUBLIC_URL="https://sua-url-publica.r2.dev"
```

### 3. Subir o banco de dados

```bash
docker compose up -d
```

### 4. Aplicar as migrations

```bash
pnpm db:migrate
```

### 5. Iniciar o servidor

```bash
pnpm dev
```

O servidor sobe em `http://localhost:3333` e a documentação fica em `http://localhost:3333/docs`.

---

## 📡 Endpoints

| Método | Rota              | Descrição                                             |
| ------ | ----------------- | ----------------------------------------------------- |
| `POST` | `/uploads`        | Faz upload de uma imagem (`multipart/form-data`).     |
| `GET`  | `/uploads`        | Lista uploads com busca, paginação e ordenação.       |
| `GET`  | `/uploads/export` | Gera um CSV dos uploads e retorna a URL do relatório. |

### `GET /uploads` — query params

| Param           | Tipo                | Padrão | Descrição                    |
| --------------- | ------------------- | ------ | ---------------------------- |
| `searchQuery`   | `string`            | —      | Filtra pelo nome do arquivo. |
| `page`          | `number`            | `1`    | Página atual.                |
| `pageSize`      | `number`            | `15`   | Itens por página.            |
| `sortBy`        | `'createdAt'`       | —      | Campo de ordenação.          |
| `sortDirection` | `'asc'` \| `'desc'` | —      | Direção da ordenação.        |

---

## 🧪 Testes

Os testes usam o arquivo `.env.test` e um banco PostgreSQL de teste (`upload_test`).

```bash
# Aplica as migrations no banco de teste
pnpm dotenv -e .env.test -- drizzle-kit migrate

# Roda a suíte
pnpm test

# Modo watch
pnpm test:watch
```

> O upload para o R2 é mockado nos testes; apenas o PostgreSQL precisa estar de pé.

---

## 📜 Scripts

| Script             | Descrição                               |
| ------------------ | --------------------------------------- |
| `pnpm dev`         | Inicia o servidor em modo watch.        |
| `pnpm test`        | Roda os testes uma vez.                 |
| `pnpm test:watch`  | Roda os testes em modo watch.           |
| `pnpm db:generate` | Gera migrations a partir do schema.     |
| `pnpm db:migrate`  | Aplica as migrations no banco.          |
| `pnpm db:push`     | Sincroniza o schema direto com o banco. |
| `pnpm db:studio`   | Abre o Drizzle Studio.                  |

---

## 🔄 CI

O workflow [`E2E Tests`](.github/workflows/test.yml) roda a cada pull request para a `main`: sobe um PostgreSQL, instala dependências com pnpm, aplica as migrations e executa a suíte de testes.
