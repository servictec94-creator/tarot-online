'use client'

import { useState } from 'react'
import { Bell, Check, CheckCheck, X } from 'lucide-react'
import Link from 'next/link'
import { useNotificaciones } from '@/hooks/useNotificaciones'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

const tipoIcono: Record<string, string> = {
  consulta: '🔮',
  videollamada: '📹',
  reserva: '📅',
  mensaje: '💬',
  sistema: '⚡',
}

export default function NotificacionesDropdown() {
  const { notificaciones, noLeidas, marcarLeida, marcarTodasLeidas } = useNotificaciones()
  const [open, setOpen] = useState(false)

  return (
    <div className="relative">
      {/* Botón campana */}
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-xl hover:bg-violet-deep/30 text-star/60 hover:text-violet-light transition-colors"
      >
        <Bell className="w-5 h-5" />
        {noLeidas > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
            {noLeidas > 9 ? '9+' : noLeidas}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <>
          {/* Overlay para cerrar */}
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />

          <div className="absolute right-0 mt-2 w-80 z-50 card-mystic shadow-mystic overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-violet-glow/10">
              <h3 className="font-semibold text-star text-sm flex items-center gap-2">
                <Bell className="w-4 h-4 text-gold-light" />
                Notificaciones
                {noLeidas > 0 && (
                  <span className="bg-red-500/20 text-red-300 text-xs px-2 py-0.5 rounded-full">
                    {noLeidas} nuevas
                  </span>
                )}
              </h3>
              <div className="flex gap-2">
                {noLeidas > 0 && (
                  <button
                    onClick={marcarTodasLeidas}
                    className="text-xs text-violet-light hover:text-violet-glow transition-colors flex items-center gap-1"
                    title="Marcar todas como leídas"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    Todas leídas
                  </button>
                )}
                <button onClick={() => setOpen(false)} className="text-star/40 hover:text-star transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Lista */}
            <div className="max-h-[400px] overflow-y-auto">
              {notificaciones.length === 0 ? (
                <div className="text-center py-10 text-star/30">
                  <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Sin notificaciones</p>
                </div>
              ) : (
                notificaciones.map((n) => (
                  <div
                    key={n.id}
                    className={`flex items-start gap-3 px-4 py-3 border-b border-violet-glow/5 hover:bg-violet-deep/20 transition-colors group
                      ${!n.leida ? 'bg-violet-deep/10' : ''}`}
                  >
                    <div className="text-xl flex-shrink-0 mt-0.5">{tipoIcono[n.tipo] || '🔔'}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-sm font-medium leading-tight ${!n.leida ? 'text-star' : 'text-star/70'}`}>
                          {n.titulo}
                        </p>
                        {!n.leida && (
                          <button
                            onClick={() => marcarLeida(n.id)}
                            className="flex-shrink-0 opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-violet-deep transition-all"
                            title="Marcar como leída"
                          >
                            <Check className="w-3 h-3 text-violet-light" />
                          </button>
                        )}
                      </div>
                      <p className="text-xs text-star/50 mt-0.5 leading-relaxed">{n.contenido}</p>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="text-xs text-star/30">
                          {format(new Date(n.created_at), "d MMM, HH:mm", { locale: es })}
                        </span>
                        {n.url && (
                          <Link
                            href={n.url}
                            onClick={() => { marcarLeida(n.id); setOpen(false) }}
                            className="text-xs text-violet-light hover:text-violet-glow transition-colors"
                          >
                            Ver →
                          </Link>
                        )}
                      </div>
                    </div>
                    {!n.leida && (
                      <div className="w-2 h-2 rounded-full bg-violet-glow flex-shrink-0 mt-2" />
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
