import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Dental Practice System',
  description: 'Manage your dental practice',
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
