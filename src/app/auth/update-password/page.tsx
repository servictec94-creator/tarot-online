'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Star, Loader2, Eye, EyeOff, CheckCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import toast from 'react-hot-toast'

export default function UpdatePasswordPage() {
  const router = useRouter()
  const supabase = createClient()
  const [password, setPassword] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [actualizado, setActualizado] = useState(false)

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirmar) {
      toast.error('Las contraseñas no coinciden')
      return
    }
    if (password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres')
      return
    }

    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      toast.error('Error al actualizar la contraseña. El link puede haber expirado.')
    } else {
      setActualizado(true)
      setTimeout(() => router.push('/dashboard'), 3000)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <Star className="w-7 h-7 text-gold-light animate-twinkle" />
            <span className="font-serif text-2xl font-bold text-gold-light">Tarot Online</span>
          </Link>
        </div>

        <div className="card-mystic p-8">
          {actualizado ? (
            <div className="text-center py-4">
              <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
              <h2 className="font-serif text-2xl text-star mb-3">¡Contraseña actualizada!</h2>
              <p className="text-star/60 text-sm">Serás redirigida/o al panel en unos segundos...</p>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h1 className="font-serif text-2xl font-bold text-star mb-2">Nueva contraseña</h1>
                <p className="text-star/50 text-sm">Ingresá y confirmá tu nueva contraseña.</p>
              </div>

              <form onSubmit={handleUpdate} className="space-y-5">
                <div>
                  <label className="label-mystic">Nueva contraseña</label>
                  <div className="relative">
                    <input
                      type={showPass ? 'text' : 'password'}
                      className="input-mystic pr-12"
                      placeholder="Mínimo 6 caracteres"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                      autoFocus
                    />
                    <button type="button" onClick={() => setShowPass(!showPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-star/40 hover:text-violet-light transition-colors">
                      {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="label-mystic">Confirmar contraseña</label>
                  <input
                    type="password"
                    className="input-mystic"
                    placeholder="Repetí tu contraseña"
                    value={confirmar}
                    onChange={e => setConfirmar(e.target.value)}
                    required
                  />
                </div>

                <button type="submit" disabled={loading || !password || !confirmar}
                  className="btn-primary w-full flex items-center justify-center gap-2">
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Star className="w-5 h-5" />}
                  {loading ? 'Actualizando...' : 'Actualizar contraseña'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
