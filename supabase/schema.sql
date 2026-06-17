-- =============================================
-- TAROT ONLINE - Base de Datos Completa
-- Supabase PostgreSQL Schema
-- =============================================

-- Habilitar extensiones
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================
-- TABLA: profiles (extiende auth.users)
-- =============================================
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  nombre TEXT,
  apellido TEXT,
  telefono TEXT,
  avatar_url TEXT,
  rol TEXT DEFAULT 'cliente' CHECK (rol IN ('cliente', 'admin', 'tarotista')),
  bio TEXT,
  fecha_nacimiento DATE,
  ciudad TEXT,
  pais TEXT DEFAULT 'Argentina',
  notificaciones_email BOOLEAN DEFAULT true,
  notificaciones_whatsapp BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TABLA: consultas
-- =============================================
CREATE TABLE public.consultas (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  usuario_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  tarotista_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  titulo TEXT NOT NULL,
  pregunta TEXT NOT NULL,
  respuesta TEXT,
  tipo TEXT DEFAULT 'mensaje' CHECK (tipo IN ('mensaje', 'videollamada', 'chat')),
  estado TEXT DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'en_proceso', 'respondida', 'cerrada')),
  prioridad TEXT DEFAULT 'normal' CHECK (prioridad IN ('normal', 'urgente')),
  categoria TEXT DEFAULT 'general' CHECK (categoria IN ('amor', 'trabajo', 'salud', 'dinero', 'familia', 'espiritual', 'general')),
  archivos_adjuntos JSONB DEFAULT '[]',
  notas_privadas TEXT,
  valoracion INTEGER CHECK (valoracion BETWEEN 1 AND 5),
  comentario_valoracion TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  respondida_at TIMESTAMPTZ
);

-- =============================================
-- TABLA: mensajes (chat privado)
-- =============================================
CREATE TABLE public.mensajes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  consulta_id UUID REFERENCES public.consultas(id) ON DELETE CASCADE,
  remitente_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  destinatario_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  contenido TEXT NOT NULL,
  tipo TEXT DEFAULT 'texto' CHECK (tipo IN ('texto', 'imagen', 'archivo')),
  leido BOOLEAN DEFAULT false,
  leido_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TABLA: reservas
-- =============================================
CREATE TABLE public.reservas (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  usuario_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  tarotista_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  fecha DATE NOT NULL,
  hora_inicio TIME NOT NULL,
  hora_fin TIME NOT NULL,
  tipo TEXT DEFAULT 'videollamada' CHECK (tipo IN ('videollamada', 'chat', 'consulta_escrita')),
  estado TEXT DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'confirmada', 'cancelada', 'completada', 'no_asistio')),
  jitsi_room TEXT,
  jitsi_url TEXT,
  notas TEXT,
  precio DECIMAL(10,2),
  pagado BOOLEAN DEFAULT false,
  recordatorio_enviado BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TABLA: horarios_disponibles
-- =============================================
CREATE TABLE public.horarios_disponibles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  tarotista_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  dia_semana INTEGER NOT NULL CHECK (dia_semana BETWEEN 0 AND 6),
  hora_inicio TIME NOT NULL,
  hora_fin TIME NOT NULL,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TABLA: dias_bloqueados
-- =============================================
CREATE TABLE public.dias_bloqueados (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  tarotista_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  fecha DATE NOT NULL,
  motivo TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TABLA: notificaciones
-- =============================================
CREATE TABLE public.notificaciones (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  usuario_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('mensaje', 'reserva', 'consulta', 'sistema', 'videollamada')),
  titulo TEXT NOT NULL,
  contenido TEXT NOT NULL,
  leida BOOLEAN DEFAULT false,
  url TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TABLA: configuracion_sitio
-- =============================================
CREATE TABLE public.configuracion_sitio (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  clave TEXT UNIQUE NOT NULL,
  valor TEXT,
  descripcion TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- ÍNDICES
-- =============================================
CREATE INDEX idx_consultas_usuario ON public.consultas(usuario_id);
CREATE INDEX idx_consultas_estado ON public.consultas(estado);
CREATE INDEX idx_consultas_created ON public.consultas(created_at DESC);
CREATE INDEX idx_mensajes_consulta ON public.mensajes(consulta_id);
CREATE INDEX idx_mensajes_remitente ON public.mensajes(remitente_id);
CREATE INDEX idx_mensajes_destinatario ON public.mensajes(destinatario_id);
CREATE INDEX idx_reservas_usuario ON public.reservas(usuario_id);
CREATE INDEX idx_reservas_fecha ON public.reservas(fecha);
CREATE INDEX idx_notificaciones_usuario ON public.notificaciones(usuario_id, leida);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mensajes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notificaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.horarios_disponibles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dias_bloqueados ENABLE ROW LEVEL SECURITY;

-- Profiles: usuarios ven su propio perfil, admin ve todos
CREATE POLICY "profiles_select" ON public.profiles
  FOR SELECT USING (auth.uid() = id OR EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND rol = 'admin'
  ));

CREATE POLICY "profiles_update" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "profiles_insert" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Consultas
CREATE POLICY "consultas_select_own" ON public.consultas
  FOR SELECT USING (
    usuario_id = auth.uid() OR 
    tarotista_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND rol IN ('admin', 'tarotista'))
  );

