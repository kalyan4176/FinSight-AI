import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaUser, FaEnvelope, FaLock, FaPhone, FaUserCircle, FaArrowRight, FaSpinner } from 'react-icons/fa';
import api from '../utils/api';
import { useToast } from '../context/ToastContext';

const Signup = () => {
    const [formData, setFormData] = useState({
        name: '',
        mobile: '',
        email: '',
        username: '',
        password: '',
        confirmPassword: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { showToast } = useToast();

    const { name, mobile, email, username, password, confirmPassword } = formData;

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();

        // Validation
        if (password !== confirmPassword) {
            showToast("Passwords do not match", "error");
            return;
        }

        // Strict Password rules: min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
        const strongRegex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])");

        if (password.length < 8) {
            showToast("Password must be at least 8 characters long", "error");
            return;
        }
        if (!strongRegex.test(password)) {
            showToast("Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (!@#$%^&*)", "error");
            return;
        }

        if (username.length < 3) {
            showToast("Username must be at least 3 characters long", "error");
            return;
        }

        setIsLoading(true);
        try {
            await api.post('/auth/signup', { name, mobile, email, username, password });
            showToast("Registration Successful! Please login.", "success");
            navigate('/login');
        } catch (err) {
            console.error(err.response?.data);
            showToast(err.response?.data?.msg || 'Signup Failed', "error");
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
                className="w-full max-w-lg z-10 my-8"
            >
                <div className="bg-white border border-slate-200/80 rounded-3xl p-8 md:p-10 shadow-premium">
                    <motion.div variants={itemVariants} className="text-center mb-8">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary-50 text-primary-700 border border-primary-100/50 mb-3">
                            FinSight AI Platform
                        </span>
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight font-sans">
                            Create Account
                        </h1>
                        <p className="text-sm text-slate-500 mt-2">
                            Join us and start optimizing your financial health today
                        </p>
                    </motion.div>

                    <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <motion.div variants={itemVariants} className="space-y-1.5 md:col-span-2">
                            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Full Name</label>
                            <div className="relative">
                                <FaUserCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-base" />
                                <input
                                    type="text"
                                    name="name"
                                    value={name}
                                    onChange={onChange}
                                    required
                                    placeholder="John Doe"
                                    className="premium-input"
                                    style={{ paddingLeft: '2.75rem' }}
                                />
                            </div>
                        </motion.div>

                        <motion.div variants={itemVariants} className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Mobile Number</label>
                            <div className="relative">
                                <FaPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                                <input
                                    type="text"
                                    name="mobile"
                                    value={mobile}
                                    onChange={onChange}
                                    required
                                    placeholder="+91 99999 99999"
                                    className="premium-input"
                                    style={{ paddingLeft: '2.75rem' }}
                                />
                            </div>
                        </motion.div>

                        <motion.div variants={itemVariants} className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Email Address</label>
                            <div className="relative">
                                <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                                <input
                                    type="email"
                                    name="email"
                                    value={email}
                                    onChange={onChange}
                                    required
                                    placeholder="john@example.com"
                                    className="premium-input"
                                    style={{ paddingLeft: '2.75rem' }}
                                />
                            </div>
                        </motion.div>

                        <motion.div variants={itemVariants} className="space-y-1.5 md:col-span-2">
                            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Username</label>
                            <div className="relative">
                                <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                                <input
                                    type="text"
                                    name="username"
                                    value={username}
                                    onChange={onChange}
                                    required
                                    placeholder="johndoe12"
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
                                    type="password"
                                    name="password"
                                    value={password}
                                    onChange={onChange}
                                    required
                                    placeholder="Create password"
                                    className="premium-input text-xs"
                                    style={{ paddingLeft: '2.75rem' }}
                                />
                            </div>
                        </motion.div>

                        <motion.div variants={itemVariants} className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Confirm Password</label>
                            <div className="relative">
                                <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={confirmPassword}
                                    onChange={onChange}
                                    required
                                    placeholder="Confirm password"
                                    className="premium-input text-xs"
                                    style={{ paddingLeft: '2.75rem' }}
                                />
                            </div>
                        </motion.div>

                        <motion.div variants={itemVariants} className="md:col-span-2 text-[10px] text-slate-400 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100 mt-2">
                            <p className="font-semibold text-slate-500 uppercase tracking-wider mb-1">Strict Password Policy:</p>
                            At least 8 characters long, including one uppercase letter, one lowercase letter, one number, and one special character (e.g. !@#$%^&*).
                        </motion.div>

                        <motion.button
                            variants={itemVariants}
                            type="submit"
                            className="premium-btn-primary md:col-span-2 py-3 mt-4 text-sm font-semibold flex items-center justify-center gap-2"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <FaSpinner className="animate-spin text-lg" />
                            ) : (
                                <>
                                    <span>Create Account</span>
                                    <FaArrowRight className="text-xs mt-0.5" />
                                </>
                            )}
                        </motion.button>
                    </form>

                    <motion.div variants={itemVariants} className="mt-8 pt-6 border-t border-slate-100 text-center">
                        <p className="text-sm text-slate-500">
                            Already have an account?{' '}
                            <Link
                                to="/login"
                                className="text-primary-600 font-semibold hover:text-primary-700 transition-colors"
                            >
                                Sign In
                            </Link>
                        </p>
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
};

export default Signup;
