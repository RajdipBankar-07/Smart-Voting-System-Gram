import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Plus, Edit2, Trash2, X, Play, Square, Lock, Calendar, Users } from 'lucide-react';

const ElectionManagement = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [elections, setElections] = useState([]);
    const [wards, setWards] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [currentElection, setCurrentElection] = useState(null);

    const [itemsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(() => {
        const page = searchParams.get('page');
        return page ? parseInt(page, 10) : 1;
    });

    const [formData, setFormData] = useState({
        name: '',
        startDate: '',
        endDate: '',
        wardIds: []
    });

    useEffect(() => {
        fetchElections();
        fetchWards();
    }, []);

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

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleWardSelection = (wardId) => {
        const currentIds = formData.wardIds;
        if (currentIds.includes(wardId)) {
            setFormData({ ...formData, wardIds: currentIds.filter(id => id !== wardId) });
        } else {
            setFormData({ ...formData, wardIds: [...currentIds, wardId] });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const payload = {
            election: {
                name: formData.name,
                startDate: formData.startDate,
                endDate: formData.endDate,
                status: 'SCHEDULED' // Default for new
            },
            wardIds: formData.wardIds
        };

        try {
            if (currentElection) {
                // Keep existing status if updating
                payload.election.status = currentElection.status;
                await axios.put(`/api/elections/${currentElection.id}`, payload);
            } else {
                await axios.post('/api/elections', payload);
            }
            fetchElections();
            closeModal();
        } catch (err) {
            console.error(err);
            alert("Failed to save election");
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id, status) => {
        if (!window.confirm(`Are you sure you want to mark this election as ${status}?`)) return;
        try {
            await axios.put(`/api/elections/${id}/status?status=${status}`);
            fetchElections();
        } catch (err) {
            console.error(err);
            alert("Failed to update status");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this election?")) return;
        try {
            await axios.delete(`/api/elections/${id}`);
            fetchElections();
        } catch (err) {
            console.error(err);
        }
    };

    const openModal = (election = null) => {
        if (election) {
            setCurrentElection(election);
            setFormData({
                name: election.name,
                startDate: election.startDate || '',
                endDate: election.endDate || '',
                wardIds: election.wards.map(w => w.id)
            });
        } else {
            setCurrentElection(null);
            setFormData({
                name: '',
                startDate: '',
                endDate: '',
                wardIds: []
            });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setCurrentElection(null);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'ACTIVE': return 'active';
            case 'ENDED': return 'inactive'; // simplistic mapping
            case 'LOCKED': return 'inactive';
            default: return 'pending'; // for scheduled
        }
    };

    const paginate = (pageNumber) => {
        setCurrentPage(pageNumber);
        setSearchParams(prev => {
            prev.set('page', pageNumber);
            return prev;
        });
    };

    // Pagination Calculation
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = elections.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(elections.length / itemsPerPage);

    return (
        <div>
            <div className="page-header">
                <h1>Election Management</h1>
                <button className="btn-primary" onClick={() => openModal()}>
                    <Plus size={18} /> Create Election
                </button>
            </div>

            <div className="glass-panel table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Election Name</th>
                            <th>Dates</th>
                            <th>Wards</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentItems.map(election => (
                            <tr key={election.id}>
                                <td>{election.name}</td>
                                <td style={{ fontSize: '0.9rem' }}>
                                    <div>Start: {election.startDate?.replace('T', ' ')}</div>
                                    <div>End: {election.endDate?.replace('T', ' ')}</div>
                                </td>
                                <td>
                                    {election.wards.length > 0
                                        ? election.wards.map(w => w.wardNumber).join(', ')
                                        : 'All'}
                                </td>
                                <td>
                                    <span className={`badge ${getStatusColor(election.status)}`}>{election.status}</span>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                        <button
                                            onClick={() => navigate(`/candidates?electionId=${election.id}`)}
                                            className="btn-icon"
                                            title="Manage Candidates"
                                            style={{ color: '#8b5cf6' }}
                                        >
                                            <Users size={18} />
                                        </button>
                                        {election.status === 'SCHEDULED' && (
                                            <button onClick={() => updateStatus(election.id, 'ACTIVE')} className="btn-icon" title="Start Election" style={{ color: '#10b981' }}>
                                                <Play size={18} />
                                            </button>
                                        )}
                                        {election.status === 'ACTIVE' && (
                                            <button onClick={() => updateStatus(election.id, 'ENDED')} className="btn-icon" title="Stop Election" style={{ color: '#ef4444' }}>
                                                <Square size={18} />
                                            </button>
                                        )}
                                        {election.status === 'ENDED' && (
                                            <button onClick={() => updateStatus(election.id, 'LOCKED')} className="btn-icon" title="Lock Election" style={{ color: '#f59e0b' }}>
                                                <Lock size={18} />
                                            </button>
                                        )}

                                        <button onClick={() => openModal(election)} className="btn-icon edit" disabled={election.status === 'LOCKED'}>
                                            <Edit2 size={18} />
                                        </button>
                                        <button onClick={() => handleDelete(election.id)} className="btn-icon delete">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {elections.length === 0 && (
                            <tr><td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>No elections found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="pagination" style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1rem' }}>
                    <button
                        className="btn-primary"
                        style={{ padding: '0.5rem 1rem' }}
                        onClick={() => paginate(currentPage - 1)}
                        disabled={currentPage === 1}
                    >
                        Previous
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter(page => Math.abs(currentPage - page) <= 1 || page === 1 || page === totalPages)
                        .map((page, index, array) => (
                            <React.Fragment key={page}>
                                {index > 0 && array[index - 1] !== page - 1 && <span style={{ color: 'var(--text-secondary)', alignSelf: 'center' }}>...</span>}
                                <button
                                    onClick={() => paginate(page)}
                                    className={`btn-primary ${currentPage === page ? 'active' : ''}`}
                                    style={{ padding: '0.5rem 1rem', background: currentPage === page ? 'var(--primary)' : 'rgba(255,255,255,0.1)' }}
                                >
                                    {page}
                                </button>
                            </React.Fragment>
                        ))}
                    <button
                        className="btn-primary"
                        style={{ padding: '0.5rem 1rem' }}
                        onClick={() => paginate(currentPage + 1)}
                        disabled={currentPage === totalPages}
                    >
                        Next
                    </button>
                </div>
            )}

            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="glass-panel modal-content">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2>{currentElection ? 'Edit Election' : 'New Election'}</h2>
                            <button onClick={closeModal} className="btn-icon"><X size={24} /></button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label className="form-label">Election Name</label>
                                <input name="name" value={formData.name} onChange={handleInputChange} className="glass-input" required />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Start Date & Time</label>
                                    <input type="datetime-local" name="startDate" value={formData.startDate} onChange={handleInputChange} className="glass-input" required />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">End Date & Time</label>
                                    <input type="datetime-local" name="endDate" value={formData.endDate} onChange={handleInputChange} className="glass-input" required />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label" style={{ marginBottom: '0.5rem', display: 'block' }}>Assign Wards</label>
                                <div style={{ maxHeight: '150px', overflowY: 'auto', background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '4px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '0.5rem' }}>
                                    {wards.map(ward => (
                                        <label key={ward.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                            <input
                                                type="checkbox"
                                                checked={formData.wardIds.includes(ward.id)}
                                                onChange={() => handleWardSelection(ward.id)}
                                            />
                                            <span style={{ fontSize: '0.9rem' }}>Ward {ward.wardNumber}</span>
                                        </label>
                                    ))}
                                </div>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                                    Select wards that participate in this election.
                                </p>
                            </div>

                            <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={loading}>
                                {loading ? 'Saving...' : 'Save Election'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ElectionManagement;
