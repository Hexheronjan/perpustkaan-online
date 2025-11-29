// src/app/api/staf/buku/route.js
// SINGLE TABLE VERSION - Status: pending, approved, rejected
import { NextResponse } from 'next/server';
import { getDb, initDb, withTransaction } from '@/lib/db';
import { getRoleFromRequest, requireRole, ROLES } from '@/lib/roles';

// GET: Tampilkan buku berdasarkan role dan status
export async function GET(req) {
  await initDb();
  const db = getDb();
  const role = getRoleFromRequest(req);
  
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('user_id');
    const statusFilter = searchParams.get('status'); // 'approved', 'pending', 'rejected', 'all'
    
    let query;
    let params = [];
    
    if (role === ROLES.ADMIN) {
      // ADMIN: Lihat semua buku dengan filter status
      if (statusFilter && statusFilter !== 'all') {
        query = `
          SELECT b.*, g.nama_genre, 
                 u1.username as created_by_name,
                 u2.username as approved_by_name
          FROM buku b 
          LEFT JOIN genre g ON b.genre_id = g.id
          LEFT JOIN users u1 ON b.created_by = u1.id
          LEFT JOIN users u2 ON b.approved_by = u2.id
          WHERE b.status = $1
          ORDER BY 
            CASE b.status 
              WHEN 'pending' THEN 1 
              WHEN 'approved' THEN 2 
              WHEN 'rejected' THEN 3 
            END,
            b.created_at DESC
        `;
        params = [statusFilter];
      } else {
        query = `
          SELECT b.*, g.nama_genre,
                 u1.username as created_by_name,
                 u2.username as approved_by_name
          FROM buku b 
          LEFT JOIN genre g ON b.genre_id = g.id
          LEFT JOIN users u1 ON b.created_by = u1.id
          LEFT JOIN users u2 ON b.approved_by = u2.id
          ORDER BY 
            CASE b.status 
              WHEN 'pending' THEN 1 
              WHEN 'approved' THEN 2 
              WHEN 'rejected' THEN 3 
            END,
            b.created_at DESC
        `;
      }
    } else if (role === ROLES.STAF && userId) {
      // STAF: Lihat buku approved + buku milik sendiri (semua status)
      query = `
        SELECT b.*, g.nama_genre,
               u1.username as created_by_name,
               u2.username as approved_by_name
        FROM buku b 
        LEFT JOIN genre g ON b.genre_id = g.id
        LEFT JOIN users u1 ON b.created_by = u1.id
        LEFT JOIN users u2 ON b.approved_by = u2.id
        WHERE b.created_by = $1 
           OR b.status = 'approved'
        ORDER BY b.status ASC, b.created_at DESC
      `;
      params = [userId];
    } else {
      // VISITOR: Hanya buku approved
      query = `
        SELECT b.*, g.nama_genre
        FROM buku b 
        LEFT JOIN genre g ON b.genre_id = g.id 
        WHERE b.status = 'approved'
        ORDER BY b.created_at DESC
      `;
    }
    
    const result = await db.query(query, params);
    
    console.log(`✅ Buku fetched (role: ${role}, user_id: ${userId}):`, result.rows.length);
    
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('❌ Error fetching buku:', error);
    return NextResponse.json(
      { error: error.message }, 
      { status: 500 }
    );
  }
}

