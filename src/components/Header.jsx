import { Link, useLocation } from 'react-router-dom';

function Header() {
    const location = useLocation();

    return (
        <header className="header">
            <div className="container header-content">
                <Link to="/" className="logo">
                    <div className="logo-icon">C</div>
                    <span>CareSRE</span>
                </Link>
                <nav className="nav-links">
                    <Link
                        to="/"
                        className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
                    >
                        Home
                    </Link>
                    <Link
                        to="/patient"
                        className={`nav-link ${location.pathname === '/patient' ? 'active' : ''}`}
                    >
                        Patient Portal
                    </Link>
                    <Link
                        to="/admin"
                        className={`nav-link ${location.pathname === '/admin' ? 'active' : ''}`}
                    >
                        Admin Dashboard
                    </Link>
                </nav>
            </div>
        </header>
    );
}

export default Header;
