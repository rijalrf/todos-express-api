# Todo API – Express.js

API sederhana untuk mengelola **resource User**, **Todo**, dan **Todo Item** dengan **autentikasi JWT**, **validasi input menggunakan express-validator**, serta **pencatatan log**.

---

## ✨ Fitur Utama

- **Auth User (JWT)**: Login menghasilkan Access Token & Refresh Token.
- **Resource Users**: CRUD User.
- **Resource Todos**: CRUD Todo.
- **Resource Todo Items**: CRUD Todo Item yang terikat pada Todo.
- **Security (express-validator)**: Validasi payload.
- **Logger**: HTTP access log (morgan) & application log (winston).

---

## ⚙️ Konfigurasi & Menjalankan

### Contoh `.env`

```
APP_PORT=3000
API_KEY=your_api_key
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173,http://localhost:3000

JWT_SECRET_ACCESS_TOKEN=your_access_secret
JWT_SECRET_REFRESH_TOKEN=your_refresh_secret

HASH_SECRET=your_hash_secret

DATABASE_URL="postgresql://user:password@localhost:5432/todo_db?schema=public"
```

### Instalasi & Run

```bash
npm install
npx prisma migrate dev   # jalankan migrasi schema Prisma
npm run dev              # development
npm start                # production
```

---

## 📚 Endpoints

### Auth

- `POST /login` → login user, hasilkan `{ accessToken, refreshToken }`
- `POST /logout` → logout user, hapus token
- `POST /token` → refresh access token menggunakan refresh token

### Users

- `GET /users` → list semua user
- `POST /users` → buat user baru

### Todos

- `GET /todos` → list semua todo
- `POST /todos` → buat todo
- `GET /todos/:id` → detail todo
- `PUT /todos/:id` → update todo
- `DELETE /todos/:id` → hapus todo

### Todo Items

- `GET /todosItems` → list semua item
- `POST /todosItems` → buat item
- `GET /todosItems/:id` → detail item
- `PUT /todosItems/:id` → update item
- `DELETE /todosItems/:id` → hapus item
