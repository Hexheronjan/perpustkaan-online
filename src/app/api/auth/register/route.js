// src/app/api/auth/register/route.js
import { NextResponse } from "next/server";
import { getDb, initDb } from "@/lib/db";
import { signJwt, hashPassword } from "@/lib/auth";

export async function POST(req) {
  try {
    await initDb();
    const db = getDb();
    const { username, email, password, nama_lengkap } = await req.json();

    // Validasi input
    if (!username || !email || !password) {
      return NextResponse.json(
        { success: false, message: "Username, email, dan password harus diisi" },
        { status: 400 }
      );
    }

    // Validasi format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: "Format email tidak valid" },
        { status: 400 }
      );
    }

    // Validasi panjang username
    if (username.length < 3) {
      return NextResponse.json(
        { success: false, message: "Username minimal 3 karakter" },
        { status: 400 }
      );
    }

    // Validasi panjang password
    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: "Password minimal 6 karakter" },
        { status: 400 }
      );
    }

    // Cek apakah username sudah digunakan
    const existingUsername = await db.query(
      "SELECT id FROM users WHERE username = $1",
      [username]
    );
    if (existingUsername.rows.length > 0) {
      return NextResponse.json(
        { success: false, message: "Username sudah digunakan" },
        { status: 409 }
      );
    }

    // Cek apakah email sudah digunakan
    const existingEmail = await db.query(
      "SELECT id FROM users WHERE email = $1",
      [email.toLowerCase()]
    );
    if (existingEmail.rows.length > 0) {
      return NextResponse.json(
        { success: false, message: "Email sudah terdaftar" },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Default role_id = 2 (member) untuk user baru
    const DEFAULT_ROLE_ID = 2;

    // Insert user baru
    const result = await db.query(
      `INSERT INTO users (username, email, password, nama_lengkap, role_id, is_active)
       VALUES ($1, $2, $3, $4, $5, true)
       RETURNING id, username, email, nama_lengkap, role_id`,
      [username, email.toLowerCase(), hashedPassword, nama_lengkap || username, DEFAULT_ROLE_ID]
    );
    const newUser = result.rows[0];

    // Ambil nama role
    const roleRes = await db.query(
      "SELECT nama_role FROM roles WHERE id = $1",
      [DEFAULT_ROLE_ID]
    );
    const roleName = roleRes.rows[0]?.nama_role || "member";

    // Buat JWT token (auto login setelah register)
    const payload = {
      sub: String(newUser.id),
      role: roleName,
      username: newUser.username,
    };
    const token = signJwt(payload, { expiresIn: "2h" });

    return NextResponse.json(
      {
        success: true,
        message: "Registrasi berhasil",
        accessToken: token,
        expiresIn: 7200,
        user: {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
          nama_lengkap: newUser.nama_lengkap,
          role: roleName,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Register error:", error);

    // Handle duplicate key error
    if (error.code === "23505") {
      return NextResponse.json(
        { success: false, message: "Username atau email sudah terdaftar" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Registrasi gagal", error: error.message },
      { status: 500 }
    );
  }
}