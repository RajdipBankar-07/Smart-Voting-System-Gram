import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { User, MapPin, Phone, CreditCard, Upload, Send, ArrowLeft, Camera, Lock } from 'lucide-react';

const Register = () => {
    const navigate = useNavigate();
    const [wards, setWards] = useState([]);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        fullName: '',
        birthDate: '',
        address: '',
        aadharNumber: '',
        mobileNumber: '',
        gender: '',
        wardNumber: '',
        voterId: '',
        username: '',
        password: ''
    });

    const [files, setFiles] = useState({
        photo: null,
        aadharCard: null,
        voterIdCard: null
    });

    const [previews, setPreviews] = useState({
        photo: null
    });

    useEffect(() => {
        const fetchWards = async () => {
            try {
                const res = await axios.get('/api/wards');
                setWards(res.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchWards();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        const { name, files: inputFiles } = e.target;
        if (inputFiles && inputFiles[0]) {
            setFiles({ ...files, [name]: inputFiles[0] });
            if (name === 'photo') {
                setPreviews({ ...previews, photo: URL.createObjectURL(inputFiles[0]) });
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const data = new FormData();
        const citizenJson = JSON.stringify({
            fullName: formData.fullName,
            birthDate: formData.birthDate,
            address: formData.address,
            aadharNumber: formData.aadharNumber,
            mobileNumber: formData.mobileNumber,
            gender: formData.gender,
            voterId: formData.voterId,
            username: formData.username,
            password: formData.password
        });

        data.append('citizen', citizenJson);
        data.append('wardNumber', formData.wardNumber);
        data.append('photo', files.photo);
        data.append('aadharCard', files.aadharCard);
        data.append('voterIdCard', files.voterIdCard);

        try {
            await axios.post('/api/citizens/upload', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success("Registration request submitted! Please wait for Admin approval.");
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || "Registration failed. Please check your details.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container" style={{ minHeight: '100vh', padding: '2rem 1rem' }}>
            <div className="glass-panel" style={{ maxWidth: '800px', width: '100%', padding: '2.5rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <h1 style={{ fontSize: '2.2rem', marginBottom: '0.5rem' }}>Citizen Registration</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Register your identity to access SmartGram services</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                        {/* Section 1: Basic Info */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <h3 style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>Personal Details</h3>

                            <div className="form-group">
                                <label className="form-label"><User size={16} /> Full Name</label>
                                <input name="fullName" value={formData.fullName} onChange={handleChange} className="glass-input" required placeholder="Enter your full name" />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Date of Birth</label>
                                    <input type="date" name="birthDate" value={formData.birthDate} onChange={handleChange} className="glass-input" required />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Gender</label>
                                    <select name="gender" value={formData.gender} onChange={handleChange} className="glass-input" required>
                                        <option value="">Select</option>
                                        <option value="MALE">Male</option>
                                        <option value="FEMALE">Female</option>
                                        <option value="OTHER">Other</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label"><MapPin size={16} /> Residential Address</label>
                                <textarea name="address" value={formData.address} onChange={handleChange} className="glass-input" required placeholder="Full residential address" style={{ height: '80px', resize: 'none' }} />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Select Your Ward</label>
                                <select name="wardNumber" value={formData.wardNumber} onChange={handleChange} className="glass-input" required>
                                    <option value="">Choose Ward...</option>
                                    {wards.map(w => (
                                        <option key={w.id} value={w.wardNumber}>Ward {w.wardNumber} - {w.wardName}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Section 2: Identity & Docs */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <h3 style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>Identity Verification</h3>

                            <div className="form-group">
                                <label className="form-label"><CreditCard size={16} /> Aadhaar Number</label>
                                <input name="aadharNumber" value={formData.aadharNumber} onChange={handleChange} className="glass-input" required placeholder="12-digit Aadhaar number" />
                            </div>

                            <div className="form-group">
                                <label className="form-label"><CreditCard size={16} /> Voter ID (EPIC) Number</label>
                                <input name="voterId" value={formData.voterId} onChange={handleChange} className="glass-input" required placeholder="Voter ID number" />
                            </div>

                            <div className="form-group">
                                <label className="form-label"><Phone size={16} /> Mobile Number</label>
                                <input name="mobileNumber" value={formData.mobileNumber} onChange={handleChange} className="glass-input" required placeholder="Your active mobile number" />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label"><User size={16} /> Choose Username</label>
                                    <input name="username" value={formData.username} onChange={handleChange} className="glass-input" required placeholder="Pick a username" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label"><Lock size={16} /> Choose Password</label>
                                    <input type="password" name="password" value={formData.password} onChange={handleChange} className="glass-input" required placeholder="Create password" />
                                </div>
                            </div>

                            <div style={{ marginTop: '0.5rem' }}>
                                <label className="form-label"><Camera size={16} /> Identity Documents</label>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginTop: '0.5rem' }}>
                                    <label className="upload-box" style={{
                                        height: '100px',
                                        background: files.photo ? 'rgba(0,255,0,0.05)' : 'rgba(255,255,255,0.05)',
                                        borderColor: files.photo ? 'var(--primary)' : 'rgba(255,255,255,0.1)'
                                    }}>
                                        <input type="file" name="photo" onChange={handleFileChange} accept="image/*" hidden required />
                                        {previews.photo ? (
                                            <img src={previews.photo} alt="profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <div style={{ textAlign: 'center' }}>
                                                <Camera size={20} style={{ opacity: 0.5 }} />
                                                <div style={{ fontSize: '0.6rem', marginTop: '0.2rem' }}>Photo</div>
                                            </div>
                                        )}
                                    </label>

                                    <label className="upload-box" style={{
                                        height: '100px',
                                        background: files.aadharCard ? 'rgba(0,255,0,0.05)' : 'rgba(255,255,255,0.05)',
                                        borderColor: files.aadharCard ? 'var(--primary)' : 'rgba(255,255,255,0.1)'
                                    }}>
                                        <input type="file" name="aadharCard" onChange={handleFileChange} accept="image/*,application/pdf" hidden required />
                                        <div style={{ textAlign: 'center' }}>
                                            <Upload size={20} style={{ opacity: 0.5 }} />
                                            <div style={{ fontSize: '0.6rem', marginTop: '0.2rem' }}>Aadhaar</div>
                                            {files.aadharCard && <div style={{ fontSize: '0.5rem', color: 'var(--primary)' }}>Ready</div>}
                                        </div>
                                    </label>

                                    <label className="upload-box" style={{
                                        height: '100px',
                                        background: files.voterIdCard ? 'rgba(0,255,0,0.05)' : 'rgba(255,255,255,0.05)',
                                        borderColor: files.voterIdCard ? 'var(--primary)' : 'rgba(255,255,255,0.1)'
                                    }}>
                                        <input type="file" name="voterIdCard" onChange={handleFileChange} accept="image/*,application/pdf" hidden required />
                                        <div style={{ textAlign: 'center' }}>
                                            <Upload size={20} style={{ opacity: 0.5 }} />
                                            <div style={{ fontSize: '0.6rem', marginTop: '0.2rem' }}>Voter ID</div>
                                            {files.voterIdCard && <div style={{ fontSize: '0.5rem', color: 'var(--primary)' }}>Ready</div>}
                                        </div>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style={{ marginTop: '3rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <Link to="/login" className="btn-secondary" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <ArrowLeft size={18} /> Back to Login
                        </Link>
                        <button type="submit" className="btn-primary" style={{ flex: 1, padding: '1rem' }} disabled={loading}>
                            {loading ? 'Processing...' : (
                                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                    <Send size={18} /> Submit Registration for Approval
                                </span>
                            )}
                        </button>
                    </div>
                </form>
            </div>

            <style>{`
                .upload-box {
                    border: 2px dashed rgba(255,255,255,0.1);
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    overflow: hidden;
                }
                .upload-box:hover {
                    border-color: var(--primary);
                    background: rgba(255,255,255,0.05);
                }
            `}</style>
        </div>
    );
};

export default Register;
