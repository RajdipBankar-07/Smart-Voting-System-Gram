import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Users, Home, Activity, CheckSquare, Clipboard, Vote } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
            <h3 style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>{title}</h3>
            <div style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.5rem' }}>{value}</div>
        </div>
        <div style={{
            width: '50px', height: '50px', borderRadius: '12px',
            background: color + '20', color: color,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
            <Icon size={24} />
        </div>
    </div>
);

const Dashboard = () => {
    const [stats, setStats] = useState({
        totalWards: 0,
        totalVoters: 0,
        votingPercentage: 0,
        activeElections: 0,
        pendingApprovals: 0
    });

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const response = await axios.get('/api/dashboard/stats');
            setStats(response.data);
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
        }
    };

    return (
        <div>
            <div className="page-header">
                <h1>Admin Dashboard</h1>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <StatCard
                    title="Total Wards"
                    value={stats.totalWards}
                    icon={Home}
                    color="#3b82f6"
                />
                <StatCard
                    title="Total Voters"
                    value={stats.totalVoters}
                    icon={Users}
                    color="#8b5cf6"
                />
                <StatCard
                    title="Voting Percentage"
                    value={`${stats.votingPercentage}%`}
                    icon={Activity}
                    color="#10b981"
                />
                <StatCard
                    title="Active Elections"
                    value={stats.activeElections}
                    icon={CheckSquare}
                    color="#f59e0b"
                />
                <StatCard
                    title="Pending Approvals"
                    value={stats.pendingApprovals}
                    icon={Clipboard}
                    color="#ef4444"
                />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                <div className="glass-panel" style={{ padding: '2rem' }}>
                    <h2 style={{ marginBottom: '1rem' }}>Quick Actions</h2>
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                        <a href="/citizens" className="btn-primary" style={{ textDecoration: 'none' }}>
                            Manage Citizens
                        </a>
                        <a href="/candidates" className="btn-primary" style={{ background: '#8b5cf6', border: 'none', textDecoration: 'none' }}>
                            Manage Candidates
                        </a>
                        <a href="/wards" className="btn-primary" style={{ background: 'var(--surface-color)', border: '1px solid var(--primary-color)', textDecoration: 'none' }}>
                            Manage Wards
                        </a>
                        <a href="/results" className="btn-primary" style={{ background: 'var(--secondary-color)', border: 'none', textDecoration: 'none' }}>
                            View Results
                        </a>
                    </div>
                </div>

                <div className="glass-panel" style={{ padding: '2rem' }}>
                    <h2 style={{ marginBottom: '1rem' }}>Election Status</h2>
                    {stats.activeElections > 0 ? (
                        <div>
                            <p style={{ color: 'var(--success)', fontWeight: 'bold' }}>• Election in Progress</p>
                            <div style={{ marginTop: '1rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                    <span>Voter Turnout</span>
                                    <span>{stats.votingPercentage}%</span>
                                </div>
                                <div style={{ height: '8px', width: '100%', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                                    <div style={{ height: '100%', width: `${stats.votingPercentage}%`, background: 'var(--success)', transition: 'width 1s ease-in-out' }}></div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <p style={{ color: 'var(--text-secondary)' }}>No active elections currently.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
