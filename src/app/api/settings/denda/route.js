// src/app/api/settings/denda/route.js
// API untuk mengatur denda dan konfigurasi peminjaman
import { NextResponse } from 'next/server';
import { getDb, initDb } from '@/lib/db';
import { requireRole, ROLES } from '@/lib/roles';

// Tabel untuk menyimpan settings
// Jalankan SQL ini di database:
/*
CREATE TABLE IF NOT EXISTS settings (
  id SERIAL PRIMARY KEY,
  key VARCHAR(100) NOT NULL UNIQUE,
  value TEXT NOT NULL,
  description TEXT,
  updated_by INTEGER REFERENCES users(id),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default settings
INSERT INTO settings (key, value, description) VALUES
('denda_per_hari', '2000', 'Denda keterlambatan per hari dalam Rupiah'),
('durasi_pinjam_default', '7', 'Durasi peminjaman default dalam hari'),
('max_durasi_pinjam', '30', 'Maksimal durasi peminjaman dalam hari'),
('denda_hilang', '50000', 'Denda buku hilang/rusak dalam Rupiah')
ON CONFLICT (key) DO NOTHING;
*/

// GET - Ambil pengaturan denda
export async function GET(req) {
  try {
    await initDb();
    const db = getDb();

    const result = await db.query(`
      SELECT key, value, description 
      FROM settings 
      WHERE key IN ('denda_per_hari', 'durasi_pinjam_default', 'max_durasi_pinjam', 'denda_hilang')
    `);

    // Convert to object
    const settings = {};
    result.rows.forEach(row => {
      settings[row.key] = row.key.includes('denda') || row.key.includes('durasi')
        ? Number(row.value)
        : row.value;
    });

    // Default values jika belum ada di database
    const defaultSettings = {
      denda_per_hari: 2000,
      durasi_pinjam_default: 7,
      max_durasi_pinjam: 30,
      denda_hilang: 50000
    };

    return NextResponse.json({ ...defaultSettings, ...settings });
  } catch (error) {
    console.error('❌ Error fetching settings:', error);
    // Return default values on error
    return NextResponse.json({
      denda_per_hari: 2000,
      durasi_pinjam_default: 7,
      max_durasi_pinjam: 30,
      denda_hilang: 50000
    });
  }
}

// PUT - Update pengaturan denda (Admin & Staf only)
export async function PUT(req) {
  const { ok } = await requireRole(req, [ROLES.STAF, ROLES.ADMIN]);
  if (!ok) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });

  await initDb();
  const db = getDb();

  try {
    const body = await req.json();
    const {
      denda_per_hari,
      durasi_pinjam_default,
      max_durasi_pinjam,
      denda_hilang
    } = body;

    // Validasi
    if (denda_per_hari < 0 || durasi_pinjam_default < 1 || max_durasi_pinjam < 7) {
      return NextResponse.json({
        message: 'Nilai tidak valid'
      }, { status: 400 });
    }

    // Update each setting
    const settings = {
      denda_per_hari,
      durasi_pinjam_default,
      max_durasi_pinjam,
      denda_hilang
    };

    for (const [key, value] of Object.entries(settings)) {
      await db.query(`
        INSERT INTO settings (key, value, updated_at)
        VALUES ($1, $2, CURRENT_TIMESTAMP)
        ON CONFLICT (key) 
        DO UPDATE SET value = $2, updated_at = CURRENT_TIMESTAMP
      `, [key, String(value)]);
    }

    console.log('✅ Settings updated');

    return NextResponse.json({
      success: true,
      message: 'Pengaturan berhasil diupdate',
      data: settings
    });

  } catch (error) {
    console.error('❌ Error updating settings:', error);
    return NextResponse.json({
      message: 'Gagal update pengaturan',
      error: error.message
    }, { status: 500 });
  }
}