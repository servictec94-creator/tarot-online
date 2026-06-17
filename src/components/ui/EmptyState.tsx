import Link from 'next/link'

interface EmptyStateProps {
  emoji?: string
  titulo: string
  descripcion?: string
  accion?: {
    label: string
    href: string
  }
}

export default function EmptyState({ emoji = '🌙', titulo, descripcion, accion }: EmptyStateProps) {
  return (
    <div className="card-mystic p-12 text-center">
      <div className="text-5xl mb-4 animate-float inline-block">{emoji}</div>
      <h3 className="font-serif text-xl text-star mb-2">{titulo}</h3>
      {descripcion && <p className="text-star/50 text-sm mb-6 max-w-sm mx-auto">{descripcion}</p>}
      {accion && (
        <Link href={accion.href} className="btn-primary inline-flex items-center gap-2 text-sm">
          {accion.label}
        </Link>
      )}
    </div>
  )
}
