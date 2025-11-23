// src/components/staf/StafLayout.js
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BookOpen, Users, Library, Menu, X, LogOut, Settings } from 'lucide-react';

const StafLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const pathname = usePathname();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, path: '/staf/dashboard' },
    { id: 'buku', label: 'Manajemen Buku', icon: BookOpen, path: '/staf/buku' },
    { id: 'genre', label: 'Manajemen Genre', icon: Users, path: '/staf/genre' },
    { id: 'tags', label: 'Manajemen Tags', icon: Users, path: '/staf/tags' },
    { id: 'katalog', label: 'Katalog Buku', icon: Library, path: '/staf/katalog' },
  ];

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
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive ? 'bg-blue-700 text-white' : 'hover:bg-blue-800 text-blue-100'
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
          <button className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-800 w-full text-left">
            <LogOut size={20} />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
};

export default StafLayout;