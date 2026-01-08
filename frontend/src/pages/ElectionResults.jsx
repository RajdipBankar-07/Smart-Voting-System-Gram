import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Trophy, BarChart2 } from 'lucide-react';

const ElectionResults = () => {
    const [wards, setWards] = useState([]);
    const [selectedWard, setSelectedWard] = useState('');
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchWards();
    }, []);

    useEffect(() => {
        if (selectedWard) {
            fetchResults(selectedWard);
        }
    }, [selectedWard]);

    const fetchWards = async () => {
        try {
            const response = await axios.get('/api/wards');
            setWards(response.data);
            if (response.data.length > 0) {
                // Optionally select the first ward by default
                setSelectedWard(response.data[0].wardNumber);
            }
        } catch (error) {
            console.error('Error fetching wards:', error);
        }
    };

    const fetchResults = async (wardNumber) => {
        setLoading(true);
        setResults(null);
        try {
            const response = await axios.get(`/api/voting/results/ward/${wardNumber}`);
            setResults(response.data);
        } catch (error) {
            if (error.response?.status === 403) {
                setResults('HIDDEN');
            } else {
                console.error('Error fetching results:', error);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '900px', margin: '2rem auto' }}>
            <div className="page-header">
                <h1>Election Results</h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <label style={{ color: 'var(--text-secondary)' }}>Select Ward:</label>
                    <select
                        className="glass-input"
                        style={{ width: '200px' }}
                        value={selectedWard}
                        onChange={(e) => setSelectedWard(e.target.value)}
                    >
                        <option value="">Select Ward</option>
                        {wards.map(w => (
                            <option key={w.id} value={w.wardNumber}>{w.wardName} ({w.wardNumber})</option>
                        ))}
                    </select>
                </div>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>Loading results...</div>
            ) : results === 'HIDDEN' ? (
                <div className="glass-panel" style={{ padding: '4rem', textAlign: 'center', opacity: 0.8 }}>
                    <BarChart2 size={48} style={{ marginBottom: '1rem', color: 'var(--primary)', opacity: 0.5 }} />
                    <h2>Results are restricted</h2>
                    <p>Only administrators can view real-time counts. Results will be published for everyone after the election is locked.</p>
                </div>
            ) : results ? (
                <>
                    {/* Winner Section */}
                    {results.winner && typeof results.winner === 'object' ? (
                        <div className="glass-panel" style={{
                            padding: '2rem',
                            marginBottom: '2rem',
                            textAlign: 'center',
                            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(16, 185, 129, 0.05) 100%)',
                            border: '1px solid rgba(16, 185, 129, 0.3)'
                        }}>
                            <Trophy size={48} color="#10b981" style={{ marginBottom: '1rem' }} />
                            <h2 style={{ color: '#10b981', margin: '0 0 0.5rem 0' }}>Winner: {results.winner.name}</h2>
                            <p style={{ color: 'var(--text-primary)', fontSize: '1.2rem', margin: 0 }}>
                                {results.winner.partyName}
                            </p>
                            <div className="badge active" style={{ marginTop: '1rem', fontSize: '1rem' }}>
                                {results.winner.voteCount} Votes
                            </div>
                        </div>
                    ) : (
                        <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem', textAlign: 'center' }}>
                            <p>No winner declared yet (No votes or no candidates).</p>
                        </div>
                    )}

                    {/* Detailed List */}
                    <div className="glass-panel">
                        <div style={{ padding: '1rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <BarChart2 size={20} color="var(--primary-color)" />
                            <h3 style={{ margin: 0 }}>Vote Breakdown</h3>
                        </div>
                        <table>
                            <thead>
                                <tr>
                                    <th>Candidate</th>
                                    <th>Party</th>
                                    <th style={{ textAlign: 'center' }}>Symbol</th>
                                    <th>Votes</th>
                                </tr>
                            </thead>
                            <tbody>
                                {results.candidates && results.candidates.length > 0 ? (
                                    results.candidates
                                        .sort((a, b) => b.voteCount - a.voteCount)
                                        .map((candidate) => (
                                            <tr key={candidate.id} style={{
                                                background: results.winner && results.winner.id === candidate.id ? 'rgba(16, 185, 129, 0.1)' : 'transparent'
                                            }}>
                                                <td style={{ fontWeight: 500 }}>
                                                    {candidate.name}
                                                    {results.winner && results.winner.id === candidate.id && <span style={{ marginLeft: '0.5rem' }}>🏆</span>}
                                                </td>
                                                <td>{candidate.partyName}</td>
                                                <td style={{ textAlign: 'center' }}>
                                                    <div style={{ width: '40px', height: '40px', margin: '0 auto', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        {candidate.symbolPath ? (
                                                            <img src={`/api/images/${candidate.symbolPath}`} alt="symbol" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                                        ) : (
                                                            <span style={{ fontSize: '1.5rem' }}>🗳️</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className="badge" style={{ background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa' }}>
                                                        {candidate.voteCount}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" style={{ textAlign: 'center', padding: '2rem' }}>No candidates found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </>
            ) : (
                <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
                    Please select a ward to view results.
                </div>
            )}
        </div>
    );
};

export default ElectionResults;
