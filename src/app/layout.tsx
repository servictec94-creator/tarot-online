import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import WhatsAppButton from '@/components/ui/WhatsAppButton'

export const metadata: Metadata = {
  title: 'Tarot Online | Consultas Personalizadas',
  description: 'Conectá con tu destino. Consultas de tarot personalizadas con lecturas auténticas. Concepción del Uruguay, Entre Ríos.',
  keywords: 'tarot online, lectura de tarot, consulta tarot, tarot argentina, tarotista',
  openGraph: {
    title: 'Tarot Online | Consultas Personalizadas',
    description: 'Descubrí lo que las cartas tienen para vos. Consultas de tarot con lecturas auténticas y personalizadas.',
    locale: 'es_AR',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>
        <div className="relative z-10">
          {children}
        </div>
        <WhatsAppButton />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1E1E3F',
              color: '#E2D9F3',
              border: '1px solid rgba(167,139,250,0.3)',
              borderRadius: '12px',
            },
            success: {
              iconTheme: { primary: '#A78BFA', secondary: '#1E1E3F' },
            },
            error: {
              iconTheme: { primary: '#F87171', secondary: '#1E1E3F' },
            },
          }}
        />
      </body>
    </html>
  )
}
