import { NextResponse } from 'next/server';
import { getDb, initDb } from '@/lib/db';

initDb();

export async function GET() {
	const db = getDb();
	const rows = db.prepare(`SELECT * FROM genres ORDER BY name`).all();
	return NextResponse.json(rows);
}







