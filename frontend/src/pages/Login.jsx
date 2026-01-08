import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const token = btoa(`${username}:${password}`);
            const config = {
                headers: { Authorization: `Basic ${token}` }
            };

            // Verify credentials
            const response = await axios.get('/api/auth/me', config);
            const { role } = response.data;

            // If success, store in localStorage (simulating session)
            localStorage.setItem('auth', token);
            localStorage.setItem('role', role);
            localStorage.setItem('username', response.data.username);

            axios.defaults.headers.common['Authorization'] = `Basic ${token}`;

            // Redirect based on role
            if (role === 'ROLE_CITIZEN') {
                navigate('/voting'); // Citizens go to voting/home
            } else {
                navigate('/'); // Admin goes to dashboard
            }
        } catch (err) {
            console.error(err);
            setError('Invalid credentials');
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: 'var(--bg-color)' }}>
            <div className="glass-panel" style={{ width: '400px', padding: '3rem' }}>
                <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>SmartGram</h1>
                {error && <div style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}
                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="glass-input"
                            required
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="glass-input"
                            required
                        />
                    </div>
                    <button type="submit" className="btn-primary" style={{ width: '100%', padding: '1rem' }}>Login</button>
                    <div style={{ textAlign: 'center', marginTop: '1rem', color: 'var(--text-secondary)' }}>
                        New User? <Link to="/register" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 'bold' }}>Register as Citizen</Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
