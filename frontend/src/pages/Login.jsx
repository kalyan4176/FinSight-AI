import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaUser, FaLock, FaArrowRight, FaSpinner, FaEye, FaEyeSlash } from 'react-icons/fa';
import api from '../utils/api';
import { useToast } from '../context/ToastContext';

const Login = () => {
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const { showToast } = useToast();

    const { username, password } = formData;

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const res = await api.post('/auth/login', formData);
            localStorage.setItem('token', res.data.token);
            showToast("Welcome back to FinSight AI!", "success");
            navigate('/');
        } catch (err) {
            console.error(err.response?.data);
            showToast(err.response?.data?.msg || 'Invalid username or password', "error");
        } finally {
            setIsLoading(false);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0, y: 15 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.4,
                staggerChildren: 0.08
            }
        }
    };

    const itemVariants = {
        hidden: { y: 10, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { type: 'spring', stiffness: 120 }
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden bg-slate-50">
            {/* Soft decorative blur circles */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse pointer-events-none" />

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="w-full max-w-md z-10"
            >
                <div className="bg-white border border-slate-200/80 rounded-3xl p-8 md:p-10 shadow-premium">
                    <motion.div variants={itemVariants} className="text-center mb-8">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary-50 text-primary-700 border border-primary-100/50 mb-3">
                            FinSight AI Platform
                        </span>
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight font-sans">
                            Welcome Back
                        </h1>
                        <p className="text-sm text-slate-500 mt-2">
                            Securely sign in to access your financial intelligence
                        </p>
                    </motion.div>

                    <form onSubmit={onSubmit} className="space-y-5">
                        <motion.div variants={itemVariants} className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Username</label>
                            <div className="relative">
                                <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                                <input
                                    type="text"
                                    name="username"
                                    value={username}
                                    onChange={onChange}
                                    required
                                    placeholder="Enter your username"
                                    className="premium-input"
                                    style={{ paddingLeft: '2.75rem' }}
                                />
                            </div>
                        </motion.div>

                        <motion.div variants={itemVariants} className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Password</label>
                            <div className="relative">
                                <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={password}
                                    onChange={onChange}
                                    required
                                    placeholder="••••••••"
                                    className="premium-input"
                                    style={{ paddingLeft: '2.75rem', paddingRight: '2.75rem' }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors flex items-center justify-center p-1 focus:outline-none"
                                >
                                    {showPassword ? <FaEyeSlash className="text-sm" /> : <FaEye className="text-sm" />}
                                </button>
                            </div>
                        </motion.div>

                        <motion.button
                            variants={itemVariants}
                            type="submit"
                            className="premium-btn-primary w-full py-3 mt-4 text-sm font-semibold flex items-center justify-center gap-2"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <FaSpinner className="animate-spin text-lg" />
                            ) : (
                                <>
                                    <span>Sign In</span>
                                    <FaArrowRight className="text-xs mt-0.5" />
                                </>
                            )}
                        </motion.button>
                    </form>

                    <motion.div variants={itemVariants} className="mt-8 pt-6 border-t border-slate-100 text-center">
                        <p className="text-sm text-slate-500">
                            Don't have an account?{' '}
                            <Link
                                to="/signup"
                                className="text-primary-600 font-semibold hover:text-primary-700 transition-colors"
                            >
                                Create an account
                            </Link>
                        </p>
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
