function StatsCard({ stats }) {
    return (
        <div className="stats-grid">
            {stats.map((stat, index) => (
                <div key={index} className="stat-card">
                    <div className="stat-value">{stat.value}</div>
                    <div className="stat-label">{stat.label}</div>
                </div>
            ))}
        </div>
    );
}

export default StatsCard;
