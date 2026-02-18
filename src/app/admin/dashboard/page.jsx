'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  BookOpen, Users, Clock, CheckCircle, TrendingUp, AlertCircle,
  ArrowRight, RefreshCw, BookMarked, UserCheck, Zap, BarChart3
} from 'lucide-react';
import { getAuthHeaders } from '@/lib/client-auth';
import { ToastProvider, useToast } from '@/components/ui/Toast';

function StatCard({ title, value, icon: Icon, gradient, badge, trend, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden rounded-2xl p-6 text-white shadow-lg cursor-pointer
        hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ${gradient}`}
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10" />
      <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/10 rounded-full -ml-8 -mb-8" />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
            <Icon size={24} />
          </div>
          {badge !== undefined && (
            <span className="bg-white/20 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-full">
              {badge}
            </span>
          )}
        </div>
        <p className="text-white/80 text-sm font-medium mb-1">{title}</p>
        <p className="text-4xl font-bold mb-2">{value}</p>
        {trend && (
          <div className="flex items-center gap-1 text-white/80 text-xs">
            <TrendingUp size={12} />
            <span>{trend}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function PendingBookRow({ book, onApprove, onReject }) {
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  const handleApprove = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/approval`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ buku_id: book.id, action: 'approve' }),
      });
      if (res.ok) {
        toast.success('Buku disetujui!', `"${book.judul}" berhasil diapprove`);
        onApprove(book.id);
      } else {
        toast.error('Gagal approve', 'Coba lagi nanti');
      }
    } catch {
      toast.error('Error', 'Koneksi bermasalah');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/approval`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ buku_id: book.id, action: 'reject' }),
      });
      if (res.ok) {
        toast.warning('Buku ditolak', `"${book.judul}" telah ditolak`);
        onReject(book.id);
      } else {
        toast.error('Gagal reject', 'Coba lagi nanti');
      }
    } catch {
      toast.error('Error', 'Koneksi bermasalah');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-4 p-4 bg-amber-50 border border-amber-100 rounded-xl hover:bg-amber-100/50 transition-colors">
      <div className="flex-shrink-0 w-10 h-10 bg-amber-200 rounded-xl flex items-center justify-center">
        <BookOpen size={18} className="text-amber-700" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-800 text-sm truncate">{book.judul}</p>
        <p className="text-xs text-gray-500 mt-0.5">
          oleh {book.penulis} · {book.created_by_name || 'Staf'}
        </p>
      </div>
      <div className="flex gap-2 flex-shrink-0">
        <button
          onClick={handleApprove}
          disabled={loading}
          className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-50"
        >
          ✓ Setuju
        </button>
        <button
          onClick={handleReject}
          disabled={loading}
          className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-50"
        >
          ✗ Tolak
        </button>
      </div>
    </div>
  );
}

function AdminDashboardContent() {
  const router = useRouter();
  const toast = useToast();
  const [stats, setStats] = useState({ totalBooks: 0, totalUsers: 0, activeBorrowings: 0, pendingApprovals: 0 });
  const [pendingBooks, setPendingBooks] = useState([]);
  const [recentBorrowings, setRecentBorrowings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const h = new Date().getHours();
    setGreeting(h < 12 ? 'Selamat Pagi' : h < 15 ? 'Selamat Siang' : h < 18 ? 'Selamat Sore' : 'Selamat Malam');
    fetchData();
  }, []);

  const fetchData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const headers = getAuthHeaders();
      const [booksRes, usersRes, peminjamanRes, pendingRes] = await Promise.allSettled([
        fetch('/api/admin/buku', { headers }),
        fetch('/api/admin/users', { headers }),
        fetch('/api/admin/peminjaman?status=dipinjam', { headers }),
        fetch('/api/staf/buku?status=pending', { headers }),
      ]);

      const books = booksRes.status === 'fulfilled' && booksRes.value.ok ? await booksRes.value.json() : [];
      const users = usersRes.status === 'fulfilled' && usersRes.value.ok ? await usersRes.value.json() : [];
      const peminjaman = peminjamanRes.status === 'fulfilled' && peminjamanRes.value.ok ? await peminjamanRes.value.json() : [];
      const pending = pendingRes.status === 'fulfilled' && pendingRes.value.ok ? await pendingRes.value.json() : [];

      const pendingArr = Array.isArray(pending) ? pending.filter(b => b.status === 'pending') : [];

      setStats({
        totalBooks: Array.isArray(books) ? books.filter(b => b.status === 'approved' || b.is_approved).length : 0,
        totalUsers: Array.isArray(users) ? users.length : 0,
        activeBorrowings: Array.isArray(peminjaman) ? peminjaman.length : 0,
        pendingApprovals: pendingArr.length,
      });
      setPendingBooks(pendingArr.slice(0, 5));
      setRecentBorrowings(Array.isArray(peminjaman) ? peminjaman.slice(0, 5) : []);

      if (isRefresh) toast.success('Data diperbarui!', 'Dashboard sudah up to date');
    } catch (e) {
      console.error(e);
      if (isRefresh) toast.error('Gagal memuat data', 'Periksa koneksi internet');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleApprove = (id) => {
    setPendingBooks(prev => prev.filter(b => b.id !== id));
    setStats(prev => ({ ...prev, pendingApprovals: Math.max(0, prev.pendingApprovals - 1) }));
  };

  const handleReject = (id) => {
    setPendingBooks(prev => prev.filter(b => b.id !== id));
    setStats(prev => ({ ...prev, pendingApprovals: Math.max(0, prev.pendingApprovals - 1) }));
  };

  const today = new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

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
    <div className="space-y-8">
      {/* Hero Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 rounded-3xl p-8 text-white shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full -mr-40 -mt-40" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Zap size={20} className="text-yellow-300 animate-pulse" />
              <span className="text-white/80 text-sm font-medium">{today}</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">{greeting}, Admin! 👋</h1>
            <p className="text-indigo-100 text-lg">Kelola perpustakaan digital dengan mudah dan efisien</p>
          </div>
          <button
            onClick={() => fetchData(true)}
            disabled={refreshing}
            className="flex items-center gap-2 px-5 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl font-semibold transition-all self-start md:self-auto"
          >
            <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Buku"
          value={stats.totalBooks}
          icon={BookOpen}
          gradient="bg-gradient-to-br from-blue-500 to-blue-700"
          trend="Koleksi aktif"
          onClick={() => router.push('/admin/buku')}
        />
        <StatCard
          title="Total Pengguna"
          value={stats.totalUsers}
          icon={Users}
          gradient="bg-gradient-to-br from-emerald-500 to-teal-700"
          trend="Member terdaftar"
          onClick={() => router.push('/admin/users')}
        />
        <StatCard
          title="Sedang Dipinjam"
          value={stats.activeBorrowings}
          icon={Clock}
          gradient="bg-gradient-to-br from-orange-500 to-red-600"
          trend="Peminjaman aktif"
          onClick={() => router.push('/admin/peminjaman')}
        />
        <StatCard
          title="Menunggu Approval"
          value={stats.pendingApprovals}
          icon={AlertCircle}
          gradient={stats.pendingApprovals > 0
            ? "bg-gradient-to-br from-red-500 to-rose-700"
            : "bg-gradient-to-br from-gray-400 to-gray-600"}
          badge={stats.pendingApprovals > 0 ? 'Perlu Aksi' : 'Aman'}
          onClick={() => router.push('/admin/approval')}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Approvals */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-amber-50 to-orange-50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-xl">
                <AlertCircle size={18} className="text-amber-600" />
              </div>
              <div>
                <h2 className="font-bold text-gray-800">Menunggu Approval</h2>
                <p className="text-xs text-gray-500">{pendingBooks.length} buku perlu ditinjau</p>
              </div>
            </div>
            {stats.pendingApprovals > 5 && (
              <button
                onClick={() => router.push('/admin/approval')}
                className="text-xs text-amber-600 hover:text-amber-800 font-semibold flex items-center gap-1"
              >
                Lihat semua <ArrowRight size={12} />
              </button>
            )}
          </div>
          <div className="p-4 space-y-3">
            {pendingBooks.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle size={40} className="text-emerald-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium text-sm">Semua buku sudah diproses!</p>
                <p className="text-gray-400 text-xs mt-1">Tidak ada yang menunggu approval</p>
              </div>
            ) : (
              pendingBooks.map(book => (
                <PendingBookRow
                  key={book.id}
                  book={book}
                  onApprove={handleApprove}
                  onReject={handleReject}
                />
              ))
            )}
          </div>
        </div>

        {/* Recent Borrowings */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-xl">
                <BookMarked size={18} className="text-blue-600" />
              </div>
              <div>
                <h2 className="font-bold text-gray-800">Peminjaman Aktif</h2>
                <p className="text-xs text-gray-500">{recentBorrowings.length} sedang dipinjam</p>
              </div>
            </div>
            <button
              onClick={() => router.push('/admin/peminjaman')}
              className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
            >
              Lihat semua <ArrowRight size={12} />
            </button>
          </div>
          <div className="divide-y divide-gray-50">
            {recentBorrowings.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen size={40} className="text-gray-200 mx-auto mb-3" />
                <p className="text-gray-500 font-medium text-sm">Belum ada peminjaman aktif</p>
              </div>
            ) : (
              recentBorrowings.map((p, i) => (
                <div key={p.id || i} className="flex items-center gap-4 px-6 py-3 hover:bg-gray-50 transition-colors">
                  <div className="flex-shrink-0 w-9 h-9 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center text-white font-bold text-sm">
                    {(p.username || p.nama_lengkap || 'U')[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 text-sm truncate">{p.judul || p.buku_judul || 'Buku'}</p>
                    <p className="text-xs text-gray-500">{p.username || p.nama_lengkap || 'Member'}</p>
                  </div>
                  <span className="flex-shrink-0 px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-lg">
                    Dipinjam
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Tambah Buku', icon: BookOpen, color: 'from-blue-500 to-blue-600', path: '/admin/buku' },
          { label: 'Kelola User', icon: UserCheck, color: 'from-emerald-500 to-emerald-600', path: '/admin/users' },
          { label: 'Approval Buku', icon: CheckCircle, color: 'from-amber-500 to-orange-600', path: '/admin/approval' },
          { label: 'Laporan', icon: BarChart3, color: 'from-purple-500 to-purple-600', path: '/admin/peminjaman' },
        ].map(action => (
          <button
            key={action.label}
            onClick={() => router.push(action.path)}
            className={`flex flex-col items-center gap-3 p-5 bg-gradient-to-br ${action.color} text-white rounded-2xl shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300`}
          >
            <action.icon size={28} />
            <span className="font-semibold text-sm text-center">{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <ToastProvider>
      <AdminDashboardContent />
    </ToastProvider>
  );
}