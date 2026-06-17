'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Send, Star, Loader2, MessageCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import toast from 'react-hot-toast'

export default function ChatPage() {
  const router = useRouter()
  const supabase = createClient()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const [mensajes, setMensajes] = useState<any[]>([])
  const [nuevoMensaje, setNuevoMensaje] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [userId, setUserId] = useState('')
  const [adminId, setAdminId] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      setUserId(user.id)

      const { data: admin } = await supabase
        .from('profiles')
        .select('id')
        .eq('rol', 'admin')
        .limit(1)
        .single()

      if (!admin) { setLoading(false); return }
      setAdminId(admin.id)

      // Mensajes directos (sin consulta_id)
      const { data: msgs } = await supabase
        .from('mensajes')
        .select('*, remitente:profiles!mensajes_remitente_id_fkey(*)')
        .is('consulta_id', null)
        .or(`remitente_id.eq.${user.id},destinatario_id.eq.${user.id}`)
        .order('created_at', { ascending: true })

      setMensajes((msgs as any) || [])
      setLoading(false)

      // Marcar como leídos
      await supabase
        .from('mensajes')
        .update({ leido: true, leido_at: new Date().toISOString() })
        .is('consulta_id', null)
        .eq('destinatario_id', user.id)
        .eq('leido', false)
    }
    load()
  }, [])

  useEffect(() => {
    if (!userId) return
    const channel = supabase
      .channel('chat-directo')
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'mensajes',
        filter: `destinatario_id=eq.${userId}`,
      }, async (payload) => {
        if (payload.new.consulta_id) return
        const { data: msg } = await supabase
          .from('mensajes')
          .select('*, remitente:profiles!mensajes_remitente_id_fkey(*)')
          .eq('id', payload.new.id)
          .single()
        if (msg) setMensajes(prev => [...prev, msg as any])
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [userId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mensajes])

  const enviar = async () => {
    if (!nuevoMensaje.trim() || enviando || !adminId) return
    setEnviando(true)

    const { error } = await supabase.from('mensajes').insert({
      remitente_id: userId,
      destinatario_id: adminId,
      contenido: nuevoMensaje.trim(),
      tipo: 'texto',
    })

    if (!error) {
      // Optimistic update
      setMensajes(prev => [...prev, {
        id: Date.now(),
        remitente_id: userId,
        destinatario_id: adminId,
        contenido: nuevoMensaje.trim(),
        leido: false,
        created_at: new Date().toISOString(),
        remitente: { nombre: 'Vos' },
      }])
      setNuevoMensaje('')
    } else {
      toast.error('Error al enviar')
    }
    setEnviando(false)
  }

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto flex flex-col h-[calc(100vh-8rem)]">
        {/* Header */}
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-full bg-violet-deep border-2 border-violet-glow/40 flex items-center justify-center text-xl shadow-mystic">
            🔮
          </div>
          <div>
            <h1 className="font-serif text-xl font-bold text-star">Chat con la Tarotista</h1>
            <div className="flex items-center gap-2 text-xs text-star/50">
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
              Disponible · Responde en menos de 24hs
            </div>
          </div>
        </div>

        {/* Chat box */}
        <div className="card-mystic flex-1 flex flex-col min-h-0">
          {/* Mensajes */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <Star className="w-6 h-6 text-gold-light animate-twinkle" />
              </div>
            ) : mensajes.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <MessageCircle className="w-12 h-12 text-violet-glow/30 mb-4" />
                <p className="text-star/40 font-medium">¡Comenzá la conversación!</p>
                <p className="text-star/25 text-sm mt-1">Podés hacer consultas generales, pedir info sobre precios o coordinar una sesión</p>
              </div>
            ) : (
              mensajes.map((msg) => {
                const esMio = msg.remitente_id === userId
                return (
                  <div key={msg.id} className={`flex ${esMio ? 'justify-end' : 'justify-start'} items-end gap-2`}>
                    {!esMio && (
                      <div className="w-8 h-8 rounded-full bg-violet-deep flex items-center justify-center text-sm flex-shrink-0 mb-1">
                        🔮
                      </div>
                    )}
                    <div className={`${esMio ? 'bubble-sent' : 'bubble-received'}`}>
                      {!esMio && (
                        <div className="text-xs font-semibold text-violet-light mb-1">Tarotista</div>
                      )}
                      <p className="text-sm text-star/90 leading-relaxed">{msg.contenido}</p>
                      <div className={`text-xs mt-1.5 flex items-center gap-1 ${esMio ? 'justify-end text-violet-light/40' : 'text-star/25'}`}>
                        {format(new Date(msg.created_at), 'HH:mm')}
                        {esMio && <span>{msg.leido ? '✓✓' : '✓'}</span>}
                      </div>
                    </div>
                  </div>
                )
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-violet-glow/10">
            <div className="flex gap-2 items-end">
              <textarea
                className="input-mystic flex-1 resize-none min-h-[48px] max-h-36 py-3 text-sm"
                placeholder="Escribí tu mensaje..."
                value={nuevoMensaje}
                onChange={e => setNuevoMensaje(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); enviar() }
                }}
                rows={1}
              />
              <button
                onClick={enviar}
                disabled={enviando || !nuevoMensaje.trim()}
                className="btn-primary p-3 flex-shrink-0 flex items-center justify-center rounded-xl disabled:opacity-40"
              >
                {enviando ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              </button>
            </div>
            <div className="flex justify-between mt-2 px-1">
              <p className="text-xs text-star/25">Enter para enviar · Shift+Enter para nueva línea</p>
              <a
                href={`https://wa.me/543442674304?text=Hola! Te contacto desde Tarot Online.`}
                target="_blank" rel="noopener noreferrer"
                className="text-xs text-green-400/60 hover:text-green-400 transition-colors"
              >
                📱 WhatsApp directo
              </a>
            </div>
          </div>
        </div>

        {/* Acceso rápido a consultas */}
        <div className="mt-4 card-mystic p-4 flex items-center justify-between">
          <div className="text-sm text-star/60">
            ¿Querés una lectura formal del tarot?
          </div>
          <a href="/consultas/nueva" className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5">
            <Star className="w-3.5 h-3.5" />
            Nueva consulta
          </a>
        </div>
      </div>
    </DashboardLayout>
  )
}
