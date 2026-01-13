import Header from '../components/Header';
import Footer from '../components/Footer';
import QueueTable from '../components/QueueTable';
import AlertSection from '../components/AlertSection';
import AIInsightCard from '../components/AIInsightCard';
import StatsCard from '../components/StatsCard';

// Mock data for the dashboard
const mockPatients = [
    { id: 1, token: '147', name: 'Rajesh Kumar', department: 'Cardiology', priority: 'High', status: 'In Progress', eta: '10:15 AM' },
    { id: 2, token: '148', name: 'Priya Sharma', department: 'General Medicine', priority: 'Medium', status: 'Waiting', eta: '10:30 AM' },
    { id: 3, token: '149', name: 'Amit Patel', department: 'Orthopedics', priority: 'Low', status: 'Waiting', eta: '10:45 AM' },
    { id: 4, token: '150', name: 'Sunita Devi', department: 'ENT', priority: 'Medium', status: 'Waiting', eta: '10:50 AM' },
    { id: 5, token: '151', name: 'Mohammed Ali', department: 'Cardiology', priority: 'High', status: 'Waiting', eta: '10:20 AM' },
    { id: 6, token: '152', name: 'Anita Gupta', department: 'Dermatology', priority: 'Low', status: 'Waiting', eta: '11:00 AM' },
    { id: 7, token: '153', name: 'Vikram Singh', department: 'General Medicine', priority: 'Medium', status: 'Waiting', eta: '11:15 AM' },
    { id: 8, token: '154', name: 'Lakshmi Rao', department: 'Pediatrics', priority: 'High', status: 'Waiting', eta: '10:25 AM' },
];

const mockAlerts = [
    { token: '147', name: 'Rajesh Kumar', condition: 'Chest Pain' },
    { token: '151', name: 'Mohammed Ali', condition: 'Cardiac History' },
    { token: '154', name: 'Lakshmi Rao', condition: 'Pediatric Emergency' },
];

const mockStats = [
    { value: '24', label: 'Patients Today' },
    { value: '8', label: 'Currently Waiting' },
    { value: '3', label: 'High Priority' },
    { value: '18 min', label: 'Avg. Wait Time' },
];

const aiInsight = "Consider prioritizing Token #151 (Mohammed Ali) — cardiac history patient waiting longer than recommended threshold. Current Cardiology queue load is above average.";

function AdminDashboard() {
    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--color-bg)' }}>
            <Header />

            <div className="page-header">
                <div className="container">
                    <h1>Admin Dashboard</h1>
                    <p>Real-time OPD queue management and monitoring</p>
                </div>
            </div>

            <main className="container" style={{ flex: 1, padding: 'var(--space-xl) var(--space-lg)' }}>
                {/* Stats Overview */}
                <StatsCard stats={mockStats} />

                {/* Dashboard Grid */}
                <div className="dashboard">
                    <div className="dashboard-main">
                        <QueueTable patients={mockPatients} />
                    </div>

                    <div className="dashboard-sidebar">
                        <AlertSection alerts={mockAlerts} />
                        <AIInsightCard insight={aiInsight} />
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}

export default AdminDashboard;
