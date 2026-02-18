'use client';

import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

// Toast Context
const ToastContext = createContext(null);

export function useToast() {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error('useToast must be used within ToastProvider');
    return ctx;
}

const ICONS = {
    success: <CheckCircle size={20} className="text-emerald-500" />,
    error: <XCircle size={20} className="text-red-500" />,
    warning: <AlertTriangle size={20} className="text-amber-500" />,
    info: <Info size={20} className="text-blue-500" />,
};

const COLORS = {
    success: 'border-l-emerald-500 bg-emerald-50',
    error: 'border-l-red-500 bg-red-50',
    warning: 'border-l-amber-500 bg-amber-50',
    info: 'border-l-blue-500 bg-blue-50',
};

function ToastItem({ id, type = 'info', title, message, onRemove }) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        // Animate in
        const t1 = setTimeout(() => setVisible(true), 10);
        // Auto remove after 4s
        const t2 = setTimeout(() => {
            setVisible(false);
            setTimeout(() => onRemove(id), 300);
        }, 4000);
        return () => { clearTimeout(t1); clearTimeout(t2); };
    }, [id, onRemove]);

    return (
        <div
            className={`
        flex items-start gap-3 p-4 rounded-xl shadow-lg border border-gray-100 border-l-4
        bg-white min-w-[300px] max-w-[380px]
        transition-all duration-300 ease-out
        ${COLORS[type]}
        ${visible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}
      `}
        >
            <div className="flex-shrink-0 mt-0.5">{ICONS[type]}</div>
            <div className="flex-1 min-w-0">
                {title && <p className="font-semibold text-gray-800 text-sm">{title}</p>}
                {message && <p className="text-gray-600 text-sm mt-0.5">{message}</p>}
            </div>
            <button
                onClick={() => { setVisible(false); setTimeout(() => onRemove(id), 300); }}
                className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
            >
                <X size={16} />
            </button>
        </div>
    );
}

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const toast = useCallback(({ type = 'info', title, message }) => {
        const id = Date.now() + Math.random();
        setToasts(prev => [...prev, { id, type, title, message }]);
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    // Shorthand helpers
    toast.success = (title, message) => toast({ type: 'success', title, message });
    toast.error = (title, message) => toast({ type: 'error', title, message });
    toast.warning = (title, message) => toast({ type: 'warning', title, message });
    toast.info = (title, message) => toast({ type: 'info', title, message });

    return (
        <ToastContext.Provider value={toast}>
            {children}
            {/* Toast Container */}
            <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
                {toasts.map(t => (
                    <div key={t.id} className="pointer-events-auto">
                        <ToastItem {...t} onRemove={removeToast} />
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}
