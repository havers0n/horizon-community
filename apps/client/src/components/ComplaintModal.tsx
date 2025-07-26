import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle } from "lucide-react";
import { useTranslation } from "react-i18next";

const complaintSchema = z.object({
  incidentDate: z.string().min(1, "Incident date is required"),
  incidentType: z.enum(["game", "admin"]),
  participants: z.string().min(1, "Participants information is required"),
  description: z.string().min(10, "Please provide detailed description"),
  evidenceUrl: z.string().optional()
});

type ComplaintFormData = z.infer<typeof complaintSchema>;

interface ComplaintModalProps {
  children?: React.ReactNode;
}

export function ComplaintModal({ children }: ComplaintModalProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  const form = useForm<ComplaintFormData>({
    resolver: zodResolver(complaintSchema),
    defaultValues: {
      incidentDate: "",
      incidentType: "game",
      participants: "",
      description: "",
      evidenceUrl: ""
    }
  });

  const mutation = useMutation({
    mutationFn: async (data: ComplaintFormData) => {
      const response = await apiRequest('POST', '/api/complaints', {
        ...data,
        incidentDate: new Date(data.incidentDate)
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: t('complaints.success', 'Success'),
        description: t('complaints.success_desc', 'Complaint submitted successfully')
      });
      setOpen(false);
      form.reset();
    },
    onError: () => {
      toast({
        title: t('complaints.error', 'Error'),
        description: t('complaints.error_desc', 'Failed to submit complaint'),
        variant: "destructive"
      });
    }
  });

  const onSubmit = (data: ComplaintFormData) => {
    mutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <button className="w-full flex items-center justify-between p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="h-4 w-4 text-warning" />
              <span className="text-sm font-medium text-foreground">{t('dashboard.file_complaint', 'File Complaint')}</span>
            </div>
          </button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('dashboard.file_complaint', 'File Complaint')}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="incidentDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('complaints.incident_date', 'Incident Date')}</FormLabel>
                  <FormControl>
                    <Input type="datetime-local" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="incidentType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('complaints.incident_type', 'Incident Type')}</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="game">{t('complaints.type.game', 'Game Related')}</SelectItem>
                      <SelectItem value="admin">{t('complaints.type.admin', 'Administrative')}</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="participants"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('complaints.participants', 'Participants')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('complaints.participants_placeholder', 'List all involved parties...')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('complaints.description', 'Description')}</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder={t('complaints.description_placeholder', 'Provide detailed description of the incident...')} 
                      className="min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="evidenceUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('complaints.evidence_url', 'Evidence URL (Optional)')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('complaints.evidence_placeholder', 'Link to screenshots or videos...')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-end space-x-3">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                {t('common.cancel', 'Cancel')}
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? t('common.submitting', 'Submitting...') : t('complaints.submit', 'Submit Complaint')}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
