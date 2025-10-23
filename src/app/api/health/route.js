import { NextResponse } from 'next/server';
import { getDb, initDb } from '@/lib/db';

export async function GET() {
	try {
		await initDb();
		const db = getDb();
		
		// Test database connection with PostgreSQL syntax
		const result = await db.query('SELECT NOW() as current_time');
		
		return NextResponse.json({ 
			status: 'ok', 
			database: 'connected',
			timestamp: result.rows[0].current_time
		});
	} catch (error) {
		console.error('Health check error:', error);
		return NextResponse.json({ 
			status: 'error', 
			message: 'Database connection failed',
			error: error.message 
		}, { status: 500 });
	}
}







