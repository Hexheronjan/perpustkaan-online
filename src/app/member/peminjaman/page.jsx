'use client';

import { useState, useEffect } from 'react';
import { getUser, getAuthHeaders } from '@/lib/client-auth';
import { BookOpen, Calendar, AlertCircle } from 'lucide-react';

export default function MemberLoans() {
    const [loans, setLoans] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLoans = async () => {
            const user = getUser();
            if (user) {
                try {
                    const res = await fetch(`/api/member/loans?user_id=${user.id}`, {
                        headers: getAuthHeaders()
                    });
                    if (res.ok) {
                        const data = await res.json();
                        setLoans(data);
                    }
                } catch (error) {
                    console.error('Error fetching loans:', error);
                }
            }
            setLoading(false);
        };

        fetchLoans();
    }, []);

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(amount);
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'dipinjam':
                return <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">Dipinjam</span>;
            case 'dikembalikan':
                return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">Dikembalikan</span>;
            case 'terlambat':
                return <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">Terlambat</span>;
            default:
                return <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">{status}</span>;
        }
    };

    const [statusModal, setStatusModal] = useState({
        isOpen: false,
        type: 'success', // 'success' or 'error'
        message: ''
    });

    const [returnModal, setReturnModal] = useState({
        isOpen: false,
        loanId: null,
        bookTitle: ''
    });
    const [returning, setReturning] = useState(false);

    const handleReturnClick = (loan) => {
        setReturnModal({
            isOpen: true,
            loanId: loan.id,
            bookTitle: loan.judul
        });
    };

    const confirmReturn = async () => {
        setReturning(true);
        try {
            const user = getUser();
            if (!user) return;

            const res = await fetch('/api/member/peminjaman', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeaders()
                },
                body: JSON.stringify({
                    id: returnModal.loanId,
                    user_id: user.id
                })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'Gagal mengembalikan buku');
            }

            // alert('Buku berhasil dikembalikan!');
            setStatusModal({
                isOpen: true,
                type: 'success',
                message: 'Buku berhasil dikembalikan! Silakan tunggu persetujuan admin/staf.'
            });
            setReturnModal({ ...returnModal, isOpen: false });

            // Refresh loans
            const loansRes = await fetch(`/api/member/loans?user_id=${user.id}`, {
                headers: getAuthHeaders()
            });
            if (loansRes.ok) {
                const loansData = await loansRes.json();
                setLoans(loansData);
            }

        } catch (error) {
            // alert(error.message);
            setStatusModal({
                isOpen: true,
                type: 'error',
                message: error.message
            });
        } finally {
            setReturning(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2 mb-6">
                    <BookOpen className="text-indigo-600" /> Peminjaman Saya
                </h1>

                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                        <p className="mt-4 text-gray-500">Memuat data peminjaman...</p>
                    </div>
                ) : loans.length > 0 ? (
                    <>
                        {/* Desktop Table View */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-gray-200">
                                        <th className="py-3 px-4 text-sm font-semibold text-gray-600">Buku</th>
                                        <th className="py-3 px-4 text-sm font-semibold text-gray-600">Tanggal Pinjam</th>
                                        <th className="py-3 px-4 text-sm font-semibold text-gray-600">Jatuh Tempo</th>
                                        <th className="py-3 px-4 text-sm font-semibold text-gray-600">Status</th>
                                        <th className="py-3 px-4 text-sm font-semibold text-gray-600">Denda</th>
                                        <th className="py-3 px-4 text-sm font-semibold text-gray-600">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loans.map((loan) => (
                                        <tr key={loan.id} className="border-b border-gray-100 hover:bg-gray-50">
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-3">
                                                    {loan.sampul_buku && (
                                                        <img
                                                            src={loan.sampul_buku}
                                                            alt={loan.judul}
                                                            className="w-10 h-14 object-cover rounded shadow-sm"
                                                        />
                                                    )}
                                                    <span className="font-medium text-gray-800">{loan.judul}</span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 text-gray-600">{formatDate(loan.tanggal_pinjam)}</td>
                                            <td className="py-3 px-4 text-gray-600">{formatDate(loan.tanggal_kembali_target)}</td>
                                            <td className="py-3 px-4">{getStatusBadge(loan.status)}</td>
                                            <td className="py-3 px-4 font-medium text-red-600">
                                                {loan.denda > 0 ? formatCurrency(loan.denda) : '-'}
                                            </td>
                                            <td className="py-3 px-4">
                                                {loan.status === 'dipinjam' && (
                                                    <button
                                                        onClick={() => handleReturnClick(loan)}
                                                        className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-medium hover:bg-green-200 transition-colors"
                                                    >
                                                        Kembalikan
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Card View */}
                        <div className="md:hidden space-y-4">
                            {loans.map((loan) => (
                                <div key={loan.id} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                                    <div className="flex gap-4 mb-3">
                                        {loan.sampul_buku && (
                                            <img
                                                src={loan.sampul_buku}
                                                alt={loan.judul}
                                                className="w-16 h-24 object-cover rounded shadow-sm flex-shrink-0"
                                            />
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start mb-1">
                                                <h3 className="font-bold text-gray-800 text-sm line-clamp-2 pr-2">{loan.judul}</h3>
                                                <div className="flex-shrink-0">
                                                    {getStatusBadge(loan.status)}
                                                </div>
                                            </div>

                                            <div className="space-y-1 text-xs text-gray-500 mt-2">
                                                <div className="flex justify-between">
                                                    <span>Pinjam:</span>
                                                    <span className="font-medium text-gray-700">{formatDate(loan.tanggal_pinjam)}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Tempo:</span>
                                                    <span className="font-medium text-gray-700">{formatDate(loan.tanggal_kembali_target)}</span>
                                                </div>
                                                {loan.denda > 0 && (
                                                    <div className="flex justify-between text-red-600 font-medium">
                                                        <span>Denda:</span>
                                                        <span>{formatCurrency(loan.denda)}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {loan.status === 'dipinjam' && (
                                        <button
                                            onClick={() => handleReturnClick(loan)}
                                            className="w-full py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors flex items-center justify-center gap-2"
                                        >
                                            Kembalikan Buku
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                        <BookOpen className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                        <h3 className="text-lg font-medium text-gray-900">Belum ada peminjaman</h3>
                        <p className="text-gray-500">Anda belum meminjam buku apapun.</p>
                    </div>
                )}
            </div>

            {/* Return Modal */}
            {returnModal.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-fade-in-up">
                        <div className="p-6">
                            <h3 className="text-xl font-bold text-gray-800 mb-2">Konfirmasi Pengembalian</h3>
                            <p className="text-gray-600 mb-6">
                                Apakah Anda yakin ingin mengembalikan buku <span className="font-semibold text-indigo-600">"{returnModal.bookTitle}"</span>?
                            </p>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setReturnModal({ ...returnModal, isOpen: false })}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium transition-colors"
                                    disabled={returning}
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={confirmReturn}
                                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 font-medium transition-colors flex items-center justify-center gap-2"
                                    disabled={returning}
                                >
                                    {returning ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                            Memproses...
                                        </>
                                    ) : (
                                        'Ya, Kembalikan'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Status Modal (Success/Error) */}
            {statusModal.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-fade-in-up">
                        <div className="p-6 text-center">
                            <div className={`mx-auto flex items-center justify-center h-12 w-12 rounded-full mb-4 ${statusModal.type === 'success' ? 'bg-green-100' : 'bg-red-100'}`}>
                                {statusModal.type === 'success' ? (
                                    <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                    </svg>
                                ) : (
                                    <AlertCircle className="h-6 w-6 text-red-600" />
                                )}
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                {statusModal.type === 'success' ? 'Berhasil!' : 'Gagal!'}
                            </h3>
                            <p className="text-sm text-gray-500 mb-6">
                                {statusModal.message}
                            </p>
                            <button
                                onClick={() => setStatusModal({ ...statusModal, isOpen: false })}
                                className={`w-full px-4 py-2 rounded-xl text-white font-medium transition-colors ${statusModal.type === 'success' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