CREATE POLICY "consultas_insert" ON public.consultas
  FOR INSERT WITH CHECK (usuario_id = auth.uid());

CREATE POLICY "consultas_update" ON public.consultas
  FOR UPDATE USING (
    usuario_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND rol IN ('admin', 'tarotista'))
  );

-- Mensajes
CREATE POLICY "mensajes_select" ON public.mensajes
  FOR SELECT USING (
    remitente_id = auth.uid() OR 
    destinatario_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND rol = 'admin')
  );

CREATE POLICY "mensajes_insert" ON public.mensajes
  FOR INSERT WITH CHECK (remitente_id = auth.uid());

CREATE POLICY "mensajes_update" ON public.mensajes
  FOR UPDATE USING (destinatario_id = auth.uid());

-- Reservas
CREATE POLICY "reservas_select" ON public.reservas
  FOR SELECT USING (
    usuario_id = auth.uid() OR
    tarotista_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND rol IN ('admin', 'tarotista'))
  );

CREATE POLICY "reservas_insert" ON public.reservas
  FOR INSERT WITH CHECK (usuario_id = auth.uid());

CREATE POLICY "reservas_update" ON public.reservas
  FOR UPDATE USING (
    usuario_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND rol IN ('admin', 'tarotista'))
  );

-- Notificaciones
CREATE POLICY "notificaciones_select" ON public.notificaciones
  FOR SELECT USING (usuario_id = auth.uid());

CREATE POLICY "notificaciones_update" ON public.notificaciones
  FOR UPDATE USING (usuario_id = auth.uid());

-- Horarios (lectura pública)
CREATE POLICY "horarios_select" ON public.horarios_disponibles
  FOR SELECT USING (true);

CREATE POLICY "horarios_manage" ON public.horarios_disponibles
  FOR ALL USING (
    tarotista_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND rol = 'admin')
  );

-- Días bloqueados
CREATE POLICY "dias_select" ON public.dias_bloqueados
  FOR SELECT USING (true);

CREATE POLICY "dias_manage" ON public.dias_bloqueados
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND rol IN ('admin', 'tarotista'))
  );

-- =============================================
-- FUNCIONES
-- =============================================

-- Trigger: crear profile al registrarse
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, nombre)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nombre', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger: actualizar updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER consultas_updated_at BEFORE UPDATE ON public.consultas
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER reservas_updated_at BEFORE UPDATE ON public.reservas
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Función: generar sala Jitsi
CREATE OR REPLACE FUNCTION public.generar_sala_jitsi(reserva_id UUID)
RETURNS TEXT AS $$
DECLARE
  sala TEXT;
BEGIN
  sala := 'tarot-' || encode(digest(reserva_id::text || NOW()::text, 'sha256'), 'hex');
  sala := substring(sala, 1, 20);
  
  UPDATE public.reservas 
  SET 
    jitsi_room = sala,
    jitsi_url = 'https://meet.jit.si/' || sala
  WHERE id = reserva_id;
  
  RETURN sala;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función: estadísticas para admin
CREATE OR REPLACE FUNCTION public.get_estadisticas()
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'total_usuarios', (SELECT COUNT(*) FROM public.profiles WHERE rol = 'cliente'),
    'consultas_pendientes', (SELECT COUNT(*) FROM public.consultas WHERE estado = 'pendiente'),
    'consultas_respondidas', (SELECT COUNT(*) FROM public.consultas WHERE estado = 'respondida'),
    'reservas_hoy', (SELECT COUNT(*) FROM public.reservas WHERE fecha = CURRENT_DATE AND estado = 'confirmada'),
    'reservas_semana', (SELECT COUNT(*) FROM public.reservas WHERE fecha BETWEEN CURRENT_DATE AND CURRENT_DATE + 7 AND estado = 'confirmada'),
    'mensajes_no_leidos', (SELECT COUNT(*) FROM public.mensajes WHERE leido = false)
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- DATOS INICIALES
-- =============================================

-- Configuración por defecto
INSERT INTO public.configuracion_sitio (clave, valor, descripcion) VALUES
  ('nombre_tarotista', 'Tarotista', 'Nombre de la tarotista'),
  ('precio_consulta', '2500', 'Precio base de consulta en ARS'),
  ('precio_videollamada', '4000', 'Precio videollamada 30min en ARS'),
  ('duracion_turno', '30', 'Duración de turno en minutos'),
  ('whatsapp', '3442674304', 'Número de WhatsApp'),
  ('ciudad', 'Concepción del Uruguay, Entre Ríos', 'Ciudad'),
  ('descripcion_home', 'Descubrí lo que las cartas tienen para vos', 'Descripción homepage');

-- Horarios por defecto (Lunes a Sábado 9:00-18:00)
-- Estos se asignarán al admin al crearse
