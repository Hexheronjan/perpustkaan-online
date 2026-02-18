'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    BookOpen, Clock, AlertCircle, Award, Sparkles, ArrowRight,
    RefreshCw, BookMarked, RotateCcw, Zap, CheckCircle
} from 'lucide-react';
import { getUser, getAuthHeaders } from '@/lib/client-auth';
import { ToastProvider, useToast } from '@/components/ui/Toast';

function StatCard({ title, value, icon: Icon, gradient, sub, badge, onClick }) {
    return (
        <div
            onClick={onClick}
            className={`relative overflow-hidden rounded-2xl p-6 text-white shadow-lg cursor-pointer
        hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ${gradient}`}
        >
            <div className="absolute top-0 right-0 w-28 h-28 bg-white/10 rounded-full -mr-8 -mt-8" />
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-full -ml-6 -mb-6" />
            <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                    <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                        <Icon size={22} />
                    </div>
                    {badge && (
                        <span className="bg-white/20 text-white text-xs font-bold px-2 py-1 rounded-full">{badge}</span>
                    )}
                </div>
                <p className="text-white/80 text-sm font-medium mb-1">{title}</p>
                <p className="text-4xl font-bold mb-1">{value}</p>
                {sub && <p className="text-white/70 text-xs">{sub}</p>}
            </div>
        </div>
    );
}

