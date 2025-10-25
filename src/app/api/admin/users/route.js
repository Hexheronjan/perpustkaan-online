import { NextResponse } from 'next/server';
import { getDb, initDb, withTransaction } from '@/lib/db';
import { requireRole, ROLES } from '@/lib/roles';
import { hashPassword } from '@/lib/auth';

export async function GET(req) {
  const { ok } = requireRole(req, [ROLES.ADMIN]);
  if (!ok) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });

  await initDb();
  const db = getDb();

  try {
    const result = await db.query(`
      SELECT 
        u.id, u.username, u.email, u.nama_lengkap, 
        u.role_id, u.is_active, u.created_at, u.updated_at,
        r.nama_role
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      ORDER BY u.created_at DESC
    `);
    return NextResponse.json(result.rows);
  } catch (error) {
    return NextResponse.json({ message: 'Failed to fetch users', error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  const { ok } = requireRole(req, [ROLES.ADMIN]);
  if (!ok) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });

  await initDb();
  const db = getDb();

  const body = await req.json();
  const { username, email, password, nama_lengkap, role_id = 1 } = body;

  if (!username || !email || !password) {
    return NextResponse.json({ message: 'Username, email, and password required' }, { status: 400 });
  }

  try {
    const hashedPassword = await hashPassword(password);
    const result = await db.query(`
      INSERT INTO users (username, email, password, nama_lengkap, role_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, username, email, nama_lengkap, role_id, is_active, created_at
    `, [username, email, hashedPassword, nama_lengkap, role_id]);

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: 'Failed to create user', error: error.message }, { status: 500 });
  }
}

export async function PUT(req) {
  const { ok } = requireRole(req, [ROLES.ADMIN]);
  if (!ok) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });

  await initDb();
  const db = getDb();

  const body = await req.json();
  const { id, username, email, nama_lengkap, role_id, is_active } = body;

  if (!id) return NextResponse.json({ message: 'ID required' }, { status: 400 });

  try {
    const result = await db.query(`
      UPDATE users 
      SET username = COALESCE($1, username),
          email = COALESCE($2, email),
          nama_lengkap = COALESCE($3, nama_lengkap),
          role_id = COALESCE($4, role_id),
          is_active = COALESCE($5, is_active),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $6
      RETURNING id, username, email, nama_lengkap, role_id, is_active
    `, [username, email, nama_lengkap, role_id, is_active, id]);

    if (result.rowCount === 0) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    return NextResponse.json({ message: 'Failed to update user', error: error.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  const { ok } = requireRole(req, [ROLES.ADMIN]);
  if (!ok) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });

  await initDb();
  const db = getDb();

  const { searchParams } = new URL(req.url);
  const id = Number(searchParams.get('id'));

  if (!id) return NextResponse.json({ message: 'ID required' }, { status: 400 });

  try {
    const result = await db.query(`DELETE FROM users WHERE id = $1`, [id]);
    
    if (result.rowCount === 0) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ message: 'Failed to delete user', error: error.message }, { status: 500 });
  }
}