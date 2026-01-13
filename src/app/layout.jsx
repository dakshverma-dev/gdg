import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
    subsets: ['latin'],
    variable: '--font-inter',
});

export const metadata = {
    title: 'CareSRE – AI-Powered OPD Flow Management',
    description: 'Smarter Queues. Fairer Care. Faster Access. AI-powered OPD queue management for public healthcare.',
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body className={inter.className}>
                {children}
            </body>
        </html>
    );
}
