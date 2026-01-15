'use client';

import { useState, useRef } from 'react';

function PatientForm({ onSubmit, isLoading }) {
    const [formData, setFormData] = useState({
        name: '',
        age: '',
        gender: 'male',
        phone: '',
        visitType: 'new',
        oldPatientId: '',
        previousVisitDate: '',
        symptoms: '',
        chronicConditions: '',
        currentMedications: '',
        allergies: '',
        emergencyContactName: '',
        emergencyContactPhone: '',
        referralDoctor: ''
    });

    const [errors, setErrors] = useState({});
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [uploadingFile, setUploadingFile] = useState(false);
    const fileInputRef = useRef(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleFileSelect = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        setUploadingFile(true);

        for (const file of files) {
            // Validate file type
            const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
            if (!validTypes.includes(file.type)) {
                alert(`Invalid file type: ${file.name}. Please upload JPG, PNG, or PDF files.`);
                continue;
            }

            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert(`File too large: ${file.name}. Maximum size is 5MB.`);
                continue;
            }

            // Convert to base64
            const base64 = await fileToBase64(file);

            setUploadedFiles(prev => [...prev, {
                id: Date.now() + Math.random(),
                name: file.name,
                type: file.type,
                size: file.size,
                base64: base64,
                preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null
            }]);
        }

        setUploadingFile(false);
        // Reset input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const fileToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                // Remove the data URL prefix to get pure base64
                const base64 = reader.result.split(',')[1];
                resolve(base64);
            };
            reader.onerror = error => reject(error);
        });
    };

    const removeFile = (fileId) => {
        setUploadedFiles(prev => {
            const file = prev.find(f => f.id === fileId);
            if (file?.preview) {
                URL.revokeObjectURL(file.preview);
            }
            return prev.filter(f => f.id !== fileId);
        });
    };

    const formatFileSize = (bytes) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Full name is required';
        }
        if (!formData.age || formData.age < 0 || formData.age > 120) {
            newErrors.age = 'Please enter a valid age (0-120)';
        }
        if (!formData.phone.trim()) {
            newErrors.phone = 'Phone number is required';
        } else if (!/^[0-9]{10}$/.test(formData.phone.replace(/\D/g, ''))) {
            newErrors.phone = 'Please enter a valid 10-digit phone number';
        }
        if (!formData.symptoms.trim()) {
            newErrors.symptoms = 'Please describe your symptoms';
        }
        if (formData.visitType === 'followup' && !formData.oldPatientId.trim()) {
            newErrors.oldPatientId = 'Previous patient ID is required for follow-up';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validate()) {
            // Build patient input object with uploaded documents
            const patientData = {
                name: formData.name.trim(),
                age: parseInt(formData.age),
                symptoms: formData.symptoms.trim(),
                phone: formData.phone.trim(),
                gender: formData.gender,
                visitType: formData.visitType,
                ...(formData.visitType === 'followup' && {
                    oldPatientId: formData.oldPatientId.trim(),
                    previousVisitDate: formData.previousVisitDate
                }),
                chronicConditions: formData.chronicConditions.trim() || undefined,
                currentMedications: formData.currentMedications.trim() || undefined,
                allergies: formData.allergies.trim() || undefined,
                ...(formData.emergencyContactName && {
                    emergencyContact: {
                        name: formData.emergencyContactName.trim(),
                        phone: formData.emergencyContactPhone.trim()
                    }
                }),
                referralDoctor: formData.referralDoctor.trim() || undefined,
                // Include uploaded documents
                documents: uploadedFiles.map(f => ({
                    name: f.name,
                    mimeType: f.type,
                    base64Data: f.base64
                }))
            };
            onSubmit(patientData);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="patient-form">
            {/* Hospital Header */}
            <div className="form-hospital-header">
                <div className="hospital-emblem">🏥</div>
                <div className="hospital-info">
                    <h2>Government District Hospital</h2>
                    <p>OPD Patient Registration</p>
                </div>
            </div>

            {/* Personal Information Section */}
            <div className="form-section">
                <h3 className="form-section-title">
                    <span className="section-icon">👤</span>
                    Personal Information
                </h3>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="name" className="form-label">
                            Full Name <span className="required">*</span>
                        </label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            className={`form-input ${errors.name ? 'input-error' : ''}`}
                            placeholder="Enter patient's full name"
                            value={formData.name}
                            onChange={handleChange}
                        />
                        {errors.name && <span className="error-text">{errors.name}</span>}
                    </div>
                </div>

                <div className="form-row form-row-3">
                    <div className="form-group">
                        <label htmlFor="age" className="form-label">
                            Age <span className="required">*</span>
                        </label>
                        <input
                            type="number"
                            id="age"
                            name="age"
                            className={`form-input ${errors.age ? 'input-error' : ''}`}
                            placeholder="Years"
                            min="0"
                            max="120"
                            value={formData.age}
                            onChange={handleChange}
                        />
                        {errors.age && <span className="error-text">{errors.age}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="gender" className="form-label">
                            Gender <span className="required">*</span>
                        </label>
                        <select
                            id="gender"
                            name="gender"
                            className="form-input"
                            value={formData.gender}
                            onChange={handleChange}
                        >
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="phone" className="form-label">
                            Phone <span className="required">*</span>
                        </label>
                        <input
                            type="tel"
                            id="phone"
                            name="phone"
                            className={`form-input ${errors.phone ? 'input-error' : ''}`}
                            placeholder="10-digit number"
                            value={formData.phone}
                            onChange={handleChange}
                        />
                        {errors.phone && <span className="error-text">{errors.phone}</span>}
                    </div>
                </div>
            </div>

            {/* Visit Type Section */}
            <div className="form-section">
                <h3 className="form-section-title">
                    <span className="section-icon">📋</span>
                    Visit Type
                </h3>

                <div className="visit-type-selector">
                    <label className={`visit-type-option ${formData.visitType === 'new' ? 'active' : ''}`}>
                        <input
                            type="radio"
                            name="visitType"
                            value="new"
                            checked={formData.visitType === 'new'}
                            onChange={handleChange}
                        />
                        <span className="visit-type-label">
                            <span className="visit-icon">🆕</span>
                            New Patient
                        </span>
                    </label>
                    <label className={`visit-type-option ${formData.visitType === 'followup' ? 'active' : ''}`}>
                        <input
                            type="radio"
                            name="visitType"
                            value="followup"
                            checked={formData.visitType === 'followup'}
                            onChange={handleChange}
                        />
                        <span className="visit-type-label">
                            <span className="visit-icon">🔄</span>
                            Follow-up Visit
                        </span>
                    </label>
                </div>

                {formData.visitType === 'followup' && (
                    <div className="followup-fields">
                        <div className="form-row form-row-2">
                            <div className="form-group">
                                <label htmlFor="oldPatientId" className="form-label">
                                    Previous Patient ID <span className="required">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="oldPatientId"
                                    name="oldPatientId"
                                    className={`form-input ${errors.oldPatientId ? 'input-error' : ''}`}
                                    placeholder="Enter your previous ID"
                                    value={formData.oldPatientId}
                                    onChange={handleChange}
                                />
                                {errors.oldPatientId && <span className="error-text">{errors.oldPatientId}</span>}
                            </div>
                            <div className="form-group">
                                <label htmlFor="previousVisitDate" className="form-label">
                                    Last Visit Date
                                </label>
                                <input
                                    type="date"
                                    id="previousVisitDate"
                                    name="previousVisitDate"
                                    className="form-input"
                                    value={formData.previousVisitDate}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Symptoms Section */}
            <div className="form-section">
                <h3 className="form-section-title">
                    <span className="section-icon">🩺</span>
                    Current Symptoms
                </h3>

                <div className="form-group">
                    <label htmlFor="symptoms" className="form-label">
                        Describe your symptoms <span className="required">*</span>
                    </label>
                    <textarea
                        id="symptoms"
                        name="symptoms"
                        className={`form-textarea ${errors.symptoms ? 'input-error' : ''}`}
                        placeholder="Please describe your symptoms in detail..."
                        value={formData.symptoms}
                        onChange={handleChange}
                        rows={3}
                    />
                    {errors.symptoms && <span className="error-text">{errors.symptoms}</span>}
                </div>
            </div>

            {/* Medical Documents Upload Section */}
            <div className="form-section">
                <h3 className="form-section-title">
                    <span className="section-icon">📄</span>
                    Medical Documents
                    <span className="section-optional">(Upload for AI-powered analysis)</span>
                </h3>

                <div className="upload-area">
                    <input
                        ref={fileInputRef}
                        type="file"
                        id="documents"
                        accept="image/jpeg,image/png,image/jpg,application/pdf"
                        multiple
                        onChange={handleFileSelect}
                        className="file-input-hidden"
                    />
                    <label htmlFor="documents" className="upload-label">
                        <div className="upload-icon">📤</div>
                        <div className="upload-text">
                            <strong>Click to upload</strong> or drag and drop
                        </div>
                        <div className="upload-hint">
                            Lab reports, prescriptions, past records (JPG, PNG, PDF up to 5MB)
                        </div>
                    </label>
                </div>

                {uploadingFile && (
                    <div className="upload-progress">
                        <span className="spinner"></span> Processing file...
                    </div>
                )}

                {uploadedFiles.length > 0 && (
                    <div className="uploaded-files">
                        {uploadedFiles.map(file => (
                            <div key={file.id} className="file-item">
                                <div className="file-preview">
                                    {file.preview ? (
                                        <img src={file.preview} alt={file.name} />
                                    ) : (
                                        <span className="file-icon">📄</span>
                                    )}
                                </div>
                                <div className="file-info">
                                    <span className="file-name">{file.name}</span>
                                    <span className="file-size">{formatFileSize(file.size)}</span>
                                </div>
                                <button
                                    type="button"
                                    className="file-remove"
                                    onClick={() => removeFile(file.id)}
                                >
                                    ✕
                                </button>
                            </div>
                        ))}
                        <p className="ai-note">
                            🤖 AI will analyze these documents for medical history
                        </p>
                    </div>
                )}
            </div>

            {/* Medical History Section */}
            <div className="form-section">
                <h3 className="form-section-title">
                    <span className="section-icon">📒</span>
                    Medical History
                    <span className="section-optional">(Optional)</span>
                </h3>

                <div className="form-group">
                    <label htmlFor="chronicConditions" className="form-label">
                        Chronic Conditions
                    </label>
                    <input
                        type="text"
                        id="chronicConditions"
                        name="chronicConditions"
                        className="form-input"
                        placeholder="e.g., Diabetes, Hypertension, Asthma"
                        value={formData.chronicConditions}
                        onChange={handleChange}
                    />
                </div>

                <div className="form-row form-row-2">
                    <div className="form-group">
                        <label htmlFor="currentMedications" className="form-label">
                            Current Medications
                        </label>
                        <input
                            type="text"
                            id="currentMedications"
                            name="currentMedications"
                            className="form-input"
                            placeholder="e.g., Metformin 500mg"
                            value={formData.currentMedications}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="allergies" className="form-label">
                            Known Allergies
                        </label>
                        <input
                            type="text"
                            id="allergies"
                            name="allergies"
                            className="form-input"
                            placeholder="e.g., Penicillin, Sulfa"
                            value={formData.allergies}
                            onChange={handleChange}
                        />
                    </div>
                </div>
            </div>

            {/* Emergency Contact Section */}
            <div className="form-section">
                <h3 className="form-section-title">
                    <span className="section-icon">📞</span>
                    Emergency Contact
                    <span className="section-optional">(Optional)</span>
                </h3>

                <div className="form-row form-row-2">
                    <div className="form-group">
                        <label htmlFor="emergencyContactName" className="form-label">
                            Contact Name
                        </label>
                        <input
                            type="text"
                            id="emergencyContactName"
                            name="emergencyContactName"
                            className="form-input"
                            placeholder="Emergency contact name"
                            value={formData.emergencyContactName}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="emergencyContactPhone" className="form-label">
                            Contact Phone
                        </label>
                        <input
                            type="tel"
                            id="emergencyContactPhone"
                            name="emergencyContactPhone"
                            className="form-input"
                            placeholder="Emergency contact phone"
                            value={formData.emergencyContactPhone}
                            onChange={handleChange}
                        />
                    </div>
                </div>
            </div>

            {/* Referral Section */}
            <div className="form-section">
                <h3 className="form-section-title">
                    <span className="section-icon">👨‍⚕️</span>
                    Referral Information
                    <span className="section-optional">(Optional)</span>
                </h3>

                <div className="form-group">
                    <label htmlFor="referralDoctor" className="form-label">
                        Referring Doctor (if any)
                    </label>
                    <input
                        type="text"
                        id="referralDoctor"
                        name="referralDoctor"
                        className="form-input"
                        placeholder="Name of the referring doctor"
                        value={formData.referralDoctor}
                        onChange={handleChange}
                    />
                </div>
            </div>

            {/* Submit Button */}
            <button
                type="submit"
                className="btn btn-primary btn-submit"
                disabled={isLoading}
            >
                {isLoading ? (
                    <>
                        <span className="spinner"></span>
                        {uploadedFiles.length > 0 ? 'Analyzing Documents...' : 'Processing...'}
                    </>
                ) : (
                    <>
                        <span className="btn-icon">🎫</span>
                        Generate OPD Token
                    </>
                )}
            </button>

            <p className="form-footer-note">
                <span className="required">*</span> Required fields
            </p>
        </form>
    );
}

export default PatientForm;
