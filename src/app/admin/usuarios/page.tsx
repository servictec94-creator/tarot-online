'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Search, Users, Mail, Phone, Calendar, ChevronRight, Star } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import AdminLayout from '@/components/admin/AdminLayout'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export default function AdminUsuariosPage() {
  const supabase = createClient()
  const [usuarios, setUsuarios] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [busqueda, setBusqueda] = useState('')

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('profiles')
        .select(`
          *,
          consultas:consultas(count),
          reservas:reservas(count)
        `)
        .eq('rol', 'cliente')
        .order('created_at', { ascending: false })

      setUsuarios(data || [])
      setLoading(false)
    }
    load()
  }, [])

  const filtrados = usuarios.filter(u => {
    if (!busqueda) return true
    const q = busqueda.toLowerCase()
    return (
      u.nombre?.toLowerCase().includes(q) ||
      u.apellido?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.telefono?.includes(q)
    )
  })

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-serif text-2xl font-bold text-star flex items-center gap-2">
              <Users className="w-6 h-6 text-gold-light" />
              Clientes
            </h1>
            <p className="text-star/50 text-sm">{filtrados.length} clientes registrados</p>
          </div>
        </div>

        {/* Búsqueda */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-star/40" />
          <input type="text" className="input-mystic pl-9"
            placeholder="Buscar por nombre, email o teléfono..."
            value={busqueda} onChange={e => setBusqueda(e.target.value)} />
        </div>

        {/* Lista */}
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <Star className="w-7 h-7 text-gold-light animate-twinkle" />
          </div>
        ) : filtrados.length === 0 ? (
          <div className="card-mystic p-12 text-center">
            <div className="text-4xl mb-3">👥</div>
            <p className="text-star/50">
              {usuarios.length === 0 ? 'Todavía no hay clientes registrados' : 'No se encontraron resultados'}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtrados.map((u) => (
              <div key={u.id} className="card-glow p-5 flex items-center gap-4">
                {/* Avatar */}
                <div className="w-12 h-12 rounded-full bg-violet-deep flex items-center justify-center text-violet-light font-bold text-lg border border-violet-glow/30 flex-shrink-0">
                  {u.nombre?.[0]?.toUpperCase() || u.email?.[0]?.toUpperCase() || '?'}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-star">
                    {u.nombre || 'Sin nombre'} {u.apellido || ''}
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                    <div className="flex items-center gap-1.5 text-xs text-star/50">
                      <Mail className="w-3 h-3" />
                      <span className="truncate max-w-[180px]">{u.email}</span>
                    </div>
                    {u.telefono && (
                      <div className="flex items-center gap-1.5 text-xs text-star/50">
                        <Phone className="w-3 h-3" />
                        <span>{u.telefono}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5 text-xs text-star/40">
                      <Calendar className="w-3 h-3" />
                      <span>Desde {format(new Date(u.created_at), "MMM yyyy", { locale: es })}</span>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="hidden sm:flex items-center gap-6 text-center flex-shrink-0">
                  <div>
                    <div className="font-bold text-star text-lg">
                      {Array.isArray(u.consultas) ? u.consultas.length : (u.consultas?.[0]?.count || 0)}
                    </div>
                    <div className="text-xs text-star/40">Consultas</div>
                  </div>
                  <div>
                    <div className="font-bold text-star text-lg">
                      {Array.isArray(u.reservas) ? u.reservas.length : (u.reservas?.[0]?.count || 0)}
                    </div>
                    <div className="text-xs text-star/40">Reservas</div>
                  </div>
                </div>

                {/* Acciones */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {u.telefono && (
                    <a
                      href={`https://wa.me/${u.telefono.replace(/\D/g, '')}?text=Hola ${u.nombre}, te contacto desde Tarot Online!`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-green-500/10 hover:bg-green-500/20 text-green-400 transition-colors"
                      title="WhatsApp"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                      </svg>
                    </a>
                  )}
                  <a
                    href={`mailto:${u.email}`}
                    className="p-2 rounded-lg bg-violet-deep/40 hover:bg-violet-deep text-violet-light transition-colors"
                    title="Enviar email"
                  >
                    <Mail className="w-4 h-4" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
