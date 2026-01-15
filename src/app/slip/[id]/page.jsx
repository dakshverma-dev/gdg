'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useParams } from 'next/navigation';

export default function SlipView() {
    const params = useParams();
    const [slip, setSlip] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSlip = async () => {
            try {
                const response = await fetch(`/api/slip/${params.id}`);
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'Failed to load slip');
                }

                if (data.success) {
                    setSlip(data.slip);
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (params.id) {
            fetchSlip();
        }
    }, [params.id]);

    const getPriorityClass = (priority) => {
        switch (priority?.toUpperCase()) {
            case 'HIGH': return 'priority-high';
            case 'MEDIUM': return 'priority-medium';
            default: return 'priority-low';
        }
    };

    const getPriorityLabel = (priority) => {
        switch (priority?.toUpperCase()) {
            case 'HIGH': return '🔴 HIGH PRIORITY';
            case 'MEDIUM': return '🟡 MEDIUM';
            default: return '🟢 STANDARD';
        }
    };

    const formatTime = (timestamp) => {
        if (!timestamp) return '--:--';
        const date = new Date(timestamp);
        return date.toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    const formatDate = (timestamp) => {
        if (!timestamp) return '--';
        const date = new Date(timestamp);
        return date.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Header />

            <div className="page-header">
                <div className="container">
                    <h1>OPD Slip Verification</h1>
                    <p>Scan result for slip validation</p>
                </div>
            </div>

            <main className="container" style={{ flex: 1, padding: 'var(--space-2xl) var(--space-lg)' }}>
                <div style={{ maxWidth: '500px', margin: '0 auto' }}>
                    {loading && (
                        <div className="verification-card loading-card">
                            <div className="spinner-large"></div>
                            <p>Verifying slip...</p>
                        </div>
                    )}

                    {error && (
                        <div className="verification-card error-card">
                            <div className="verify-icon error">❌</div>
                            <h2>Invalid Slip</h2>
                            <p>{error}</p>
                            <p className="subtext">This slip may have expired or does not exist.</p>
                        </div>
                    )}

                    {slip && (
                        <div className="verification-card success-card">
                            <div className="verify-icon success">✅</div>
                            <h2>Valid OPD Slip</h2>

                            <div className="verified-token">
                                <span className="token-label">Token</span>
                                <span className="token-value">{slip.token}</span>
                            </div>

                            <div className={`priority-badge ${getPriorityClass(slip.priority)}`}>
                                {getPriorityLabel(slip.priority)}
                            </div>

                            <div className="verified-details">
                                <div className="detail-item">
                                    <span className="label">Patient</span>
                                    <span className="value">{slip.name}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="label">Age</span>
                                    <span className="value">{slip.age} years</span>
                                </div>
                                <div className="detail-item">
                                    <span className="label">Department</span>
                                    <span className="value">{slip.department}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="label">Date</span>
                                    <span className="value">{formatDate(slip.createdAt)}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="label">Registration</span>
                                    <span className="value">{formatTime(slip.createdAt)}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="label">Est. Wait</span>
                                    <span className="value">{slip.eta} min</span>
                                </div>
                            </div>

                            {slip.hasAlert && (
                                <div className="alert-notice">
                                    ⚠️ This patient has a clinical alert
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
}
