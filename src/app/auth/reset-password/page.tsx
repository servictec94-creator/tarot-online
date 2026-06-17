'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Star, Loader2, ArrowLeft, CheckCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import toast from 'react-hot-toast'

export default function ResetPasswordPage() {
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [enviado, setEnviado] = useState(false)

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/update-password`,
    })

    if (error) {
      toast.error('Error al enviar el email. Verificá que la dirección sea correcta.')
    } else {
      setEnviado(true)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <Star className="w-7 h-7 text-gold-light animate-twinkle" />
            <span className="font-serif text-2xl font-bold text-gold-light">Tarot Online</span>
          </Link>
        </div>

        <div className="card-mystic p-8">
          {enviado ? (
            <div className="text-center py-4">
              <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
              <h2 className="font-serif text-2xl text-star mb-3">¡Email enviado!</h2>
              <p className="text-star/60 text-sm leading-relaxed mb-6">
                Revisá tu bandeja de entrada. Te enviamos un link para restablecer tu contraseña.
                Si no lo encontrás, revisá la carpeta de spam.
              </p>
              <Link href="/auth/login" className="btn-primary inline-flex items-center gap-2 text-sm">
                <ArrowLeft className="w-4 h-4" />
                Volver al inicio de sesión
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h1 className="font-serif text-2xl font-bold text-star mb-2">Recuperar contraseña</h1>
                <p className="text-star/50 text-sm">
                  Ingresá tu email y te enviaremos un link para crear una nueva contraseña.
                </p>
              </div>

              <form onSubmit={handleReset} className="space-y-5">
                <div>
                  <label className="label-mystic">Email</label>
                  <input
                    type="email"
                    className="input-mystic"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    autoFocus
                  />
                </div>

                <button type="submit" disabled={loading || !email}
                  className="btn-primary w-full flex items-center justify-center gap-2">
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Star className="w-5 h-5" />}
                  {loading ? 'Enviando...' : 'Enviar link de recuperación'}
                </button>
              </form>

              <div className="mt-6 text-center">
                <Link href="/auth/login"
                  className="inline-flex items-center gap-2 text-sm text-star/50 hover:text-violet-light transition-colors">
                  <ArrowLeft className="w-4 h-4" />
                  Volver al inicio de sesión
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
