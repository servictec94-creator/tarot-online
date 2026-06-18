'use client'

import { useEffect, useState } from 'react'
import {
  Calendar,
  Clock,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  Video,
} from 'lucide-react'
import { createClient } from '@/lib/supabase'
import AdminLayout from '@/components/admin/AdminLayout'
import {
  format,
  addDays,
  startOfWeek,
  isSameDay,
  parseISO,
} from 'date-fns'
import { es } from 'date-fns/locale'
import toast from 'react-hot-toast'

type Reserva = {
  id: string
  usuario_id: string
  fecha: string
  hora_inicio: string
  estado: string
  tipo: string
  jitsi_url?: string | null
  notas?: string | null
  usuario?: {
    nombre?: string
    apellido?: string
    email?: string
    telefono?: string
  }
}

const HORAS = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
  '17:00', '17:30', '18:00',
]

export default function AdminAgendaPage() {
  const supabase = createClient()

  const [reservas, setReservas] = useState<Reserva[]>([])
  const [loading, setLoading] = useState(true)
  const [weekStart, setWeekStart] = useState(
    startOfWeek(new Date(), { weekStartsOn: 1 })
  )

  const [selectedReserva, setSelectedReserva] =
    useState<Reserva | null>(null)

  const [creandoJitsi, setCreandoJitsi] = useState<string | null>(null)

  const diasSemana = Array.from({ length: 6 }, (_, i) =>
    addDays(weekStart, i)
  )

  const cargar = async () => {
    const desde = format(weekStart, 'yyyy-MM-dd')
    const hasta = format(addDays(weekStart, 6), 'yyyy-MM-dd')

    const { data } = await supabase
      .from('reservas')
      .select(
        '*, usuario:profiles!reservas_usuario_id_fkey(nombre, apellido, email, telefono)'
      )
      .gte('fecha', desde)
      .lte('fecha', hasta)
      .neq('estado', 'cancelada')
      .order('hora_inicio', { ascending: true })

    setReservas((data as Reserva[]) || [])
    setLoading(false)
  }

  useEffect(() => {
    cargar()
  }, [weekStart])

  const getReservasDia = (dia: Date) =>
    reservas.filter((r) => isSameDay(parseISO(r.fecha), dia))

  const confirmarReserva = async (id: string) => {
    await (supabase as any)
      .from('reservas')
      .update({ estado: 'confirmada' })
      .eq('id', id)

    const reserva = reservas.find((r) => r.id === id)

    if (reserva) {
      await supabase.from('notificaciones').insert({
        usuario_id: reserva.usuario_id,
        tipo: 'reserva',
        titulo: '✅ Reserva confirmada',
        contenido: `Tu turno del ${format(
          parseISO(reserva.fecha),
          "d 'de' MMMM",
          { locale: es }
        )} a las ${reserva.hora_inicio} fue confirmado.`,
        url: '/reservas',
      })
    }

    toast.success('Reserva confirmada')
    cargar()
    setSelectedReserva(null)
  }

  const cancelarReserva = async (id: string) => {
    await (supabase as any)
      .from('reservas')
      .update({ estado: 'cancelada' })
      .eq('id', id)

    const reserva = reservas.find((r) => r.id === id)

    if (reserva) {
      await supabase.from('notificaciones').insert({
        usuario_id: reserva.usuario_id,
        tipo: 'reserva',
        titulo: '❌ Reserva cancelada',
        contenido: `Tu reserva del ${format(
          parseISO(reserva.fecha),
          "d 'de' MMMM",
          { locale: es }
        )} fue cancelada.`,
        url: '/reservas',
      })
    }

    toast.success('Reserva cancelada')
    cargar()
    setSelectedReserva(null)
  }

  const generarJitsi = async (reservaId: string) => {
    setCreandoJitsi(reservaId)

    const { data, error } = await supabase.rpc('generar_sala_jitsi', {
      reserva_id: reservaId,
    })

    if (!error && data) {
      const reserva = reservas.find((r) => r.id === reservaId)

      if (reserva) {
        await supabase.from('notificaciones').insert({
          usuario_id: reserva.usuario_id,
          tipo: 'videollamada',
          titulo: '📹 Link de videollamada listo',
          contenido: `Tu sesión del ${format(
            parseISO(reserva.fecha),
            "d 'de' MMMM",
            { locale: es }
          )} a las ${reserva.hora_inicio} tiene link listo.`,
          url: '/reservas',
          metadata: {
            jitsi_url: `https://meet.jit.si/${data}`,
          },
        })
      }

      toast.success('Link generado')
      cargar()
    } else {
      toast.error('Error al generar link')
    }

    setCreandoJitsi(null)
  }

  const colorEstado: Record<string, string> = {
    pendiente: 'border-l-amber-400 bg-amber-500/10',
    confirmada: 'border-l-violet-400 bg-violet-500/10',
    cancelada: 'border-l-red-400 bg-red-500/10',
    completada: 'border-l-emerald-400 bg-emerald-500/10',
  }

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto space-y-5">
        {/* HEADER */}
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Calendar /> Agenda
          </h1>
        </div>

        {/* LISTADO SIMPLE */}
        <div className="space-y-2">
          {reservas.map((r) => (
            <div key={r.id} className="border p-3 rounded">
              <div className="font-bold">
                {r.usuario?.nombre} {r.usuario?.apellido}
              </div>
              <div className="text-sm text-gray-500">
                {r.fecha} - {r.hora_inicio}
              </div>

              {r.estado === 'pendiente' && (
                <div className="flex gap-2 mt-2">
                  <button onClick={() => confirmarReserva(r.id)}>
                    <Check />
                  </button>
                  <button onClick={() => cancelarReserva(r.id)}>
                    <X />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  )
}