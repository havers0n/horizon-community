import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Plus } from "lucide-react";
import { useTranslation } from "react-i18next";

const applicationSchema = z.object({
  type: z.string().min(1, "Application type is required"),
  data: z.object({
    details: z.string().min(10, "Please provide detailed information")
  })
});

type ApplicationFormData = z.infer<typeof applicationSchema>;
interface ApplicationModalProps {
  children?: React.ReactNode;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function ApplicationModal({ children, isOpen, onOpenChange }: ApplicationModalProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = typeof isOpen === 'boolean' ? isOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  const form = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      type: "",
      data: {
        details: ""
      }
    }
  });

  const mutation = useMutation({
    mutationFn: async (data: ApplicationFormData) => {
      const response = await apiRequest('POST', '/api/applications', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/applications'] });
      toast({
        title: t('applications.success', 'Success'),
        description: t('applications.success_desc', 'Application submitted successfully')
      });
      setOpen(false);
      form.reset();
    },
    onError: () => {
      toast({
        title: t('applications.error', 'Error'),
        description: t('applications.error_desc', 'Failed to submit application'),
        variant: "destructive"
      });
    }
  });

  const onSubmit = (data: ApplicationFormData) => {
    mutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <button className="w-full flex items-center justify-between p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors">
            <div className="flex items-center space-x-3">
              <Plus className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-foreground">{t('dashboard.new_application', 'New Application')}</span>
            </div>
          </button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('dashboard.new_application', 'New Application')}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('applications.type', 'Application Type')}</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('applications.select_type', 'Select application type...')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="promotion">{t('applications.type.promotion', 'Promotion Request')}</SelectItem>
                      <SelectItem value="transfer_dept">{t('applications.type.transfer_dept', 'Department Transfer')}</SelectItem>
                      <SelectItem value="transfer_div">{t('applications.type.transfer_div', 'Division Transfer')}</SelectItem>
                      <SelectItem value="leave">{t('applications.type.leave', 'Leave Request')}</SelectItem>
                      <SelectItem value="qualification">{t('applications.type.qualification', 'Qualification Request')}</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="data.details"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('applications.details', 'Details')}</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder={t('applications.details_placeholder', 'Please provide details about your application...')} 
                      className="min-h-[100px]"
                      {...field} 
                    />
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
                {mutation.isPending ? t('common.submitting', 'Submitting...') : t('applications.submit', 'Submit Application')}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
