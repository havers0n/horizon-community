import { useState, useEffect } from 'react'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Badge } from '@/shared/ui/badge'
import { ExternalLink, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react'

interface MDTEmbedProps {
  onClose?: () => void
}

export function MDTEmbed({ onClose }: MDTEmbedProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [isAvailable, setIsAvailable] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    checkMDTAvailability()
  }, [])

  const checkMDTAvailability = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      // Проверяем доступность MDT системы
      const response = await fetch('/api/mdt/health', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (response.ok) {
        setIsAvailable(true)
      } else {
        setIsAvailable(false)
        setError('MDT система недоступна')
      }
    } catch (err) {
      setIsAvailable(false)
      setError('Ошибка подключения к MDT системе')
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpenMDT = () => {
    // Открываем MDT в новом окне
    window.open('/mdt', '_blank')
  }

  const handleRefresh = () => {
    checkMDTAvailability()
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <RefreshCw className="h-5 w-5 animate-spin" />
            <span>Проверка MDT системы...</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>MDT Система</span>
          <div className="flex items-center space-x-2">
            {isAvailable ? (
              <Badge className="bg-green-100 text-green-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                Доступна
              </Badge>
            ) : (
              <Badge className="bg-red-100 text-red-800">
                <AlertCircle className="h-3 w-3 mr-1" />
                Недоступна
              </Badge>
            )}
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {error ? (
          <div className="text-center space-y-4">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
            <p className="text-red-600">{error}</p>
            <Button onClick={handleRefresh} variant="outline">
              Попробовать снова
            </Button>
          </div>
        ) : isAvailable ? (
          <div className="space-y-4">
            <div className="text-center">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
              <p className="text-green-600 mb-4">MDT система доступна</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">Функции MDT:</h4>
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>• Управление персоналом</li>
                  <li>• База данных граждан</li>
                  <li>• Регистрация транспорта</li>
                  <li>• Система отчетов</li>
                  <li>• Карта города</li>
                </ul>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">Статистика:</h4>
                <div className="text-sm space-y-1 text-gray-600">
                  <p>• Активных офицеров: 24</p>
                  <p>• Записей в БД: 1,247</p>
                  <p>• Транспортных средств: 89</p>
                  <p>• Открытых дел: 12</p>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <Button onClick={handleOpenMDT} className="flex-1">
                <ExternalLink className="h-4 w-4 mr-2" />
                Открыть MDT
              </Button>
              {onClose && (
                <Button variant="outline" onClick={onClose}>
                  Закрыть
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center space-y-4">
            <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto" />
            <p className="text-yellow-600">MDT система временно недоступна</p>
            <Button onClick={handleRefresh} variant="outline">
              Проверить снова
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 