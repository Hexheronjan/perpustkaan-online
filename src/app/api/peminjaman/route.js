// src/app/api/peminjaman/route.js
// API untuk member request peminjaman & staf/admin approval
import { NextResponse } from 'next/server';
import { getDb, initDb, withTransaction } from '@/lib/db';
import { getRoleFromRequest, requireRole, ROLES } from '@/lib/roles';

// GET - Ambil semua peminjaman (filtered by role)
export async function GET(req) {
  const { ok, role } = requireRole(req, [ROLES.MEMBER, ROLES.STAF, ROLES.ADMIN]);
  if (!ok) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });

  await initDb();
  const db = getDb();

  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status'); // pending, approved, rejected, dipinjam, dikembalikan
    const userId = searchParams.get('user_id');

    let query = `
      SELECT 
        p.*,
        u.username,
        u.nama_lengkap,
        u.email,
        b.judul as buku_judul,
        b.penulis as buku_penulis,
        b.sampul_buku,
        CASE 
          WHEN p.status = 'dipinjam' AND p.tanggal_kembali_target < CURRENT_TIMESTAMP 
          THEN EXTRACT(DAY FROM CURRENT_TIMESTAMP - p.tanggal_kembali_target)
          ELSE 0
        END as hari_terlambat
      FROM peminjaman p
      JOIN users u ON p.user_id = u.id
      JOIN buku b ON p.buku_id = b.id
      WHERE 1=1
    `;

    const params = [];
    let paramCount = 0;

    // Member hanya bisa lihat peminjaman sendiri
    if (role === ROLES.MEMBER) {
      const userIdFromToken = req.user?.id; // Asumsi user id ada di token
      paramCount++;
      query += ` AND p.user_id = $${paramCount}`;
      params.push(userIdFromToken);
    } else if (userId) {
      // Staf/Admin bisa filter by user
      paramCount++;
      query += ` AND p.user_id = $${paramCount}`;
      params.push(userId);
    }

    if (status) {
      paramCount++;
      query += ` AND p.status = $${paramCount}`;
      params.push(status);
    }

    query += ` ORDER BY p.created_at DESC`;

    const result = await db.query(query, params);

    // Hitung denda otomatis untuk yang terlambat
    const dataWithDenda = result.rows.map(row => {
      if (row.status === 'dipinjam' && row.hari_terlambat > 0) {
        const dendaPerHari = 2000; // Default Rp 2000/hari
        const dendaOtomatis = row.hari_terlambat * dendaPerHari;
        return {
          ...row,
          denda_otomatis: dendaOtomatis,
          total_denda: row.denda || dendaOtomatis
        };
      }
      return {
        ...row,
        denda_otomatis: 0,
        total_denda: row.denda || 0
      };
    });

    return NextResponse.json(dataWithDenda);
  } catch (error) {
    console.error('❌ Error fetching peminjaman:', error);
    return NextResponse.json({ 
      message: 'Failed to fetch peminjaman', 
      error: error.message 
    }, { status: 500 });
  }
}

// POST - Member request peminjaman buku
export async function POST(req) {
  const { ok, role } = requireRole(req, [ROLES.MEMBER]);
  if (!ok) return NextResponse.json({ message: 'Forbidden - Member only' }, { status: 403 });

  await initDb();
  const db = getDb();

  try {
    const body = await req.json();
    const { user_id, buku_id, durasi_hari = 7 } = body;

    if (!user_id || !buku_id) {
      return NextResponse.json({ 
        message: 'user_id dan buku_id diperlukan' 
      }, { status: 400 });
    }

    // Cek stok buku
    const bukuResult = await db.query(
      `SELECT stok_tersedia, judul FROM buku WHERE id = $1`,
      [buku_id]
    );

    if (bukuResult.rows.length === 0) {
      return NextResponse.json({ message: 'Buku tidak ditemukan' }, { status: 404 });
    }

    if (bukuResult.rows[0].stok_tersedia < 1) {
      return NextResponse.json({ message: 'Stok buku habis' }, { status: 400 });
    }

    // Cek apakah user masih punya peminjaman aktif untuk buku yang sama
    const activeResult = await db.query(
      `SELECT id FROM peminjaman 
       WHERE user_id = $1 AND buku_id = $2 
       AND status IN ('pending', 'dipinjam')`,
      [user_id, buku_id]
    );

    if (activeResult.rows.length > 0) {
      return NextResponse.json({ 
        message: 'Anda masih memiliki peminjaman aktif untuk buku ini' 
      }, { status: 400 });
    }

    // Calculate tanggal kembali target
    const tanggalKembaliTarget = new Date();
    tanggalKembaliTarget.setDate(tanggalKembaliTarget.getDate() + durasi_hari);

    // Insert peminjaman dengan status pending
    const insertResult = await db.query(`
      INSERT INTO peminjaman (
        user_id, buku_id, 
        tanggal_kembali_target,
        status,
        catatan
      ) VALUES ($1, $2, $3, 'pending', $4)
      RETURNING *
    `, [
      user_id, 
      buku_id, 
      tanggalKembaliTarget.toISOString(),
      `Durasi peminjaman: ${durasi_hari} hari`
    ]);

    console.log('✅ Peminjaman request created:', insertResult.rows[0].id);

    return NextResponse.json({
      success: true,
      message: 'Request peminjaman berhasil. Menunggu approval dari staf/admin.',
      data: insertResult.rows[0]
    }, { status: 201 });

  } catch (error) {
    console.error('❌ Error creating peminjaman:', error);
    return NextResponse.json({ 
      message: 'Gagal membuat request peminjaman', 
      error: error.message 
    }, { status: 500 });
  }
}

