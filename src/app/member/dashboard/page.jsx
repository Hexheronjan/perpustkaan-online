'use client';

import { useState, useEffect } from 'react';
import { getUser, getAuthHeaders } from '@/lib/client-auth';
import { BookOpen, Clock, AlertCircle, TrendingUp, Award, Sparkles } from 'lucide-react';

export default function MemberDashboard() {
    const [user, setUser] = useState(null);
    const [stats, setStats] = useState({
        activeLoans: 0,
        dueSoon: 0,
        fines: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            const userData = getUser();
            if (userData) {
                setUser(userData);
                try {
                    const res = await fetch(`/api/member/stats?user_id=${userData.id}`, {
                        headers: getAuthHeaders()
                    });
                    if (res.ok) {
                        const data = await res.json();
                        setStats(data);
                    }
                } catch (error) {
                    console.error('Error fetching stats:', error);
                }
            }
            setLoading(false);
        };

        fetchDashboardData();
    }, []);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(amount);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent mb-4"></div>
                    <p className="text-gray-600 font-medium">Memuat dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4 md:p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Hero Welcome Card */}
                <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 rounded-3xl p-8 md:p-10 text-white shadow-2xl">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mr-32 -mt-32"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-10 rounded-full -ml-24 -mb-24"></div>
                    
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-3">
                            <Sparkles className="w-8 h-8 animate-pulse" />
                            <h1 className="text-3xl md:text-4xl font-bold">
                                Selamat Datang Kembali! 👋
                            </h1>
                        </div>
                        <p className="text-lg text-indigo-100 mb-2">
                            {user?.nama_lengkap || user?.username || 'Member'}
                        </p>
                        <p className="text-indigo-200 max-w-2xl">
                            Jelajahi koleksi buku favorit Anda dan kelola peminjaman dengan mudah di dashboard perpustakaan digital.
                        </p>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Active Loans Card */}
                    <div className="group bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                        <div className="flex items-start justify-between mb-4">
                            <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl shadow-md group-hover:scale-110 transition-transform duration-300">
                                <BookOpen size={28} strokeWidth={2.5} />
                            </div>
                            <div className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-semibold">
                                Aktif
                            </div>
                        </div>
                        <p className="text-sm font-medium text-gray-500 mb-1">Buku Dipinjam</p>
                        <h3 className="text-4xl font-bold text-gray-800 mb-2">{stats.activeLoans}</h3>
                        <div className="flex items-center gap-1 text-xs text-blue-600 font-medium">
                            <TrendingUp size={14} />
                            <span>Peminjaman aktif</span>
                        </div>
                    </div>

                    {/* Due Soon Card */}
                    <div className="group bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                        <div className="flex items-start justify-between mb-4">
                            <div className="p-4 bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-xl shadow-md group-hover:scale-110 transition-transform duration-300">
                                <Clock size={28} strokeWidth={2.5} />
                            </div>
                            <div className="px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-xs font-semibold">
                                Segera
                            </div>
                        </div>
                        <p className="text-sm font-medium text-gray-500 mb-1">Jatuh Tempo</p>
                        <h3 className="text-4xl font-bold text-gray-800 mb-2">{stats.dueSoon}</h3>
                        <div className="flex items-center gap-1 text-xs text-amber-600 font-medium">
                            <AlertCircle size={14} />
                            <span>Dalam 3 hari</span>
                        </div>
                    </div>

                    {/* Fines Card */}
                    <div className="group bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                        <div className="flex items-start justify-between mb-4">
                            <div className="p-4 bg-gradient-to-br from-red-500 to-rose-600 text-white rounded-xl shadow-md group-hover:scale-110 transition-transform duration-300">
                                <AlertCircle size={28} strokeWidth={2.5} />
                            </div>
                            <div className="px-3 py-1 bg-red-50 text-red-600 rounded-full text-xs font-semibold">
                                Perhatian
                            </div>
                        </div>
                        <p className="text-sm font-medium text-gray-500 mb-1">Total Denda</p>
                        <h3 className="text-4xl font-bold text-gray-800 mb-2">
                            {stats.fines === 0 ? '-' : formatCurrency(stats.fines)}
                        </h3>
                        <div className="flex items-center gap-1 text-xs text-red-600 font-medium">
                            {stats.fines === 0 ? (
                                <>
                                    <Award size={14} />
                                    <span>Tidak ada denda</span>
                                </>
                            ) : (
                                <>
                                    <AlertCircle size={14} />
                                    <span>Segera bayar</span>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Recent Activity Section */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-6 py-5 border-b border-gray-100">
                        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            <div className="w-1 h-6 bg-indigo-600 rounded-full"></div>
                            Aktivitas Terkini
                        </h2>
                    </div>
                    <div className="p-8">
                        <div className="text-center py-12">
                            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
                                <BookOpen size={36} className="text-gray-400" />
                            </div>
                            <p className="text-gray-500 font-medium mb-2">Belum ada aktivitas peminjaman</p>
                            <p className="text-sm text-gray-400">Mulai pinjam buku untuk melihat riwayat aktivitas Anda</p>
                        </div>
                    </div>
                </div>

                {/* Quick Actions or Tips */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
                        <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                            <Award className="text-blue-600" size={20} />
                            Tips Peminjaman
                        </h3>
                        <p className="text-sm text-gray-600">
                            Kembalikan buku tepat waktu untuk menghindari denda dan dapatkan akses prioritas ke koleksi baru!
                        </p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
                        <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                            <Sparkles className="text-purple-600" size={20} />
                            Koleksi Terbaru
                        </h3>
                        <p className="text-sm text-gray-600">
                            Jelajahi ratusan buku baru yang baru saja ditambahkan ke perpustakaan digital kami.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}