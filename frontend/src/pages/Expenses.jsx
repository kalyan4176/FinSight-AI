import React, { useState, useEffect } from 'react';
import { FaPlus, FaTrash, FaReceipt, FaUtensils, FaCar, FaBolt, FaGamepad, FaHeartbeat, FaShoppingBag, FaEllipsisH, FaSpinner, FaChartLine, FaRegCalendarAlt, FaShieldAlt } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import BillScanner from '../components/BillScanner';
import { useCurrency } from '../context/CurrencyContext';
import { useToast } from '../context/ToastContext';
import api from '../utils/api';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const Expenses = () => {
    const { formatCurrency, symbol } = useCurrency();
    const { showToast } = useToast();
    const [expenses, setExpenses] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        amount: '',
        category: 'Food',
        date: new Date().toISOString().split('T')[0],
        paymentMethod: 'Cash',
        isDiscretionary: true
    });
    const [showScanner, setShowScanner] = useState(false);

    useEffect(() => {
        fetchExpenses();
    }, []);

    const fetchExpenses = async () => {
        setIsLoading(true);
        try {
            const res = await api.get('/expenses');
            setExpenses(res.data);
        } catch (err) {
            console.error(err);
            showToast('Failed to load expenses', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const onChange = e => {
        const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setFormData({ ...formData, [e.target.name]: val });
    };

    const onSubmit = async e => {
        e.preventDefault();
        
        if (!formData.title || !formData.amount) {
            showToast('Please fill out all required fields', 'error');
            return;
        }

        setIsSaving(true);
        try {
            await api.post('/expenses', {
                ...formData,
                amount: parseFloat(formData.amount)
            });
            showToast('Expense added successfully', 'success');
            fetchExpenses();
            setFormData({
                title: '',
                amount: '',
                category: 'Food',
                date: new Date().toISOString().split('T')[0],
                paymentMethod: 'Cash',
                isDiscretionary: true
            });
            setShowScanner(false);
        } catch (err) {
            console.error(err);
            showToast('Failed to add expense', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const deleteExpense = async (id) => {
        try {
            await api.delete(`/expenses/${id}`);
            showToast('Expense removed successfully', 'success');
            fetchExpenses();
        } catch (err) {
            console.error(err);
            showToast('Failed to delete expense', 'error');
        }
    };

    const handleScanComplete = (data) => {
        setFormData(prev => ({
            ...prev,
            amount: data.amount ? data.amount.toString() : '',
            date: data.date ? data.date : new Date().toISOString().split('T')[0],
            title: data.title || 'Scanned Receipt',
            category: data.category || 'Shopping'
        }));
        setShowScanner(false);
        showToast('Receipt details pre-filled!', 'success');
    };

    // Category helper for styling and icons
    const getCategoryDetails = (category) => {
        switch (category) {
            case 'Food':
                return { icon: <FaUtensils />, colorClass: 'text-indigo-600 bg-indigo-50 border-indigo-100' };
            case 'Transport':
            case 'Travel':
                return { icon: <FaCar />, colorClass: 'text-sky-600 bg-sky-50 border-sky-100' };
            case 'Utilities':
                return { icon: <FaBolt />, colorClass: 'text-amber-600 bg-amber-50 border-amber-100' };
            case 'Entertainment':
                return { icon: <FaGamepad />, colorClass: 'text-violet-600 bg-violet-50 border-violet-100' };
            case 'Health':
                return { icon: <FaHeartbeat />, colorClass: 'text-rose-600 bg-rose-50 border-rose-100' };
            case 'Shopping':
                return { icon: <FaShoppingBag />, colorClass: 'text-pink-600 bg-pink-50 border-pink-100' };
            default:
                return { icon: <FaEllipsisH />, colorClass: 'text-slate-500 bg-slate-50 border-slate-100' };
        }
    };

    // Prepare chronological trend data (ascending)
    const sortedExpenses = [...expenses]
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .map(e => ({
            date: new Date(e.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
            amount: e.amount
        }));

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.05 }
        }
    };

    const itemVariants = {
        hidden: { y: 15, opacity: 0 },
        visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } }
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-8 pb-24 md:pb-8 bg-transparent"
        >
            {/* Header section */}
            <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight font-sans">
                        Expenses Tracker
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">
                        Log transactions, scan invoices, and review historical spending trends.
                    </p>
                </div>
                
                <button
                    onClick={() => setShowScanner(!showScanner)}
                    className="premium-btn-secondary md:self-end flex items-center gap-2 border-primary-100 hover:border-primary-300"
                >
                    <FaReceipt className="text-primary-600" />
                    <span>{showScanner ? 'Close Scanner' : 'AI Receipt Scanner'}</span>
                </button>
            </motion.div>

            {/* AI Bill Scanner Dropdown */}
            <AnimatePresence>
                {showScanner && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <BillScanner onScanComplete={handleScanComplete} />
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Form Card */}
                <div className="premium-card lg:col-span-1 h-fit">
                    <h3 className="text-base font-bold text-slate-900 mb-5 font-sans border-b border-slate-100 pb-3">
                        Log Transaction
                    </h3>
                    <form onSubmit={onSubmit} className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Title/Merchant</label>
                            <input 
                                type="text" 
                                name="title" 
                                value={formData.title} 
                                onChange={onChange} 
                                required 
                                placeholder="e.g. Walmart, Netflix..."
                                className="premium-input"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Amount</label>
                                <input 
                                    type="number" 
                                    step="any"
                                    name="amount" 
                                    value={formData.amount} 
                                    onChange={onChange} 
                                    required 
                                    placeholder="0.00"
                                    className="premium-input"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Date</label>
                                <input 
                                    type="date" 
                                    name="date" 
                                    value={formData.date} 
                                    onChange={onChange} 
                                    required 
                                    className="premium-input"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Category</label>
                                <select 
                                    name="category" 
                                    value={formData.category} 
                                    onChange={onChange}
                                    className="premium-input bg-white appearance-none"
                                >
                                    <option value="Food">Food</option>
                                    <option value="Travel">Travel</option>
                                    <option value="Utilities">Utilities</option>
                                    <option value="Entertainment">Entertainment</option>
                                    <option value="Health">Health</option>
                                    <option value="Shopping">Shopping</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Method</label>
                                <select 
                                    name="paymentMethod" 
                                    value={formData.paymentMethod} 
                                    onChange={onChange}
                                    className="premium-input bg-white"
                                >
                                    <option value="Cash">Cash</option>
                                    <option value="Card">Card</option>
                                    <option value="UPI">UPI</option>
                                    <option value="Net Banking">Net Banking</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200/60 p-3.5 rounded-xl mt-2 select-none">
                            <input 
                                type="checkbox"
                                id="isDiscretionary"
                                name="isDiscretionary"
                                checked={formData.isDiscretionary}
                                onChange={onChange}
                                className="w-4 h-4 text-primary-600 focus:ring-primary-500 border-slate-300 rounded"
                            />
                            <label htmlFor="isDiscretionary" className="flex flex-col cursor-pointer">
                                <span className="text-xs font-semibold text-slate-700">Discretionary Spending</span>
                                <span className="text-[10px] text-slate-400 leading-none mt-0.5">Non-essential (e.g. leisure, dining out)</span>
                            </label>
                        </div>

                        <button 
                            type="submit" 
                            className="premium-btn-primary w-full py-3 mt-2 flex items-center justify-center gap-2"
                            disabled={isSaving}
                        >
                            {isSaving ? <FaSpinner className="animate-spin" /> : <FaPlus />}
                            <span>Log Transaction</span>
                        </button>
                    </form>
                </div>

                {/* Trend Chart Card */}
                <div className="premium-card lg:col-span-2 flex flex-col justify-between">
                    <div className="border-b border-slate-100 pb-3 mb-4">
                        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 font-sans">
                            <FaChartLine className="text-primary-500" />
                            Spending Trend
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">Analysis of expenses mapped chronologically.</p>
                    </div>

                    <div className="h-64 w-full pt-4">
                        {sortedExpenses.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={sortedExpenses} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.15}/>
                                            <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                    <XAxis dataKey="date" stroke="#94a3b8" fontSize={9} />
                                    <YAxis stroke="#94a3b8" fontSize={9} tickFormatter={(val) => `${symbol}${val}`} />
                                    <Tooltip 
                                        contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 4px 20px rgba(15, 23, 42, 0.05)' }}
                                        labelStyle={{ fontWeight: 'bold', fontSize: '11px', color: '#1e293b' }}
                                        itemStyle={{ fontSize: '12px', color: '#4f46e5' }}
                                        formatter={(value) => [formatCurrency(value), 'Spent']}
                                    />
                                    <Area type="monotone" dataKey="amount" stroke="#4f46e5" strokeWidth={2} fillOpacity={1} fill="url(#spendGrad)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center border border-dashed border-slate-200 rounded-xl">
                                <p className="text-xs text-slate-400 font-semibold">No transactions available to map trends.</p>
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>

            {/* List Card */}
            <motion.div variants={itemVariants} className="premium-card">
                <h3 className="text-base font-bold text-slate-900 mb-5 font-sans border-b border-slate-100 pb-3">
                    Recent Transactions
                </h3>
                
                {isLoading ? (
                    <div className="py-12 flex justify-center">
                        <FaSpinner className="animate-spin text-primary-600 text-2xl" />
                    </div>
                ) : expenses.length > 0 ? (
                    <div className="overflow-x-auto -mx-6">
                        <table className="premium-table min-w-[700px]">
                            <thead>
                                <tr>
                                    <th>Description</th>
                                    <th>Category</th>
                                    <th>Date</th>
                                    <th>Method</th>
                                    <th>Type</th>
                                    <th>Amount</th>
                                    <th className="text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                <AnimatePresence>
                                    {expenses.map(expense => {
                                        const cat = getCategoryDetails(expense.category);
                                        return (
                                            <motion.tr
                                                key={expense.id}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                            >
                                                <td>
                                                    <div className="flex items-center gap-3">
                                                        <div className={`p-2.5 rounded-xl border flex-shrink-0 ${cat.colorClass}`}>
                                                            {cat.icon}
                                                        </div>
                                                        <span className="font-semibold text-slate-800">{expense.title}</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-50 border border-slate-200/80 text-slate-600">
                                                        {expense.category}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                                        <FaRegCalendarAlt className="text-slate-400" />
                                                        <span>
                                                            {new Date(expense.date).toLocaleDateString(undefined, { 
                                                                year: 'numeric', 
                                                                month: 'short', 
                                                                day: 'numeric' 
                                                            })}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className="text-xs text-slate-500 font-semibold">{expense.paymentMethod || 'Cash'}</span>
                                                </td>
                                                <td>
                                                    {expense.isDiscretionary ? (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 border border-amber-100 text-amber-700">
                                                            Discretionary
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 border border-emerald-100 text-emerald-700">
                                                            Essential
                                                        </span>
                                                    )}
                                                </td>
                                                <td>
                                                    <span className="font-extrabold text-slate-800">
                                                        {formatCurrency(expense.amount)}
                                                    </span>
                                                </td>
                                                <td className="text-right pr-6">
                                                    <button
                                                        onClick={() => deleteExpense(expense.id)}
                                                        className="p-2 border border-rose-100 hover:border-rose-200 hover:bg-rose-50 text-rose-600 rounded-xl transition-all active:scale-95"
                                                        title="Delete expense entry"
                                                    >
                                                        <FaTrash size={11} />
                                                    </button>
                                                </td>
                                            </motion.tr>
                                        );
                                    })}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="py-12 text-center text-slate-400">
                        <p className="font-semibold text-slate-500 mb-1">No transaction logs found</p>
                        <p className="text-xs text-slate-400">Add transaction details manually or scan an invoice to start tracking.</p>
                    </div>
                )}
            </motion.div>
        </motion.div>
    );
};

export default Expenses;
