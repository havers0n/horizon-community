console.log('TransferDepartment.tsx: module loaded');

import { Layout } from "@/components/Layout";
import { TransferModal } from "@/components/TransferModal";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";

export default function TransferDepartment() {
  console.log('TransferDepartment: function executed');
  const { t } = useTranslation();
  const { user } = useAuth();
  const { data: applicationsRaw, isLoading } = useQuery({
    queryKey: ['/api/applications']
  });
  const applications: any[] = Array.isArray(applicationsRaw) ? applicationsRaw.filter(a => a.type === 'transfer_dept') : [];

  // Добавлено логирование в консоль
  console.log('TransferDepartment: user =', user);
  console.log('TransferDepartment: applicationsRaw =', applicationsRaw);

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Удалён DEBUG INFO */}
        {!user && (
          <div style={{color:'red',fontWeight:'bold',marginBottom:'16px'}}>Пользователь не определён (user is undefined). Проверьте авторизацию!</div>
        )}
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Перевод между департаментами</h1>
        <div className="mb-8">
          <TransferModal>
            <Button>Подать заявку на перевод</Button>
          </TransferModal>
        </div>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">История заявок</h2>
        <div className="space-y-6">
          {isLoading ? (
            <div>Загрузка...</div>
          ) : applications && applications.length > 0 ? (
            applications.map((application: any) => (
              <Card key={application.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {t('applications.type.transfer_dept', 'Перевод между департаментами')}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {t('applications.application_id', {id: application.id, defaultValue: 'Application #{{id}}'})}
                      </p>
                      <p className="text-sm text-gray-500">
                        {t('applications.submitted', 'Submitted')} {new Date(application.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <Badge className={application.status === 'approved' ? 'bg-green-100 text-green-800' : application.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}>
                      {String(t(`applications.status.${application.status}`, application.status))}
                    </Badge>
                  </div>
                  {application.data?.reason && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700">
                        <strong>Причина:</strong> {application.data.reason}
                      </p>
                    </div>
                  )}
                  {application.reviewComment && (
                    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <strong>Комментарий:</strong> {application.reviewComment}
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
                <h3 className="text-lg font-medium text-gray-900 mb-2">Нет заявок на перевод</h3>
                <p className="text-gray-600 mb-6">
                  Вы еще не подавали заявок на перевод между департаментами.
                </p>
                <TransferModal>
                  <Button>Подать первую заявку</Button>
                </TransferModal>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
} 