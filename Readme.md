# Express Todo API

API sederhana untuk manajemen Todo menggunakan Express dan Prisma (MySQL).

## Fitur

- **Autentikasi API Key**  
  Semua endpoint membutuhkan header `x-api-key` yang sesuai dengan nilai `API_KEY` pada file `.env`.

- **CRUD Todo**
  - **GET /todos**  
    Mendapatkan semua todo.
  - **GET /todos/:id**  
    Mendapatkan todo berdasarkan ID.
  - **POST /todos**  
    Membuat todo baru.  
    Body:
    ```json
    {
      "title": "Judul Todo",
      "description": "Deskripsi opsional"
    }
    ```
  - **PUT /todos/:id**  
    Memperbarui todo berdasarkan ID.  
    Body:
    ```json
    {
      "title": "Judul Baru",
      "description": "Deskripsi Baru",
      "completed": true
    }
    ```
  - **DELETE /todos/:id**  
    Menghapus todo berdasarkan ID.

## Struktur Response API

### Response Sukses

```json
{
  "success": true,
  "message": "Pesan sukses",
  "data": [ ... ],      // array data utama
  "meta": { ... }       // opsional, untuk pagination
}
```

Contoh:

```json
{
  "success": true,
  "message": "Todos retrieved successfully",
  "data": [
    {
      "id": 1,
      "title": "Belajar Express",
      "description": "Praktek API",
      "completed": false
    }
  ],
  "meta": {
    "totalData": 10,
    "totalPages": 2,
    "currentPage": 1
  }
}
```

### Response Error

```json
{
  "success": false,
  "message": "Terdapat kesalahan pada input yang diberikan",
  "errors": [
    {
      "message": "completed must be a boolean value",
      "field": "completed"
    }
  ]
}
```

Contoh lain:

```json
{
  "success": false,
  "message": "Todo not found",
  "errors": []
}
```

## Instalasi & Menjalankan

1. **Clone repo & install dependencies**

   ```sh
   npm ci
   ```

2. **Set environment variable**  
   Edit file [.env](.env) sesuai kebutuhan, khususnya:

   ```
   API_KEY=12345
   APP_PORT=5000
   DATABASE_URL="mysql://root:@localhost:3306/todo_tb"
   ```

3. **Migrasi database**

   ```sh
   npx prisma migrate deploy
   ```

4. **Generate Prisma Client**

   ```sh
   npx prisma generate
   ```

5. **Jalankan server**
   ```sh
   npm start
   ```

## Autentikasi

Setiap request ke endpoint harus menyertakan header:

```
x-api-key: <API_KEY>
```

Jika tidak, akan mendapat respons 401 Unauthorized.

## Validasi

- Field `title` wajib diisi saat membuat/mengupdate todo.
- Jika validasi gagal, respons 422 akan dikirim.

## Struktur Proyek

- [controllers/TodoControllers.js](controllers/TodoControllers.js): Logika CRUD Todo.
- [middleware/Auth.js](middleware/Auth.js): Middleware autentikasi API Key.
- [middleware/TodoValidator.js](middleware/TodoValidator.js): Validasi input Todo.
- [routes/TodoRoutes.js](routes/TodoRoutes.js): Routing endpoint Todo.
- [prisma/schema.prisma](prisma/schema.prisma): Skema database.

## Deployment

- Tersedia [Dockerfile](Dockerfile) untuk deployment menggunakan Docker.
- Konfigurasi Captain (CapRover) pada [captain-definition](captain-definition).

## Catatan

- Pastikan MySQL berjalan dan database sudah dibuat sesuai `DATABASE_URL`.
- Jangan commit file `.env` ke repository publik.

---

**API ini cocok untuk belajar backend, validasi, dan deployment sederhana.**
