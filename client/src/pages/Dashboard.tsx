import { Layout } from "@/components/Layout";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ApplicationModal } from "@/components/ApplicationModal";
import { ComplaintModal } from "@/components/ComplaintModal";
import { SupportModal } from "@/components/SupportModal";
import { EntryApplicationModal } from "@/components/EntryApplicationModal";
import { JointModal } from "@/components/JointModal";
import { useQuery } from "@tanstack/react-query";
import { getAuthState } from "@/lib/auth";
import { 
  Users, FileText, Building, Headphones, Shield, Flame, 
  Ambulance, Star, Plus, AlertTriangle, Upload, ChevronRight,
  UserPlus, RefreshCw, Calendar, Info
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";

interface Stats {
  totalUsers: number;
  pendingApplications: number;
  activeDepartments: number;
  openTickets: number;
}

interface Application {
  id: number;
  type: string;
  status: string;
  createdAt: string;
  author?: {
    username: string;
  };
}

interface Department {
  id: number;
  name: string;
  fullName: string;
}

interface Notification {
  id: number;
  message: string;
  createdAt: string;
}

export default function Dashboard() {
  const { t } = useTranslation();
  const { user } = getAuthState();
  
  const { data: stats } = useQuery<Stats>({
    queryKey: ['/api/stats'],
    enabled: user?.role === 'supervisor' || user?.role === 'admin'
  });

  const { data: departments } = useQuery<Department[]>({
    queryKey: ['/api/departments']
  });

  const { data: applications } = useQuery<Application[]>({
    queryKey: ['/api/applications']
  });

  const { data: notifications } = useQuery<Notification[]>({
    queryKey: ['/api/notifications']
  });

  const recentApplications = applications?.slice(0, 3) || [];
  const recentNotifications = notifications?.slice(0, 3) || [];
  
  const getUserInitials = (username: string) => {
    return username.substring(0, 2).toUpperCase();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'status-badge approved';
      case 'rejected': return 'status-badge rejected';
      case 'pending': return 'status-badge pending';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getApplicationIcon = (type: string) => {
    switch (type) {
      case 'promotion': return <UserPlus className="h-4 w-4" />;
      case 'transfer_dept': 
      case 'transfer_div': return <RefreshCw className="h-4 w-4" />;
      case 'leave': return <Calendar className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getDepartmentIcon = (name: string) => {
    switch (name.toLowerCase()) {
      case 'pd': return <Shield className="text-blue-600" />;
      case 'sahp': return <Shield className="text-yellow-600" />;
      case 'sams': return <Ambulance className="text-green-600" />;
      case 'safr': return <Flame className="text-red-600" />;
      case 'dd': return <Headphones className="text-purple-600" />;
      case 'cd': return <Users className="text-gray-600" />;
      default: return <Building className="text-muted-foreground" />;
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {t('dashboard.welcome', 'Welcome back')}, {user?.username}
          </h1>
          <p className="text-muted-foreground">{t('dashboard.manage', 'Manage your departments, applications, and system operations.')}</p>
        </div>

        {/* Quick Stats Cards */}
        {(user?.role === 'supervisor' || user?.role === 'admin') && stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="card-gold">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Users className="h-8 w-8 text-primary" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-muted-foreground truncate">{t('dashboard.total_users', 'Total Users')}</dt>
                      <dd className="text-2xl font-bold text-foreground">{stats.totalUsers}</dd>
                    </dl>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="card-gold">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <FileText className="h-8 w-8 text-warning" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-muted-foreground truncate">{t('dashboard.pending_applications', 'Pending Applications')}</dt>
                      <dd className="text-2xl font-bold text-foreground">{stats.pendingApplications}</dd>
                    </dl>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="card-gold">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Building className="h-8 w-8 text-success" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-muted-foreground truncate">{t('dashboard.active_departments', 'Active Departments')}</dt>
                      <dd className="text-2xl font-bold text-foreground">{stats.activeDepartments}</dd>
                    </dl>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="card-gold">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Headphones className="h-8 w-8 text-destructive" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-muted-foreground truncate">{t('dashboard.open_tickets', 'Open Tickets')}</dt>
                      <dd className="text-2xl font-bold text-foreground">{stats.openTickets}</dd>
                    </dl>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Recent Applications & Departments */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Recent Applications */}
            <Card className="card-gold">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-foreground">{t('dashboard.recent_applications', 'Recent Applications')}</CardTitle>
                <a href="/applications" className="text-primary hover:text-primary/90 text-sm font-medium">
                  {t('dashboard.view_all', 'View All')}
                </a>
              </CardHeader>
              <CardContent>
                {recentApplications.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">{t('dashboard.no_applications', 'No applications yet')}</p>
                ) : (
                  <div className="space-y-4">
                    {recentApplications.map((application: any) => (
                      <div key={application.id} className="flex items-center justify-between py-3 border-b border-border last:border-b-0">
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                              {getApplicationIcon(application.type)}
                            </div>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground capitalize">
                              {String(t(`applications.type.${application.type}`, application.type))}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              by {user?.username}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <Badge className={getStatusColor(application.status)}>
                              {String(t(`applications.status.${application.status}`, application.status))}
                            </Badge>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(application.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Departments Overview */}
            <Card className="card-gold">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-foreground">Департаменты</CardTitle>
                <a href="/departments" className="text-primary hover:text-primary/90 text-sm font-medium">
                  {t('dashboard.view_all', 'View All')}
                </a>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {departments?.map((department: any) => (
                    <div key={department.id} className="text-center p-4 rounded-lg hover:bg-accent/50 cursor-pointer transition-colors">
                      <div className="w-16 h-16 mx-auto mb-3 bg-muted rounded-full flex items-center justify-center">
                        {getDepartmentIcon(department.name)}
                      </div>
                      <h4 className="text-sm font-medium text-foreground mb-1">{department.name}</h4>
                      <p className="text-xs text-muted-foreground">{department.fullName}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Profile & Quick Actions */}
          <div className="space-y-6">
            
            {/* User Profile Card */}
            <Card className="card-gold">
              <CardHeader>
                <CardTitle className="text-foreground">{t('dashboard.my_profile', 'My Profile')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-6">
                  <Avatar className="w-20 h-20 mx-auto mb-4">
                    <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-bold">
                      {user ? getUserInitials(user.username) : 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <h4 className="text-lg font-semibold text-foreground">{user?.username}</h4>
                  <p className="text-sm text-muted-foreground capitalize">{user?.rank || 'N/A'}</p>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">{t('dashboard.role', 'Role:')}</span>
                    <span className="text-sm font-medium text-foreground capitalize">{String(t(`dashboard.user_role.${user?.role || 'user'}`, user?.role || 'user'))}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">{t('dashboard.status', 'Status:')}</span>
                    <Badge className="status-badge approved capitalize">{String(t(`dashboard.user_status.${user?.status || 'active'}`, user?.status || 'active'))}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">{t('dashboard.member_since', 'Member Since:')}</span>
                    <span className="text-sm font-medium text-foreground">
                      {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="card-gold">
              <CardHeader>
                <CardTitle className="text-foreground">{t('dashboard.quick_actions', 'Quick Actions')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Показываем заявку на вступление только кандидатам */}
                {user?.role === 'candidate' && (
                  <EntryApplicationModal />
                )}
                
                {/* Показываем остальные действия только участникам и выше */}
                {(user?.role === 'member' || user?.role === 'supervisor' || user?.role === 'admin') && (
                  <>
                    <ApplicationModal>
                      <button className="w-full flex items-center justify-between p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors">
                        <div className="flex items-center space-x-3">
                          <Plus className="h-4 w-4 text-primary" />
                          <span className="text-sm font-medium text-foreground">{t('dashboard.new_application', 'New Application')}</span>
                        </div>
                      </button>
                    </ApplicationModal>
                    
                    <JointModal>
                      <button className="w-full flex items-center justify-between p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors">
                        <div className="flex items-center space-x-3">
                          <Building className="h-4 w-4 text-primary" />
                          <span className="text-sm font-medium text-foreground">{t('dashboard.joint_application', 'Submit Joint Application')}</span>
                        </div>
                      </button>
                    </JointModal>
                    
                    {/* Карточка доступных тестов */}
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h3 className="font-medium text-blue-900 mb-2">Доступные тесты</h3>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-blue-700">LSPD Entry Exam</span>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => window.location.href = '/test/1'}
                            className="text-blue-600 border-blue-300 hover:bg-blue-50"
                          >
                            Пройти
                          </Button>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-blue-700">SAHP Entry Exam</span>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => window.location.href = '/test/2'}
                            className="text-blue-600 border-blue-300 hover:bg-blue-50"
                          >
                            Пройти
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    <ComplaintModal>
                      <button className="w-full flex items-center justify-between p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors">
                        <div className="flex items-center space-x-3">
                          <AlertTriangle className="h-4 w-4 text-warning" />
                          <span className="text-sm font-medium text-foreground">{t('dashboard.file_complaint', 'File Complaint')}</span>
                        </div>
                      </button>
                    </ComplaintModal>
                    
                    <SupportModal>
                      <button className="w-full flex items-center justify-between p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors">
                        <div className="flex items-center space-x-3">
                          <Headphones className="h-4 w-4 text-accent" />
                          <span className="text-sm font-medium text-foreground">{t('dashboard.contact_support', 'Contact Support')}</span>
                        </div>
                      </button>
                    </SupportModal>
                    
                    <button className="w-full flex items-center justify-between p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors">
                      <div className="flex items-center space-x-3">
                        <Upload className="h-4 w-4 text-success" />
                        <span className="text-sm font-medium text-foreground">{t('dashboard.upload_report', 'Upload Report')}</span>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </button>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Recent Notifications */}
            <Card className="card-gold">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-foreground">{t('dashboard.notifications', 'Notifications')}</CardTitle>
                <a href="/notifications" className="text-primary hover:text-primary/90 text-sm font-medium">
                  {t('dashboard.view_all', 'View All')}
                </a>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentNotifications.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">{t('dashboard.no_notifications', 'No notifications')}</p>
                ) : (
                  recentNotifications.map((notification: any) => (
                    <div key={notification.id} className={`flex items-start space-x-3 p-3 rounded-lg ${
                      !notification.isRead ? 'bg-primary/10 border border-primary/20' : 'hover:bg-accent/50'
                    }`}>
                      <Info className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm text-foreground">{notification.content}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
