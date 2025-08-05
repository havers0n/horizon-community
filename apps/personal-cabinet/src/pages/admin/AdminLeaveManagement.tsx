import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table'
import { Badge } from '@/shared/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/ui/dialog'

import { Label } from '@/shared/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'



import { Check, X } from 'lucide-react'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'

interface LeaveRequest {
  id: string
  employeeName: string
  employeeId: string
  department: string
  leaveType: 'vacation' | 'sick' | 'personal' | 'other'
  startDate: Date
  endDate: Date
  status: 'pending' | 'approved' | 'rejected'
  reason: string
  submittedAt: Date
}

const AdminLeaveManagement: React.FC = () => {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([])

  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterDepartment, setFilterDepartment] = useState<string>('all')

  // Mock data
  useEffect(() => {
    const mockData: LeaveRequest[] = [
      {
        id: '1',
        employeeName: 'Иван Петров',
        employeeId: 'EMP001',
        department: 'IT',
        leaveType: 'vacation',
        startDate: new Date('2024-07-15'),
        endDate: new Date('2024-07-30'),
        status: 'pending',
        reason: 'Летний отпуск',
        submittedAt: new Date('2024-06-01')
      },
      {
        id: '2',
        employeeName: 'Мария Сидорова',
        employeeId: 'EMP002',
        department: 'HR',
        leaveType: 'sick',
        startDate: new Date('2024-07-10'),
        endDate: new Date('2024-07-12'),
        status: 'approved',
        reason: 'Больничный лист',
        submittedAt: new Date('2024-07-09')
      }
    ]
    setLeaveRequests(mockData)
  }, [])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">На рассмотрении</Badge>
      case 'approved':
        return <Badge variant="default">Одобрено</Badge>
      case 'rejected':
        return <Badge variant="destructive">Отклонено</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getLeaveTypeLabel = (type: string) => {
    switch (type) {
      case 'vacation':
        return 'Отпуск'
      case 'sick':
        return 'Больничный'
      case 'personal':
        return 'Личные дела'
      case 'other':
        return 'Другое'
      default:
        return type
    }
  }

  const handleApprove = (id: string) => {
    setLeaveRequests(prev => 
      prev.map(request => 
        request.id === id ? { ...request, status: 'approved' as const } : request
      )
    )
  }

  const handleReject = (id: string) => {
    setLeaveRequests(prev => 
      prev.map(request => 
        request.id === id ? { ...request, status: 'rejected' as const } : request
      )
    )
  }

  const filteredRequests = leaveRequests.filter(request => {
    const statusMatch = filterStatus === 'all' || request.status === filterStatus
    const departmentMatch = filterDepartment === 'all' || request.department === filterDepartment
    return statusMatch && departmentMatch
  })

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Управление отпусками</h1>
        <Button>Экспорт данных</Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Фильтры</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="status-filter">Статус</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите статус" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все</SelectItem>
                  <SelectItem value="pending">На рассмотрении</SelectItem>
                  <SelectItem value="approved">Одобрено</SelectItem>
                  <SelectItem value="rejected">Отклонено</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="department-filter">Департамент</Label>
              <Select value={filterDepartment} onValueChange={setFilterDepartment}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите департамент" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все</SelectItem>
                  <SelectItem value="IT">IT</SelectItem>
                  <SelectItem value="HR">HR</SelectItem>
                  <SelectItem value="Finance">Финансы</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Leave Requests Table */}
      <Card>
        <CardHeader>
          <CardTitle>Заявки на отпуск</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Сотрудник</TableHead>
                <TableHead>Департамент</TableHead>
                <TableHead>Тип отпуска</TableHead>
                <TableHead>Даты</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead>Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRequests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{request.employeeName}</div>
                      <div className="text-sm text-muted-foreground">{request.employeeId}</div>
                    </div>
                  </TableCell>
                  <TableCell>{request.department}</TableCell>
                  <TableCell>{getLeaveTypeLabel(request.leaveType)}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{format(request.startDate, 'dd.MM.yyyy', { locale: ru })}</div>
                      <div className="text-muted-foreground">
                        {format(request.endDate, 'dd.MM.yyyy', { locale: ru })}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(request.status)}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            Просмотр
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Детали заявки</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label>Сотрудник</Label>
                                <div className="text-sm">{request.employeeName}</div>
                              </div>
                              <div>
                                <Label>Департамент</Label>
                                <div className="text-sm">{request.department}</div>
                              </div>
                              <div>
                                <Label>Тип отпуска</Label>
                                <div className="text-sm">{getLeaveTypeLabel(request.leaveType)}</div>
                              </div>
                              <div>
                                <Label>Статус</Label>
                                <div>{getStatusBadge(request.status)}</div>
                              </div>
                            </div>
                            <div>
                              <Label>Причина</Label>
                              <div className="text-sm mt-1">{request.reason}</div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label>Дата начала</Label>
                                <div className="text-sm">
                                  {format(request.startDate, 'dd.MM.yyyy', { locale: ru })}
                                </div>
                              </div>
                              <div>
                                <Label>Дата окончания</Label>
                                <div className="text-sm">
                                  {format(request.endDate, 'dd.MM.yyyy', { locale: ru })}
                                </div>
                              </div>
                            </div>
                            {request.status === 'pending' && (
                              <div className="flex gap-2 pt-4">
                                <Button 
                                  onClick={() => handleApprove(request.id)}
                                  className="flex items-center gap-2"
                                >
                                  <Check className="h-4 w-4" />
                                  Одобрить
                                </Button>
                                <Button 
                                  variant="destructive"
                                  onClick={() => handleReject(request.id)}
                                  className="flex items-center gap-2"
                                >
                                  <X className="h-4 w-4" />
                                  Отклонить
                                </Button>
                              </div>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

export default AdminLeaveManagement 