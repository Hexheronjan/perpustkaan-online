import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const response = NextResponse.json({
      success: true,
      message: 'Logout berhasil'
    });

    // Clear the token cookie
    response.cookies.delete('token');

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({
      success: false,
      message: 'Logout gagal',
      error: error.message
    }, { status: 500 });
  }
}