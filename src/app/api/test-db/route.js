import { NextResponse } from 'next/server';
import { initDb, getDb } from '@/lib/db';

export async function GET() {
	try {
		console.log('🔄 Testing DB connection...');
		await initDb();
		const db = getDb();
		const result = await db.query('SELECT NOW()');
		const genres = await db.query('SELECT COUNT(*) FROM genre');

		return NextResponse.json({
			success: true,
			timestamp: result.rows[0].now,
			genreCount: genres.rows[0].count,
			message: 'Database connection successful'
		});
	} catch (error) {
		console.error('❌ DB Connection Error:', error);
		return NextResponse.json({
			success: false,
			error: error.message,
			stack: error.stack
		}, { status: 500 });
	}
}
