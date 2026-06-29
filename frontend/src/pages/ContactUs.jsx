import React, { useState } from 'react';
import { FaUser, FaEnvelope, FaCommentAlt, FaPaperPlane, FaSpinner } from 'react-icons/fa';
import { useToast } from '../context/ToastContext';
import { motion } from 'framer-motion';

const ContactUs = () => {
    const { showToast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: ''
    });

    const { name, email, message } = formData;

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = (e) => {
        e.preventDefault();
        
        if (!name || !email || !message) {
            showToast('Please fill in all fields', 'error');
            return;
        }

        setIsLoading(true);

        // Simulate sending contact message
        setTimeout(() => {
            showToast('Feedback submitted successfully! Thank you.', 'success');
            setFormData({ name: '', email: '', message: '' });
            setIsLoading(false);
        }, 1200);
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

    return (
        <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-xl mx-auto px-4 md:px-8 py-8 space-y-8 pb-24 md:pb-8 bg-transparent"
        >
            <motion.div variants={itemVariants}>
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight font-sans">
                    Contact Us
                </h1>
                <p className="text-slate-500 text-sm mt-1">
                    Have questions, suggestions, or feedback? Send us a message!
                </p>
            </motion.div>
            
            <motion.div 
                className="premium-card p-6 md:p-8"
                variants={itemVariants}
            >
                <h3 className="text-base font-bold text-slate-900 mb-2 font-sans">
                    Get in Touch
                </h3>
                <p className="text-xs text-slate-400 mb-6 leading-relaxed">
                    We'd love to hear how we can improve FinSight AI. Fill out the details below.
                </p>
                
                <form onSubmit={onSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Your Name</label>
                        <div className="relative">
                            <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
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
                    </div>

                    <div className="space-y-1.5">
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
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Message</label>
                        <div className="relative">
                            <FaCommentAlt className="absolute left-4 top-4 text-slate-400 text-sm" />
                            <textarea 
                                name="message"
                                value={message}
                                onChange={onChange}
                                required
                                rows={4}
                                className="premium-input resize-y" 
                                style={{ paddingLeft: '2.75rem' }}
                                placeholder="Enter your message or feedback..."
                            />
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        className="premium-btn-primary w-full py-3 mt-4 flex items-center justify-center gap-2"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <FaSpinner className="animate-spin" />
                        ) : (
                            <>
                                <FaPaperPlane />
                                <span>Send Message</span>
                            </>
                        )}
                    </button>
                </form>
            </motion.div>
        </motion.div>
    );
};

export default ContactUs;
