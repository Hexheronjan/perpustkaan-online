// D:\Projek Coding\projek_pkl\src\app\api\admin\buku-pending\route.js
import { NextResponse } from 'next/server';
import { getDb, initDb, withTransaction } from '@/lib/db';
import { requireRole, ROLES } from '@/lib/roles';

export async function GET(req) {
  const { ok } = await requireRole(req, [ROLES.ADMIN]);
  if (!ok) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });

  await initDb();
  const db = getDb();

  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || 'pending';

    const result = await db.query(`
      SELECT 
        b.*,
        g.nama_genre,
        u1.username as diajukan_oleh_username,
        u2.username as disetujui_oleh_username
      FROM buku b
      LEFT JOIN genre g ON b.genre_id = g.id
      LEFT JOIN users u1 ON b.created_by = u1.id
      LEFT JOIN users u2 ON b.approved_by = u2.id
      WHERE b.status = $1
      ORDER BY b.created_at DESC
    `, [status]);

    console.log('✅ Buku pending fetched:', result.rows.length);

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
  const { ok } = await requireRole(req, [ROLES.ADMIN]);
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
      // Check if book exists
      const bookResult = await client.query(
        `SELECT * FROM buku WHERE id = $1`,
        [id]
      );

      if (bookResult.rows.length === 0) {
        throw new Error('Buku tidak ditemukan');
      }

      const newStatus = action === 'approve' ? 'approved' : 'rejected';

      await client.query(`
        UPDATE buku 
        SET status = $1, approved_by = $2, approved_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
        WHERE id = $3
      `, [newStatus, disetujui_oleh, id]);

      console.log(`✅ Buku ${newStatus}, ID:`, id);
    });

    // Fetch updated book
    const result = await db.query(
      `SELECT b.*, g.nama_genre 
       FROM buku b 
       LEFT JOIN genre g ON b.genre_id = g.id 
       WHERE b.id = $1`,
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