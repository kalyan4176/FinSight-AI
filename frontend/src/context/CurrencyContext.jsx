import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../utils/api';

const CurrencyContext = createContext();

export const useCurrency = () => useContext(CurrencyContext);

export const CurrencyProvider = ({ children }) => {
    const [currency, setCurrency] = useState('INR');
    const [symbol, setSymbol] = useState('₹');

    const currencies = {
        USD: { symbol: '$', locale: 'en-US' },
        INR: { symbol: '₹', locale: 'en-IN' },
        EUR: { symbol: '€', locale: 'de-DE' },
        GBP: { symbol: '£', locale: 'en-GB' },
        JPY: { symbol: '¥', locale: 'ja-JP' },
        AUD: { symbol: 'A$', locale: 'en-AU' },
        CAD: { symbol: 'C$', locale: 'en-CA' },
        CNY: { symbol: '¥', locale: 'zh-CN' },
    };

    useEffect(() => {
        const fetchCurrency = async () => {
            try {
                const token = localStorage.getItem('token');
                if (token) {
                    const res = await api.get('/user/profile');
                    if (res.data.currency) {
                        updateCurrencyState(res.data.currency);
                    }
                }
            } catch (err) {
                console.error("Failed to fetch currency preference", err);
            }
        };
        fetchCurrency();
    }, []);

    const updateCurrencyState = (currCode) => {
        setCurrency(currCode);
        setSymbol(currencies[currCode]?.symbol || '₹');
    };

    const formatCurrency = (amount) => {
        const curr = currencies[currency] || currencies.USD;
        return new Intl.NumberFormat(curr.locale, {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 2
        }).format(amount);
    };

    return (
        <CurrencyContext.Provider value={{ currency, symbol, currencies, updateCurrencyState, formatCurrency }}>
            {children}
        </CurrencyContext.Provider>
    );
};
