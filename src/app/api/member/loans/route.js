import { NextResponse } from 'next/server';
import { getDb, initDb } from '@/lib/db';
import { requireRole, ROLES } from '@/lib/roles';

export async function GET(req) {
    const authCheck = await requireRole(req, [ROLES.MEMBER]);
    if (!authCheck.ok) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        await initDb();
        const db = getDb();
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('user_id');

        if (!userId) {
            return NextResponse.json({ message: 'User ID required' }, { status: 400 });
        }

        const result = await db.query(`
      SELECT 
        p.id,
        p.tanggal_pinjam,
        p.tanggal_kembali_target,
        p.tanggal_kembali_aktual,
        p.status,
        p.denda,
        b.judul,
        b.sampul_buku
      FROM peminjaman p
      JOIN buku b ON p.buku_id = b.id
      WHERE p.user_id = $1
      ORDER BY p.tanggal_pinjam DESC
    `, [userId]);

        return NextResponse.json(result.rows);
    } catch (error) {
        console.error('Error fetching loans:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req) {
    const authCheck = await requireRole(req, [ROLES.MEMBER]);
    if (!authCheck.ok) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        await initDb();
        const db = getDb();
        const body = await req.json();
        const { user_id, buku_id } = body;

        if (!user_id || !buku_id) {
            return NextResponse.json({ message: 'User ID and Book ID are required' }, { status: 400 });
        }

        // Start transaction
        await db.query('BEGIN');

        // Check stock
        const bookCheck = await db.query('SELECT stock FROM buku WHERE id = $1 FOR UPDATE', [buku_id]);
        if (bookCheck.rows.length === 0) {
            await db.query('ROLLBACK');
            return NextResponse.json({ message: 'Book not found' }, { status: 404 });
        }

        if (bookCheck.rows[0].stock <= 0) {
            await db.query('ROLLBACK');
            return NextResponse.json({ message: 'Book out of stock' }, { status: 400 });
        }

        // Calculate return date (e.g., 7 days from now)
        const tanggalPinjam = new Date();
        const tanggalKembaliTarget = new Date();
        tanggalKembaliTarget.setDate(tanggalPinjam.getDate() + 7);

        // Insert loan
        await db.query(`
            INSERT INTO peminjaman (user_id, buku_id, tanggal_pinjam, tanggal_kembali_target, status)
            VALUES ($1, $2, $3, $4, 'dipinjam')
        `, [user_id, buku_id, tanggalPinjam, tanggalKembaliTarget]);

        // Decrement stock
        await db.query('UPDATE buku SET stock = stock - 1 WHERE id = $1', [buku_id]);

        await db.query('COMMIT');

        return NextResponse.json({ message: 'Book borrowed successfully' });
    } catch (error) {
        await getDb().query('ROLLBACK');
        console.error('Error borrowing book:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