// POST: Tambah buku baru
export async function POST(req) {
  const { ok } = requireRole(req, [ROLES.STAF, ROLES.ADMIN]);
  if (!ok) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  
  await initDb();
  const db = getDb();
  const role = getRoleFromRequest(req);
  
  try {
    const body = await req.json();
    const { 
      judul, penulis, penerbit, tahun_terbit, isbn, jumlah_halaman,
      deskripsi, stok_tersedia = 0, stok_total = 0, sampul_buku,
      genre_id, tag_ids = [], user_id
    } = body;
    
    if (!judul || !penulis) {
      return NextResponse.json({ 
        message: 'Judul dan penulis wajib diisi' 
      }, { status: 400 });
    }

    const toNullableInteger = (value) => {
      if (value === undefined || value === null || value === '') return null;
      const parsed = parseInt(value, 10);
      return Number.isNaN(parsed) ? null : parsed;
    };
    
    const toNullableText = (value) => {
      if (value === undefined || value === null) return null;
      const trimmed = String(value).trim();
      return trimmed.length ? trimmed : null;
    };

    const stokTersediaNumber = Number(stok_tersedia);
    const stokTotalNumber = Number(stok_total);

    const sanitizedData = {
      judul: toNullableText(judul),
      penulis: toNullableText(penulis),
      penerbit: toNullableText(penerbit),
      tahun_terbit: toNullableInteger(tahun_terbit),
      isbn: toNullableText(isbn),
      jumlah_halaman: toNullableInteger(jumlah_halaman),
      deskripsi: toNullableText(deskripsi),
      stok_tersedia: Number.isNaN(stokTersediaNumber) ? 0 : stokTersediaNumber,
      stok_total: Number.isNaN(stokTotalNumber) ? 0 : stokTotalNumber,
      sampul_buku: toNullableText(sampul_buku),
      genre_id: toNullableInteger(genre_id),
      created_by: user_id || null,
    };

    // ADMIN: langsung approved, STAF: pending
    const status = role === ROLES.ADMIN ? 'approved' : 'pending';
    const approvedBy = role === ROLES.ADMIN ? user_id : null;
    const approvedAt = role === ROLES.ADMIN ? new Date() : null;
    
    const createdId = await withTransaction(async (client) => {
      const insertResult = await client.query(`
        INSERT INTO buku (
          judul, penulis, penerbit, tahun_terbit, isbn, jumlah_halaman, 
          deskripsi, stok_tersedia, stok_total, sampul_buku, genre_id,
          status, created_by, approved_by, approved_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        RETURNING id
      `, [
        sanitizedData.judul,
        sanitizedData.penulis,
        sanitizedData.penerbit,
        sanitizedData.tahun_terbit,
        sanitizedData.isbn,
        sanitizedData.jumlah_halaman,
        sanitizedData.deskripsi,
        sanitizedData.stok_tersedia,
        sanitizedData.stok_total,
        sanitizedData.sampul_buku,
        sanitizedData.genre_id,
        status,
        sanitizedData.created_by,
        approvedBy,
        approvedAt
      ]);
      
      const bukuId = insertResult.rows[0].id;
      
      // Insert tags
      if (Array.isArray(tag_ids) && tag_ids.length > 0) {
        for (const tagId of tag_ids) {
          await client.query(
            `INSERT INTO buku_tags (buku_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
            [bukuId, tagId]
          );
        }
      }
      
      return bukuId;
    });

    const message = status === 'approved' 
      ? 'Buku berhasil ditambahkan (langsung approved)'
      : 'Buku berhasil ditambahkan, menunggu approval admin';
    
    console.log(`✅ Buku created with status: ${status}`, judul);
    
    return NextResponse.json({
      id: createdId,
      judul,
      status,
      message
    }, { status: 201 });
  } catch (error) {
    console.error('❌ Error creating buku:', error);
    return NextResponse.json(
      { message: 'Gagal menambah buku', error: error.message }, 
      { status: 500 }
    );
  }
}

// PUT: Edit buku (STAF: kembali pending, ADMIN: tetap approved)
export async function PUT(req) {
  const { ok } = requireRole(req, [ROLES.STAF, ROLES.ADMIN]);
  if (!ok) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  
  await initDb();
  const db = getDb();
  const role = getRoleFromRequest(req);
  
  try {
    const body = await req.json();
    const { id, tag_ids, user_id, ...updateFields } = body;
    
    if (!id) {
      return NextResponse.json({ message: 'ID diperlukan' }, { status: 400 });
    }

    await withTransaction(async (client) => {
      // Check if book exists
      const checkResult = await client.query(
        `SELECT * FROM buku WHERE id = $1`, 
        [id]
      );
      
      if (checkResult.rows.length === 0) {
        throw new Error('Buku tidak ditemukan');
      }
      
      const book = checkResult.rows[0];
      
      // STAF hanya bisa edit buku milik sendiri
      if (role === ROLES.STAF && book.created_by !== user_id) {
        throw new Error('Anda tidak memiliki akses untuk mengedit buku ini');
      }
      
      // Build update query
      const updates = [];
      const values = [];
      let paramCount = 0;
      
      Object.keys(updateFields).forEach(key => {
        if (updateFields[key] !== undefined && key !== 'id' && key !== 'nama_genre') {
          paramCount++;
          updates.push(`${key} = $${paramCount}`);
          values.push(updateFields[key]);
        }
      });
      
      if (updates.length > 0) {
        updates.push(`updated_at = CURRENT_TIMESTAMP`);
        
        // STAF: set status = pending (perlu re-approval)
        // ADMIN: status tidak berubah
        if (role === ROLES.STAF) {
          paramCount++;
          updates.push(`status = $${paramCount}`);
          values.push('pending');
          
          // Reset approval info
          paramCount++;
          updates.push(`approved_by = $${paramCount}`);
          values.push(null);
          
          paramCount++;
          updates.push(`approved_at = $${paramCount}`);
          values.push(null);
        }
        
        paramCount++;
        values.push(id);
        
        await client.query(
          `UPDATE buku SET ${updates.join(', ')} WHERE id = $${paramCount}`,
          values
        );
      }
      
      // Update tags
      if (Array.isArray(tag_ids)) {
        await client.query(`DELETE FROM buku_tags WHERE buku_id = $1`, [id]);
        for (const tagId of tag_ids) {
          await client.query(
            `INSERT INTO buku_tags (buku_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
            [id, tagId]
          );
        }
      }
    });

    // Fetch updated book
    const result = await db.query(
      `SELECT b.*, g.nama_genre 
       FROM buku b 
       LEFT JOIN genre g ON b.genre_id = g.id 
       WHERE b.id = $1`,
      [id]
    );
    
    const message = role === ROLES.STAF
      ? 'Buku berhasil diupdate, menunggu re-approval admin'
      : 'Buku berhasil diupdate';
    
    console.log('✅ Buku updated:', result.rows[0].judul);
    
    return NextResponse.json({
      ...result.rows[0],
      message
    });
  } catch (error) {
    console.error('❌ Error updating buku:', error);
    return NextResponse.json(
      { message: error.message || 'Gagal update buku' }, 
      { status: error.message.includes('akses') ? 403 : 500 }
    );
  }
}

// DELETE: Hapus buku
export async function DELETE(req) {
  const { ok } = requireRole(req, [ROLES.STAF, ROLES.ADMIN]);
  if (!ok) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  
  await initDb();
  const db = getDb();
  const role = getRoleFromRequest(req);
  
  try {
    const { searchParams } = new URL(req.url);
    const id = Number(searchParams.get('id'));
    const userId = Number(searchParams.get('user_id'));
    
    if (!id) {
      return NextResponse.json({ message: 'ID diperlukan' }, { status: 400 });
    }
    
    // Check if book exists
    const checkResult = await db.query(
      `SELECT * FROM buku WHERE id = $1`, 
      [id]
    );
    
    if (checkResult.rows.length === 0) {
      return NextResponse.json({ message: 'Buku tidak ditemukan' }, { status: 404 });
    }
    
    const book = checkResult.rows[0];
    
    // STAF hanya bisa hapus buku milik sendiri
    // ADMIN bisa hapus semua
    if (role === ROLES.STAF && book.created_by !== userId) {
      return NextResponse.json({ 
        message: 'Anda tidak memiliki akses untuk menghapus buku ini' 
      }, { status: 403 });
    }
    
    await db.query(`DELETE FROM buku WHERE id = $1`, [id]);
    
    console.log('✅ Buku deleted, ID:', id);
    return NextResponse.json({ 
      success: true,
      message: 'Buku berhasil dihapus'
    });
  } catch (error) {
    console.error('❌ Error deleting buku:', error);
    return NextResponse.json(
      { message: 'Gagal hapus buku', error: error.message }, 
      { status: 500 }
    );
  }
}