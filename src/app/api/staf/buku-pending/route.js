// src/app/api/staf/buku-pending/route.js
import { NextResponse } from 'next/server';
import { getDb, initDb } from '@/lib/db';

export async function GET(req) {
	try {
		await initDb();
		const db = getDb();
		
		const { searchParams } = new URL(req.url);
		const status = searchParams.get('status') || 'pending';
		
		const result = await db.query(`
			SELECT * FROM buku_pending 
			WHERE status = $1 
			ORDER BY created_at DESC
		`, [status]);
		
		return NextResponse.json(result.rows);
	} catch (error) {
		console.error('Error fetching buku pending:', error);
		return NextResponse.json({ 
			message: 'Error fetching data', 
			error: error.message 
		}, { status: 500 });
	}
}