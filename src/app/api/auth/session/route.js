// src/app/api/auth/session/route.js
import { NextResponse } from 'next/server';
import { verifyJwt } from '@/lib/auth';
import { getDb, initDb } from '@/lib/db';

export async function GET(req) {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.get('authorization') || req.headers.get('Authorization');
    if (!authHeader || !authHeader.toLowerCase().startsWith('bearer ')) {
      return NextResponse.json({
        success: false,
        message: 'Token tidak ditemukan'
      }, { status: 401 });
    }

    const token = authHeader.slice(7).trim();
    const payload = verifyJwt(token);

    if (!payload) {
      return NextResponse.json({
        success: false,
        message: 'Token tidak valid'
      }, { status: 401 });
    }

    // Get fresh user data from database
    await initDb();
    const db = getDb();
    const userRes = await db.query(`
      SELECT u.id, u.username, u.email, u.nama_lengkap, u.role_id, u.is_active, r.nama_role
      FROM users u 
      LEFT JOIN roles r ON u.role_id = r.id 
      WHERE u.id = $1 
      LIMIT 1
    `, [payload.sub]);

    if (userRes.rows.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'User tidak ditemukan'
      }, { status: 404 });
    }

    const user = userRes.rows[0];

    if (!user.is_active) {
      return NextResponse.json({
        success: false,
        message: 'Akun tidak aktif'
      }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        nama_lengkap: user.nama_lengkap,
        role: user.nama_role || 'visitor',
        role_id: user.role_id
      }
    });
  } catch (error) {
    console.error('Session check error:', error);
    return NextResponse.json({
      success: false,
      message: 'Session check gagal',
      error: error.message
    }, { status: 500 });
  }
}