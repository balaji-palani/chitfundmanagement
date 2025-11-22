import React, { useState, useEffect } from 'react';
import api from '../api';

import { useAuth } from '../context/AuthContext';

const Chits = () => {
    const [chits, setChits] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        total_amount: '',
        duration_months: '',
        commission_percent: '5.0',
        start_date: new Date().toISOString().split('T')[0]
    });
    const { user } = useAuth();
    const isAdmin = user?.role === 'admin';

    useEffect(() => {
        fetchChits();
    }, []);

    const fetchChits = async () => {
        try {
            const res = await api.get('/chits');
            setChits(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/chits', formData);
            setShowModal(false);
            setFormData({
                name: '',
                total_amount: '',
                duration_months: '',
                commission_percent: '5.0',
                start_date: new Date().toISOString().split('T')[0]
            });
            fetchChits();
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.error || 'Failed to create chit');
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-primary">Chit Schemes</h2>
                    <p className="text-slate-500 mt-1">Create and manage your chit groups</p>
                </div>
                {isAdmin && (
                    <button
                        onClick={() => setShowModal(true)}
                        className="btn btn-primary flex items-center gap-2"
                    >
                        <span>+</span> New Chit
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {chits.map((chit) => (
                    <div
                        key={chit.id}
                        onClick={() => window.location.href = `/chits/${chit.id}`}
                        className="card hover:shadow-2xl transition-all cursor-pointer group"
                    >
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-xl font-bold text-primary group-hover:text-accent transition-colors">{chit.name}</h3>
                                <p className="text-sm text-slate-500 mt-1">Started: {new Date(chit.start_date).toLocaleDateString()}</p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${chit.status === 'active' ? 'bg-success/10 text-success' : 'bg-slate-100 text-slate-500'
                                }`}>
                                {chit.status.toUpperCase()}
                            </span>
                        </div>

                        <div className="mt-6 grid grid-cols-2 gap-4">
                            <div className="p-4 bg-slate-50 rounded-lg">
                                <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Value</p>
                                <p className="text-xl font-bold text-primary mt-1">₹{chit.total_amount.toLocaleString()}</p>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-lg">
                                <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Duration</p>
                                <p className="text-xl font-bold text-primary mt-1">{chit.duration_months} Months</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Add Chit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 m-4 animate-in fade-in zoom-in duration-200">
                        <h3 className="text-2xl font-bold mb-6">Start New Chit</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Chit Name</label>
                                <input
                                    type="text"
                                    required
                                    className="input"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g. September 5L Group"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Total Amount (₹)</label>
                                <input
                                    type="number"
                                    required
                                    className="input"
                                    value={formData.total_amount}
                                    onChange={(e) => setFormData({ ...formData, total_amount: e.target.value })}
                                    placeholder="500000"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Duration (Months)</label>
                                    <input
                                        type="number"
                                        required
                                        className="input"
                                        value={formData.duration_months}
                                        onChange={(e) => setFormData({ ...formData, duration_months: e.target.value })}
                                        placeholder="20"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
                                    <input
                                        type="date"
                                        required
                                        className="input"
                                        value={formData.start_date}
                                        onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Commission (%)</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    required
                                    className="input"
                                    value={formData.commission_percent}
                                    onChange={(e) => setFormData({ ...formData, commission_percent: e.target.value })}
                                    placeholder="5.0"
                                />
                            </div>
                            <div className="flex justify-end gap-3 mt-8">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="btn btn-secondary"
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    Create Chit
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Chits;
