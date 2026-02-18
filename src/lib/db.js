// D:\Projek Coding\projek_pkl\src\lib\db.js
import pkg from 'pg';
const { Pool } = pkg;

let dbInstance;
let dbInitialized = false; // ✅ Flag: initDb() hanya jalan sekali

function getDatabaseConfig() {
	const url = process.env.DATABASE_URL;
	if (!url || url.trim() === '') {
		// Default PostgreSQL connection config (local development)
		return {
			host: process.env.DB_HOST || 'localhost',
			port: process.env.DB_PORT || 5432,
			database: process.env.DB_NAME || 'perpustakaan',
			user: process.env.DB_USER || 'postgres',
			password: process.env.DB_PASSWORD || 'password',
		};
	}
	// Supabase / remote PostgreSQL: gunakan connection string + SSL
	return {
		connectionString: url,
		ssl: { rejectUnauthorized: false },
	};
}

export function getDb() {
	if (!dbInstance) {
		const config = getDatabaseConfig();
		dbInstance = new Pool({
			...config,
			max: 3, // Batasi koneksi untuk serverless/Supabase pooler
		});
	}
	return dbInstance;
}

export async function initDb() {
	// ✅ Hanya jalankan sekali — skip jika sudah diinisialisasi
	if (dbInitialized) return;
	dbInitialized = true;

	const db = getDb();
	// Tables: roles, users, genre, tags, buku, buku_tags, buku_pending, buku_pending_tags, peminjaman
	await db.query(`
		-- Tabel untuk menyimpan roles
		CREATE TABLE IF NOT EXISTS roles (
			id SERIAL PRIMARY KEY,
			nama_role VARCHAR(50) NOT NULL UNIQUE,
			deskripsi TEXT,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		);

		-- Tabel untuk menyimpan users
		CREATE TABLE IF NOT EXISTS users (
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

		-- Tabel untuk genre buku
		CREATE TABLE IF NOT EXISTS genre (
			id SERIAL PRIMARY KEY,
			nama_genre VARCHAR(100) NOT NULL UNIQUE,
			deskripsi TEXT,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		);

		-- Tabel untuk tags/kategori buku
		CREATE TABLE IF NOT EXISTS tags (
			id SERIAL PRIMARY KEY,
			nama_tag VARCHAR(100) NOT NULL UNIQUE,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		);

		-- Tabel untuk katalog buku
		CREATE TABLE IF NOT EXISTS buku (
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

		-- Tabel relasi buku dan tags (many to many)
		CREATE TABLE IF NOT EXISTS buku_tags (
			id SERIAL PRIMARY KEY,
			buku_id INTEGER NOT NULL,
			tag_id INTEGER NOT NULL,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			UNIQUE(buku_id, tag_id),
			FOREIGN KEY (buku_id) REFERENCES buku(id) ON DELETE CASCADE,
			FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
		);

		-- Tabel untuk request penambahan buku dari staf (menunggu approval admin)
		CREATE TABLE IF NOT EXISTS buku_pending (
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
		CREATE TABLE IF NOT EXISTS buku_pending_tags (
			id SERIAL PRIMARY KEY,
			buku_pending_id INTEGER NOT NULL,
			tag_id INTEGER NOT NULL,
			UNIQUE(buku_pending_id, tag_id),
			FOREIGN KEY (buku_pending_id) REFERENCES buku_pending(id) ON DELETE CASCADE,
			FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
		);

		-- Tabel untuk peminjaman buku
		CREATE TABLE IF NOT EXISTS peminjaman (
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

		-- Legacy table for backward compatibility
		CREATE TABLE IF NOT EXISTS books (
			id SERIAL PRIMARY KEY,
			title VARCHAR(255) NOT NULL,
			author VARCHAR(150),
			genre_id INTEGER,
			stock INTEGER NOT NULL DEFAULT 0,
			is_approved BOOLEAN NOT NULL DEFAULT false,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY (genre_id) REFERENCES genre(id) ON DELETE SET NULL
		);

		CREATE TABLE IF NOT EXISTS book_tags (
			book_id INTEGER NOT NULL,
			tag_id INTEGER NOT NULL,
			PRIMARY KEY (book_id, tag_id),
			FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
			FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
		);

		CREATE TABLE IF NOT EXISTS borrows (
			id SERIAL PRIMARY KEY,
			book_id INTEGER NOT NULL,
			member_id VARCHAR(100) NOT NULL,
			borrowed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			returned_at TIMESTAMP,
			FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
		);

		CREATE TABLE IF NOT EXISTS approvals (
			id SERIAL PRIMARY KEY,
			book_id INTEGER NOT NULL,
			requested_by VARCHAR(100) NOT NULL,
			status VARCHAR(50) NOT NULL CHECK(status IN ('pending','approved','rejected')) DEFAULT 'pending',
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			approved_at TIMESTAMP,
			FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
		);
	`);

	// Note: Default data insertion disabled to avoid conflicts
	// Run database_schema.sql manually in PostgreSQL instead
	// await insertDefaultData(db);
}

