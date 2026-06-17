'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Star, Loader2, ChevronLeft, ChevronRight, Clock, Video, MessageCircle, Calendar } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import DashboardLayout from '@/components/layout/DashboardLayout'
import type { Reserva } from '@/types/database'
import { format, addDays, startOfDay, isBefore, isSameDay } from 'date-fns'
import { es } from 'date-fns/locale'
import toast from 'react-hot-toast'

const horariosBase = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
  '17:00', '17:30',
]

const tiposReserva = [
  { value: 'videollamada', label: 'Videollamada', emoji: '📹', desc: '30 minutos en vivo', precio: '$4.000' },
  { value: 'chat', label: 'Chat en vivo', emoji: '💬', desc: '45 minutos por chat', precio: '$3.000' },
  { value: 'consulta_escrita', label: 'Consulta escrita', emoji: '✉️', desc: 'Respuesta detallada', precio: '$2.500' },
]

export default function ReservasPage() {
  const router = useRouter()
  const supabase = createClient()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [reservasExistentes, setReservasExistentes] = useState<Reserva[]>([])
  const [misReservas, setMisReservas] = useState<Reserva[]>([])
  const [userId, setUserId] = useState('')

  const [selectedTipo, setSelectedTipo] = useState('videollamada')
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedHora, setSelectedHora] = useState('')
  const [notas, setNotas] = useState('')

  // Para el calendario simple
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfDay(new Date()))

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      setUserId(user.id)

      const [{ data: reservas }, { data: mis }] = await Promise.all([
        supabase.from('reservas').select('fecha, hora_inicio').eq('estado', 'confirmada'),
        supabase.from('reservas').select('*').eq('usuario_id', user.id)
          .gte('fecha', new Date().toISOString().split('T')[0])
          .order('fecha', { ascending: true }),
      ])

      setReservasExistentes(reservas || [])
      setMisReservas(mis || [])
    }
    load()
  }, [])

  const horariosOcupados = (fecha: Date) => {
    const fechaStr = format(fecha, 'yyyy-MM-dd')
    return reservasExistentes
      .filter(r => r.fecha === fechaStr)
      .map(r => r.hora_inicio.substring(0, 5))
  }

  const isHorarioDisponible = (hora: string) => {
    if (!selectedDate) return false
    const ocupados = horariosOcupados(selectedDate)
    return !ocupados.includes(hora)
  }

  const getDiasCalendario = () => {
    return Array.from({ length: 14 }, (_, i) => addDays(new Date(), i + 1))
      .filter(d => d.getDay() !== 0) // sin domingos
  }

  const confirmarReserva = async () => {
    if (!selectedDate || !selectedHora) return
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const fechaStr = format(selectedDate, 'yyyy-MM-dd')
    const [h, m] = selectedHora.split(':')
    const horaFin = `${String(parseInt(h) + (selectedTipo === 'chat' ? 0 : 0)).padStart(2,'0')}:${String(parseInt(m) + 30).padStart(2,'0')}`

    const { data: reserva, error } = await supabase.from('reservas').insert({
      usuario_id: user.id,
      fecha: fechaStr,
      hora_inicio: selectedHora,
      hora_fin: horaFin,
      tipo: selectedTipo as any,
      estado: 'pendiente',
      notas: notas || null,
    }).select().single()

    if (error) {
      toast.error('Error al crear la reserva. Intentá nuevamente.')
      setLoading(false)
      return
    }

    // Notificación
    await supabase.from('notificaciones').insert({
      usuario_id: user.id,
      tipo: 'reserva',
      titulo: 'Reserva enviada',
      contenido: `Tu reserva para el ${format(selectedDate, "d 'de' MMMM", { locale: es })} a las ${selectedHora} fue recibida. Te confirmaremos pronto.`,
      url: '/reservas',
    })

    toast.success('¡Reserva enviada! Te confirmaremos por mensaje.')
    setStep(4)
    setLoading(false)

    const { data: mis } = await supabase.from('reservas').select('*')
      .eq('usuario_id', user.id)
      .gte('fecha', new Date().toISOString().split('T')[0])
      .order('fecha', { ascending: true })
    setMisReservas(mis || [])
  }

  const cancelarReserva = async (id: string) => {
    await supabase.from('reservas').update({ estado: 'cancelada' }).eq('id', id)
    toast.success('Reserva cancelada')
    const { data: mis } = await supabase.from('reservas').select('*')
      .eq('usuario_id', userId)
      .gte('fecha', new Date().toISOString().split('T')[0])
      .order('fecha', { ascending: true })
    setMisReservas(mis || [])
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="font-serif text-2xl font-bold text-star">Reservar Turno</h1>
          <p className="text-star/50 text-sm">Elegí el día y horario para tu sesión</p>
        </div>

        {/* Mis próximas reservas */}
        {misReservas.length > 0 && (
          <div>
            <h2 className="font-semibold text-violet-light mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4" /> Mis próximas reservas
            </h2>
            <div className="space-y-2">
              {misReservas.map((r) => (
                <div key={r.id} className="card-mystic p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-xl">
                      {r.tipo === 'videollamada' ? '📹' : r.tipo === 'chat' ? '💬' : '✉️'}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-star capitalize">
                        {r.tipo.replace('_', ' ')}
                      </div>
                      <div className="text-xs text-star/50">
                        {format(new Date(r.fecha + 'T00:00:00'), "EEEE d 'de' MMMM", { locale: es })} · {r.hora_inicio}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`status-${r.estado}`}>{r.estado}</span>
                    {r.jitsi_url && r.estado === 'confirmada' && (
                      <a href={r.jitsi_url} target="_blank" rel="noopener noreferrer"
                        className="btn-primary text-xs py-1.5 px-3">
                        Unirse
                      </a>
                    )}
                    {r.estado === 'pendiente' && (
                      <button onClick={() => cancelarReserva(r.id)}
                        className="text-xs text-red-400 hover:text-red-300 transition-colors">
                        Cancelar
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Wizard de nueva reserva */}
        <div className="card-mystic">
          {/* Progress */}
          <div className="px-6 pt-6 pb-0">
            <div className="flex items-center gap-2 mb-6">
              {[
                { n: 1, label: 'Tipo' },
                { n: 2, label: 'Fecha' },
                { n: 3, label: 'Confirmar' },
              ].map(({ n, label }) => (
                <div key={n} className="flex items-center gap-2 flex-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all
                    ${step >= n ? 'bg-violet-soft text-white' : 'bg-nebula text-star/40 border border-violet-glow/20'}`}>
                    {step > n ? '✓' : n}
                  </div>
                  <span className={`text-xs font-medium hidden sm:block ${step >= n ? 'text-violet-light' : 'text-star/30'}`}>
                    {label}
                  </span>
                  {n < 3 && <div className={`flex-1 h-px ${step > n ? 'bg-violet-soft' : 'bg-violet-glow/15'}`} />}
                </div>
              ))}
            </div>
          </div>

          <div className="p-6">
            {/* Step 1: Tipo */}
            {step === 1 && (
              <div className="space-y-4">
                <h2 className="font-serif text-xl text-star mb-4">¿Qué tipo de sesión querés?</h2>
                {tiposReserva.map((tipo) => (
                  <label key={tipo.value}
                    className={`flex items-center gap-4 p-5 rounded-xl border cursor-pointer transition-all
                      ${selectedTipo === tipo.value
                        ? 'border-violet-glow bg-violet-deep/40 shadow-mystic'
                        : 'border-violet-glow/15 hover:border-violet-glow/40'
                      }`}
                  >
                    <input type="radio" name="tipo" value={tipo.value}
                      checked={selectedTipo === tipo.value}
                      onChange={(e) => setSelectedTipo(e.target.value)}
                      className="sr-only"
                    />
                    <span className="text-3xl">{tipo.emoji}</span>
                    <div className="flex-1">
                      <div className="font-semibold text-star">{tipo.label}</div>
                      <div className="text-sm text-star/50">{tipo.desc}</div>
                    </div>
                    <div className="text-gold-light font-bold">{tipo.precio}</div>
                  </label>
                ))}
                <button onClick={() => setStep(2)} className="btn-primary w-full mt-4 flex items-center justify-center gap-2">
                  Elegir fecha <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Step 2: Fecha y hora */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <button onClick={() => setStep(1)} className="p-2 rounded-xl hover:bg-violet-deep/30 text-star/50">
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <h2 className="font-serif text-xl text-star">Elegí fecha y horario</h2>
                  <div />
                </div>

                {/* Calendario de días */}
                <div>
                  <p className="text-sm text-star/50 mb-3">Seleccioná un día</p>
                  <div className="grid grid-cols-5 sm:grid-cols-7 gap-2">
                    {getDiasCalendario().map((dia) => {
                      const esSelected = selectedDate && isSameDay(dia, selectedDate)
                      const esPasado = isBefore(dia, new Date())
                      return (
                        <button
                          key={dia.toISOString()}
                          onClick={() => { setSelectedDate(dia); setSelectedHora('') }}
                          disabled={esPasado}
                          className={`p-2.5 rounded-xl border text-center transition-all disabled:opacity-30
                            ${esSelected
                              ? 'bg-violet-soft border-violet-glow text-white shadow-mystic'
                              : 'border-violet-glow/15 hover:border-violet-glow/40 text-star/70'
                            }`}
                        >
                          <div className="text-xs text-star/50 capitalize">
                            {format(dia, 'EEE', { locale: es })}
                          </div>
                          <div className="font-bold text-sm">{format(dia, 'd')}</div>
                          <div className="text-xs text-star/40">{format(dia, 'MMM', { locale: es })}</div>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Horarios */}
                {selectedDate && (
                  <div>
                    <p className="text-sm text-star/50 mb-3">
                      Horarios disponibles — {format(selectedDate, "EEEE d 'de' MMMM", { locale: es })}
                    </p>
                    <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                      {horariosBase.map((hora) => {
                        const disponible = isHorarioDisponible(hora)
                        return (
                          <button
                            key={hora}
                            onClick={() => disponible && setSelectedHora(hora)}
                            disabled={!disponible}
                            className={`py-2 px-3 rounded-lg text-sm font-medium border transition-all
                              ${!disponible ? 'opacity-30 cursor-not-allowed border-transparent bg-nebula/30' :
                                selectedHora === hora
                                  ? 'bg-violet-soft border-violet-glow text-white shadow-mystic'
                                  : 'border-violet-glow/20 hover:border-violet-glow/60 text-star/70'
                              }`}
                          >
                            <Clock className="w-3 h-3 mx-auto mb-0.5 opacity-60" />
                            {hora}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}

                <button
                  onClick={() => setStep(3)}
                  disabled={!selectedDate || !selectedHora}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  Continuar <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Step 3: Confirmar */}
            {step === 3 && selectedDate && (
              <div className="space-y-5">
                <div className="flex items-center gap-3">
                  <button onClick={() => setStep(2)} className="p-2 rounded-xl hover:bg-violet-deep/30 text-star/50">
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <h2 className="font-serif text-xl text-star">Confirmar reserva</h2>
                </div>

                <div className="bg-violet-deep/30 border border-violet-glow/20 rounded-xl p-5 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-star/60">Tipo</span>
                    <span className="text-star font-semibold capitalize">{selectedTipo.replace('_', ' ')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-star/60">Fecha</span>
                    <span className="text-star font-semibold">
                      {format(selectedDate, "EEEE d 'de' MMMM, yyyy", { locale: es })}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-star/60">Horario</span>
                    <span className="text-star font-semibold">{selectedHora} hs</span>
                  </div>
                  <div className="flex justify-between text-sm border-t border-violet-glow/10 pt-3">
                    <span className="text-star/60">Precio</span>
                    <span className="text-gold-light font-bold">
                      {tiposReserva.find(t => t.value === selectedTipo)?.precio}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="label-mystic">Notas adicionales (opcional)</label>
                  <textarea
                    className="input-mystic resize-none h-24"
                    placeholder="¿Hay algo específico que quieras tratar en la sesión?"
                    value={notas}
                    onChange={(e) => setNotas(e.target.value)}
                  />
                </div>

                <div className="flex items-start gap-3 p-4 rounded-xl bg-violet-deep/20 border border-violet-glow/15 text-xs text-star/50">
                  <Star className="w-4 h-4 text-gold-light flex-shrink-0 mt-0.5" />
                  <span>
                    Al confirmar la reserva, te enviaremos los detalles para el pago. 
                    Para videollamadas recibirás el link de Jitsi Meet una vez confirmada.
                  </span>
                </div>

                <button
                  onClick={confirmarReserva}
                  disabled={loading}
                  className="btn-gold w-full flex items-center justify-center gap-2 py-4"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Star className="w-5 h-5" />}
                  {loading ? 'Reservando...' : 'Confirmar reserva'}
                </button>
              </div>
            )}

            {/* Step 4: Éxito */}
            {step === 4 && (
              <div className="text-center py-8">
                <div className="text-6xl mb-4 animate-float">🌙</div>
                <h2 className="font-serif text-2xl text-star mb-3">¡Reserva enviada!</h2>
                <p className="text-star/60 mb-6 max-w-sm mx-auto">
                  Recibimos tu solicitud. Te confirmaremos el turno por mensaje en las próximas horas.
                </p>
                <div className="flex gap-3 justify-center">
                  <button onClick={() => setStep(1)} className="btn-ghost text-sm py-2 px-4">
                    Nueva reserva
                  </button>
                  <a
                    href={`https://wa.me/543442674304?text=Hola! Acabo de reservar un turno en el sistema. Quería confirmar.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary text-sm py-2 px-4"
                  >
                    Confirmar por WhatsApp
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
