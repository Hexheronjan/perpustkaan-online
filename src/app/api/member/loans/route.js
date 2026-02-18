import { NextResponse } from 'next/server';
import { getDb, initDb, withTransaction } from '@/lib/db';
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

    await initDb();
    const body = await req.json();
    const { user_id, buku_id } = body;

    if (!user_id || !buku_id) {
        return NextResponse.json({ message: 'User ID and Book ID are required' }, { status: 400 });
    }

    try {
        await withTransaction(async (client) => {
            // Check stock
            const bookCheck = await client.query('SELECT stok_tersedia FROM buku WHERE id = $1 FOR UPDATE', [buku_id]);
            if (bookCheck.rows.length === 0) throw new Error('Book not found');
            if (bookCheck.rows[0].stok_tersedia <= 0) throw new Error('Book out of stock');

            // Calculate return date (7 days from now)
            const tanggalPinjam = new Date();
            const tanggalKembaliTarget = new Date();
            tanggalKembaliTarget.setDate(tanggalPinjam.getDate() + 7);

            // Insert loan
            await client.query(`
                INSERT INTO peminjaman (user_id, buku_id, tanggal_pinjam, tanggal_kembali_target, status)
                VALUES ($1, $2, $3, $4, 'pending')
            `, [user_id, buku_id, tanggalPinjam, tanggalKembaliTarget]);

            // Decrement stock
            await client.query('UPDATE buku SET stok_tersedia = stok_tersedia - 1 WHERE id = $1', [buku_id]);
        });

        return NextResponse.json({ message: 'Book borrowed successfully' });
    } catch (error) {
        console.error('Error borrowing book:', error);
        return NextResponse.json({ message: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
