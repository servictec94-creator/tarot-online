import Link from 'next/link'
import { Star, Moon, Eye, MessageCircle, Calendar, Video, ChevronRight, Sparkles, Shield } from 'lucide-react'

const categorias = [
  { icon: '❤️', nombre: 'Amor y Relaciones', desc: 'Claridad en tu camino amoroso' },
  { icon: '💼', nombre: 'Trabajo y Carrera', desc: 'Decisiones profesionales con sabiduría' },
  { icon: '💰', nombre: 'Dinero y Abundancia', desc: 'Prosperidad y oportunidades' },
  { icon: '🌿', nombre: 'Salud y Bienestar', desc: 'Equilibrio cuerpo y alma' },
  { icon: '👨‍👩‍👧', nombre: 'Familia y Vínculos', desc: 'Armonía en tus relaciones' },
  { icon: '✨', nombre: 'Crecimiento Espiritual', desc: 'Tu camino interior' },
]

const servicios = [
  {
    icon: <MessageCircle className="w-8 h-8" />,
    titulo: 'Consulta por Mensaje',
    desc: 'Enviá tu pregunta y recibí una lectura detallada y personalizada por escrito.',
    precio: 'Desde $2.500',
    color: 'from-violet-deep to-violet-soft',
  },
  {
    icon: <Video className="w-8 h-8" />,
    titulo: 'Videollamada',
    desc: 'Sesión en vivo con lectura interactiva y preguntas en tiempo real.',
    precio: 'Desde $4.000',
    color: 'from-gold-dark to-gold',
  },
  {
    icon: <Calendar className="w-8 h-8" />,
    titulo: 'Turno Presencial',
    desc: 'Encontranos en Concepción del Uruguay para una experiencia completa.',
    precio: 'Consultá',
    color: 'from-violet-700 to-violet-500',
  },
]

const testimonios = [
  {
    nombre: 'Valentina M.',
    texto: 'La lectura fue increíblemente precisa. Me ayudó a tomar una decisión que venía postergando hace meses. Totalmente recomendable.',
    categoria: 'Amor',
    estrellas: 5,
  },
  {
    nombre: 'Roberto C.',
    texto: 'Skeptico al principio, pero quedé sorprendido. La tarotista captó situaciones de mi vida con una claridad impresionante.',
    categoria: 'Trabajo',
    estrellas: 5,
  },
  {
    nombre: 'Lorena P.',
    texto: 'Una experiencia muy sanadora. La lectura me dio la paz que necesitaba en un momento difícil de mi vida.',
    categoria: 'Espiritual',
    estrellas: 5,
  },
]

