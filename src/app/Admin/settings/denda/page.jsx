'use client';

import { useState, useEffect } from 'react';
import { Save, AlertCircle, CheckCircle, DollarSign, Clock, AlertTriangle } from 'lucide-react';
import { getAuthHeaders } from '@/lib/client-auth';

export default function DendaSettingsPage() {
    const [settings, setSettings] = useState({
        denda_per_hari: 2000,
        durasi_pinjam_default: 7,
        max_durasi_pinjam: 30,
        denda_hilang: 50000
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [status, setStatus] = useState({ type: '', message: '' });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await fetch('/api/settings/denda', {
                headers: getAuthHeaders()
            });
            if (res.ok) {
                const data = await res.json();
                setSettings(data);
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
            setStatus({ type: 'error', message: 'Gagal memuat pengaturan' });
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setSettings(prev => ({
            ...prev,
            [name]: Number(value)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setStatus({ type: '', message: '' });

        try {
            const res = await fetch('/api/settings/denda', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeaders()
                },
                body: JSON.stringify(settings)
            });

            const data = await res.json();

            if (res.ok) {
                setStatus({ type: 'success', message: 'Pengaturan berhasil disimpan' });
            } else {
                throw new Error(data.message || 'Gagal menyimpan pengaturan');
            }
        } catch (error) {
            setStatus({ type: 'error', message: error.message });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <DollarSign className="text-indigo-600" /> Pengaturan Denda & Peminjaman
                </h1>
                <p className="text-gray-500 mt-1">Atur nominal denda dan durasi peminjaman buku.</p>
            </div>

            {status.message && (
                <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${status.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
                    }`}>
                    {status.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                    {status.message}
                </div>
            )}

            <form onSubmit={handleSubmit} className="grid gap-6 md:grid-cols-2">
                {/* Denda Settings */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-6">
                    <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2 border-b pb-3">
                        <AlertTriangle size={18} className="text-orange-500" /> Nominal Denda
                    </h2>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Denda Keterlambatan (per hari)
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span className="text-gray-500">Rp</span>
                            </div>
                            <input
                                type="number"
                                name="denda_per_hari"
                                value={settings.denda_per_hari}
                                onChange={handleChange}
                                className="pl-10 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 border"
                                min="0"
                                required
                            />
                        </div>
                        <p className="mt-1 text-xs text-gray-500">Denda yang dikenakan setiap hari keterlambatan.</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Denda Buku Hilang/Rusak
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span className="text-gray-500">Rp</span>
                            </div>
                            <input
                                type="number"
                                name="denda_hilang"
                                value={settings.denda_hilang}
                                onChange={handleChange}
                                className="pl-10 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 border"
                                min="0"
                                required
                            />
                        </div>
                        <p className="mt-1 text-xs text-gray-500">Denda default jika buku hilang atau rusak parah.</p>
                    </div>
                </div>

                {/* Durasi Settings */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-6">
                    <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2 border-b pb-3">
                        <Clock size={18} className="text-blue-500" /> Durasi Peminjaman
                    </h2>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Durasi Default (Hari)
                        </label>
                        <input
                            type="number"
                            name="durasi_pinjam_default"
                            value={settings.durasi_pinjam_default}
                            onChange={handleChange}
                            className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3 border"
                            min="1"
                            required
                        />
                        <p className="mt-1 text-xs text-gray-500">Lama peminjaman standar untuk member.</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Maksimal Durasi (Hari)
                        </label>
                        <input
                            type="number"
                            name="max_durasi_pinjam"
                            value={settings.max_durasi_pinjam}
                            onChange={handleChange}
                            className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3 border"
                            min="1"
                            required
                        />
                        <p className="mt-1 text-xs text-gray-500">Batas maksimal lama peminjaman yang diizinkan.</p>
                    </div>
                </div>

                <div className="md:col-span-2 flex justify-end pt-4">
                    <button
                        type="submit"
                        disabled={saving}
                        className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                    >
                        {saving ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                Menyimpan...
                            </>
                        ) : (
                            <>
                                <Save size={18} /> Simpan Pengaturan
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
