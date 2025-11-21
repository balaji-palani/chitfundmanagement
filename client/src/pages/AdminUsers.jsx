import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api';

const AdminUsers = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('user');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const { user } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        try {
            await api.post('/auth/register', { username, password, role });
            setSuccess(`User '${username}' created successfully!`);
            setUsername('');
            setPassword('');
            setRole('user');
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to create user');
        }
    };

    if (user?.role !== 'admin') {
        return <div className="text-white text-center mt-10">Access Denied</div>;
    }

    return (
        <div className="max-w-md mx-auto mt-10">
            <div className="card">
                <h2 className="text-2xl font-bold text-primary mb-6">Create New User</h2>
                {error && <div className="bg-red-500/20 text-red-400 p-3 rounded mb-4">{error}</div>}
                {success && <div className="bg-green-500/20 text-green-400 p-3 rounded mb-4">{success}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-slate-400 mb-1">Username</label>
                        <input
                            type="text"
                            className="input w-full"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-slate-400 mb-1">Password</label>
                        <input
                            type="password"
                            className="input w-full"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-slate-400 mb-1">Role</label>
                        <select
                            className="input w-full"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                        >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                    <button type="submit" className="btn btn-primary w-full">Create User</button>
                </form>
            </div>
        </div>
    );
};

export default AdminUsers;
