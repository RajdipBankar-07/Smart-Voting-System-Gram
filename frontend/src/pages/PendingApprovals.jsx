import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Check, X, Shield, User } from 'lucide-react';

const PendingApprovals = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [activeTab, setActiveTab] = useState('pending'); // 'pending' or 'history'
    const [allCitizens, setAllCitizens] = useState([]);
    const [selectedCitizen, setSelectedCitizen] = useState(null);
    const [remarks, setRemarks] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [itemsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(() => {
        const page = searchParams.get('page');
        return page ? parseInt(page, 10) : 1;
    });

    useEffect(() => {
        fetchAllCitizens();
    }, []);

    const fetchAllCitizens = async () => {
        try {
            const response = await axios.get('/api/citizens');
            setAllCitizens(response.data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleAction = async (approved) => {
        if (!selectedCitizen) return;
        setLoading(true);
        try {
            await axios.post(`/api/citizens/${selectedCitizen.id}/verify?approved=${approved}`, null, {
                params: { comments: remarks }
            });
            setModalOpen(false);
            setRemarks('');
            fetchAllCitizens();
            toast.success(approved ? 'Citizen Approved Successfully!' : 'Citizen Rejected!');
        } catch (error) {
            console.error(error);
            toast.error('Action failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const openReview = (citizen) => {
        setSelectedCitizen(citizen);
        setRemarks('');
        setModalOpen(true);
    };

    const paginate = (pageNumber) => {
        setCurrentPage(pageNumber);
        setSearchParams(prev => {
            prev.set('page', pageNumber);
            return prev;
        });
    };

    const filteredList = allCitizens.filter(c => {
        if (activeTab === 'pending') return c.status === 'PENDING_APPROVAL';
        // History: show anyone who is not pending (Approved or Rejected)
        return c.status === 'REJECTED' || c.status === 'ACTIVE';
    }).sort((a, b) => b.id - a.id);

    // Pagination Slicing
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredList.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredList.length / itemsPerPage);

    return (
        <div style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 style={{ margin: 0 }}>Voter Application Reviews</h2>
                <div className="glass-panel" style={{ display: 'flex', padding: '0.25rem', gap: '0.5rem', borderRadius: '12px' }}>
                    <button
                        onClick={() => { setActiveTab('pending'); setCurrentPage(1); }}
                        className={activeTab === 'pending' ? 'btn-primary' : 'btn-ghost'}
                        style={{ padding: '0.5rem 1.5rem', borderRadius: '10px' }}
                    >
                        Pending Requests
                    </button>
                    <button
                        onClick={() => { setActiveTab('history'); setCurrentPage(1); }}
                        className={activeTab === 'history' ? 'btn-primary' : 'btn-ghost'}
                        style={{ padding: '0.5rem 1.5rem', borderRadius: '10px' }}
                    >
                        Verification History
                    </button>
                </div>
            </div>

            {filteredList.length === 0 ? (
                <div className="glass-panel" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    <Shield size={48} style={{ marginBottom: '1rem', opacity: 0.2 }} />
                    <p style={{ fontSize: '1.1rem' }}>No {activeTab === 'pending' ? 'pending' : 'processed'} applications found.</p>
                </div>
            ) : (
                <>
                    <div className="grid-responsive">
                        {currentItems.map(citizen => (
                            <div key={citizen.id} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative', overflow: 'hidden' }}>
                                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'start' }}>
                                    <div style={{ width: '80px', height: '80px', borderRadius: '12px', overflow: 'hidden', border: '2px solid rgba(255,255,255,0.1)', flexShrink: 0, background: 'rgba(0,0,0,0.2)' }}>
                                        {citizen.photoPath ? (
                                            <img
                                                src={`/api/images/${citizen.photoPath.replace(/\\/g, '/')}`}
                                                alt={citizen.fullName}
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            />
                                        ) : (
                                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.2)' }}>
                                                <User size={32} />
                                            </div>
                                        )}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                            <div>
                                                <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1.25rem' }}>{citizen.fullName}</h3>
                                                <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                                                    <span><strong>Age:</strong> {citizen.age}</span>
                                                    <span><strong>Ward:</strong> {citizen.ward?.wardNumber || 'N/A'}</span>
                                                    <span><strong>Mobile:</strong> {citizen.mobileNumber || 'N/A'}</span>
                                                </div>
                                            </div>
                                            <span className={`status-badge status-${citizen.status.toLowerCase()}`}>
                                                {citizen.status.replace('_', ' ')}
                                            </span>
                                        </div>
                                        <div style={{ marginTop: '1.25rem' }}>
                                            <button
                                                className="btn-primary"
                                                style={{ width: '100%', background: citizen.status === 'PENDING_APPROVAL' ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.2)' }}
                                                onClick={() => openReview(citizen)}
                                            >
                                                {activeTab === 'pending' ? 'Review Application' : 'View Details'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {totalPages > 1 && (
                        <div className="pagination" style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '2rem' }}>
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
                </>
            )}

            {modalOpen && selectedCitizen && (
                <div className="modal-overlay">
                    <div className="glass-panel modal-content" style={{ maxWidth: '800px', width: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2>Review Voter Application</h2>
                            <button onClick={() => setModalOpen(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
                                <X size={24} />
                            </button>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                            <div>
                                <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}><User size={18} /> Personal Info</h4>
                                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                                    <p style={{ marginBottom: '0.75rem' }}><strong style={{ color: 'var(--text-secondary)' }}>FullName:</strong> <br />{selectedCitizen.fullName}</p>
                                    <p style={{ marginBottom: '0.75rem' }}><strong style={{ color: 'var(--text-secondary)' }}>DOB & Age:</strong> <br />{selectedCitizen.birthDate} ({selectedCitizen.age} years)</p>
                                    <p style={{ marginBottom: '0.75rem' }}><strong style={{ color: 'var(--text-secondary)' }}>Gender:</strong> <br />{selectedCitizen.gender}</p>
                                    <p style={{ marginBottom: '0.75rem' }}><strong style={{ color: 'var(--text-secondary)' }}>Mobile:</strong> <br />{selectedCitizen.mobileNumber || 'N/A'}</p>
                                    <p style={{ marginBottom: '0.75rem' }}><strong style={{ color: 'var(--text-secondary)' }}>Voter ID Number:</strong> <br />{selectedCitizen.voterId || 'N/A'}</p>
                                    <p style={{ marginBottom: '0.75rem' }}><strong style={{ color: 'var(--text-secondary)' }}>Aadhaar (Masked):</strong> <br />{selectedCitizen.maskedAadhar || 'XXXX-XXXX-XXXX'}</p>
                                    <p style={{ marginBottom: 0 }}><strong style={{ color: 'var(--text-secondary)' }}>Address:</strong> <br />{selectedCitizen.address}</p>

                                </div>
                            </div>
                            <div>
                                <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}><Shield size={18} /> Verification Documents</h4>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
                                    <div>
                                        <p style={{ marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 600 }}>1. Person's Photo</p>
                                        {selectedCitizen.photoPath ? (
                                            <div style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', background: '#000' }}>
                                                <img
                                                    src={`/api/images/${selectedCitizen.photoPath.replace(/\\/g, '/')}`}
                                                    alt="Person Photo"
                                                    style={{ width: '100%', maxHeight: '150px', objectFit: 'contain', display: 'block' }}
                                                />
                                            </div>
                                        ) : <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', textAlign: 'center', color: '#666', border: '1px dashed #444' }}>No Photo Provided</div>}
                                    </div>
                                    <div>
                                        <p style={{ marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 600 }}>2. Aadhaar Card Card</p>
                                        {selectedCitizen.aadharCardPath ? (
                                            <div style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', background: '#000' }}>
                                                <img
                                                    src={`/api/images/${selectedCitizen.aadharCardPath.replace(/\\/g, '/')}`}
                                                    alt="Aadhaar Card"
                                                    style={{ width: '100%', maxHeight: '150px', objectFit: 'contain', display: 'block' }}
                                                />
                                            </div>
                                        ) : <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', textAlign: 'center', color: '#666', border: '1px dashed #444' }}>No Aadhaar Image</div>}
                                    </div>
                                    <div>
                                        <p style={{ marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 600 }}>3. Voter ID Card Card</p>
                                        {selectedCitizen.voterIdCardPath ? (
                                            <div style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', background: '#000' }}>
                                                <img
                                                    src={`/api/images/${selectedCitizen.voterIdCardPath.replace(/\\/g, '/')}`}
                                                    alt="Voter ID Card"
                                                    style={{ width: '100%', maxHeight: '150px', objectFit: 'contain', display: 'block' }}
                                                />
                                            </div>
                                        ) : <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', textAlign: 'center', color: '#666', border: '1px dashed #444' }}>No Voter ID Image</div>}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {activeTab === 'pending' ? (
                            <>
                                <div className="form-group">
                                    <label className="form-label">Review Metrics / Remarks</label>
                                    <textarea
                                        className="glass-input"
                                        rows="3"
                                        placeholder="Enter reason for rejection or approval notes..."
                                        value={remarks}
                                        onChange={(e) => setRemarks(e.target.value)}
                                    />
                                </div>

                                <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                                    <button
                                        className="btn-primary"
                                        style={{ flex: 1, backgroundColor: '#ef4444', borderColor: '#ef4444' }}
                                        onClick={() => handleAction(false)}
                                        disabled={loading}
                                    >
                                        <X size={18} style={{ marginRight: '0.5rem' }} /> Reject Application
                                    </button>
                                    <button
                                        className="btn-primary"
                                        style={{ flex: 1, backgroundColor: '#10b981', borderColor: '#10b981' }}
                                        onClick={() => handleAction(true)}
                                        disabled={loading}
                                    >
                                        <Check size={18} style={{ marginRight: '0.5rem' }} /> Approve Voter
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div style={{ marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)', textAlign: 'center' }}>
                                <button className="btn-primary" style={{ width: '100%' }} onClick={() => setModalOpen(false)}>
                                    Close Details
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default PendingApprovals;
