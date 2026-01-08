import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Plus, Edit2, Trash2, X, Users } from 'lucide-react';

const WardManagement = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [wards, setWards] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentWard, setCurrentWard] = useState(null);
    const [error, setError] = useState('');

    // Citizen View State
    const [viewCitizensModalOpen, setViewCitizensModalOpen] = useState(false);
    const [selectedWardForView, setSelectedWardForView] = useState(null);
    const [wardCitizens, setWardCitizens] = useState([]);
    const [wardCitizensLoading, setWardCitizensLoading] = useState(false);

    // Initialize currentPage from URL param 'page', default to 1
    const [currentPage, setCurrentPage] = useState(() => {
        const page = searchParams.get('page');
        return page ? parseInt(page, 10) : 1;
    });

    const [wardsPerPage] = useState(10);
    const [formData, setFormData] = useState({
        wardNumber: '',
        wardName: '',
        areaName: '',
        wardBoundary: '',
        population: '',
        assignedOfficer: '',
        status: 'ACTIVE'
    });

    useEffect(() => {
        fetchWards();
    }, []);

    // ... Pagination Logic ...

    const fetchWardCitizens = async (ward) => {
        setSelectedWardForView(ward);
        setViewCitizensModalOpen(true);
        setWardCitizensLoading(true);
        try {
            const response = await axios.get(`/api/citizens/ward/${ward.wardNumber}`);
            setWardCitizens(response.data);
        } catch (error) {
            console.error("Error fetching citizens:", error);
            setWardCitizens([]); // Clear on error
        } finally {
            setWardCitizensLoading(false);
        }
    };

    // Pagination Logic
    const indexOfLastWard = currentPage * wardsPerPage;
    const indexOfFirstWard = indexOfLastWard - wardsPerPage;
    const currentWards = wards.slice(indexOfFirstWard, indexOfLastWard);

    const paginate = (pageNumber) => {
        setCurrentPage(pageNumber);
        setSearchParams(prev => {
            prev.set('page', pageNumber);
            return prev;
        });
    };

    const fetchWards = async () => {
        try {
            const response = await axios.get('/api/wards');
            setWards(response.data);
            setError('');
        } catch (error) {
            console.error('Error fetching wards:', error);
            setError('Failed to fetch wards');
        }
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError(''); // Clear error when user types
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (currentWard) {
                await axios.put(`/api/wards/${currentWard.id}`, formData);
                toast.success('Ward updated successfully!');
            } else {
                await axios.post('/api/wards', formData);
                toast.success('Ward created successfully!');
            }
            fetchWards();
            handleCloseModal();
        } catch (error) {
            console.error('Error saving ward:', error);
            let finalError = 'Failed to save ward.';
            if (error.response && error.response.status === 500 && error.response.data && error.response.data.message && error.response.data.message.includes('ward_number')) {
                finalError = 'Ward Number must be unique.';
            }
            setError(finalError);
            toast.error(finalError);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this ward?')) {
            try {
                await axios.delete(`/api/wards/${id}`);
                fetchWards();
                toast.success('Ward deleted successfully');
            } catch (error) {
                console.error('Error deleting ward:', error);
                toast.error('Failed to delete ward');
            }
        }
    };

    const handleOpenModal = (ward = null) => {
        setError('');
        if (ward) {
            setCurrentWard(ward);
            setFormData({
                wardNumber: ward.wardNumber,
                wardName: ward.wardName,
                areaName: ward.areaName || '',
                wardBoundary: ward.wardBoundary || '',
                population: ward.population || '',
                assignedOfficer: ward.assignedOfficer || '',
                status: ward.status
            });
        } else {
            setCurrentWard(null);
            setFormData({
                wardNumber: '',
                wardName: '',
                areaName: '',
                wardBoundary: '',
                population: '',
                assignedOfficer: '',
                status: 'ACTIVE'
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentWard(null);
        setError('');
    };

    return (
        <div>
            <div className="page-header">
                <h1>Ward Management</h1>
                <button className="btn-primary" onClick={() => handleOpenModal()}>
                    <Plus size={18} /> Add Ward
                </button>
            </div>

            {error && !isModalOpen && (
                <div style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
                    {error}
                </div>
            )}

            <div className="glass-panel table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Ward No</th>
                            <th>Name</th>
                            <th>Area</th>
                            <th>Officer</th>
                            <th>Population</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentWards.map((ward) => (
                            <tr key={ward.id}>
                                <td>{ward.wardNumber}</td>
                                <td>{ward.wardName}</td>
                                <td>{ward.areaName || '-'}</td>
                                <td>{ward.assignedOfficer || '-'}</td>
                                <td>{ward.population}</td>
                                <td>
                                    <span className={`badge ${ward.status === 'ACTIVE' ? 'active' : 'inactive'}`}>
                                        {ward.status}
                                    </span>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button onClick={() => fetchWardCitizens(ward)} className="btn-icon" title="View Citizens" style={{ color: '#6366f1' }}>
                                            <Users size={18} />
                                        </button>
                                        <button onClick={() => handleOpenModal(ward)} className="btn-icon edit">
                                            <Edit2 size={18} />
                                        </button>
                                        <button onClick={() => handleDelete(ward.id)} className="btn-icon delete">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            {Math.ceil(wards.length / wardsPerPage) > 1 && (
                <div className="pagination" style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1rem' }}>
                    <button
                        className="btn-primary"
                        style={{ padding: '0.5rem 1rem' }}
                        onClick={() => paginate(currentPage - 1)}
                        disabled={currentPage === 1}
                    >
                        Previous
                    </button>
                    {Array.from({ length: Math.ceil(wards.length / wardsPerPage) }, (_, i) => i + 1)
                        .filter(page => Math.abs(currentPage - page) <= 1 || page === 1 || page === Math.ceil(wards.length / wardsPerPage))
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
                        disabled={currentPage === Math.ceil(wards.length / wardsPerPage)}
                    >
                        Next
                    </button>
                </div>
            )}

            {/* Citizen List Modal */}
            {viewCitizensModalOpen && selectedWardForView && (
                <div className="modal-overlay">
                    <div className="glass-panel modal-content" style={{ maxWidth: '800px', width: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2>Citizens of Ward {selectedWardForView.wardNumber}</h2>
                            <button onClick={() => setViewCitizensModalOpen(false)} className="modal-close btn-icon">
                                <X size={24} />
                            </button>
                        </div>
                        {wardCitizensLoading ? (
                            <p>Loading citizens...</p>
                        ) : wardCitizens.length > 0 ? (
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                        <th style={{ padding: '0.5rem' }}>Name</th>
                                        <th style={{ padding: '0.5rem' }}>Age</th>
                                        <th style={{ padding: '0.5rem' }}>Gender</th>
                                        <th style={{ padding: '0.5rem' }}>Mobile</th>
                                        <th style={{ padding: '0.5rem' }}>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {wardCitizens.map(citizen => (
                                        <tr key={citizen.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                            <td style={{ padding: '0.5rem' }}>{citizen.fullName}</td>
                                            <td style={{ padding: '0.5rem' }}>{citizen.age}</td>
                                            <td style={{ padding: '0.5rem' }}>{citizen.gender}</td>
                                            <td style={{ padding: '0.5rem' }}>{citizen.mobileNumber}</td>
                                            <td style={{ padding: '0.5rem' }}>
                                                <span className={`badge ${citizen.status === 'ACTIVE' ? 'active' : 'inactive'}`} style={{ fontSize: '0.75rem' }}>
                                                    {citizen.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem' }}>No citizens found in this ward.</p>
                        )}
                    </div>
                </div>
            )}

            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="glass-panel modal-content">
                        <button onClick={handleCloseModal} className="modal-close btn-icon">
                            <X size={24} />
                        </button>
                        <h2 style={{ marginBottom: '1.5rem' }}>{currentWard ? 'Edit Ward' : 'Add New Ward'}</h2>

                        {error && (
                            <div style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', padding: '0.75rem', borderRadius: '6px', marginBottom: '1rem', fontSize: '0.875rem' }}>
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Ward Number</label>
                                    <input
                                        type="number"
                                        name="wardNumber"
                                        value={formData.wardNumber}
                                        onChange={handleInputChange}
                                        className="glass-input"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Ward Name</label>
                                    <input
                                        type="text"
                                        name="wardName"
                                        value={formData.wardName}
                                        onChange={handleInputChange}
                                        className="glass-input"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Area Name</label>
                                    <input
                                        type="text"
                                        name="areaName"
                                        value={formData.areaName}
                                        onChange={handleInputChange}
                                        className="glass-input"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Assigned Officer</label>
                                    <input
                                        type="text"
                                        name="assignedOfficer"
                                        value={formData.assignedOfficer}
                                        onChange={handleInputChange}
                                        className="glass-input"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Boundary Description</label>
                                <textarea
                                    name="wardBoundary"
                                    value={formData.wardBoundary}
                                    onChange={handleInputChange}
                                    className="glass-input"
                                    rows="2"
                                />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Population</label>
                                    <input
                                        type="number"
                                        name="population"
                                        value={formData.population}
                                        onChange={handleInputChange}
                                        className="glass-input"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Status</label>
                                    <select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleInputChange}
                                        className="glass-input"
                                        style={{ height: '46px' }}
                                    >
                                        <option value="ACTIVE">Active</option>
                                        <option value="INACTIVE">Inactive</option>
                                    </select>
                                </div>
                            </div>

                            <button type="submit" className="btn-primary" style={{ marginTop: '1rem', width: '100%' }}>
                                {currentWard ? 'Update Ward' : 'Create Ward'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WardManagement;
