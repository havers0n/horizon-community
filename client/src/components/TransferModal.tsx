import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, ArrowRightLeft, AlertTriangle } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Department } from "@shared/schema";
import { format } from "date-fns";

const transferSchema = z.object({
  type: z.enum(["transfer_dept", "transfer_div"]),
  fromDepartment: z.string().min(1, "Current department is required"),
  toDepartment: z.string().min(1, "Target department is required"),
  fromDivision: z.string().optional(),
  toDivision: z.string().optional(),
  reason: z.string().min(10, "Please provide a detailed reason (minimum 10 characters)"),
  effectiveDate: z.date().optional(),
  additionalInfo: z.string().optional(),
});

type TransferFormData = z.infer<typeof transferSchema>;

interface TransferModalProps {
  children?: React.ReactNode;
}

// Mock divisions data - would come from API
const divisionsByDepartment: Record<string, string[]> = {
  "PD": ["Patrol", "Detective", "SWAT", "Traffic", "K9", "Training"],
  "SAHP": ["Highway Patrol", "Traffic Enforcement", "Special Operations"],
  "SAMS": ["Ambulance", "Supervisor", "Training", "Air Rescue"],
  "SAFR": ["Engine Company", "Ladder Company", "Rescue Squad", "Hazmat"],
  "DD": ["Dispatch", "Supervisor", "Training"],
  "CD": ["Civilian", "Volunteer", "Support"]
};

export function TransferModal({ children }: TransferModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const { toast } = useToast();

  const { data: departments = [] } = useQuery<Department[]>({
    queryKey: ['/api/departments']
  });

  const form = useForm<TransferFormData>({
    resolver: zodResolver(transferSchema),
    defaultValues: {
      type: "transfer_dept",
      reason: "",
      additionalInfo: ""
    }
  });

  const transferType = form.watch("type");
  const fromDepartment = form.watch("fromDepartment");
  const toDepartment = form.watch("toDepartment");

  const submitMutation = useMutation({
    mutationFn: async (data: TransferFormData) => {
      const applicationData = {
        type: data.type,
        data: {
          fromDepartment: data.fromDepartment,
          toDepartment: data.toDepartment,
          fromDivision: data.fromDivision,
          toDivision: data.toDivision,
          reason: data.reason,
          effectiveDate: data.effectiveDate?.toISOString(),
          additionalInfo: data.additionalInfo,
          transferType: data.type === "transfer_dept" ? "Department Transfer" : "Division Transfer"
        }
      };

      const response = await apiRequest('POST', '/api/applications', applicationData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/applications'] });
      setIsOpen(false);
      form.reset();
      toast({
        title: "Transfer Application Submitted",
        description: "Your transfer request has been submitted for review."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit transfer application",
        variant: "destructive"
      });
    }
  });

  const onSubmit = (data: TransferFormData) => {
    submitMutation.mutate(data);
  };

  const getAvailableDivisions = (departmentName: string) => {
    return divisionsByDepartment[departmentName] || [];
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button className="gap-2">
            <ArrowRightLeft className="h-4 w-4" />
            Request Transfer
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowRightLeft className="h-5 w-5" />
            Transfer Request
          </DialogTitle>
          <DialogDescription>
            Submit a request to transfer between departments or divisions.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Transfer Type */}
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Transfer Type</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="grid grid-cols-2 gap-4"
                    >
                      <div className="flex items-center space-x-2 border rounded-lg p-4">
                        <RadioGroupItem value="transfer_dept" id="dept" />
                        <Label htmlFor="dept" className="flex-1 cursor-pointer">
                          <div className="font-medium">Department Transfer</div>
                          <div className="text-sm text-muted-foreground">
                            Move to a different department
                          </div>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 border rounded-lg p-4">
                        <RadioGroupItem value="transfer_div" id="div" />
                        <Label htmlFor="div" className="flex-1 cursor-pointer">
                          <div className="font-medium">Division Transfer</div>
                          <div className="text-sm text-muted-foreground">
                            Move to a different division
                          </div>
                        </Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              {/* From Department */}
              <FormField
                control={form.control}
                name="fromDepartment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Department</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select current department" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {departments.map((dept) => (
                          <SelectItem key={dept.id} value={dept.name}>
                            {dept.name} - {dept.fullName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* To Department */}
              <FormField
                control={form.control}
                name="toDepartment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Department</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select target department" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {departments
                          .filter(dept => dept.name !== fromDepartment)
                          .map((dept) => (
                            <SelectItem key={dept.id} value={dept.name}>
                              {dept.name} - {dept.fullName}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Divisions (only for division transfer or when departments are selected) */}
            {(transferType === "transfer_div" || (fromDepartment && toDepartment)) && (
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="fromDivision"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Current Division 
                        {transferType === "transfer_dept" && <span className="text-muted-foreground"> (Optional)</span>}
                      </FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                        disabled={!fromDepartment}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select current division" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {getAvailableDivisions(fromDepartment).map((division) => (
                            <SelectItem key={division} value={division}>
                              {division}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="toDivision"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Target Division
                        {transferType === "transfer_dept" && <span className="text-muted-foreground"> (Optional)</span>}
                      </FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                        disabled={!toDepartment}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select target division" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {getAvailableDivisions(toDepartment).map((division) => (
                            <SelectItem key={division} value={division}>
                              {division}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* Effective Date */}
            <FormField
              control={form.control}
              name="effectiveDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Preferred Effective Date (Optional)</FormLabel>
                  <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={(date) => {
                          field.onChange(date);
                          setCalendarOpen(false);
                        }}
                        disabled={(date: Date) =>
                          date < new Date()
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    When would you like this transfer to take effect?
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Reason */}
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason for Transfer</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Please provide a detailed explanation for your transfer request..."
                      className="resize-none"
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Explain why you want to transfer and how it will benefit both departments.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Additional Information */}
            <FormField
              control={form.control}
              name="additionalInfo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Information (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Any additional information that might be relevant to your transfer request..."
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Include any relevant experience, certifications, or special circumstances.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Warning Message */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-medium text-yellow-800">Important Notes:</div>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• Transfer requests require approval from both departments</li>
                    <li>• You may need to complete additional training or testing</li>
                    <li>• Current assignments and certifications will be reviewed</li>
                    <li>• Processing time may vary depending on department availability</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitMutation.isPending}
              >
                {submitMutation.isPending ? 'Submitting...' : 'Submit Transfer Request'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}