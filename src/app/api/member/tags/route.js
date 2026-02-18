import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { requireRole, ROLES } from '@/lib/roles';


export async function GET(req) {
	const { ok } = await requireRole(req, [ROLES.MEMBER, ROLES.ADMIN]);
	if (!ok) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
	const db = getDb();
	const result = await db.query(`SELECT * FROM tags ORDER BY nama_tag`);
	return NextResponse.json(result.rows);
}