'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Star, Eye, EyeOff, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [form, setForm] = useState({ email: '', password: '' })

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { data, error } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    })

    if (error) {
      toast.error('Email o contraseña incorrectos')
      setLoading(false)
      return
    }

    // Verificar si es admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('rol')
      .eq('id', data.user.id)
      .single()

    toast.success('¡Bienvenida/o de vuelta!')

    if (profile?.rol === 'admin' || profile?.rol === 'tarotista') {
      router.push('/admin')
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20">
      {/* Background glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-violet-deep/20 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-md relative">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <Star className="w-7 h-7 text-gold-light animate-twinkle" />
            <span className="font-serif text-2xl font-bold text-gold-light">Tarot Online</span>
          </Link>
          <h1 className="font-serif text-3xl text-star mt-6 mb-2">Bienvenida/o</h1>
          <p className="text-star/50 text-sm">Iniciá sesión para acceder a tus consultas</p>
        </div>

        <div className="card-mystic p-8">
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="label-mystic">Email</label>
              <input
                type="email"
                className="input-mystic"
                placeholder="tu@email.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="label-mystic">Contraseña</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  className="input-mystic pr-12"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-star/40 hover:text-violet-light transition-colors"
                >
                  {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <Link href="/auth/reset-password" className="text-sm text-violet-light hover:text-violet-glow transition-colors">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Star className="w-5 h-5" />}
              {loading ? 'Iniciando...' : 'Iniciar sesión'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-star/50">
            ¿No tenés cuenta?{' '}
            <Link href="/auth/register" className="text-violet-light hover:text-violet-glow font-semibold transition-colors">
              Registrate gratis
            </Link>
          </div>
        </div>

        <p className="text-center text-xs text-star/30 mt-6">
          Tus datos son confidenciales y están protegidos
        </p>
      </div>
    </div>
  )
}
