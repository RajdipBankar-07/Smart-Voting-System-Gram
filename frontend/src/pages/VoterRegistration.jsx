import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Upload, Shield, Home } from 'lucide-react';

const VoterRegistration = () => {
    const navigate = useNavigate();
    const [wards, setWards] = useState([]);
    const [formData, setFormData] = useState({
        fullName: '',
        birthDate: '',
        gender: '',
        mobileNumber: '',
        wardNumber: '',
        aadharNumber: '',
        voterId: '',
        address: '',
        vastiName: ''
    });

    const [addressDetails, setAddressDetails] = useState({
        houseNo: '',
        street: '',
        city: '',
        pincode: ''
    });

    const [photo, setPhoto] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);
    const [aadharCard, setAadharCard] = useState(null);
    const [aadharPreview, setAadharPreview] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchWards();

        return () => {
            if (photoPreview) URL.revokeObjectURL(photoPreview);
            if (aadharPreview) URL.revokeObjectURL(aadharPreview);
        };
    }, []);

    const fetchWards = async () => {
        try {
            const response = await axios.get('/api/wards');
            setWards(response.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleAddressChange = (e) => {
        setAddressDetails({ ...addressDetails, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e, setFile, setPreview, label) => {
        const file = e.target.files[0];
        if (file) {
            // Reset error when selecting new file
            setError('');

            const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
            if (!validTypes.includes(file.type)) {
                setError(`${label} must be JPG, JPEG, or PNG.`);
                e.target.value = null; // Reset input
                return;
            }
            if (file.size > 2 * 1024 * 1024) {
                setError(`${label} must be less than 2MB.`);
                e.target.value = null; // Reset input
                return;
            }

            setFile(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // Basic validations
        const birthDate = new Date(formData.birthDate);
        if (isNaN(birthDate.getTime())) {
            setError('Please enter a valid date of birth.');
            return;
        }

        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

        if (age < 18) {
            setError(`Age Restriction: You are ${age} years old. Minimum age required is 18.`);
            return;
        }

        try {
            const data = new FormData();
            const fullAddress = `${addressDetails.houseNo}, ${addressDetails.street}, ${addressDetails.city} - ${addressDetails.pincode}`;

            const citizenJson = {
                fullName: formData.fullName,
                birthDate: formData.birthDate,
                gender: formData.gender,
                mobileNumber: formData.mobileNumber,
                aadharNumber: formData.aadharNumber,
                voterId: formData.voterId,
                address: fullAddress,
                vastiName: addressDetails.street
            };

            data.append('citizen', JSON.stringify(citizenJson));
            data.append('wardNumber', formData.wardNumber);

            if (photo) data.append('photo', photo);
            else { setError("Voter photo is mandatory."); return; }

            if (aadharCard) data.append('aadharCard', aadharCard);
            else { setError("Aadhaar Card image is mandatory."); return; }

            await axios.post('/api/citizens/upload', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setSuccess('Voter Registration Successful! Redirecting to login...');
            setTimeout(() => navigate('/login'), 2000);

        } catch (err) {
            console.error(err);
            const serverMessage = err.response?.data?.message || err.response?.data || 'Registration failed.';
            setError(serverMessage);
        }
    };

    return (
        <div style={{ maxWidth: '800px', margin: '2rem auto' }}>
            <div className="page-header">
                <h1>Voter Registration</h1>
            </div>

            <form onSubmit={handleSubmit} className="glass-panel" style={{ padding: '2rem' }}>
                {error && (
                    <div style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid #ef4444',
                        color: '#ef4444',
                        padding: '1rem',
                        borderRadius: '12px',
                        marginBottom: '1.5rem',
                        textAlign: 'center',
                        animation: 'shake 0.5s ease-in-out'
                    }}>
                        <strong>Error:</strong> {error}
                    </div>
                )}
                {success && (
                    <div style={{
                        background: 'rgba(16, 185, 129, 0.1)',
                        border: '1px solid #10b981',
                        color: '#10b981',
                        padding: '1rem',
                        borderRadius: '12px',
                        marginBottom: '1.5rem',
                        textAlign: 'center'
                    }}>
                        <strong>Success!</strong> {success}
                    </div>
                )}

                {/* 1. Personal Details */}
                <h3 style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <UserPlus size={20} /> Personal Details
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                    <div className="form-group">
                        <label className="form-label">Full Name *</label>
                        <input name="fullName" value={formData.fullName} onChange={handleChange} className="glass-input" required />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Date of Birth *</label>
                        <input type="date" name="birthDate" value={formData.birthDate} onChange={handleChange} className="glass-input" required />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Gender *</label>
                        <select name="gender" value={formData.gender} onChange={handleChange} className="glass-input" required>
                            <option value="">Select Gender</option>
                            <option value="MALE">Male</option>
                            <option value="FEMALE">Female</option>
                            <option value="OTHER">Other</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Mobile Number *</label>
                        <input name="mobileNumber" value={formData.mobileNumber} onChange={handleChange} className="glass-input" required maxLength="10" />
                    </div>
                </div>

                {/* 2. Ward Details */}
                <h3 style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Home size={20} /> Ward Selection
                </h3>
                <div style={{ marginBottom: '2rem' }}>
                    <div className="form-group">
                        <label className="form-label">Ward *</label>
                        <select name="wardNumber" value={formData.wardNumber} onChange={handleChange} className="glass-input" required>
                            <option value="">Select Ward</option>
                            {wards.map(w => (
                                <option key={w.id} value={w.wardNumber}>{w.wardName} ({w.wardNumber})</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* 3. Identity Details */}
                <h3 style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Shield size={20} /> Identity Verification
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                    <div className="form-group">
                        <label className="form-label">Aadhaar Number *</label>
                        <input name="aadharNumber" value={formData.aadharNumber} onChange={handleChange} className="glass-input" required maxLength="12" placeholder="12-digit Aadhaar" />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Voter ID Number *</label>
                        <input name="voterId" value={formData.voterId} onChange={handleChange} className="glass-input" required />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Voter Photo *</label>
                        <div className="file-upload-wrapper" style={{ position: 'relative' }}>
                            <input
                                type="file"
                                onChange={(e) => handleFileChange(e, setPhoto, setPhotoPreview, "Voter Photo")}
                                accept="image/png, image/jpeg, image/jpg"
                                className="glass-input"
                                required
                            />
                            <Upload size={18} style={{ position: 'absolute', right: '10px', top: '12px', pointerEvents: 'none', opacity: 0.7 }} />
                        </div>
                        {photoPreview && (
                            <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                                <img
                                    src={photoPreview}
                                    alt="Voter Preview"
                                    style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '8px', border: '1px solid var(--glass-border)' }}
                                    onError={() => {
                                        setPhotoPreview(null);
                                        setPhoto(null);
                                        setError('Invalid or corrupted image file.');
                                    }}
                                />
                            </div>
                        )}
                    </div>
                    <div className="form-group">
                        <label className="form-label">Aadhaar Card (Front) *</label>
                        <div className="file-upload-wrapper" style={{ position: 'relative' }}>
                            <input
                                type="file"
                                onChange={(e) => handleFileChange(e, setAadharCard, setAadharPreview, "Aadhaar Card")}
                                accept="image/png, image/jpeg, image/jpg"
                                className="glass-input"
                                required
                            />
                            <Upload size={18} style={{ position: 'absolute', right: '10px', top: '12px', pointerEvents: 'none', opacity: 0.7 }} />
                            <small style={{ display: 'block', marginTop: '0.5rem', color: 'var(--text-secondary)' }}>
                                * JPG, JPEG, PNG only and Max 2MB.
                            </small>
                        </div>
                        {aadharPreview && (
                            <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                                <img
                                    src={aadharPreview}
                                    alt="Aadhaar Preview"
                                    style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '8px', border: '1px solid var(--glass-border)' }}
                                    onError={() => {
                                        setAadharPreview(null);
                                        setAadharCard(null);
                                        setError('Invalid or corrupted Aadhaar image.');
                                    }}
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* 4. Address Details */}
                <h3 style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Home size={20} /> Residential Address
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                    <div className="form-group">
                        <label className="form-label">House Number</label>
                        <input name="houseNo" value={addressDetails.houseNo} onChange={handleAddressChange} className="glass-input" required />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Area</label>
                        <input name="street" value={addressDetails.street} onChange={handleAddressChange} className="glass-input" required />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Village / City</label>
                        <input name="city" value={addressDetails.city} onChange={handleAddressChange} className="glass-input" required />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Pincode</label>
                        <input name="pincode" value={addressDetails.pincode} onChange={handleAddressChange} className="glass-input" required maxLength="6" />
                    </div>
                </div>

                <button type="submit" className="btn-primary" style={{ width: '100%', padding: '1rem', fontSize: '1rem' }}>
                    Register Voter
                </button>
            </form>
        </div>
    );
};

export default VoterRegistration;
