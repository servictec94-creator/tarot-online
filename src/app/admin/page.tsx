'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Users, MessageCircle, Calendar, Video, ChevronRight, Star, Clock } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import AdminLayout from '@/components/admin/AdminLayout'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import type { Consulta, Reserva } from '@/types/database'

interface Stats {
  total_usuarios: number
  consultas_pendientes: number
  consultas_respondidas: number
  reservas_hoy: number
  reservas_semana: number
  mensajes_no_leidos: number
}

export default function AdminPage() {
  const supabase = createClient()
  const [stats, setStats] = useState<Stats | null>(null)
  const [consultasPendientes, setConsultasPendientes] = useState<(Consulta & { usuario: any })[]>([])
  const [reservasHoy, setReservasHoy] = useState<(Reserva & { usuario: any })[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const hoy = new Date().toISOString().split('T')[0]

      const [{ data: statsData }, { data: cons }, { data: res }] = await Promise.all([
        supabase.rpc('get_estadisticas'),
        supabase.from('consultas')
          .select('*, usuario:profiles!consultas_usuario_id_fkey(nombre, apellido, email)')
          .eq('estado', 'pendiente')
          .order('created_at', { ascending: false })
          .limit(5),
        supabase.from('reservas')
          .select('*, usuario:profiles!reservas_usuario_id_fkey(nombre, apellido, telefono)')
          .eq('fecha', hoy)
          .neq('estado', 'cancelada')
          .order('hora_inicio', { ascending: true }),
      ])

      setStats(statsData as Stats)
      setConsultasPendientes((cons as any) || [])
      setReservasHoy((res as any) || [])
      setLoading(false)
    }
    load()
  }, [])

  const categoriaEmoji: Record<string, string> = {
    amor: '❤️', trabajo: '💼', salud: '🌿', dinero: '💰',
    familia: '👨‍👩‍👧', espiritual: '✨', general: '🃏',
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Star className="w-7 h-7 text-gold-light animate-twinkle" />
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="font-serif text-3xl font-bold text-star">Panel de control</h1>
          <p className="text-star/50 text-sm mt-1">
            {format(new Date(), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
          </p>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { label: 'Clientes', value: stats?.total_usuarios || 0, icon: Users, color: 'text-violet-light', bg: 'bg-violet-deep/30' },
            { label: 'Pendientes', value: stats?.consultas_pendientes || 0, icon: MessageCircle, color: 'text-amber-400', bg: 'bg-amber-500/10' },
            { label: 'Respondidas', value: stats?.consultas_respondidas || 0, icon: MessageCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
            { label: 'Hoy', value: stats?.reservas_hoy || 0, icon: Calendar, color: 'text-gold-light', bg: 'bg-gold/10' },
            { label: 'Esta semana', value: stats?.reservas_semana || 0, icon: Calendar, color: 'text-blue-400', bg: 'bg-blue-500/10' },
            { label: 'Mensajes', value: stats?.mensajes_no_leidos || 0, icon: Video, color: 'text-pink-400', bg: 'bg-pink-500/10' },
          ].map((stat) => (
            <div key={stat.label} className="card-mystic p-4 text-center">
              <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center mx-auto mb-2`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div className="font-serif text-2xl font-bold text-star">{stat.value}</div>
              <div className="text-xs text-star/40 mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Consultas pendientes */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-serif text-lg text-star flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-amber-400" />
                Consultas pendientes
              </h2>
              <Link href="/admin/consultas" className="text-sm text-violet-light hover:text-violet-glow flex items-center gap-1">
                Ver todas <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {consultasPendientes.length === 0 ? (
              <div className="card-mystic p-8 text-center text-star/40">
                <div className="text-3xl mb-2">✅</div>
                <p className="text-sm">No hay consultas pendientes</p>
              </div>
            ) : (
              <div className="space-y-2">
                {consultasPendientes.map((c) => (
                  <Link key={c.id} href={`/admin/consultas/${c.id}`}
                    className="card-glow p-4 flex items-center gap-3 group hover:border-amber-500/30">
                    <div className="text-xl">{categoriaEmoji[c.categoria] || '🃏'}</div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-star text-sm truncate group-hover:text-violet-light transition-colors">
                        {c.titulo}
                      </div>
                      <div className="text-xs text-star/40 flex items-center gap-2">
                        <span>{c.usuario?.nombre} {c.usuario?.apellido}</span>
                        <span>·</span>
                        <Clock className="w-3 h-3" />
                        <span>{format(new Date(c.created_at), "d MMM, HH:mm", { locale: es })}</span>
                      </div>
                    </div>
                    {c.prioridad === 'urgente' && (
                      <span className="text-xs bg-red-500/20 text-red-300 border border-red-500/30 px-2 py-0.5 rounded-full">
                        ⚡ Urgente
                      </span>
                    )}
                    <ChevronRight className="w-4 h-4 text-star/30 group-hover:text-violet-light transition-all" />
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Reservas de hoy */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-serif text-lg text-star flex items-center gap-2">
                <Calendar className="w-5 h-5 text-gold-light" />
                Agenda de hoy
              </h2>
              <Link href="/admin/agenda" className="text-sm text-violet-light hover:text-violet-glow flex items-center gap-1">
                Ver agenda <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {reservasHoy.length === 0 ? (
              <div className="card-mystic p-8 text-center text-star/40">
                <div className="text-3xl mb-2">📅</div>
                <p className="text-sm">No hay reservas para hoy</p>
              </div>
            ) : (
              <div className="space-y-2">
                {reservasHoy.map((r) => (
                  <div key={r.id} className="card-glow p-4 flex items-center gap-3">
                    <div className="text-xl flex-shrink-0">
                      {r.tipo === 'videollamada' ? '📹' : r.tipo === 'chat' ? '💬' : '✉️'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-star text-sm">
                        {r.usuario?.nombre} {r.usuario?.apellido}
                      </div>
                      <div className="text-xs text-star/40">
                        {r.hora_inicio} · {r.tipo.replace('_', ' ')}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`status-${r.estado}`}>{r.estado}</span>
                      {r.jitsi_url && (
                        <a href={r.jitsi_url} target="_blank" rel="noopener noreferrer"
                          className="text-xs btn-primary py-1 px-2">
                          <Video className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Acciones rápidas */}
        <div>
          <h2 className="font-serif text-lg text-star mb-4">Acciones rápidas</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { href: '/admin/consultas', label: 'Responder consultas', emoji: '✍️', desc: `${stats?.consultas_pendientes || 0} pendientes` },
              { href: '/admin/agenda', label: 'Gestionar agenda', emoji: '📅', desc: 'Horarios y turnos' },
              { href: '/admin/videollamadas', label: 'Crear videollamada', emoji: '📹', desc: 'Generar link Jitsi' },
              { href: '/admin/usuarios', label: 'Ver clientes', emoji: '👥', desc: `${stats?.total_usuarios || 0} registrados` },
            ].map((acc) => (
              <Link key={acc.href} href={acc.href}
                className="card-glow p-5 flex items-center gap-4 group hover:border-gold/30 transition-all">
                <div className="text-2xl">{acc.emoji}</div>
                <div>
                  <div className="font-semibold text-star text-sm group-hover:text-gold-light transition-colors">
                    {acc.label}
                  </div>
                  <div className="text-xs text-star/40">{acc.desc}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
