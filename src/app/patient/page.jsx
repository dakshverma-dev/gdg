'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PatientForm from '@/components/PatientForm';
import OPDSlip from '@/components/OPDSlip';

export default function PatientPortal() {
    const [opdSlip, setOpdSlip] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleFormSubmit = async (formData) => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/patient/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to register patient');
            }

            if (data.success && data.slip) {
                // Map API response to OPD slip format
                const slipData = {
                    token: data.slip.token,
                    tokenNumber: data.slip.token,
                    name: data.slip.name,
                    age: formData.age,
                    department: data.slip.department,
                    priority: data.slip.priority,
                    eta: data.slip.eta,
                    position: data.slip.position,
                    reason: data.slip.reason,
                    patientId: data._firebaseData?.patient?.id
                };
                setOpdSlip(slipData);
            } else {
                throw new Error('Invalid response from server');
            }
        } catch (err) {
            console.error('Registration error:', err);
            setError(err.message || 'An error occurred during registration. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleNewRegistration = () => {
        setOpdSlip(null);
        setError(null);
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
                <div style={{ maxWidth: '650px', margin: '0 auto' }}>
                    {error && (
                        <div className="error-banner" style={{
                            background: '#FEE2E2',
                            border: '1px solid #FCA5A5',
                            borderRadius: 'var(--radius-md)',
                            padding: 'var(--space-md) var(--space-lg)',
                            marginBottom: 'var(--space-xl)',
                            color: '#991B1B',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--space-sm)'
                        }}>
                            <span style={{ fontSize: '20px' }}>⚠️</span>
                            <div>
                                <strong>Registration Failed</strong>
                                <p style={{ margin: 0, fontSize: '14px', color: '#B91C1C' }}>{error}</p>
                            </div>
                        </div>
                    )}

                    {!opdSlip ? (
                        <PatientForm onSubmit={handleFormSubmit} isLoading={isLoading} />
                    ) : (
                        <OPDSlip data={opdSlip} onNewRegistration={handleNewRegistration} />
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
}
