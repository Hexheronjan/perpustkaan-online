# API Testing Guide

## Test Semua Endpoints dengan Thunder Client

### 1. **Test Database Connection**
```
GET http://localhost:3000/api/test-db
```
**Expected:** Success message dengan PostgreSQL version

### 2. **Test Schema Debug**
```
GET http://localhost:3000/api/debug/schema
```
**Expected:** Schema info dengan kolom is_approved

### 3. **Test Visitor Endpoints (No Auth Required)**
```
GET http://localhost:3000/api/visitor/buku
GET http://localhost:3000/api/visitor/genre
GET http://localhost:3000/api/visitor/tags
```
**Expected:** Data buku, genre, dan tags

### 4. **Auth Login dan Token (JWT)**
```
POST http://localhost:3000/api/auth/login
Body: { "username": "admin", "password": "your-password" }

Response: { accessToken: "<JWT>", expiresIn: 7200, user: { id, username, role } }
```

Gunakan token pada header Authorization: `Authorization: Bearer <JWT>`.

### 5. **Test Member Endpoints (Require Auth)**
```
GET http://localhost:3000/api/member/buku
Headers: Authorization: Bearer <JWT member>

GET http://localhost:3000/api/member/genre
Headers: Authorization: Bearer <JWT member>

GET http://localhost:3000/api/member/tags
Headers: Authorization: Bearer <JWT member>

POST http://localhost:3000/api/member/peminjaman
Headers: Authorization: Bearer <JWT member>
Body: {
  "user_id": 3,
  "buku_id": 1,
  "tanggal_kembali_target": "2024-01-20T00:00:00Z"
}
```

### 6. **Test Staf Endpoints (Require Auth)**
```
GET http://localhost:3000/api/staf/buku
Headers: Authorization: Bearer <JWT staf>

GET http://localhost:3000/api/staf/genre
Headers: Authorization: Bearer <JWT staf>

GET http://localhost:3000/api/staf/tags
Headers: Authorization: Bearer <JWT staf>

POST http://localhost:3000/api/staf/buku
Headers: Authorization: Bearer <JWT staf>
Body: {
  "judul": "Test Book",
  "penulis": "Test Author",
  "penerbit": "Test Publisher",
  "tahun_terbit": 2024,
  "genre_id": 1,
  "stok_tersedia": 5,
  "stok_total": 5
}
```

### 7. **Test Admin Endpoints (Require Auth)**
```
GET http://localhost:3000/api/admin/buku
Headers: Authorization: Bearer <JWT admin>

GET http://localhost:3000/api/admin/genre
Headers: Authorization: Bearer <JWT admin>

GET http://localhost:3000/api/admin/tags
Headers: Authorization: Bearer <JWT admin>

POST http://localhost:3000/api/admin/buku
Headers: Authorization: Bearer <JWT admin>
Body: {
  "judul": "Admin Book",
  "penulis": "Admin Author",
  "penerbit": "Admin Publisher",
  "tahun_terbit": 2024,
  "genre_id": 1,
  "stok_tersedia": 10,
  "stok_total": 10
}
```

### 7. **Test Buku Pending (Admin Only)**
```
GET http://localhost:3000/api/admin/buku-pending
Headers: x-role: admin

POST http://localhost:3000/api/admin/buku-pending
Headers: x-role: admin
Body: {
  "id": 1,
  "action": "approve",
  "catatan_admin": "Approved by admin"
}
```

## Expected Results:
- ✅ All GET requests return data
- ✅ POST requests create new records
- ✅ Role-based access control works
- ✅ No 500 errors



