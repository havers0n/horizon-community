import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { getAuthState } from "@/lib/auth";
import { 
  Clock, UserCheck, AlertCircle, TrendingUp, Check, X, Eye,
  Users, FileText, Building, Headphones, Calendar
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useTranslation } from 'react-i18next';

interface Stats {
  pendingApplications: number;
  totalUsers: number;
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
    rank: string;
  };
}

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
}

export default function AdminPanel() {
  const { t } = useTranslation();
  const { user } = getAuthState();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Redirect if not supervisor/admin
  if (!user || !['supervisor', 'admin'].includes(user.role)) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardContent className="text-center py-12">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">{t('admin.access_denied', 'Access Denied')}</h3>
              <p className="text-gray-600">{t('admin.no_permission', "You don't have permission to access the admin panel.")}</p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  const { data: stats } = useQuery<Stats>({
    queryKey: ['/api/stats']
  });

  const { data: applications, isLoading: applicationsLoading } = useQuery<Application[]>({
    queryKey: ['/api/admin/applications']
  });

  const { data: users } = useQuery<User[]>({
    queryKey: ['/api/admin/users']
  });

  const updateApplicationMutation = useMutation({
    mutationFn: async ({ id, status, comment }: { id: number; status: string; comment?: string }) => {
      const response = await apiRequest('PUT', `/api/admin/applications/${id}`, {
        status,
        reviewComment: comment
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/applications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      toast({
        title: "Success",
        description: "Application status updated successfully"
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update application",
        variant: "destructive"
      });
    }
  });

  const handleApprove = (id: number) => {
    updateApplicationMutation.mutate({ id, status: 'approved' });
  };

  const handleReject = (id: number) => {
    updateApplicationMutation.mutate({ id, status: 'rejected' });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getUserInitials = (username: string) => {
    return username.substring(0, 2).toUpperCase();
  };

  const formatApplicationType = (type: string) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('admin.header', 'Administration Panel')}</h1>
          <p className="text-gray-600">{t('admin.description', 'Manage users, applications, and system settings.')}</p>
          
          {/* Admin Navigation */}
          <div className="mt-4 flex flex-wrap gap-2">
            <Button variant="outline" size="sm" asChild>
              <a href="/admin-leave-management">
                <Calendar className="h-4 w-4 mr-2" />
                {t('admin.leave_management', 'Управление отпусками')}
              </a>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a href="/admin-reports">
                <FileText className="h-4 w-4 mr-2" />
                {t('admin.report_management', 'Report Management')}
              </a>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a href="/admin-tests">
                <FileText className="h-4 w-4 mr-2" />
                Управление тестами
              </a>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a href="/admin/support">
                <Headphones className="h-4 w-4 mr-2" />
                {t('admin.support_tickets', 'Support Tickets')}
              </a>
            </Button>
          </div>
        </div>

        {/* Admin Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Clock className="h-8 w-8 text-warning" />
                  </div>
                  <div className="ml-5">
                    <p className="text-sm font-medium text-gray-500">{t('admin.stats.pending_reviews', 'Pending Reviews')}</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.pendingApplications}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <UserCheck className="h-8 w-8 text-success" />
                  </div>
                  <div className="ml-5">
                    <p className="text-sm font-medium text-gray-500">{t('admin.stats.total_users', 'Total Users')}</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Building className="h-8 w-8 text-success" />
                  </div>
                  <div className="ml-5">
                    <p className="text-sm font-medium text-gray-500">{t('admin.stats.departments', 'Departments')}</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.activeDepartments}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Headphones className="h-8 w-8 text-error" />
                  </div>
                  <div className="ml-5">
                    <p className="text-sm font-medium text-gray-500">{t('admin.stats.open_tickets', 'Open Tickets')}</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.openTickets}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Applications Management Table */}
        <Card className="mb-8">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Pending Applications</CardTitle>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <FileText className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {applicationsLoading ? (
              <div className="animate-pulse space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-16 bg-gray-200 rounded"></div>
                ))}
              </div>
            ) : applications && applications.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Applicant</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {applications.map((app: Application) => (
                      <TableRow key={app.id} className="hover:bg-gray-50">
                        <TableCell>
                          <div className="flex items-center">
                            <Avatar className="w-8 h-8 mr-3">
                              <AvatarFallback className="text-xs">
                                {app.author ? getUserInitials(app.author.username) : 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {app.author?.username || 'Unknown'}
                              </div>
                              <div className="text-sm text-gray-500">
                                {app.author?.rank || 'N/A'}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-900">
                            {formatApplicationType(app.type)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-500">
                            {formatDistanceToNow(new Date(app.createdAt), { addSuffix: true })}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(app.status)}>
                            {app.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {app.status === 'pending' && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleApprove(app.id)}
                                  disabled={updateApplicationMutation.isPending}
                                  className="text-green-600 hover:text-green-700"
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleReject(app.id)}
                                  disabled={updateApplicationMutation.isPending}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-blue-600 hover:text-blue-700"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Applications</h3>
                <p className="text-gray-600">No applications to review at this time.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Users */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Users</CardTitle>
          </CardHeader>
          <CardContent>
            {users && users.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Joined</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.slice(0, 10).map((user: User) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center">
                            <Avatar className="w-8 h-8 mr-3">
                              <AvatarFallback className="text-xs">
                                {getUserInitials(user.username)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="text-sm font-medium text-gray-900">{user.username}</div>
                              <div className="text-sm text-gray-500">{user.email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="capitalize">
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                            {user.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-500">
                            {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Users</h3>
                <p className="text-gray-600">No users found.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
