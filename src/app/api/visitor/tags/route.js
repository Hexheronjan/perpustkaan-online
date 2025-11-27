// src/app/api/visitor/tags/route.js
// FIXED VERSION - Public access, no login required
import { NextResponse } from 'next/server';
import { getDb, initDb } from '@/lib/db';

export async function GET(req) {
  try {
    await initDb();
    const db = getDb();
    
    // Public endpoint - no auth required
    const result = await db.query(`
      SELECT 
        id,
        nama_tag as name,
        created_at as createdAt
      FROM tags 
      ORDER BY nama_tag ASC
    `);
    
    console.log('✅ Visitor tags fetched:', result.rows.length);
    
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('❌ Visitor Tags API Error:', error);
    return NextResponse.json({
      success: false,
      message: 'Error fetching tags',
      error: error.message
    }, { status: 500 });
  }
}