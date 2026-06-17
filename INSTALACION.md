# 🔮 TAROT ONLINE — Guía Completa de Instalación y Despliegue

## Requisitos previos

- Node.js 18+
- Cuenta en [Supabase](https://supabase.com) (gratuita)
- Cuenta en [Vercel](https://vercel.com) (gratuita)
- Cuenta en [GitHub](https://github.com)

---

## PASO 1 — Configurar Supabase

### 1.1 Crear proyecto

1. Ingresá a [supabase.com](https://supabase.com) y creá una cuenta
2. Hacé clic en **"New project"**
3. Nombre: `tarot-online`
4. Elegí región: `South America (São Paulo)`
5. Generá una contraseña segura y guardala
6. Esperá que el proyecto se cree (~2 minutos)

### 1.2 Ejecutar el schema SQL

1. En tu proyecto de Supabase, andá a **SQL Editor**
2. Hacé clic en **"New query"**
3. Copiá todo el contenido de `supabase/schema.sql`
4. Pegalo en el editor y ejecutá (**Run** o Ctrl+Enter)
5. Deberías ver "Success" en verde

### 1.3 Habilitar autenticación por email

1. Andá a **Authentication → Providers**
2. Asegurate que **Email** esté habilitado
3. En **Authentication → Email Templates**, podés personalizar los emails (opcional)

### 1.4 Obtener credenciales

1. Andá a **Settings → API**
2. Copiá:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY` (¡nunca la expongas!)

### 1.5 Habilitar Realtime (para chat en vivo)

1. Andá a **Database → Replication**
2. Habilitá Realtime para las tablas: `mensajes`, `notificaciones`, `reservas`

---

## PASO 2 — Configurar el proyecto local

### 2.1 Clonar / descargar

```bash
# Si usás Git
git clone https://github.com/tu-usuario/tarot-online.git
cd tarot-online

# O descomprimí el ZIP y entrá a la carpeta
cd tarot-online
```

### 2.2 Instalar dependencias

```bash
npm install
```

### 2.3 Crear archivo de variables de entorno

```bash
cp .env.local.example .env.local
```

Editá `.env.local` con tus datos reales:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-aqui
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key-aqui
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_WHATSAPP_NUMBER=3442674304
NEXT_PUBLIC_JITSI_DOMAIN=meet.jit.si
```

### 2.4 Ejecutar en desarrollo

```bash
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000)

---

## PASO 3 — Crear la cuenta de Administrador

1. Registrate normalmente en `/auth/register` con tu email de admin
2. En Supabase, andá a **Table Editor → profiles**
3. Buscá tu usuario y editá el campo `rol` → cambialo a `admin`
4. Guardá los cambios
5. Al iniciar sesión, serás redirigida/o automáticamente al panel admin en `/admin`

También podés hacerlo por SQL:
```sql
UPDATE public.profiles 
SET rol = 'admin' 
WHERE email = 'tu-email@ejemplo.com';
```

---

## PASO 4 — Desplegar en Vercel

### 4.1 Subir a GitHub

```bash
git init
git add .
git commit -m "🔮 Tarot Online - Initial commit"
git branch -M main
git remote add origin https://github.com/tu-usuario/tarot-online.git
git push -u origin main
```

### 4.2 Desplegar en Vercel

1. Ingresá a [vercel.com](https://vercel.com) con tu cuenta de GitHub
2. Hacé clic en **"New Project"**
3. Importá el repositorio `tarot-online`
4. En **"Environment Variables"**, agregá todas las variables de `.env.local`:

| Variable | Valor |
|----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | tu URL de Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | tu anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | tu service role key |
| `NEXT_PUBLIC_APP_URL` | https://tu-dominio.vercel.app |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | 3442674304 |
| `NEXT_PUBLIC_JITSI_DOMAIN` | meet.jit.si |

5. Hacé clic en **"Deploy"**
6. Esperá que termine el despliegue (~2-3 minutos)

### 4.3 Dominio personalizado (opcional)

1. En Vercel, andá a tu proyecto → **Settings → Domains**
2. Agregá tu dominio personalizado (ej: `tarotolinetufantastico.com.ar`)
3. Configurá los DNS según las instrucciones de Vercel

### 4.4 Actualizar URL en Supabase

Después de desplegar, actualizá la URL en Supabase:
1. **Authentication → URL Configuration**
2. **Site URL**: `https://tu-dominio.vercel.app`
3. **Redirect URLs**: agregá `https://tu-dominio.vercel.app/**`

---

## PASO 5 — Configuración post-despliegue

### 5.1 Cargar tus horarios disponibles

En Supabase SQL Editor:
```sql
-- Obtener tu ID de admin
SELECT id FROM profiles WHERE rol = 'admin';

-- Insertar horarios (reemplazá 'TU-ADMIN-ID' con el ID real)
INSERT INTO public.horarios_disponibles (tarotista_id, dia_semana, hora_inicio, hora_fin) VALUES
('TU-ADMIN-ID', 1, '09:00', '18:00'),  -- Lunes
('TU-ADMIN-ID', 2, '09:00', '18:00'),  -- Martes
('TU-ADMIN-ID', 3, '09:00', '18:00'),  -- Miércoles
('TU-ADMIN-ID', 4, '09:00', '18:00'),  -- Jueves
('TU-ADMIN-ID', 5, '09:00', '18:00'),  -- Viernes
('TU-ADMIN-ID', 6, '09:00', '13:00');  -- Sábado (mañana)
```

### 5.2 Actualizar configuración del sitio

```sql
UPDATE public.configuracion_sitio SET valor = 'Tu Nombre' WHERE clave = 'nombre_tarotista';
UPDATE public.configuracion_sitio SET valor = '3000' WHERE clave = 'precio_consulta';
UPDATE public.configuracion_sitio SET valor = '5000' WHERE clave = 'precio_videollamada';
```

---

## Estructura del proyecto

```
tarot-online/
├── src/
│   ├── app/
│   │   ├── page.tsx                    ← Landing page pública
│   │   ├── layout.tsx                  ← Layout raíz
│   │   ├── globals.css                 ← Estilos globales
│   │   ├── auth/
│   │   │   ├── login/page.tsx          ← Inicio de sesión
│   │   │   └── register/page.tsx       ← Registro
│   │   ├── dashboard/page.tsx          ← Panel usuario
│   │   ├── consultas/
│   │   │   ├── page.tsx                ← Lista consultas
│   │   │   ├── nueva/page.tsx          ← Nueva consulta
│   │   │   └── [id]/page.tsx           ← Detalle + chat
│   │   ├── reservas/page.tsx           ← Sistema de reservas
│   │   ├── chat/page.tsx               ← Chat directo
│   │   ├── perfil/page.tsx             ← Perfil usuario
│   │   └── admin/
│   │       ├── page.tsx                ← Panel admin
│   │       ├── consultas/
│   │       │   ├── page.tsx            ← Lista consultas admin
│   │       │   └── [id]/page.tsx       ← Responder consulta
│   │       ├── usuarios/page.tsx       ← Gestión clientes
│   │       ├── agenda/page.tsx         ← Calendario semanal
│   │       └── videollamadas/page.tsx  ← Gestión Jitsi
│   ├── components/
│   │   ├── layout/
│   │   │   └── DashboardLayout.tsx     ← Layout con sidebar
│   │   ├── admin/
│   │   │   └── AdminLayout.tsx         ← Layout admin
│   │   └── ui/
│   │       └── WhatsAppButton.tsx      ← Botón flotante WA
│   ├── lib/
│   │   └── supabase.ts                 ← Cliente Supabase
│   ├── types/
│   │   └── database.ts                 ← Tipos TypeScript
│   └── middleware.ts                   ← Protección de rutas
├── supabase/
│   └── schema.sql                      ← Base de datos completa
├── .env.local.example                  ← Variables de entorno
├── package.json
├── tailwind.config.ts
└── next.config.js
```

---

## Funcionalidades incluidas

### Para clientes (usuarios)
- ✅ Registro e inicio de sesión
- ✅ Dashboard personalizado
- ✅ Enviar consultas de tarot (categorías, prioridad)
- ✅ Ver respuestas del tarotista
- ✅ Chat en tiempo real en cada consulta
- ✅ Chat directo con la tarotista
- ✅ Reservar turnos (videollamada, chat, consulta escrita)
- ✅ Ver y cancelar reservas
- ✅ Notificaciones en tiempo real
- ✅ Perfil editable
- ✅ Historial completo de consultas

### Para la administradora (tarotista)
- ✅ Panel con estadísticas
- ✅ Ver y responder consultas pendientes
- ✅ Marcar consultas como urgentes o respondidas
- ✅ Chat con cada cliente
- ✅ Notas privadas por consulta
- ✅ Calendario semanal de agenda
- ✅ Confirmar / cancelar reservas
- ✅ Generar links de Jitsi Meet automáticos
- ✅ Crear salas de videollamada rápidas
- ✅ Ver lista de clientes con stats
- ✅ Enviar WhatsApp a clientes directamente
- ✅ Notificaciones push a clientes

### Técnico
- ✅ Realtime con Supabase (chat en vivo)
- ✅ Row Level Security (datos seguros)
- ✅ Autenticación con JWT
- ✅ Middleware de protección de rutas
- ✅ Responsive mobile-first
- ✅ WhatsApp flotante
- ✅ Integración Jitsi Meet

---

## Personalización rápida

### Cambiar colores
Editá `tailwind.config.ts` → sección `colors`

### Cambiar precios mostrados en la landing
Editá `src/app/page.tsx` → array `servicios`

### Cambiar horarios disponibles para reservas
Editá `src/app/reservas/page.tsx` → array `horariosBase`

### Actualizar datos de contacto
Editá `.env.local`:
```
NEXT_PUBLIC_WHATSAPP_NUMBER=TU_NUMERO
```

---

## Solución de problemas

**"Error al iniciar sesión"**
→ Verificá que las variables de entorno en Vercel sean correctas

**"No puedo acceder al panel admin"**
→ Asegurate de haber actualizado el campo `rol = 'admin'` en la tabla `profiles`

**"El chat no actualiza en tiempo real"**
→ Habilitá Realtime en Supabase para la tabla `mensajes`

**"Error al generar sala Jitsi"**
→ Verificá que la función `generar_sala_jitsi` fue creada en el SQL schema

---

## Soporte

Para dudas técnicas sobre la configuración, consultá:
- [Documentación Supabase](https://supabase.com/docs)
- [Documentación Next.js](https://nextjs.org/docs)
- [Jitsi Meet API](https://jitsi.github.io/handbook/docs/dev-guide)

---

*🌙 Tarot Online — Concepción del Uruguay, Entre Ríos, Argentina*
*WhatsApp: +54 3442 674304*
