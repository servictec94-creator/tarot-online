'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { User, Save, Loader2, Star, Shield } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import DashboardLayout from '@/components/layout/DashboardLayout'
import type { Profile } from '@/types/database'
import toast from 'react-hot-toast'

export default function PerfilPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [form, setForm] = useState({
    nombre: '', apellido: '', telefono: '',
    bio: '', ciudad: '', fecha_nacimiento: '',
    notificaciones_email: true, notificaciones_whatsapp: false,
  })

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }

      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (data) {
        setProfile(data)
        setForm({
          nombre: data.nombre || '',
          apellido: data.apellido || '',
          telefono: data.telefono || '',
          bio: data.bio || '',
          ciudad: data.ciudad || '',
          fecha_nacimiento: data.fecha_nacimiento || '',
          notificaciones_email: data.notificaciones_email,
          notificaciones_whatsapp: data.notificaciones_whatsapp,
        })
      }
      setLoading(false)
    }
    load()
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    const { error } = await supabase
      .from('profiles')
      .update({
        nombre: form.nombre,
        apellido: form.apellido,
        telefono: form.telefono,
        bio: form.bio,
        ciudad: form.ciudad,
        fecha_nacimiento: form.fecha_nacimiento || null,
        notificaciones_email: form.notificaciones_email,
        notificaciones_whatsapp: form.notificaciones_whatsapp,
      })
      .eq('id', profile!.id)

    if (error) {
      toast.error('Error al guardar. Intentá nuevamente.')
    } else {
      toast.success('Perfil actualizado')
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Star className="w-7 h-7 text-gold-light animate-twinkle" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="font-serif text-2xl font-bold text-star">Mi Perfil</h1>
          <p className="text-star/50 text-sm">Administrá tu información personal</p>
        </div>

        {/* Avatar */}
        <div className="card-mystic p-6 flex items-center gap-5">
          <div className="w-20 h-20 rounded-full bg-violet-deep border-2 border-violet-glow/40 flex items-center justify-center text-3xl font-bold text-violet-light shadow-mystic">
            {form.nombre?.[0]?.toUpperCase() || '?'}
          </div>
          <div>
            <h2 className="font-serif text-xl font-semibold text-star">
              {form.nombre} {form.apellido}
            </h2>
            <p className="text-star/50 text-sm">{profile?.email}</p>
            <div className="mt-2 inline-flex items-center gap-1.5 text-xs bg-violet-deep/50 text-violet-light px-3 py-1 rounded-full border border-violet-glow/20">
              <User className="w-3 h-3" />
              {profile?.rol === 'admin' ? 'Administrador' : 'Cliente'}
            </div>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          {/* Datos personales */}
          <div className="card-mystic p-6 space-y-4">
            <h3 className="font-semibold text-violet-light flex items-center gap-2">
              <User className="w-4 h-4" />
              Datos personales
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label-mystic">Nombre</label>
                <input type="text" className="input-mystic"
                  value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} />
              </div>
              <div>
                <label className="label-mystic">Apellido</label>
                <input type="text" className="input-mystic"
                  value={form.apellido} onChange={e => setForm({ ...form, apellido: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="label-mystic">WhatsApp</label>
              <input type="tel" className="input-mystic" placeholder="+54 9 3442 000000"
                value={form.telefono} onChange={e => setForm({ ...form, telefono: e.target.value })} />
            </div>
            <div>
              <label className="label-mystic">Fecha de nacimiento</label>
              <input type="date" className="input-mystic"
                value={form.fecha_nacimiento}
                onChange={e => setForm({ ...form, fecha_nacimiento: e.target.value })} />
              <p className="text-xs text-star/30 mt-1">La fecha de nacimiento puede enriquecer tu lectura astral</p>
            </div>
            <div>
              <label className="label-mystic">Ciudad</label>
              <input type="text" className="input-mystic" placeholder="Tu ciudad"
                value={form.ciudad} onChange={e => setForm({ ...form, ciudad: e.target.value })} />
            </div>
            <div>
              <label className="label-mystic">Sobre vos (opcional)</label>
              <textarea className="input-mystic resize-none h-24"
                placeholder="Contanos algo sobre vos para personalizar mejor tus lecturas..."
                value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} />
            </div>
          </div>

          {/* Notificaciones */}
          <div className="card-mystic p-6 space-y-4">
            <h3 className="font-semibold text-violet-light flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Notificaciones
            </h3>
            {[
              { key: 'notificaciones_email', label: 'Notificaciones por email', desc: 'Recibí alertas de nuevas respuestas en tu email' },
              { key: 'notificaciones_whatsapp', label: 'Notificaciones por WhatsApp', desc: 'Recibí mensajes de seguimiento por WhatsApp' },
            ].map((notif) => (
              <label key={notif.key} className="flex items-center justify-between cursor-pointer group">
                <div>
                  <div className="text-sm font-medium text-star">{notif.label}</div>
                  <div className="text-xs text-star/40">{notif.desc}</div>
                </div>
                <div
                  onClick={() => setForm({ ...form, [notif.key]: !form[notif.key as keyof typeof form] })}
                  className={`relative w-12 h-6 rounded-full transition-colors cursor-pointer
                    ${form[notif.key as keyof typeof form]
                      ? 'bg-violet-soft' : 'bg-nebula border border-violet-glow/20'
                    }`}
                >
                  <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform shadow-sm
                    ${form[notif.key as keyof typeof form] ? 'translate-x-6' : 'translate-x-0.5'}`}
                  />
                </div>
              </label>
            ))}
          </div>

          {/* Email (readonly) */}
          <div className="card-mystic p-6">
            <h3 className="font-semibold text-violet-light flex items-center gap-2 mb-4">
              <Shield className="w-4 h-4" />
              Cuenta
            </h3>
            <div>
              <label className="label-mystic">Email</label>
              <input type="email" className="input-mystic opacity-60 cursor-not-allowed"
                value={profile?.email || ''} disabled />
              <p className="text-xs text-star/30 mt-1">El email no se puede modificar</p>
            </div>
          </div>

          <button type="submit" disabled={saving} className="btn-primary w-full flex items-center justify-center gap-2 py-3.5">
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </form>
      </div>
    </DashboardLayout>
  )
}
