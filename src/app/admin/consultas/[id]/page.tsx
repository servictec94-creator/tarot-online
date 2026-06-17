'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ChevronLeft, Send, Star, Loader2, Check, Clock, User } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import AdminLayout from '@/components/admin/AdminLayout'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import toast from 'react-hot-toast'

const categoriaEmoji: Record<string, string> = {
  amor: '❤️', trabajo: '💼', salud: '🌿', dinero: '💰',
  familia: '👨‍👩‍👧', espiritual: '✨', general: '🃏',
}

export default function AdminConsultaDetallePage() {
  const { id } = useParams()
  const router = useRouter()
  const supabase = createClient()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const [consulta, setConsulta] = useState<any>(null)
  const [mensajes, setMensajes] = useState<any[]>([])
  const [respuesta, setRespuesta] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [userId, setUserId] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'respuesta' | 'chat'>('respuesta')

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)

      const [{ data: cons }, { data: msgs }] = await Promise.all([
        supabase.from('consultas')
          .select('*, usuario:profiles!consultas_usuario_id_fkey(*)')
          .eq('id', id)
          .single(),
        supabase.from('mensajes')
          .select('*, remitente:profiles!mensajes_remitente_id_fkey(*)')
          .eq('consulta_id', id)
          .order('created_at', { ascending: true }),
      ])

      setConsulta(cons)
      setRespuesta(cons?.respuesta || '')
      setMensajes((msgs as any) || [])
      setLoading(false)

      // Marcar mensajes como leídos
      await supabase.from('mensajes')
        .update({ leido: true, leido_at: new Date().toISOString() })
        .eq('consulta_id', id)
        .eq('destinatario_id', user.id)
    }
    load()
  }, [id])

  useEffect(() => {
    const channel = supabase
      .channel(`admin-consulta-${id}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'mensajes',
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
  }, [mensajes, tab])

  const guardarRespuesta = async (nuevoEstado: string) => {
    if (!respuesta.trim()) { toast.error('Escribí una respuesta antes de enviar'); return }
    setGuardando(true)

    const { error } = await supabase.from('consultas').update({
      respuesta: respuesta.trim(),
      estado: nuevoEstado,
      respondida_at: new Date().toISOString(),
    }).eq('id', id)

    if (!error) {
      // Notificar al usuario
      await supabase.from('notificaciones').insert({
        usuario_id: consulta.usuario_id,
        tipo: 'consulta',
        titulo: '✨ Tu consulta fue respondida',
        contenido: `Tu lectura de tarot "${consulta.titulo}" está lista. ¡Entrá a verla!`,
        url: `/consultas/${id}`,
      })

      toast.success('Respuesta guardada y enviada al cliente')
      setConsulta((prev: any) => ({ ...prev, estado: nuevoEstado, respuesta, respondida_at: new Date().toISOString() }))
    } else {
      toast.error('Error al guardar la respuesta')
    }
    setGuardando(false)
  }

  const enviarMensaje = async () => {
    if (!mensaje.trim() || enviando) return
    setEnviando(true)

    const { error } = await supabase.from('mensajes').insert({
      consulta_id: id as string,
      remitente_id: userId,
      destinatario_id: consulta.usuario_id,
      contenido: mensaje.trim(),
      tipo: 'texto',
    })

    if (!error) {
      setMensaje('')
      // Notificar
      await supabase.from('notificaciones').insert({
        usuario_id: consulta.usuario_id,
        tipo: 'mensaje',
        titulo: 'Nuevo mensaje de la tarotista',
        contenido: mensaje.trim().substring(0, 80),
        url: `/consultas/${id}`,
      })
    } else {
      toast.error('Error al enviar')
    }
    setEnviando(false)
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

  if (!consulta) {
    return (
      <AdminLayout>
        <div className="text-center py-20 text-star/50">
          <p>Consulta no encontrada</p>
          <Link href="/admin/consultas" className="btn-ghost mt-4 inline-block text-sm">Volver</Link>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto space-y-5">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Link href="/admin/consultas" className="p-2 rounded-xl hover:bg-violet-deep/30 text-star/50">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div className="text-2xl">{categoriaEmoji[consulta.categoria] || '🃏'}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-xl font-bold text-star truncate">{consulta.titulo}</h1>
              {consulta.prioridad === 'urgente' && (
                <span className="text-xs bg-red-500/20 text-red-300 border border-red-500/30 px-2 py-0.5 rounded-full flex-shrink-0">
                  ⚡ Urgente
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-star/40">
              <span className={`status-${consulta.estado}`}>{consulta.estado.replace('_', ' ')}</span>
              <span>·</span>
              <Clock className="w-3 h-3" />
              <span>{format(new Date(consulta.created_at), "d 'de' MMMM, yyyy 'a las' HH:mm", { locale: es })}</span>
            </div>
          </div>
        </div>

        {/* Info cliente */}
        <div className="card-mystic p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-violet-deep flex items-center justify-center text-violet-light font-bold text-lg border border-violet-glow/30">
            {consulta.usuario?.nombre?.[0] || '?'}
          </div>
          <div className="flex-1">
            <div className="font-semibold text-star">{consulta.usuario?.nombre} {consulta.usuario?.apellido}</div>
            <div className="text-xs text-star/50 flex gap-3">
              <span>{consulta.usuario?.email}</span>
              {consulta.usuario?.telefono && <span>· {consulta.usuario?.telefono}</span>}
            </div>
          </div>
          <div className="text-xs text-star/30 capitalize">
            {consulta.tipo?.replace('_', ' ')} · {consulta.categoria}
          </div>
        </div>

        {/* Pregunta */}
        <div className="card-mystic p-5">
          <div className="flex items-center gap-2 mb-3">
            <User className="w-4 h-4 text-violet-light" />
            <span className="text-xs font-semibold text-violet-light uppercase tracking-wider">Consulta del cliente</span>
          </div>
          <p className="text-star/90 leading-relaxed">{consulta.pregunta}</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-violet-glow/10 pb-0">
          {[
            { key: 'respuesta', label: '🔮 Respuesta del tarot' },
            { key: 'chat', label: `💬 Chat (${mensajes.length})` },
          ].map((t) => (
            <button key={t.key} onClick={() => setTab(t.key as any)}
              className={`px-5 py-2.5 text-sm font-medium border-b-2 transition-all -mb-px
                ${tab === t.key
                  ? 'border-violet-glow text-violet-light'
                  : 'border-transparent text-star/50 hover:text-star'
                }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab: Respuesta */}
        {tab === 'respuesta' && (
          <div className="space-y-4">
            <div>
              <label className="label-mystic">Lectura del tarot</label>
              <textarea
                className="input-mystic resize-none min-h-[280px]"
                placeholder="Escribí aquí la lectura del tarot para esta consulta. Sé detallada y empática. Podés mencionar las cartas que salieron, su interpretación y los consejos para el consultante..."
                value={respuesta}
                onChange={(e) => setRespuesta(e.target.value)}
              />
              <div className="flex justify-between mt-1">
                <p className="text-xs text-star/30">Esta respuesta será visible para el cliente en su panel</p>
                <p className="text-xs text-star/30">{respuesta.length} caracteres</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => guardarRespuesta('en_proceso')}
                disabled={guardando}
                className="btn-ghost flex items-center gap-2 text-sm py-2.5 px-4"
              >
                {guardando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Star className="w-4 h-4" />}
                Guardar borrador
              </button>
              <button
                onClick={() => guardarRespuesta('respondida')}
                disabled={guardando || !respuesta.trim()}
                className="btn-gold flex items-center gap-2 flex-1 justify-center py-2.5"
              >
                {guardando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                Enviar respuesta al cliente
              </button>
            </div>

            {/* Notas privadas */}
            <div className="card-mystic p-4">
              <label className="label-mystic text-xs">Notas privadas (solo vos las ves)</label>
              <textarea
                className="input-mystic resize-none h-20 text-sm"
                placeholder="Notas internas sobre esta consulta..."
                defaultValue={consulta.notas_privadas || ''}
                onBlur={async (e) => {
                  await supabase.from('consultas')
                    .update({ notas_privadas: e.target.value })
                    .eq('id', id)
                }}
              />
            </div>
          </div>
        )}

        {/* Tab: Chat */}
        {tab === 'chat' && (
          <div className="card-mystic flex flex-col h-[500px]">
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {mensajes.length === 0 ? (
                <div className="text-center py-8 text-star/30 text-sm">No hay mensajes aún</div>
              ) : (
                mensajes.map((msg) => {
                  const esMio = msg.remitente_id === userId
                  return (
                    <div key={msg.id} className={`flex ${esMio ? 'justify-end' : 'justify-start'}`}>
                      <div className={`${esMio ? 'bubble-sent' : 'bubble-received'}`}>
                        {!esMio && (
                          <div className="text-xs font-semibold text-violet-light mb-1">
                            {msg.remitente?.nombre} {msg.remitente?.apellido}
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
            <div className="p-3 border-t border-violet-glow/10">
              <div className="flex gap-2 items-end">
                <textarea
                  className="input-mystic flex-1 resize-none min-h-[44px] max-h-28 py-2.5"
                  placeholder="Escribí un mensaje al cliente..."
                  value={mensaje}
                  onChange={(e) => setMensaje(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); enviarMensaje() }
                  }}
                  rows={1}
                />
                <button onClick={enviarMensaje} disabled={enviando || !mensaje.trim()}
                  className="btn-primary p-2.5 flex-shrink-0 flex items-center justify-center">
                  {enviando ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
