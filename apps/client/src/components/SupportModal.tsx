import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Headphones } from "lucide-react";
import { useTranslation } from "react-i18next";

interface SupportModalProps {
  children?: React.ReactNode;
}

export function SupportModal({ children }: SupportModalProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  const mutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/tickets', {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tickets'] });
      toast({
        title: t('support.ticket_created', 'Success'),
        description: t('support.ticket_created_desc', 'Support ticket created successfully')
      });
      setOpen(false);
    },
    onError: () => {
      toast({
        title: t('support.error', 'Error'),
        description: t('support.error_desc', 'Failed to create support ticket'),
        variant: "destructive"
      });
    }
  });

  const handleCreateTicket = () => {
    mutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <button className="w-full flex items-center justify-between p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors">
            <div className="flex items-center space-x-3">
              <Headphones className="h-4 w-4 text-accent" />
              <span className="text-sm font-medium text-foreground">{t('dashboard.contact_support', 'Contact Support')}</span>
            </div>
          </button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('dashboard.contact_support', 'Contact Support')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {t('support.create_ticket_desc', 'Create a new support ticket to get help from our team. Once created, you can communicate with our support staff through the Support page.')}
          </p>
          
          <div className="flex justify-end space-x-3">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              {t('common.cancel', 'Cancel')}
            </Button>
            <Button onClick={handleCreateTicket} disabled={mutation.isPending}>
              {mutation.isPending ? t('support.creating', 'Creating...') : t('support.create_ticket', 'Create Ticket')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
