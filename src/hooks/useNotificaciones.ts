'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import type { Notificacion } from '@/types/database'
import toast from 'react-hot-toast'

export function useNotificaciones() {
  const supabase = createClient()
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([])
  const [noLeidas, setNoLeidas] = useState(0)
  const [userId, setUserId] = useState<string | null>(null)

  const cargar = useCallback(async (uid: string) => {
    const { data } = await supabase
      .from('notificaciones')
      .select('*')
      .eq('usuario_id', uid)
      .order('created_at', { ascending: false })
      .limit(30)

    setNotificaciones(data || [])
    setNoLeidas(data?.filter(n => !n.leida).length || 0)
  }, [])

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)
      await cargar(user.id)

      // Suscripción realtime
      const channel = supabase
        .channel('notificaciones-' + user.id)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'notificaciones',
          filter: `usuario_id=eq.${user.id}`,
        }, (payload) => {
          const nueva = payload.new as Notificacion
          setNotificaciones(prev => [nueva, ...prev])
          setNoLeidas(prev => prev + 1)

          // Toast de notificación
          toast(nueva.titulo, {
            icon: nueva.tipo === 'consulta' ? '🔮' :
                  nueva.tipo === 'videollamada' ? '📹' :
                  nueva.tipo === 'reserva' ? '📅' : '💬',
            duration: 5000,
          })
        })
        .subscribe()

      return () => { supabase.removeChannel(channel) }
    }

    init()
  }, [])

  const marcarLeida = async (id: string) => {
    await supabase
      .from('notificaciones')
      .update({ leida: true })
      .eq('id', id)

    setNotificaciones(prev =>
      prev.map(n => n.id === id ? { ...n, leida: true } : n)
    )
    setNoLeidas(prev => Math.max(0, prev - 1))
  }

  const marcarTodasLeidas = async () => {
    if (!userId) return
    await supabase
      .from('notificaciones')
      .update({ leida: true })
      .eq('usuario_id', userId)
      .eq('leida', false)

    setNotificaciones(prev => prev.map(n => ({ ...n, leida: true })))
    setNoLeidas(0)
  }

  return { notificaciones, noLeidas, marcarLeida, marcarTodasLeidas }
}
