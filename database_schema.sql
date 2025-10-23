-- Database Schema untuk Perpustakaan
-- Jalankan script ini di PostgreSQL untuk membuat tabel

-- Tabel untuk menyimpan roles
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    nama_role VARCHAR(50) NOT NULL UNIQUE,
    deskripsi TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert data roles
INSERT INTO roles (id, nama_role, deskripsi) VALUES
(1, 'visitor', 'Hanya dapat melihat katalog, genre dan jenis buku'),
(2, 'member', 'Dapat melihat dan meminjam buku'),
(3, 'staf', 'Dapat melihat, mengubah, dan menghapus buku. Butuh approval admin untuk menambah buku baru'),
(4, 'admin', 'Role tertinggi dengan akses penuh ke semua fitur');

-- Tabel untuk menyimpan users
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    nama_lengkap VARCHAR(150),
    role_id INTEGER REFERENCES roles(id) DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample users
INSERT INTO users (id, username, email, password, nama_lengkap, role_id) VALUES
(1, 'admin', 'admin@perpustakaan.com', '$2a$10$example', 'Administrator', 4),
(2, 'staf1', 'staf1@perpustakaan.com', '$2a$10$example', 'Staf Perpustakaan 1', 3),
(3, 'member1', 'member1@example.com', '$2a$10$example', 'Member Satu', 2),
(4, 'visitor1', 'visitor1@example.com', '$2a$10$example', 'Visitor Satu', 1);

