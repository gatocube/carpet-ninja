import type { Metadata } from 'next'
import './globals.css'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://carpet-ninja.com'

export const metadata: Metadata = {
    title: 'Carpet Ninja — Deep Carpet & Upholstery Cleaning in Bay Area',
    description: 'Carpet Ninja provides professional deep carpet and upholstery cleaning across the Bay Area, California. Fast, eco-friendly, and ninja-level results.',
    metadataBase: new URL(siteUrl),
    openGraph: {
        title: 'Carpet Ninja — Deep Carpet & Upholstery Cleaning',
        description: 'Professional mobile cleaning service for carpets, upholstery, and mattresses across the Bay Area.',
        type: 'website',
        url: siteUrl,
    },
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en" className="scroll-smooth">
            <head>
                <link rel="icon" href="/favicon.ico" />
                <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" />
            </head>
            <body className="bg-[#0a0a0f] text-white font-[Inter,system-ui,sans-serif] antialiased selection:bg-pink-500/30">
                {children}
            </body>
        </html>
    )
}
