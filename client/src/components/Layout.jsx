import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Layout = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const location = useLocation();

    const navItems = [
        { path: '/', label: 'Dashboard', icon: '📊' },
        { path: '/members', label: 'Members', icon: '👥' },
        { path: '/chits', label: 'Chits', icon: '💰' },
        { path: '/reports', label: 'Reports', icon: '📈' },
        { path: '/calculator', label: 'Calculator', icon: '🧮' },
    ];

    return (
        <div className="min-h-screen bg-background flex relative">
            {!isSidebarOpen && (
                <button className="md:hidden absolute top-4 left-4 z-20 p-3 bg-primary text-white rounded-full shadow-lg hover:bg-primary/80 transition-colors" onClick={() => setIsSidebarOpen(true)}>
                    <span className="text-2xl">☰</span>
                </button>
            )}
            {/* Sidebar */}
            <aside className={`w-64 bg-gray-100 border-r border-slate-200 fixed left-0 h-full z-10 transform transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:flex flex-col`}>
                <div className="p-6 border-b border-slate-100">

                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight ml-16 md:ml-0">ChitFund<span className="text-accent">.io</span></h1>
                </div>
                <nav className="flex-1 p-4 space-y-1">
                    {navItems.map((item) => <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setIsSidebarOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${location.pathname === item.path
                            ? 'bg-primary text-white shadow-lg shadow-primary/25'
                            : 'text-gray-800 hover:bg-slate-50 hover:text-primary'
                            }`}
                    >
                        <span className="text-xl">{item.icon}</span>
                        <span className="font-medium">{item.label}</span>
                    </Link>
                    )}
                </nav>
                <div className="p-4 border-t border-slate-100">
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                        <p className="text-xs text-slate-500 font-medium">System Status</p>
                        <div className="flex items-center gap-2 mt-2">
                            <div className="w-2 h-2 rounded-full bg-success animate-pulse"></div>
                            <span className="text-sm text-slate-700">Online</span>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-0 md:ml-64 p-8 pt-12">
                <div className="max-w-6xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default Layout;
