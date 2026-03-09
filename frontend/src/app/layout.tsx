import type { Metadata } from 'next';
import './globals.css';
import StoreInitializer from '@/components/StoreInitializer';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
    title: 'Quran School | Gestion École de Coran',
    description: 'Application SaaS de gestion d\'école de Coran — Hifdh, Tajwid, Lecture',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="fr" suppressHydrationWarning>
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Cinzel:wght@400;700;900&family=Montserrat:wght@400;500;600;700;800&family=Amiri:wght@400;700&display=swap" rel="stylesheet" />
                <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap" rel="stylesheet" />
            </head>
            <body className="bg-dark-50 dark:bg-dark-950 text-dark-900 dark:text-dark-100 min-h-screen">
                <StoreInitializer />
                <Toaster position="top-right" />
                {children}
            </body>
        </html>
    );
}
