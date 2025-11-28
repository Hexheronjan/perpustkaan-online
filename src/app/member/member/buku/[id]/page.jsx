"use client";

import { useEffect, useState, use } from "react";
import { apiFetch } from "@/lib/api-client";
import { getUser, getRole } from "@/lib/client-auth";
import { ArrowLeft, Calendar, BookOpen, User, Tag, Clock, AlertCircle, CheckCircle2 } from "lucide-react";

function formatDateInput(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

export default function BookDetailPage({ params }) {
    // Unwrap params using React.use()
    const resolvedParams = use(params);
    const { id } = resolvedParams;

    const [book, setBook] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [borrowDate, setBorrowDate] = useState(() => {
        const defaultDate = new Date();
        defaultDate.setDate(defaultDate.getDate() + 7);
        return formatDateInput(defaultDate);
    });
    const [catatan, setCatatan] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [user, setUser] = useState(null);

    useEffect(() => {
        setUser(getUser());

        async function fetchBook() {
            try {
                setLoading(true);
                // We can reuse the member/buku API but we might need to filter or just fetch all and find one
                // Ideally we should have a specific endpoint, but for now let's use the list endpoint and filter client side
                // or if there is a specific endpoint. 
                // Checking the previous file list, there isn't a specific single book endpoint visible in api/member/buku/route.js (it returns all).
                // So we fetch all and find. Efficient? No. But safe for now given the constraints.
                // Wait, I can check if api/member/buku supports query params or if I should add a specific route.
                // The previous view of api/member/buku/route.js wasn't shown, but usually it returns a list.
                // Let's assume we fetch all for now or I can implement a specific GET endpoint later if needed.
                // Actually, let's try to fetch all and filter.

                const data = await apiFetch("/api/member/buku");
                const foundBook = data.find((b) => b.id === parseInt(id));

                if (!foundBook) {
                    setError("Buku tidak ditemukan.");
                } else {
                    setBook(foundBook);
                }
            } catch (e) {
                setError(e.message || "Gagal memuat detail buku.");
            } finally {
                setLoading(false);
            }
        }

        fetchBook();
    }, [id]);

    async function handleBorrow(e) {
        e.preventDefault();
        if (!user) {
            setError("Anda harus login untuk meminjam buku.");
            return;
        }

        try {
            setSubmitting(true);
            setError("");
            setSuccessMessage("");

            await apiFetch("/api/member/peminjaman", {
                method: "POST",
                body: JSON.stringify({
                    user_id: user.id,
                    buku_id: parseInt(id),
                    tanggal_kembali_target: borrowDate,
                    catatan: catatan,
                }),
            });

            setSuccessMessage("Permintaan peminjaman berhasil dikirim! Menunggu persetujuan Admin/Staf.");
            setCatatan("");
        } catch (e) {
            setError(e.message || "Gagal mengirim permintaan peminjaman.");
        } finally {
            setSubmitting(false);
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="animate-pulse flex flex-col items-center">
                    <div className="h-12 w-12 bg-slate-200 rounded-full mb-4"></div>
                    <div className="h-4 w-48 bg-slate-200 rounded"></div>
                </div>
            </div>
        );
    }

    if (!book && !loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-slate-800">Buku Tidak Ditemukan</h1>
                    <button
                        onClick={() => window.history.back()}
                        className="mt-4 text-indigo-600 hover:underline"
                    >
                        Kembali
                    </button>
                </div>
            </div>
        );
    }

    const available = (book.stok_tersedia ?? book.stock ?? 0) > 0;

    return (
        <div className="min-h-screen bg-slate-50 py-10 px-6">
            <div className="max-w-4xl mx-auto space-y-6">
                <button
                    onClick={() => window.location.href = "/member"}
                    className="inline-flex items-center text-sm text-slate-500 hover:text-indigo-600 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Kembali ke Katalog
                </button>

                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
                    <div className="md:flex">
                        {/* Book Cover / Visual */}
                        <div className="md:w-1/3 bg-slate-100 p-8 flex items-center justify-center">
                            <div className="w-48 h-72 bg-white shadow-lg rounded-lg flex items-center justify-center text-slate-300">
                                {book.sampul_buku ? (
                                    <img src={book.sampul_buku} alt={book.judul} className="w-full h-full object-cover rounded-lg" />
                                ) : (
                                    <BookOpen className="w-16 h-16" />
                                )}
                            </div>
                        </div>

                        {/* Content */}
                        <div className="md:w-2/3 p-8 md:p-10 flex flex-col">
                            <div className="flex-1 space-y-6">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-medium">
                                            {book.genre_id ? `Genre #${book.genre_id}` : "Umum"}
                                        </span>
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${available ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                                            {available ? 'Tersedia' : 'Stok Habis'}
                                        </span>
                                    </div>
                                    <h1 className="text-3xl font-bold text-slate-900 leading-tight mb-2">
                                        {book.judul || book.title}
                                    </h1>
                                    <div className="flex items-center text-slate-500 text-sm">
                                        <User className="w-4 h-4 mr-2" />
                                        {book.penulis || book.author || "Penulis tidak diketahui"}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 py-6 border-y border-slate-100">
                                    <div>
                                        <p className="text-xs text-slate-400 uppercase tracking-wider">Penerbit</p>
                                        <p className="font-medium text-slate-700">{book.penerbit || "-"}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400 uppercase tracking-wider">Tahun Terbit</p>
                                        <p className="font-medium text-slate-700">{book.tahun_terbit || "-"}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400 uppercase tracking-wider">ISBN</p>
                                        <p className="font-medium text-slate-700">{book.isbn || "-"}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400 uppercase tracking-wider">Halaman</p>
                                        <p className="font-medium text-slate-700">{book.jumlah_halaman || "-"}</p>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="font-semibold text-slate-900 mb-2">Sinopsis</h3>
                                    <p className="text-slate-600 leading-relaxed text-sm">
                                        {book.deskripsi || "Tidak ada deskripsi tersedia."}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Borrowing Form Section */}
                <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                            <Calendar className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-slate-900">Ajukan Peminjaman</h2>
                            <p className="text-sm text-slate-500">Isi formulir untuk meminjam buku ini</p>
                        </div>
                    </div>

                    {successMessage ? (
                        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 text-center space-y-3">
                            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                                <CheckCircle2 className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-semibold text-emerald-800">Permintaan Terkirim!</h3>
                            <p className="text-emerald-700">{successMessage}</p>
                            <button
                                onClick={() => window.location.href = "/member"}
                                className="mt-4 px-6 py-2 bg-emerald-600 text-white rounded-full text-sm font-medium hover:bg-emerald-700 transition"
                            >
                                Kembali ke Katalog
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleBorrow} className="space-y-6 max-w-xl">
                            {error && (
                                <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                                    <AlertCircle className="w-5 h-5 shrink-0" />
                                    <p>{error}</p>
                                </div>
                            )}

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Tanggal Pengembalian
                                    </label>
                                    <input
                                        type="date"
                                        required
                                        value={borrowDate}
                                        onChange={(e) => setBorrowDate(e.target.value)}
                                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition"
                                    />
                                    <p className="mt-1 text-xs text-slate-400">
                                        Estimasi durasi peminjaman standar adalah 7 hari.
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Catatan (Opsional)
                                    </label>
                                    <textarea
                                        rows={3}
                                        value={catatan}
                                        onChange={(e) => setCatatan(e.target.value)}
                                        placeholder="Contoh: Untuk keperluan tugas akhir..."
                                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition"
                                    />
                                </div>
                            </div>

                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={submitting || !available}
                                    className="w-full sm:w-auto px-8 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg shadow-indigo-200"
                                >
                                    {submitting ? "Mengirim Permintaan..." : available ? "Kirim Permintaan Peminjaman" : "Stok Habis"}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
