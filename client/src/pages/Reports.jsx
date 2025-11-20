import React, { useState } from 'react';
import api from '../api';

const Reports = () => {
    const [monthYear, setMonthYear] = useState('');
    const [summaryData, setSummaryData] = useState(null);
    const [loading, setLoading] = useState(false);

    const generateReport = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.get(`/summary?month_year=${monthYear}`);
            setSummaryData(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const calculateTotals = () => {
        if (!summaryData) return { totalPayable: 0 };
        let total = 0;
        summaryData.forEach(item => {
            const commission = item.commission_amount || (item.total_amount * 0.05);
            const dividendPool = item.bid_amount - commission;
            const dividend = item.member_count > 0 ? dividendPool / item.member_count : 0;
            const payable = (item.total_amount / item.member_count) - dividend;
            total += payable;
        });
        return { totalPayable: Math.round(total) };
    };

    const copyToClipboard = () => {
        if (!summaryData) return;

        let text = `${monthYear}\n\n`;
        let totalPayable = 0;

        summaryData.forEach(item => {
            const commission = item.commission_amount || (item.total_amount * 0.05);
            const dividendPool = item.bid_amount - commission;
            const dividend = item.member_count > 0 ? dividendPool / item.member_count : 0;
            const payable = (item.total_amount / item.member_count) - dividend;
            totalPayable += payable;

            text += `${item.chit_name} ${item.total_amount}\n`;
            text += `Bid - ${item.bid_amount}\n`;
            text += `Amount - ${Math.round(payable)}\n\n`;
        });

        text += `Total = ${Math.round(totalPayable)} need to pay`;

        navigator.clipboard.writeText(text);
        alert('Copied to clipboard!');
    };

    return (
        <div>
            <h2 className="text-3xl font-bold text-primary mb-6">Monthly Reports</h2>

            <div className="card max-w-xl mx-auto mb-8">
                <form onSubmit={generateReport} className="flex gap-4">
                    <input
                        type="text"
                        required
                        className="input"
                        value={monthYear}
                        onChange={(e) => setMonthYear(e.target.value)}
                        placeholder="e.g. September 2025"
                    />
                    <button type="submit" className="btn btn-primary whitespace-nowrap" disabled={loading}>
                        {loading ? 'Generating...' : 'Generate Report'}
                    </button>
                </form>
            </div>

            {summaryData && (
                <div className="max-w-xl mx-auto">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold">Summary Preview</h3>
                        <button onClick={copyToClipboard} className="btn btn-secondary text-sm">
                            Copy Text
                        </button>
                    </div>

                    <div className="bg-slate-900 text-slate-300 p-6 rounded-xl font-mono text-sm whitespace-pre-wrap shadow-2xl">
                        <p className="text-white font-bold text-lg mb-4 border-b border-slate-700 pb-2">{monthYear}</p>
                        {summaryData.map((item, idx) => {
                            const commission = item.commission_amount || (item.total_amount * 0.05);
                            const dividendPool = item.bid_amount - commission;
                            const dividend = item.member_count > 0 ? dividendPool / item.member_count : 0;
                            const payable = (item.total_amount / item.member_count) - dividend;

                            return (
                                <div key={idx} className="mb-4">
                                    <p className="text-accent font-bold">{item.chit_name} <span className="text-slate-400">{item.total_amount}</span></p>
                                    <p>Bid - {item.bid_amount}</p>
                                    <p>Amount - <span className="text-white font-bold">{Math.round(payable)}</span></p>
                                </div>
                            );
                        })}
                        <div className="mt-6 pt-4 border-t border-slate-700">
                            <p className="text-success font-bold text-lg">
                                Total = {calculateTotals().totalPayable} need to pay
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Reports;