// PUT - Staf/Admin approve/reject peminjaman atau update denda
export async function PUT(req) {
  const { ok } = requireRole(req, [ROLES.STAF, ROLES.ADMIN]);
  if (!ok) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });

  await initDb();
  const db = getDb();

  try {
    const body = await req.json();
    const { id, action, denda, catatan } = body;

    if (!id) {
      return NextResponse.json({ message: 'ID peminjaman diperlukan' }, { status: 400 });
    }

    // Get current peminjaman
    const currentResult = await db.query(
      `SELECT p.*, b.stok_tersedia 
       FROM peminjaman p 
       JOIN buku b ON p.buku_id = b.id 
       WHERE p.id = $1`,
      [id]
    );

    if (currentResult.rows.length === 0) {
      return NextResponse.json({ message: 'Peminjaman tidak ditemukan' }, { status: 404 });
    }

    const current = currentResult.rows[0];

    await withTransaction(async (client) => {
      if (action === 'approve') {
        // Approve peminjaman - kurangi stok
        if (current.status !== 'pending') {
          throw new Error('Hanya peminjaman pending yang bisa diapprove');
        }

        if (current.stok_tersedia < 1) {
          throw new Error('Stok buku tidak tersedia');
        }

        await client.query(`
          UPDATE peminjaman 
          SET status = 'dipinjam', 
              tanggal_pinjam = CURRENT_TIMESTAMP,
              catatan = $1,
              updated_at = CURRENT_TIMESTAMP
          WHERE id = $2
        `, [catatan || 'Peminjaman disetujui', id]);

        // Kurangi stok
        await client.query(
          `UPDATE buku SET stok_tersedia = stok_tersedia - 1 WHERE id = $1`,
          [current.buku_id]
        );

        console.log('✅ Peminjaman approved, ID:', id);
      } 
      else if (action === 'reject') {
        // Reject peminjaman
        if (current.status !== 'pending') {
          throw new Error('Hanya peminjaman pending yang bisa direject');
        }

        await client.query(`
          UPDATE peminjaman 
          SET status = 'rejected', 
              catatan = $1,
              updated_at = CURRENT_TIMESTAMP
          WHERE id = $2
        `, [catatan || 'Peminjaman ditolak', id]);

        console.log('✅ Peminjaman rejected, ID:', id);
      }
      else if (action === 'return') {
        // Kembalikan buku
        if (current.status !== 'dipinjam') {
          throw new Error('Hanya peminjaman aktif yang bisa dikembalikan');
        }

        await client.query(`
          UPDATE peminjaman 
          SET status = 'dikembalikan',
              tanggal_kembali_aktual = CURRENT_TIMESTAMP,
              denda = $1,
              catatan = $2,
              updated_at = CURRENT_TIMESTAMP
          WHERE id = $3
        `, [denda || 0, catatan || 'Buku dikembalikan', id]);

        // Kembalikan stok
        await client.query(
          `UPDATE buku SET stok_tersedia = stok_tersedia + 1 WHERE id = $1`,
          [current.buku_id]
        );

        console.log('✅ Buku returned, ID:', id);
      }
      else if (action === 'update_denda') {
        // Update denda untuk peminjaman yang terlambat
        await client.query(`
          UPDATE peminjaman 
          SET denda = $1, 
              catatan = $2,
              updated_at = CURRENT_TIMESTAMP
          WHERE id = $3
        `, [denda || 0, catatan || 'Denda diupdate', id]);

        console.log('✅ Denda updated, ID:', id);
      }
      else {
        throw new Error('Action tidak valid: approve, reject, return, atau update_denda');
      }
    });

    // Fetch updated data
    const result = await db.query(
      `SELECT p.*, u.username, b.judul as buku_judul 
       FROM peminjaman p
       JOIN users u ON p.user_id = u.id
       JOIN buku b ON p.buku_id = b.id
       WHERE p.id = $1`,
      [id]
    );

    return NextResponse.json({
      success: true,
      message: `Peminjaman ${action} berhasil`,
      data: result.rows[0]
    });

  } catch (error) {
    console.error('❌ Error updating peminjaman:', error);
    return NextResponse.json({ 
      message: error.message || 'Gagal update peminjaman', 
      error: error.message 
    }, { status: 500 });
  }
}

// DELETE - Admin only (hard delete)
export async function DELETE(req) {
  const { ok } = requireRole(req, [ROLES.ADMIN]);
  if (!ok) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });

  await initDb();
  const db = getDb();

  try {
    const { searchParams } = new URL(req.url);
    const id = Number(searchParams.get('id'));

    if (!id) {
      return NextResponse.json({ message: 'ID diperlukan' }, { status: 400 });
    }

    const result = await db.query(`DELETE FROM peminjaman WHERE id = $1`, [id]);

    if (result.rowCount === 0) {
      return NextResponse.json({ message: 'Peminjaman tidak ditemukan' }, { status: 404 });
    }

    console.log('✅ Peminjaman deleted, ID:', id);
    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('❌ Error deleting peminjaman:', error);
    return NextResponse.json({ 
      message: 'Gagal hapus peminjaman', 
      error: error.message 
    }, { status: 500 });
  }
}