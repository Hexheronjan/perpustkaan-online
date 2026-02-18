'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BookOpen, Library, Menu, X, LogOut, Settings, RotateCcw } from 'lucide-react';
import dynamic from 'next/dynamic';

const NotificationBellLazy = dynamic(() => import('@/components/ui/NotificationBell'), { ssr: false });

const MemberLayout = ({ children }) => {
    const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true);
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
    const pathname = usePathname();

    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: Home, path: '/member/dashboard' },
        { id: 'katalog', label: 'Katalog Buku', icon: Library, path: '/member/buku' },
        { id: 'peminjaman', label: 'Peminjaman Saya', icon: BookOpen, path: '/member/peminjaman' },
        { id: 'pengembalian', label: 'Pengembalian', icon: RotateCcw, path: '/member/pengembalian' },
    ];

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            window.location.href = '/login';
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    const NavContent = ({ isCollapsed = false }) => (
        <>
            <div className="p-4 flex items-center justify-between border-b border-indigo-800 h-16">
                {!isCollapsed && <h1 className="text-xl font-bold">Perpustakaan</h1>}
                <button
                    onClick={() => setDesktopSidebarOpen(!desktopSidebarOpen)}
                    className={`p-2 rounded-lg hover:bg-indigo-800 hidden md:block ${isCollapsed ? 'mx-auto' : ''}`}
                >
                    {desktopSidebarOpen ? <Menu size={20} /> : <Menu size={20} />}
                </button>
                {/* Mobile Close Button */}
                <button
                    onClick={() => setMobileSidebarOpen(false)}
                    className="p-2 rounded-lg hover:bg-indigo-800 md:hidden block ml-auto"
                >
                    <X size={20} />
                </button>
            </div>

            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.path;
                    return (
                        <Link
                            key={item.id}
                            href={item.path}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-indigo-700 text-white' : 'hover:bg-indigo-800 text-indigo-100'
                                }`}
                            onClick={() => setMobileSidebarOpen(false)}
                        >
                            <Icon size={20} className="flex-shrink-0" />
                            {!isCollapsed && <span className="font-medium whitespace-nowrap">{item.label}</span>}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-indigo-800 space-y-2">
                <button className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-indigo-800 w-full text-left text-indigo-100">
                    <Settings size={20} className="flex-shrink-0" />
                    {!isCollapsed && <span className="whitespace-nowrap">Pengaturan</span>}
                </button>
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-800 w-full text-left text-indigo-100"
                >
                    <LogOut size={20} className="flex-shrink-0" />
                    {!isCollapsed && <span className="whitespace-nowrap">Logout</span>}
                </button>
            </div>
        </>
    );

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Mobile Sidebar Overlay */}
            {mobileSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={() => setMobileSidebarOpen(false)}
                />
            )}

            {/* Mobile Sidebar Drawer */}
            <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-indigo-900 text-white transition-transform duration-300 md:hidden ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                } flex flex-col`}>
                <NavContent isCollapsed={false} />
            </aside>

            {/* Desktop Sidebar */}
            <aside className={`hidden md:flex bg-indigo-900 text-white transition-all duration-300 flex-col ${desktopSidebarOpen ? 'w-64' : 'w-20'
                }`}>
                <NavContent isCollapsed={!desktopSidebarOpen} />
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                {/* Mobile Header */}
                <header className="md:hidden bg-white border-b border-gray-200 p-4 flex items-center justify-between flex-shrink-0">
                    <h1 className="text-lg font-bold text-gray-800">Perpustakaan</h1>
                    <div className="flex items-center gap-2">
                        <NotificationBellLazy role="member" />
                        <button
                            onClick={() => setMobileSidebarOpen(true)}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                        >
                            <Menu size={24} />
                        </button>
                    </div>
                </header>

                {/* Desktop Header */}
                <header className="hidden md:flex bg-white border-b border-gray-200 px-6 py-3 items-center justify-between flex-shrink-0 shadow-sm">
                    <div>
                        <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Member</p>
                        <p className="font-bold text-gray-800">Perpustakaan Digital</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <NotificationBellLazy role="member" />
                        <div className="flex items-center gap-2 pl-3 border-l border-gray-200">
                            <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-pink-600 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-md">
                                M
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-800">Member</p>
                                <p className="text-xs text-gray-400">Anggota Perpustakaan</p>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-4 md:p-6">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default MemberLayout;
