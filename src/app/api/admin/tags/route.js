// D:\Projek Coding\projek_pkl\src\app\api\admin\tags\route.js
import { NextResponse } from 'next/server';
import { getDb, initDb } from '@/lib/db';
import { requireRole, ROLES } from '@/lib/roles';

export async function GET() {
  await initDb();
  const db = getDb();

  try {
    const result = await db.query(`
      SELECT * FROM tags 
      ORDER BY nama_tag ASC
    `);

    console.log('✅ Tags fetched:', result.rows.length);

    // Return array langsung
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('❌ Error fetching tags:', error);
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
    const { nama_tag } = body;

    if (!nama_tag) {
      return NextResponse.json({ message: 'Nama tag diperlukan' }, { status: 400 });
    }

    const result = await db.query(`
      INSERT INTO tags (nama_tag) 
      VALUES ($1) 
      RETURNING *
    `, [nama_tag]);

    console.log('✅ Tag created:', result.rows[0].nama_tag);
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error('❌ Error creating tag:', error);
    return NextResponse.json(
      { message: 'Gagal menambah tag', error: error.message },
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
    const { id, nama_tag } = body;

    if (!id || !nama_tag) {
      return NextResponse.json({ message: 'ID dan nama tag diperlukan' }, { status: 400 });
    }

    const result = await db.query(`
      UPDATE tags 
      SET nama_tag = $1, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $2
      RETURNING *
    `, [nama_tag, id]);

    if (result.rowCount === 0) {
      return NextResponse.json({ message: 'Tag tidak ditemukan' }, { status: 404 });
    }

    console.log('✅ Tag updated:', result.rows[0].nama_tag);
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('❌ Error updating tag:', error);
    return NextResponse.json(
      { message: 'Gagal update tag', error: error.message },
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

    const result = await db.query(`DELETE FROM tags WHERE id = $1`, [id]);

    if (result.rowCount === 0) {
      return NextResponse.json({ message: 'Tag tidak ditemukan' }, { status: 404 });
    }

    console.log('✅ Tag deleted, ID:', id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('❌ Error deleting tag:', error);
    return NextResponse.json(
      { message: 'Gagal hapus tag', error: error.message },
      { status: 500 }
    );
  }
}