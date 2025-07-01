import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SupportModal } from "@/components/SupportModal";
import { useQuery } from "@tanstack/react-query";
import { Headphones, Plus, MessageCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function Support() {
  
  const { data: tickets, isLoading } = useQuery({
    queryKey: ['/api/tickets']
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Support</h1>
            <p className="text-gray-600">Get help from our support team through support tickets.</p>
          </div>
          <SupportModal>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Ticket
            </Button>
          </SupportModal>
        </div>

        {/* Support Tickets */}
        <div className="space-y-6">
          {tickets && tickets.length > 0 ? (
            tickets.map((ticket: any) => (
              <Card key={ticket.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                          <MessageCircle className="h-5 w-5 text-gray-600" />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Support Ticket #{ticket.id}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Created {formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true })}
                        </p>
                        {ticket.messages && ticket.messages.length > 0 && (
                          <p className="text-sm text-gray-500">
                            {ticket.messages.length} message{ticket.messages.length !== 1 ? 's' : ''}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <Badge className={getStatusColor(ticket.status)}>
                        {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                      </Badge>
                      <Button variant="outline" size="sm">
                        View Conversation
                      </Button>
                    </div>
                  </div>
                  
                  {ticket.handlerId && (
                    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <strong>Assigned to Support Agent</strong>
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
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Support Tickets</h3>
                <p className="text-gray-600 mb-6">
                  You haven't created any support tickets yet. If you need help, feel free to create a new ticket.
                </p>
                <SupportModal>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Ticket
                  </Button>
                </SupportModal>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
}
