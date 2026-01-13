import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function Home() {
    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Header />

            {/* Hero Section */}
            <section className="hero">
                <div className="container">
                    <h1 className="hero-title">
                        <span>CareSRE</span> – AI-Powered OPD Flow Management
                    </h1>
                    <p className="hero-tagline">
                        Smarter Queues. Fairer Care. Faster Access.
                    </p>
                    <div className="hero-buttons">
                        <Link href="/patient" className="btn btn-primary btn-lg">
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                            </svg>
                            Patient Portal
                        </Link>
                        <Link href="/admin" className="btn btn-secondary btn-lg">
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                            </svg>
                            Admin Dashboard
                        </Link>
                    </div>
                </div>
            </section>

            {/* Benefits Section */}
            <section className="benefits">
                <div className="container">
                    <div className="section-title">
                        <h2>Why Choose CareSRE?</h2>
                        <p>Transforming outpatient care with intelligent queue management</p>
                    </div>

                    <div className="benefits-grid">
                        <div className="benefit-card">
                            <div className="benefit-icon">
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10" />
                                    <polyline points="12,6 12,12 16,14" />
                                </svg>
                            </div>
                            <h4 className="benefit-title">Reduced Waiting Time</h4>
                            <p className="benefit-desc">
                                AI-optimized scheduling reduces average wait times by up to 40% through intelligent queue prioritization.
                            </p>
                        </div>

                        <div className="benefit-card">
                            <div className="benefit-icon">
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                                </svg>
                            </div>
                            <h4 className="benefit-title">Priority-Based Care</h4>
                            <p className="benefit-desc">
                                Symptom analysis ensures critical cases receive immediate attention while maintaining fairness.
                            </p>
                        </div>

                        <div className="benefit-card">
                            <div className="benefit-icon">
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                    <line x1="16" y1="2" x2="16" y2="6" />
                                    <line x1="8" y1="2" x2="8" y2="6" />
                                    <line x1="3" y1="10" x2="21" y2="10" />
                                </svg>
                            </div>
                            <h4 className="benefit-title">Transparent ETAs</h4>
                            <p className="benefit-desc">
                                Real-time consultation estimates keep patients informed and reduce uncertainty.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
