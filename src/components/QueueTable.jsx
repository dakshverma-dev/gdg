function QueueTable({ patients }) {
    const getPriorityClass = (priority) => {
        switch (priority.toLowerCase()) {
            case 'high': return 'badge-high';
            case 'medium': return 'badge-medium';
            default: return 'badge-low';
        }
    };

    const getStatusClass = (status) => {
        switch (status.toLowerCase()) {
            case 'in progress': return 'in-progress';
            case 'completed': return 'completed';
            default: return 'waiting';
        }
    };

    return (
        <div className="card">
            <div className="card-header">
                <h3 className="card-title">Patient Queue</h3>
                <span style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>
                    {patients.length} patients
                </span>
            </div>
            <table className="queue-table">
                <thead>
                    <tr>
                        <th>Token</th>
                        <th>Patient Name</th>
                        <th>Department</th>
                        <th>Priority</th>
                        <th>Status</th>
                        <th>ETA</th>
                    </tr>
                </thead>
                <tbody>
                    {patients.map((patient) => (
                        <tr key={patient.id}>
                            <td style={{ fontWeight: 600 }}>#{patient.token}</td>
                            <td>{patient.name}</td>
                            <td>{patient.department}</td>
                            <td>
                                <span className={`badge ${getPriorityClass(patient.priority)}`}>
                                    {patient.priority}
                                </span>
                            </td>
                            <td>
                                <span className={`status-dot ${getStatusClass(patient.status)}`}></span>
                                {patient.status}
                            </td>
                            <td>{patient.eta}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default QueueTable;
