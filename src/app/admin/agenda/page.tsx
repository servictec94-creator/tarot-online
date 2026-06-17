'use client'

import { useEffect, useState } from 'react'
import { Calendar, Clock, Check, X, ChevronLeft, ChevronRight, Star, Video } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import AdminLayout from '@/components/admin/AdminLayout'
import { format, addDays, startOfWeek, isSameDay, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import toast from 'react-hot-toast'

const HORAS = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30', '18:00',
]

export default function AdminAgendaPage() {
  const supabase = createClient()
  const [reservas, setReservas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }))
  const [selectedReserva, setSelectedReserva] = useState<any>(null)
  const [creandoJitsi, setCreandoJitsi] = useState<string | null>(null)

  const diasSemana = Array.from({ length: 6 }, (_, i) => addDays(weekStart, i))

  const cargar = async () => {
    const desde = format(weekStart, 'yyyy-MM-dd')
    const hasta = format(addDays(weekStart, 6), 'yyyy-MM-dd')

    const { data } = await supabase
      .from('reservas')
      .select('*, usuario:profiles!reservas_usuario_id_fkey(nombre, apellido, email, telefono)')
      .gte('fecha', desde)
      .lte('fecha', hasta)
      .neq('estado', 'cancelada')
      .order('hora_inicio', { ascending: true })

    setReservas(data || [])
    setLoading(false)
  }

  useEffect(() => { cargar() }, [weekStart])

  const getReservasDia = (dia: Date) =>
    reservas.filter(r => isSameDay(parseISO(r.fecha), dia))

  const confirmarReserva = async (id: string) => {
    await supabase.from('reservas').update({ estado: 'confirmada' }).eq('id', id)

    // Notificar cliente
    const reserva = reservas.find(r => r.id === id)
    if (reserva) {
      await supabase.from('notificaciones').insert({
        usuario_id: reserva.usuario_id,
        tipo: 'reserva',
        titulo: '✅ Reserva confirmada',
        contenido: `Tu turno del ${format(parseISO(reserva.fecha), "d 'de' MMMM", { locale: es })} a las ${reserva.hora_inicio} fue confirmado.`,
        url: '/reservas',
      })
    }

    toast.success('Reserva confirmada')
    cargar()
    setSelectedReserva(null)
  }

  const cancelarReserva = async (id: string) => {
    await supabase.from('reservas').update({ estado: 'cancelada' }).eq('id', id)

    const reserva = reservas.find(r => r.id === id)
    if (reserva) {
      await supabase.from('notificaciones').insert({
        usuario_id: reserva.usuario_id,
        tipo: 'reserva',
        titulo: '❌ Reserva cancelada',
        contenido: `Tu reserva del ${format(parseISO(reserva.fecha), "d 'de' MMMM", { locale: es })} fue cancelada. Podés reagendarla.`,
        url: '/reservas',
      })
    }

    toast.success('Reserva cancelada')
    cargar()
    setSelectedReserva(null)
  }

  const generarJitsi = async (reservaId: string) => {
    setCreandoJitsi(reservaId)
    const { data, error } = await supabase.rpc('generar_sala_jitsi', { reserva_id: reservaId })

    if (!error && data) {
      const reserva = reservas.find(r => r.id === reservaId)
      if (reserva) {
        await supabase.from('notificaciones').insert({
          usuario_id: reserva.usuario_id,
          tipo: 'videollamada',
          titulo: '📹 Link de videollamada listo',
          contenido: `Tu sesión del ${format(parseISO(reserva.fecha), "d 'de' MMMM", { locale: es })} a las ${reserva.hora_inicio} tiene un link de videollamada listo.`,
          url: '/reservas',
          metadata: { jitsi_url: `https://meet.jit.si/${data}` },
        })
      }
      toast.success('Link de Jitsi generado y enviado al cliente')
      cargar()
    } else {
      toast.error('Error al generar el link')
    }
    setCreandoJitsi(null)
  }

  const colorEstado: Record<string, string> = {
    pendiente: 'border-l-amber-400 bg-amber-500/10',
    confirmada: 'border-l-violet-400 bg-violet-500/10',
    completada: 'border-l-emerald-400 bg-emerald-500/10',
  }

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto space-y-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-serif text-2xl font-bold text-star flex items-center gap-2">
              <Calendar className="w-6 h-6 text-gold-light" />
              Agenda
            </h1>
            <p className="text-star/50 text-sm">{reservas.length} turnos esta semana</p>
          </div>
          {/* Navegación semana */}
          <div className="flex items-center gap-3">
            <button onClick={() => setWeekStart(addDays(weekStart, -7))}
              className="p-2 rounded-xl hover:bg-violet-deep/30 text-star/60 hover:text-violet-light transition-colors border border-violet-glow/15">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-sm font-medium text-star/70 min-w-[200px] text-center">
              {format(weekStart, "d MMM", { locale: es })} — {format(addDays(weekStart, 5), "d MMM yyyy", { locale: es })}
            </span>
            <button onClick={() => setWeekStart(addDays(weekStart, 7))}
              className="p-2 rounded-xl hover:bg-violet-deep/30 text-star/60 hover:text-violet-light transition-colors border border-violet-glow/15">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Vista semanal */}
        <div className="card-mystic overflow-hidden">
          {/* Header días */}
          <div className="grid grid-cols-7 border-b border-violet-glow/10">
            <div className="p-3 text-xs text-star/30 font-medium">Hora</div>
            {diasSemana.map((dia) => {
              const esHoy = isSameDay(dia, new Date())
              return (
                <div key={dia.toISOString()} className={`p-3 text-center border-l border-violet-glow/10 ${esHoy ? 'bg-violet-deep/30' : ''}`}>
                  <div className={`text-xs font-medium capitalize ${esHoy ? 'text-violet-light' : 'text-star/50'}`}>
                    {format(dia, 'EEE', { locale: es })}
                  </div>
                  <div className={`text-lg font-bold ${esHoy ? 'text-violet-glow' : 'text-star'}`}>
                    {format(dia, 'd')}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Cuerpo con horas */}
          <div className="overflow-y-auto max-h-[500px]">
            {HORAS.map((hora) => (
              <div key={hora} className="grid grid-cols-7 border-b border-violet-glow/5 min-h-[52px]">
                <div className="p-2 text-xs text-star/30 flex items-start pt-2">{hora}</div>
                {diasSemana.map((dia) => {
                  const reservasDia = getReservasDia(dia)
                  const reservaHora = reservasDia.find(r => r.hora_inicio.substring(0, 5) === hora)
                  return (
                    <div key={dia.toISOString()} className="border-l border-violet-glow/5 p-1">
                      {reservaHora && (
                        <button
                          onClick={() => setSelectedReserva(reservaHora)}
                          className={`w-full text-left p-1.5 rounded-lg border-l-2 text-xs ${colorEstado[reservaHora.estado] || 'border-l-gray-400 bg-gray-500/10'} hover:opacity-80 transition-opacity`}
                        >
                          <div className="font-semibold text-star truncate">
                            {reservaHora.usuario?.nombre}
                          </div>
                          <div className="text-star/50 flex items-center gap-1">
                            {reservaHora.tipo === 'videollamada' ? '📹' : reservaHora.tipo === 'chat' ? '💬' : '✉️'}
                            {reservaHora.hora_inicio}
                          </div>
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Listado de esta semana */}
        <div>
          <h2 className="font-semibold text-violet-light mb-3">Todos los turnos de la semana</h2>
          {reservas.length === 0 ? (
            <div className="card-mystic p-8 text-center text-star/40">
              <div className="text-3xl mb-2">📅</div>
              <p className="text-sm">No hay turnos esta semana</p>
            </div>
          ) : (
            <div className="space-y-2">
              {reservas.sort((a, b) => a.fecha.localeCompare(b.fecha) || a.hora_inicio.localeCompare(b.hora_inicio))
                .map((r) => (
                  <div key={r.id} className="card-glow p-4 flex items-center gap-4">
                    <div className="text-2xl flex-shrink-0">
                      {r.tipo === 'videollamada' ? '📹' : r.tipo === 'chat' ? '💬' : '✉️'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-star">
                        {r.usuario?.nombre} {r.usuario?.apellido}
                      </div>
                      <div className="text-xs text-star/50 flex items-center gap-2">
                        <Clock className="w-3 h-3" />
                        {format(parseISO(r.fecha), "EEEE d 'de' MMMM", { locale: es })} · {r.hora_inicio}
                        <span className="capitalize">· {r.tipo?.replace('_', ' ')}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`status-${r.estado}`}>{r.estado}</span>
                      {r.estado === 'pendiente' && (
                        <>
                          <button onClick={() => confirmarReserva(r.id)}
                            className="p-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 transition-colors"
                            title="Confirmar">
                            <Check className="w-4 h-4" />
                          </button>
                          <button onClick={() => cancelarReserva(r.id)}
                            className="p-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-colors"
                            title="Cancelar">
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      {r.tipo === 'videollamada' && r.estado === 'confirmada' && !r.jitsi_url && (
                        <button
                          onClick={() => generarJitsi(r.id)}
                          disabled={creandoJitsi === r.id}
                          className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1"
                        >
                          <Video className="w-3.5 h-3.5" />
                          {creandoJitsi === r.id ? 'Generando...' : 'Crear link'}
                        </button>
                      )}
                      {r.jitsi_url && (
                        <a href={r.jitsi_url} target="_blank" rel="noopener noreferrer"
                          className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1">
                          <Video className="w-3.5 h-3.5" />
                          Unirse
                        </a>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal detalle reserva */}
      {selectedReserva && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedReserva(null)}>
          <div className="card-mystic p-6 max-w-md w-full" onClick={e => e.stopPropagation()}>
            <h3 className="font-serif text-xl text-star mb-4">Detalle del turno</h3>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-star/50">Cliente</span>
                <span className="text-star font-semibold">
                  {selectedReserva.usuario?.nombre} {selectedReserva.usuario?.apellido}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-star/50">Email</span>
                <span className="text-star">{selectedReserva.usuario?.email}</span>
              </div>
              {selectedReserva.usuario?.telefono && (
                <div className="flex justify-between text-sm">
                  <span className="text-star/50">Teléfono</span>
                  <span className="text-star">{selectedReserva.usuario?.telefono}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-star/50">Tipo</span>
                <span className="text-star capitalize">{selectedReserva.tipo?.replace('_', ' ')}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-star/50">Fecha</span>
                <span className="text-star">
                  {format(parseISO(selectedReserva.fecha), "EEEE d 'de' MMMM, yyyy", { locale: es })}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-star/50">Hora</span>
                <span className="text-star">{selectedReserva.hora_inicio}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-star/50">Estado</span>
                <span className={`status-${selectedReserva.estado}`}>{selectedReserva.estado}</span>
              </div>
              {selectedReserva.notas && (
                <div className="text-sm">
                  <span className="text-star/50 block mb-1">Notas</span>
                  <p className="text-star/80 text-xs bg-nebula/50 rounded-lg p-3">{selectedReserva.notas}</p>
                </div>
              )}
              {selectedReserva.jitsi_url && (
                <div className="text-sm">
                  <span className="text-star/50 block mb-1">Link videollamada</span>
                  <a href={selectedReserva.jitsi_url} target="_blank" rel="noopener noreferrer"
                    className="text-violet-light text-xs hover:underline break-all">
                    {selectedReserva.jitsi_url}
                  </a>
                </div>
              )}
            </div>
            <div className="flex gap-3">
              {selectedReserva.estado === 'pendiente' && (
                <>
                  <button onClick={() => confirmarReserva(selectedReserva.id)}
                    className="btn-primary flex-1 flex items-center justify-center gap-2 text-sm py-2.5">
                    <Check className="w-4 h-4" /> Confirmar
                  </button>
                  <button onClick={() => cancelarReserva(selectedReserva.id)}
                    className="btn-ghost flex-1 flex items-center justify-center gap-2 text-sm py-2.5 border-red-500/30 text-red-400 hover:bg-red-900/20">
                    <X className="w-4 h-4" /> Cancelar
                  </button>
                </>
              )}
              {selectedReserva.tipo === 'videollamada' && selectedReserva.estado === 'confirmada' && !selectedReserva.jitsi_url && (
                <button onClick={() => generarJitsi(selectedReserva.id)}
                  disabled={creandoJitsi === selectedReserva.id}
                  className="btn-gold flex-1 flex items-center justify-center gap-2 text-sm py-2.5">
                  <Video className="w-4 h-4" />
                  {creandoJitsi === selectedReserva.id ? 'Generando...' : 'Generar link Jitsi'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
