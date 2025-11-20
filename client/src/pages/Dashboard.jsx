import React, { useState, useEffect } from 'react';
import api from '../api';

const Dashboard = () => {
    const [stats, setStats] = useState({
        activeChits: 0,
        totalMembers: 0,
        totalCollection: 0
    });

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await api.get('/stats');
            setStats(res.data);
        } catch (err) {
            console.error(err);
        }
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

            <div className="card min-h-[300px] flex items-center justify-center text-slate-400">
                <p>Recent Activity Chart (Coming Soon)</p>
            </div>
        </div>
    );
};

export default Dashboard;
