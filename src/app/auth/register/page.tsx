'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Star, Eye, EyeOff, Loader2, Sparkles } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [form, setForm] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    password: '',
    confirmar: '',
  })

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()

    if (form.password !== form.confirmar) {
      toast.error('Las contraseñas no coinciden')
      return
    }

    if (form.password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres')
      return
    }

    setLoading(true)

    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: { nombre: form.nombre },
      },
    })

    if (error) {
      toast.error(error.message === 'User already registered' 
        ? 'Ya existe una cuenta con ese email' 
        : 'Error al registrarse. Intentá nuevamente.')
      setLoading(false)
      return
    }

    if (data.user) {
      // Actualizar perfil con datos adicionales
      await supabase
        .from('profiles')
        .update({
          nombre: form.nombre,
          apellido: form.apellido,
          telefono: form.telefono,
        })
        .eq('id', data.user.id)

      toast.success('¡Cuenta creada! Revisá tu email para confirmar tu registro.')
      router.push('/dashboard')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-violet-deep/20 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-md relative">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <Star className="w-7 h-7 text-gold-light animate-twinkle" />
            <span className="font-serif text-2xl font-bold text-gold-light">Tarot Online</span>
          </Link>
          <div className="inline-flex items-center gap-2 bg-violet-deep/50 border border-violet-glow/30 rounded-full px-4 py-1.5 mt-6 mb-4 text-xs text-violet-light">
            <Sparkles className="w-3.5 h-3.5 text-gold-light" />
            Primera consulta con descuento
          </div>
          <h1 className="font-serif text-3xl text-star mb-2">Comenzá tu camino</h1>
          <p className="text-star/50 text-sm">Registrate gratis para hacer tu primera consulta</p>
        </div>

        <div className="card-mystic p-8">
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label-mystic">Nombre</label>
                <input
                  type="text"
                  className="input-mystic"
                  placeholder="Tu nombre"
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="label-mystic">Apellido</label>
                <input
                  type="text"
                  className="input-mystic"
                  placeholder="Tu apellido"
                  value={form.apellido}
                  onChange={(e) => setForm({ ...form, apellido: e.target.value })}
                />
              </div>
            </div>

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
              <label className="label-mystic">WhatsApp (opcional)</label>
              <input
                type="tel"
                className="input-mystic"
                placeholder="+54 9 3442 000000"
                value={form.telefono}
                onChange={(e) => setForm({ ...form, telefono: e.target.value })}
              />
            </div>

            <div>
              <label className="label-mystic">Contraseña</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  className="input-mystic pr-12"
                  placeholder="Mínimo 6 caracteres"
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

            <div>
              <label className="label-mystic">Confirmar contraseña</label>
              <input
                type="password"
                className="input-mystic"
                placeholder="Repetí tu contraseña"
                value={form.confirmar}
                onChange={(e) => setForm({ ...form, confirmar: e.target.value })}
                required
              />
            </div>

            <button type="submit" disabled={loading} className="btn-gold w-full flex items-center justify-center gap-2 mt-2">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Star className="w-5 h-5" />}
              {loading ? 'Creando cuenta...' : 'Crear mi cuenta gratis'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-star/50">
            ¿Ya tenés cuenta?{' '}
            <Link href="/auth/login" className="text-violet-light hover:text-violet-glow font-semibold transition-colors">
              Iniciá sesión
            </Link>
          </div>
        </div>

        <p className="text-center text-xs text-star/30 mt-6 px-4">
          Al registrarte aceptás que tus datos son tratados con absoluta confidencialidad
        </p>
      </div>
    </div>
  )
}
