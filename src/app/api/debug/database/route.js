import { NextResponse } from 'next/server';
import { getDb, initDb } from '@/lib/db';

export async function GET() {
	try {
		await initDb();
		const db = getDb();
		
		// Test basic connection
		const connectionTest = await db.query('SELECT NOW() as current_time');
		
		// Check if tables exist
		const tablesCheck = await db.query(`
			SELECT table_name 
			FROM information_schema.tables 
			WHERE table_schema = 'public' 
			AND table_name IN ('buku', 'genre', 'tags', 'roles', 'users')
			ORDER BY table_name
		`);
		
		// Check buku table structure
		const bukuColumns = await db.query(`
			SELECT column_name, data_type, is_nullable
			FROM information_schema.columns 
			WHERE table_name = 'buku' 
			ORDER BY ordinal_position
		`);
		
		// Check if there's data in buku table
		const bukuCount = await db.query('SELECT COUNT(*) as count FROM buku');
		
		// Check if is_approved column exists
		const hasIsApproved = bukuColumns.rows.some(col => col.column_name === 'is_approved');
		let bukuSample;
		
		if (hasIsApproved) {
			bukuSample = await db.query('SELECT id, judul, is_approved FROM buku LIMIT 3');
		} else {
			bukuSample = await db.query('SELECT id, judul FROM buku LIMIT 3');
		}
		
		return NextResponse.json({
			success: true,
			message: 'Database debug successful',
			data: {
				connection: connectionTest.rows[0],
				tables: tablesCheck.rows.map(t => t.table_name),
				buku_columns: bukuColumns.rows,
				has_is_approved: hasIsApproved,
				buku_count: bukuCount.rows[0].count,
				buku_sample: bukuSample.rows
			}
		});
		
	} catch (error) {
		console.error('Database Debug Error:', error);
		return NextResponse.json({
			success: false,
			message: 'Database debug failed',
			error: error.message,
			stack: error.stack
		}, { status: 500 });
	}
}

