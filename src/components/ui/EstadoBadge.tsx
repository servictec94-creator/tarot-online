type Estado = 'pendiente' | 'en_proceso' | 'respondida' | 'cerrada' | 'confirmada' | 'cancelada' | 'completada' | 'no_asistio'

const labels: Record<string, string> = {
  pendiente: 'Pendiente',
  en_proceso: 'En proceso',
  respondida: 'Respondida',
  cerrada: 'Cerrada',
  confirmada: 'Confirmada',
  cancelada: 'Cancelada',
  completada: 'Completada',
  no_asistio: 'No asistió',
}

export default function EstadoBadge({ estado }: { estado: string }) {
  return (
    <span className={`status-${estado} inline-block`}>
      {labels[estado] || estado}
    </span>
  )
}
