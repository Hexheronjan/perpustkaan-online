// src/app/api/member/books/route.js
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { requireRole, ROLES } from '@/lib/roles';

export async function GET(req) {
  try {
    const { ok } = await requireRole(req, [ROLES.MEMBER, ROLES.ADMIN]);
    if (!ok) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });

    const db = getDb();
    const result = await db.query(`
      SELECT 
        b.id,
        b.judul as title,
        b.penulis as author,
        b.penerbit as publisher,
        b.tahun_terbit as year,
        b.isbn,
        b.jumlah_halaman as pages,
        b.deskripsi as description,
        b.stok_tersedia as stock,
        b.stok_total as total_stock,
        b.sampul_buku as cover,
        b.genre_id,
        b.is_approved,
        b.created_at,
        g.nama_genre as genre_name
      FROM buku b
      LEFT JOIN genre g ON b.genre_id = g.id
      WHERE b.is_approved = true
      ORDER BY b.created_at DESC
    `);

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('❌ Member Books API Error:', error);
    return NextResponse.json({
      success: false,
      message: 'Error fetching books',
      error: error.message
    }, { status: 500 });
  }
}
