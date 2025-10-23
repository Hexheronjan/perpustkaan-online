import { NextResponse } from 'next/server';
import { getDb, initDb } from '@/lib/db';

export async function GET() {
	try {
		// Initialize database
		await initDb();
		
		// Test connection
		const db = getDb();
		const result = await db.query('SELECT NOW() as current_time, version() as postgres_version');
		
		return NextResponse.json({
			success: true,
			message: 'Database connected successfully!',
			data: {
				current_time: result.rows[0].current_time,
				postgres_version: result.rows[0].postgres_version
			}
		});
	} catch (error) {
		console.error('Database connection error:', error);
		return NextResponse.json({
			success: false,
			message: 'Database connection failed',
			error: error.message
		}, { status: 500 });
	}
}

export async function POST() {
	try {
		// Test database operations
		const db = getDb();
		
		// Test creating a simple table
		await db.query(`
			CREATE TABLE IF NOT EXISTS test_table (
				id SERIAL PRIMARY KEY,
				name VARCHAR(100),
				created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
			)
		`);
		
		// Test insert
		await db.query(`INSERT INTO test_table (name) VALUES ('Test Data')`);
		
		// Test select
		const result = await db.query(`SELECT * FROM test_table ORDER BY id DESC LIMIT 1`);
		
		// Clean up
		await db.query(`DROP TABLE IF EXISTS test_table`);
		
		return NextResponse.json({
			success: true,
			message: 'Database operations test successful!',
			data: result.rows[0]
		});
	} catch (error) {
		console.error('Database operation error:', error);
		return NextResponse.json({
			success: false,
			message: 'Database operation failed',
			error: error.message
		}, { status: 500 });
	}
}
