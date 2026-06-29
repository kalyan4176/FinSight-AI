import React, { useState, useEffect } from 'react';
import { FaPlus, FaTrash, FaSearch, FaCoins, FaChartLine, FaBriefcase, FaArrowUp, FaArrowDown, FaSpinner } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { useCurrency } from '../context/CurrencyContext';
import { useToast } from '../context/ToastContext';
import api from '../utils/api';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement);

const Investments = () => {
    const { formatCurrency } = useCurrency();
    const { showToast } = useToast();
    const [investments, setInvestments] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isFetchingQuote, setIsFetchingQuote] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    
    const [formData, setFormData] = useState({
        symbol: '',
        name: '',
        quantity: '',
        buyPrice: '',
        category: 'Stock',
        date: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        fetchInvestments();
    }, []);

    const fetchInvestments = async () => {
        setIsLoading(true);
        try {
            const res = await api.get('/investments');
            setInvestments(res.data);
        } catch (err) {
            console.error(err);
            showToast('Failed to load investments', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    // Auto-fetch asset name and price when symbol changes
    const handleSymbolLookup = async () => {
        if (!formData.symbol) {
            showToast('Please enter a symbol first (e.g. AAPL, BTC-USD)', 'error');
            return;
        }

        setIsFetchingQuote(true);
        try {
            const res = await api.get(`/finance/quote/${formData.symbol.trim().toUpperCase()}`);
            if (res.data) {
                setFormData(prev => ({
                    ...prev,
                    name: res.data.name || '',
                    buyPrice: res.data.price ? res.data.price.toString() : prev.buyPrice
                }));
                showToast(`Found quote: ${res.data.name}`, 'success');
            }
        } catch (err) {
            console.error(err);
            showToast('Symbol not found. Please enter details manually.', 'warning');
        } finally {
            setIsFetchingQuote(false);
        }
    };

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        
        const { symbol, quantity, buyPrice, category, date, name } = formData;
        
        if (!symbol || !quantity || !buyPrice) {
            showToast('Please fill out all required fields', 'error');
            return;
        }

        setIsSaving(true);
        try {
            await api.post('/investments', {
                symbol: symbol.toUpperCase(),
                name: name || symbol.toUpperCase(),
                quantity: parseFloat(quantity),
                buyPrice: parseFloat(buyPrice),
                category,
                date
            });
            
            showToast('Investment added successfully', 'success');
            fetchInvestments();
            setFormData({
                symbol: '',
                name: '',
                quantity: '',
                buyPrice: '',
                category: 'Stock',
                date: new Date().toISOString().split('T')[0]
            });
        } catch (err) {
            console.error(err);
            showToast(err.response?.data?.msg || 'Failed to add investment', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const deleteInvestment = async (id) => {
        try {
            await api.delete(`/investments/${id}`);
            showToast('Investment removed successfully', 'success');
            fetchInvestments();
        } catch (err) {
            console.error(err);
            showToast('Failed to delete investment', 'error');
        }
    };

    // Calculate Portfolio Summary Metrics
    const totalInvested = investments.reduce((acc, curr) => acc + curr.costBasis, 0);
    const totalCurrentValue = investments.reduce((acc, curr) => acc + curr.currentValue, 0);
    const netProfitLoss = totalCurrentValue - totalInvested;
    const profitPercent = totalInvested > 0 ? (netProfitLoss / totalInvested) * 100 : 0;

    // Chart Data calculations
    const categoryTotals = {};
    investments.forEach(inv => {
        categoryTotals[inv.category] = (categoryTotals[inv.category] || 0) + inv.currentValue;
    });

    const chartData = {
        labels: Object.keys(categoryTotals),
        datasets: [{
            data: Object.values(categoryTotals),
            backgroundColor: ['#6366f1', '#3b82f6', '#f59e0b', '#10b981', '#a855f7', '#64748b'],
            borderWidth: 0
        }]
    };

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
            <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight font-sans">
                        Investments Portfolio
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">
                        Track long-term asset classes. Valuations are updated using Yahoo Finance.
                    </p>
                </div>
                <div className="text-xs text-slate-400 font-semibold bg-slate-100 border border-slate-200/50 rounded-xl px-4 py-2 self-start md:self-center">
                    Real-time enrichment active
                </div>
            </motion.div>

            {/* Portfolio Summary Dashboard */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="premium-card">
                    <div className="flex items-center gap-4">
                        <div className="p-4 bg-primary-50 text-primary-600 rounded-2xl border border-primary-100">
                            <FaBriefcase className="text-2xl" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Portfolio Value</p>
                            <h3 className="text-2xl font-extrabold text-slate-900 font-sans">{formatCurrency(totalCurrentValue)}</h3>
                        </div>
                    </div>
                </div>

                <div className="premium-card">
                    <div className="flex items-center gap-4">
                        <div className="p-4 bg-amber-50 text-amber-600 rounded-2xl border border-amber-100">
                            <FaCoins className="text-2xl" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Capital Invested</p>
                            <h3 className="text-2xl font-extrabold text-slate-900 font-sans">{formatCurrency(totalInvested)}</h3>
                        </div>
                    </div>
                </div>

                <div className={`premium-card border-l-4 ${netProfitLoss >= 0 ? 'border-l-emerald-500' : 'border-l-rose-500'}`}>
                    <div className="flex items-center gap-4">
                        <div className={`p-4 rounded-2xl border ${netProfitLoss >= 0 ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                            <FaChartLine className="text-2xl" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Net Profit / Loss</p>
                            <h3 className={`text-2xl font-extrabold font-sans flex items-center gap-2 ${netProfitLoss >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                {netProfitLoss >= 0 ? '+' : ''}{formatCurrency(netProfitLoss)}
                                <span className="text-xs font-semibold flex items-center gap-0.5">
                                    {netProfitLoss >= 0 ? <FaArrowUp /> : <FaArrowDown />}
                                    {profitPercent.toFixed(1)}%
                                </span>
                            </h3>
                        </div>
                    </div>
                </div>
            </motion.div>

            <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Add Investment Form */}
                <div className="premium-card lg:col-span-1 h-fit">
                    <h3 className="text-base font-bold text-slate-900 mb-5 font-sans border-b border-slate-100 pb-3">
                        Log Asset Holding
                    </h3>
                    <form onSubmit={onSubmit} className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Symbol / Ticker</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    name="symbol"
                                    value={formData.symbol}
                                    onChange={onChange}
                                    required
                                    placeholder="e.g. AAPL, BTC-USD, GC=F"
                                    className="premium-input flex-1 uppercase"
                                />
                                <button
                                    type="button"
                                    onClick={handleSymbolLookup}
                                    disabled={isFetchingQuote}
                                    className="px-3 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl transition-colors disabled:opacity-50"
                                    title="Fetch live market price"
                                >
                                    {isFetchingQuote ? <FaSpinner className="animate-spin text-sm" /> : <FaSearch className="text-sm" />}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Asset Name</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={onChange}
                                placeholder="e.g. Apple Inc. (or auto-filled)"
                                className="premium-input"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Quantity</label>
                                <input
                                    type="number"
                                    step="any"
                                    name="quantity"
                                    value={formData.quantity}
                                    onChange={onChange}
                                    required
                                    placeholder="0.00"
                                    className="premium-input"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Buy Price</label>
                                <input
                                    type="number"
                                    step="any"
                                    name="buyPrice"
                                    value={formData.buyPrice}
                                    onChange={onChange}
                                    required
                                    placeholder="0.00"
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
                                    <option value="Stock">Stock</option>
                                    <option value="Crypto">Crypto</option>
                                    <option value="Gold">Gold</option>
                                    <option value="Mutual Fund">Mutual Fund</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Purchase Date</label>
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

                        <button 
                            type="submit" 
                            className="premium-btn-primary w-full py-3 mt-2 flex items-center justify-center gap-2"
                            disabled={isSaving}
                        >
                            {isSaving ? <FaSpinner className="animate-spin" /> : <FaPlus />}
                            <span>Log Investment</span>
                        </button>
                    </form>
                </div>

                {/* Asset Allocation Card */}
                <div className="premium-card lg:col-span-2 flex flex-col justify-between">
                    <div>
                        <h3 className="text-base font-bold text-slate-900 mb-2 font-sans border-b border-slate-100 pb-3">
                            Asset Allocation
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">Asset allocation by current valuation.</p>
                    </div>
                    
                    <div className="h-64 flex items-center justify-center py-4 relative">
                        {investments.length > 0 ? (
                            <Doughnut 
                                data={chartData} 
                                options={{ 
                                    maintainAspectRatio: false, 
                                    cutout: '72%',
                                    plugins: {
                                        legend: {
                                            position: 'bottom',
                                            labels: {
                                                color: '#475569',
                                                font: { family: 'Inter', size: 11, weight: 500 }
                                            }
                                        }
                                    }
                                }} 
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center border border-dashed border-slate-200 rounded-xl">
                                <p className="text-xs text-slate-400 font-semibold">No asset data available. Log an asset holding first.</p>
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>

            {/* Assets Table */}
            <motion.div variants={itemVariants} className="premium-card">
                <h3 className="text-base font-bold text-slate-900 mb-5 font-sans border-b border-slate-100 pb-3">
                    Portfolio Holdings
                </h3>
                {isLoading ? (
                    <div className="py-12 flex justify-center">
                        <FaSpinner className="animate-spin text-primary-600 text-2xl" />
                    </div>
                ) : investments.length > 0 ? (
                    <div className="overflow-x-auto -mx-6">
                        <table className="premium-table min-w-[900px]">
                            <thead>
                                <tr>
                                    <th>Asset</th>
                                    <th>Category</th>
                                    <th>Holdings</th>
                                    <th>Buy Price</th>
                                    <th>Current Price</th>
                                    <th>Total Cost</th>
                                    <th>Current Value</th>
                                    <th>Gains / Losses</th>
                                    <th className="text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                <AnimatePresence>
                                    {investments.map(inv => {
                                        const isProfit = inv.gainLoss >= 0;
                                        return (
                                            <motion.tr
                                                key={inv.id}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                            >
                                                <td>
                                                    <div>
                                                        <span className="font-extrabold text-slate-800 tracking-tight">{inv.symbol}</span>
                                                        <div className="text-[10px] text-slate-400 font-semibold truncate max-w-[150px]">{inv.name}</div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                                                        inv.category === 'Crypto' ? 'bg-sky-50 border border-sky-100 text-sky-700' : 
                                                        inv.category === 'Gold' ? 'bg-amber-50 border border-amber-100 text-amber-700' : 
                                                        inv.category === 'Stock' ? 'bg-indigo-50 border border-indigo-100 text-indigo-700' : 
                                                        'bg-slate-50 border border-slate-100 text-slate-600'
                                                    }`}>
                                                        {inv.category}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className="font-semibold text-slate-700">
                                                        {inv.quantity.toLocaleString(undefined, { maximumFractionDigits: 5 })}
                                                    </span>
                                                </td>
                                                <td>{formatCurrency(inv.buyPrice)}</td>
                                                <td>
                                                    <div className="space-y-0.5">
                                                        <span className="font-semibold text-slate-700">{formatCurrency(inv.currentPrice)}</span>
                                                        {inv.changePercent !== 0 && (
                                                            <div className={`text-[10px] font-bold flex items-center gap-0.5 ${inv.changePercent >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                                {inv.changePercent >= 0 ? '+' : ''}{inv.changePercent.toFixed(1)}%
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td>{formatCurrency(inv.costBasis)}</td>
                                                <td><span className="font-semibold text-slate-800">{formatCurrency(inv.currentValue)}</span></td>
                                                <td>
                                                    <span className={`inline-flex items-center gap-1 font-bold text-xs ${isProfit ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                        {isProfit ? '+' : ''}{formatCurrency(inv.gainLoss)}
                                                        <span className="font-medium text-[10px]">
                                                            ({isProfit ? '+' : ''}{inv.gainLossPercent.toFixed(1)}%)
                                                        </span>
                                                    </span>
                                                </td>
                                                <td className="text-right pr-6">
                                                    <button
                                                        onClick={() => deleteInvestment(inv.id)}
                                                        className="p-2 border border-rose-100 hover:border-rose-200 hover:bg-rose-50 text-rose-600 rounded-xl transition-all active:scale-95"
                                                        title="Delete investment entry"
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
                        <p className="font-semibold text-slate-500 mb-1">No portfolio holdings found</p>
                        <p className="text-xs text-slate-400">Add gold, stock tickers, or crypto symbols to begin live monitoring.</p>
                    </div>
                )}
            </motion.div>
        </motion.div>
    );
};

export default Investments;
