'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import QueueTable from '@/components/QueueTable';
import AlertSection from '@/components/AlertSection';
import AIInsightCard from '@/components/AIInsightCard';
import StatsCard from '@/components/StatsCard';

export default function AdminDashboard() {
    const [patients, setPatients] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [stats, setStats] = useState([
        { value: '0', label: 'Patients Today' },
        { value: '0', label: 'Currently Waiting' },
        { value: '0', label: 'High Priority' },
        { value: '-- min', label: 'Avg. Wait Time' },
    ]);
    const [aiInsight, setAiInsight] = useState('Loading AI insights...');
    const [loading, setLoading] = useState(true);

    // Fetch data from API
    const fetchData = async () => {
        try {
            const response = await fetch('/api/admin/queue');
            const data = await response.json();

            if (data.patients) {
                // Transform patients data for QueueTable format
                const formattedPatients = data.patients.map((p, index) => ({
                    id: p.id || index + 1,
                    token: p.token || `#${index + 1}`,
                    name: p.name,
                    department: p.department,
                    priority: p.priority === 'HIGH' ? 'High' : p.priority === 'MEDIUM' ? 'Medium' : 'Low',
                    status: index === 0 ? 'In Progress' : 'Waiting',
                    eta: `${p.eta} min`
                }));
                setPatients(formattedPatients);

                // Calculate stats
                const highPriority = data.patients.filter(p => p.priority === 'HIGH').length;
                const avgEta = data.patients.length > 0
                    ? Math.round(data.patients.reduce((sum, p) => sum + (p.eta || 0), 0) / data.patients.length)
                    : 0;

                setStats([
                    { value: String(data.patients.length), label: 'Patients Today' },
                    { value: String(data.patients.length), label: 'Currently Waiting' },
                    { value: String(highPriority), label: 'High Priority' },
                    { value: `${avgEta} min`, label: 'Avg. Wait Time' },
                ]);
            }

            if (data.alerts) {
                // Transform alerts for AlertSection format
                const formattedAlerts = data.alerts.map(a => ({
                    token: a.patientId,
                    name: a.patientName,
                    condition: a.reason
                }));
                setAlerts(formattedAlerts);
            }

            // Generate AI insight based on data
            if (data.patients && data.patients.length > 0) {
                const highPriorityPatients = data.patients.filter(p => p.priority === 'HIGH');
                if (highPriorityPatients.length > 0) {
                    const oldest = highPriorityPatients[highPriorityPatients.length - 1];
                    setAiInsight(`Consider prioritizing ${oldest.name} — ${oldest.reason || 'High priority patient'}. Current queue has ${data.patients.length} patients waiting.`);
                } else {
                    setAiInsight(`Queue is operating normally with ${data.patients.length} patients. No immediate concerns detected.`);
                }
            } else {
                setAiInsight('No patients in queue. System is ready for new registrations.');
            }

        } catch (error) {
            console.error('Failed to fetch queue data:', error);
            setAiInsight('Unable to load AI insights. Please refresh the page.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        // Refresh every 10 seconds
        const interval = setInterval(fetchData, 10000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--color-bg)' }}>
            <Header />

            <div className="page-header">
                <div className="container">
                    <h1>Admin Dashboard</h1>
                    <p>Real-time OPD queue management and monitoring {loading && '(Loading...)'}</p>
                </div>
            </div>

            <main className="container" style={{ flex: 1, padding: 'var(--space-xl) var(--space-lg)' }}>
                {/* Stats Overview */}
                <StatsCard stats={stats} />

                {/* Dashboard Grid */}
                <div className="dashboard">
                    <div className="dashboard-main">
                        <QueueTable patients={patients} />
                    </div>

                    <div className="dashboard-sidebar">
                        <AlertSection alerts={alerts} />
                        <AIInsightCard insight={aiInsight} />
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}

