import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Clock, CheckCircle, XCircle, Eye, Download, User, Calendar } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ReportWithAuthor {
  id: number;
  authorId: number;
  status: string;
  fileUrl: string;
  supervisorComment: string | null;
  createdAt: string;
  author: {
    id: number;
    username: string;
    email: string;
    department: number | null;
  } | null;
}

function AdminReports() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [selectedReport, setSelectedReport] = useState<ReportWithAuthor | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewStatus, setReviewStatus] = useState<'approved' | 'rejected'>('approved');
  const [reviewComment, setReviewComment] = useState('');

  // Fetch all reports for admin review
  const { data: reports = [], isLoading, refetch } = useQuery<ReportWithAuthor[]>({
    queryKey: ['/api/admin/reports'],
    enabled: true // Enable real API calls
  });

  // Mock data for demonstration
  const mockReports: ReportWithAuthor[] = [
    {
      id: 1,
      authorId: 2,
      status: "pending",
      fileUrl: "/uploads/reports/incident-001.pdf",
      supervisorComment: null,
      createdAt: "2025-01-01T10:00:00Z",
      author: {
        id: 2,
        username: "john_doe",
        email: "john@example.com",
        department: 1
      }
    },
    {
      id: 2,
      authorId: 3,
      status: "approved",
      fileUrl: "/uploads/reports/arrest-002.pdf",
      supervisorComment: "Well documented incident. Good work.",
      createdAt: "2024-12-28T14:30:00Z",
      author: {
        id: 3,
        username: "jane_smith",
        email: "jane@example.com",
        department: 1
      }
    },
    {
      id: 3,
      authorId: 4,
      status: "rejected",
      fileUrl: "/uploads/reports/vehicle-003.pdf",
      supervisorComment: "Missing vehicle identification details. Please resubmit with complete information.",
      createdAt: "2024-12-25T09:15:00Z",
      author: {
        id: 4,
        username: "mike_wilson",
        email: "mike@example.com",
        department: 2
      }
    }
  ];

  const displayReports = reports.length > 0 ? reports : mockReports;

  // Update report status mutation
  const updateReportMutation = useMutation({
    mutationFn: async ({ reportId, status, comment }: { reportId: number; status: string; comment: string }) => {
      const response = await apiRequest('PUT', `/api/admin/reports/${reportId}`, {
        status,
        supervisorComment: comment
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/reports'] });
      setIsReviewModalOpen(false);
      setSelectedReport(null);
      setReviewComment('');
      toast({
        title: t('admin.reports.report_updated', 'Report Updated'),
        description: t('admin.reports.report_updated_desc', 'Report status has been updated successfully.')
      });
    },
    onError: () => {
      toast({
        title: t('admin.reports.error', 'Error'),
        description: t('admin.reports.error_desc', 'Failed to update report status. Please try again.'),
        variant: "destructive"
      });
    }
  });

  const handleReviewReport = (report: ReportWithAuthor) => {
    setSelectedReport(report);
    setReviewStatus('approved');
    setReviewComment('');
    setIsReviewModalOpen(true);
  };

  const handleSubmitReview = () => {
    if (!selectedReport) return;

    updateReportMutation.mutate({
      reportId: selectedReport.id,
      status: reviewStatus,
      comment: reviewComment
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="gap-1"><Clock className="h-3 w-3" /> Pending</Badge>;
      case 'approved':
        return <Badge variant="default" className="gap-1 bg-green-600"><CheckCircle className="h-3 w-3" /> Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" /> Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getDepartmentName = (departmentId: number | null) => {
    const departments: Record<number, string> = {
      1: "LSPD",
      2: "LSFD", 
      3: "EMS",
      4: "BCSO"
    };
    return departmentId ? departments[departmentId] || "Unknown" : "Unknown";
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-96">Loading reports...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">{t('admin.reports.title', 'Report Management')}</h1>
        <p className="text-muted-foreground">
          {t('admin.reports.subtitle', 'Review and manage submitted reports from community members.')}
        </p>
      </div>

      <div className="grid gap-4">
        {displayReports.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">{t('admin.reports.no_reports', 'No Reports to Review')}</h3>
              <p className="text-muted-foreground">
                {t('admin.reports.no_reports_desc', 'There are no pending reports for review at this time.')}
              </p>
            </CardContent>
          </Card>
        ) : (
          displayReports.map((report) => (
            <Card key={report.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <span className="font-medium">
                        Report #{report.id.toString().padStart(3, '0')}
                      </span>
                      {getStatusBadge(report.status)}
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        {report.author?.username || 'Unknown User'}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(report.createdAt).toLocaleDateString()}
                      </div>
                      {report.author?.department && (
                        <Badge variant="outline" className="text-xs">
                          {getDepartmentName(report.author.department)}
                        </Badge>
                      )}
                    </div>

                    {report.supervisorComment && (
                      <div className="mt-3 p-3 bg-muted rounded-lg">
                        <p className="text-sm font-medium mb-1">Supervisor Comment:</p>
                        <p className="text-sm">{report.supervisorComment}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // Mock download functionality
                        toast({
                          title: t('admin.reports.download_started', 'Download Started'),
                          description: t('admin.reports.download_desc', 'Report file download initiated.')
                        });
                      }}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    
                    {report.status === 'pending' && (
                      <Button
                        size="sm"
                        onClick={() => handleReviewReport(report)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        {t('admin.reports.review', 'Review')}
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Review Modal */}
      <Dialog open={isReviewModalOpen} onOpenChange={setIsReviewModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t('admin.reports.review_modal.title', {id: selectedReport?.id.toString().padStart(3, '0'), defaultValue: 'Review Report #{{id}}'})}</DialogTitle>
            <DialogDescription>
              {t('admin.reports.review_modal.subtitle', 'Review the submitted report and provide feedback.')}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('admin.reports.status', 'Status')}</label>
              <Select value={reviewStatus} onValueChange={(value: 'approved' | 'rejected') => setReviewStatus(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="approved">{t('admin.reports.approve', 'Approve')}</SelectItem>
                  <SelectItem value="rejected">{t('admin.reports.reject', 'Reject')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">{t('admin.reports.comment', 'Comment (Optional)')}</label>
              <Textarea
                placeholder={t('admin.reports.comment_placeholder', 'Provide feedback or instructions for the author...')}
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                rows={3}
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setIsReviewModalOpen(false)}
              >
                {t('admin.reports.cancel', 'Cancel')}
              </Button>
              <Button
                onClick={handleSubmitReview}
                disabled={updateReportMutation.isPending}
              >
                {updateReportMutation.isPending ? t('admin.reports.updating', 'Updating...') : t('admin.reports.submit_review', 'Submit Review')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AdminReports; 