function AIInsightCard({ insight }) {
    return (
        <div className="ai-insight">
            <div className="ai-insight-header">
                <div className="ai-insight-icon"></div>
                AI-Suggested Action
            </div>
            <p className="ai-insight-text">{insight}</p>
        </div>
    );
}

export default AIInsightCard;
