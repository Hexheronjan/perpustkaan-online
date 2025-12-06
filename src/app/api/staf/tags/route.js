// src/app/api/staf/tags/route.js
import { NextResponse } from 'next/server';
import { getDb, initDb } from '@/lib/db';
import { requireRole, ROLES } from '@/lib/roles';

// ==========================================
// ✅ GET - Ambil semua tags (STAF & ADMIN)
// ==========================================
export async function GET(req) {
	console.log('🏷️ GET /api/staf/tags called');

	const authCheck = await requireRole(req, [ROLES.STAF, ROLES.ADMIN]);

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
		const result = await db.query(`SELECT * FROM tags ORDER BY nama_tag`);

		console.log('✅ Found', result.rows.length, 'tags');

		return NextResponse.json(result.rows);
	} catch (error) {
		console.error('❌ Error fetching tags:', error);
		return NextResponse.json({
			success: false,
			message: 'Error fetching tags',
			error: error.message
		}, { status: 500 });
	}
}

// ==========================================
// ✅ POST - Tambah tag baru (STAF & ADMIN)
// ==========================================
export async function POST(req) {
	console.log('➕ POST /api/staf/tags called');

	const authCheck = await requireRole(req, [ROLES.STAF, ROLES.ADMIN]);

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
		const { nama_tag } = body || {};

		if (!nama_tag) {
			return NextResponse.json({
				success: false,
				message: 'nama_tag diperlukan'
			}, { status: 400 });
		}

		// Cek apakah tag sudah ada
		const existingTag = await db.query(
			`SELECT id FROM tags WHERE LOWER(nama_tag) = LOWER($1)`,
			[nama_tag]
		);

		if (existingTag.rows.length > 0) {
			return NextResponse.json({
				success: false,
				message: 'Tag dengan nama tersebut sudah ada'
			}, { status: 409 });
		}

		const result = await db.query(
			`INSERT INTO tags (nama_tag) VALUES ($1) RETURNING *`,
			[nama_tag]
		);

		console.log('✅ Tag added, ID:', result.rows[0].id);

		return NextResponse.json({
			success: true,
			data: result.rows[0],
			message: 'Tag berhasil ditambahkan'
		}, { status: 201 });

	} catch (error) {
		console.error('❌ Error adding tag:', error);
		return NextResponse.json({
			success: false,
			message: 'Error adding tag',
			error: error.message
		}, { status: 500 });
	}
}

// ==========================================
// ✅ PUT - Update tag (STAF & ADMIN)
// ==========================================
export async function PUT(req) {
	console.log('✏️ PUT /api/staf/tags called');

	const authCheck = await requireRole(req, [ROLES.STAF, ROLES.ADMIN]);

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
		const { id, nama_tag } = body || {};

		if (!id || !nama_tag) {
			return NextResponse.json({
				success: false,
				message: 'id dan nama_tag diperlukan'
			}, { status: 400 });
		}

		// Cek apakah nama tag sudah digunakan oleh tag lain
		const existingTag = await db.query(
			`SELECT id FROM tags WHERE LOWER(nama_tag) = LOWER($1) AND id != $2`,
			[nama_tag, id]
		);

		if (existingTag.rows.length > 0) {
			return NextResponse.json({
				success: false,
				message: 'Tag dengan nama tersebut sudah ada'
			}, { status: 409 });
		}

		const result = await db.query(
			`UPDATE tags SET nama_tag = $1 WHERE id = $2 RETURNING *`,
			[nama_tag, id]
		);

		if (result.rowCount === 0) {
			return NextResponse.json({
				success: false,
				message: 'Tag tidak ditemukan'
			}, { status: 404 });
		}

		console.log('✅ Tag updated, ID:', id);

		return NextResponse.json({
			success: true,
			data: result.rows[0],
			message: 'Tag berhasil diupdate'
		});

	} catch (error) {
		console.error('❌ Error updating tag:', error);
		return NextResponse.json({
			success: false,
			message: 'Error updating tag',
			error: error.message
		}, { status: 500 });
	}
}

// ==========================================
// ✅ DELETE - Hapus tag (STAF & ADMIN)
// ==========================================
export async function DELETE(req) {
	console.log('🗑️ DELETE /api/staf/tags called');

	const authCheck = await requireRole(req, [ROLES.STAF, ROLES.ADMIN]);

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

		// Cek apakah tag masih digunakan oleh buku
		const booksWithTag = await db.query(
			`SELECT COUNT(*) as count FROM buku_tags WHERE tag_id = $1`,
			[id]
		);

		if (parseInt(booksWithTag.rows[0].count) > 0) {
			return NextResponse.json({
				success: false,
				message: `Tag tidak bisa dihapus karena masih digunakan oleh ${booksWithTag.rows[0].count} buku`
			}, { status: 409 });
		}

		const result = await db.query(`DELETE FROM tags WHERE id = $1`, [id]);

		if (result.rowCount === 0) {
			return NextResponse.json({
				success: false,
				message: 'Tag tidak ditemukan'
			}, { status: 404 });
		}

		console.log('✅ Tag deleted, ID:', id);

		return NextResponse.json({
			success: true,
			message: 'Tag berhasil dihapus'
		});

	} catch (error) {
		console.error('❌ Error deleting tag:', error);
		return NextResponse.json({
			success: false,
			message: 'Error deleting tag',
			error: error.message
		}, { status: 500 });
	}
}