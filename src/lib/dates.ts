import { format, formatDistanceToNow, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'

/**
 * Formatea fecha en español: "lunes 14 de junio de 2026"
 */
export function fechaLarga(fecha: string | Date): string {
  const d = typeof fecha === 'string' ? parseISO(fecha) : fecha
  return format(d, "EEEE d 'de' MMMM 'de' yyyy", { locale: es })
}

/**
 * Formatea fecha corta: "14 jun 2026"
 */
export function fechaCorta(fecha: string | Date): string {
  const d = typeof fecha === 'string' ? parseISO(fecha) : fecha
  return format(d, "d MMM yyyy", { locale: es })
}

/**
 * "hace 5 minutos", "hace 2 horas", etc.
 */
export function tiempoRelativo(fecha: string | Date): string {
  const d = typeof fecha === 'string' ? parseISO(fecha) : fecha
  return formatDistanceToNow(d, { locale: es, addSuffix: true })
}

/**
 * Solo hora: "14:30"
 */
export function hora(fecha: string | Date): string {
  const d = typeof fecha === 'string' ? parseISO(fecha) : fecha
  return format(d, 'HH:mm')
}

/**
 * Fecha para inputs type="date"
 */
export function fechaInput(fecha: Date): string {
  return format(fecha, 'yyyy-MM-dd')
}

/**
 * Nombre del día abreviado: "lun", "mar"...
 */
export function diaSemanaCorto(fecha: Date): string {
  return format(fecha, 'EEE', { locale: es })
}
