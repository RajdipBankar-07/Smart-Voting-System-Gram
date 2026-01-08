import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, Map, Users, LogOut, Shield, Vote, BarChart2, Calendar } from 'lucide-react';

const Sidebar = () => {
    const navigate = useNavigate();
    const role = localStorage.getItem('role');

    const handleLogout = () => {
        localStorage.removeItem('auth');
        localStorage.removeItem('role');
        localStorage.removeItem('username');
        navigate('/login');
    };

    return (
        <aside className="glass-panel" style={{
            width: '260px',
            height: 'calc(100vh - 4rem)',
            margin: '2rem',
            display: 'flex',
            flexDirection: 'column',
            padding: '1.5rem',
            position: 'sticky',
            top: '2rem'
        }}>
            <div style={{ marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid var(--glass-border)' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '700', background: 'var(--primary-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>
                    SmartGram
                </h2>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Admin Portal</div>
            </div>

            <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {role !== 'ROLE_CITIZEN' ? (
                    <>
                        <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} end>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <Home size={20} />
                                <span>Dashboard</span>
                            </div>
                        </NavLink>
                        <NavLink to="/wards" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <Map size={20} />
                                <span>Wards</span>
                            </div>
                        </NavLink>
                        <NavLink to="/citizens" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <Users size={20} />
                                <span>Citizens</span>
                            </div>
                        </NavLink>
                        <NavLink to="/elections" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <Calendar size={20} />
                                <span>Elections</span>
                            </div>
                        </NavLink>
                        <NavLink to="/candidates" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <Vote size={20} />
                                <span>Candidates</span>
                            </div>
                        </NavLink>
                        <NavLink to="/approvals" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <Shield size={20} />
                                <span>Voter Verification</span>
                            </div>
                        </NavLink>
                        <NavLink to="/results" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <BarChart2 size={20} />
                                <span>Election Results</span>
                            </div>
                        </NavLink>
                    </>
                ) : (
                    <NavLink to="/voting" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <Home size={20} />
                            <span>My Dashboard</span>
                        </div>
                    </NavLink>
                )}
            </nav>

            <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '1rem' }}>
                <button
                    onClick={handleLogout}
                    className="nav-link"
                    style={{ width: '100%', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', color: 'var(--danger)' }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <LogOut size={20} />
                        <span>Logout</span>
                    </div>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