function MemberDashboardContent() {
    const router = useRouter();
    const toast = useToast();
    const [user, setUser] = useState(null);
    const [stats, setStats] = useState({ activeLoans: 0, dueSoon: 0, fines: 0 });
    const [recentLoans, setRecentLoans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [greeting, setGreeting] = useState('');

    useEffect(() => {
        const h = new Date().getHours();
        setGreeting(h < 12 ? 'Selamat Pagi' : h < 15 ? 'Selamat Siang' : h < 18 ? 'Selamat Sore' : 'Selamat Malam');
        const u = getUser();
        setUser(u);
        fetchData(u);
    }, []);

    const fetchData = async (u, isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        try {
            const headers = getAuthHeaders();
            if (!u?.id) return;

            const [statsRes, loansRes] = await Promise.allSettled([
                fetch(`/api/member/stats?user_id=${u.id}`, { headers }),
                fetch(`/api/member/peminjaman?user_id=${u.id}`, { headers }),
            ]);

            if (statsRes.status === 'fulfilled' && statsRes.value.ok) {
                const data = await statsRes.value.json();
                setStats(data);

                // Show notifications for due soon / fines
                if (isRefresh) {
                    if (data.dueSoon > 0) toast.warning('Perhatian!', `${data.dueSoon} buku hampir jatuh tempo`);
                    if (data.fines > 0) toast.error('Ada denda!', `Total denda: Rp ${data.fines.toLocaleString('id-ID')}`);
                    if (data.dueSoon === 0 && data.fines === 0) toast.success('Semua baik!', 'Tidak ada denda atau jatuh tempo');
                }
            }

            if (loansRes.status === 'fulfilled' && loansRes.value.ok) {
                const loans = await loansRes.value.json();
                setRecentLoans(Array.isArray(loans) ? loans.slice(0, 5) : []);
            }
        } catch (e) {
            if (isRefresh) toast.error('Gagal memuat', 'Periksa koneksi internet');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const formatCurrency = (amount) =>
        new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);

    const today = new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

    const getLoanStatus = (loan) => {
        const status = loan.status || loan.status_peminjaman;
        if (status === 'dikembalikan') return { label: 'Dikembalikan', color: 'bg-emerald-100 text-emerald-700' };
        if (status === 'terlambat') return { label: 'Terlambat', color: 'bg-red-100 text-red-700' };
        return { label: 'Dipinjam', color: 'bg-blue-100 text-blue-700' };
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-500 font-medium">Memuat dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4 md:p-8">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Hero Banner */}
                <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 rounded-3xl p-8 md:p-10 text-white shadow-2xl">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full -mr-40 -mt-40" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24" />
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <Sparkles size={18} className="text-yellow-300 animate-pulse" />
                                <span className="text-white/80 text-sm">{today}</span>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-bold mb-2">
                                {greeting}, {user?.nama_lengkap || user?.username || 'Member'}! 👋
                            </h1>
                            <p className="text-indigo-100 text-lg">Jelajahi dan kelola peminjaman buku Anda</p>
                        </div>
                        <button
                            onClick={() => fetchData(user, true)}
                            disabled={refreshing}
                            className="flex items-center gap-2 px-5 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl font-semibold transition-all self-start md:self-auto"
                        >
                            <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
                            Refresh
                        </button>
                    </div>
                </div>

                {/* Alert jatuh tempo */}
                {stats.dueSoon > 0 && (
                    <div className="flex items-center gap-4 p-4 bg-orange-50 border border-orange-200 rounded-2xl">
                        <div className="flex-shrink-0 p-3 bg-orange-100 rounded-xl">
                            <Clock size={22} className="text-orange-600" />
                        </div>
                        <div className="flex-1">
                            <p className="font-semibold text-orange-800">
                                {stats.dueSoon} buku hampir jatuh tempo!
                            </p>
                            <p className="text-orange-600 text-sm mt-0.5">Segera kembalikan untuk menghindari denda</p>
                        </div>
                        <button
                            onClick={() => router.push('/member/peminjaman')}
                            className="flex-shrink-0 flex items-center gap-1 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-xl transition-colors"
                        >
                            Lihat <ArrowRight size={14} />
                        </button>
                    </div>
                )}

                {/* Alert denda */}
                {stats.fines > 0 && (
                    <div className="flex items-center gap-4 p-4 bg-red-50 border border-red-200 rounded-2xl">
                        <div className="flex-shrink-0 p-3 bg-red-100 rounded-xl">
                            <AlertCircle size={22} className="text-red-600" />
                        </div>
                        <div className="flex-1">
                            <p className="font-semibold text-red-800">Ada denda peminjaman!</p>
                            <p className="text-red-600 text-sm mt-0.5">Total: {formatCurrency(stats.fines)}</p>
                        </div>
                        <button
                            onClick={() => router.push('/member/pengembalian')}
                            className="flex-shrink-0 flex items-center gap-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-xl transition-colors"
                        >
                            Bayar <ArrowRight size={14} />
                        </button>
                    </div>
                )}

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <StatCard
                        title="Buku Dipinjam"
                        value={stats.activeLoans}
                        icon={BookOpen}
                        gradient="bg-gradient-to-br from-blue-500 to-blue-700"
                        sub="Peminjaman aktif"
                        badge="Aktif"
                        onClick={() => router.push('/member/peminjaman')}
                    />
                    <StatCard
                        title="Jatuh Tempo"
                        value={stats.dueSoon}
                        icon={Clock}
                        gradient={stats.dueSoon > 0
                            ? "bg-gradient-to-br from-orange-500 to-red-600"
                            : "bg-gradient-to-br from-emerald-500 to-teal-600"}
                        sub="Dalam 3 hari ke depan"
                        badge={stats.dueSoon > 0 ? 'Segera!' : 'Aman'}
                        onClick={() => router.push('/member/peminjaman')}
                    />
                    <StatCard
                        title="Total Denda"
                        value={stats.fines === 0 ? 'Rp 0' : formatCurrency(stats.fines)}
                        icon={stats.fines === 0 ? Award : AlertCircle}
                        gradient={stats.fines > 0
                            ? "bg-gradient-to-br from-red-500 to-rose-700"
                            : "bg-gradient-to-br from-purple-500 to-purple-700"}
                        sub={stats.fines === 0 ? 'Tidak ada denda 🎉' : 'Segera bayar'}
                        onClick={() => router.push('/member/pengembalian')}
                    />
                </div>

                {/* Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Recent Loans */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-purple-50">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-100 rounded-xl">
                                    <BookMarked size={18} className="text-indigo-600" />
                                </div>
                                <div>
                                    <h2 className="font-bold text-gray-800">Riwayat Peminjaman</h2>
                                    <p className="text-xs text-gray-500">Peminjaman terbaru Anda</p>
                                </div>
                            </div>
                            <button
                                onClick={() => router.push('/member/peminjaman')}
                                className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1"
                            >
                                Lihat semua <ArrowRight size={12} />
                            </button>
                        </div>
                        <div className="divide-y divide-gray-50">
                            {recentLoans.length === 0 ? (
                                <div className="text-center py-10">
                                    <BookOpen size={40} className="text-gray-200 mx-auto mb-3" />
                                    <p className="text-gray-500 font-medium text-sm">Belum ada peminjaman</p>
                                    <p className="text-gray-400 text-xs mt-1">Mulai pinjam buku sekarang!</p>
                                </div>
                            ) : (
                                recentLoans.map((loan, i) => {
                                    const { label, color } = getLoanStatus(loan);
                                    return (
                                        <div key={loan.id || i} className="flex items-center gap-4 px-6 py-3 hover:bg-gray-50 transition-colors">
                                            <div className="flex-shrink-0 w-9 h-9 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-xl flex items-center justify-center text-white font-bold text-sm">
                                                {(loan.judul || 'B')[0].toUpperCase()}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold text-gray-800 text-sm truncate">{loan.judul || loan.buku_judul}</p>
                                                <p className="text-xs text-gray-500">
                                                    {loan.tanggal_pinjam ? new Date(loan.tanggal_pinjam).toLocaleDateString('id-ID') : '-'}
                                                </p>
                                            </div>
                                            <span className={`flex-shrink-0 px-2 py-1 text-xs font-semibold rounded-lg ${color}`}>
                                                {label}
                                            </span>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-purple-50">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-100 rounded-xl">
                                    <Zap size={18} className="text-indigo-600" />
                                </div>
                                <div>
                                    <h2 className="font-bold text-gray-800">Aksi Cepat</h2>
                                    <p className="text-xs text-gray-500">Navigasi ke fitur utama</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-4 grid grid-cols-2 gap-3">
                            {[
                                { label: 'Cari Buku', icon: BookOpen, color: 'from-blue-500 to-indigo-600', path: '/member/buku' },
                                { label: 'Peminjaman Saya', icon: BookMarked, color: 'from-purple-500 to-purple-600', path: '/member/peminjaman' },
                                { label: 'Kembalikan Buku', icon: RotateCcw, color: 'from-emerald-500 to-teal-600', path: '/member/pengembalian' },
                                { label: 'Profil Saya', icon: CheckCircle, color: 'from-pink-500 to-rose-600', path: '/member/member' },
                            ].map(action => (
                                <button
                                    key={action.label}
                                    onClick={() => router.push(action.path)}
                                    className={`flex flex-col items-center gap-2 p-5 bg-gradient-to-br ${action.color} text-white rounded-2xl shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300`}
                                >
                                    <action.icon size={24} />
                                    <span className="font-semibold text-xs text-center">{action.label}</span>
                                </button>
                            ))}
                        </div>

                        {/* Tips */}
                        <div className="mx-4 mb-4 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
                            <div className="flex items-start gap-3">
                                <Sparkles size={18} className="text-indigo-500 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-semibold text-gray-800 text-sm">Tips Peminjaman</p>
                                    <p className="text-gray-600 text-xs mt-1">
                                        Kembalikan buku tepat waktu untuk menghindari denda dan dapatkan akses prioritas ke koleksi baru!
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function MemberDashboard() {
    return (
        <ToastProvider>
            <MemberDashboardContent />
        </ToastProvider>
    );
}