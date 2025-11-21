import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await register(username, password);
            navigate('/login');
        } catch (err) {
            setError('Registration failed. Username might be taken.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900">
            <div className="card w-full max-w-md">
                <h2 className="text-3xl font-bold text-primary mb-6 text-center">Register</h2>
                {error && <div className="bg-red-500/20 text-red-400 p-3 rounded mb-4">{error}</div>}
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
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-slate-400 mb-1">Password</label>
                        <input
                            type="password"
                            className="input w-full"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-primary w-full">Register</button>
                </form>
                <p className="text-center text-slate-500 mt-4">
                    Already have an account? <Link to="/login" className="text-accent hover:underline">Login</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
