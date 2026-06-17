export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          nombre: string | null
          apellido: string | null
          telefono: string | null
          avatar_url: string | null
          rol: 'cliente' | 'admin' | 'tarotista'
          bio: string | null
          fecha_nacimiento: string | null
          ciudad: string | null
          pais: string | null
          notificaciones_email: boolean
          notificaciones_whatsapp: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>
      }
      consultas: {
        Row: {
          id: string
          usuario_id: string
          tarotista_id: string | null
          titulo: string
          pregunta: string
          respuesta: string | null
          tipo: 'mensaje' | 'videollamada' | 'chat'
          estado: 'pendiente' | 'en_proceso' | 'respondida' | 'cerrada'
          prioridad: 'normal' | 'urgente'
          categoria: 'amor' | 'trabajo' | 'salud' | 'dinero' | 'familia' | 'espiritual' | 'general'
          archivos_adjuntos: Json
          notas_privadas: string | null
          valoracion: number | null
          comentario_valoracion: string | null
          created_at: string
          updated_at: string
          respondida_at: string | null
        }
        Insert: Omit<Database['public']['Tables']['consultas']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['consultas']['Insert']>
      }
      mensajes: {
        Row: {
          id: string
          consulta_id: string | null
          remitente_id: string
          destinatario_id: string
          contenido: string
          tipo: 'texto' | 'imagen' | 'archivo'
          leido: boolean
          leido_at: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['mensajes']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['mensajes']['Insert']>
      }
      reservas: {
        Row: {
          id: string
          usuario_id: string
          tarotista_id: string | null
          fecha: string
          hora_inicio: string
          hora_fin: string
          tipo: 'videollamada' | 'chat' | 'consulta_escrita'
          estado: 'pendiente' | 'confirmada' | 'cancelada' | 'completada' | 'no_asistio'
          jitsi_room: string | null
          jitsi_url: string | null
          notas: string | null
          precio: number | null
          pagado: boolean
          recordatorio_enviado: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['reservas']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['reservas']['Insert']>
      }
      notificaciones: {
        Row: {
          id: string
          usuario_id: string
          tipo: 'mensaje' | 'reserva' | 'consulta' | 'sistema' | 'videollamada'
          titulo: string
          contenido: string
          leida: boolean
          url: string | null
          metadata: Json
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['notificaciones']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['notificaciones']['Insert']>
      }
      horarios_disponibles: {
        Row: {
          id: string
          tarotista_id: string
          dia_semana: number
          hora_inicio: string
          hora_fin: string
          activo: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['horarios_disponibles']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['horarios_disponibles']['Insert']>
      }
    }
    Functions: {
      get_estadisticas: {
        Args: Record<string, never>
        Returns: Json
      }
      generar_sala_jitsi: {
        Args: { reserva_id: string }
        Returns: string
      }
    }
  }
}

// Tipos helper
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Consulta = Database['public']['Tables']['consultas']['Row']
export type Mensaje = Database['public']['Tables']['mensajes']['Row']
export type Reserva = Database['public']['Tables']['reservas']['Row']
export type Notificacion = Database['public']['Tables']['notificaciones']['Row']
