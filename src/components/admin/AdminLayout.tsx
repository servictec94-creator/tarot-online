'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Star, LayoutDashboard, MessageCircle, Users, Calendar,
  Video, Settings, LogOut, Menu, Bell, BarChart3
} from 'lucide-react'
import { createClient } from '@/lib/supabase'

const adminLinks = [
  { href: '/admin', label: 'Panel', icon: LayoutDashboard },
  { href: '/admin/consultas', label: 'Consultas', icon: MessageCircle },
  { href: '/admin/usuarios', label: 'Clientes', icon: Users },
  { href: '/admin/agenda', label: 'Agenda', icon: Calendar },
  { href: '/admin/videollamadas', label: 'Videollamadas', icon: Video },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [pendingCount, setPendingCount] = useState(0)

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }

      const { data } = await supabase.from('profiles').select('rol').eq('id', user.id).single()
      if (!data || !['admin', 'tarotista'].includes(data.rol)) {
        router.push('/dashboard')
        return
      }

      const { count } = await supabase.from('consultas').select('*', { count: 'exact', head: true })
        .eq('estado', 'pendiente')
      setPendingCount(count || 0)
    }
    checkAdmin()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <div className="min-h-screen flex">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar admin */}
      <aside className={`
        fixed top-0 left-0 h-full w-64 z-50 flex flex-col
        bg-cosmos border-r border-gold/10
        transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto
      `}>
        {/* Logo admin */}
        <div className="p-6 border-b border-gold/10">
          <Link href="/admin" className="flex items-center gap-2">
            <Star className="w-6 h-6 text-gold-light animate-twinkle" />
            <div>
              <div className="font-serif text-lg font-bold text-gold-light">Tarot Online</div>
              <div className="text-xs text-gold/60">Panel Admin</div>
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1 mt-2">
          {adminLinks.map(({ href, label, icon: Icon }) => {
            const isActive = href === '/admin' ? pathname === '/admin' : pathname.startsWith(href)
            return (
              <Link key={href} href={href}
                className={`sidebar-link ${isActive ? 'active' : ''}`}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span>{label}</span>
                {href === '/admin/consultas' && pendingCount > 0 && (
                  <span className="ml-auto bg-amber-500 text-white text-xs rounded-full px-2 py-0.5 min-w-[20px] text-center">
                    {pendingCount}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-gold/10 space-y-1">
          <Link href="/dashboard" className="sidebar-link text-star/50">
            <BarChart3 className="w-5 h-5" />
            <span>Vista cliente</span>
          </Link>
          <button onClick={handleLogout} className="sidebar-link w-full text-red-400 hover:text-red-300 hover:bg-red-900/20">
            <LogOut className="w-5 h-5" />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col">
        <header className="sticky top-0 z-30 glass border-b border-gold/10 px-4 py-3 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-violet-deep/30 text-star/60">
            <Menu className="w-5 h-5" />
          </button>
          <div className="hidden lg:block">
            <span className="text-sm text-star/40">Panel de administración</span>
          </div>
          <div className="flex items-center gap-3">
            {pendingCount > 0 && (
              <Link href="/admin/consultas" className="relative p-2 rounded-lg hover:bg-violet-deep/30 text-amber-400">
                <Bell className="w-5 h-5" />
                <span className="notification-dot">{pendingCount > 9 ? '9+' : pendingCount}</span>
              </Link>
            )}
            <div className="w-8 h-8 rounded-full bg-gold/20 border border-gold/30 flex items-center justify-center">
              <Star className="w-4 h-4 text-gold-light" />
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
