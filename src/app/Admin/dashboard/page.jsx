import React, { useState, useEffect } from 'react';
import { BookOpen, Users, Clock, CheckCircle, TrendingUp, AlertCircle } from 'lucide-react';

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
      <h3 className="text-lg font-bold text-gray-800">Menunggu Approval</h3>
      <span className="bg-red-100 text-red-600 text-xs font-bold px-3 py-1 rounded-full">
        {approvals.length}
      </span>
    </div>
    <div className="space-y-3">
      {approvals.map((approval, index) => (
        <div key={index} className="flex items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-200">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-800">{approval.title}</p>
            <p className="text-xs text-gray-500">Diajukan oleh: {approval.staff}</p>
          </div>
          <AlertCircle size={20} className="text-amber-600" />
        </div>
      ))}
    </div>
    <button className="w-full mt-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
      Lihat Semua
    </button>
  </div>
);

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalBooks: 0,
    totalUsers: 0,
    activeBorrowings: 0,
    pendingApprovals: 0
  });
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch books
      const booksRes = await fetch('/api/admin/buku');
      const books = await booksRes.json();
      
      // Fetch users
      const usersRes = await fetch('/api/admin/users');
      const users = await usersRes.json();
      
      // Fetch peminjaman
      const peminjamanRes = await fetch('/api/admin/peminjaman?status=dipinjam');
      const peminjaman = await peminjamanRes.json();
      
      // Fetch pending approvals
      const approvalsRes = await fetch('/api/admin/buku-pending?status=pending');
      const approvals = await approvalsRes.json();

      setStats({
        totalBooks: books.length || 0,
        totalUsers: users.length || 0,
        activeBorrowings: peminjaman.length || 0,
        pendingApprovals: approvals.length || 0
      });
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  const recentActivities = [
    { icon: CheckCircle, title: 'Buku "Laskar Pelangi" dikembalikan', time: '5 menit yang lalu', color: 'bg-green-500' },
    { icon: BookOpen, title: 'Buku baru "Sapiens" ditambahkan', time: '1 jam yang lalu', color: 'bg-blue-500' },
    { icon: Users, title: 'Member baru "Ahmad" terdaftar', time: '2 jam yang lalu', color: 'bg-purple-500' },
    { icon: Clock, title: 'Peminjaman "Bumi Manusia" oleh Siti', time: '3 jam yang lalu', color: 'bg-orange-500' }
  ];

  const pendingApprovals = [
    { title: 'The Pragmatic Programmer', staff: 'Staf 1' },
    { title: 'Clean Code', staff: 'Staf 1' },
    { title: 'Design Patterns', staff: 'Staf 2' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Dashboard</h1>
        <p className="text-gray-600">Ringkasan aktivitas perpustakaan</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <DashboardCard
          title="Total Buku"
          value={stats.totalBooks}
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
          value={stats.activeBorrowings}
          icon={Clock}
          color="bg-orange-500"
        />
        <DashboardCard
          title="Menunggu Approval"
          value={stats.pendingApprovals}
          icon={AlertCircle}
          color="bg-red-500"
        />
      </div>

      {/* Activity and Approvals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentActivity activities={recentActivities} />
        <PendingApprovals approvals={pendingApprovals} />
      </div>
    </div>
  );
}