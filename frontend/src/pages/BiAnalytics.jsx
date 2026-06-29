import React, { useEffect, useState } from 'react';
import { FaChartBar, FaExpand, FaExternalLinkAlt, FaInfoCircle, FaCog, FaSpinner } from 'react-icons/fa';
import { motion } from 'framer-motion';
import api from '../utils/api';
import { useCurrency } from '../context/CurrencyContext';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell, LineChart, Line, CartesianGrid } from 'recharts';

const BiAnalytics = () => {
    const { formatCurrency, symbol } = useCurrency();
    const [powerBiUrl, setPowerBiUrl] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState({
        totalSpend: 0,
        salary: 0,
        savingsRate: 0,
        categoryBreakdown: {}
    });

    useEffect(() => {
        const fetchBiDetails = async () => {
            setIsLoading(true);
            try {
                const userRes = await api.get('/user/profile');
                if (userRes.data.powerBiUrl) {
                    setPowerBiUrl(userRes.data.powerBiUrl);
                }

                // Fetch insights database totals
                const insightsRes = await api.get('/insights');
                if (insightsRes.data.statistics) {
                    setStats(insightsRes.data.statistics);
                }
            } catch (err) {
                console.error("Failed to load BI details", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchBiDetails();
    }, []);

    // Prep category data for Recharts Pie
    const pieData = Object.keys(stats.categoryBreakdown).map((cat) => ({
        name: cat,
        value: stats.categoryBreakdown[cat]
    }));

    const COLORS = ['#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#64748b'];

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

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center gap-3">
                    <FaSpinner className="animate-spin text-primary-600 text-3xl" />
                    <p className="text-sm font-semibold text-slate-500 animate-pulse">Initializing BI reports...</p>
                </div>
            </div>
        );
    }

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
                        Business Intelligence Dashboards
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">
                        Interact with deep business intelligence queries and integrated Power BI sheets.
                    </p>
                </div>
            </motion.div>

            {/* Embedded Live Power BI Check */}
            {powerBiUrl ? (
                <motion.div variants={itemVariants} className="premium-card p-4 space-y-3">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                            <h3 className="text-sm font-bold text-slate-800 font-sans">Live Power BI Embedded Dashboard</h3>
                        </div>
                        <a 
                            href={powerBiUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="p-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl transition-all flex items-center gap-1.5 text-xs font-semibold"
                        >
                            <span>Open Direct</span>
                            <FaExternalLinkAlt className="text-[10px]" />
                        </a>
                    </div>
                    <div className="w-full h-[600px] border border-slate-200/80 rounded-xl overflow-hidden shadow-sm bg-white">
                        <iframe 
                            title="Power BI Embedded Dashboard" 
                            src={powerBiUrl}
                            className="w-full h-full border-none"
                            allowFullScreen={true}
                        />
                    </div>
                </motion.div>
            ) : (
                <>
                    {/* Informative Alert for embedding */}
                    <motion.div 
                        variants={itemVariants} 
                        className="p-4 bg-slate-100 border border-slate-200 text-slate-700 rounded-2xl flex items-start gap-3"
                    >
                        <FaInfoCircle className="text-primary-600 text-base mt-0.5 flex-shrink-0" />
                        <div className="text-xs leading-relaxed text-slate-600">
                            <span className="font-bold text-slate-800">Did you know?</span> You can display your actual interactive corporate Microsoft Power BI reports inside this view. Go to 
                            <a href="/settings" className="mx-1 font-semibold text-primary-600 hover:underline inline-flex items-center gap-0.5">
                                <FaCog className="text-[10px]" /> Settings
                            </a> 
                            and paste your public power BI share embed link. In the meantime, you can explore the native intelligence queries below.
                        </div>
                    </motion.div>

                    {/* native mockup BI visualizations */}
                    <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Summary metrics */}
                        <div className="premium-card flex flex-col justify-between">
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Capital Allocations</h4>
                            <div className="space-y-4">
                                <div className="p-4 bg-slate-50 border border-slate-200/60 rounded-xl">
                                    <p className="text-[10px] font-bold text-slate-500 uppercase">Monthly Income Pool</p>
                                    <h3 className="text-xl font-extrabold text-slate-900 font-sans mt-1">{formatCurrency(stats.income)}</h3>
                                </div>
                                <div className="p-4 bg-slate-50 border border-slate-200/60 rounded-xl">
                                    <p className="text-[10px] font-bold text-slate-500 uppercase">Expenditure Outflow</p>
                                    <h3 className="text-xl font-extrabold text-slate-900 font-sans mt-1">{formatCurrency(stats.totalSpend)}</h3>
                                </div>
                                <div className="p-4 bg-slate-50 border border-slate-200/60 rounded-xl">
                                    <p className="text-[10px] font-bold text-slate-500 uppercase">Savings Consistency Rate</p>
                                    <h3 className="text-xl font-extrabold text-primary-600 font-sans mt-1">{stats.savingsRate}%</h3>
                                </div>
                            </div>
                        </div>

                        {/* Pie Chart category distribution */}
                        <div className="premium-card flex flex-col justify-between md:col-span-2">
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Resource Allocation Breakdown</h4>
                            <div className="h-64 flex items-center justify-center relative">
                                {pieData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={pieData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={80}
                                                paddingAngle={4}
                                                dataKey="value"
                                            >
                                                {pieData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip formatter={(value) => formatCurrency(value)} />
                                            <Legend formatter={(value) => <span className="text-slate-600 font-semibold text-xs">{value}</span>} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center border border-dashed border-slate-200 rounded-xl">
                                        <p className="text-xs text-slate-400 font-semibold">No data. Add expenses to populate allocation distribution.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>

                    {/* Bar Chart comparing monthly volumes */}
                    <motion.div variants={itemVariants} className="premium-card">
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Native BI Query - Spend Volume Analysis</h4>
                        <div className="h-72 w-full pt-4">
                            {pieData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={pieData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                        <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} />
                                        <YAxis stroke="#94a3b8" fontSize={10} tickFormatter={(val) => `${symbol}${val}`} />
                                        <Tooltip 
                                            contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px' }}
                                            formatter={(value) => [formatCurrency(value), 'Spend Outflow']}
                                        />
                                        <Bar dataKey="value" fill="#6366f1" radius={[8, 8, 0, 0]}>
                                            {pieData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center border border-dashed border-slate-200 rounded-xl">
                                    <p className="text-xs text-slate-400 font-semibold">No data. Log transactions to visualize spend density.</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </motion.div>
    );
};

export default BiAnalytics;
