// src/app/api/staf/genre/route.js
import { NextResponse } from 'next/server';
import { getDb, initDb } from '@/lib/db';
import { requireRole, ROLES } from '@/lib/roles';

// ==========================================
// ✅ GET - Ambil semua genre (STAF & ADMIN)
// ==========================================
export async function GET(req) {
	console.log('📚 GET /api/staf/genre called');
	
	const authCheck = requireRole(req, [ROLES.STAF, ROLES.ADMIN]);
	
	if (!authCheck.ok) {
		console.error('❌ UNAUTHORIZED! Your role:', authCheck.role);
		return NextResponse.json({ 
			success: false,
			message: `Akses ditolak! Role Anda: ${authCheck.role}. Butuh: staf atau admin`,
			requiredRoles: [ROLES.STAF, ROLES.ADMIN],
			yourRole: authCheck.role
		}, { status: 403 });
	}
	
	console.log('✅ AUTH PASSED! Role:', authCheck.role);
	
	try {
		await initDb();
		const db = getDb();
		const result = await db.query(`SELECT * FROM genre ORDER BY nama_genre`);
		
		console.log('✅ Found', result.rows.length, 'genres');
		
		return NextResponse.json(result.rows);
	} catch (error) {
		console.error('❌ Error fetching genres:', error);
		return NextResponse.json({ 
			success: false,
			message: 'Error fetching genres', 
			error: error.message 
		}, { status: 500 });
	}
}

// ==========================================
// ✅ POST - Tambah genre baru (STAF & ADMIN)
// ==========================================
export async function POST(req) {
	console.log('➕ POST /api/staf/genre called');
	
	const authCheck = requireRole(req, [ROLES.STAF, ROLES.ADMIN]);
	
	if (!authCheck.ok) {
		console.error('❌ UNAUTHORIZED! Your role:', authCheck.role);
		return NextResponse.json({ 
			success: false,
			message: `Akses ditolak! Role Anda: ${authCheck.role}. Butuh: staf atau admin`,
			requiredRoles: [ROLES.STAF, ROLES.ADMIN],
			yourRole: authCheck.role
		}, { status: 403 });
	}
	
	console.log('✅ AUTH PASSED! Role:', authCheck.role);
	
	try {
		await initDb();
		const db = getDb();
		const body = await req.json();
		const { nama_genre, deskripsi } = body || {};
		
		if (!nama_genre) {
			return NextResponse.json({ 
				success: false,
				message: 'nama_genre diperlukan' 
			}, { status: 400 });
		}
		
		// Cek apakah genre sudah ada
		const existingGenre = await db.query(
			`SELECT id FROM genre WHERE LOWER(nama_genre) = LOWER($1)`, 
			[nama_genre]
		);
		
		if (existingGenre.rows.length > 0) {
			return NextResponse.json({ 
				success: false,
				message: 'Genre dengan nama tersebut sudah ada' 
			}, { status: 409 });
		}
		
		const result = await db.query(
			`INSERT INTO genre (nama_genre, deskripsi) VALUES ($1, $2) RETURNING *`, 
			[nama_genre, deskripsi || null]
		);
		
		console.log('✅ Genre added, ID:', result.rows[0].id);
		
		return NextResponse.json({
			success: true,
			data: result.rows[0],
			message: 'Genre berhasil ditambahkan'
		}, { status: 201 });
		
	} catch (error) {
		console.error('❌ Error adding genre:', error);
		return NextResponse.json({ 
			success: false,
			message: 'Error adding genre', 
			error: error.message 
		}, { status: 500 });
	}
}

