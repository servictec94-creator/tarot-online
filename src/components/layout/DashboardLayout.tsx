'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Star, Home, MessageCircle, Calendar, User, LogOut,
  Menu, ChevronRight, Video
} from 'lucide-react'
import NotificacionesDropdown from '@/components/ui/NotificacionesDropdown'
import { createClient } from '@/lib/supabase'
import type { Profile } from '@/types/database'

const navLinks = [
  { href: '/dashboard', label: 'Inicio', icon: Home },
  { href: '/consultas', label: 'Mis Consultas', icon: MessageCircle },
  { href: '/reservas', label: 'Reservar Turno', icon: Calendar },
  { href: '/chat', label: 'Mensajes', icon: MessageCircle },
  { href: '/perfil', label: 'Mi Perfil', icon: User },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [notifCount, setNotifCount] = useState(0)

  useEffect(() => {
    const loadProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      setProfile(data)

      // Contar notificaciones no leídas
      const { count } = await supabase
        .from('notificaciones')
        .select('*', { count: 'exact', head: true })
        .eq('usuario_id', user.id)
        .eq('leida', false)

      setNotifCount(count || 0)
    }
    loadProfile()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <div className="min-h-screen flex">
      {/* Overlay mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full w-64 z-50 flex flex-col
        bg-cosmos border-r border-violet-glow/10
        transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto
      `}>
        {/* Logo */}
        <div className="p-6 border-b border-violet-glow/10">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Star className="w-6 h-6 text-gold-light animate-twinkle" />
            <span className="font-serif text-lg font-bold text-gold-light">Tarot Online</span>
          </Link>
        </div>

        {/* User info */}
        {profile && (
          <div className="p-4 mx-3 mt-4 rounded-xl bg-violet-deep/30 border border-violet-glow/15">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-violet-deep flex items-center justify-center text-violet-light font-bold border border-violet-glow/30">
                {profile.nombre?.[0]?.toUpperCase() || '?'}
              </div>
              <div className="overflow-hidden">
                <div className="text-sm font-semibold text-star truncate">{profile.nombre} {profile.apellido}</div>
                <div className="text-xs text-star/40 truncate">{profile.email}</div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 mt-2">
          {navLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`sidebar-link ${pathname === href ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span>{label}</span>
              {href === '/chat' && notifCount > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-0.5 min-w-[20px] text-center">
                  {notifCount}
                </span>
              )}
            </Link>
          ))}
        </nav>

        {/* Bottom actions */}
        <div className="p-4 border-t border-violet-glow/10 space-y-1">
          <Link href="/reservas" className="sidebar-link text-gold-light hover:text-gold hover:bg-gold/10">
            <Video className="w-5 h-5" />
            <span>Nueva videollamada</span>
          </Link>
          <button onClick={handleLogout} className="sidebar-link w-full text-red-400 hover:text-red-300 hover:bg-red-900/20">
            <LogOut className="w-5 h-5" />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen lg:ml-0">
        {/* Top bar */}
        <header className="sticky top-0 z-30 glass border-b border-violet-glow/10 px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg hover:bg-violet-deep/30 text-star/60"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="hidden lg:flex items-center gap-2 text-sm text-star/40">
            <Link href="/dashboard" className="hover:text-violet-light transition-colors">Inicio</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-violet-light capitalize">{pathname.split('/').pop()}</span>
          </div>

          <div className="flex items-center gap-3">
            <NotificacionesDropdown />
            <Link href="/perfil" className="w-8 h-8 rounded-full bg-violet-deep border border-violet-glow/30 flex items-center justify-center text-violet-light text-sm font-bold hover:border-violet-glow transition-colors">
              {profile?.nombre?.[0]?.toUpperCase() || '?'}
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