export default function HomePage() {
  return (
    <main className="min-h-screen">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 glass border-b border-violet-glow/10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Star className="w-6 h-6 text-gold-light animate-twinkle" />
            <span className="font-serif text-xl font-bold text-gold-light">Tarot Online</span>
          </Link>
          <div className="hidden md:flex items-center gap-6 text-sm text-star/70">
            <Link href="#servicios" className="hover:text-violet-light transition-colors">Servicios</Link>
            <Link href="#como-funciona" className="hover:text-violet-light transition-colors">Cómo funciona</Link>
            <Link href="#testimonios" className="hover:text-violet-light transition-colors">Testimonios</Link>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/auth/login" className="btn-ghost text-sm py-2 px-4">
              Iniciar sesión
            </Link>
            <Link href="/auth/register" className="btn-primary text-sm py-2 px-4">
              Registrarme
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 px-4 overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-deep/30 rounded-full blur-[100px]" />
          <div className="absolute top-1/4 right-1/4 w-[300px] h-[300px] bg-gold/10 rounded-full blur-[80px]" />
        </div>

        <div className="relative max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-violet-deep/50 border border-violet-glow/30 rounded-full px-5 py-2 mb-8 text-sm text-violet-light">
            <Sparkles className="w-4 h-4 text-gold-light" />
            Lecturas auténticas y personalizadas
          </div>

          {/* Main heading */}
          <h1 className="font-serif text-5xl md:text-7xl font-bold mb-6 leading-tight">
            <span className="text-star">Las cartas</span>
            <br />
            <span className="gold-shimmer">hablan por vos</span>
          </h1>

          <p className="text-xl md:text-2xl text-star/70 max-w-2xl mx-auto mb-10 leading-relaxed font-light">
            Descubrí lo que el tarot tiene para revelar sobre tu vida, tus relaciones y tu destino. 
            Lecturas personalizadas con una tarotista experimentada.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link href="/auth/register" className="btn-gold text-base px-8 py-4 flex items-center gap-2">
              <Star className="w-5 h-5" />
              Hacer mi consulta
              <ChevronRight className="w-5 h-5" />
            </Link>
            <Link href="#como-funciona" className="btn-ghost text-base px-8 py-4 flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Cómo funciona
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-lg mx-auto">
            {[
              { num: '500+', label: 'Consultas realizadas' },
              { num: '98%', label: 'Satisfacción' },
              { num: '5⭐', label: 'Valoración' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="font-serif text-2xl font-bold text-gold-light mb-1">{stat.num}</div>
                <div className="text-xs text-star/50">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Tarot cards decorative */}
        <div className="absolute left-8 top-1/3 hidden xl:block animate-float opacity-30">
          <div className="w-20 h-32 bg-violet-deep border border-violet-glow/40 rounded-lg rotate-[-15deg] flex items-center justify-center text-3xl">
            🌙
          </div>
        </div>
        <div className="absolute right-8 top-1/4 hidden xl:block animate-float opacity-30" style={{animationDelay: '2s'}}>
          <div className="w-20 h-32 bg-violet-deep border border-gold/30 rounded-lg rotate-[12deg] flex items-center justify-center text-3xl">
            ⭐
          </div>
        </div>
      </section>

      {/* Servicios */}
      <section id="servicios" className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-violet-light text-sm font-semibold uppercase tracking-widest mb-3">Lo que ofrezco</p>
            <h2 className="section-title mb-4">Tipos de consulta</h2>
            <p className="text-star/60 max-w-xl mx-auto">Elegí la modalidad que mejor se adapte a tus necesidades y disponibilidad</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {servicios.map((s) => (
              <div key={s.titulo} className="card-glow p-8 text-center group">
                <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${s.color} mb-6 text-white`}>
                  {s.icon}
                </div>
                <h3 className="font-serif text-xl font-semibold text-star mb-3">{s.titulo}</h3>
                <p className="text-star/60 text-sm mb-6 leading-relaxed">{s.desc}</p>
                <div className="text-gold-light font-bold text-lg mb-6">{s.precio}</div>
                <Link href="/auth/register" className="btn-primary text-sm py-2 px-5 inline-block">
                  Reservar
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categorías */}
      <section className="py-20 px-4 bg-cosmos/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="section-title mb-4">¿Sobre qué querés consultar?</h2>
            <p className="text-star/60">El tarot puede iluminar todos los aspectos de tu vida</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {categorias.map((cat) => (
              <Link href="/auth/register" key={cat.nombre}
                className="card-glow p-6 text-center hover:border-gold/40 group transition-all">
                <div className="text-4xl mb-3">{cat.icon}</div>
                <h3 className="font-semibold text-star mb-1 group-hover:text-violet-light transition-colors">
                  {cat.nombre}
                </h3>
                <p className="text-xs text-star/50">{cat.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Cómo funciona */}
      <section id="como-funciona" className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="section-title mb-4">Cómo funciona</h2>
            <p className="text-star/60">Simple, privado y desde donde estés</p>
          </div>
          <div className="grid md:grid-cols-4 gap-6 relative">
            {[
              { step: '1', titulo: 'Registrate', desc: 'Creá tu cuenta gratuita en menos de un minuto', icon: '👤' },
              { step: '2', titulo: 'Elegí tu consulta', desc: 'Seleccioná el tipo de lectura y horario que prefieras', icon: '🃏' },
              { step: '3', titulo: 'Enviá tu pregunta', desc: 'Contame qué querés saber. Todo es confidencial', icon: '💬' },
              { step: '4', titulo: 'Recibí tu lectura', desc: 'Tu respuesta personalizada llegará a tu panel', icon: '✨' },
            ].map((paso, i) => (
              <div key={paso.step} className="text-center relative">
                <div className="w-16 h-16 rounded-full bg-violet-deep border border-violet-glow/40 flex items-center justify-center text-2xl mx-auto mb-4 shadow-mystic">
                  {paso.icon}
                </div>
                <div className="absolute top-6 left-1/2 w-full h-px bg-gradient-to-r from-violet-glow/0 via-violet-glow/30 to-violet-glow/0 hidden md:block" 
                     style={{display: i < 3 ? undefined : 'none'}} />
                <div className="text-violet-light text-xs font-bold uppercase tracking-widest mb-2">Paso {paso.step}</div>
                <h3 className="font-semibold text-star mb-2">{paso.titulo}</h3>
                <p className="text-sm text-star/50">{paso.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonios */}
      <section id="testimonios" className="py-24 px-4 bg-cosmos/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="section-title mb-4">Lo que dicen mis consultantes</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonios.map((t) => (
              <div key={t.nombre} className="card-mystic p-6">
                <div className="flex text-gold-light mb-4">
                  {Array(t.estrellas).fill(0).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className="text-star/80 text-sm leading-relaxed mb-6 italic">"{t.texto}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-violet-deep flex items-center justify-center text-sm font-bold text-violet-light">
                    {t.nombre[0]}
                  </div>
                  <div>
                    <div className="font-semibold text-star text-sm">{t.nombre}</div>
                    <div className="text-xs text-violet-light">{t.categoria}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <Moon className="w-12 h-12 text-gold-light mx-auto mb-6 animate-float" />
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-star mb-6">
            ¿Lista/o para conocer<br />
            <span className="gold-shimmer">tu camino?</span>
          </h2>
          <p className="text-star/60 mb-10 text-lg">
            Registrate gratis y hacé tu primera consulta. Las cartas tienen algo para decirte.
          </p>
          <Link href="/auth/register" className="btn-gold text-lg px-10 py-4 inline-flex items-center gap-3">
            <Star className="w-5 h-5" />
            Comenzar ahora
          </Link>
          <div className="mt-8 flex items-center justify-center gap-2 text-star/40 text-sm">
            <Shield className="w-4 h-4" />
            Tus consultas son 100% privadas y confidenciales
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-violet-glow/10 py-12 px-4">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Star className="w-5 h-5 text-gold-light" />
              <span className="font-serif text-lg font-bold text-gold-light">Tarot Online</span>
            </div>
            <p className="text-star/40 text-sm leading-relaxed">
              Lecturas de tarot auténticas y personalizadas. 
              Con amor y dedicación desde Concepción del Uruguay.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-violet-light mb-4">Servicios</h4>
            <ul className="space-y-2 text-sm text-star/50">
              <li><Link href="/auth/register" className="hover:text-violet-light transition-colors">Consulta por mensaje</Link></li>
              <li><Link href="/auth/register" className="hover:text-violet-light transition-colors">Videollamada</Link></li>
              <li><Link href="/auth/register" className="hover:text-violet-light transition-colors">Reservar turno</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-violet-light mb-4">Contacto</h4>
            <ul className="space-y-2 text-sm text-star/50">
              <li>📍 Concepción del Uruguay, Entre Ríos</li>
              <li>📱 WhatsApp: +54 3442 674304</li>
            </ul>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-8 pt-6 border-t border-violet-glow/10 text-center text-xs text-star/30">
          © {new Date().getFullYear()} Tarot Online · Todos los derechos reservados
        </div>
      </footer>
    </main>
  )
}
