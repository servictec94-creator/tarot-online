import Link from 'next/link'
import { Star, Home } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      {/* Glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-violet-deep/20 rounded-full blur-[120px]" />
      </div>

      <div className="relative text-center max-w-lg">
        {/* Carta de tarot decorativa */}
        <div className="w-32 h-48 mx-auto mb-8 bg-violet-deep border border-violet-glow/30 rounded-2xl flex items-center justify-center shadow-mystic animate-float">
          <div className="text-center">
            <div className="text-5xl mb-2">🌙</div>
            <div className="text-violet-light font-serif text-sm">404</div>
          </div>
        </div>

        <h1 className="font-serif text-4xl font-bold text-star mb-4">
          Las cartas no encontraron esta página
        </h1>

        <p className="text-star/60 mb-8 leading-relaxed">
          El universo no pudo encontrar lo que buscabas. 
          Quizás las cartas quieren que explores otro camino.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/" className="btn-gold inline-flex items-center gap-2">
            <Home className="w-4 h-4" />
            Volver al inicio
          </Link>
          <Link href="/dashboard" className="btn-ghost inline-flex items-center gap-2">
            <Star className="w-4 h-4" />
            Mi panel
          </Link>
        </div>
      </div>
    </div>
  )
}
