// src/app/api/auth/logout/route.js
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    // For JWT-based auth, logout is handled client-side
    // Just return success response
    return NextResponse.json({
      success: true,
      message: 'Logout berhasil'
    });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({
      success: false,
      message: 'Logout gagal',
      error: error.message
    }, { status: 500 });
  }
}