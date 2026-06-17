'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { MessageCircle, Calendar, Clock, Star, Plus, ChevronRight, Sparkles } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import DashboardLayout from '@/components/layout/DashboardLayout'
import type { Profile, Consulta, Reserva } from '@/types/database'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

const categoriaEmoji: Record<string, string> = {
  amor: '❤️', trabajo: '💼', salud: '🌿', dinero: '💰',
  familia: '👨‍👩‍👧', espiritual: '✨', general: '🃏',
}

export default function DashboardPage() {
  const supabase = createClient()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [consultas, setConsultas] = useState<Consulta[]>([])
  const [reservas, setReservas] = useState<Reserva[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const [{ data: prof }, { data: cons }, { data: res }] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('consultas').select('*').eq('usuario_id', user.id)
          .order('created_at', { ascending: false }).limit(5),
        supabase.from('reservas').select('*').eq('usuario_id', user.id)
          .gte('fecha', new Date().toISOString().split('T')[0])
          .order('fecha', { ascending: true }).limit(3),
      ])

      setProfile(prof)
      setConsultas(cons || [])
      setReservas(res || [])
      setLoading(false)
    }
    load()
  }, [])

  const estadoCounts = {
    pendientes: consultas.filter(c => c.estado === 'pendiente').length,
    respondidas: consultas.filter(c => c.estado === 'respondida').length,
    total: consultas.length,
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-4">
            <Star className="w-8 h-8 text-gold-light animate-twinkle" />
            <p className="text-star/50">Cargando tu panel...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Saludo */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl font-bold text-star">
              Hola, {profile?.nombre} 🌙
            </h1>
            <p className="text-star/50 mt-1">Bienvenida/o a tu espacio de consultas</p>
          </div>
          <Link href="/consultas/nueva" className="btn-gold inline-flex items-center gap-2 py-2.5 px-5 text-sm">
            <Plus className="w-4 h-4" />
            Nueva consulta
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Consultas totales', value: estadoCounts.total, icon: '🃏', color: 'violet' },
            { label: 'Pendientes', value: estadoCounts.pendientes, icon: '⏳', color: 'amber' },
            { label: 'Respondidas', value: estadoCounts.respondidas, icon: '✅', color: 'emerald' },
          ].map((stat) => (
            <div key={stat.label} className="card-mystic p-5 text-center">
              <div className="text-3xl mb-2">{stat.icon}</div>
              <div className="font-serif text-2xl font-bold text-star">{stat.value}</div>
              <div className="text-xs text-star/50 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Próximas reservas */}
        {reservas.length > 0 && (
          <div>
            <h2 className="font-serif text-xl text-star mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gold-light" />
              Próximas citas
            </h2>
            <div className="space-y-3">
              {reservas.map((reserva) => (
                <div key={reserva.id} className="card-glow p-5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-violet-deep flex items-center justify-center text-xl">
                      {reserva.tipo === 'videollamada' ? '📹' : '💬'}
                    </div>
                    <div>
                      <div className="font-semibold text-star capitalize">
                        {reserva.tipo.replace('_', ' ')}
                      </div>
                      <div className="text-sm text-star/50 flex items-center gap-2 mt-0.5">
                        <Clock className="w-3.5 h-3.5" />
                        {format(new Date(reserva.fecha + 'T00:00:00'), "EEEE d 'de' MMMM", { locale: es })} — {reserva.hora_inicio}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`status-${reserva.estado}`}>{reserva.estado}</span>
                    {reserva.jitsi_url && reserva.estado === 'confirmada' && (
                      <a href={reserva.jitsi_url} target="_blank" rel="noopener noreferrer"
                        className="btn-primary text-xs py-1.5 px-3">
                        Unirse
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Acciones rápidas */}
        <div>
          <h2 className="font-serif text-xl text-star mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-gold-light" />
            ¿Qué querés hacer hoy?
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              {
                href: '/consultas/nueva',
                icon: '🃏',
                titulo: 'Hacer una consulta',
                desc: 'Enviá tu pregunta al tarot',
                color: 'from-violet-deep to-violet-700',
              },
              {
                href: '/reservas',
                icon: '📹',
                titulo: 'Reservar videollamada',
                desc: 'Sesión en vivo con la tarotista',
                color: 'from-gold-dark to-gold',
              },
              {
                href: '/chat',
                icon: '💬',
                titulo: 'Ver mensajes',
                desc: 'Revisá tus conversaciones',
                color: 'from-violet-700 to-violet-500',
              },
              {
                href: '/consultas',
                icon: '📋',
                titulo: 'Historial de consultas',
                desc: 'Revisá todas tus lecturas',
                color: 'from-cosmos to-nebula',
              },
            ].map((accion) => (
              <Link key={accion.href} href={accion.href}
                className="card-glow p-6 flex items-center gap-5 group hover:border-violet-glow/50 transition-all">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${accion.color} flex items-center justify-center text-2xl flex-shrink-0`}>
                  {accion.icon}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-star group-hover:text-violet-light transition-colors">
                    {accion.titulo}
                  </div>
                  <div className="text-sm text-star/50">{accion.desc}</div>
                </div>
                <ChevronRight className="w-5 h-5 text-star/30 group-hover:text-violet-light transition-all group-hover:translate-x-1" />
              </Link>
            ))}
          </div>
        </div>

        {/* Últimas consultas */}
        {consultas.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-serif text-xl text-star flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-gold-light" />
                Últimas consultas
              </h2>
              <Link href="/consultas" className="text-sm text-violet-light hover:text-violet-glow transition-colors flex items-center gap-1">
                Ver todas <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="space-y-3">
              {consultas.map((c) => (
                <Link key={c.id} href={`/consultas/${c.id}`}
                  className="card-glow p-5 flex items-center gap-4 group hover:border-violet-glow/40">
                  <div className="text-2xl">{categoriaEmoji[c.categoria] || '🃏'}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-star truncate group-hover:text-violet-light transition-colors">
                      {c.titulo}
                    </div>
                    <div className="text-xs text-star/40 mt-0.5">
                      {format(new Date(c.created_at), "d 'de' MMMM, yyyy", { locale: es })}
                    </div>
                  </div>
                  <span className={`status-${c.estado} flex-shrink-0`}>{c.estado.replace('_', ' ')}</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Estado vacío */}
        {consultas.length === 0 && (
          <div className="card-mystic p-12 text-center">
            <div className="text-5xl mb-4">🌙</div>
            <h3 className="font-serif text-xl text-star mb-2">Las cartas te esperan</h3>
            <p className="text-star/50 mb-6">Todavía no hiciste ninguna consulta. ¡El tarot tiene mucho para revelarte!</p>
            <Link href="/consultas/nueva" className="btn-primary inline-flex items-center gap-2">
              <Star className="w-4 h-4" />
              Hacer mi primera consulta
            </Link>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