async function insertDefaultData(db) {
	try {
		// Insert roles
		await db.query(`INSERT INTO roles (id, nama_role, deskripsi) VALUES (1, 'visitor', 'Hanya dapat melihat katalog, genre dan jenis buku') ON CONFLICT (id) DO NOTHING`);
		await db.query(`INSERT INTO roles (id, nama_role, deskripsi) VALUES (2, 'member', 'Dapat melihat dan meminjam buku') ON CONFLICT (id) DO NOTHING`);
		await db.query(`INSERT INTO roles (id, nama_role, deskripsi) VALUES (3, 'staf', 'Dapat melihat, mengubah, dan menghapus buku. Butuh approval admin untuk menambah buku baru') ON CONFLICT (id) DO NOTHING`);
		await db.query(`INSERT INTO roles (id, nama_role, deskripsi) VALUES (4, 'admin', 'Role tertinggi dengan akses penuh ke semua fitur') ON CONFLICT (id) DO NOTHING`);

		// Insert sample users
		await db.query(`INSERT INTO users (id, username, email, password, nama_lengkap, role_id) VALUES (1, 'admin', 'admin@perpustakaan.com', '$2a$10$example', 'Administrator', 4) ON CONFLICT (id) DO NOTHING`);
		await db.query(`INSERT INTO users (id, username, email, password, nama_lengkap, role_id) VALUES (2, 'staf1', 'staf1@perpustakaan.com', '$2a$10$example', 'Staf Perpustakaan 1', 3) ON CONFLICT (id) DO NOTHING`);
		await db.query(`INSERT INTO users (id, username, email, password, nama_lengkap, role_id) VALUES (3, 'member1', 'member1@example.com', '$2a$10$example', 'Member Satu', 2) ON CONFLICT (id) DO NOTHING`);
		await db.query(`INSERT INTO users (id, username, email, password, nama_lengkap, role_id) VALUES (4, 'visitor1', 'visitor1@example.com', '$2a$10$example', 'Visitor Satu', 1) ON CONFLICT (id) DO NOTHING`);

		// Insert sample genres
		await db.query(`INSERT INTO genre (id, nama_genre, deskripsi) VALUES (1, 'Fiksi', 'Buku cerita fiksi dan novel') ON CONFLICT (id) DO NOTHING`);
		await db.query(`INSERT INTO genre (id, nama_genre, deskripsi) VALUES (2, 'Non-Fiksi', 'Buku berdasarkan fakta dan kenyataan') ON CONFLICT (id) DO NOTHING`);
		await db.query(`INSERT INTO genre (id, nama_genre, deskripsi) VALUES (3, 'Sains', 'Buku tentang ilmu pengetahuan') ON CONFLICT (id) DO NOTHING`);
		await db.query(`INSERT INTO genre (id, nama_genre, deskripsi) VALUES (4, 'Sejarah', 'Buku tentang peristiwa sejarah') ON CONFLICT (id) DO NOTHING`);
		await db.query(`INSERT INTO genre (id, nama_genre, deskripsi) VALUES (5, 'Biografi', 'Buku tentang kisah hidup seseorang') ON CONFLICT (id) DO NOTHING`);
		await db.query(`INSERT INTO genre (id, nama_genre, deskripsi) VALUES (6, 'Teknologi', 'Buku tentang perkembangan teknologi') ON CONFLICT (id) DO NOTHING`);
		await db.query(`INSERT INTO genre (id, nama_genre, deskripsi) VALUES (7, 'Pendidikan', 'Buku untuk tujuan pembelajaran') ON CONFLICT (id) DO NOTHING`);

		// Insert sample tags
		await db.query(`INSERT INTO tags (id, nama_tag) VALUES (1, 'Best Seller') ON CONFLICT (id) DO NOTHING`);
		await db.query(`INSERT INTO tags (id, nama_tag) VALUES (2, 'Buku Baru') ON CONFLICT (id) DO NOTHING`);
		await db.query(`INSERT INTO tags (id, nama_tag) VALUES (3, 'Rekomendasi') ON CONFLICT (id) DO NOTHING`);
		await db.query(`INSERT INTO tags (id, nama_tag) VALUES (4, 'Klasik') ON CONFLICT (id) DO NOTHING`);
		await db.query(`INSERT INTO tags (id, nama_tag) VALUES (5, 'Populer') ON CONFLICT (id) DO NOTHING`);
		await db.query(`INSERT INTO tags (id, nama_tag) VALUES (6, 'Anak-anak') ON CONFLICT (id) DO NOTHING`);
		await db.query(`INSERT INTO tags (id, nama_tag) VALUES (7, 'Remaja') ON CONFLICT (id) DO NOTHING`);
		await db.query(`INSERT INTO tags (id, nama_tag) VALUES (8, 'Dewasa') ON CONFLICT (id) DO NOTHING`);

		// Insert sample books
		await db.query(`INSERT INTO buku (id, judul, penulis, penerbit, tahun_terbit, isbn, jumlah_halaman, deskripsi, stok_tersedia, stok_total, genre_id, is_approved) VALUES (1, 'Laskar Pelangi', 'Andrea Hirata', 'Bentang Pustaka', 2005, '9789793062792', 529, 'Novel tentang perjuangan anak-anak di Belitung', 5, 5, 1, true) ON CONFLICT (id) DO NOTHING`);
		await db.query(`INSERT INTO buku (id, judul, penulis, penerbit, tahun_terbit, isbn, jumlah_halaman, deskripsi, stok_tersedia, stok_total, genre_id, is_approved) VALUES (2, 'Bumi Manusia', 'Pramoedya Ananta Toer', 'Hasta Mitra', 1980, '9789799731234', 535, 'Novel sejarah Indonesia', 3, 3, 1, true) ON CONFLICT (id) DO NOTHING`);
		await db.query(`INSERT INTO buku (id, judul, penulis, penerbit, tahun_terbit, isbn, jumlah_halaman, deskripsi, stok_tersedia, stok_total, genre_id, is_approved) VALUES (3, 'Sapiens', 'Yuval Noah Harari', 'Gramedia', 2015, '9786020331447', 512, 'Sejarah singkat manusia', 4, 4, 2, true) ON CONFLICT (id) DO NOTHING`);
	} catch (error) {
		console.log('Error inserting default data:', error.message);
	}
}

export async function withTransaction(run) {
	const db = getDb();
	const client = await db.connect();
	try {
		await client.query('BEGIN');
		const result = await run(client);
		await client.query('COMMIT');
		return result;
	} catch (error) {
		await client.query('ROLLBACK');
		throw error;
	} finally {
		client.release();
	}
}


