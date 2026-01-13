function OPDSlip({ data }) {
    const getPriorityClass = (priority) => {
        switch (priority.toLowerCase()) {
            case 'high': return 'badge-high';
            case 'medium': return 'badge-medium';
            default: return 'badge-low';
        }
    };

    return (
        <div className="opd-slip">
            <div className="opd-slip-header">
                <div>
                    <div className="opd-slip-title">Digital OPD Token</div>
                    <div className="opd-slip-token">#{data.tokenNumber}</div>
                </div>
                <span className={`badge ${getPriorityClass(data.priority)}`} style={{
                    background: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    border: '1px solid rgba(255,255,255,0.3)'
                }}>
                    {data.priority} Priority
                </span>
            </div>

            <div className="opd-slip-details">
                <div className="opd-slip-item">
                    <span className="opd-slip-label">Patient Name</span>
                    <span className="opd-slip-value">{data.name}</span>
                </div>
                <div className="opd-slip-item">
                    <span className="opd-slip-label">Age</span>
                    <span className="opd-slip-value">{data.age} years</span>
                </div>
                <div className="opd-slip-item">
                    <span className="opd-slip-label">Department</span>
                    <span className="opd-slip-value">{data.department}</span>
                </div>
                <div className="opd-slip-item">
                    <span className="opd-slip-label">Est. Consultation Time</span>
                    <span className="opd-slip-value">{data.eta}</span>
                </div>
            </div>
        </div>
    );
}

export default OPDSlip;
