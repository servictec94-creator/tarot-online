'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Search, Star, ChevronRight, Clock, Filter } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import AdminLayout from '@/components/admin/AdminLayout'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

const estadoLabels: Record<string, string> = {
  pendiente: 'Pendiente', en_proceso: 'En proceso',
  respondida: 'Respondida', cerrada: 'Cerrada',
}

const categoriaEmoji: Record<string, string> = {
  amor: '❤️', trabajo: '💼', salud: '🌿', dinero: '💰',
  familia: '👨‍👩‍👧', espiritual: '✨', general: '🃏',
}

export default function AdminConsultasPage() {
  const supabase = createClient()
  const [consultas, setConsultas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filtroEstado, setFiltroEstado] = useState('pendiente')
  const [busqueda, setBusqueda] = useState('')

  const cargar = async () => {
    let query = supabase
      .from('consultas')
      .select('*, usuario:profiles!consultas_usuario_id_fkey(nombre, apellido, email)')
      .order('created_at', { ascending: false })

    if (filtroEstado !== 'todas') {
      query = query.eq('estado', filtroEstado)
    }

    const { data } = await query
    setConsultas(data || [])
    setLoading(false)
  }

  useEffect(() => { cargar() }, [filtroEstado])

  const filtradas = consultas.filter(c => {
    if (!busqueda) return true
    const q = busqueda.toLowerCase()
    return (
      c.titulo?.toLowerCase().includes(q) ||
      c.pregunta?.toLowerCase().includes(q) ||
      c.usuario?.nombre?.toLowerCase().includes(q) ||
      c.usuario?.email?.toLowerCase().includes(q)
    )
  })

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-serif text-2xl font-bold text-star">Consultas</h1>
            <p className="text-star/50 text-sm">{filtradas.length} consultas</p>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-star/40" />
            <input type="text" className="input-mystic pl-9"
              placeholder="Buscar por título, pregunta o cliente..."
              value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
          </div>
          <div className="flex gap-2 flex-wrap">
            {['todas', 'pendiente', 'en_proceso', 'respondida', 'cerrada'].map((est) => (
              <button key={est} onClick={() => setFiltroEstado(est)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all
                  ${filtroEstado === est
                    ? 'bg-violet-soft text-white shadow-mystic'
                    : 'bg-nebula/50 text-star/60 hover:bg-violet-deep/30 border border-violet-glow/15'
                  }`}
              >
                {est === 'todas' ? 'Todas' : estadoLabels[est]}
              </button>
            ))}
          </div>
        </div>

        {/* Lista */}
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <Star className="w-7 h-7 text-gold-light animate-twinkle" />
          </div>
        ) : filtradas.length === 0 ? (
          <div className="card-mystic p-12 text-center">
            <div className="text-4xl mb-3">✅</div>
            <p className="text-star/50">No hay consultas {filtroEstado !== 'todas' ? `${estadoLabels[filtroEstado]?.toLowerCase()}s` : ''}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtradas.map((c) => (
              <Link key={c.id} href={`/admin/consultas/${c.id}`}
                className="card-glow p-5 flex items-center gap-4 group hover:border-violet-glow/40 transition-all">
                <div className="text-2xl">{categoriaEmoji[c.categoria] || '🃏'}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-semibold text-star text-sm truncate group-hover:text-violet-light transition-colors">
                      {c.titulo}
                    </span>
                    {c.prioridad === 'urgente' && (
                      <span className="flex-shrink-0 text-xs bg-red-500/20 text-red-300 border border-red-500/30 px-2 py-0.5 rounded-full">
                        ⚡
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-star/50 truncate">{c.pregunta}</p>
                  <div className="flex items-center gap-3 mt-1.5 text-xs text-star/30">
                    <span className="font-medium text-violet-light/70">{c.usuario?.nombre} {c.usuario?.apellido}</span>
                    <span>·</span>
                    <Clock className="w-3 h-3" />
                    <span>{format(new Date(c.created_at), "d MMM, HH:mm", { locale: es })}</span>
                    <span>·</span>
                    <span className="capitalize">{c.tipo?.replace('_', ' ')}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`status-${c.estado}`}>{estadoLabels[c.estado]}</span>
                  <ChevronRight className="w-4 h-4 text-star/30 group-hover:text-violet-light transition-all" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
