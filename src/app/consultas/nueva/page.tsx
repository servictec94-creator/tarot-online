'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Star, Loader2, ChevronLeft, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import DashboardLayout from '@/components/layout/DashboardLayout'
import toast from 'react-hot-toast'

const categorias = [
  { value: 'amor', label: 'Amor y Relaciones', emoji: '❤️' },
  { value: 'trabajo', label: 'Trabajo y Carrera', emoji: '💼' },
  { value: 'dinero', label: 'Dinero y Abundancia', emoji: '💰' },
  { value: 'salud', label: 'Salud y Bienestar', emoji: '🌿' },
  { value: 'familia', label: 'Familia y Vínculos', emoji: '👨‍👩‍👧' },
  { value: 'espiritual', label: 'Crecimiento Espiritual', emoji: '✨' },
  { value: 'general', label: 'Consulta General', emoji: '🃏' },
]

const tipos = [
  { value: 'mensaje', label: 'Consulta por mensaje', emoji: '✉️', desc: 'Recibís respuesta escrita detallada' },
  { value: 'chat', label: 'Chat en vivo', emoji: '💬', desc: 'Conversación directa con la tarotista' },
  { value: 'videollamada', label: 'Videollamada', emoji: '📹', desc: 'Sesión cara a cara por video' },
]

export default function NuevaConsultaPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    titulo: '',
    pregunta: '',
    categoria: 'general',
    tipo: 'mensaje',
    prioridad: 'normal',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.pregunta.trim().length < 20) {
      toast.error('Por favor describí tu consulta con más detalle (mínimo 20 caracteres)')
      return
    }
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth/login'); return }

    const { error } = await supabase.from('consultas').insert({
      usuario_id: user.id,
      titulo: form.titulo || `Consulta de ${form.categoria}`,
      pregunta: form.pregunta,
      categoria: form.categoria as any,
      tipo: form.tipo as any,
      prioridad: form.prioridad as any,
      estado: 'pendiente',
    })

    if (error) {
      toast.error('Error al enviar la consulta. Intentá nuevamente.')
      setLoading(false)
      return
    }

    // Crear notificación para admin
    await supabase.from('notificaciones').insert({
      usuario_id: user.id,
      tipo: 'consulta',
      titulo: 'Consulta enviada',
      contenido: 'Tu consulta fue recibida. Te responderemos pronto.',
      url: '/consultas',
    })

    toast.success('¡Consulta enviada! Te responderemos pronto.')
    router.push('/consultas')
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/consultas" className="p-2 rounded-xl hover:bg-violet-deep/30 text-star/50 hover:text-star transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="font-serif text-2xl font-bold text-star">Nueva consulta</h1>
            <p className="text-star/50 text-sm">Contame qué querés saber. Todo es confidencial.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Tipo de consulta */}
          <div className="card-mystic p-6">
            <label className="label-mystic text-base mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-gold-light" />
              Tipo de consulta
            </label>
            <div className="grid gap-3">
              {tipos.map((tipo) => (
                <label key={tipo.value}
                  className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all
                    ${form.tipo === tipo.value
                      ? 'border-violet-glow bg-violet-deep/40 shadow-mystic'
                      : 'border-violet-glow/15 hover:border-violet-glow/40 hover:bg-violet-deep/20'
                    }`}
                >
                  <input type="radio" name="tipo" value={tipo.value}
                    checked={form.tipo === tipo.value}
                    onChange={(e) => setForm({ ...form, tipo: e.target.value })}
                    className="sr-only"
                  />
                  <span className="text-2xl">{tipo.emoji}</span>
                  <div>
                    <div className="font-semibold text-star text-sm">{tipo.label}</div>
                    <div className="text-xs text-star/50">{tipo.desc}</div>
                  </div>
                  {form.tipo === tipo.value && (
                    <div className="ml-auto w-5 h-5 rounded-full bg-violet-soft flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-white" />
                    </div>
                  )}
                </label>
              ))}
            </div>
          </div>

          {/* Categoría */}
          <div className="card-mystic p-6">
            <label className="label-mystic text-base mb-4">¿Sobre qué área de tu vida?</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {categorias.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setForm({ ...form, categoria: cat.value })}
                  className={`p-3 rounded-xl border text-center transition-all
                    ${form.categoria === cat.value
                      ? 'border-violet-glow bg-violet-deep/40 text-violet-light shadow-mystic'
                      : 'border-violet-glow/15 hover:border-violet-glow/30 text-star/70'
                    }`}
                >
                  <div className="text-xl mb-1">{cat.emoji}</div>
                  <div className="text-xs font-medium leading-tight">{cat.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Título y pregunta */}
          <div className="card-mystic p-6 space-y-4">
            <div>
              <label className="label-mystic">Título de tu consulta</label>
              <input
                type="text"
                className="input-mystic"
                placeholder="Ej: Mi situación amorosa actual"
                value={form.titulo}
                onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                maxLength={100}
              />
            </div>
            <div>
              <label className="label-mystic">Tu pregunta o situación</label>
              <textarea
                className="input-mystic min-h-[180px] resize-none"
                placeholder="Describí con detalle tu situación, qué sentís y qué querés saber. Cuanta más información des, más precisa será la lectura..."
                value={form.pregunta}
                onChange={(e) => setForm({ ...form, pregunta: e.target.value })}
                required
                minLength={20}
              />
              <div className="flex justify-between mt-1">
                <p className="text-xs text-star/30">Mínimo 20 caracteres</p>
                <p className="text-xs text-star/30">{form.pregunta.length} caracteres</p>
              </div>
            </div>

            {/* Prioridad */}
            <div>
              <label className="label-mystic">Prioridad</label>
              <div className="flex gap-3">
                {[
                  { value: 'normal', label: 'Normal', emoji: '🌙' },
                  { value: 'urgente', label: 'Urgente', emoji: '⚡' },
                ].map((p) => (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => setForm({ ...form, prioridad: p.value })}
                    className={`flex-1 py-2.5 px-4 rounded-xl border text-sm font-medium transition-all flex items-center justify-center gap-2
                      ${form.prioridad === p.value
                        ? 'border-violet-glow bg-violet-deep/40 text-violet-light'
                        : 'border-violet-glow/15 text-star/60 hover:border-violet-glow/30'
                      }`}
                  >
                    {p.emoji} {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Aviso */}
          <div className="flex items-start gap-3 p-4 rounded-xl bg-violet-deep/20 border border-violet-glow/15">
            <Star className="w-4 h-4 text-gold-light flex-shrink-0 mt-0.5" />
            <p className="text-xs text-star/60 leading-relaxed">
              Tu consulta será respondida en las próximas 24-48hs hábiles. 
              Si elegiste videollamada, coordinaremos un horario por mensaje. 
              Toda la información que compartas es estrictamente confidencial.
            </p>
          </div>

          <button type="submit" disabled={loading} className="btn-gold w-full flex items-center justify-center gap-2 py-4">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Star className="w-5 h-5" />}
            {loading ? 'Enviando consulta...' : 'Enviar mi consulta'}
          </button>
        </form>
      </div>
    </DashboardLayout>
  )
}
