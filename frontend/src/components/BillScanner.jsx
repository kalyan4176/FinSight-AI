import React, { useState } from 'react';
import { FaCamera, FaSpinner, FaUpload, FaTimes } from 'react-icons/fa';
import api from '../utils/api';
import { useToast } from '../context/ToastContext';

const BillScanner = ({ onScanComplete }) => {
    const [scanning, setScanning] = useState(false);
    const [image, setImage] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const { showToast } = useToast();

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedFile(file);
            setImage(URL.createObjectURL(file));
            
            // Automatically process the image upon selection
            processImageWithAI(file);
        }
    };

    const processImageWithAI = async (file) => {
        setScanning(true);
        const formData = new FormData();
        formData.append('bill', file);

        try {
            showToast('AI Model is scanning the invoice...', 'info');
            const res = await api.post('/expenses/scan-bill', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (res.data) {
                onScanComplete(res.data);
                showToast('Bill scanned and form populated!', 'success');
            }
        } catch (err) {
            console.error('OCR AI Scan failed:', err);
            showToast(err.response?.data?.msg || 'AI Scanner failed to read the receipt. Please enter manually.', 'error');
        } finally {
            setScanning(false);
        }
    };

    const clearSelection = () => {
        setImage(null);
        setSelectedFile(null);
    };

    return (
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 mb-6">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">AI Bill Scanner</h4>
            
            {!image ? (
                <div className="relative">
                    <input
                        type="file"
                        accept="image/*"
                        id="bill-upload"
                        className="hidden"
                        onChange={handleFileChange}
                        disabled={scanning}
                    />
                    <label
                        htmlFor="bill-upload"
                        className={`flex flex-col items-center justify-center border-2 border-dashed border-slate-200 hover:border-primary-400 rounded-xl p-8 cursor-pointer transition-colors ${scanning ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        <div className="p-3 bg-white border border-slate-100 rounded-xl text-primary-600 shadow-sm mb-3">
                            <FaUpload className="text-lg" />
                        </div>
                        <span className="text-sm font-semibold text-slate-700">Upload receipt image</span>
                        <span className="text-xs text-slate-400 mt-1">PNG, JPG, or WEBP (Max 5MB)</span>
                    </label>
                </div>
            ) : (
                <div className="relative border border-slate-200 rounded-xl p-3 bg-white flex flex-col items-center">
                    {!scanning && (
                        <button 
                            onClick={clearSelection}
                            className="absolute top-2 right-2 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full p-1.5 transition-colors focus:outline-none"
                        >
                            <FaTimes className="text-xs" />
                        </button>
                    )}
                    
                    <img 
                        src={image} 
                        alt="Uploaded Receipt" 
                        className="max-h-48 max-w-full rounded-lg object-contain shadow-sm"
                    />

                    {scanning && (
                        <div className="absolute inset-0 bg-white/80 rounded-xl flex flex-col items-center justify-center gap-3">
                            <div className="relative flex items-center justify-center">
                                <FaSpinner className="animate-spin text-primary-600 text-3xl" />
                                <FaCamera className="absolute text-slate-400 text-[10px]" />
                            </div>
                            <span className="text-xs font-bold text-slate-600 animate-pulse uppercase tracking-wider">AI Processing receipt...</span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default BillScanner;
