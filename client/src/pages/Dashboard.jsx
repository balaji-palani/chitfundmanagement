import React, { useState, useEffect } from 'react';
import api from '../api';

const Dashboard = () => {
    const [stats, setStats] = useState({
        activeChits: 0,
        totalMembers: 0,
        totalCollection: 0
    });
    const [currentMonthStatus, setCurrentMonthStatus] = useState({
        current_month: '',
        chits: []
    });

    useEffect(() => {
        fetchStats();
        fetchCurrentMonthStatus();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await api.get('/stats');
            setStats(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchCurrentMonthStatus = async () => {
        try {
            const res = await api.get('/dashboard/current-month-status');
            setCurrentMonthStatus(res.data);
        } catch (err) {
            console.error('Failed to fetch current month status:', err);
        }
    };

    const getStatusColor = (paidCount, totalMembers) => {
        const percentage = (paidCount / totalMembers) * 100;
        if (percentage === 100) return 'success';
        if (percentage > 0) return 'warning';
        return 'error';
    };

    const getProgressPercentage = (paidCount, totalMembers) => {
        return totalMembers > 0 ? (paidCount / totalMembers) * 100 : 0;
    };

    return (
        <div>
            <h2 className="text-3xl font-bold text-primary mb-6">Dashboard</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="card bg-gradient-to-br from-primary to-slate-800 text-white border-none">
                    <p className="text-slate-300 text-sm font-medium">Total Active Chits</p>
                    <p className="text-4xl font-bold mt-2">{stats.activeChits}</p>
                </div>
                <div className="card">
                    <p className="text-slate-500 text-sm font-medium">Total Members</p>
                    <p className="text-4xl font-bold text-primary mt-2">{stats.totalMembers}</p>
                </div>
                <div className="card">
                    <p className="text-slate-500 text-sm font-medium">Total Collections (Bids)</p>
                    <p className="text-4xl font-bold text-success mt-2">₹{stats.totalCollection.toLocaleString()}</p>
                </div>
            </div>

            <div className="card">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-white">
                        Payment Status - {currentMonthStatus.current_month || 'Current Month'}
                    </h3>
                    <div className="flex gap-4 text-sm">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-success"></div>
                            <span className="text-slate-400">Complete</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-warning"></div>
                            <span className="text-slate-400">Partial</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-error"></div>
                            <span className="text-slate-400">Pending</span>
                        </div>
                    </div>
                </div>

                {currentMonthStatus.chits.length === 0 ? (
                    <div className="text-center py-12 text-slate-500">
                        <p>No active chits for {currentMonthStatus.current_month || 'the current month'}</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {currentMonthStatus.chits.map((chit) => (
                            <div
                                key={chit.chit_id}
                                className="p-4 rounded-lg bg-slate-800/50 border border-slate-700 hover:border-slate-600 transition-colors"
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <h4 className="text-lg font-bold text-white">{chit.chit_name}</h4>
                                        <p className="text-sm text-slate-400 mt-1">
                                            {chit.total_members} member{chit.total_members !== 1 ? 's' : ''}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <div className={`badge badge-${getStatusColor(chit.paid_count, chit.total_members)} badge-lg`}>
                                            {chit.paid_count}/{chit.total_members} Paid
                                        </div>
                                    </div>
                                </div>

                                <div className="mb-2">
                                    <div className="w-full bg-slate-700 rounded-full h-2.5">
                                        <div
                                            className={`h-2.5 rounded-full bg-${getStatusColor(chit.paid_count, chit.total_members)}`}
                                            style={{ width: `${getProgressPercentage(chit.paid_count, chit.total_members)}%` }}
                                        ></div>
                                    </div>
                                </div>

                                <div className="flex gap-6 text-sm mt-3">
                                    <div>
                                        <span className="text-slate-400">Paid: </span>
                                        <span className="text-success font-mono font-bold">{chit.paid_count}</span>
                                    </div>
                                    <div>
                                        <span className="text-slate-400">Pending: </span>
                                        <span className="text-warning font-mono font-bold">{chit.pending_count}</span>
                                    </div>
                                    <div>
                                        <span className="text-slate-400">Progress: </span>
                                        <span className="text-white font-mono font-bold">
                                            {getProgressPercentage(chit.paid_count, chit.total_members).toFixed(0)}%
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
