'use client';

import { useState, useEffect, useRef } from 'react';
import { Bell, BookOpen, Clock, CheckCircle, AlertCircle, X, Users } from 'lucide-react';
import { getAuthHeaders, getUser } from '@/lib/client-auth';

const TYPE_CONFIG = {
    pending_book: { icon: BookOpen, color: 'text-amber-500', bg: 'bg-amber-50' },
    due_soon: { icon: Clock, color: 'text-orange-500', bg: 'bg-orange-50' },
    overdue: { icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-50' },
    approved: { icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    new_member: { icon: Users, color: 'text-blue-500', bg: 'bg-blue-50' },
    default: { icon: Bell, color: 'text-gray-500', bg: 'bg-gray-50' },
};

function timeAgo(dateStr) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Baru saja';
    if (mins < 60) return `${mins} menit lalu`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs} jam lalu`;
    return `${Math.floor(hrs / 24)} hari lalu`;
}

export default function NotificationBell({ role = 'admin' }) {
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unread, setUnread] = useState(0);
    const [loading, setLoading] = useState(false);
    const ref = useRef(null);

    // Close on outside click
    useEffect(() => {
        function handleClick(e) {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        }
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    // Fetch notifications
    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000); // refresh every 30s
        return () => clearInterval(interval);
    }, [role]);

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const user = getUser();
            const headers = getAuthHeaders();
            const notifs = [];

            if (role === 'admin') {
                // Pending book approvals
                const pendingRes = await fetch('/api/staf/buku?status=pending', { headers });
                if (pendingRes.ok) {
                    const pending = await pendingRes.json();
                    const pendingArr = Array.isArray(pending) ? pending : [];
                    pendingArr.slice(0, 5).forEach(b => {
                        notifs.push({
                            id: `pending-${b.id}`,
                            type: 'pending_book',
                            title: 'Buku menunggu approval',
                            message: `"${b.judul}" perlu disetujui`,
                            time: b.created_at,
                            read: false,
                        });
                    });
                }

                // Overdue borrowings
                const overdueRes = await fetch('/api/admin/peminjaman?status=terlambat', { headers });
                if (overdueRes.ok) {
                    const overdue = await overdueRes.json();
                    const overdueArr = Array.isArray(overdue) ? overdue : [];
                    overdueArr.slice(0, 3).forEach(p => {
                        notifs.push({
                            id: `overdue-${p.id}`,
                            type: 'overdue',
                            title: 'Peminjaman terlambat',
                            message: `"${p.judul || p.buku_judul}" oleh ${p.username || p.nama_lengkap}`,
                            time: p.tanggal_kembali || p.created_at,
                            read: false,
                        });
                    });
                }
            } else if (role === 'staf') {
                // My pending books
                const bukuRes = await fetch('/api/staf/buku', { headers });
                if (bukuRes.ok) {
                    const buku = await bukuRes.json();
                    const bukuArr = Array.isArray(buku) ? buku : [];
                    bukuArr.filter(b => b.status === 'pending').slice(0, 5).forEach(b => {
                        notifs.push({
                            id: `pending-${b.id}`,
                            type: 'pending_book',
                            title: 'Menunggu approval admin',
                            message: `"${b.judul}" belum disetujui`,
                            time: b.created_at,
                            read: false,
                        });
                    });
                }
            } else if (role === 'member') {
                // Due soon / overdue loans
                if (user?.id) {
                    const statsRes = await fetch(`/api/member/stats?user_id=${user.id}`, { headers });
                    if (statsRes.ok) {
                        const stats = await statsRes.json();
                        if (stats.dueSoon > 0) {
                            notifs.push({
                                id: 'due-soon',
                                type: 'due_soon',
                                title: 'Buku hampir jatuh tempo',
                                message: `${stats.dueSoon} buku akan jatuh tempo dalam 3 hari`,
                                time: new Date().toISOString(),
                                read: false,
                            });
                        }
                        if (stats.fines > 0) {
                            notifs.push({
                                id: 'fines',
                                type: 'overdue',
                                title: 'Ada denda peminjaman',
                                message: `Total denda: Rp ${stats.fines.toLocaleString('id-ID')}`,
                                time: new Date().toISOString(),
                                read: false,
                            });
                        }
                    }
                }
            }

            // Sort by time desc
            notifs.sort((a, b) => new Date(b.time) - new Date(a.time));
            setNotifications(notifs);
            setUnread(notifs.filter(n => !n.read).length);
        } catch (e) {
            console.error('Notification fetch error:', e);
        } finally {
            setLoading(false);
        }
    };

    const markAllRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        setUnread(0);
    };

    return (
        <div className="relative" ref={ref}>
            {/* Bell Button */}
            <button
                onClick={() => { setOpen(!open); if (!open && unread > 0) markAllRead(); }}
                className="relative p-2 rounded-xl hover:bg-white/20 transition-colors group"
                title="Notifikasi"
            >
                <Bell
                    size={22}
                    className={`transition-transform group-hover:rotate-12 ${unread > 0 ? 'text-amber-400' : 'text-gray-500'}`}
                />
                {unread > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 animate-pulse">
                        {unread > 9 ? '9+' : unread}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {open && (
                <div className="absolute right-0 top-full mt-2 w-[360px] bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                        <div className="flex items-center gap-2">
                            <Bell size={18} />
                            <span className="font-semibold text-sm">Notifikasi</span>
                            {unread > 0 && (
                                <span className="bg-white/20 text-white text-xs px-2 py-0.5 rounded-full">{unread} baru</span>
                            )}
                        </div>
                        <button onClick={() => setOpen(false)} className="hover:bg-white/20 p-1 rounded-lg transition-colors">
                            <X size={16} />
                        </button>
                    </div>

                    {/* Notifications List */}
                    <div className="max-h-[380px] overflow-y-auto">
                        {loading ? (
                            <div className="flex items-center justify-center py-8">
                                <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="text-center py-10 px-4">
                                <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <Bell size={24} className="text-gray-300" />
                                </div>
                                <p className="text-gray-500 text-sm font-medium">Tidak ada notifikasi</p>
                                <p className="text-gray-400 text-xs mt-1">Semua sudah up to date!</p>
                            </div>
                        ) : (
                            notifications.map(notif => {
                                const cfg = TYPE_CONFIG[notif.type] || TYPE_CONFIG.default;
                                const Icon = cfg.icon;
                                return (
                                    <div
                                        key={notif.id}
                                        className={`flex items-start gap-3 px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer ${!notif.read ? 'bg-indigo-50/30' : ''}`}
                                    >
                                        <div className={`flex-shrink-0 p-2 rounded-xl ${cfg.bg} mt-0.5`}>
                                            <Icon size={16} className={cfg.color} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-gray-800 leading-tight">{notif.title}</p>
                                            <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{notif.message}</p>
                                            <p className="text-[11px] text-gray-400 mt-1">{timeAgo(notif.time)}</p>
                                        </div>
                                        {!notif.read && (
                                            <div className="flex-shrink-0 w-2 h-2 bg-indigo-500 rounded-full mt-2" />
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 0 && (
                        <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
                            <button
                                onClick={markAllRead}
                                className="text-xs text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
                            >
                                Tandai semua sudah dibaca
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
