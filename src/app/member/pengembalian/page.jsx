'use client';

import { useState, useEffect } from 'react';
import { getUser, getAuthHeaders } from '@/lib/client-auth';
import { RotateCcw, BookOpen, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

const NotificationModal = ({ isOpen, onClose, type, title, message }) => {
    if (!isOpen) return null;

    const isSuccess = type === 'success';
    const Icon = isSuccess ? CheckCircle : XCircle;
    const bgColor = isSuccess ? 'bg-green-100' : 'bg-red-100';
    const iconColor = isSuccess ? 'text-green-600' : 'text-red-600';
    const buttonColor = isSuccess ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700';

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden transform transition-all scale-100">
                <div className="p-6 text-center">
                    <div className={`w-16 h-16 mx-auto ${bgColor} rounded-full flex items-center justify-center mb-4`}>
                        <Icon className={`w-8 h-8 ${iconColor}`} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
                    <p className="text-gray-600 mb-6">{message}</p>
                    <button
                        onClick={onClose}
                        className={`w-full py-2.5 text-white rounded-xl font-medium transition-colors ${buttonColor}`}
                    >
                        OK
                    </button>
                </div>
            </div>
        </div>
    );
};

export default function MemberReturn() {
    const [loans, setLoans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [returnModal, setReturnModal] = useState({
        isOpen: false,
        loanId: null,
        bookTitle: ''
    });
    const [notification, setNotification] = useState({
        isOpen: false,
        type: 'success',
        title: '',
        message: ''
    });
    const [returning, setReturning] = useState(false);

    useEffect(() => {
        fetchActiveLoans();
    }, []);

    const fetchActiveLoans = async () => {
        const user = getUser();
        if (user) {
            try {
                // Fetch all loans and filter client-side for now, or update API to support filtering
                const res = await fetch(`/api/member/loans?user_id=${user.id}`, {
                    headers: getAuthHeaders()
                });
                if (res.ok) {
                    const data = await res.json();
                    // Filter only active loans
                    const activeLoans = data.filter(loan => loan.status === 'dipinjam');
                    setLoans(activeLoans);
                }
            } catch (error) {
                console.error('Error fetching loans:', error);
            }
        }
        setLoading(false);
    };

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

            setReturnModal({ ...returnModal, isOpen: false });
            setNotification({
                isOpen: true,
                type: 'success',
                title: 'Berhasil',
                message: 'Buku berhasil dikembalikan!'
            });
            fetchActiveLoans(); // Refresh list

        } catch (error) {
            setNotification({
                isOpen: true,
                type: 'error',
                title: 'Gagal',
                message: error.message
            });
        } finally {
            setReturning(false);
        }
    };

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

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2 mb-6">
                    <RotateCcw className="text-indigo-600" /> Pengembalian Buku
                </h1>

                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                        <p className="mt-4 text-gray-500">Memuat data peminjaman...</p>
                    </div>
                ) : loans.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {loans.map((loan) => (
                            <div key={loan.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow bg-white flex flex-col">
                                <div className="flex gap-4 mb-4">
                                    {loan.sampul_buku ? (
                                        <img
                                            src={loan.sampul_buku}
                                            alt={loan.judul}
                                            className="w-20 h-28 object-cover rounded shadow-sm"
                                        />
                                    ) : (
                                        <div className="w-20 h-28 bg-gray-100 rounded flex items-center justify-center text-gray-400">
                                            <BookOpen size={24} />
                                        </div>
                                    )}
                                    <div className="flex-1">
                                        <h3 className="font-bold text-gray-800 line-clamp-2 mb-1">{loan.judul}</h3>
                                        <div className="text-sm text-gray-500 space-y-1">
                                            <p>Pinjam: {formatDate(loan.tanggal_pinjam)}</p>
                                            <p>Tempo: <span className="text-red-600 font-medium">{formatDate(loan.tanggal_kembali_target)}</span></p>
                                            {loan.denda > 0 && (
                                                <p className="text-red-600 font-bold">Denda: {formatCurrency(loan.denda)}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleReturnClick(loan)}
                                    className="mt-auto w-full py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                                >
                                    <RotateCcw size={16} />
                                    Kembalikan Buku
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                        <RotateCcw className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                        <h3 className="text-lg font-medium text-gray-900">Tidak ada buku yang dipinjam</h3>
                        <p className="text-gray-500">Anda tidak memiliki buku yang perlu dikembalikan saat ini.</p>
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
                                    className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-medium transition-colors flex items-center justify-center gap-2"
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

            {/* Notification Modal */}
            <NotificationModal
                isOpen={notification.isOpen}
                onClose={() => setNotification({ ...notification, isOpen: false })}
                type={notification.type}
                title={notification.title}
                message={notification.message}
            />
        </div>
    );
}
