'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BookOpen, Users, Library, Menu, X, LogOut, Settings } from 'lucide-react';
import dynamic from 'next/dynamic';

const NotificationBellLazy = dynamic(() => import('@/components/ui/NotificationBell'), { ssr: false });

const StafLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const pathname = usePathname();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, path: '/staf/dashboard' },
    { id: 'buku', label: 'Manajemen Buku', icon: BookOpen, path: '/staf/buku' },
    { id: 'genre', label: 'Manajemen Genre', icon: Users, path: '/staf/genre' },
    { id: 'tags', label: 'Manajemen Tags', icon: Users, path: '/staf/tags' },
    { id: 'katalog', label: 'Katalog Buku', icon: Library, path: '/staf/katalog' },
    { id: 'peminjaman', label: 'peminjaman', icon: BookOpen, path: '/staf/peminjaman' },
  ];

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-blue-900 text-white transition-all duration-300 flex flex-col`}>
        <div className="p-4 flex items-center justify-between border-b border-blue-800">
          {sidebarOpen && <h1 className="text-xl font-bold">Perpustakaan Staf</h1>}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-lg hover:bg-blue-800">
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.id}
                href={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-blue-700 text-white' : 'hover:bg-blue-800 text-blue-100'
                  }`}
              >
                <Icon size={20} />
                {sidebarOpen && <span className="font-medium">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-blue-800 space-y-2">
          <button className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-blue-800 w-full text-left">
            <Settings size={20} />
            {sidebarOpen && <span>Pengaturan</span>}
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-800 w-full text-left"
          >
            <LogOut size={20} />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header with NotificationBell */}
        <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between flex-shrink-0 shadow-sm">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Staf Panel</p>
            <p className="font-bold text-gray-800">Perpustakaan Digital</p>
          </div>
          <div className="flex items-center gap-3">
            <NotificationBellLazy role="staf" />
            <div className="flex items-center gap-2 pl-3 border-l border-gray-200">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-md">
                S
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-semibold text-gray-800">Staf</p>
                <p className="text-xs text-gray-400">Petugas Perpustakaan</p>
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 md:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default StafLayout;