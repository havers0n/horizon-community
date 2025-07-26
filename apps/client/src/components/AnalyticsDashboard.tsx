import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from "recharts";
import { 
  Users, 
  TrendingUp, 
  Calendar, 
  Activity, 
  Target, 
  Award,
  Clock,
  Eye,
  Download,
  Share2
} from "lucide-react";

interface AnalyticsDashboardProps {
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

interface UserActivity {
  date: string;
  activeUsers: number;
  newUsers: number;
  applications: number;
  reports: number;
}

interface DepartmentStats {
  name: string;
  members: number;
  applications: number;
  activeUsers: number;
  avgResponseTime: number;
}

interface ApplicationStats {
  type: string;
  count: number;
  approved: number;
  rejected: number;
  pending: number;
}

interface OverallStats {
  totalUsers: number;
  activeToday: number;
  pendingApplications: number;
  avgRating: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export function AnalyticsDashboard({ isOpen, onOpenChange }: AnalyticsDashboardProps) {
  const [timeRange, setTimeRange] = useState('7d');
  const [selectedDepartment, setSelectedDepartment] = useState('all');

  // Загружаем данные аналитики
  const { data: userActivity = [] } = useQuery<UserActivity[]>({
    queryKey: ['/api/analytics/user-activity', timeRange],
    enabled: !!isOpen
  });

  const { data: departmentStats = [] } = useQuery<DepartmentStats[]>({
    queryKey: ['/api/analytics/department-stats'],
    enabled: !!isOpen
  });

  const { data: applicationStats = [] } = useQuery<ApplicationStats[]>({
    queryKey: ['/api/analytics/application-stats', timeRange],
    enabled: !!isOpen
  });

  const { data: overallStats } = useQuery<OverallStats>({
    queryKey: ['/api/analytics/overall-stats'],
    enabled: !!isOpen
  });

  // Фильтруем данные по департаменту
  const filteredDepartmentStats = selectedDepartment === 'all' 
    ? departmentStats 
    : departmentStats.filter(d => d.name.toLowerCase() === selectedDepartment.toLowerCase());

  // Подготавливаем данные для графиков
  const activityChartData = userActivity.map(item => ({
    ...item,
    date: new Date(item.date).toLocaleDateString(),
  }));

  const departmentChartData = filteredDepartmentStats.map(dept => ({
    name: dept.name,
    members: dept.members,
    applications: dept.applications,
    activeUsers: dept.activeUsers,
  }));

  const applicationPieData = applicationStats.map(app => ({
    name: app.type,
    value: app.count,
    approved: app.approved,
    rejected: app.rejected,
    pending: app.pending,
  }));

  return (
    <div className="space-y-6">
      {/* Заголовок и фильтры */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Аналитика сообщества</h2>
          <p className="text-gray-600">Подробная статистика активности и производительности</p>
        </div>
        
        <div className="flex gap-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 дней</SelectItem>
              <SelectItem value="30d">30 дней</SelectItem>
              <SelectItem value="90d">90 дней</SelectItem>
              <SelectItem value="1y">1 год</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Все департаменты" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все департаменты</SelectItem>
              <SelectItem value="lspd">LSPD</SelectItem>
              <SelectItem value="lsfd">LSFD</SelectItem>
              <SelectItem value="ems">EMS</SelectItem>
              <SelectItem value="bcso">BCSO</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Общая статистика */}
      {overallStats && typeof overallStats === 'object' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="card-hover">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Всего пользователей</dt>
                    <dd className="text-2xl font-bold text-gray-900">{overallStats.totalUsers}</dd>
                  </dl>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Активных сегодня</dt>
                    <dd className="text-2xl font-bold text-gray-900">{overallStats.activeToday}</dd>
                  </dl>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Target className="h-8 w-8 text-purple-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Заявок в обработке</dt>
                    <dd className="text-2xl font-bold text-gray-900">{overallStats.pendingApplications}</dd>
                  </dl>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Award className="h-8 w-8 text-yellow-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Средний рейтинг</dt>
                    <dd className="text-2xl font-bold text-gray-900">{overallStats.avgRating}/5</dd>
                  </dl>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Табы с графиками */}
      <Tabs defaultValue="activity" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="activity">Активность</TabsTrigger>
          <TabsTrigger value="departments">Департаменты</TabsTrigger>
          <TabsTrigger value="applications">Заявки</TabsTrigger>
          <TabsTrigger value="performance">Производительность</TabsTrigger>
        </TabsList>

        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5" />
                <span>Активность пользователей</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={activityChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Area 
                    type="monotone" 
                    dataKey="activeUsers" 
                    stackId="1" 
                    stroke="#8884d8" 
                    fill="#8884d8" 
                    name="Активные пользователи"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="newUsers" 
                    stackId="1" 
                    stroke="#82ca9d" 
                    fill="#82ca9d" 
                    name="Новые пользователи"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Заявки и рапорты</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={activityChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="applications" fill="#8884d8" name="Заявки" />
                    <Bar dataKey="reports" fill="#82ca9d" name="Рапорты" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Время активности</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Пиковая активность</span>
                    <Badge variant="outline">19:00 - 22:00</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Среднее время сессии</span>
                    <Badge variant="outline">45 минут</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Возвращаемость</span>
                    <Badge variant="outline">78%</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="departments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Статистика по департаментам</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={departmentChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="members" fill="#8884d8" name="Участники" />
                  <Bar dataKey="applications" fill="#82ca9d" name="Заявки" />
                  <Bar dataKey="activeUsers" fill="#ffc658" name="Активные" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDepartmentStats.map((dept, index) => (
              <Card key={dept.name} className="card-hover">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{dept.name}</span>
                    <Badge className={COLORS[index % COLORS.length]}>{dept.members}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Заявок:</span>
                    <span className="font-medium">{dept.applications}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Активных:</span>
                    <span className="font-medium">{dept.activeUsers}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Среднее время ответа:</span>
                    <span className="font-medium">{dept.avgResponseTime}ч</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="applications" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Распределение заявок</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={applicationPieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {applicationPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Статусы заявок</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {applicationStats.map((app, index) => (
                    <div key={app.type} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium capitalize">{app.type}</span>
                        <span className="text-sm text-gray-600">{app.count} всего</span>
                      </div>
                      <div className="flex gap-2">
                        <div className="flex-1 bg-green-100 rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full" 
                            style={{ width: `${(app.approved / app.count) * 100}%` }}
                          />
                        </div>
                        <div className="flex-1 bg-red-100 rounded-full h-2">
                          <div 
                            className="bg-red-500 h-2 rounded-full" 
                            style={{ width: `${(app.rejected / app.count) * 100}%` }}
                          />
                        </div>
                        <div className="flex-1 bg-yellow-100 rounded-full h-2">
                          <div 
                            className="bg-yellow-500 h-2 rounded-full" 
                            style={{ width: `${(app.pending / app.count) * 100}%` }}
                          />
                        </div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Одобрено: {app.approved}</span>
                        <span>Отклонено: {app.rejected}</span>
                        <span>На рассмотрении: {app.pending}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Производительность системы</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={activityChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="activeUsers" 
                    stroke="#8884d8" 
                    strokeWidth={2}
                    name="Активные пользователи"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <Clock className="h-12 w-12 mx-auto mb-4 text-blue-600" />
                <div className="text-2xl font-bold">2.3с</div>
                <div className="text-sm text-gray-600">Среднее время ответа</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <Eye className="h-12 w-12 mx-auto mb-4 text-green-600" />
                <div className="text-2xl font-bold">99.8%</div>
                <div className="text-sm text-gray-600">Время безотказной работы</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <Download className="h-12 w-12 mx-auto mb-4 text-purple-600" />
                <div className="text-2xl font-bold">1.2с</div>
                <div className="text-sm text-gray-600">Время загрузки страницы</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 