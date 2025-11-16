// D:\Projek Coding\projek_pkl\src\app\api\admin\buku-pending\route.js
import { NextResponse } from 'next/server';
import { getDb, initDb, withTransaction } from '@/lib/db';
import { requireRole, ROLES } from '@/lib/roles';

export async function GET(req) {
  const { ok } = requireRole(req, [ROLES.ADMIN]);
  if (!ok) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  
  await initDb();
  const db = getDb();
  
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || 'pending';
    
    const result = await db.query(`
      SELECT 
        bp.*,
        g.nama_genre,
        u1.username as diajukan_oleh_username,
        u2.username as disetujui_oleh_username
      FROM buku_pending bp
      LEFT JOIN genre g ON bp.genre_id = g.id
      LEFT JOIN users u1 ON bp.diajukan_oleh = u1.id
      LEFT JOIN users u2 ON bp.disetujui_oleh = u2.id
      WHERE bp.status = $1
      ORDER BY bp.created_at DESC
    `, [status]);
    
    console.log('✅ Buku pending fetched:', result.rows.length);
    
    // Return array langsung
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('❌ Error fetching buku pending:', error);
    return NextResponse.json(
      { error: error.message }, 
      { status: 500 }
    );
  }
}

export async function POST(req) {
  const { ok } = requireRole(req, [ROLES.ADMIN]);
  if (!ok) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  
  await initDb();
  const db = getDb();
  
  try {
    const body = await req.json();
    const { id, action, catatan_admin, disetujui_oleh = 1 } = body;
    
    if (!id || !action) {
      return NextResponse.json({ 
        message: 'ID dan action (approve/reject) diperlukan' 
      }, { status: 400 });
    }

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json({ 
        message: 'Action harus approve atau reject' 
      }, { status: 400 });
    }

    await withTransaction(async (client) => {
      // Get pending book
      const pendingResult = await client.query(
        `SELECT * FROM buku_pending WHERE id = $1 AND status = 'pending'`,
        [id]
      );
      
      if (pendingResult.rows.length === 0) {
        throw new Error('Buku pending tidak ditemukan atau sudah diproses');
      }
      
      const pending = pendingResult.rows[0];

      if (action === 'approve') {
        // Insert into main buku table
        const insertResult = await client.query(`
          INSERT INTO buku (
            judul, penulis, penerbit, tahun_terbit, isbn, jumlah_halaman,
            deskripsi, stok_tersedia, stok_total, sampul_buku, genre_id, is_approved
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, true)
          RETURNING id
        `, [
          pending.judul, pending.penulis, pending.penerbit,
          pending.tahun_terbit, pending.isbn, pending.jumlah_halaman,
          pending.deskripsi, pending.stok_tersedia, pending.stok_total,
          pending.sampul_buku, pending.genre_id
        ]);
        
        const bukuId = insertResult.rows[0].id;
        
        // Copy tags from pending to main table
        const tagsResult = await client.query(
          `SELECT tag_id FROM buku_pending_tags WHERE buku_pending_id = $1`,
          [id]
        );
        
        for (const tag of tagsResult.rows) {
          await client.query(
            `INSERT INTO buku_tags (buku_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
            [bukuId, tag.tag_id]
          );
        }
        
        console.log('✅ Buku approved and added to catalog, ID:', bukuId);
      }

      // Update pending status
      const newStatus = action === 'approve' ? 'approved' : 'rejected';
      await client.query(`
        UPDATE buku_pending 
        SET status = $1, disetujui_oleh = $2, catatan_admin = $3, updated_at = CURRENT_TIMESTAMP
        WHERE id = $4
      `, [newStatus, disetujui_oleh, catatan_admin || null, id]);
      
      console.log(`✅ Buku pending ${newStatus}, ID:`, id);
    });

    // Fetch updated pending book
    const result = await db.query(
      `SELECT bp.*, g.nama_genre 
       FROM buku_pending bp 
       LEFT JOIN genre g ON bp.genre_id = g.id 
       WHERE bp.id = $1`,
      [id]
    );
    
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('❌ Error processing approval:', error);
    return NextResponse.json(
      { message: error.message || 'Proses approval gagal' }, 
      { status: 500 }
    );
  }
}