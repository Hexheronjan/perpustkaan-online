// src/app/api/staf/buku-pending/route.js
import { NextResponse } from 'next/server';
import { getDb, initDb } from '@/lib/db';
import { requireRole, ROLES } from '@/lib/roles';
import { verifyJwt } from '@/lib/auth';

// ==========================================
// ✅ GET - Lihat buku pending MILIK SENDIRI (STAF)
// ==========================================
export async function GET(req) {
	console.log('📋 GET /api/staf/buku-pending called');
	
	// ✅ AUTH CHECK - STAF dan ADMIN bisa akses
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
		
		// Get userId from token
		const authHeader = req.headers.get('authorization') || req.headers.get('Authorization');
		let userId = null;
		
		if (authHeader && authHeader.toLowerCase().startsWith('bearer ')) {
			const token = authHeader.slice(7).trim();
			const payload = verifyJwt(token);
			userId = payload?.userId;
		}
		
		if (!userId) {
			return NextResponse.json({ 
				success: false,
				message: 'User ID tidak ditemukan dalam token' 
			}, { status: 401 });
		}
		
		// Query hanya buku yang diajukan oleh user ini
		const result = await db.query(`
			SELECT 
				bp.*,
				g.nama_genre,
				array_agg(DISTINCT jsonb_build_object(
					'id', t.id, 
					'nama_tag', t.nama_tag
				)) FILTER (WHERE t.id IS NOT NULL) as tags
			FROM buku_pending bp
			LEFT JOIN genre g ON bp.genre_id = g.id
			LEFT JOIN buku_pending_tags bpt ON bp.id = bpt.buku_pending_id
			LEFT JOIN tags t ON bpt.tag_id = t.id
			WHERE bp.diajukan_oleh = $1
			GROUP BY bp.id, g.nama_genre
			ORDER BY bp.created_at DESC
		`, [userId]);
		
		console.log('✅ Found', result.rows.length, 'pending books for user', userId);
		
		return NextResponse.json({
			success: true,
			data: result.rows,
			count: result.rows.length
		});
		
	} catch (error) {
		console.error('❌ Error fetching pending books:', error);
		return NextResponse.json({ 
			success: false,
			message: 'Error fetching pending books', 
			error: error.message 
		}, { status: 500 });
	}
}

// ==========================================
// ✅ DELETE - Hapus ajuan buku MILIK SENDIRI
// ==========================================
export async function DELETE(req) {
	console.log('🗑️ DELETE /api/staf/buku-pending called');
	
	// ✅ AUTH CHECK
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
		
		// Get userId from token
		const authHeader = req.headers.get('authorization') || req.headers.get('Authorization');
		let userId = null;
		
		if (authHeader && authHeader.toLowerCase().startsWith('bearer ')) {
			const token = authHeader.slice(7).trim();
			const payload = verifyJwt(token);
			userId = payload?.userId;
		}
		
		if (!userId) {
			return NextResponse.json({ 
				success: false,
				message: 'User ID tidak ditemukan dalam token' 
			}, { status: 401 });
		}
		
		// Hanya bisa hapus buku pending milik sendiri
		const result = await db.query(
			`DELETE FROM buku_pending WHERE id = $1 AND diajukan_oleh = $2`, 
			[id, userId]
		);
		
		if (result.rowCount === 0) {
			return NextResponse.json({ 
				success: false,
				message: 'Buku pending tidak ditemukan atau bukan milik Anda' 
			}, { status: 404 });
		}
		
		console.log('✅ Pending book deleted, ID:', id);
		
		return NextResponse.json({ 
			success: true,
			message: 'Ajuan buku berhasil dibatalkan'
		});
		
	} catch (error) {
		console.error('❌ Error deleting pending book:', error);
		return NextResponse.json({ 
			success: false,
			message: 'Error deleting pending book', 
			error: error.message 
		}, { status: 500 });
	}
}