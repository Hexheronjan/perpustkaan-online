// src/app/api/staf/buku/route.js
// API khusus untuk STAF tanpa is_approved (backward compatible)
import { NextResponse } from 'next/server';
import { getDb, initDb, withTransaction } from '@/lib/db';
import { getRoleFromRequest, requireRole, ROLES } from '@/lib/roles';

// Helper function untuk cek apakah kolom exists
async function columnExists(db, tableName, columnName) {
  try {
    const result = await db.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = $1 AND column_name = $2
    `, [tableName, columnName]);
    return result.rows.length > 0;
  } catch (error) {
    return false;
  }
}

export async function GET(req) {
  await initDb();
  const db = getDb();
  
  // Get role dari request (JWT atau query param untuk testing)
  const role = getRoleFromRequest(req);
  
  // Izinkan STAF, ADMIN, dan VISITOR untuk melihat (tapi dengan filter berbeda)
  // Jika tidak ada role atau visitor, hanya tampilkan buku approved
  
  try {
    const hasApprovalColumn = await columnExists(db, 'buku', 'is_approved');
    const hasPendingTable = await columnExists(db, 'buku_pending', 'id');
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('user_id');
    
    let approvedBooks = [];
    let pendingBooks = [];
    
    // Fetch approved books from 'buku' table
    if (hasApprovalColumn) {
      if ((role === ROLES.STAF || role === ROLES.ADMIN) && userId) {
        const approvedQuery = `
          SELECT b.*, g.nama_genre, 'approved' as source_table
          FROM buku b 
          LEFT JOIN genre g ON b.genre_id = g.id 
          WHERE b.created_by = $1
             OR b.is_approved = true
          ORDER BY b.is_approved ASC, b.created_at DESC
        `;
        const approvedResult = await db.query(approvedQuery, [userId]);
        approvedBooks = approvedResult.rows.filter(b => b.is_approved === true);
        
        // Juga ambil buku pending dari tabel 'buku' (is_approved = false)
        const bukuPending = approvedResult.rows.filter(b => b.is_approved === false);
        pendingBooks = [...bukuPending];
      } else {
        const approvedQuery = `
          SELECT b.*, g.nama_genre, 'approved' as source_table
          FROM buku b 
          LEFT JOIN genre g ON b.genre_id = g.id 
          WHERE b.is_approved = true
          ORDER BY b.created_at DESC
        `;
        const approvedResult = await db.query(approvedQuery);
        approvedBooks = approvedResult.rows;
      }
    }
    
    // Fetch pending books from 'buku_pending' table (if exists)
    if (hasPendingTable && userId) {
      try {
        const pendingQuery = `
          SELECT 
            bp.*,
            g.nama_genre,
            'pending' as source_table,
            false as is_approved
          FROM buku_pending bp
          LEFT JOIN genre g ON bp.genre_id = g.id
          WHERE bp.diajukan_oleh = $1
          ORDER BY bp.created_at DESC
        `;
        const pendingResult = await db.query(pendingQuery, [userId]);
        pendingBooks = [...pendingBooks, ...pendingResult.rows];
      } catch (err) {
        console.warn('⚠️ buku_pending table query failed:', err.message);
      }
    }
    
    const allBooks = [...approvedBooks, ...pendingBooks];
    
    console.log(`✅ Buku fetched (role: ${role}, user_id: ${userId}):`);
    console.log(`   - Approved: ${approvedBooks.length}`);
    console.log(`   - Pending: ${pendingBooks.length}`);
    console.log(`   - Total: ${allBooks.length}`);
    
    // Return simple array (frontend akan split sendiri)
    return NextResponse.json(allBooks);
  } catch (error) {
    console.error('❌ Error fetching buku:', error);
    return NextResponse.json(
      { error: error.message }, 
      { status: 500 }
    );
  }
}

export async function POST(req) {
  // Izinkan STAF dan ADMIN
  const { ok } = requireRole(req, [ROLES.STAF, ROLES.ADMIN]);
  if (!ok) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  
  await initDb();
  const db = getDb();
  
  try {
    const body = await req.json();
    const { 
      judul, 
      penulis, 
      penerbit,
      tahun_terbit,
      isbn,
      jumlah_halaman,
      deskripsi,
      stok_tersedia = 0, 
      stok_total = 0,
      sampul_buku,
      genre_id, 
      tag_ids = [],
      user_id
    } = body;
    
    if (!judul || !penulis) {
      return NextResponse.json({ 
        message: 'Judul dan penulis wajib diisi' 
      }, { status: 400 });
    }

    const hasApprovalColumn = await columnExists(db, 'buku', 'is_approved');
    const hasCreatedByColumn = await columnExists(db, 'buku', 'created_by');
    
    const createdId = await withTransaction(async (client) => {
      let insertQuery;
      let insertValues;
      
      if (hasApprovalColumn && hasCreatedByColumn) {
        // Database dengan sistem approval
        insertQuery = `
          INSERT INTO buku (
            judul, penulis, penerbit, tahun_terbit, isbn, jumlah_halaman, 
            deskripsi, stok_tersedia, stok_total, sampul_buku, genre_id,
            is_approved, created_by
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
          RETURNING id
        `;
        insertValues = [
          judul, penulis, penerbit || null, tahun_terbit || null,
          isbn || null, jumlah_halaman || null, deskripsi || null,
          stok_tersedia, stok_total, sampul_buku || null, genre_id || null,
          false, // is_approved = false (menunggu approval)
          user_id || null
        ];
      } else {
        // Database tanpa sistem approval (backward compatible)
        insertQuery = `
          INSERT INTO buku (
            judul, penulis, penerbit, tahun_terbit, isbn, jumlah_halaman, 
            deskripsi, stok_tersedia, stok_total, sampul_buku, genre_id
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
          RETURNING id
        `;
        insertValues = [
          judul, penulis, penerbit || null, tahun_terbit || null,
          isbn || null, jumlah_halaman || null, deskripsi || null,
          stok_tersedia, stok_total, sampul_buku || null, genre_id || null
        ];
      }
      
      const insertResult = await client.query(insertQuery, insertValues);
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

    // Fetch created book
    const result = await db.query(
      `SELECT b.*, g.nama_genre 
       FROM buku b 
       LEFT JOIN genre g ON b.genre_id = g.id 
       WHERE b.id = $1`,
      [createdId]
    );
    
    const message = hasApprovalColumn 
      ? 'Buku berhasil ditambahkan, menunggu approval admin'
      : 'Buku berhasil ditambahkan';
    
    console.log(`✅ Buku created by STAF:`, result.rows[0].judul);
    
    return NextResponse.json({
      ...result.rows[0],
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

export async function PUT(req) {
  // Izinkan STAF dan ADMIN
  const { ok } = requireRole(req, [ROLES.STAF, ROLES.ADMIN]);
  if (!ok) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  
  await initDb();
  const db = getDb();
  
  try {
    const body = await req.json();
    const { id, tag_ids, nama_genre, user_id, ...updateFields } = body;
    
    if (!id) {
      return NextResponse.json({ message: 'ID diperlukan' }, { status: 400 });
    }

    const hasApprovalColumn = await columnExists(db, 'buku', 'is_approved');
    const hasCreatedByColumn = await columnExists(db, 'buku', 'created_by');
    
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
      
      // Cek ownership jika kolom created_by ada
      if (hasCreatedByColumn && user_id && book.created_by !== user_id) {
        throw new Error('Anda tidak memiliki akses untuk mengedit buku ini');
      }
      
      // Build update query
      const updates = [];
      const values = [];
      let paramCount = 0;
      
      Object.keys(updateFields).forEach(key => {
        if (updateFields[key] !== undefined && key !== 'id') {
          paramCount++;
          updates.push(`${key} = $${paramCount}`);
          values.push(updateFields[key]);
        }
      });
      
      if (updates.length > 0) {
        updates.push(`updated_at = CURRENT_TIMESTAMP`);
        
        // Set is_approved = false jika kolom ada (perlu re-approval)
        if (hasApprovalColumn) {
          paramCount++;
          updates.push(`is_approved = $${paramCount}`);
          values.push(false);
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
    
    const message = hasApprovalColumn
      ? 'Buku berhasil diupdate, menunggu approval admin'
      : 'Buku berhasil diupdate';
    
    console.log('✅ Buku updated by STAF:', result.rows[0].judul);
    
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

export async function DELETE(req) {
  // Izinkan STAF dan ADMIN
  const { ok } = requireRole(req, [ROLES.STAF, ROLES.ADMIN]);
  if (!ok) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  
  await initDb();
  const db = getDb();
  
  try {
    const { searchParams } = new URL(req.url);
    const id = Number(searchParams.get('id'));
    const userId = searchParams.get('user_id');
    
    if (!id) {
      return NextResponse.json({ message: 'ID diperlukan' }, { status: 400 });
    }
    
    const hasCreatedByColumn = await columnExists(db, 'buku', 'created_by');
    
    // Check if book exists
    const checkResult = await db.query(
      `SELECT * FROM buku WHERE id = $1`, 
      [id]
    );
    
    if (checkResult.rows.length === 0) {
      return NextResponse.json({ message: 'Buku tidak ditemukan' }, { status: 404 });
    }
    
    const book = checkResult.rows[0];
    
    // Cek ownership jika kolom created_by ada
    if (hasCreatedByColumn && userId && book.created_by !== Number(userId)) {
      return NextResponse.json({ 
        message: 'Anda tidak memiliki akses untuk menghapus buku ini' 
      }, { status: 403 });
    }
    
    await db.query(`DELETE FROM buku WHERE id = $1`, [id]);
    
    console.log('✅ Buku deleted by STAF, ID:', id);
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