import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Plus, Trash2, X, User, Image as ImageIcon, MapPin, Hash } from 'lucide-react';

const CandidateManagement = () => {
    const [searchParams] = useSearchParams();
    const [elections, setElections] = useState([]);
    const [wards, setWards] = useState([]);
    const [candidates, setCandidates] = useState([]);
    const [selectedElectionId, setSelectedElectionId] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        partyName: '',
        wardNumber: '',
        symbol: null
    });
    const [preview, setPreview] = useState(null);

    useEffect(() => {
        fetchElections();
        fetchWards();
        const electionId = searchParams.get('electionId');
        if (electionId) {
            setSelectedElectionId(electionId);
        }
    }, []);

    useEffect(() => {
        if (selectedElectionId) {
            fetchCandidates(selectedElectionId);
        } else {
            setCandidates([]);
        }
    }, [selectedElectionId]);

    const fetchElections = async () => {
        try {
            const res = await axios.get('/api/elections');
            setElections(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchWards = async () => {
        try {
            const res = await axios.get('/api/wards');
            setWards(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchCandidates = async (id) => {
        try {
            const res = await axios.get(`/api/voting/candidates/election/${id}`);
            setCandidates(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({ ...formData, symbol: file });
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedElectionId) {
            toast.error("Please select an election first");
            return;
        }
        setLoading(true);

        const data = new FormData();
        const candidateJson = JSON.stringify({
            name: formData.name,
            partyName: formData.partyName
        });

        data.append('candidate', new Blob([candidateJson], { type: 'application/json' }));
        if (formData.symbol) {
            data.append('symbol', formData.symbol);
        }
        data.append('electionId', selectedElectionId);

        try {
            await axios.post(`/api/voting/candidates/ward/${formData.wardNumber}`, data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success("Candidate added successfully!");
            fetchCandidates(selectedElectionId);
            closeModal();
        } catch (err) {
            console.error(err);
            toast.error("Failed to add candidate");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Remove this candidate?")) return;
        try {
            await axios.delete(`/api/voting/candidates/${id}`);
            toast.success("Candidate removed");
            fetchCandidates(selectedElectionId);
        } catch (err) {
            console.error(err);
            toast.error("Delete failed");
        }
    };

    const openModal = () => {
        if (!selectedElectionId) {
            toast.error("Select an election from the list first");
            return;
        }
        setFormData({ name: '', partyName: '', wardNumber: '', symbol: null });
        setPreview(null);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setPreview(null);
    };

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1>Candidate Management</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Assign participants and symbols to elections</p>
                </div>
                <button className="btn-primary" onClick={openModal}>
                    <Plus size={18} /> Add Candidate
                </button>
            </div>

            <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Select Election</label>
                <select
                    className="glass-input"
                    value={selectedElectionId}
                    onChange={(e) => setSelectedElectionId(e.target.value)}
                    style={{ maxWidth: '400px' }}
                >
                    <option value="">-- Choose an Election --</option>
                    {elections.map(el => (
                        <option key={el.id} value={el.id}>{el.name} ({el.status})</option>
                    ))}
                </select>
            </div>

            {selectedElectionId ? (
                <div className="glass-panel table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Candidate</th>
                                <th>Symbol</th>
                                <th>Party</th>
                                <th>Ward</th>
                                <th>Votes</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {candidates.map(c => (
                                <tr key={c.id}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <User size={18} />
                                            </div>
                                            <span style={{ fontWeight: '500' }}>{c.name}</span>
                                        </div>
                                    </td>
                                    <td>
                                        {c.symbolPath ? (
                                            <img
                                                src={`/api/images/${c.symbolPath}`}
                                                alt="symbol"
                                                style={{ height: '30px', width: '30px', objectFit: 'contain', borderRadius: '4px' }}
                                            />
                                        ) : (
                                            <span style={{ color: 'var(--text-secondary)' }}>No Symbol</span>
                                        )}
                                    </td>
                                    <td style={{ color: 'var(--primary)', fontWeight: '600' }}>{c.partyName}</td>
                                    <td>Ward {c.ward?.wardNumber}</td>
                                    <td style={{ fontWeight: '700' }}>{c.voteCount}</td>
                                    <td>
                                        <button onClick={() => handleDelete(c.id)} className="btn-icon delete">
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {candidates.length === 0 && (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                                        No candidates assigned to this election yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="glass-panel" style={{ textAlign: 'center', padding: '4rem', opacity: 0.7 }}>
                    <Hash size={48} style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }} />
                    <h2 style={{ color: 'var(--text-secondary)' }}>Select an election above to manage candidates</h2>
                </div>
            )}

            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="glass-panel modal-content" style={{ maxWidth: '500px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2>Register New Candidate</h2>
                            <button onClick={closeModal} className="btn-icon"><X size={24} /></button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label className="form-label">Full Name</label>
                                <input
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className="glass-input"
                                    required
                                    placeholder="Enter candidate name"
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Party Affiliation</label>
                                    <input
                                        name="partyName"
                                        value={formData.partyName}
                                        onChange={handleInputChange}
                                        className="glass-input"
                                        required
                                        placeholder="Party name"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Assigned Ward</label>
                                    <select
                                        name="wardNumber"
                                        value={formData.wardNumber}
                                        onChange={handleInputChange}
                                        className="glass-input"
                                        required
                                    >
                                        <option value="">Select Ward</option>
                                        {wards.map(w => (
                                            <option key={w.id} value={w.wardNumber}>Ward {w.wardNumber}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Election Symbol (Sign/Logo)</label>
                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'start' }}>
                                    <div
                                        onClick={() => document.getElementById('symbol-input').click()}
                                        style={{
                                            width: '100px',
                                            height: '100px',
                                            border: '2px dashed rgba(255,255,255,0.1)',
                                            borderRadius: '8px',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer',
                                            overflow: 'hidden',
                                            background: 'rgba(0,0,0,0.1)'
                                        }}
                                    >
                                        {preview ? (
                                            <img src={preview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                        ) : (
                                            <>
                                                <ImageIcon size={24} style={{ opacity: 0.5 }} />
                                                <span style={{ fontSize: '0.7rem', opacity: 0.5, marginTop: '0.25rem' }}>Upload</span>
                                            </>
                                        )}
                                    </div>
                                    <div style={{ flex: 1, paddingTop: '0.5rem' }}>
                                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                                            Choose an image that represents the candidate on the ballot paper.
                                        </p>
                                        <input
                                            id="symbol-input"
                                            type="file"
                                            onChange={handleFileChange}
                                            accept="image/*"
                                            hidden
                                        />
                                        <button
                                            type="button"
                                            className="btn-primary"
                                            style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', background: 'var(--surface-color)', border: '1px solid var(--primary)' }}
                                            onClick={() => document.getElementById('symbol-input').click()}
                                        >
                                            Choose File
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={loading}>
                                {loading ? 'Adding Candidate...' : 'Confirm Registration'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CandidateManagement;
