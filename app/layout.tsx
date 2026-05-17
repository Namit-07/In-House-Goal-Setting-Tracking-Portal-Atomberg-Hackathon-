import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'AtomQuest Goal Portal',
  description: 'In-House Goal Setting & Tracking Portal by Atomberg',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
