import React, { useState, useEffect } from 'react';
import api from '../api';

const Calculator = () => {
    const [chits, setChits] = useState([]);
    const [selectedChitId, setSelectedChitId] = useState('');
    const [bidAmount, setBidAmount] = useState('');
    const [result, setResult] = useState(null);

    useEffect(() => {
        fetchChits();
    }, []);

    const fetchChits = async () => {
        try {
            const res = await api.get('/chits');
            setChits(res.data.filter(c => c.status === 'active'));
        } catch (err) {
            console.error(err);
        }
    };

    const calculate = () => {
        if (!selectedChitId || !bidAmount) return;

        const chit = chits.find(c => c.id === parseInt(selectedChitId));
        if (!chit) return;

        const bid = parseFloat(bidAmount);
        const commission = chit.total_amount * (chit.commission_percent / 100);
        const dividendPool = bid - commission;

        // If dividend pool is negative (bid < commission), it means the bid is too low? 
        // Or usually bid is the discount, so it must be higher than commission?
        // Assuming standard chit fund logic where Bid = Discount Amount.

        const memberCount = chit.member_count || 20; // Fallback if 0 to avoid Infinity
        const dividendPerMember = memberCount > 0 ? dividendPool / memberCount : 0;
        const payable = (chit.total_amount / memberCount) - dividendPerMember;

        setResult({
            chitName: chit.name,
            totalAmount: chit.total_amount,
            commission,
            dividendPool,
            dividendPerMember,
            payable,
            memberCount
        });
    };

    return (
        <div>
            <h2 className="text-3xl font-bold text-primary mb-6">Quick Calculator</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Input Section */}
                <div className="card">
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Select Chit Scheme</label>
                        <select
                            className="input"
                            value={selectedChitId}
                            onChange={(e) => {
                                setSelectedChitId(e.target.value);
                                setResult(null);
                            }}
                        >
                            <option value="">-- Select a Chit --</option>
                            {chits.map(chit => (
                                <option key={chit.id} value={chit.id}>
                                    {chit.name} (₹{chit.total_amount.toLocaleString()})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Bid Amount (Discount)</label>
                        <div className="relative">
                            <span className="absolute left-3 top-2 text-slate-400">₹</span>
                            <input
                                type="number"
                                className="input pl-8"
                                value={bidAmount}
                                onChange={(e) => setBidAmount(e.target.value)}
                                placeholder="e.g. 5000"
                            />
                        </div>
                        <p className="text-xs text-slate-500 mt-1">Enter the auction winning bid amount.</p>
                    </div>

                    <button
                        onClick={calculate}
                        disabled={!selectedChitId || !bidAmount}
                        className="btn btn-primary w-full"
                    >
                        Calculate
                    </button>
                </div>

                {/* Result Section */}
                <div className="card bg-slate-900 text-slate-300 border-none">
                    <h3 className="text-xl font-bold text-white mb-4">Breakdown</h3>

                    {!result ? (
                        <div className="h-40 flex items-center justify-center text-slate-500">
                            <p>Select a chit and enter bid to see details.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex justify-between border-b border-slate-700 pb-2">
                                <span>Chit Value</span>
                                <span className="font-bold text-white">₹{result.totalAmount.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between border-b border-slate-700 pb-2">
                                <span>Total Members</span>
                                <span className="font-bold text-white">{result.memberCount}</span>
                            </div>
                            <div className="flex justify-between border-b border-slate-700 pb-2">
                                <span>Commission (5%)</span>
                                <span className="font-bold text-accent">₹{result.commission.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between border-b border-slate-700 pb-2">
                                <span>Dividend Pool</span>
                                <span className="font-bold text-success">₹{result.dividendPool.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between border-b border-slate-700 pb-2">
                                <span>Dividend / Member</span>
                                <span className="font-bold text-success">₹{Math.round(result.dividendPerMember).toLocaleString()}</span>
                            </div>

                            <div className="mt-6 pt-4 bg-slate-800/50 p-4 rounded-lg">
                                <p className="text-center text-sm text-slate-400 mb-1">Net Payable Amount</p>
                                <p className="text-center text-3xl font-bold text-white">
                                    ₹{Math.round(result.payable).toLocaleString()}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Calculator;
