'use client';

import { useState } from 'react';

function PatientForm({ onSubmit }) {
    const [formData, setFormData] = useState({
        name: '',
        age: '',
        symptoms: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (formData.name && formData.age && formData.symptoms) {
            onSubmit(formData);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="card">
            <div className="card-header">
                <h3 className="card-title">Patient Registration</h3>
            </div>

            <div className="form-group">
                <label htmlFor="name" className="form-label">Full Name</label>
                <input
                    type="text"
                    id="name"
                    name="name"
                    className="form-input"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                />
            </div>

            <div className="form-group">
                <label htmlFor="age" className="form-label">Age</label>
                <input
                    type="number"
                    id="age"
                    name="age"
                    className="form-input"
                    placeholder="Enter your age"
                    min="1"
                    max="120"
                    value={formData.age}
                    onChange={handleChange}
                    required
                />
            </div>

            <div className="form-group">
                <label htmlFor="symptoms" className="form-label">Symptoms</label>
                <textarea
                    id="symptoms"
                    name="symptoms"
                    className="form-textarea"
                    placeholder="Describe your symptoms in detail..."
                    value={formData.symptoms}
                    onChange={handleChange}
                    required
                />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                Generate OPD Token
            </button>
        </form>
    );
}

export default PatientForm;
