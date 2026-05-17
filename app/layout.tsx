import type { Metadata } from 'next'
import './globals.css'
import Providers from '../components/Providers'

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
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
