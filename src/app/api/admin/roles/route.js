import { NextResponse } from 'next/server';
import { getDb, initDb } from '@/lib/db';

export async function GET() {
  await initDb();
  const db = getDb();

  try {
    const result = await db.query(`SELECT * FROM roles ORDER BY id`);
    return NextResponse.json(result.rows);
  } catch (error) {
    return NextResponse.json({ message: 'Failed to fetch roles', error: error.message }, { status: 500 });
  }
}