import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaChartPie, FaWallet, FaCog, FaSignOutAlt, FaCoins, FaChartBar } from 'react-icons/fa';
import { motion } from 'framer-motion';

const Navbar = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    const isActive = (path) => location.pathname === path;

    const navLinks = [
        { path: '/', icon: <FaChartPie className="text-lg" />, label: 'Dashboard' },
        { path: '/expenses', icon: <FaWallet className="text-lg" />, label: 'Expenses' },
        { path: '/investments', icon: <FaCoins className="text-lg" />, label: 'Investments' },
        { path: '/bi-analytics', icon: <FaChartBar className="text-lg" />, label: 'BI Analytics' },
        { path: '/settings', icon: <FaCog className="text-lg" />, label: 'Settings' },
    ];

    return (
        <>
            {/* Desktop Navbar */}
            <nav className="hidden md:block sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/60 shadow-sm">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2">
                        <img src="/logo.jpg" alt="FinSight AI Logo" className="w-8 h-8 rounded-lg object-contain" />
                        <span className="text-xl font-bold font-sans tracking-tight text-slate-900 flex items-center gap-1.5">
                            FinSight<span className="px-1.5 py-0.5 text-[10px] font-semibold bg-primary-600 text-white rounded-md tracking-wider uppercase">AI</span>
                        </span>
                    </Link>

                    <div className="flex items-center gap-8">
                        <div className="flex items-center gap-6">
                            {navLinks.map(link => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    className={`relative py-5 px-1 flex items-center gap-2 text-sm font-medium transition-colors ${
                                        isActive(link.path) 
                                            ? 'text-primary-600 font-semibold' 
                                            : 'text-slate-500 hover:text-slate-900'
                                    }`}
                                >
                                    {link.icon}
                                    <span>{link.label}</span>
                                    {isActive(link.path) && (
                                        <motion.div
                                            layoutId="desktop-nav-indicator"
                                            className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 rounded-full"
                                        />
                                    )}
                                </Link>
                            ))}
                        </div>
                        
                        <button 
                            onClick={handleLogout} 
                            className="px-4 py-2 border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95"
                        >
                            <FaSignOutAlt className="text-sm" />
                            <span>Logout</span>
                        </button>
                    </div>
                </div>
            </nav>

            {/* Mobile Top Header */}
            <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-white/90 backdrop-blur-md border-b border-slate-200/60 flex items-center justify-between px-6 z-50 shadow-sm">
                <Link to="/" className="flex items-center gap-1.5">
                    <img src="/logo.jpg" alt="FinSight AI Logo" className="w-6 h-6 rounded-md object-contain" />
                    <span className="text-base font-bold font-sans tracking-tight text-slate-900 flex items-center gap-1">
                        FinSight<span className="px-1.5 py-0.5 text-[8px] font-semibold bg-primary-600 text-white rounded-md tracking-wider uppercase">AI</span>
                    </span>
                </Link>
                
                <button 
                    onClick={handleLogout} 
                    className="p-2 border border-rose-100 text-rose-500 hover:bg-rose-50 rounded-xl transition-all active:scale-95 flex items-center justify-center"
                >
                    <FaSignOutAlt className="text-sm" />
                </button>
            </div>

            {/* Mobile Bottom Navigation */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-t border-slate-200/60 px-2 py-1 shadow-lg flex justify-between items-center pb-safe">
                {navLinks.map(link => (
                    <Link
                        key={link.path}
                        to={link.path}
                        className={`flex-1 flex flex-col items-center gap-0.5 py-1 text-[9px] font-medium transition-all ${
                            isActive(link.path) 
                                ? 'text-primary-600 font-semibold' 
                                : 'text-slate-400 hover:text-slate-700'
                        }`}
                    >
                        <div className={`p-1.5 px-3 rounded-xl transition-all ${
                            isActive(link.path) 
                                ? 'bg-primary-50 text-primary-600 shadow-sm border border-primary-100/30' 
                                : 'bg-transparent text-slate-400'
                        }`}>
                            {link.icon}
                        </div>
                        <span className="scale-90 font-sans tracking-tight leading-none mt-0.5">{link.label}</span>
                    </Link>
                ))}
            </nav>
        </>
    );
};

export default Navbar;
