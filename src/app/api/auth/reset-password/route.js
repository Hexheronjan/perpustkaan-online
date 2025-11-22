// src/app/api/auth/reset-password/route.js
import { NextResponse } from 'next/server';
import { getDb, initDb } from '@/lib/db';
import { hashPassword } from '@/lib/auth';

export async function POST(req) {
  try {
    await initDb();
    const db = getDb();
    
    const { username, newPassword } = await req.json();

    if (!username || !newPassword) {
      return NextResponse.json({
        success: false,
        message: 'Username dan password baru diperlukan'
      }, { status: 400 });
    }

    // Hash password baru
    console.log('🔐 Hashing password for:', username);
    const hashedPassword = await hashPassword(newPassword);
    console.log('✅ Hash generated:', hashedPassword.substring(0, 30) + '...');
    console.log('Hash length:', hashedPassword.length);

    // Update password
    const result = await db.query(`
      UPDATE users 
      SET password = $1, updated_at = CURRENT_TIMESTAMP 
      WHERE username = $2
      RETURNING id, username, email
    `, [hashedPassword, username]);

    if (result.rows.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'User tidak ditemukan'
      }, { status: 404 });
    }

    console.log('✅ Password updated for:', username);

    return NextResponse.json({
      success: true,
      message: 'Password berhasil direset',
      user: result.rows[0]
    });

  } catch (error) {
    console.error('❌ Reset password error:', error);
    return NextResponse.json({
      success: false,
      message: 'Reset password gagal',
      error: error.message
    }, { status: 500 });
  }
}