'use client';

import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';

function OPDSlip({ data, onNewRegistration }) {
    // Use state for client-only values to avoid hydration mismatch
    const [mounted, setMounted] = useState(false);
    const [currentTime, setCurrentTime] = useState('--:--');
    const [currentDate, setCurrentDate] = useState('--');
    const [estimatedTime, setEstimatedTime] = useState('--:--');
    const [slipUrl, setSlipUrl] = useState(`/slip/${data.patientId}`);

    useEffect(() => {
        setMounted(true);

        // Set client-side values after mount
        const now = new Date();

        setCurrentTime(now.toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        }));

        setCurrentDate(now.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        }));

        const estimated = new Date();
        estimated.setMinutes(estimated.getMinutes() + (data.eta || 30));
        setEstimatedTime(estimated.toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        }));

        // Set full URL for QR code
        setSlipUrl(`${window.location.origin}/slip/${data.patientId}`);
    }, [data.eta, data.patientId]);

    const getPriorityClass = (priority) => {
        switch (priority?.toUpperCase()) {
            case 'HIGH': return 'priority-high';
            case 'MEDIUM': return 'priority-medium';
            default: return 'priority-low';
        }
    };

    const getPriorityLabel = (priority) => {
        switch (priority?.toUpperCase()) {
            case 'HIGH': return '🔴 HIGH';
            case 'MEDIUM': return '🟡 MEDIUM';
            default: return '🟢 STANDARD';
        }
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="opd-slip-compact">
            {/* Compact Header */}
            <div className="slip-header-compact">
                <div className="hospital-logo">🏥</div>
                <div className="hospital-title">
                    <h1>Government District Hospital</h1>
                    <span>OPD Token</span>
                </div>
            </div>

            {/* Token + Priority Row */}
            <div className="token-row">
                <div className="token-display">
                    <span className="token-label">TOKEN</span>
                    <span className="token-number-compact">{data.token || data.tokenNumber || '#---'}</span>
                </div>
                <div className={`priority-badge-compact ${getPriorityClass(data.priority)}`}>
                    {getPriorityLabel(data.priority)}
                </div>
            </div>

            {/* Main Info Grid */}
            <div className="slip-info-grid">
                <div className="info-item">
                    <span className="info-label">Patient</span>
                    <span className="info-value">{data.name}</span>
                </div>
                <div className="info-item">
                    <span className="info-label">Age</span>
                    <span className="info-value">{data.age} yrs</span>
                </div>
                <div className="info-item">
                    <span className="info-label">Department</span>
                    <span className="info-value dept">{data.department}</span>
                </div>
                <div className="info-item">
                    <span className="info-label">Date</span>
                    <span className="info-value">{currentDate}</span>
                </div>
                <div className="info-item">
                    <span className="info-label">Time</span>
                    <span className="info-value">{currentTime}</span>
                </div>
                <div className="info-item">
                    <span className="info-label">Est. Consult</span>
                    <span className="info-value highlight">{estimatedTime}</span>
                </div>
            </div>

            {/* Wait Time Highlight */}
            <div className="wait-highlight">
                <span>⏱️ Approx. wait: <strong>{data.eta || 30} min</strong></span>
                {data.position && <span className="position">Position #{data.position}</span>}
            </div>

            {/* QR Code Section */}
            <div className="qr-section">
                <div className="qr-wrapper">
                    {mounted && (
                        <QRCodeSVG
                            value={slipUrl}
                            size={80}
                            level="M"
                            includeMargin={false}
                        />
                    )}
                </div>
                <div className="qr-info">
                    <p className="qr-title">Scan to verify</p>
                    <p className="slip-id">ID: {data.patientId?.slice(-8) || '---'}</p>
                </div>
            </div>

            {/* Compact Instructions */}
            <div className="slip-instructions">
                <p>✓ Arrive 15 min early • ✓ Carry Aadhar & records • ✓ Valid today only</p>
            </div>

            {/* Action Buttons */}
            <div className="slip-actions no-print">
                <button onClick={handlePrint} className="btn btn-secondary btn-sm">
                    🖨️ Print
                </button>
                <button onClick={onNewRegistration} className="btn btn-primary btn-sm">
                    ➕ New Patient
                </button>
            </div>

            {/* Footer */}
            <div className="slip-footer">
                Computer generated • No signature required
            </div>
        </div>
    );
}

export default OPDSlip;
