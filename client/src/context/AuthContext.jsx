import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const username = localStorage.getItem('username');
        const role = localStorage.getItem('role');
        if (token && username) {
            setUser({ username, role });
            // Set default header for axios
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
        setLoading(false);
    }, []);

    const login = async (username, password) => {
        try {
            const res = await api.post('/auth/login', { username, password });
            const { token, username: user, role } = res.data;

            localStorage.setItem('token', token);
            localStorage.setItem('username', user);
            localStorage.setItem('role', role);
            setUser({ username: user, role });

            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            return true;
        } catch (error) {
            console.error("Login failed", error);
            throw error;
        }
    };

    const register = async (username, password) => {
        try {
            await api.post('/auth/register', { username, password });
            return true;
        } catch (error) {
            console.error("Registration failed", error);
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        localStorage.removeItem('role');
        setUser(null);
        delete api.defaults.headers.common['Authorization'];
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
