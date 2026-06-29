import React, { useState, useEffect } from 'react';
import { FaUser, FaPhone, FaMoneyBillWave, FaCoins, FaSave, FaChartBar, FaSpinner } from 'react-icons/fa';
import { useCurrency } from '../context/CurrencyContext';
import { useToast } from '../context/ToastContext';
import { motion } from 'framer-motion';
import api from '../utils/api';

const Settings = () => {
    const { currencies, updateCurrencyState } = useCurrency();
    const { showToast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        mobile: '',
        salary: '',
        currency: 'INR',
        powerBiUrl: ''
    });

    useEffect(() => {
        const fetchProfile = async () => {
            setIsLoading(true);
            try {
                const res = await api.get('/user/profile');
                setFormData({
                    name: res.data.name || '',
                    mobile: res.data.mobile || '',
                    salary: res.data.salary ? res.data.salary.toString() : '0',
                    currency: res.data.currency || 'INR',
                    powerBiUrl: res.data.powerBiUrl || ''
                });
            } catch (err) {
                console.error(err);
                showToast('Failed to load profile details', 'error');
            } finally {
                setIsLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await api.put('/user/profile', {
                ...formData,
                salary: parseFloat(formData.salary)
            });
            updateCurrencyState(formData.currency);
            showToast('Settings saved successfully', 'success');
        } catch (err) {
            console.error(err);
            showToast(err.response?.data?.msg || 'Error updating settings', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { duration: 0.3 }
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
                    <FaSpinner className="animate-spin text-primary-600 text-2xl" />
                    <p className="text-sm font-semibold text-slate-500">Loading settings...</p>
                </div>
            </div>
        );
    }

    return (
        <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-3xl mx-auto px-4 md:px-8 py-8 space-y-8 pb-24 md:pb-8 bg-transparent"
        >
            <motion.div variants={itemVariants}>
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight font-sans">
                    Settings
                </h1>
                <p className="text-slate-500 text-sm mt-1">
                    Manage your financial budget boundaries and custom business intelligence embeddings.
                </p>
            </motion.div>
            
            <motion.div 
                className="premium-card p-6 md:p-8"
                variants={itemVariants}
            >
                <h3 className="text-base font-bold text-slate-900 mb-6 font-sans border-b border-slate-100 pb-3">
                    Profile & Budget Boundaries
                </h3>
                
                <form onSubmit={onSubmit} className="space-y-5">
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Full Name</label>
                        <div className="relative">
                            <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                            <input 
                                type="text" 
                                name="name" 
                                value={formData.name} 
                                onChange={onChange} 
                                required
                                placeholder="Enter full name"
                                className="premium-input"
                                style={{ paddingLeft: '2.75rem' }}
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Mobile Number</label>
                        <div className="relative">
                            <FaPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                            <input 
                                type="text" 
                                name="mobile" 
                                value={formData.mobile} 
                                onChange={onChange} 
                                required
                                placeholder="Enter mobile number"
                                className="premium-input"
                                style={{ paddingLeft: '2.75rem' }}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Monthly Income / Salary</label>
                            <div className="relative">
                                <FaMoneyBillWave className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                                <input 
                                    type="number" 
                                    name="salary" 
                                    value={formData.salary} 
                                    onChange={onChange} 
                                    required
                                    placeholder="5000"
                                    className="premium-input"
                                    style={{ paddingLeft: '2.75rem' }}
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Base Currency</label>
                            <div className="relative">
                                <FaCoins className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                                <select 
                                    name="currency" 
                                    value={formData.currency} 
                                    onChange={onChange}
                                    className="premium-input bg-white appearance-none"
                                    style={{ paddingLeft: '2.75rem' }}
                                >
                                    {Object.keys(currencies).map(code => (
                                        <option key={code} value={code}>
                                            {code} ({currencies[code].symbol})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-1.5 pt-2">
                        <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                            <FaChartBar className="text-primary-500" />
                            Power BI Share Embed URL
                        </label>
                        <input 
                            type="url" 
                            name="powerBiUrl" 
                            value={formData.powerBiUrl} 
                            onChange={onChange}
                            placeholder="https://app.powerbi.com/view?r=..."
                            className="premium-input text-xs font-mono"
                        />
                        <p className="text-[10px] text-slate-400 leading-normal">
                            To get your embed link: Open your report in Power BI Service, go to <span className="font-semibold text-slate-500">File &rarr; Embed report &rarr; Publish to web (public)</span>, and copy the link.
                        </p>
                    </div>

                    <button 
                        type="submit" 
                        className="premium-btn-primary w-full py-3 mt-6 flex items-center justify-center gap-2"
                        disabled={isSaving}
                    >
                        {isSaving ? (
                            <FaSpinner className="animate-spin" />
                        ) : (
                            <>
                                <FaSave />
                                <span>Save System Preferences</span>
                            </>
                        )}
                    </button>
                </form>
            </motion.div>
        </motion.div>
    );
};

export default Settings;
