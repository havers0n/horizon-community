import React, { useState, useEffect } from 'react'
import { checkSupabaseConnection, checkApiConnection } from '../lib/env-checker'

interface ConnectionStatus {
  supabase: boolean | null
  api: boolean | null
  loading: boolean
}

export const ConnectionStatus: React.FC = () => {
  const [status, setStatus] = useState<ConnectionStatus>({
    supabase: null,
    api: null,
    loading: true
  })

  useEffect(() => {
    const checkConnections = async () => {
      setStatus(prev => ({ ...prev, loading: true }))
      
      try {
        const [supabaseOk, apiOk] = await Promise.allSettled([
          checkSupabaseConnection(),
          checkApiConnection()
        ])
        
        setStatus({
          supabase: supabaseOk.status === 'fulfilled' ? supabaseOk.value : false,
          api: apiOk.status === 'fulfilled' ? apiOk.value : false,
          loading: false
        })
      } catch (error) {
        console.error('Ошибка при проверке подключений:', error)
        setStatus({
          supabase: false,
          api: false,
          loading: false
        })
      }
    }

    checkConnections()
  }, [])

  if (status.loading) {
    return (
      <div className="fixed top-4 right-4 bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded z-50">
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
          Проверка подключений...
        </div>
      </div>
    )
  }

  const allConnected = status.supabase && status.api

  if (allConnected) {
    return null // Скрываем, если все подключено
  }

  return (
    <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-50">
      <div className="font-bold mb-1">Проблемы с подключением:</div>
      <div className="text-sm">
        {!status.supabase && <div>❌ Supabase</div>}
        {!status.api && <div>❌ API</div>}
      </div>
    </div>
  )
} 