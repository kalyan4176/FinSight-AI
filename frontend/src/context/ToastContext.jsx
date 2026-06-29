import React, { createContext, useState, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaTimes } from 'react-icons/fa';

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const showToast = (message, type = 'info') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => removeToast(id), 4000);
    };

    const removeToast = (id) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-2.5 max-w-sm w-full">
                <AnimatePresence>
                    {toasts.map(toast => (
                        <motion.div
                            key={toast.id}
                            initial={{ opacity: 0, y: -20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            layout
                            className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-premium flex items-start gap-3 backdrop-blur-md"
                        >
                            <div className="mt-0.5">
                                {toast.type === 'success' && <FaCheckCircle className="text-emerald-500 text-lg" />}
                                {toast.type === 'error' && <FaExclamationCircle className="text-rose-500 text-lg" />}
                                {toast.type === 'info' && <FaInfoCircle className="text-primary-500 text-lg" />}
                            </div>

                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-slate-800 break-words leading-relaxed">{toast.message}</p>
                            </div>

                            <button
                                onClick={() => removeToast(toast.id)}
                                className="text-slate-400 hover:text-slate-600 p-2 transition-colors focus:outline-none cursor-pointer relative z-10 flex-shrink-0"
                            >
                                <FaTimes className="text-xs" />
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
};
