// src/app/staf/dashboard/page.jsx
'use client';

import React, { useState, useEffect } from 'react';
import { BookOpen, Users, Clock, CheckCircle, TrendingUp, AlertCircle } from 'lucide-react';
import { apiFetch } from '@/lib/api-client';
import { getUser } from '@/lib/client-auth';

const DashboardCard = ({ title, value, icon: Icon, color, trend }) => (
  <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon size={24} className="text-white" />
      </div>
      {trend && (
        <div className="flex items-center text-green-600 text-sm font-medium">
          <TrendingUp size={16} className="mr-1" />
          {trend}
        </div>
      )}
    </div>
    <h3 className="text-gray-600 text-sm font-medium mb-1">{title}</h3>
    <p className="text-3xl font-bold text-gray-800">{value}</p>
  </div>
);

const RecentActivity = ({ activities }) => (
  <div className="bg-white rounded-lg shadow-md p-6">
    <h3 className="text-lg font-bold text-gray-800 mb-4">Aktivitas Terbaru</h3>
    <div className="space-y-3">
      {activities.map((activity, index) => (
        <div key={index} className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
          <div className={`p-2 rounded-full ${activity.color}`}>
            <activity.icon size={16} className="text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-800">{activity.title}</p>
            <p className="text-xs text-gray-500">{activity.time}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const PendingApprovals = ({ approvals }) => (
  <div className="bg-white rounded-lg shadow-md p-6">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-bold text-gray-800">Buku Menunggu Approval</h3>
      <span className="bg-red-100 text-red-600 text-xs font-bold px-3 py-1 rounded-full">
        {approvals.length}
      </span>
    </div>
    <div className="space-y-3">
      {approvals.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-4">Tidak ada buku menunggu approval</p>
      ) : (
        approvals.map((approval, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-200">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-800">{approval.judul}</p>
              <p className="text-xs text-gray-500">Status: {approval.status}</p>
            </div>
            <AlertCircle size={20} className="text-amber-600" />
          </div>
        ))
      )}
    </div>
  </div>
);

export default function StafDashboard() {
  const [stats, setStats] = useState({
    totalBuku: 0,
    totalUsers: 0,
    bukuDipinjam: 0,
    bukuPending: 0
  });
  
  const [loading, setLoading] = useState(true);
  const [pendingBooks, setPendingBooks] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
  try {
    console.log('📄 Fetching dashboard data...');
    
    // Fetch buku (semua status)
    const bukuRes = await fetch('/api/staf/buku');
    const bukuData = bukuRes.ok ? await bukuRes.json() : [];
    
    // Fetch users
    const usersRes = await fetch('/api/staf/users');
    const usersData = usersRes.ok ? await usersRes.json() : [];
    
    // Fetch peminjaman aktif
    const peminjamanRes = await fetch('/api/peminjaman?status=dipinjam');
    const peminjamanData = peminjamanRes.ok ? await peminjamanRes.json() : [];

    const newStats = {
      totalBuku: Array.isArray(bukuData) 
        ? bukuData.filter(b => b.status === 'approved').length 
        : 0,
      totalUsers: Array.isArray(usersData) ? usersData.length : 0,
      bukuDipinjam: Array.isArray(peminjamanData) ? peminjamanData.length : 0,
      bukuPending: Array.isArray(bukuData) 
        ? bukuData.filter(b => b.status === 'pending').length 
        : 0
    };

    console.log('✅ Final stats:', newStats);
    setStats(newStats);
    
    // Set pending books untuk display
    const pendingBooksFiltered = Array.isArray(bukuData) 
      ? bukuData.filter(b => b.status === 'pending').slice(0, 3)
      : [];
    setPendingBooks(pendingBooksFiltered);
    
    setLoading(false);
  } catch (error) {
    console.error('❌ Error fetching dashboard data:', error);
    setStats({
      totalBuku: 0,
      totalUsers: 0,
      bukuDipinjam: 0,
      bukuPending: 0
    });
    setLoading(false);
  }
};

  const recentActivities = [
    { icon: CheckCircle, title: 'Buku "Laskar Pelangi" dikembalikan', time: '5 menit yang lalu', color: 'bg-green-500' },
    { icon: BookOpen, title: 'Data buku "Bumi Manusia" diupdate', time: '1 jam yang lalu', color: 'bg-blue-500' },
    { icon: Users, title: 'Member baru terdaftar', time: '2 jam yang lalu', color: 'bg-purple-500' },
    { icon: Clock, title: 'Peminjaman buku "Sapiens"', time: '3 jam yang lalu', color: 'bg-orange-500' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Dashboard Staf</h1>
        <p className="text-gray-600">Ringkasan aktivitas perpustakaan</p>
      </div>

      {/* Alert untuk buku pending */}
      {stats.bukuPending > 0 && (
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="text-amber-600" size={20} />
            <div>
              <p className="text-amber-800 font-medium">
                Anda memiliki {stats.bukuPending} buku yang menunggu approval dari Admin
              </p>
              <p className="text-amber-600 text-sm">Buku akan ditampilkan di katalog setelah disetujui</p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <DashboardCard
          title="Total Buku"
          value={stats.totalBuku}
          icon={BookOpen}
          color="bg-blue-500"
          trend="+12%"
        />
        <DashboardCard
          title="Total User"
          value={stats.totalUsers}
          icon={Users}
          color="bg-green-500"
          trend="+8%"
        />
        <DashboardCard
          title="Sedang Dipinjam"
          value={stats.bukuDipinjam}
          icon={Clock}
          color="bg-orange-500"
        />
        <DashboardCard
          title="Menunggu Approval"
          value={stats.bukuPending}
          icon={AlertCircle}
          color="bg-red-500"
        />
      </div>

      {/* Activity and Pending Books */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentActivity activities={recentActivities} />
        <PendingApprovals approvals={pendingBooks} />
      </div>
    </div>
  );
}