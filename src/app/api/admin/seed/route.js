// D:\Projek Coding\projek_pkl\src\app\api\admin\seed\route.js
import { NextResponse } from 'next/server';
import { getDb, initDb, withTransaction } from '@/lib/db';
import { requireRole, ROLES } from '@/lib/roles';
import { hashPassword } from '@/lib/auth';

export async function POST(req) {
	// Allow seeding without authentication for initial setup
	// const { ok } = requireRole(req, [ROLES.ADMIN]);
	// if (!ok) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
	
	try {
		await initDb();
	const db = getDb();

		let result = { roles: [], users: [], genres: [], tags: [], books: [] };

		await withTransaction(async (client) => {
			// Insert roles
			const rolesData = [
				{ id: 1, nama_role: 'visitor', deskripsi: 'Hanya dapat melihat katalog, genre dan jenis buku' },
				{ id: 2, nama_role: 'member', deskripsi: 'Dapat melihat dan meminjam buku' },
				{ id: 3, nama_role: 'staf', deskripsi: 'Dapat melihat, mengubah, dan menghapus buku. Butuh approval admin untuk menambah buku baru' },
				{ id: 4, nama_role: 'admin', deskripsi: 'Role tertinggi dengan akses penuh ke semua fitur' }
			];

			for (const role of rolesData) {
				await client.query(`
					INSERT INTO roles (id, nama_role, deskripsi) 
					VALUES ($1, $2, $3) 
					ON CONFLICT (id) DO NOTHING
				`, [role.id, role.nama_role, role.deskripsi]);
			}

			// Insert users with hashed passwords
			const adminPassword = await hashPassword('admin123');
			const stafPassword = await hashPassword('staf123');
			const memberPassword = await hashPassword('member123');

			const usersData = [
				{ id: 1, username: 'admin', email: 'admin@perpustakaan.com', password: adminPassword, nama_lengkap: 'Administrator', role_id: 4 },
				{ id: 2, username: 'staf1', email: 'staf1@perpustakaan.com', password: stafPassword, nama_lengkap: 'Staf Perpustakaan 1', role_id: 3 },
				{ id: 3, username: 'member1', email: 'member1@example.com', password: memberPassword, nama_lengkap: 'Member Satu', role_id: 2 },
				{ id: 4, username: 'visitor1', email: 'visitor1@example.com', password: await hashPassword('visitor123'), nama_lengkap: 'Visitor Satu', role_id: 1 }
			];

			for (const user of usersData) {
				await client.query(`
					INSERT INTO users (id, username, email, password, nama_lengkap, role_id) 
					VALUES ($1, $2, $3, $4, $5, $6) 
					ON CONFLICT (id) DO UPDATE SET
						username = EXCLUDED.username,
						email = EXCLUDED.email,
						password = EXCLUDED.password,
						nama_lengkap = EXCLUDED.nama_lengkap,
						role_id = EXCLUDED.role_id,
						is_active = true
				`, [user.id, user.username, user.email, user.password, user.nama_lengkap, user.role_id]);
			}

			// Insert genres
			const genresData = [
				{ id: 1, nama_genre: 'Fiksi', deskripsi: 'Buku cerita fiksi dan novel' },
				{ id: 2, nama_genre: 'Non-Fiksi', deskripsi: 'Buku berdasarkan fakta dan kenyataan' },
				{ id: 3, nama_genre: 'Sains', deskripsi: 'Buku tentang ilmu pengetahuan' },
				{ id: 4, nama_genre: 'Sejarah', deskripsi: 'Buku tentang peristiwa sejarah' },
				{ id: 5, nama_genre: 'Teknologi', deskripsi: 'Buku tentang perkembangan teknologi' }
			];

			for (const genre of genresData) {
				await client.query(`
					INSERT INTO genre (id, nama_genre, deskripsi) 
					VALUES ($1, $2, $3) 
					ON CONFLICT (id) DO NOTHING
				`, [genre.id, genre.nama_genre, genre.deskripsi]);
			}

			// Insert tags
			const tagsData = [
				{ id: 1, nama_tag: 'Best Seller' },
				{ id: 2, nama_tag: 'Buku Baru' },
				{ id: 3, nama_tag: 'Rekomendasi' },
				{ id: 4, nama_tag: 'Klasik' },
				{ id: 5, nama_tag: 'Populer' }
			];

			for (const tag of tagsData) {
				await client.query(`
					INSERT INTO tags (id, nama_tag) 
					VALUES ($1, $2) 
					ON CONFLICT (id) DO NOTHING
				`, [tag.id, tag.nama_tag]);
			}

			// Insert sample books
			const booksData = [
				{ id: 1, judul: 'Laskar Pelangi', penulis: 'Andrea Hirata', penerbit: 'Bentang Pustaka', tahun_terbit: 2005, isbn: '9789793062792', jumlah_halaman: 529, deskripsi: 'Novel tentang perjuangan anak-anak di Belitung', stok_tersedia: 5, stok_total: 5, genre_id: 1, is_approved: true },
				{ id: 2, judul: 'Bumi Manusia', penulis: 'Pramoedya Ananta Toer', penerbit: 'Hasta Mitra', tahun_terbit: 1980, isbn: '9789799731234', jumlah_halaman: 535, deskripsi: 'Novel sejarah Indonesia', stok_tersedia: 3, stok_total: 3, genre_id: 1, is_approved: true },
				{ id: 3, judul: 'Sapiens', penulis: 'Yuval Noah Harari', penerbit: 'Gramedia', tahun_terbit: 2015, isbn: '9786020331447', jumlah_halaman: 512, deskripsi: 'Sejarah singkat manusia', stok_tersedia: 4, stok_total: 4, genre_id: 2, is_approved: true }
			];

			for (const book of booksData) {
				await client.query(`
					INSERT INTO buku (id, judul, penulis, penerbit, tahun_terbit, isbn, jumlah_halaman, deskripsi, stok_tersedia, stok_total, genre_id, is_approved) 
					VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) 
					ON CONFLICT (id) DO NOTHING
				`, [book.id, book.judul, book.penulis, book.penerbit, book.tahun_terbit, book.isbn, book.jumlah_halaman, book.deskripsi, book.stok_tersedia, book.stok_total, book.genre_id, book.is_approved]);
			}

			// Get results
			const rolesResult = await client.query('SELECT * FROM roles ORDER BY id');
			const usersResult = await client.query('SELECT id, username, email, nama_lengkap, role_id FROM users ORDER BY id');
			const genresResult = await client.query('SELECT * FROM genre ORDER BY id');
			const tagsResult = await client.query('SELECT * FROM tags ORDER BY id');
			const booksResult = await client.query('SELECT * FROM buku ORDER BY id');

			result.roles = rolesResult.rows;
			result.users = usersResult.rows;
			result.genres = genresResult.rows;
			result.tags = tagsResult.rows;
			result.books = booksResult.rows;
		});

		return NextResponse.json({ 
			success: true, 
			message: 'Database seeded successfully',
			data: result 
		});
	} catch (error) {
		console.error('Seed error:', error);
		return NextResponse.json({ 
			success: false, 
			message: 'Seed failed', 
			error: error.message 
		}, { status: 500 });
	}
}