-- Tabel untuk genre buku
CREATE TABLE genre (
    id SERIAL PRIMARY KEY,
    nama_genre VARCHAR(100) NOT NULL UNIQUE,
    deskripsi TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample data untuk genre
INSERT INTO genre (id, nama_genre, deskripsi) VALUES
(1, 'Fiksi', 'Buku cerita fiksi dan novel'),
(2, 'Non-Fiksi', 'Buku berdasarkan fakta dan kenyataan'),
(3, 'Sains', 'Buku tentang ilmu pengetahuan'),
(4, 'Sejarah', 'Buku tentang peristiwa sejarah'),
(5, 'Biografi', 'Buku tentang kisah hidup seseorang'),
(6, 'Teknologi', 'Buku tentang perkembangan teknologi'),
(7, 'Pendidikan', 'Buku untuk tujuan pembelajaran');

-- Tabel untuk tags/kategori buku
CREATE TABLE tags (
    id SERIAL PRIMARY KEY,
    nama_tag VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample data untuk tags
INSERT INTO tags (id, nama_tag) VALUES
(1, 'Best Seller'),
(2, 'Buku Baru'),
(3, 'Rekomendasi'),
(4, 'Klasik'),
(5, 'Populer'),
(6, 'Anak-anak'),
(7, 'Remaja'),
(8, 'Dewasa');

-- Tabel untuk katalog buku
CREATE TABLE buku (
    id SERIAL PRIMARY KEY,
    judul VARCHAR(255) NOT NULL,
    penulis VARCHAR(150) NOT NULL,
    penerbit VARCHAR(150),
    tahun_terbit INTEGER,
    isbn VARCHAR(50) UNIQUE,
    jumlah_halaman INTEGER,
    deskripsi TEXT,
    stok_tersedia INTEGER DEFAULT 0,
    stok_total INTEGER DEFAULT 0,
    sampul_buku VARCHAR(255),
    genre_id INTEGER REFERENCES genre(id),
    is_approved BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample buku
INSERT INTO buku (id, judul, penulis, penerbit, tahun_terbit, isbn, jumlah_halaman, deskripsi, stok_tersedia, stok_total, genre_id, is_approved) VALUES
(1, 'Laskar Pelangi', 'Andrea Hirata', 'Bentang Pustaka', 2005, '9789793062792', 529, 'Novel tentang perjuangan anak-anak di Belitung', 5, 5, 1, true),
(2, 'Bumi Manusia', 'Pramoedya Ananta Toer', 'Hasta Mitra', 1980, '9789799731234', 535, 'Novel sejarah Indonesia', 3, 3, 1, true),
(3, 'Sapiens', 'Yuval Noah Harari', 'Gramedia', 2015, '9786020331447', 512, 'Sejarah singkat manusia', 4, 4, 2, true);

-- Tabel relasi buku dan tags (many to many)
CREATE TABLE buku_tags (
    id SERIAL PRIMARY KEY,
    buku_id INTEGER NOT NULL,
    tag_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(buku_id, tag_id),
    FOREIGN KEY (buku_id) REFERENCES buku(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

-- Tabel untuk request penambahan buku dari staf (menunggu approval admin)
CREATE TABLE buku_pending (
    id SERIAL PRIMARY KEY,
    judul VARCHAR(255) NOT NULL,
    penulis VARCHAR(150) NOT NULL,
    penerbit VARCHAR(150),
    tahun_terbit INTEGER,
    isbn VARCHAR(50),
    jumlah_halaman INTEGER,
    deskripsi TEXT,
    stok_tersedia INTEGER DEFAULT 0,
    stok_total INTEGER DEFAULT 0,
    sampul_buku VARCHAR(255),
    genre_id INTEGER REFERENCES genre(id),
    status VARCHAR(50) DEFAULT 'pending',
    diajukan_oleh INTEGER REFERENCES users(id),
    disetujui_oleh INTEGER REFERENCES users(id),
    catatan_admin TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel relasi buku pending dan tags
CREATE TABLE buku_pending_tags (
    id SERIAL PRIMARY KEY,
    buku_pending_id INTEGER NOT NULL,
    tag_id INTEGER NOT NULL,
    UNIQUE(buku_pending_id, tag_id),
    FOREIGN KEY (buku_pending_id) REFERENCES buku_pending(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

-- Tabel untuk peminjaman buku
CREATE TABLE peminjaman (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    buku_id INTEGER NOT NULL,
    tanggal_pinjam TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    tanggal_kembali_target TIMESTAMP NOT NULL,
    tanggal_kembali_aktual TIMESTAMP,
    status VARCHAR(50) DEFAULT 'dipinjam',
    denda DECIMAL(10, 2) DEFAULT 0,
    catatan TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (buku_id) REFERENCES buku(id) ON DELETE CASCADE
);

-- Create indexes untuk performa
CREATE INDEX idx_users_role ON users(role_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_buku_genre ON buku(genre_id);
CREATE INDEX idx_buku_judul ON buku(judul);
CREATE INDEX idx_peminjaman_user ON peminjaman(user_id);
CREATE INDEX idx_peminjaman_buku ON peminjaman(buku_id);
CREATE INDEX idx_peminjaman_status ON peminjaman(status);
CREATE INDEX idx_buku_pending_status ON buku_pending(status);

-- Create views untuk kemudahan query

-- View untuk melihat buku lengkap dengan genre dan tags
CREATE VIEW view_buku_lengkap AS
SELECT 
    b.id,
    b.judul,
    b.penulis,
    b.penerbit,
    b.tahun_terbit,
    b.isbn,
    b.jumlah_halaman,
    b.deskripsi,
    b.stok_tersedia,
    b.stok_total,
    b.sampul_buku,
    g.nama_genre,
    STRING_AGG(t.nama_tag, ', ') as tags,
    b.created_at,
    b.updated_at
FROM buku b
LEFT JOIN genre g ON b.genre_id = g.id
LEFT JOIN buku_tags bt ON b.id = bt.buku_id
LEFT JOIN tags t ON bt.tag_id = t.id
GROUP BY b.id, g.nama_genre;

-- View untuk peminjaman aktif
CREATE VIEW view_peminjaman_aktif AS
SELECT 
    p.id,
    u.username,
    u.nama_lengkap,
    b.judul,
    b.penulis,
    p.tanggal_pinjam,
    p.tanggal_kembali_target,
    p.status,
    p.denda,
    CASE 
        WHEN p.tanggal_kembali_target < CURRENT_TIMESTAMP AND p.status = 'dipinjam' 
        THEN 'Terlambat'
        ELSE 'Tepat Waktu'
    END as status_keterlambatan
FROM peminjaman p
JOIN users u ON p.user_id = u.id
JOIN buku b ON p.buku_id = b.id
WHERE p.status = 'dipinjam';

-- Function untuk update timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger untuk auto update updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_buku_updated_at BEFORE UPDATE ON buku
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_peminjaman_updated_at BEFORE UPDATE ON peminjaman
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_buku_pending_updated_at BEFORE UPDATE ON buku_pending
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function untuk update stok buku otomatis saat peminjaman
CREATE OR REPLACE FUNCTION update_stok_buku()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'dipinjam' AND (OLD.status IS NULL OR OLD.status != 'dipinjam') THEN
        UPDATE buku SET stok_tersedia = stok_tersedia - 1 WHERE id = NEW.buku_id;
    ELSIF NEW.status = 'dikembalikan' AND OLD.status = 'dipinjam' THEN
        UPDATE buku SET stok_tersedia = stok_tersedia + 1 WHERE id = NEW.buku_id;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_update_stok_buku 
AFTER INSERT OR UPDATE ON peminjaman
FOR EACH ROW EXECUTE FUNCTION update_stok_buku();

-- Memberikan komentar pada tabel untuk dokumentasi
COMMENT ON TABLE roles IS 'Tabel untuk menyimpan role user: visitor, member, staf, admin';
COMMENT ON TABLE users IS 'Tabel untuk menyimpan data user dengan role masing-masing';
COMMENT ON TABLE buku IS 'Tabel katalog buku di perpustakaan';
COMMENT ON TABLE buku_pending IS 'Tabel untuk request penambahan buku dari staf yang menunggu approval admin';
COMMENT ON TABLE peminjaman IS 'Tabel untuk mencatat peminjaman buku oleh member';
COMMENT ON TABLE genre IS 'Tabel untuk kategori genre buku';
COMMENT ON TABLE tags IS 'Tabel untuk tags/label buku';

-- Query helper untuk cek permission (bisa digunakan di backend)
COMMENT ON COLUMN roles.nama_role IS 'visitor: GET only | member: GET + POST peminjaman | staf: GET, PUT, DELETE buku (POST butuh approval) | admin: Full access';




