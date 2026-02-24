import type { Metadata } from 'next'
import './globals.css'
import { Sidebar } from '@/components/layout/sidebar'

export const metadata: Metadata = {
  title: 'ERP STILA - Enterprise Resource Planning',
  description: 'Enterprise ERP System for STILA',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className="flex">
        <Sidebar />
        <main className="flex-1 ml-64">
          {children}
        </main>
      </body>
    </html>
  )
}
