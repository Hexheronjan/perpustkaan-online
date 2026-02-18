'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  BookOpen, Users, Clock, CheckCircle, AlertCircle, ArrowRight,
  RefreshCw, Plus, BookMarked, Zap, TrendingUp, FileText
} from 'lucide-react';
import { getAuthHeaders, getUser } from '@/lib/client-auth';
import { ToastProvider, useToast } from '@/components/ui/Toast';

function StatCard({ title, value, icon: Icon, gradient, badge, onClick }) {
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
        <p className="text-4xl font-bold">{value}</p>
      </div>
    </div>
  );
}

function StafDashboardContent() {
  const router = useRouter();
  const toast = useToast();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({ totalBuku: 0, bukuPending: 0, bukuDipinjam: 0, totalUsers: 0 });
  const [pendingBooks, setPendingBooks] = useState([]);
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
      const userId = u?.id;

      const [bukuRes, usersRes, peminjamanRes] = await Promise.allSettled([
        fetch(userId ? `/api/staf/buku?user_id=${userId}` : '/api/staf/buku', { headers }),
        fetch('/api/staf/users', { headers }),
        fetch('/api/peminjaman?status=dipinjam', { headers }),
      ]);

      const buku = bukuRes.status === 'fulfilled' && bukuRes.value.ok ? await bukuRes.value.json() : [];
      const users = usersRes.status === 'fulfilled' && usersRes.value.ok ? await usersRes.value.json() : [];
      const peminjaman = peminjamanRes.status === 'fulfilled' && peminjamanRes.value.ok ? await peminjamanRes.value.json() : [];

      const bukuArr = Array.isArray(buku) ? buku : [];
      const pending = bukuArr.filter(b => b.status === 'pending');

      setStats({
        totalBuku: bukuArr.filter(b => b.status === 'approved').length,
        bukuPending: pending.length,
        bukuDipinjam: Array.isArray(peminjaman) ? peminjaman.length : 0,
        totalUsers: Array.isArray(users) ? users.length : 0,
      });
      setPendingBooks(pending.slice(0, 4));

      if (isRefresh) toast.success('Data diperbarui!', 'Dashboard sudah up to date');
    } catch (e) {
      if (isRefresh) toast.error('Gagal memuat', 'Periksa koneksi internet');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const today = new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 font-medium">Memuat dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hero Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-cyan-600 to-teal-500 rounded-3xl p-8 text-white shadow-2xl">
        <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full -mr-36 -mt-36" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Zap size={18} className="text-yellow-300 animate-pulse" />
              <span className="text-white/80 text-sm">{today}</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              {greeting}, {user?.nama_lengkap || user?.username || 'Staf'}! 👋
            </h1>
            <p className="text-blue-100">Kelola koleksi buku perpustakaan dengan mudah</p>
          </div>
          <div className="flex gap-3 flex-shrink-0">
            <button
              onClick={() => router.push('/staf/buku')}
              className="flex items-center gap-2 px-5 py-3 bg-white text-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition-all shadow-md"
            >
              <Plus size={18} />
              Tambah Buku
            </button>
            <button
              onClick={() => fetchData(user, true)}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl font-semibold transition-all"
            >
              <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>
      </div>

      {/* Alert buku pending */}
      {stats.bukuPending > 0 && (
        <div className="flex items-center gap-4 p-4 bg-amber-50 border border-amber-200 rounded-2xl">
          <div className="flex-shrink-0 p-3 bg-amber-100 rounded-xl">
            <AlertCircle size={22} className="text-amber-600" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-amber-800">
              {stats.bukuPending} buku menunggu approval admin
            </p>
            <p className="text-amber-600 text-sm mt-0.5">Buku akan tampil di katalog setelah disetujui</p>
          </div>
          <button
            onClick={() => router.push('/staf/buku')}
            className="flex-shrink-0 flex items-center gap-1 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-xl transition-colors"
          >
            Lihat <ArrowRight size={14} />
          </button>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Buku Approved"
          value={stats.totalBuku}
          icon={BookOpen}
          gradient="bg-gradient-to-br from-blue-500 to-blue-700"
          onClick={() => router.push('/staf/katalog')}
        />
        <StatCard
          title="Menunggu Approval"
          value={stats.bukuPending}
          icon={AlertCircle}
          gradient={stats.bukuPending > 0
            ? "bg-gradient-to-br from-amber-500 to-orange-600"
            : "bg-gradient-to-br from-gray-400 to-gray-600"}
          badge={stats.bukuPending > 0 ? 'Pending' : 'Aman'}
          onClick={() => router.push('/staf/buku')}
        />
        <StatCard
          title="Sedang Dipinjam"
          value={stats.bukuDipinjam}
          icon={Clock}
          gradient="bg-gradient-to-br from-purple-500 to-purple-700"
          onClick={() => router.push('/staf/peminjaman')}
        />
        <StatCard
          title="Total Member"
          value={stats.totalUsers}
          icon={Users}
          gradient="bg-gradient-to-br from-emerald-500 to-teal-700"
        />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Books */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-amber-50 to-orange-50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-xl">
                <FileText size={18} className="text-amber-600" />
              </div>
              <div>
                <h2 className="font-bold text-gray-800">Buku Saya (Pending)</h2>
                <p className="text-xs text-gray-500">{pendingBooks.length} menunggu persetujuan</p>
              </div>
            </div>
            <button
              onClick={() => router.push('/staf/buku')}
              className="text-xs text-amber-600 hover:text-amber-800 font-semibold flex items-center gap-1"
            >
              Kelola <ArrowRight size={12} />
            </button>
          </div>
          <div className="p-4 space-y-3">
            {pendingBooks.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle size={40} className="text-emerald-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium text-sm">Tidak ada buku pending</p>
                <p className="text-gray-400 text-xs mt-1">Semua buku sudah diproses admin</p>
              </div>
            ) : (
              pendingBooks.map(book => (
                <div key={book.id} className="flex items-center gap-4 p-4 bg-amber-50 border border-amber-100 rounded-xl">
                  <div className="flex-shrink-0 w-10 h-10 bg-amber-200 rounded-xl flex items-center justify-center">
                    <BookOpen size={18} className="text-amber-700" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 text-sm truncate">{book.judul}</p>
                    <p className="text-xs text-gray-500 mt-0.5">oleh {book.penulis}</p>
                  </div>
                  <span className="flex-shrink-0 px-2 py-1 bg-amber-200 text-amber-800 text-xs font-bold rounded-lg">
                    Pending
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-xl">
                <Zap size={18} className="text-blue-600" />
              </div>
              <div>
                <h2 className="font-bold text-gray-800">Aksi Cepat</h2>
                <p className="text-xs text-gray-500">Navigasi ke fitur utama</p>
              </div>
            </div>
          </div>
          <div className="p-4 grid grid-cols-2 gap-3">
            {[
              { label: 'Tambah Buku', icon: Plus, color: 'from-blue-500 to-blue-600', path: '/staf/buku' },
              { label: 'Lihat Katalog', icon: BookMarked, color: 'from-teal-500 to-teal-600', path: '/staf/katalog' },
              { label: 'Peminjaman', icon: Clock, color: 'from-purple-500 to-purple-600', path: '/staf/peminjaman' },
              { label: 'Kelola Genre', icon: TrendingUp, color: 'from-pink-500 to-rose-600', path: '/staf/genre' },
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
        </div>
      </div>
    </div>
  );
}

export default function StafDashboard() {
  return (
    <ToastProvider>
      <StafDashboardContent />
    </ToastProvider>
  );
}