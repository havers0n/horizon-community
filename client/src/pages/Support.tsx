import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SupportModal } from "@/components/SupportModal";
import { useQuery } from "@tanstack/react-query";
import { Headphones, Plus, MessageCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useTranslation } from "react-i18next";

const Support = () => {
  const { t } = useTranslation();
  const { data: tickets, isLoading } = useQuery({
    queryKey: ['/api/tickets']
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-success text-success-foreground';
      case 'closed': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/4 mb-4"></div>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-muted rounded-lg"></div>
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('support.title', 'Support')}</h1>
            <p className="text-gray-600">{t('support.subtitle', 'Get help from our support team through support tickets.')}</p>
          </div>
          <SupportModal>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              {t('support.new_ticket', 'New Ticket')}
            </Button>
          </SupportModal>
        </div>

        {/* Support Tickets */}
        <div className="space-y-6">
          {tickets && Array.isArray(tickets) && tickets.length > 0 ? (
            tickets.map((ticket: any) => (
              <Card key={ticket.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                          <MessageCircle className="h-5 w-5 text-muted-foreground" />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">
                          {t('support.ticket', {id: ticket.id, defaultValue: 'Support Ticket #{{id}}'})}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {t('support.created', 'Created')} {formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true })}
                        </p>
                        {ticket.messages && ticket.messages.length > 0 && (
                          <p className="text-sm text-muted-foreground">
                            {t('support.messages_count', {count: ticket.messages.length, defaultValue: '{{count}} message', plural: '{{count}} messages'})}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <Badge className={getStatusColor(ticket.status)}>
                        {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                      </Badge>
                      <Button variant="outline" size="sm">
                        {t('support.view_conversation', 'View Conversation')}
                      </Button>
                    </div>
                  </div>
                  {ticket.handlerId && (
                    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <strong>{t('support.assigned', 'Assigned to Support Agent')}</strong>
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Headphones className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">{t('support.no_tickets', 'No Support Tickets')}</h3>
                <p className="text-gray-600 mb-6">
                  {t('support.no_tickets_desc', "You haven't created any support tickets yet. If you need help, feel free to create a new ticket.")}
                </p>
                <SupportModal>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    {t('support.create_first', 'Create Your First Ticket')}
                  </Button>
                </SupportModal>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Support;
