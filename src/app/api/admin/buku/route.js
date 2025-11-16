// D:\Projek Coding\projek_pkl\src\app\api\admin\buku\route.js
// VERSION: Tanpa is_approved (jika column belum ada di database)
import { NextResponse } from 'next/server';
import { getDb, initDb, withTransaction } from '@/lib/db';
import { getRoleFromRequest, requireRole, ROLES } from '@/lib/roles';

export async function GET(req) {
  await initDb();
  const role = getRoleFromRequest(req);
  const db = getDb();
  
  try {
    // Query TANPA is_approved
    const query = `
      SELECT b.*, g.nama_genre 
      FROM buku b 
      LEFT JOIN genre g ON b.genre_id = g.id 
      ORDER BY b.created_at DESC
    `;
    
    const result = await db.query(query);
    
    console.log('✅ Buku fetched:', result.rows.length);
    
    // Return array langsung
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('❌ Error fetching buku:', error);
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
      tag_ids = [] 
    } = body;
    
    if (!judul || !penulis) {
      return NextResponse.json({ 
        message: 'Judul dan penulis wajib diisi' 
      }, { status: 400 });
    }

    const createdId = await withTransaction(async (client) => {
      // Insert buku TANPA is_approved
      const insertResult = await client.query(`
        INSERT INTO buku (
          judul, penulis, penerbit, tahun_terbit, isbn, jumlah_halaman, 
          deskripsi, stok_tersedia, stok_total, sampul_buku, genre_id
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING id
      `, [
        judul, penulis, penerbit || null, tahun_terbit || null,
        isbn || null, jumlah_halaman || null, deskripsi || null,
        stok_tersedia, stok_total, sampul_buku || null, genre_id || null
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

    // Fetch created book with genre name
    const result = await db.query(
      `SELECT b.*, g.nama_genre 
       FROM buku b 
       LEFT JOIN genre g ON b.genre_id = g.id 
       WHERE b.id = $1`,
      [createdId]
    );
    
    console.log('✅ Buku created:', result.rows[0].judul);
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error('❌ Error creating buku:', error);
    return NextResponse.json(
      { message: 'Gagal menambah buku', error: error.message }, 
      { status: 500 }
    );
  }
}

export async function PUT(req) {
  const { ok } = requireRole(req, [ROLES.ADMIN]);
  if (!ok) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  
  await initDb();
  const db = getDb();
  
  try {
    const body = await req.json();
    const { id, tag_ids, nama_genre, ...updateFields } = body;
    
    if (!id) {
      return NextResponse.json({ message: 'ID diperlukan' }, { status: 400 });
    }

    await withTransaction(async (client) => {
      // Check if book exists
      const checkResult = await client.query(`SELECT * FROM buku WHERE id = $1`, [id]);
      if (checkResult.rows.length === 0) {
        throw new Error('Buku tidak ditemukan');
      }
      
      // Build update query dynamically - SKIP is_approved jika ada
      const updates = [];
      const values = [];
      let paramCount = 0;
      
      Object.keys(updateFields).forEach(key => {
        if (updateFields[key] !== undefined && key !== 'id' && key !== 'is_approved') {
          paramCount++;
          updates.push(`${key} = $${paramCount}`);
          values.push(updateFields[key]);
        }
      });
      
      if (updates.length > 0) {
        updates.push(`updated_at = CURRENT_TIMESTAMP`);
        paramCount++;
        values.push(id);
        
        await client.query(
          `UPDATE buku SET ${updates.join(', ')} WHERE id = $${paramCount}`,
          values
        );
      }
      
      // Update tags if provided
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
    
    console.log('✅ Buku updated:', result.rows[0].judul);
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('❌ Error updating buku:', error);
    return NextResponse.json(
      { message: 'Gagal update buku', error: error.message }, 
      { status: 500 }
    );
  }
}

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
    
    const result = await db.query(`DELETE FROM buku WHERE id = $1`, [id]);
    
    if (result.rowCount === 0) {
      return NextResponse.json({ message: 'Buku tidak ditemukan' }, { status: 404 });
    }
    
    console.log('✅ Buku deleted, ID:', id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('❌ Error deleting buku:', error);
    return NextResponse.json(
      { message: 'Gagal hapus buku', error: error.message }, 
      { status: 500 }
    );
  }
}