// ==========================================
// ✅ PUT - Update genre (STAF & ADMIN)
// ==========================================
export async function PUT(req) {
	console.log('✏️ PUT /api/staf/genre called');
	
	const authCheck = requireRole(req, [ROLES.STAF, ROLES.ADMIN]);
	
	if (!authCheck.ok) {
		console.error('❌ UNAUTHORIZED! Your role:', authCheck.role);
		return NextResponse.json({ 
			success: false,
			message: `Akses ditolak! Role Anda: ${authCheck.role}. Butuh: staf atau admin`,
			requiredRoles: [ROLES.STAF, ROLES.ADMIN],
			yourRole: authCheck.role
		}, { status: 403 });
	}
	
	console.log('✅ AUTH PASSED! Role:', authCheck.role);
	
	try {
		await initDb();
		const db = getDb();
		const body = await req.json();
		const { id, nama_genre, deskripsi } = body || {};
		
		if (!id || !nama_genre) {
			return NextResponse.json({ 
				success: false,
				message: 'id dan nama_genre diperlukan' 
			}, { status: 400 });
		}
		
		// Cek apakah nama genre sudah digunakan oleh genre lain
		const existingGenre = await db.query(
			`SELECT id FROM genre WHERE LOWER(nama_genre) = LOWER($1) AND id != $2`, 
			[nama_genre, id]
		);
		
		if (existingGenre.rows.length > 0) {
			return NextResponse.json({ 
				success: false,
				message: 'Genre dengan nama tersebut sudah ada' 
			}, { status: 409 });
		}
		
		const result = await db.query(
			`UPDATE genre SET nama_genre = $1, deskripsi = $2 WHERE id = $3 RETURNING *`, 
			[nama_genre, deskripsi || null, id]
		);
		
		if (result.rowCount === 0) {
			return NextResponse.json({ 
				success: false,
				message: 'Genre tidak ditemukan' 
			}, { status: 404 });
		}
		
		console.log('✅ Genre updated, ID:', id);
		
		return NextResponse.json({
			success: true,
			data: result.rows[0],
			message: 'Genre berhasil diupdate'
		});
		
	} catch (error) {
		console.error('❌ Error updating genre:', error);
		return NextResponse.json({ 
			success: false,
			message: 'Error updating genre', 
			error: error.message 
		}, { status: 500 });
	}
}

// ==========================================
// ✅ DELETE - Hapus genre (STAF & ADMIN)
// ==========================================
export async function DELETE(req) {
	console.log('🗑️ DELETE /api/staf/genre called');
	
	const authCheck = requireRole(req, [ROLES.STAF, ROLES.ADMIN]);
	
	if (!authCheck.ok) {
		console.error('❌ UNAUTHORIZED! Your role:', authCheck.role);
		return NextResponse.json({ 
			success: false,
			message: `Akses ditolak! Role Anda: ${authCheck.role}. Butuh: staf atau admin`,
			requiredRoles: [ROLES.STAF, ROLES.ADMIN],
			yourRole: authCheck.role
		}, { status: 403 });
	}
	
	console.log('✅ AUTH PASSED! Role:', authCheck.role);
	
	try {
		await initDb();
		const db = getDb();
		const { searchParams } = new URL(req.url);
		const id = Number(searchParams.get('id'));
		
		if (!id) {
			return NextResponse.json({ 
				success: false,
				message: 'id diperlukan' 
			}, { status: 400 });
		}
		
		// Cek apakah genre masih digunakan oleh buku
		const booksWithGenre = await db.query(
			`SELECT COUNT(*) as count FROM buku WHERE genre_id = $1`, 
			[id]
		);
		
		if (parseInt(booksWithGenre.rows[0].count) > 0) {
			return NextResponse.json({ 
				success: false,
				message: `Genre tidak bisa dihapus karena masih digunakan oleh ${booksWithGenre.rows[0].count} buku` 
			}, { status: 409 });
		}
		
		const result = await db.query(`DELETE FROM genre WHERE id = $1`, [id]);
		
		if (result.rowCount === 0) {
			return NextResponse.json({ 
				success: false,
				message: 'Genre tidak ditemukan' 
			}, { status: 404 });
		}
		
		console.log('✅ Genre deleted, ID:', id);
		
		return NextResponse.json({ 
			success: true,
			message: 'Genre berhasil dihapus'
		});
		
	} catch (error) {
		console.error('❌ Error deleting genre:', error);
		return NextResponse.json({ 
			success: false,
			message: 'Error deleting genre', 
			error: error.message 
		}, { status: 500 });
	}
}