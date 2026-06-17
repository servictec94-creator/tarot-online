import { createClient } from '@/lib/supabase'

/**
 * Suscribirse a nuevos mensajes en tiempo real
 */
export function suscribirMensajes(
  consultaId: string | null,
  userId: string,
  onNuevoMensaje: (msg: any) => void
) {
  const supabase = createClient()

  const filter = consultaId
    ? `consulta_id=eq.${consultaId}`
    : `destinatario_id=eq.${userId}`

  const channel = supabase
    .channel(`mensajes-${consultaId || userId}`)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'mensajes',
      filter,
    }, async (payload) => {
      const { data: msg } = await supabase
        .from('mensajes')
        .select('*, remitente:profiles!mensajes_remitente_id_fkey(*)')
        .eq('id', payload.new.id)
        .single()

      if (msg) onNuevoMensaje(msg)
    })
    .subscribe()

  return () => supabase.removeChannel(channel)
}

/**
 * Marcar mensajes como leídos
 */
export async function marcarMensajesLeidos(consultaId: string | null, userId: string) {
  const supabase = createClient()

  let query = supabase
    .from('mensajes')
    .update({ leido: true, leido_at: new Date().toISOString() })
    .eq('destinatario_id', userId)
    .eq('leido', false)

  if (consultaId) {
    query = query.eq('consulta_id', consultaId)
  } else {
    query = query.is('consulta_id', null)
  }

  await query
}

/**
 * Contar mensajes no leídos para un usuario
 */
export async function contarMensajesNoLeidos(userId: string): Promise<number> {
  const supabase = createClient()

  const { count } = await supabase
    .from('mensajes')
    .select('*', { count: 'exact', head: true })
    .eq('destinatario_id', userId)
    .eq('leido', false)

  return count || 0
}
