'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, Book, AlertCircle } from 'lucide-react';

export default function MemberCatalog() {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedGenre, setSelectedGenre] = useState('all');
    const [genres, setGenres] = useState([]);

    const [borrowModal, setBorrowModal] = useState({
        isOpen: false,
        bookId: null,
        bookTitle: '',
        duration: 7
    });
    const [borrowing, setBorrowing] = useState(false);

    const [statusModal, setStatusModal] = useState({
        isOpen: false,
        type: 'success', // 'success' or 'error'
        message: ''
    });

    useEffect(() => {
        fetchBooks();
        fetchGenres();
    }, []);

    const fetchBooks = async () => {
        try {
            const res = await fetch('/api/visitor/books');
            if (res.ok) {
                const data = await res.json();
                setBooks(data);
            }
        } catch (error) {
            console.error('Error fetching books:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchGenres = async () => {
        try {
            const res = await fetch('/api/visitor/genres');
            if (res.ok) {
                const data = await res.json();
                setGenres(data);
            }
        } catch (error) {
            console.log('Genre API not found, will extract from books');
        }
    };

    const handleBorrowClick = (book) => {
        setBorrowModal({
            isOpen: true,
            bookId: book.id,
            bookTitle: book.title,
            duration: 7
        });
    };

    const confirmBorrow = async () => {
        setBorrowing(true);
        try {
            const { getUser, getAuthHeaders } = await import('@/lib/client-auth');
            const user = getUser();

            if (!user) {
                setStatusModal({
                    isOpen: true,
                    type: 'error',
                    message: 'Silakan login terlebih dahulu'
                });
                return;
            }

            const res = await fetch('/api/member/peminjaman', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeaders()
                },
                body: JSON.stringify({
                    user_id: user.id,
                    buku_id: borrowModal.bookId,
                    durasi_hari: borrowModal.duration
                })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'Gagal meminjam buku');
            }

            setStatusModal({
                isOpen: true,
                type: 'success',
                message: 'Berhasil request peminjaman! Silakan tunggu persetujuan admin/staf.'
            });
            setBorrowModal({ ...borrowModal, isOpen: false });
            fetchBooks(); // Refresh stock
        } catch (error) {
            setStatusModal({
                isOpen: true,
                type: 'error',
                message: error.message
            });
        } finally {
            setBorrowing(false);
        }
    };

    const filteredBooks = books.filter(book => {
        const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            book.author.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesGenre = selectedGenre === 'all' || book.genre_name === selectedGenre;
        return matchesSearch && matchesGenre;
    });

    const uniqueGenres = genres.length > 0 ? genres :
        [...new Set(books.map(b => b.genre_name).filter(Boolean))].map(g => ({ id: g, nama_genre: g }));

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-xl shadow-sm">
                <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <Book className="text-indigo-600" /> Katalog Buku
                </h1>

                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    <div className="relative flex-1 sm:flex-none">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Cari judul atau penulis..."
                            className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full sm:w-64"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="relative flex-1 sm:flex-none">
                        <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <select
                            className="pl-10 pr-8 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none bg-white w-full sm:w-48"
                            value={selectedGenre}
                            onChange={(e) => setSelectedGenre(e.target.value)}
                        >
                            <option value="all">Semua Genre</option>
                            {uniqueGenres.map((genre, idx) => (
                                <option key={genre.id || idx} value={genre.nama_genre}>
                                    {genre.nama_genre}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-gray-500">Memuat katalog buku...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredBooks.length > 0 ? (
                        filteredBooks.map((book) => (
                            <div key={book.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-gray-100 flex flex-col">
                                <div className="h-48 bg-gray-200 relative overflow-hidden">
                                    {book.cover ? (
                                        <img
                                            src={book.cover}
                                            alt={book.title}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-indigo-50 text-indigo-300">
                                            <Book size={48} />
                                        </div>
                                    )}
                                    <div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-1 rounded text-xs font-medium text-indigo-600 shadow-sm">
                                        {book.genre_name || 'Umum'}
                                    </div>
                                </div>

                                <div className="p-4 flex-1 flex flex-col">
                                    <h3 className="font-bold text-gray-800 line-clamp-2 mb-1" title={book.title}>
                                        {book.title}
                                    </h3>
                                    <p className="text-sm text-gray-500 mb-2">{book.author}</p>

                                    <div className="mt-auto pt-3 border-t border-gray-100 flex justify-between items-center">
                                        <span className={`text-xs font-medium px-2 py-1 rounded ${book.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                            }`}>
                                            Stok: {book.stock}
                                        </span>
                                        <button
                                            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${book.stock > 0
                                                ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                }`}
                                            disabled={book.stock <= 0}
                                            onClick={() => handleBorrowClick(book)}
                                        >
                                            Pinjam
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                            <Book className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                            <h3 className="text-lg font-medium text-gray-900">Tidak ada buku ditemukan</h3>
                            <p className="text-gray-500">Coba ubah kata kunci pencarian atau filter genre.</p>
                        </div>
                    )}
                </div>
            )}

            {/* Borrow Modal */}
            {borrowModal.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-fade-in-up">
                        <div className="p-6">
                            <h3 className="text-xl font-bold text-gray-800 mb-2">Konfirmasi Peminjaman</h3>
                            <p className="text-gray-600 mb-6">
                                Apakah Anda yakin ingin meminjam buku <span className="font-semibold text-indigo-600">"{borrowModal.bookTitle}"</span>?
                            </p>

                            <div className="bg-blue-50 p-4 rounded-xl mb-6">
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-gray-600">Durasi Peminjaman:</span>
                                    <span className="font-semibold text-gray-800">{borrowModal.duration} Hari</span>
                                </div>
                                <div className="text-xs text-blue-600">
                                    *Harap kembalikan tepat waktu untuk menghindari denda.
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setBorrowModal({ ...borrowModal, isOpen: false })}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium transition-colors"
                                    disabled={borrowing}
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={confirmBorrow}
                                    className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-medium transition-colors flex items-center justify-center gap-2"
                                    disabled={borrowing}
                                >
                                    {borrowing ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                            Memproses...
                                        </>
                                    ) : (
                                        'Konfirmasi Pinjam'
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
