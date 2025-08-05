import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'
import { Badge } from '@/shared/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs'
import { 
  ArrowLeft, 
  Clock, 
  User, 
  FileText, 

  CheckCircle,
  XCircle,

  Download,
  MessageSquare
} from 'lucide-react'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'

interface Application {
  id: string
  type: 'leave' | 'transfer' | 'promotion' | 'other'
  title: string
  description: string
  status: 'pending' | 'approved' | 'rejected' | 'in_review'
  priority: 'low' | 'medium' | 'high'
  submittedAt: Date
  updatedAt: Date
  employee: {
    id: string
    name: string
    email: string
    department: string
    position: string
    avatar?: string
  }
  attachments: Array<{
    id: string
    name: string
    size: number
    type: string
    url: string
  }>
  comments: Array<{
    id: string
    author: string
    content: string
    timestamp: Date
    isAdmin: boolean
  }>
  details: Record<string, any>
}

const ApplicationDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [application, setApplication] = useState<Application | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Mock data
    const mockApplication: Application = {
      id: id || '1',
      type: 'leave',
      title: 'Заявка на отпуск',
      description: 'Прошу предоставить ежегодный оплачиваемый отпуск с 15 по 30 июля 2024 года.',
      status: 'pending',
      priority: 'medium',
      submittedAt: new Date('2024-07-01T10:00:00'),
      updatedAt: new Date('2024-07-05T14:30:00'),
      employee: {
        id: 'EMP001',
        name: 'Иван Петров',
        email: 'ivan.petrov@company.com',
        department: 'IT',
        position: 'Senior Developer',
        avatar: '/avatars/01.png'
      },
      attachments: [
        {
          id: '1',
          name: 'Документ.pdf',
          size: 1024000,
          type: 'application/pdf',
          url: '/documents/document.pdf'
        }
      ],
      comments: [
        {
          id: '1',
          author: 'HR Manager',
          content: 'Заявка получена, рассматривается.',
          timestamp: new Date('2024-07-01T11:00:00'),
          isAdmin: true
        },
        {
          id: '2',
          author: 'Иван Петров',
          content: 'Спасибо за рассмотрение.',
          timestamp: new Date('2024-07-01T12:00:00'),
          isAdmin: false
        }
      ],
      details: {
        startDate: '2024-07-15',
        endDate: '2024-07-30',
        leaveType: 'vacation',
        reason: 'Летний отпуск'
      }
    }
    
    setTimeout(() => {
      setApplication(mockApplication)
      setLoading(false)
    }, 500)
  }, [id])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">На рассмотрении</Badge>
      case 'approved':
        return <Badge variant="default">Одобрено</Badge>
      case 'rejected':
        return <Badge variant="destructive">Отклонено</Badge>
      case 'in_review':
        return <Badge variant="outline">На рассмотрении</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'low':
        return <Badge variant="outline">Низкий</Badge>
      case 'medium':
        return <Badge variant="secondary">Средний</Badge>
      case 'high':
        return <Badge variant="destructive">Высокий</Badge>
      default:
        return <Badge variant="outline">{priority}</Badge>
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'leave':
        return 'Отпуск'
      case 'transfer':
        return 'Перевод'
      case 'promotion':
        return 'Повышение'
      case 'other':
        return 'Другое'
      default:
        return type
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!application) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Заявка не найдена</h1>
          <Button onClick={() => navigate(-1)} className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Назад
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Назад
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{application.title}</h1>
            <p className="text-muted-foreground">ID: {application.id}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {getStatusBadge(application.status)}
          {getPriorityBadge(application.priority)}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="details" className="space-y-4">
            <TabsList>
              <TabsTrigger value="details">Детали</TabsTrigger>
              <TabsTrigger value="comments">Комментарии</TabsTrigger>
              <TabsTrigger value="attachments">Вложения</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Описание заявки</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed">{application.description}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Детали заявки</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Тип заявки</label>
                      <p className="text-sm">{getTypeLabel(application.type)}</p>
                    </div>
                    {application.details.startDate && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Дата начала</label>
                        <p className="text-sm">{application.details.startDate}</p>
                      </div>
                    )}
                    {application.details.endDate && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Дата окончания</label>
                        <p className="text-sm">{application.details.endDate}</p>
                      </div>
                    )}
                    {application.details.reason && (
                      <div className="md:col-span-2">
                        <label className="text-sm font-medium text-muted-foreground">Причина</label>
                        <p className="text-sm">{application.details.reason}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="comments" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Комментарии</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {application.comments.map((comment) => (
                      <div key={comment.id} className="flex space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={comment.isAdmin ? '/avatars/admin.png' : application.employee.avatar} />
                          <AvatarFallback>{comment.author.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium">{comment.author}</span>
                            <span className="text-xs text-muted-foreground">
                              {format(comment.timestamp, 'dd.MM.yyyy HH:mm', { locale: ru })}
                            </span>
                            {comment.isAdmin && (
                              <Badge variant="outline" className="text-xs">Админ</Badge>
                            )}
                          </div>
                          <p className="text-sm mt-1">{comment.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        placeholder="Добавить комментарий..."
                        className="flex-1 px-3 py-2 border rounded-md text-sm"
                      />
                      <Button size="sm">Отправить</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="attachments" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Вложения</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {application.attachments.map((attachment) => (
                      <div key={attachment.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <FileText className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">{attachment.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatFileSize(attachment.size)}
                            </p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Скачать
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Employee Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-4 w-4 mr-2" />
                Сотрудник
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={application.employee.avatar} />
                  <AvatarFallback>{application.employee.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{application.employee.name}</p>
                  <p className="text-sm text-muted-foreground">{application.employee.position}</p>
                  <p className="text-sm text-muted-foreground">{application.employee.department}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                Временная шкала
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Заявка подана</p>
                    <p className="text-xs text-muted-foreground">
                      {format(application.submittedAt, 'dd.MM.yyyy HH:mm', { locale: ru })}
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-2 h-2 bg-gray-300 rounded-full mt-2"></div>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Последнее обновление</p>
                    <p className="text-xs text-muted-foreground">
                      {format(application.updatedAt, 'dd.MM.yyyy HH:mm', { locale: ru })}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Действия</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button className="w-full" disabled={application.status !== 'pending'}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Одобрить
                </Button>
                <Button variant="destructive" className="w-full" disabled={application.status !== 'pending'}>
                  <XCircle className="h-4 w-4 mr-2" />
                  Отклонить
                </Button>
                <Button variant="outline" className="w-full">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Добавить комментарий
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default ApplicationDetails 