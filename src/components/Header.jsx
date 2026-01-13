'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

function Header() {
    const pathname = usePathname();

    return (
        <header className="header">
            <div className="container header-content">
                <Link href="/" className="logo">
                    <div className="logo-icon">C</div>
                    <span>CareSRE</span>
                </Link>
                <nav className="nav-links">
                    <Link
                        href="/"
                        className={`nav-link ${pathname === '/' ? 'active' : ''}`}
                    >
                        Home
                    </Link>
                    <Link
                        href="/patient"
                        className={`nav-link ${pathname === '/patient' ? 'active' : ''}`}
                    >
                        Patient Portal
                    </Link>
                    <Link
                        href="/admin"
                        className={`nav-link ${pathname === '/admin' ? 'active' : ''}`}
                    >
                        Admin Dashboard
                    </Link>
                </nav>
            </div>
        </header>
    );
}

export default Header;
