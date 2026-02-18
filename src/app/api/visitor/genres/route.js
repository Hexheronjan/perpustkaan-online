// src/app/api/visitor/genres/route.js
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(req) {
  try {
    const db = getDb();

    // ✅ PUBLIC - No auth check
    const result = await db.query(`
      SELECT 
        id,
        nama_genre as name,
        deskripsi as description,
        created_at as "createdAt"
      FROM genre 
      ORDER BY nama_genre ASC
    `);

    console.log('✅ Visitor genres fetched:', result.rows.length);
    return NextResponse.json(result.rows);

  } catch (error) {
    console.error('❌ Visitor Genre API Error:', error);
    return NextResponse.json({
      success: false,
      message: 'Error fetching genres',
      error: error.message
    }, { status: 500 });
  }
}