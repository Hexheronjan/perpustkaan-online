# Migrasi dari SQLite ke PostgreSQL

## Langkah-langkah Migrasi

### 1. Install Dependencies
```bash
npm install pg
npm uninstall better-sqlite3
```

### 2. Setup PostgreSQL Database

#### A. Install PostgreSQL
- Download dan install PostgreSQL dari https://www.postgresql.org/download/
- Atau gunakan Docker: `docker run --name postgres -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres`

#### B. Buat Database
```sql
CREATE DATABASE perpustakaan;
```

#### C. Jalankan Schema SQL
Copy dan jalankan SQL schema yang ada di file `database_schema.sql` (yang Anda berikan sebelumnya) di PostgreSQL.

### 3. Konfigurasi Environment Variables

Buat file `.env.local` di root project:

```env
# Option 1: Menggunakan DATABASE_URL (recommended)
DATABASE_URL=postgresql://postgres:password@localhost:5432/perpustakaan

# Option 2: Individual settings
DB_HOST=localhost
DB_PORT=5432
DB_NAME=perpustakaan
DB_USER=postgres
DB_PASSWORD=your_password
```

### 4. Update API Routes

Semua API routes sudah diupdate untuk PostgreSQL, termasuk:
- ✅ Database connection menggunakan `pg` package
- ✅ SQL syntax diubah dari SQLite ke PostgreSQL
- ✅ Boolean values menggunakan `true/false` instead of `1/0`
- ✅ Timestamp handling menggunakan PostgreSQL format
- ✅ Transaction handling menggunakan PostgreSQL client

### 5. Test Migration

```bash
npm run dev
```

Lalu test endpoint:
- `GET /api/visitor/buku` - Test basic connection
- `GET /api/admin/genre` - Test admin access
- `POST /api/member/peminjaman` - Test complex operations

## Perubahan Utama

### Database Schema
- `INTEGER PRIMARY KEY AUTOINCREMENT` → `SERIAL PRIMARY KEY`
- `TEXT` → `VARCHAR` dengan length specification
- `INTEGER` untuk boolean → `BOOLEAN`
- `datetime('now')` → `CURRENT_TIMESTAMP`
- `INSERT OR IGNORE` → `INSERT ... ON CONFLICT DO NOTHING`

### API Changes
- `db.prepare().run()` → `db.query()`
- `db.prepare().all()` → `db.query()` dengan `result.rows`
- `withTransaction()` sekarang async
- Boolean values: `!!row.is_approved` → `row.is_approved` (PostgreSQL returns actual boolean)

## Troubleshooting

### Connection Error
- Pastikan PostgreSQL service running
- Check credentials di `.env.local`
- Verify database `perpustakaan` exists

### Permission Error
- Pastikan user PostgreSQL memiliki akses ke database
- Check firewall settings untuk port 5432

### Schema Error
- Pastikan semua tabel dibuat dengan benar
- Check foreign key constraints
- Verify data types compatibility

## Rollback (jika diperlukan)

Untuk kembali ke SQLite:
```bash
npm uninstall pg
npm install better-sqlite3
```

Dan restore file `src/lib/db.js` dari backup atau git history.
