import { NextResponse } from 'next/server';
import { getDb, initDb } from '@/lib/db';
import { requireRole, ROLES, getRoleFromRequest } from '@/lib/roles';

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

        // 1. Active Loans
        const activeLoansResult = await db.query(
            `SELECT COUNT(*) as count FROM peminjaman WHERE user_id = $1 AND status = 'dipinjam'`,
            [userId]
        );
        const activeLoans = parseInt(activeLoansResult.rows[0].count);

        // 2. Due Soon (within 3 days)
        const dueSoonResult = await db.query(
            `SELECT COUNT(*) as count FROM peminjaman 
       WHERE user_id = $1 
       AND status = 'dipinjam' 
       AND tanggal_kembali_target <= NOW() + INTERVAL '3 days'`,
            [userId]
        );
        const dueSoon = parseInt(dueSoonResult.rows[0].count);

        // 3. Total Fines
        const finesResult = await db.query(
            `SELECT SUM(denda) as total FROM peminjaman WHERE user_id = $1`,
            [userId]
        );
        const fines = parseFloat(finesResult.rows[0].total || 0);

        return NextResponse.json({
            activeLoans,
            dueSoon,
            fines
        });

    } catch (error) {
        console.error('Error fetching member stats:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
