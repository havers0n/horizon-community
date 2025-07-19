import { Layout } from "@/components/Layout";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ApplicationModal } from "@/components/ApplicationModal";
import { useCheckLimit } from "@/hooks/useCheckLimit";
import { useQuery } from "@tanstack/react-query";
import { FileText, UserPlus, RefreshCw, Calendar, Plus } from "lucide-react";
import { useLocation } from "wouter";
import { formatDistanceToNow } from "date-fns";

export default function Applications() {
  const { t } = useTranslation();
  const [, navigate] = useLocation();
  
  const { data: applicationsRaw, isLoading } = useQuery({
    queryKey: ['/api/applications']
  });
  const applications: any[] = Array.isArray(applicationsRaw) ? applicationsRaw : [];

  // Проверка лимита на подачу заявки типа 'entry' (или другой, если нужно)
  const { isLimitReached, isLoading: isLimitLoading, reason: limitReason } = useCheckLimit('entry');
  const [modalOpen, setModalOpen] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getApplicationIcon = (type: string) => {
    switch (type) {
      case 'promotion': return <UserPlus className="h-5 w-5" />;
      case 'transfer_dept': 
      case 'transfer_div': return <RefreshCw className="h-5 w-5" />;
      case 'leave': return <Calendar className="h-5 w-5" />;
      default: return <FileText className="h-5 w-5" />;
    }
  };


  const formatApplicationType = (type: string) => {
    return t(`applications.type.${type}`, type);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('applications.title', 'My Applications')}</h1>
            <p className="text-gray-600">{t('applications.subtitle', 'Track the status of your submitted applications.')}</p>
          </div>
          <div className="flex flex-col items-end">
            <Button
              onClick={() => setModalOpen(true)}
              disabled={isLimitLoading || isLimitReached}
              title={isLimitReached ? (limitReason || t('applications.limit_reached', 'Limit reached')) : ''}
            >
              <Plus className="h-4 w-4 mr-2" />
              {isLimitReached
                ? t('applications.limit_reached', 'Limit reached')
                : t('applications.new_application', 'New Application')}
            </Button>
            <ApplicationModal isOpen={modalOpen} onOpenChange={setModalOpen} />
            {isLimitReached && limitReason && (
              <span className="text-xs text-red-600 mt-1">{limitReason}</span>
            )}
          </div>
        </div>

        {/* Applications List */}
        <div className="space-y-6">
          {applications && applications.length > 0 ? (
            applications.map((application: any) => (
              <Card key={application.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                          {getApplicationIcon(application.type)}
                        </div>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {formatApplicationType(application.type)}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {t('applications.application_id', {id: application.id, defaultValue: 'Application #{{id}}'})}
                        </p>
                        <p className="text-sm text-gray-500">
                          {t('applications.submitted', 'Submitted')} {formatDistanceToNow(new Date(application.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
          <Badge className={getStatusColor(application.status)}>
            {String(t(`applications.status.${application.status}`, application.status))}
          </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/applications/${application.id}`)}
                      >
                        {t('applications.view_details', 'View Details')}
                      </Button>
                    </div>
                  </div>
                  
                  {application.data?.details && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700">
                        <strong>{t('applications.details', 'Details')}:</strong> {application.data.details}
                      </p>
                    </div>
                  )}
                  
                  {application.reviewComment && (
                    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <strong>{t('applications.review_comment', 'Review Comment')}:</strong> {application.reviewComment}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">{t('applications.no_applications', 'No Applications Yet')}</h3>
                <p className="text-gray-600 mb-6">
                  {t('applications.no_applications_desc', "You haven't submitted any applications yet. Start by creating your first application.")}
                </p>
                <ApplicationModal>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    {t('applications.submit_first', 'Submit Your First Application')}
                  </Button>
                </ApplicationModal>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
}
