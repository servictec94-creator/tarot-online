'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Star, Video, ArrowLeft, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import DashboardLayout from '@/components/layout/DashboardLayout'
import JitsiMeet from '@/components/ui/JitsiMeet'
import type { Profile, Reserva } from '@/types/database'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'

export default function VideoLlamadaPage() {
  const { id } = useParams()
  const router = useRouter()
  const supabase = createClient()

  const [reserva, setReserva] = useState<Reserva | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [enLlamada, setEnLlamada] = useState(false)

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }

      const [{ data: res }, { data: prof }] = await Promise.all([
        supabase.from('reservas').select('*').eq('id', id).single(),
        supabase.from('profiles').select('*').eq('id', user.id).single(),
      ])

      setReserva(res)
      setProfile(prof)
      setLoading(false)
    }
    load()
  }, [id])

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Star className="w-7 h-7 text-gold-light animate-twinkle" />
        </div>
      </DashboardLayout>
    )
  }

  if (!reserva?.jitsi_room) {
    return (
      <DashboardLayout>
        <div className="max-w-lg mx-auto mt-16 text-center">
          <div className="card-mystic p-10">
            <AlertCircle className="w-12 h-12 text-amber-400 mx-auto mb-4" />
            <h2 className="font-serif text-xl text-star mb-3">Sala no disponible todavía</h2>
            <p className="text-star/60 text-sm mb-6">
              El link de videollamada aún no fue generado. La tarotista lo creará antes de la sesión
              y te notificaremos por este panel.
            </p>
            <Link href="/reservas" className="btn-ghost text-sm inline-flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Volver a reservas
            </Link>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-5">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Link href="/reservas" className="p-2 rounded-xl hover:bg-violet-deep/30 text-star/50 hover:text-star transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="font-serif text-xl font-bold text-star flex items-center gap-2">
              <Video className="w-5 h-5 text-gold-light" />
              Videollamada con Tarotista
            </h1>
            {reserva.fecha && (
              <p className="text-star/50 text-sm">
                {format(parseISO(reserva.fecha), "EEEE d 'de' MMMM", { locale: es })} · {reserva.hora_inicio}
              </p>
            )}
          </div>
        </div>

        {/* Info session */}
        <div className="card-mystic p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-violet-deep flex items-center justify-center text-lg">🔮</div>
          <div className="flex-1">
            <div className="text-sm font-semibold text-star">Sesión de tarot por videollamada</div>
            <div className="text-xs text-star/50">Sala: {reserva.jitsi_room}</div>
          </div>
          <span className={`status-${reserva.estado}`}>{reserva.estado}</span>
        </div>

        {/* Jitsi embed o botón unirse */}
        {!enLlamada ? (
          <div className="card-mystic p-10 text-center">
            <div className="w-20 h-20 rounded-full bg-violet-deep/60 flex items-center justify-center mx-auto mb-6 text-4xl shadow-mystic border border-violet-glow/30">
              📹
            </div>
            <h2 className="font-serif text-2xl text-star mb-3">¿Lista/o para la sesión?</h2>
            <p className="text-star/60 text-sm mb-8 max-w-sm mx-auto">
              Al unirte, se abrirá la videollamada con la tarotista.
              Asegurate de tener el micrófono y cámara listos.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => setEnLlamada(true)}
                className="btn-gold flex items-center gap-2 px-8 py-3.5"
              >
                <Video className="w-5 h-5" />
                Unirme a la videollamada
              </button>
              <a
                href={reserva.jitsi_url || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-ghost flex items-center gap-2 px-6 py-3"
              >
                Abrir en nueva pestaña
              </a>
            </div>

            <div className="mt-8 p-4 rounded-xl bg-violet-deep/20 border border-violet-glow/10 text-xs text-star/50 max-w-md mx-auto">
              <p>💡 <strong>Tip:</strong> Si tenés problemas con la videollamada integrada, usá el botón
              "Abrir en nueva pestaña" para acceder directamente a Jitsi Meet.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <JitsiMeet
              roomName={reserva.jitsi_room}
              displayName={`${profile?.nombre || 'Cliente'} ${profile?.apellido || ''}`}
              onClose={() => setEnLlamada(false)}
            />
            <div className="flex justify-center">
              <button
                onClick={() => setEnLlamada(false)}
                className="btn-ghost text-sm flex items-center gap-2 text-red-400 border-red-400/20 hover:bg-red-900/20"
              >
                Salir de la videollamada
              </button>
            </div>
          </div>
        )}

        {/* Notas de la sesión */}
        {reserva.notas && (
          <div className="card-mystic p-4">
            <p className="text-xs text-star/40 mb-1">Notas de la reserva</p>
            <p className="text-sm text-star/70">{reserva.notas}</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
