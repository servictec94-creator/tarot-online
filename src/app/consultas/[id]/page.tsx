'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ChevronLeft, Send, Star, Video, Loader2, Clock } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import DashboardLayout from '@/components/layout/DashboardLayout'
import type { Consulta, Mensaje, Profile } from '@/types/database'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import toast from 'react-hot-toast'

const categoriaEmoji: Record<string, string> = {
  amor: '❤️', trabajo: '💼', salud: '🌿', dinero: '💰',
  familia: '👨‍👩‍👧', espiritual: '✨', general: '🃏',
}

export default function ConsultaDetallePage() {
  const { id } = useParams()
  const router = useRouter()
  const supabase = createClient()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const [consulta, setConsulta] = useState<Consulta | null>(null)
  const [mensajes, setMensajes] = useState<(Mensaje & { remitente: Profile })[]>([])
  const [nuevoMensaje, setNuevoMensaje] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [userId, setUserId] = useState<string>('')
  const [adminId, setAdminId] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      setUserId(user.id)

      const [{ data: cons }, { data: admin }] = await Promise.all([
        supabase.from('consultas').select('*').eq('id', id).single(),
        supabase.from('profiles').select('id').eq('rol', 'admin').limit(1).single(),
      ])

      setConsulta(cons)
      if (admin) setAdminId(admin.id)

      // Cargar mensajes
      const { data: msgs } = await supabase
        .from('mensajes')
        .select('*, remitente:profiles!mensajes_remitente_id_fkey(*)')
        .eq('consulta_id', id)
        .order('created_at', { ascending: true })

      setMensajes((msgs as any) || [])
      setLoading(false)

      // Marcar como leídos
      await supabase
        .from('mensajes')
        .update({ leido: true, leido_at: new Date().toISOString() })
        .eq('consulta_id', id)
        .eq('destinatario_id', user.id)
        .eq('leido', false)
    }
    load()
  }, [id])

  useEffect(() => {
    // Realtime para nuevos mensajes
    const channel = supabase
      .channel(`consulta-${id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'mensajes',
        filter: `consulta_id=eq.${id}`,
      }, async (payload) => {
        const { data: msg } = await supabase
          .from('mensajes')
          .select('*, remitente:profiles!mensajes_remitente_id_fkey(*)')
          .eq('id', payload.new.id)
          .single()
        if (msg) setMensajes(prev => [...prev, msg as any])
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [id])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mensajes])

  const enviarMensaje = async () => {
    if (!nuevoMensaje.trim() || enviando || !adminId) return
    setEnviando(true)

    const { error } = await supabase.from('mensajes').insert({
      consulta_id: id as string,
      remitente_id: userId,
      destinatario_id: adminId,
      contenido: nuevoMensaje.trim(),
      tipo: 'texto',
    })

    if (!error) {
      setNuevoMensaje('')
    } else {
      toast.error('Error al enviar el mensaje')
    }
    setEnviando(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      enviarMensaje()
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Star className="w-7 h-7 text-gold-light animate-twinkle" />
        </div>
      </DashboardLayout>
    )
  }

  if (!consulta) {
    return (
      <DashboardLayout>
        <div className="text-center py-20">
          <p className="text-star/50">Consulta no encontrada</p>
          <Link href="/consultas" className="btn-ghost mt-4 inline-block text-sm">Volver</Link>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto flex flex-col h-[calc(100vh-8rem)]">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <Link href="/consultas" className="p-2 rounded-xl hover:bg-violet-deep/30 text-star/50 hover:text-star transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div className="text-2xl">{categoriaEmoji[consulta.categoria] || '🃏'}</div>
          <div className="flex-1 min-w-0">
            <h1 className="font-serif text-lg font-bold text-star truncate">{consulta.titulo}</h1>
            <div className="flex items-center gap-2">
              <span className={`status-${consulta.estado} text-xs`}>{consulta.estado.replace('_', ' ')}</span>
              <span className="text-xs text-star/30">
                {format(new Date(consulta.created_at), "d MMM yyyy", { locale: es })}
              </span>
            </div>
          </div>
          {consulta.tipo === 'videollamada' && (
            <Link href="/reservas" className="btn-primary text-xs py-2 px-3 flex items-center gap-1.5">
              <Video className="w-3.5 h-3.5" />
              Reservar video
            </Link>
          )}
        </div>

        {/* Consulta original */}
        <div className="card-mystic p-5 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <Star className="w-4 h-4 text-gold-light" />
            <span className="text-xs font-semibold text-violet-light uppercase tracking-wider">Tu consulta</span>
          </div>
          <p className="text-star/80 text-sm leading-relaxed">{consulta.pregunta}</p>
        </div>

        {/* Respuesta del tarot (si existe) */}
        {consulta.respuesta && (
          <div className="card-mystic p-5 mb-4 border-gold/20 bg-gold/5">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">🔮</span>
              <span className="text-xs font-semibold text-gold-light uppercase tracking-wider">Lectura del tarot</span>
            </div>
            <p className="text-star/90 text-sm leading-relaxed whitespace-pre-wrap">{consulta.respuesta}</p>
            {consulta.respondida_at && (
              <div className="mt-3 flex items-center gap-1.5 text-xs text-star/30">
                <Clock className="w-3 h-3" />
                Respondida el {format(new Date(consulta.respondida_at), "d 'de' MMMM, yyyy 'a las' HH:mm", { locale: es })}
              </div>
            )}
          </div>
        )}

        {/* Chat */}
        <div className="card-mystic flex-1 flex flex-col min-h-0">
          <div className="px-4 py-3 border-b border-violet-glow/10">
            <h3 className="text-sm font-semibold text-violet-light">Conversación</h3>
          </div>

          {/* Mensajes */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {mensajes.length === 0 ? (
              <div className="text-center py-8 text-star/30 text-sm">
                <p>Aún no hay mensajes en esta consulta</p>
                <p className="text-xs mt-1">Podés enviar un mensaje para hacer seguimiento</p>
              </div>
            ) : (
              mensajes.map((msg) => {
                const esMio = msg.remitente_id === userId
                return (
                  <div key={msg.id} className={`flex ${esMio ? 'justify-end' : 'justify-start'}`}>
                    <div className={`${esMio ? 'bubble-sent' : 'bubble-received'}`}>
                      {!esMio && (
                        <div className="text-xs font-semibold text-violet-light mb-1">
                          🔮 Tarotista
                        </div>
                      )}
                      <p className="text-sm text-star/90 leading-relaxed">{msg.contenido}</p>
                      <div className={`text-xs mt-1 ${esMio ? 'text-violet-light/50 text-right' : 'text-star/30'}`}>
                        {format(new Date(msg.created_at), 'HH:mm')}
                        {esMio && msg.leido && ' ✓✓'}
                      </div>
                    </div>
                  </div>
                )
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input mensaje */}
          <div className="p-3 border-t border-violet-glow/10">
            <div className="flex gap-2 items-end">
              <textarea
                className="input-mystic flex-1 resize-none min-h-[44px] max-h-32 py-2.5"
                placeholder="Escribí un mensaje..."
                value={nuevoMensaje}
                onChange={(e) => setNuevoMensaje(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
              />
              <button
                onClick={enviarMensaje}
                disabled={enviando || !nuevoMensaje.trim()}
                className="btn-primary p-2.5 flex-shrink-0 flex items-center justify-center"
              >
                {enviando
                  ? <Loader2 className="w-5 h-5 animate-spin" />
                  : <Send className="w-5 h-5" />
                }
              </button>
            </div>
            <p className="text-xs text-star/25 mt-1.5 text-center">Enter para enviar · Shift+Enter para nueva línea</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
