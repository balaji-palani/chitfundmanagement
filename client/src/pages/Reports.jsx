import React, { useState, useEffect } from 'react';
import api from '../api';

const Reports = () => {
    const [reportType, setReportType] = useState('monthly'); // 'monthly' or 'member'
    const [members, setMembers] = useState([]);
    const [selectedMember, setSelectedMember] = useState('');
    const [memberHistory, setMemberHistory] = useState(null);
    const [monthYear, setMonthYear] = useState('');
    const [summaryData, setSummaryData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [viewMode, setViewMode] = useState('chit'); // 'chit' or 'month'
    const [error, setError] = useState('');

    console.log('Reports Render:', { reportType, members, selectedMember, memberHistory });

    // Fetch members when switching to member report
    useEffect(() => {
        if (reportType === 'member' && members.length === 0) {
            fetchMembers();
        }
    }, [reportType]);

    const fetchMembers = async () => {
        try {
            const res = await api.get('/members');
            setMembers(res.data);
        } catch (err) {
            console.error("Failed to fetch members", err);
            setError("Failed to fetch members. Please try refreshing.");
        }
    };

    const generateReport = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSummaryData(null);
        setMemberHistory(null);

        console.log('Generating report for:', { reportType, selectedMember, monthYear });
        try {
            if (reportType === 'monthly') {
                const res = await api.get(`/summary?month_year=${monthYear}`);
                setSummaryData(res.data);
            } else {
                if (!selectedMember) {
                    console.warn('No member selected');
                    return;
                }
                console.log('Fetching payments for member:', selectedMember);
                const res = await api.get(`/members/${selectedMember}/payments`);
                console.log('API Response:', res.data);
                setMemberHistory(res.data);
            }
        } catch (err) {
            console.error('Error generating report:', err);
            setError(err.response?.data?.error || 'Failed to generate report. Please try again.');
            if (err.response?.status === 401 || err.response?.status === 403) {
                setError('Session expired. Please login again.');
            }
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

    // Helper to group history by chit
    const getGroupedHistory = () => {
        if (!memberHistory) return {};
        const groups = {};
        memberHistory.forEach(item => {
            if (!groups[item.chit_name]) {
                groups[item.chit_name] = [];
            }
            groups[item.chit_name].push(item);
        });
        return groups;
    };

    const groupedHistory = getGroupedHistory();

    // Helper to group history by month
    const getGroupedByMonthHistory = () => {
        if (!memberHistory) return {};
        const groups = {};
        memberHistory.forEach(item => {
            if (!groups[item.month_year]) {
                groups[item.month_year] = [];
            }
            groups[item.month_year].push(item);
        });
        return groups;
    };

    const groupedByMonthHistory = getGroupedByMonthHistory();

    const copyToClipboard = () => {
        if (reportType === 'monthly' && summaryData) {
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
        } else if (reportType === 'member' && memberHistory) {
            if (viewMode === 'chit') {
                let text = `Payment History for Member\n\n`;
                const groups = getGroupedHistory();

                Object.keys(groups).forEach(chitName => {
                    text += `--- ${chitName} ---\n`;
                    let chitTotal = 0;
                    let chitPaid = 0;

                    groups[chitName].forEach(item => {
                        text += `${item.month_year}: ₹${item.payable_amount} (${item.status})`;
                        if (item.paid_date) text += ` - Paid on ${new Date(item.paid_date).toLocaleDateString()}`;
                        text += '\n';

                        chitTotal += item.payable_amount;
                        if (item.status === 'paid') chitPaid += item.payable_amount;
                    });

                    text += `Total Payable: ₹${chitTotal}\n`;
                    text += `Total Paid: ₹${chitPaid}\n`;
                    text += `Pending: ₹${chitTotal - chitPaid}\n\n`;
                });

                navigator.clipboard.writeText(text);
                alert('Copied to clipboard!');
            } else {
                // Monthly view WhatsApp format
                let text = '';
                const groups = getGroupedByMonthHistory();

                // Sort months (newest first logic is already in data, but object keys might shuffle)
                // We'll rely on the order from the API which is sorted by date

                Object.keys(groups).forEach(month => {
                    text += `${month}\n\n`;
                    let monthlyTotal = 0;
                    let equationParts = [];

                    groups[month].forEach(item => {
                        text += `${item.chit_name} ${parseInt(item.total_amount || 0).toLocaleString()}\n`;
                        text += `bid- ${parseInt(item.bid_amount || 0).toLocaleString()}\n`;
                        text += `Amount- ${item.payable_amount}\n\n`;

                        monthlyTotal += item.payable_amount;
                        equationParts.push(item.payable_amount);
                    });

                    text += `Total - ${equationParts.join(' + ')} =${monthlyTotal} need to pay\n`;
                    text += `-----------------------------------\n\n`;
                });

                navigator.clipboard.writeText(text);
                alert('Copied to clipboard (Monthly Format)!');
            }
        }
    };

    return (
        <div>
            <h2 className="text-3xl font-bold text-primary mb-6">Reports</h2>

            <div className="flex justify-center mb-6">
                <div className="btn-group">
                    <button
                        className={`btn ${reportType === 'monthly' ? 'btn-primary' : 'btn-ghost'}`}
                        onClick={() => { setReportType('monthly'); setSummaryData(null); }}
                    >
                        Monthly Summary
                    </button>
                    <button
                        className={`btn ${reportType === 'member' ? 'btn-primary' : 'btn-ghost'}`}
                        onClick={() => { setReportType('member'); setMemberHistory(null); }}
                    >
                        Member Report
                    </button>
                </div>
            </div>

            <div className="card max-w-xl mx-auto mb-8">
                <form onSubmit={generateReport} className="flex gap-4 flex-col md:flex-row">
                    {reportType === 'monthly' ? (
                        <input
                            type="text"
                            required
                            className="input w-full"
                            value={monthYear}
                            onChange={(e) => setMonthYear(e.target.value)}
                            placeholder="e.g. September 2025"
                        />
                    ) : (
                        <select
                            className="input w-full"
                            value={selectedMember}
                            onChange={(e) => setSelectedMember(e.target.value)}
                            required
                        >
                            <option value="">Select Member</option>
                            {members.map(m => (
                                <option key={m.id} value={m.id}>{m.name}</option>
                            ))}
                        </select>
                    )}
                    <button type="submit" className="btn btn-primary whitespace-nowrap" disabled={loading}>
                        {loading ? 'Generating...' : 'Generate Report'}
                    </button>
                </form>
            </div>

            {error && (
                <div className="alert alert-error shadow-lg max-w-xl mx-auto mb-8">
                    <div>
                        <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <span>{error}</span>
                    </div>
                </div>
            )}

            {reportType === 'monthly' && summaryData && (
                <div className="max-w-4xl mx-auto">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold">Monthly Summary: {monthYear}</h3>
                        <button onClick={copyToClipboard} className="btn btn-secondary text-sm">
                            Copy Text for WhatsApp
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="table w-full">
                            <thead>
                                <tr>
                                    <th>Chit Name</th>
                                    <th>Total Value</th>
                                    <th>Bid Amount</th>
                                    <th>Dividend</th>
                                    <th>Payable</th>
                                </tr>
                            </thead>
                            <tbody>
                                {summaryData.map((item, idx) => {
                                    const commission = item.commission_amount || (item.total_amount * 0.05);
                                    const dividendPool = item.bid_amount - commission;
                                    const dividend = item.member_count > 0 ? dividendPool / item.member_count : 0;
                                    const payable = (item.total_amount / item.member_count) - dividend;

                                    return (
                                        <tr key={idx} className="hover">
                                            <td className="font-bold text-white">{item.chit_name}</td>
                                            <td>₹{parseInt(item.total_amount).toLocaleString()}</td>
                                            <td className="text-accent">₹{parseInt(item.bid_amount).toLocaleString()}</td>
                                            <td className="text-success">₹{Math.round(dividend).toLocaleString()}</td>
                                            <td className="font-bold text-white">₹{Math.round(payable).toLocaleString()}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <th colSpan="4" className="text-right text-lg">Total Payable:</th>
                                    <th className="text-lg text-primary">₹{calculateTotals().totalPayable.toLocaleString()}</th>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            )}

            {reportType === 'member' && memberHistory && (
                <div className="max-w-4xl mx-auto">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold">Payment History</h3>
                        <div className="flex gap-2">
                            <div className="btn-group">
                                <button
                                    className={`btn btn-sm ${viewMode === 'chit' ? 'btn-active' : ''}`}
                                    onClick={() => setViewMode('chit')}
                                >
                                    By Chit
                                </button>
                                <button
                                    className={`btn btn-sm ${viewMode === 'month' ? 'btn-active' : ''}`}
                                    onClick={() => setViewMode('month')}
                                >
                                    By Month
                                </button>
                            </div>
                            <button onClick={copyToClipboard} className="btn btn-secondary btn-sm">
                                Copy Text
                            </button>
                        </div>
                    </div>

                    {Object.keys(groupedHistory).length === 0 && (
                        <div className="text-center text-slate-500 py-8">No payment history found.</div>
                    )}

                    {viewMode === 'chit' ? (
                        Object.keys(groupedHistory).map(chitName => {
                            const items = groupedHistory[chitName];
                            const totalPayable = items.reduce((sum, item) => sum + item.payable_amount, 0);
                            const totalPaid = items.reduce((sum, item) => item.status === 'paid' ? sum + item.payable_amount : sum, 0);
                            const totalPending = totalPayable - totalPaid;

                            return (
                                <div key={chitName} className="card mb-8 bg-slate-800/50">
                                    <div className="p-4 border-b border-slate-700 flex justify-between items-center flex-wrap gap-4">
                                        <h4 className="text-lg font-bold text-primary">{chitName}</h4>
                                        <div className="flex gap-4 text-sm">
                                            <span className="text-slate-400">Payable: <span className="text-white font-mono">₹{totalPayable.toLocaleString()}</span></span>
                                            <span className="text-success">Paid: <span className="font-mono">₹{totalPaid.toLocaleString()}</span></span>
                                            <span className="text-warning">Pending: <span className="font-mono">₹{totalPending.toLocaleString()}</span></span>
                                        </div>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="table w-full">
                                            <thead>
                                                <tr>
                                                    <th>Month</th>
                                                    <th>Amount</th>
                                                    <th>Status</th>
                                                    <th>Paid Date</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {items.map((item, idx) => (
                                                    <tr key={idx} className="hover">
                                                        <td>{item.month_year}</td>
                                                        <td className="font-mono">₹{item.payable_amount.toLocaleString()}</td>
                                                        <td>
                                                            <span className={`badge ${item.status === 'paid' ? 'badge-success' : 'badge-warning'}`}>
                                                                {item.status}
                                                            </span>
                                                        </td>
                                                        <td>{item.paid_date ? new Date(item.paid_date).toLocaleDateString() : '-'}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        Object.keys(groupedByMonthHistory).map(month => {
                            const items = groupedByMonthHistory[month];
                            const monthlyTotal = items.reduce((sum, item) => sum + item.payable_amount, 0);

                            return (
                                <div key={month} className="card mb-8 bg-slate-800/50">
                                    <div className="p-4 border-b border-slate-700 flex justify-between items-center">
                                        <h4 className="text-lg font-bold text-accent">{month}</h4>
                                        <span className="text-white font-bold">Total: ₹{monthlyTotal.toLocaleString()}</span>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="table w-full">
                                            <thead>
                                                <tr>
                                                    <th>Chit Name</th>
                                                    <th>Total Value</th>
                                                    <th>Bid Amount</th>
                                                    <th>Payable</th>
                                                    <th>Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {items.map((item, idx) => (
                                                    <tr key={idx} className="hover">
                                                        <td className="font-bold text-white">{item.chit_name}</td>
                                                        <td>₹{parseInt(item.total_amount || 0).toLocaleString()}</td>
                                                        <td className="text-accent">₹{parseInt(item.bid_amount || 0).toLocaleString()}</td>
                                                        <td className="font-mono font-bold">₹{item.payable_amount.toLocaleString()}</td>
                                                        <td>
                                                            <span className={`badge ${item.status === 'paid' ? 'badge-success' : 'badge-warning'}`}>
                                                                {item.status}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            )}
        </div>
    );
};

export default Reports;
