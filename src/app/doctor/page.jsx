'use client';

import { useState, useEffect, useCallback } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function DoctorPortal() {
    const [patients, setPatients] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [selectedDept, setSelectedDept] = useState('all');
    const [stats, setStats] = useState({ total: 0, highPriority: 0, waiting: 0 });
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [selectedPatient, setSelectedPatient] = useState(null);

    const fetchQueue = useCallback(async () => {
        try {
            const res = await fetch(`/api/doctor/queue?department=${selectedDept}`);
            const data = await res.json();
            if (data.success) {
                setPatients(data.patients);
                setDepartments(data.departments);
                setStats(data.stats);
            }
        } catch (error) {
            console.error('Failed to fetch queue:', error);
        } finally {
            setLoading(false);
        }
    }, [selectedDept]);

    useEffect(() => {
        fetchQueue();
        const interval = setInterval(fetchQueue, 5000); // Refresh every 5s
        return () => clearInterval(interval);
    }, [fetchQueue]);

    const handleAction = async (patientId, action) => {
        setActionLoading(patientId + action);
        try {
            const res = await fetch(`/api/doctor/patient/${patientId}/action`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action })
            });
            const data = await res.json();
            if (data.success) {
                fetchQueue(); // Refresh the queue
                if (action === 'complete') {
                    setSelectedPatient(null);
                }
            }
        } catch (error) {
            console.error('Action failed:', error);
        } finally {
            setActionLoading(null);
        }
    };

    const getPriorityClass = (priority) => {
        switch (priority) {
            case 'HIGH': return 'priority-high';
            case 'MEDIUM': return 'priority-medium';
            default: return 'priority-low';
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'in-progress': return { class: 'status-progress', label: '🔵 In Progress' };
            case 'completed': return { class: 'status-completed', label: '✅ Completed' };
            case 'skipped': return { class: 'status-skipped', label: '⏭️ Skipped' };
            default: return { class: 'status-waiting', label: '⏳ Waiting' };
        }
    };

    const formatTime = (timestamp) => {
        return new Date(timestamp).toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    const waitingPatients = patients.filter(p => p.status !== 'completed' && p.status !== 'skipped');
    const currentPatient = patients.find(p => p.status === 'in-progress');

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Header />

            <div className="page-header doctor-header">
                <div className="container">
                    <h1>👨‍⚕️ Doctor Portal</h1>
                    <p>Manage patient consultations</p>
                </div>
            </div>

            <main className="container doctor-main">
                {/* Stats Row */}
                <div className="doctor-stats">
                    <div className="stat-card">
                        <span className="stat-icon">👥</span>
                        <div className="stat-info">
                            <span className="stat-value">{stats.waiting}</span>
                            <span className="stat-label">Waiting</span>
                        </div>
                    </div>
                    <div className="stat-card highlight">
                        <span className="stat-icon">🔴</span>
                        <div className="stat-info">
                            <span className="stat-value">{stats.highPriority}</span>
                            <span className="stat-label">High Priority</span>
                        </div>
                    </div>
                    <div className="stat-card">
                        <span className="stat-icon">🏥</span>
                        <div className="stat-info">
                            <span className="stat-value">{departments.length}</span>
                            <span className="stat-label">Departments</span>
                        </div>
                    </div>
                </div>

                {/* Department Filter */}
                <div className="doctor-controls">
                    <select
                        value={selectedDept}
                        onChange={(e) => setSelectedDept(e.target.value)}
                        className="dept-select"
                    >
                        <option value="all">All Departments</option>
                        {departments.map(dept => (
                            <option key={dept} value={dept}>{dept}</option>
                        ))}
                    </select>
                </div>

                <div className="doctor-content">
                    {/* Patient Queue */}
                    <div className="queue-section">
                        <h2>Patient Queue</h2>

                        {loading ? (
                            <div className="loading-state">
                                <span className="spinner"></span> Loading queue...
                            </div>
                        ) : waitingPatients.length === 0 ? (
                            <div className="empty-state">
                                <span className="empty-icon">✨</span>
                                <p>No patients waiting</p>
                            </div>
                        ) : (
                            <div className="patient-queue">
                                {waitingPatients.map((patient, index) => (
                                    <div
                                        key={patient.id}
                                        className={`queue-item ${selectedPatient?.id === patient.id ? 'selected' : ''} ${patient.status === 'in-progress' ? 'current' : ''}`}
                                        onClick={() => setSelectedPatient(patient)}
                                    >
                                        <div className="queue-position">
                                            {patient.status === 'in-progress' ? '🔵' : `#${index + 1}`}
                                        </div>
                                        <div className="queue-info">
                                            <div className="queue-header">
                                                <span className="patient-token">{patient.token}</span>
                                                <span className={`priority-badge-sm ${getPriorityClass(patient.priority)}`}>
                                                    {patient.priority}
                                                </span>
                                            </div>
                                            <div className="patient-name">{patient.name}</div>
                                            <div className="patient-meta">
                                                {patient.age} yrs • {patient.department}
                                            </div>
                                        </div>
                                        <div className="queue-time">
                                            {formatTime(patient.createdAt)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Patient Details / Actions */}
                    <div className="detail-section">
                        {currentPatient ? (
                            <div className="current-patient-card">
                                <div className="current-label">CURRENT PATIENT</div>
                                <h3>{currentPatient.name}</h3>
                                <div className="current-token">{currentPatient.token}</div>

                                <div className="patient-details">
                                    <div className="detail-row">
                                        <span>Age:</span> <strong>{currentPatient.age} years</strong>
                                    </div>
                                    <div className="detail-row">
                                        <span>Department:</span> <strong>{currentPatient.department}</strong>
                                    </div>
                                    <div className="detail-row">
                                        <span>Priority:</span>
                                        <span className={`priority-badge-sm ${getPriorityClass(currentPatient.priority)}`}>
                                            {currentPatient.priority}
                                        </span>
                                    </div>
                                </div>

                                <div className="symptoms-box">
                                    <label>Symptoms / Reason:</label>
                                    <p>{currentPatient.reason || 'No symptoms recorded'}</p>
                                </div>

                                {currentPatient.hasAlert && (
                                    <div className="alert-warning">
                                        ⚠️ Clinical Alert: High priority case
                                    </div>
                                )}

                                <div className="action-buttons">
                                    <button
                                        className="btn btn-success"
                                        onClick={() => handleAction(currentPatient.id, 'complete')}
                                        disabled={actionLoading === currentPatient.id + 'complete'}
                                    >
                                        {actionLoading === currentPatient.id + 'complete' ? 'Saving...' : '✓ Complete Consultation'}
                                    </button>
                                </div>
                            </div>
                        ) : selectedPatient ? (
                            <div className="selected-patient-card">
                                <h3>{selectedPatient.name}</h3>
                                <div className="selected-token">{selectedPatient.token}</div>

                                <div className="patient-details">
                                    <div className="detail-row">
                                        <span>Age:</span> <strong>{selectedPatient.age} years</strong>
                                    </div>
                                    <div className="detail-row">
                                        <span>Department:</span> <strong>{selectedPatient.department}</strong>
                                    </div>
                                    <div className="detail-row">
                                        <span>Priority:</span>
                                        <span className={`priority-badge-sm ${getPriorityClass(selectedPatient.priority)}`}>
                                            {selectedPatient.priority}
                                        </span>
                                    </div>
                                    <div className="detail-row">
                                        <span>Status:</span>
                                        <span className={getStatusBadge(selectedPatient.status).class}>
                                            {getStatusBadge(selectedPatient.status).label}
                                        </span>
                                    </div>
                                </div>

                                <div className="symptoms-box">
                                    <label>Symptoms / Reason:</label>
                                    <p>{selectedPatient.reason || 'No symptoms recorded'}</p>
                                </div>

                                {selectedPatient.hasAlert && (
                                    <div className="alert-warning">
                                        ⚠️ Clinical Alert: High priority case
                                    </div>
                                )}

                                <div className="action-buttons">
                                    <button
                                        className="btn btn-primary"
                                        onClick={() => handleAction(selectedPatient.id, 'call')}
                                        disabled={actionLoading === selectedPatient.id + 'call' || currentPatient}
                                    >
                                        {actionLoading === selectedPatient.id + 'call' ? 'Calling...' : '📢 Call Patient'}
                                    </button>
                                    <button
                                        className="btn btn-secondary"
                                        onClick={() => handleAction(selectedPatient.id, 'skip')}
                                        disabled={actionLoading === selectedPatient.id + 'skip'}
                                    >
                                        ⏭️ Skip
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="no-selection">
                                <span className="no-selection-icon">👈</span>
                                <p>Select a patient from the queue</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
