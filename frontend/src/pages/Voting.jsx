import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, CheckCircle, AlertTriangle, LogOut, Lock } from 'lucide-react';

const Voting = () => {
    const [loginStep, setLoginStep] = useState(true);
    const [currentCitizen, setCurrentCitizen] = useState(null);
    const [candidates, setCandidates] = useState([]);
    const [error, setError] = useState('');

    const [editMode, setEditMode] = useState(false);
    const [electionStatus, setElectionStatus] = useState('LOADING'); // Replaces electionEnded
    const [results, setResults] = useState([]);
    const [winner, setWinner] = useState(null);

    const fetchCandidates = async (eId, wardNum) => {
        try {
            const res = await axios.get(`/api/voting/candidates/election/${eId}/ward/${wardNum}/with-nota`);
            setCandidates(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchResults = async (wardNum) => {
        try {
            const res = await axios.get(`/api/voting/results/ward/${wardNum}`);
            setResults(res.data.candidates || []);
            setWinner(res.data.winner && res.data.winner !== "No candidates" ? res.data.winner : null);
        } catch (err) {
            if (err.response?.status === 403) {
                setResults('HIDDEN');
            } else {
                console.error("Failed to fetch results", err);
            }
        }
    };

    const handleVote = async (candidateId) => {
        if (!currentCitizen) return;
        if (!window.confirm("Are you sure you want to cast your vote? This action cannot be undone.")) return;

        try {
            await axios.post(`/api/voting/vote`, null, {
                params: {
                    citizenId: currentCitizen.id,
                    candidateId: candidateId
                }
            });
            // Refresh citizen status
            // setCurrentCitizen({ ...currentCitizen, hasVoted: true });
            // alert("Vote cast successfully!");
            // toast.success("Vote cast successfully!");
            window.location.reload();
        } catch (err) {
            console.error(err);
            // alert("Failed to cast vote. You may have already voted.");
            // toast.error(err.response?.data?.message || "Failed to cast vote");
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        if (!window.confirm("Updating your profile will revoke your voting rights until an Admin approves your changes. Continue?")) return;

        const formData = new FormData(e.target);

        try {
            await axios.post(`/api/citizens/${currentCitizen.id}/profile`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            alert("Profile updated successfully! You will now be redirected to login.");
            handleLogout();
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || "Failed to update profile.");
        }
    };

    const fetchWardResults = async (wardNum) => {
        try {
            const response = await axios.get(`/api/voting/results/ward/${wardNum}`);
            setResults(response.data.candidates || []);
            setWinner(response.data.winner && response.data.winner !== "No candidates" ? response.data.winner : null);
        } catch (err) {
            console.error("Failed to fetch results", err);
        }
    };

    const fetchElectionStatus = async (wardNum) => {
        try {
            const response = await axios.get(`/api/voting/election/ward/${wardNum}`);
            if (response.data) {
                setElectionStatus(response.data.status);
                // If active, fetch candidates (voting mode)
                if (response.data.status === 'ACTIVE') {
                    fetchCandidates(wardNum);
                }
                // If Locked (Published), fetch results
                if (response.data.status === 'LOCKED') {
                    fetchWardResults(wardNum);
                }
            } else {
                setElectionStatus('NONE');
            }
        } catch (err) {
            console.error(err);
            setElectionStatus('NONE');
        }
    };

    useEffect(() => {
        const checkAuth = async () => {
            const role = localStorage.getItem('role');
            const username = localStorage.getItem('username'); // This is Aadhar for citizens

            if (role === 'ROLE_CITIZEN') {
                try {
                    const response = await axios.get('/api/citizens');
                    const citizens = response.data;
                    const citizen = citizens.find(c => c.username === username); // Match logged in username

                    if (citizen) {
                        setCurrentCitizen(citizen);
                        setLoginStep(false);
                        if (citizen.status === 'ACTIVE') {
                            fetchElectionStatus(citizen.ward.wardNumber);
                        }
                    } else {
                        setError('Citizen record not found for logged in user.');
                        setLoginStep(true);
                    }
                } catch (e) {
                    setError('Failed to load voter profile.');
                }
            } else {
                // Admin looking at voting screen?
                setError('Admins cannot vote interactively here. Please login as a Citizen.');
                setLoginStep(true);
            }
        };
        checkAuth();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('auth');
        localStorage.removeItem('role');
        localStorage.removeItem('username');
        window.location.href = '/login';
    };

    if (loginStep) {
        return (
            <div className="glass-panel" style={{ padding: '2rem', margin: '2rem auto', maxWidth: '500px', textAlign: 'center' }}>
                <h2>Citizen Dashboard</h2>
                {error ? (
                    <div style={{ color: '#ef4444' }}>
                        <p>{error}</p>
                        <p>Please log out and log in with valid Credentials.</p>
                        <button onClick={handleLogout} className="btn-primary" style={{ marginTop: '1rem' }}>Back to Login</button>
                    </div>
                ) : (
                    <p>Loading Voter Profile...</p>
                )}
            </div>
        );
    }

    // If not active, show status dashboard
    if (currentCitizen.status !== 'ACTIVE') {
        return (
            <div style={{ maxWidth: '600px', margin: '4rem auto' }}>
                <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
                    <div style={{
                        width: '80px', height: '80px', borderRadius: '50%',
                        background: currentCitizen.status === 'PENDING_APPROVAL' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                        color: currentCitizen.status === 'PENDING_APPROVAL' ? '#f59e0b' : '#ef4444',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto'
                    }}>
                        {currentCitizen.status === 'PENDING_APPROVAL' ? <AlertTriangle size={40} /> : <AlertTriangle size={40} />}
                    </div>
                    <h2>Application Status: {currentCitizen.status.replace('_', ' ')}</h2>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '1rem' }}>
                        {currentCitizen.status === 'PENDING_APPROVAL'
                            ? "Your voter registration is currently under review by the Ward Officer. You will be able to vote once approved."
                            : "Your application has been rejected. Please contact the Gram Panchayat office for more details."}
                    </p>

                    <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', textAlign: 'left' }}>
                        <p><strong>Name:</strong> {currentCitizen.fullName}</p>
                        <p><strong>Aadhaar:</strong> {currentCitizen.aadharNumber}</p>
                        <p><strong>Ward:</strong> {currentCitizen.ward.wardNumber} - {currentCitizen.ward.wardName}</p>
                    </div>

                    <button onClick={handleLogout} className="btn-primary" style={{ marginTop: '2rem' }}>
                        Logout
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '800px', margin: '2rem auto' }}>
            <div className="page-header">
                <h1>Citizen Dashboard - Ward {currentCitizen.ward.wardNumber}</h1>
                <button onClick={() => setLoginStep(true)} className="btn-icon" title="Logout">
                    Logout
                </button>
            </div>

            <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', justifyContent: 'space-between' }}>

                    {/* Profile Section */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, minWidth: '300px' }}>
                        {currentCitizen.photoPath ? (
                            <img
                                src={`/api/images/${currentCitizen.photoPath.replace(/\\/g, '/')}`}
                                alt="Voter Verified"
                                style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary)' }}
                            />
                        ) : (
                            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'grey', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>No Img</div>
                        )}
                        <div>
                            <h3 style={{ margin: 0 }}>{currentCitizen.fullName}</h3>
                            <p style={{ color: 'var(--text-secondary)', margin: '0.25rem 0' }}>
                                Aadhar: {currentCitizen.aadharNumber}
                            </p>
                            <span className="badge active" style={{ fontSize: '0.8rem' }}>
                                Status: {currentCitizen.status}
                            </span>
                        </div>
                    </div>

                    {/* Ward & Election Info */}
                    <div style={{ flex: 1, minWidth: '250px', borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '2rem' }}>
                        <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--primary)' }}>Ward Information</h4>
                        <p style={{ margin: 0, fontSize: '1.1rem' }}>
                            <strong>Ward {currentCitizen.ward.wardNumber}:</strong> {currentCitizen.ward.wardName}
                        </p>
                        <p style={{ margin: '0.5rem 0 0 0', color: 'var(--text-secondary)' }}>
                            Active Election: Gram Panchayat 2026
                        </p>
                    </div>

                    {/* Voting Status */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minWidth: '150px' }}>
                        {currentCitizen.hasVoted ? (
                            <div style={{ textAlign: 'center', color: '#10b981' }}>
                                <CheckCircle size={40} style={{ marginBottom: '0.5rem' }} />
                                <div><strong>Voted</strong></div>
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', color: '#f59e0b' }}>
                                <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>!</div>
                                <div><strong>Not Voted</strong></div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {editMode && (
                <div className="modal-overlay">
                    <div className="glass-panel modal-content" style={{ maxWidth: '600px', width: '90%' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2>Update Profile</h2>
                            <button onClick={() => setEditMode(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>X</button>
                        </div>
                        <p style={{ color: '#f59e0b', fontSize: '0.9rem', marginBottom: '1rem' }}>
                            <AlertTriangle size={16} style={{ display: 'inline', marginRight: '5px', verticalAlign: 'text-bottom' }} />
                            Warning: Updating any details will reset your status to "Pending Approval" and you will not be able to vote until re-approved.
                        </p>

                        <form onSubmit={handleUpdateProfile} style={{ display: 'grid', gap: '1rem' }}>
                            <div className="form-group">
                                <label className="form-label">Address</label>
                                <input
                                    name="address"
                                    defaultValue={currentCitizen.address}
                                    className="glass-input"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Mobile Number</label>
                                <input
                                    name="mobileNumber"
                                    defaultValue={currentCitizen.mobileNumber}
                                    className="glass-input"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Update Voter Photo (Optional)</label>
                                <input type="file" name="photo" className="glass-input" accept="image/*" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Update Aadhaar Card (Optional)</label>
                                <input type="file" name="aadharCard" className="glass-input" accept="image/*" />
                            </div>

                            <button type="submit" className="btn-primary" style={{ marginTop: '1rem' }}>
                                Submit Updates
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {success && (
                <div style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', textAlign: 'center' }}>
                    {success}
                </div>
            )}
            {error && (
                <div style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', textAlign: 'center' }}>
                    {error}
                </div>
            )}

            {/* Main Content Area */}
            {currentCitizen.status !== 'ACTIVE' ? (
                <div className="glass-panel" style={{ padding: '4rem', textAlign: 'center', background: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                    <AlertTriangle size={48} style={{ color: '#f59e0b', marginBottom: '1.5rem' }} />
                    <h2 style={{ color: '#f59e0b' }}>Account {currentCitizen.status.replace('_', ' ')}</h2>
                    <p style={{ marginTop: '1rem', color: 'var(--text-secondary)', maxWidth: '500px', margin: '1rem auto' }}>
                        Your registration or profile update is currently being reviewed by the Gram Panchayat Admin.
                        You will be able to vote once your identity documents are verified.
                    </p>
                    <div style={{ marginTop: '2rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                        Current Status: <span style={{ color: '#f59e0b', fontWeight: 'bold' }}>{currentCitizen.status}</span>
                    </div>
                </div>
            ) : electionStatus === 'LOCKED' ? (
                // RESULTS VIEW
                <div className="glass-panel" style={{ padding: '2rem' }}>
                    <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Official Election Results</h2>

                    {results === 'HIDDEN' ? (
                        <div style={{ textAlign: 'center', padding: '3rem', opacity: 0.7 }}>
                            <Lock size={48} style={{ marginBottom: '1rem' }} />
                            <h3>Results are currently being compiled</h3>
                            <p>Check back shortly as the results are published by the Election Commission.</p>
                        </div>
                    ) : (
                        <>
                            {winner ? (
                                <div style={{ background: 'rgba(245, 158, 11, 0.2)', padding: '1.5rem', borderRadius: '8px', textAlign: 'center', marginBottom: '2rem', border: '1px solid #f59e0b' }}>
                                    <h3 style={{ color: '#f59e0b', margin: 0 }}>🏆 Winner: {winner.name}</h3>
                                    <p style={{ margin: '0.5rem 0 0 0' }}>Party: {winner.partyName}</p>
                                    <p style={{ fontSize: '1.2rem', fontWeight: 'bold', marginTop: '0.5rem' }}>{winner.voteCount} Votes</p>
                                </div>
                            ) : (
                                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>Processing Results...</div>
                            )}

                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ background: 'rgba(255,255,255,0.05)', textAlign: 'left' }}>
                                        <th style={{ padding: '1rem' }}>Candidate</th>
                                        <th style={{ padding: '1rem' }}>Party</th>
                                        <th style={{ padding: '1rem', textAlign: 'right' }}>Total Votes</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {results.map(candidate => (
                                        <tr key={candidate.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                            <td style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                <div style={{ width: '40px', height: '40px', borderRadius: '4px', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                                    {candidate.symbolPath ? (
                                                        <img src={`/api/images/${candidate.symbolPath}`} alt="symbol" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                                    ) : '🗳️'}
                                                </div>
                                                {candidate.name}
                                            </td>
                                            <td style={{ padding: '1rem' }}>{candidate.partyName}</td>
                                            <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 'bold' }}>{candidate.voteCount}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </>
                    )}
                </div>
            ) : electionStatus === 'ACTIVE' ? (
                // VOTING VIEW
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.5rem' }}>
                    {candidates.length > 0 ? (
                        candidates.map(candidate => (
                            <div key={candidate.id} className="glass-panel candidate-card" style={{ padding: '1.5rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', transition: 'transform 0.2s', border: candidate.id === 0 ? '1px dashed var(--primary)' : '1px solid rgba(255,255,255,0.1)' }}>
                                <div style={{
                                    width: '60px', height: '60px', borderRadius: '10px',
                                    background: candidate.id === 0 ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.05)',
                                    display: 'flex',
                                    alignItems: 'center', justifyContent: 'center', marginBottom: '1rem',
                                    overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)'
                                }}>
                                    {candidate.symbolPath ? (
                                        <img
                                            src={`/api/images/${candidate.symbolPath}`}
                                            alt="symbol"
                                            style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '5px' }}
                                        />
                                    ) : (
                                        <span style={{ fontSize: '2.5rem' }}>{candidate.id === 0 ? '🚫' : '🗳️'}</span>
                                    )}
                                </div>
                                <h3 style={{ marginBottom: '0.25rem' }}>{candidate.name}</h3>
                                <p style={{ color: 'var(--primary)', fontWeight: '600', marginBottom: '1.5rem', fontSize: '0.9rem' }}>{candidate.partyName}</p>

                                <button
                                    className="btn-primary"
                                    style={{
                                        width: '100%',
                                        background: currentCitizen.hasVoted ? 'rgba(255,255,255,0.1)' : (candidate.id === 0 ? 'linear-gradient(135deg, #64748b 0%, #334155 100%)' : 'var(--primary-gradient)'),
                                        cursor: currentCitizen.hasVoted ? 'not-allowed' : 'pointer'
                                    }}
                                    disabled={currentCitizen.hasVoted}
                                    onClick={() => handleVote(candidate.id)}
                                >
                                    {currentCitizen.hasVoted ? 'Already Voted' : (candidate.id === 0 ? 'Select NOTA' : 'Vote Now')}
                                </button>
                            </div>
                        ))
                    ) : (
                        <div className="glass-panel" style={{ gridColumn: '1/-1', padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                            <p>No candidates found for this Ward.</p>
                        </div>
                    )}
                </div>
            ) : (
                // WAITING / ENDED VIEW
                <div className="glass-panel" style={{ padding: '4rem', textAlign: 'center' }}>
                    <h2 style={{ color: 'var(--text-secondary)' }}>
                        {electionStatus === 'ENDED' ? "Voting Has Ended" : "No Active Election"}
                    </h2>
                    <p style={{ marginTop: '1rem', opacity: 0.7 }}>
                        {electionStatus === 'ENDED'
                            ? "Please wait for the results to be declared by the Election Commission."
                            : "Check back later for upcoming election schedules."}
                    </p>
                </div>
            )}
        </div>
    );
};

export default Voting;
