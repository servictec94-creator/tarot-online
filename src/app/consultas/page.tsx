'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, Search, Filter, Star, ChevronRight, MessageCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import DashboardLayout from '@/components/layout/DashboardLayout'
import type { Consulta } from '@/types/database'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

const categoriaEmoji: Record<string, string> = {
  amor: '❤️', trabajo: '💼', salud: '🌿', dinero: '💰',
  familia: '👨‍👩‍👧', espiritual: '✨', general: '🃏',
}

const estadoLabels: Record<string, string> = {
  pendiente: 'Pendiente', en_proceso: 'En proceso',
  respondida: 'Respondida', cerrada: 'Cerrada',
}

export default function ConsultasPage() {
  const supabase = createClient()
  const [consultas, setConsultas] = useState<Consulta[]>([])
  const [loading, setLoading] = useState(true)
  const [filtroEstado, setFiltroEstado] = useState<string>('todas')
  const [busqueda, setBusqueda] = useState('')

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('consultas')
        .select('*')
        .eq('usuario_id', user.id)
        .order('created_at', { ascending: false })

      setConsultas(data || [])
      setLoading(false)
    }
    load()
  }, [])

  const consultasFiltradas = consultas.filter(c => {
    const matchEstado = filtroEstado === 'todas' || c.estado === filtroEstado
    const matchBusqueda = c.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
      c.pregunta.toLowerCase().includes(busqueda.toLowerCase())
    return matchEstado && matchBusqueda
  })

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-serif text-2xl font-bold text-star">Mis Consultas</h1>
            <p className="text-star/50 text-sm">{consultas.length} consultas en total</p>
          </div>
          <Link href="/consultas/nueva" className="btn-gold inline-flex items-center gap-2 py-2.5 px-5 text-sm">
            <Plus className="w-4 h-4" />
            Nueva consulta
          </Link>
        </div>

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-star/40" />
            <input
              type="text"
              className="input-mystic pl-9"
              placeholder="Buscar consultas..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {['todas', 'pendiente', 'respondida', 'cerrada'].map((estado) => (
              <button
                key={estado}
                onClick={() => setFiltroEstado(estado)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all
                  ${filtroEstado === estado
                    ? 'bg-violet-soft text-white shadow-mystic'
                    : 'bg-nebula/50 text-star/60 hover:bg-violet-deep/30 border border-violet-glow/15'
                  }`}
              >
                {estado === 'todas' ? 'Todas' : estadoLabels[estado]}
              </button>
            ))}
          </div>
        </div>

        {/* Lista */}
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <Star className="w-7 h-7 text-gold-light animate-twinkle" />
          </div>
        ) : consultasFiltradas.length === 0 ? (
          <div className="card-mystic p-12 text-center">
            <div className="text-5xl mb-4">🌙</div>
            <h3 className="font-serif text-xl text-star mb-2">
              {consultas.length === 0 ? 'Todavía no hiciste consultas' : 'No hay resultados'}
            </h3>
            <p className="text-star/50 mb-6 text-sm">
              {consultas.length === 0 ? '¡Las cartas te están esperando!' : 'Probá con otro filtro o búsqueda'}
            </p>
            {consultas.length === 0 && (
              <Link href="/consultas/nueva" className="btn-primary inline-flex items-center gap-2 text-sm">
                <Plus className="w-4 h-4" />
                Hacer mi primera consulta
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {consultasFiltradas.map((c) => (
              <Link key={c.id} href={`/consultas/${c.id}`}
                className="card-glow p-5 flex items-center gap-4 group hover:border-violet-glow/40 transition-all">
                <div className="w-12 h-12 rounded-xl bg-violet-deep/60 flex items-center justify-center text-2xl flex-shrink-0">
                  {categoriaEmoji[c.categoria] || '🃏'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-semibold text-star group-hover:text-violet-light transition-colors truncate">
                      {c.titulo}
                    </span>
                    {c.prioridad === 'urgente' && (
                      <span className="text-xs bg-red-500/20 text-red-300 border border-red-500/30 px-2 py-0.5 rounded-full flex-shrink-0">
                        ⚡ Urgente
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-star/50 truncate">{c.pregunta}</p>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-xs text-star/30">
                      {format(new Date(c.created_at), "d 'de' MMMM, yyyy", { locale: es })}
                    </span>
                    <span className="text-xs text-star/30">·</span>
                    <span className="text-xs text-star/40 capitalize">{c.tipo.replace('_', ' ')}</span>
                    {c.respondida_at && (
                      <>
                        <span className="text-xs text-star/30">·</span>
                        <span className="text-xs text-emerald-400 flex items-center gap-1">
                          <MessageCircle className="w-3 h-3" /> Respondida
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className={`status-${c.estado}`}>{estadoLabels[c.estado]}</span>
                  <ChevronRight className="w-4 h-4 text-star/30 group-hover:text-violet-light group-hover:translate-x-0.5 transition-all" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
