import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Plus, Edit2, Trash2, X, Search, Filter, Eye, Shield, User } from 'lucide-react';

const CitizenManagement = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [citizens, setCitizens] = useState([]);
    const [wards, setWards] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentCitizen, setCurrentCitizen] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedWardFilter, setSelectedWardFilter] = useState('');
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [viewCitizen, setViewCitizen] = useState(null);

    const [error, setError] = useState('');
    const [page, setPage] = useState(1); // Fallback LOCAL state if needed, but we rely on params

    // itemsPerPage
    const itemsPerPage = 10;

    // Initialize currentPage from URL param 'page', default to 1
    const [currentPage, setCurrentPage] = useState(() => {
        const p = searchParams.get('page');
        return p ? parseInt(p, 10) : 1;
    });

    const [formData, setFormData] = useState({
        fullName: '',
        birthDate: '',
        address: '',
        aadharNumber: '',
        mobileNumber: '',
        gender: 'MALE',
        wardId: '',
        citizenId: '',
        voterId: '',
        familyId: '',
        status: 'ACTIVE'
    });

    const [files, setFiles] = useState({
        photo: null,
        aadharCard: null,
        voterIdCard: null
    });

    const handleFileChange = (e) => {
        setFiles({ ...files, [e.target.name]: e.target.files[0] });
    };

    useEffect(() => {
        fetchCitizens();
        fetchWards();
    }, []);

    const fetchCitizens = async () => {
        try {
            const response = await axios.get('/api/citizens');
            setCitizens(response.data);
            setError('');
        } catch (error) {
            console.error('Error fetching citizens:', error);
            setError('Failed to fetch citizens');
        }
    };

    const fetchWards = async () => {
        try {
            const response = await axios.get('/api/wards');
            setWards(response.data);
        } catch (error) {
            console.error('Error fetching wards:', error);
        }
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const checkDuplicate = () => {
        const duplicateAadhar = citizens.find(c =>
            c.aadharNumber === formData.aadharNumber &&
            (!currentCitizen || c.id !== currentCitizen.id)
        );
        if (duplicateAadhar) return 'Citizen with this Aadhar Number already exists.';

        const duplicateMobile = citizens.find(c =>
            c.mobileNumber === formData.mobileNumber &&
            (!currentCitizen || c.id !== currentCitizen.id)
        );
        if (duplicateMobile) return 'Citizen with this Mobile Number already exists.';

        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const duplicateError = checkDuplicate();
        if (duplicateError) {
            setError(duplicateError);
            return;
        }

        try {
            const citizenObj = {
                ...formData,
                ward: { id: formData.wardId },
                citizenId: formData.citizenId || null,
                voterId: formData.voterId || null,
                familyId: formData.familyId || null
            };

            const data = new FormData();
            data.append('citizen', JSON.stringify(citizenObj));
            if (formData.wardId) data.append('wardNumber', wards.find(w => w.id.toString() === formData.wardId.toString())?.wardNumber);

            if (files.photo) data.append('photo', files.photo);
            if (files.aadharCard) data.append('aadharCard', files.aadharCard);
            if (files.voterIdCard) data.append('voterIdCard', files.voterIdCard);

            const config = {
                headers: { 'Content-Type': 'multipart/form-data' }
            };

            if (currentCitizen) {
                await axios.post(`/api/citizens/update-full/${currentCitizen.id}`, data, config);
                toast.success('Citizen updated successfully!');
            } else {
                await axios.post('/api/citizens/upload', data, config);
                toast.success('Citizen added successfully!');
            }
            fetchCitizens();
            handleCloseModal();
        } catch (error) {
            console.error('Error saving citizen:', error);
            const data = error.response?.data;
            const serverMessage = data?.error || data?.message || data;

            let finalError = 'Failed to save citizen.';
            if (serverMessage && typeof serverMessage === 'string') {
                if (serverMessage.toLowerCase().includes('aadhar')) finalError = 'Aadhar Number already exists!';
                else if (serverMessage.toLowerCase().includes('mobile')) finalError = 'Mobile Number already exists!';
                else finalError = serverMessage;
            }

            setError(finalError);
            toast.error(finalError);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this citizen?')) {
            try {
                await axios.delete(`/api/citizens/${id}`);
                fetchCitizens();
                toast.success('Citizen deleted successfully');
            } catch (error) {
                console.error('Error deleting citizen:', error);
                toast.error('Failed to delete citizen');
            }
        }
    };

    const handleOpenModal = (citizen = null) => {
        setError('');
        setFiles({
            photo: null,
            aadharCard: null,
            voterIdCard: null
        });
        if (citizen) {
            setCurrentCitizen(citizen);
            setFormData({
                fullName: citizen.fullName,
                birthDate: citizen.birthDate,
                address: citizen.address,
                aadharNumber: citizen.aadharNumber,
                mobileNumber: citizen.mobileNumber || '',
                gender: citizen.gender,
                wardId: citizen.ward ? citizen.ward.id : '',
                citizenId: citizen.citizenId || '',
                voterId: citizen.voterId || '',
                familyId: citizen.familyId || '',
                status: citizen.status
            });
        } else {
            setCurrentCitizen(null);
            setFormData({
                fullName: '',
                birthDate: '',
                address: '',
                aadharNumber: '',
                mobileNumber: '',
                gender: 'MALE',
                // Auto-fill wardId if a filter is selected, otherwise default to first available or empty
                wardId: selectedWardFilter || (wards.length > 0 ? wards[0].id : ''),
                citizenId: '',
                voterId: '',
                familyId: '',
                status: 'ACTIVE'
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentCitizen(null);
        setFiles({ photo: null, aadharCard: null, voterIdCard: null });
        setError('');
    };

    const handleView = (citizen) => {
        setViewCitizen(citizen);
        setIsViewModalOpen(true);
    };

    const handleCloseView = () => {
        setIsViewModalOpen(false);
        setViewCitizen(null);
    };

    const filteredCitizens = citizens
        .filter(c => {
            const matchesSearch = c.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                c.aadharNumber.includes(searchTerm);
            const matchesWard = selectedWardFilter ? (c.ward && c.ward.id.toString() === selectedWardFilter.toString()) : true;
            return matchesSearch && matchesWard;
        })
        .sort((a, b) => b.id - a.id);

    // Pagination Logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredCitizens.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredCitizens.length / itemsPerPage);

    const paginate = (pageNumber) => {
        setCurrentPage(pageNumber);
        setSearchParams(prev => {
            prev.set('page', pageNumber);
            return prev;
        });
    };

    // Handler helpers to reset page
    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
        setSearchParams({ page: 1 });
    };

    const handleFilter = (e) => {
        setSelectedWardFilter(e.target.value);
        setCurrentPage(1);
        setSearchParams({ page: 1 });
    };

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await axios.post('/api/citizens/bulk-upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            const { successCount, failureCount, errors } = response.data;
            alert(`Upload Complete:\nSuccess: ${successCount}\nFailures: ${failureCount}\n\n${errors ? 'Errors: ' + errors : ''}`);
            fetchCitizens(); // Refresh list
        } catch (error) {
            console.error('Upload failed:', error);
            setError('File upload failed.');
        } finally {
            event.target.value = null; // Reset input
        }
    };

    return (
        <div>
            <div className="page-header">
                <h1>Citizen Management</h1>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <label className="btn-primary" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <input type="file" accept=".csv" style={{ display: 'none' }} onChange={handleFileUpload} />
                        Upload CSV
                    </label>
                    <button className="btn-primary" onClick={() => handleOpenModal()}>
                        <Plus size={18} /> Add Citizen
                    </button>
                </div>
            </div>

            {error && !isModalOpen && (
                <div style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
                    {error}
                </div>
            )}

            <div className="glass-panel" style={{ padding: '1rem', marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                    <Search size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                    <input
                        type="text"
                        placeholder="Search by name or Aadhar..."
                        className="glass-input"
                        style={{ paddingLeft: '3rem' }}
                        value={searchTerm}
                        onChange={handleSearch}
                    />
                </div>
                <div style={{ flex: '0 0 250px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Filter size={20} style={{ color: 'var(--text-secondary)' }} />
                    <select
                        className="glass-input"
                        value={selectedWardFilter}
                        onChange={handleFilter}
                    >
                        <option value="">All Wards</option>
                        {wards.map(w => (
                            <option key={w.id} value={w.id}>{w.wardName} ({w.wardNumber})</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="glass-panel table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Aadhar</th>
                            <th>Mobile</th>
                            <th>Ward</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentItems.length > 0 ? (
                            currentItems.map((citizen) => (
                                <tr key={citizen.id}>
                                    <td>{citizen.fullName}</td>
                                    <td>{citizen.maskedAadhar || citizen.aadharNumber}</td>
                                    <td>{citizen.mobileNumber || '-'}</td>
                                    <td>{citizen.ward ? citizen.ward.wardName : 'N/A'}</td>
                                    <td>
                                        <span className={`badge ${citizen.status === 'ACTIVE' ? 'active' : 'inactive'}`}>
                                            {citizen.status}
                                        </span>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button onClick={() => handleView(citizen)} className="btn-icon view" title="View Details">
                                                <Eye size={18} />
                                            </button>
                                            <button onClick={() => handleOpenModal(citizen)} className="btn-icon edit">
                                                <Edit2 size={18} />
                                            </button>
                                            <button onClick={() => handleDelete(citizen.id)} className="btn-icon delete">
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem' }}>
                                    No citizens found matching the criteria.
                                </td>
                            </tr>
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
                    <div className="glass-panel modal-content" style={{ maxWidth: '700px' }}>
                        <button onClick={handleCloseModal} className="modal-close btn-icon">
                            <X size={24} />
                        </button>
                        <h2 style={{ marginBottom: '1.5rem' }}>{currentCitizen ? 'Edit Citizen' : 'Add New Citizen'}</h2>

                        {error && (
                            <div style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', padding: '0.75rem', borderRadius: '6px', marginBottom: '1rem', fontSize: '0.875rem' }}>
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="form-row">
                            <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                <label className="form-label">Full Name</label>
                                <input
                                    type="text"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleInputChange}
                                    className="glass-input"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Aadhar Number</label>
                                <input
                                    type="text"
                                    name="aadharNumber"
                                    value={formData.aadharNumber}
                                    onChange={handleInputChange}
                                    className="glass-input"
                                    required
                                    maxLength="12"
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Mobile Number</label>
                                <input
                                    type="text"
                                    name="mobileNumber"
                                    value={formData.mobileNumber}
                                    onChange={handleInputChange}
                                    className="glass-input"
                                    required
                                    maxLength="10"
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Voter ID (Optional)</label>
                                <input
                                    type="text"
                                    name="voterId"
                                    value={formData.voterId}
                                    onChange={handleInputChange}
                                    className="glass-input"
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Date of Birth</label>
                                <input
                                    type="date"
                                    name="birthDate"
                                    value={formData.birthDate}
                                    onChange={handleInputChange}
                                    className="glass-input"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Gender</label>
                                <select
                                    name="gender"
                                    value={formData.gender}
                                    onChange={handleInputChange}
                                    className="glass-input"
                                    style={{ height: '46px' }}
                                >
                                    <option value="MALE">Male</option>
                                    <option value="FEMALE">Female</option>
                                    <option value="OTHER">Other</option>
                                </select>
                            </div>

                            <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                <label className="form-label">Address</label>
                                <textarea
                                    name="address"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    className="glass-input"
                                    rows="2"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Ward</label>
                                <select
                                    name="wardId"
                                    value={formData.wardId}
                                    onChange={handleInputChange}
                                    className="glass-input"
                                    style={{ height: '46px' }}
                                    required
                                // Disable ward selection if a filter is active to enforce "only under a selected Ward" 
                                // UNLESS editing, or if we want to allow changing it. 
                                // The prompt says "Automatically link". Let's leave it enabled but pre-filled for flexibility, unless strictness is preferred.
                                // Assuming flexibility for now, but pre-filled.
                                >
                                    <option value="">Select Ward</option>
                                    {wards.map(w => (
                                        <option key={w.id} value={w.id}>{w.wardName} ({w.wardNumber})</option>
                                    ))}
                                </select>
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
                                    <option value="MIGRATED">Migrated</option>
                                    <option value="DECEASED">Deceased</option>
                                    <option value="PENDING_APPROVAL">Pending Approval</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Citizen Photo {!currentCitizen && <span style={{ color: '#ef4444' }}>*</span>}</label>
                                <input
                                    type="file"
                                    name="photo"
                                    onChange={handleFileChange}
                                    className="glass-input"
                                    accept="image/*"
                                    required={!currentCitizen}
                                />
                                {currentCitizen && currentCitizen.photoPath && <small style={{ color: 'var(--text-secondary)' }}>Keep empty to retain current photo</small>}
                            </div>

                            <div className="form-group">
                                <label className="form-label">Aadhar Card Image {!currentCitizen && <span style={{ color: '#ef4444' }}>*</span>}</label>
                                <input
                                    type="file"
                                    name="aadharCard"
                                    onChange={handleFileChange}
                                    className="glass-input"
                                    accept="image/*"
                                    required={!currentCitizen}
                                />
                                {currentCitizen && currentCitizen.aadharCardPath && <small style={{ color: 'var(--text-secondary)' }}>Keep empty to retain current image</small>}
                            </div>

                            <div className="form-group">
                                <label className="form-label">Voter ID card image {!currentCitizen && <span style={{ color: '#ef4444' }}>*</span>}</label>
                                <input
                                    type="file"
                                    name="voterIdCard"
                                    onChange={handleFileChange}
                                    className="glass-input"
                                    accept="image/*"
                                    required={!currentCitizen}
                                />
                                {currentCitizen && currentCitizen.voterIdCardPath && <small style={{ color: 'var(--text-secondary)' }}>Keep empty to retain current image</small>}
                            </div>

                            <button type="submit" className="btn-primary" style={{ gridColumn: 'span 2', marginTop: '1rem' }}>
                                {currentCitizen ? 'Confirm Update' : 'Create Citizen'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {isViewModalOpen && viewCitizen && (
                <div className="modal-overlay">
                    <div className="glass-panel modal-content" style={{ maxWidth: '800px', padding: '2.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <User size={28} style={{ color: 'var(--primary-color)' }} />
                                Citizen Full Details
                            </h2>
                            <button onClick={handleCloseView} className="btn-icon">
                                <X size={24} />
                            </button>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2.5rem', marginBottom: '2.5rem' }}>
                            {/* Personal Details Column */}
                            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', color: 'var(--primary-color)' }}>
                                    <Shield size={18} /> Information
                                </h4>
                                <div style={{ display: 'grid', gap: '1rem' }}>
                                    <p style={{ margin: 0 }}><span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.8rem' }}>FULL NAME</span> <strong style={{ fontSize: '1.1rem' }}>{viewCitizen.fullName}</strong></p>
                                    <p style={{ margin: 0 }}><span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.8rem' }}>AADHAR NUMBER (MASKED)</span> <strong>{viewCitizen.maskedAadhar || 'XXXX-XXXX-XXXX'}</strong></p>
                                    <p style={{ margin: 0 }}><span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.8rem' }}>MOBILE NUMBER</span> <strong>{viewCitizen.mobileNumber || 'N/A'}</strong></p>
                                    <p style={{ margin: 0 }}><span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.8rem' }}>DATE OF BIRTH</span> <strong>{viewCitizen.birthDate} ({viewCitizen.age} yrs)</strong></p>
                                    <p style={{ margin: 0 }}><span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.8rem' }}>GENDER</span> <strong>{viewCitizen.gender}</strong></p>
                                    <p style={{ margin: 0 }}><span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.8rem' }}>WARD & ADDRESS</span> <strong>Ward {viewCitizen.ward?.wardNumber}, {viewCitizen.address}</strong></p>
                                    <p style={{ margin: 0 }}><span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.8rem' }}>STATUS</span> <span className={`badge ${viewCitizen.status.toLowerCase().includes('active') ? 'active' : 'inactive'}`} style={{ display: 'inline-block', marginTop: '0.25rem' }}>{viewCitizen.status}</span></p>
                                </div>
                            </div>

                            {/* Documents Preview Column */}
                            <div>
                                <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', color: 'var(--primary-color)' }}>
                                    <Eye size={18} /> Document Previews
                                </h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                    <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>CITIZEN PHOTO</span>
                                        {viewCitizen.photoPath ? (
                                            <img
                                                src={`/api/images/${viewCitizen.photoPath.replace(/\\/g, '/')}`}
                                                alt="Profile"
                                                style={{ width: '100%', height: '100px', objectFit: 'contain', borderRadius: '6px' }}
                                                onClick={() => window.open(`/api/images/${viewCitizen.photoPath.replace(/\\/g, '/')}`, '_blank')}
                                            />
                                        ) : <div style={{ height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555', fontSize: '0.8rem', border: '1px dashed #333', borderRadius: '6px' }}>No Photo Available</div>}
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                        <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                                            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>AADHAAR CARD</span>
                                            {viewCitizen.aadharCardPath ? (
                                                <img
                                                    src={`/api/images/${viewCitizen.aadharCardPath.replace(/\\/g, '/')}`}
                                                    alt="Aadhar"
                                                    style={{ width: '100%', height: '80px', objectFit: 'contain', borderRadius: '6px', cursor: 'pointer' }}
                                                    onClick={() => window.open(`/api/images/${viewCitizen.aadharCardPath.replace(/\\/g, '/')}`, '_blank')}
                                                />
                                            ) : <div style={{ height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555', fontSize: '0.8rem', border: '1px dashed #333', borderRadius: '6px' }}>No Aadhaar Image</div>}
                                        </div>
                                        <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                                            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>VOTER ID CARD</span>
                                            {viewCitizen.voterIdCardPath ? (
                                                <img
                                                    src={`/api/images/${viewCitizen.voterIdCardPath.replace(/\\/g, '/')}`}
                                                    alt="Voter"
                                                    style={{ width: '100%', height: '80px', objectFit: 'contain', borderRadius: '6px', cursor: 'pointer' }}
                                                    onClick={() => window.open(`/api/images/${viewCitizen.voterIdCardPath.replace(/\\/g, '/')}`, '_blank')}
                                                />
                                            ) : <div style={{ height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555', fontSize: '0.8rem', border: '1px dashed #333', borderRadius: '6px' }}>No Voter ID Image</div>}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                            <button className="btn-primary" onClick={handleCloseView} style={{ minWidth: '150px' }}>
                                Close Profile
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CitizenManagement;
