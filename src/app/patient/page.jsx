'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PatientForm from '@/components/PatientForm';
import OPDSlip from '@/components/OPDSlip';

// Mock data generator for OPD slip
const generateOPDSlip = (formData) => {
    // Simple priority logic based on keywords in symptoms
    const symptomLower = formData.symptoms.toLowerCase();
    let priority = 'Low';
    if (symptomLower.includes('chest') || symptomLower.includes('breathing') || symptomLower.includes('severe') || symptomLower.includes('emergency')) {
        priority = 'High';
    } else if (symptomLower.includes('pain') || symptomLower.includes('fever') || symptomLower.includes('infection')) {
        priority = 'Medium';
    }

    // Determine department based on symptoms
    let department = 'General Medicine';
    if (symptomLower.includes('heart') || symptomLower.includes('chest')) {
        department = 'Cardiology';
    } else if (symptomLower.includes('bone') || symptomLower.includes('joint') || symptomLower.includes('fracture')) {
        department = 'Orthopedics';
    } else if (symptomLower.includes('skin') || symptomLower.includes('rash')) {
        department = 'Dermatology';
    } else if (symptomLower.includes('ear') || symptomLower.includes('throat') || symptomLower.includes('nose')) {
        department = 'ENT';
    }

    // Generate random token
    const tokenNumber = Math.floor(100 + Math.random() * 900);

    // Calculate ETA based on priority
    const baseWait = priority === 'High' ? 10 : priority === 'Medium' ? 25 : 45;
    const now = new Date();
    now.setMinutes(now.getMinutes() + baseWait);
    const eta = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    return {
        tokenNumber,
        name: formData.name,
        age: formData.age,
        priority,
        department,
        eta
    };
};

export default function PatientPortal() {
    const [opdSlip, setOpdSlip] = useState(null);

    const handleFormSubmit = (formData) => {
        const slip = generateOPDSlip(formData);
        setOpdSlip(slip);
    };

    const handleNewRegistration = () => {
        setOpdSlip(null);
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Header />

            <div className="page-header">
                <div className="container">
                    <h1>Patient Portal</h1>
                    <p>Register for OPD consultation and receive your digital token</p>
                </div>
            </div>

            <main className="container" style={{ flex: 1, padding: 'var(--space-2xl) var(--space-lg)' }}>
                <div style={{ maxWidth: '500px', margin: '0 auto' }}>
                    {!opdSlip ? (
                        <PatientForm onSubmit={handleFormSubmit} />
                    ) : (
                        <div>
                            <OPDSlip data={opdSlip} />
                            <div style={{ marginTop: 'var(--space-xl)', textAlign: 'center' }}>
                                <p style={{ marginBottom: 'var(--space-md)', fontSize: '14px', color: 'var(--color-text-secondary)' }}>
                                    Please save this token and arrive before your estimated time.
                                </p>
                                <button
                                    onClick={handleNewRegistration}
                                    className="btn btn-secondary"
                                >
                                    New Registration
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
}
