// D:\Projek Coding\projek_pkl\src\app\api\admin\genre\route.js
// GUNAKAN YANG INI SAJA - Hapus file lainnya jika ada duplikat
import { NextResponse } from 'next/server';
import { getDb, initDb } from '@/lib/db';
import { requireRole, ROLES } from '@/lib/roles';

export async function GET() {
  await initDb();
  const db = getDb();

  try {
    const result = await db.query(`
      SELECT * FROM genre 
      ORDER BY nama_genre ASC
    `);

    console.log('✅ Genre fetched:', result.rows.length);
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('❌ Error fetching genre:', error);
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
    const { nama_genre, deskripsi } = body;

    if (!nama_genre) {
      return NextResponse.json({ message: 'Nama genre diperlukan' }, { status: 400 });
    }

    const result = await db.query(`
      INSERT INTO genre (nama_genre, deskripsi) 
      VALUES ($1, $2) 
      RETURNING *
    `, [nama_genre, deskripsi || null]);

    console.log('✅ Genre created:', result.rows[0].nama_genre);
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error('❌ Error creating genre:', error);
    return NextResponse.json(
      { message: 'Gagal menambah genre', error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(req) {
  const { ok } = await requireRole(req, [ROLES.ADMIN]);
  if (!ok) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });

  await initDb();
  const db = getDb();

  try {
    const body = await req.json();
    const { id, nama_genre, deskripsi } = body;

    if (!id || !nama_genre) {
      return NextResponse.json({ message: 'ID dan nama genre diperlukan' }, { status: 400 });
    }

    const result = await db.query(`
      UPDATE genre 
      SET nama_genre = $1, deskripsi = $2, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $3
      RETURNING *
    `, [nama_genre, deskripsi || null, id]);

    if (result.rowCount === 0) {
      return NextResponse.json({ message: 'Genre tidak ditemukan' }, { status: 404 });
    }

    console.log('✅ Genre updated:', result.rows[0].nama_genre);
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('❌ Error updating genre:', error);
    return NextResponse.json(
      { message: 'Gagal update genre', error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req) {
  const { ok } = await requireRole(req, [ROLES.ADMIN]);
  if (!ok) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });

  await initDb();
  const db = getDb();

  try {
    const { searchParams } = new URL(req.url);
    const id = Number(searchParams.get('id'));

    if (!id) {
      return NextResponse.json({ message: 'ID diperlukan' }, { status: 400 });
    }

    const result = await db.query(`DELETE FROM genre WHERE id = $1`, [id]);

    if (result.rowCount === 0) {
      return NextResponse.json({ message: 'Genre tidak ditemukan' }, { status: 404 });
    }

    console.log('✅ Genre deleted, ID:', id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('❌ Error deleting genre:', error);
    return NextResponse.json(
      { message: 'Gagal hapus genre', error: error.message },
      { status: 500 }
    );
  }
}	