'use client'

import { useEffect, useRef } from 'react'

interface JitsiMeetProps {
  roomName: string
  displayName: string
  onClose?: () => void
}

declare global {
  interface Window {
    JitsiMeetExternalAPI: any
  }
}

export default function JitsiMeet({ roomName, displayName, onClose }: JitsiMeetProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const apiRef = useRef<any>(null)

  useEffect(() => {
    // Cargar script de Jitsi si no está cargado
    const loadJitsi = () => {
      if (window.JitsiMeetExternalAPI) {
        initJitsi()
        return
      }

      const script = document.createElement('script')
      script.src = 'https://meet.jit.si/external_api.js'
      script.async = true
      script.onload = initJitsi
      document.head.appendChild(script)
    }

    const initJitsi = () => {
      if (!containerRef.current || !window.JitsiMeetExternalAPI) return

      apiRef.current = new window.JitsiMeetExternalAPI('meet.jit.si', {
        roomName,
        parentNode: containerRef.current,
        width: '100%',
        height: '100%',
        userInfo: {
          displayName,
        },
        configOverwrite: {
          startWithAudioMuted: false,
          startWithVideoMuted: false,
          disableDeepLinking: true,
          prejoinPageEnabled: false,
        },
        interfaceConfigOverwrite: {
          SHOW_JITSI_WATERMARK: false,
          SHOW_WATERMARK_FOR_GUESTS: false,
          TOOLBAR_BUTTONS: [
            'microphone', 'camera', 'closedcaptions', 'desktop',
            'fullscreen', 'fodeviceselection', 'hangup', 'chat',
            'recording', 'livestreaming', 'etherpad', 'sharedvideo',
            'settings', 'raisehand', 'videoquality', 'filmstrip',
            'feedback', 'stats', 'shortcuts', 'tileview', 'download',
            'help', 'mute-everyone',
          ],
        },
      })

      apiRef.current.addEventListener('readyToClose', () => {
        onClose?.()
      })
    }

    loadJitsi()

    return () => {
      if (apiRef.current) {
        apiRef.current.dispose()
      }
    }
  }, [roomName, displayName])

  return (
    <div
      ref={containerRef}
      className="w-full rounded-xl overflow-hidden border border-violet-glow/20"
      style={{ height: '500px' }}
    />
  )
}
