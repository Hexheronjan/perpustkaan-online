import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
	try {
		const db = getDb();
		
		// Check if buku table exists and its structure
		const tableExists = await db.query(`
			SELECT EXISTS (
				SELECT FROM information_schema.tables 
				WHERE table_schema = 'public' 
				AND table_name = 'buku'
			);
		`);
		
		if (!tableExists.rows[0].exists) {
			return NextResponse.json({
				success: false,
				message: 'Table "buku" does not exist',
				suggestion: 'Run database_schema.sql in PostgreSQL'
			});
		}
		
		// Get table structure
		const columns = await db.query(`
			SELECT column_name, data_type, is_nullable, column_default
			FROM information_schema.columns 
			WHERE table_name = 'buku' 
			ORDER BY ordinal_position;
		`);
		
		// Check if is_approved column exists
		const hasIsApproved = columns.rows.some(col => col.column_name === 'is_approved');
		
		return NextResponse.json({
			success: true,
			message: 'Table "buku" exists',
			has_is_approved: hasIsApproved,
			columns: columns.rows,
			suggestion: hasIsApproved ? 'Schema looks good' : 'Missing is_approved column - run database_schema.sql'
		});
		
	} catch (error) {
		console.error('Schema check error:', error);
		return NextResponse.json({
			success: false,
			message: 'Error checking schema',
			error: error.message
		}, { status: 500 });
	}
}




