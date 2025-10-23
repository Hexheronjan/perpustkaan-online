import { NextResponse } from 'next/server';
import { getDb, initDb } from '@/lib/db';

export async function POST(req) {
  try {
    await initDb();
    const db = getDb();
    
    // Add is_approved column to buku table
    await db.query(`
      ALTER TABLE buku 
      ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT true
    `);
    
    // Add updated_at column to genre table if not exists
    await db.query(`
      ALTER TABLE genre 
      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    `);
    
    // Add updated_at column to tags table if not exists
    await db.query(`
      ALTER TABLE tags 
      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    `);
    
    // Update existing books to be approved
    await db.query(`
      UPDATE buku 
      SET is_approved = true 
      WHERE is_approved IS NULL
    `);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Schema fixed successfully',
      changes: [
        'Added is_approved column to buku table',
        'Added updated_at column to genre table',
        'Added updated_at column to tags table',
        'Updated existing books to be approved'
      ]
    });
    
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}



