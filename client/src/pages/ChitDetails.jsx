import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';

import { useAuth } from '../context/AuthContext';

const ChitDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [chit, setChit] = useState(null);
    const [members, setMembers] = useState([]);
    const [chitMembers, setChitMembers] = useState([]);
    const [cycles, setCycles] = useState([]);
    const [availableMembers, setAvailableMembers] = useState([]);

    const [showAddMember, setShowAddMember] = useState(false);
    const [showAddCycle, setShowAddCycle] = useState(false);

    const [expandedCycle, setExpandedCycle] = useState(null);
    const { user } = useAuth();
    const isAdmin = user?.role === 'admin';

    const togglePayments = (cycleId) => {
        if (expandedCycle === cycleId) setExpandedCycle(null);
        else setExpandedCycle(cycleId);
    };

    const CyclePayments = ({ cycleId, members }) => {
        const [payments, setPayments] = useState({});
        const [loading, setLoading] = useState(true);

        useEffect(() => {
            fetchPayments();
        }, [cycleId]);

        const fetchPayments = async () => {
            try {
                const res = await api.get(`/cycles/${cycleId}/payments`);
                const paymentMap = {};
                res.data.forEach(p => paymentMap[p.member_id] = p.status);
                setPayments(paymentMap);
                setLoading(false);
            } catch (err) { console.error(err); }
        };

        const togglePayment = async (memberId, currentStatus) => {
            const newStatus = currentStatus === 'paid' ? 'pending' : 'paid';
            try {
                await api.post(`/cycles/${cycleId}/payments`, { member_id: memberId, status: newStatus });
                setPayments(prev => ({ ...prev, [memberId]: newStatus }));
            } catch (err) {
                console.error(err);
                alert(err.response?.data?.error || 'Failed to update payment');
            }
        };

        if (loading) return <div className="text-sm text-slate-500">Loading payments...</div>;

        return (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {members.map(m => {
                    const isPaid = payments[m.id] === 'paid';
                    return (
                        <div
                            key={m.id}
                            onClick={isAdmin ? () => togglePayment(m.id, payments[m.id]) : undefined}
                            className={`p-2 rounded border flex items-center gap-2 transition-colors ${isPaid ? 'bg-success/10 border-success text-success' : 'bg-white border-slate-200 text-slate-500'} ${isAdmin ? 'cursor-pointer hover:border-slate-300' : 'cursor-default'}
                                `}
                        >
                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${isPaid ? 'bg-success border-success' : 'border-slate-300'
                                }`}>
                                {isPaid && <span className="text-white text-[10px]">✓</span>}
                            </div>
                            <span className="text-sm font-medium truncate">{m.name}</span>
                        </div>
                    );
                })}
            </div>
        );
    }; const [selectedMember, setSelectedMember] = useState('');
    const [cycleData, setCycleData] = useState({
        month_number: '',
        month_year: '',
        bid_amount: '',
        winner_member_id: ''
    });

    useEffect(() => {
        fetchChitDetails();
        fetchChitMembers();
        fetchCycles();
        fetchAllMembers();
    }, [id]);

    const fetchChitDetails = async () => {
        try {
            const res = await api.get('/chits');
            const found = res.data.find(c => c.id === parseInt(id));
            setChit(found);
        } catch (err) { console.error(err); }
    };

    const fetchChitMembers = async () => {
        try {
            const res = await api.get(`/chits/${id}/members`);
            setChitMembers(res.data);
        } catch (err) { console.error(err); }
    };

    const fetchCycles = async () => {
        try {
            const res = await api.get(`/chits/${id}/cycles`);
            setCycles(res.data);
        } catch (err) { console.error(err); }
    };

    const fetchAllMembers = async () => {
        try {
            const res = await api.get('/members');
            setMembers(res.data);
        } catch (err) { console.error(err); }
    };

    useEffect(() => {
        // Filter members not already in chit
        const memberIds = new Set(chitMembers.map(m => m.id));
        setAvailableMembers(members.filter(m => !memberIds.has(m.id)));
    }, [members, chitMembers]);

    const handleAddMember = async (e) => {
        e.preventDefault();
        try {
            await api.post(`/chits/${id}/members`, { member_id: selectedMember });
            setShowAddMember(false);
            fetchChitMembers();
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.error || 'Failed to add member');
        }
    };

    const handleAddCycle = async (e) => {
        e.preventDefault();
        try {
            await api.post(`/chits/${id}/cycles`, cycleData);
            setShowAddCycle(false);
            fetchCycles();
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.error || 'Failed to record cycle');
        }
    };

    if (!chit) return <div className="p-8 text-center">Loading...</div>;

    return (
        <div>
            <div className="flex items-center gap-4 mb-6">
                <button onClick={() => navigate('/chits')} className="text-slate-400 hover:text-primary">
                    ← Back
                </button>
                <h2 className="text-3xl font-bold text-primary">{chit.name}</h2>
                <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-sm font-medium">
                    {chit.status}
                </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Info & Members */}
                <div className="space-y-8">
                    <div className="card">
                        <h3 className="text-lg font-bold mb-4">Chit Info</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-slate-500">Total Value</span>
                                <span className="font-medium">₹{chit.total_amount.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Duration</span>
                                <span className="font-medium">{chit.duration_months} Months</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Commission</span>
                                <span className="font-medium">{chit.commission_percent}%</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Start Date</span>
                                <span className="font-medium">{new Date(chit.start_date).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>

                    <div className="card">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold">Members ({chitMembers.length})</h3>
                            {isAdmin && (
                                <button
                                    onClick={() => setShowAddMember(true)}
                                    className="text-sm text-accent font-medium hover:underline"
                                >
                                    + Add
                                </button>
                            )}
                        </div>
                        <div className="space-y-2 max-h-[300px] overflow-y-auto">
                            {chitMembers.map(m => (
                                <div key={m.id} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg">
                                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold">
                                        {m.name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">{m.name}</p>
                                        <p className="text-xs text-slate-400">{m.contact}</p>
                                    </div>
                                </div>
                            ))}
                            {chitMembers.length === 0 && (
                                <p className="text-sm text-slate-400 text-center py-4">No members yet.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Cycles & History */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="card">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold">Monthly Cycles</h3>
                            {isAdmin && (
                                <button
                                    onClick={() => setShowAddCycle(true)}
                                    className="btn btn-primary text-sm"
                                >
                                    Record New Month
                                </button>
                            )}
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-slate-100">
                                        <th className="pb-3 font-medium text-slate-500 text-sm">Month</th>
                                        <th className="pb-3 font-medium text-slate-500 text-sm">Winner</th>
                                        <th className="pb-3 font-medium text-slate-500 text-sm text-right">Bid Amount</th>
                                        <th className="pb-3 font-medium text-slate-500 text-sm text-right">Dividend</th>
                                        <th className="pb-3 font-medium text-slate-500 text-sm text-right">Payable</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {cycles.map(cycle => {
                                        const commission = chit.total_amount * (chit.commission_percent / 100);
                                        const dividendTotal = cycle.bid_amount - commission;
                                        const dividendPerMember = chitMembers.length > 0 ? dividendTotal / chitMembers.length : 0;
                                        const payable = (chit.total_amount / chitMembers.length) - dividendPerMember;
                                        const winner = chitMembers.find(m => m.id === cycle.winner_member_id);

                                        return (
                                            <React.Fragment key={cycle.id}>
                                                <tr className="group hover:bg-slate-50">
                                                    <td className="py-4">
                                                        <p className="font-medium">{cycle.month_year}</p>
                                                        <p className="text-xs text-slate-400">Month {cycle.month_number}</p>
                                                        <button
                                                            onClick={() => togglePayments(cycle.id)}
                                                            className="text-xs text-accent mt-1 hover:underline"
                                                        >
                                                            {expandedCycle === cycle.id ? 'Hide Payments' : 'View Payments'}
                                                        </button>
                                                    </td>
                                                    <td className="py-4">
                                                        {winner ? (
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-6 h-6 rounded-full bg-accent/10 text-accent flex items-center justify-center text-xs">
                                                                    {winner.name.charAt(0)}
                                                                </div>
                                                                <span className="text-sm">{winner.name}</span>
                                                            </div>
                                                        ) : 'Unknown'}
                                                    </td>
                                                    <td className="py-4 text-right font-medium text-slate-600">
                                                        ₹{cycle.bid_amount.toLocaleString()}
                                                    </td>
                                                    <td className="py-4 text-right text-success text-sm">
                                                        ₹{Math.round(dividendPerMember).toLocaleString()}
                                                    </td>
                                                    <td className="py-4 text-right font-bold text-primary">
                                                        ₹{Math.round(payable).toLocaleString()}
                                                    </td>
                                                </tr>
                                                {expandedCycle === cycle.id && (
                                                    <tr>
                                                        <td colSpan="5" className="p-4 bg-slate-50 rounded-lg">
                                                            <CyclePayments cycleId={cycle.id} members={chitMembers} />
                                                        </td>
                                                    </tr>
                                                )}
                                            </React.Fragment>
                                        );
                                    })}
                                    {cycles.length === 0 && (
                                        <tr>
                                            <td colSpan="5" className="py-8 text-center text-slate-400">
                                                No cycles recorded yet.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Add Member Modal */}
            {showAddMember && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6">
                        <h3 className="text-xl font-bold mb-4">Add Member to Chit</h3>
                        <form onSubmit={handleAddMember}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-slate-700 mb-1">Select Member</label>
                                <select
                                    className="input"
                                    value={selectedMember}
                                    onChange={(e) => setSelectedMember(e.target.value)}
                                    required
                                >
                                    <option value="">-- Select --</option>
                                    {availableMembers.map(m => (
                                        <option key={m.id} value={m.id}>{m.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex justify-end gap-2">
                                <button type="button" onClick={() => setShowAddMember(false)} className="btn btn-secondary">Cancel</button>
                                <button type="submit" className="btn btn-primary">Add</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Record Cycle Modal */}
            {showAddCycle && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
                        <h3 className="text-xl font-bold mb-4">Record Monthly Cycle</h3>
                        <form onSubmit={handleAddCycle} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Month No.</label>
                                    <input
                                        type="number"
                                        className="input"
                                        required
                                        value={cycleData.month_number}
                                        onChange={e => setCycleData({ ...cycleData, month_number: e.target.value })}
                                        placeholder="1"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Month & Year</label>
                                    <input
                                        type="text"
                                        className="input"
                                        required
                                        value={cycleData.month_year}
                                        onChange={e => setCycleData({ ...cycleData, month_year: e.target.value })}
                                        placeholder="September 2025"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Winner</label>
                                <select
                                    className="input"
                                    required
                                    value={cycleData.winner_member_id}
                                    onChange={e => setCycleData({ ...cycleData, winner_member_id: e.target.value })}
                                >
                                    <option value="">-- Select Winner --</option>
                                    {chitMembers.map(m => (
                                        <option key={m.id} value={m.id}>{m.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Bid Amount (₹)</label>
                                <input
                                    type="number"
                                    className="input"
                                    required
                                    value={cycleData.bid_amount}
                                    onChange={e => setCycleData({ ...cycleData, bid_amount: e.target.value })}
                                    placeholder="50000"
                                />
                                <p className="text-xs text-slate-400 mt-1">The amount forgone by the winner (Discount).</p>
                            </div>
                            <div className="flex justify-end gap-2 mt-6">
                                <button type="button" onClick={() => setShowAddCycle(false)} className="btn btn-secondary">Cancel</button>
                                <button type="submit" className="btn btn-primary">Save Record</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChitDetails;
