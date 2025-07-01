import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Calendar, CalendarIcon, Clock, AlertTriangle, Plane } from "lucide-react";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format, differenceInDays, addDays } from "date-fns";

const leaveSchema = z.object({
  leaveType: z.enum(["vacation", "sick", "personal", "emergency", "medical", "maternity", "bereavement"]),
  startDate: z.date({
    required_error: "Start date is required"
  }),
  endDate: z.date({
    required_error: "End date is required"
  }),
  reason: z.string().min(5, "Please provide a reason (minimum 5 characters)"),
  emergencyContact: z.string().optional(),
  emergencyPhone: z.string().optional(),
  coverageArrangements: z.string().optional(),
  isPartialDay: z.boolean().default(false),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  additionalNotes: z.string().optional(),
}).refine((data) => {
  return data.endDate >= data.startDate;
}, {
  message: "End date must be after start date",
  path: ["endDate"]
}).refine((data) => {
  if (data.isPartialDay) {
    return data.startTime && data.endTime;
  }
  return true;
}, {
  message: "Start and end times are required for partial day leave",
  path: ["startTime"]
});

type LeaveFormData = z.infer<typeof leaveSchema>;

interface LeaveModalProps {
  children?: React.ReactNode;
}

const leaveTypes = [
  { value: "vacation", label: "Vacation Leave", description: "Planned time off for rest and recreation" },
  { value: "sick", label: "Sick Leave", description: "Medical illness or recovery time" },
  { value: "personal", label: "Personal Leave", description: "Personal matters and appointments" },
  { value: "emergency", label: "Emergency Leave", description: "Unexpected urgent situations" },
  { value: "medical", label: "Medical Leave", description: "Extended medical treatment or surgery" },
  { value: "maternity", label: "Maternity/Paternity Leave", description: "Child birth or adoption" },
  { value: "bereavement", label: "Bereavement Leave", description: "Loss of family member or close friend" }
];

export function LeaveModal({ children }: LeaveModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [startCalendarOpen, setStartCalendarOpen] = useState(false);
  const [endCalendarOpen, setEndCalendarOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<LeaveFormData>({
    resolver: zodResolver(leaveSchema),
    defaultValues: {
      isPartialDay: false,
      reason: "",
      additionalNotes: ""
    }
  });

  const startDate = form.watch("startDate");
  const endDate = form.watch("endDate");
  const isPartialDay = form.watch("isPartialDay");
  const leaveType = form.watch("leaveType");

  const submitMutation = useMutation({
    mutationFn: async (data: LeaveFormData) => {
      const applicationData = {
        type: "leave",
        data: {
          leaveType: data.leaveType,
          startDate: data.startDate.toISOString(),
          endDate: data.endDate.toISOString(),
          reason: data.reason,
          emergencyContact: data.emergencyContact,
          emergencyPhone: data.emergencyPhone,
          coverageArrangements: data.coverageArrangements,
          isPartialDay: data.isPartialDay,
          startTime: data.startTime,
          endTime: data.endTime,
          additionalNotes: data.additionalNotes,
          totalDays: calculateTotalDays()
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
        title: "Leave Application Submitted",
        description: "Your leave request has been submitted for approval."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit leave application",
        variant: "destructive"
      });
    }
  });

  const calculateTotalDays = () => {
    if (!startDate || !endDate) return 0;
    if (isPartialDay) return 0.5;
    return differenceInDays(endDate, startDate) + 1;
  };

  const onSubmit = (data: LeaveFormData) => {
    submitMutation.mutate(data);
  };

  const getLeaveTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      vacation: "bg-blue-100 text-blue-800",
      sick: "bg-red-100 text-red-800",
      personal: "bg-purple-100 text-purple-800",
      emergency: "bg-orange-100 text-orange-800",
      medical: "bg-green-100 text-green-800",
      maternity: "bg-pink-100 text-pink-800",
      bereavement: "bg-gray-100 text-gray-800"
    };
    return colors[type] || "bg-gray-100 text-gray-800";
  };

  const isEmergencyType = ["emergency", "sick", "bereavement"].includes(leaveType);
  const totalDays = calculateTotalDays();

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button className="gap-2">
            <Plane className="h-4 w-4" />
            Request Leave
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plane className="h-5 w-5" />
            Leave Request
          </DialogTitle>
          <DialogDescription>
            Submit a request for time off from your duties.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Leave Type */}
            <FormField
              control={form.control}
              name="leaveType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type of Leave</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select leave type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {leaveTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex flex-col">
                            <span className="font-medium">{type.label}</span>
                            <span className="text-xs text-muted-foreground">{type.description}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Partial Day Option */}
            <FormField
              control={form.control}
              name="isPartialDay"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Partial Day Leave
                    </FormLabel>
                    <FormDescription>
                      Check this if you only need part of a day off (e.g., morning appointment)
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            {/* Date Selection */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Start Date</FormLabel>
                    <Popover open={startCalendarOpen} onOpenChange={setStartCalendarOpen}>
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
                              <span>Pick start date</span>
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
                            setStartCalendarOpen(false);
                          }}
                          disabled={(date) => {
                            // Allow emergency/sick leave to be retroactive
                            if (isEmergencyType) return false;
                            return date < new Date();
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>End Date</FormLabel>
                    <Popover open={endCalendarOpen} onOpenChange={setEndCalendarOpen}>
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
                              <span>Pick end date</span>
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
                            setEndCalendarOpen(false);
                          }}
                          disabled={(date) => {
                            if (isEmergencyType) return false;
                            return date < (startDate || new Date());
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Time Selection for Partial Days */}
            {isPartialDay && (
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Time</FormLabel>
                      <FormControl>
                        <Input
                          type="time"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Time</FormLabel>
                      <FormControl>
                        <Input
                          type="time"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* Duration Display */}
            {startDate && endDate && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-blue-800">Leave Duration</span>
                </div>
                <div className="space-y-1 text-sm">
                  <div>
                    <span className="text-blue-700">Total Days: </span>
                    <Badge className={`${getLeaveTypeColor(leaveType || "")}`}>
                      {totalDays} {totalDays === 1 ? 'day' : 'days'}
                    </Badge>
                  </div>
                  <div className="text-blue-600">
                    From {format(startDate, "EEEE, MMMM d, yyyy")} to {format(endDate, "EEEE, MMMM d, yyyy")}
                  </div>
                </div>
              </div>
            )}

            {/* Reason */}
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason for Leave</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Please provide the reason for your leave request..."
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Provide specific details about why you need this time off.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Emergency Contact (for extended leave) */}
            {totalDays > 5 && (
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="emergencyContact"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Emergency Contact</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Contact person name"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        For extended leave (5+ days)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="emergencyPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Emergency Phone</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Phone number"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* Coverage Arrangements */}
            <FormField
              control={form.control}
              name="coverageArrangements"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Coverage Arrangements</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe how your duties will be covered during your absence..."
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Explain who will handle your responsibilities and any handover arrangements.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Additional Notes */}
            <FormField
              control={form.control}
              name="additionalNotes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Any additional information..."
                      className="resize-none"
                      rows={2}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Important Notes */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-medium text-yellow-800">Leave Policy Reminders:</div>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• Submit vacation requests at least 2 weeks in advance</li>
                    <li>• Emergency and sick leave can be submitted retroactively</li>
                    <li>• Maximum 2 leave applications per month</li>
                    <li>• Supervisor approval required for all leave requests</li>
                    <li>• Extended leave (7+ days) may require additional documentation</li>
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
                {submitMutation.isPending ? 'Submitting...' : 'Submit Leave Request'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}