'use client'

import { useEffect, useState } from 'react'
import { Video, Copy, ExternalLink, Plus, Star, Loader2, Check } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import AdminLayout from '@/components/admin/AdminLayout'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import toast from 'react-hot-toast'

export default function AdminVideoPage() {
  const supabase = createClient()
  const [reservasVideo, setReservasVideo] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [generando, setGenerando] = useState<string | null>(null)
  const [copiado, setCopiado] = useState<string | null>(null)
  const [salaManual, setSalaManual] = useState('')
  const [salaGenerada, setSalaGenerada] = useState('')

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('reservas')
        .select('*, usuario:profiles!reservas_usuario_id_fkey(nombre, apellido, email, telefono)')
        .eq('tipo', 'videollamada')
        .neq('estado', 'cancelada')
        .order('fecha', { ascending: true })

      setReservasVideo(data || [])
      setLoading(false)
    }
    load()
  }, [])

  const generarJitsi = async (reservaId: string) => {
    setGenerando(reservaId)
    const { data, error } = await supabase.rpc('generar_sala_jitsi', { reserva_id: reservaId })

    if (!error && data) {
      const url = `https://meet.jit.si/${data}`
      const reserva = reservasVideo.find(r => r.id === reservaId)
      if (reserva) {
        await supabase.from('notificaciones').insert({
          usuario_id: reserva.usuario_id,
          tipo: 'videollamada',
          titulo: '📹 Tu link de videollamada está listo',
          contenido: `Link generado para tu sesión del ${format(parseISO(reserva.fecha), "d 'de' MMMM", { locale: es })} a las ${reserva.hora_inicio}.`,
          url: '/reservas',
        })
      }

      setReservasVideo(prev =>
        prev.map(r => r.id === reservaId ? { ...r, jitsi_room: data, jitsi_url: url } : r)
      )
      toast.success('Link de Jitsi creado y enviado al cliente')
    } else {
      toast.error('Error al generar el link')
    }
    setGenerando(null)
  }

  const copiarLink = async (url: string, id: string) => {
    await navigator.clipboard.writeText(url)
    setCopiado(id)
    toast.success('Link copiado al portapapeles')
    setTimeout(() => setCopiado(null), 2000)
  }

  const generarSalaRapida = () => {
    const sala = 'tarot-' + Math.random().toString(36).substring(2, 10)
    setSalaGenerada(`https://meet.jit.si/${sala}`)
    setSalaManual(sala)
  }

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="font-serif text-2xl font-bold text-star flex items-center gap-2">
            <Video className="w-6 h-6 text-gold-light" />
            Videollamadas
          </h1>
          <p className="text-star/50 text-sm">Gestión de sesiones por Jitsi Meet</p>
        </div>

        {/* Crear sala rápida */}
        <div className="card-mystic p-6">
          <h2 className="font-semibold text-violet-light mb-4 flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Crear sala de videollamada rápida
          </h2>
          <p className="text-star/50 text-sm mb-4">
            Generá un link de Jitsi Meet instantáneo para compartir con un cliente por WhatsApp o email.
          </p>

          <div className="flex gap-3 flex-col sm:flex-row">
            <div className="flex-1">
              <input
                type="text"
                className="input-mystic"
                placeholder="Nombre de sala (ej: tarot-maria-garcia)"
                value={salaManual}
                onChange={e => {
                  setSalaManual(e.target.value)
                  setSalaGenerada(e.target.value ? `https://meet.jit.si/${e.target.value}` : '')
                }}
              />
            </div>
            <button onClick={generarSalaRapida} className="btn-ghost flex items-center gap-2 py-3 px-4 whitespace-nowrap">
              <Star className="w-4 h-4 text-gold-light" />
              Generar automático
            </button>
          </div>

          {salaGenerada && (
            <div className="mt-4 p-4 bg-violet-deep/30 rounded-xl border border-violet-glow/20">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-xs text-star/40 mb-1">Link generado</div>
                  <div className="text-sm text-violet-light font-mono break-all">{salaGenerada}</div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => copiarLink(salaGenerada, 'manual')}
                    className="p-2.5 rounded-xl bg-violet-deep/50 hover:bg-violet-deep text-violet-light transition-colors border border-violet-glow/20"
                    title="Copiar link"
                  >
                    {copiado === 'manual' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                  <a href={salaGenerada} target="_blank" rel="noopener noreferrer"
                    className="p-2.5 rounded-xl bg-violet-deep/50 hover:bg-violet-deep text-violet-light transition-colors border border-violet-glow/20"
                    title="Abrir sala">
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>

              {/* Compartir por WhatsApp */}
              <div className="mt-3 pt-3 border-t border-violet-glow/10">
                <p className="text-xs text-star/40 mb-2">Compartir con cliente:</p>
                <div className="flex gap-2">
                  <a
                    href={`https://wa.me/543442674304?text=Hola! Tu link de videollamada para la sesión de tarot: ${salaGenerada}`}
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 text-xs bg-green-500/20 hover:bg-green-500/30 text-green-400 px-3 py-2 rounded-lg transition-colors"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    Enviar por WhatsApp
                  </a>
                  <a href={`mailto:?subject=Link videollamada Tarot Online&body=Tu sesión de tarot: ${salaGenerada}`}
                    className="flex items-center gap-2 text-xs bg-violet-deep/40 hover:bg-violet-deep text-violet-light px-3 py-2 rounded-lg transition-colors">
                    📧 Por email
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Info Jitsi */}
        <div className="flex gap-3 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
          <Video className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <div className="font-semibold text-blue-300 mb-1">¿Cómo funciona Jitsi Meet?</div>
            <p className="text-star/60">
              Jitsi Meet es una plataforma de videollamadas <strong className="text-star/80">gratuita y sin registro</strong>. 
              Vos y el cliente solo necesitan hacer clic en el link. No requiere instalar nada. 
              Las salas son privadas por nombre único.
            </p>
          </div>
        </div>

        {/* Videollamadas de reservas */}
        <div>
          <h2 className="font-semibold text-violet-light mb-4">Videollamadas de reservas</h2>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <Star className="w-6 h-6 text-gold-light animate-twinkle" />
            </div>
          ) : reservasVideo.length === 0 ? (
            <div className="card-mystic p-8 text-center text-star/40">
              <div className="text-3xl mb-2">📹</div>
              <p className="text-sm">No hay videollamadas reservadas</p>
            </div>
          ) : (
            <div className="space-y-3">
              {reservasVideo.map((r) => (
                <div key={r.id} className="card-glow p-5">
                  <div className="flex items-center gap-4">
                    <div className="text-2xl">📹</div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-star">
                        {r.usuario?.nombre} {r.usuario?.apellido}
                      </div>
                      <div className="text-xs text-star/50">
                        {format(parseISO(r.fecha), "EEEE d 'de' MMMM, yyyy", { locale: es })} · {r.hora_inicio}
                      </div>
                      {r.usuario?.email && (
                        <div className="text-xs text-star/30 mt-0.5">{r.usuario.email}</div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`status-${r.estado}`}>{r.estado}</span>

                      {!r.jitsi_url && r.estado === 'confirmada' && (
                        <button onClick={() => generarJitsi(r.id)} disabled={generando === r.id}
                          className="btn-primary text-xs py-2 px-3 flex items-center gap-1.5">
                          {generando === r.id
                            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            : <Video className="w-3.5 h-3.5" />
                          }
                          {generando === r.id ? 'Creando...' : 'Crear link'}
                        </button>
                      )}
                    </div>
                  </div>

                  {r.jitsi_url && (
                    <div className="mt-4 pt-4 border-t border-violet-glow/10">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 font-mono text-xs text-violet-light bg-violet-deep/30 rounded-lg px-3 py-2 break-all">
                          {r.jitsi_url}
                        </div>
                        <button onClick={() => copiarLink(r.jitsi_url, r.id)}
                          className="p-2.5 rounded-xl bg-violet-deep/50 hover:bg-violet-deep text-violet-light transition-colors border border-violet-glow/20 flex-shrink-0">
                          {copiado === r.id ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                        </button>
                        <a href={r.jitsi_url} target="_blank" rel="noopener noreferrer"
                          className="p-2.5 rounded-xl bg-violet-soft hover:bg-violet-700 text-white transition-colors flex-shrink-0">
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                      <div className="mt-2 flex gap-2">
                        {r.usuario?.telefono && (
                          <a
                            href={`https://wa.me/${r.usuario.telefono.replace(/\D/g, '')}?text=Hola ${r.usuario.nombre}! Tu link para la videollamada de tarot: ${r.jitsi_url}`}
                            target="_blank" rel="noopener noreferrer"
                            className="text-xs flex items-center gap-1.5 text-green-400 hover:text-green-300 transition-colors">
                            📱 Enviar por WhatsApp
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
