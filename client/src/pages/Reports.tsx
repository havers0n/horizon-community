import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, Upload, FileText, Clock, CheckCircle, XCircle, Eye } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Report } from "@shared/schema";

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  fileUrl: string;
  department: string;
}

// Mock templates - would come from API
const mockTemplates: ReportTemplate[] = [
  {
    id: "incident-report",
    name: "Incident Report",
    description: "Standard incident documentation form",
    fileUrl: "/templates/incident-report.pdf",
    department: "LSPD"
  },
  {
    id: "arrest-report",
    name: "Arrest Report",
    description: "Detailed arrest documentation",
    fileUrl: "/templates/arrest-report.pdf", 
    department: "LSPD"
  },
  {
    id: "vehicle-report",
    name: "Vehicle Inspection Report",
    description: "Vehicle condition and inspection details",
    fileUrl: "/templates/vehicle-report.pdf",
    department: "LSPD"
  },
  {
    id: "fire-report",
    name: "Fire Incident Report",
    description: "Fire department incident documentation",
    fileUrl: "/templates/fire-report.pdf",
    department: "LSFD"
  },
  {
    id: "medical-report",
    name: "Medical Response Report",
    description: "EMS response and treatment documentation",
    fileUrl: "/templates/medical-report.pdf",
    department: "EMS"
  }
];

export default function Reports() {
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  // Fetch user's reports
  const { data: reports = [], isLoading } = useQuery<Report[]>({
    queryKey: ['/api/reports'],
    enabled: false // Will be enabled when real API is ready
  });

  // Fetch available templates
  const { data: templates = mockTemplates } = useQuery<ReportTemplate[]>({
    queryKey: ['/api/report-templates'],
    enabled: false // Will be enabled when real API is ready
  });

  // Mock reports data for demonstration
  const mockReports: Report[] = [
    {
      id: 1,
      authorId: 1,
      fileUrl: "/uploads/reports/incident-001.pdf",
      status: "pending",
      supervisorComment: null,
      createdAt: new Date('2025-01-01T10:00:00')
    },
    {
      id: 2,
      authorId: 1,
      fileUrl: "/uploads/reports/arrest-002.pdf", 
      status: "approved",
      supervisorComment: "Well documented incident. Good work.",
      createdAt: new Date('2024-12-28T14:30:00')
    },
    {
      id: 3,
      authorId: 1,
      fileUrl: "/uploads/reports/vehicle-003.pdf",
      status: "rejected",
      supervisorComment: "Missing vehicle identification details. Please resubmit with complete information.",
      createdAt: new Date('2024-12-25T09:15:00')
    }
  ];

  const displayReports = reports.length > 0 ? reports : mockReports;

  // Submit report mutation
  const submitReportMutation = useMutation({
    mutationFn: async (data: FormData) => {
      // This would upload file and create report: POST /api/reports
      const response = await apiRequest('POST', '/api/reports', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/reports'] });
      setIsSubmitModalOpen(false);
      setSelectedFile(null);
      toast({
        title: "Report Submitted",
        description: "Your report has been submitted for review."
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit report. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type and size
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      const maxSize = 10 * 1024 * 1024; // 10MB

      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid File Type",
          description: "Please upload a PDF or Word document.",
          variant: "destructive"
        });
        return;
      }

      if (file.size > maxSize) {
        toast({
          title: "File Too Large",
          description: "File size must be less than 10MB.",
          variant: "destructive"
        });
        return;
      }

      setSelectedFile(file);
    }
  };

  const handleSubmitReport = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    if (!selectedFile) {
      toast({
        title: "No File Selected",
        description: "Please select a file to upload.",
        variant: "destructive"
      });
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('type', 'incident'); // Would get from form
    
    // Mock submission for demonstration
    toast({
      title: "Report Submitted",
      description: "Your report has been submitted for review."
    });
    setIsSubmitModalOpen(false);
    setSelectedFile(null);
    
    // In real implementation: submitReportMutation.mutate(formData);
  };

  const handleDownloadTemplate = (template: ReportTemplate) => {
    // In real implementation, this would download the actual file
    toast({
      title: "Download Started",
      description: `Downloading ${template.name} template...`
    });
    
    // Mock download
    const link = document.createElement('a');
    link.href = template.fileUrl;
    link.download = `${template.name}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-96">Loading reports...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Reports</h1>
        <p className="text-muted-foreground">
          Submit and manage your incident reports, documentation, and official forms.
        </p>
      </div>

      <Tabs defaultValue="my-reports" className="space-y-6">
        <TabsList>
          <TabsTrigger value="my-reports">My Reports</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="my-reports" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Submitted Reports</h2>
            <Dialog open={isSubmitModalOpen} onOpenChange={setIsSubmitModalOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Upload className="h-4 w-4" />
                  Submit Report
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Submit New Report</DialogTitle>
                  <DialogDescription>
                    Upload your completed report for supervisor review.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmitReport} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="report-type">Report Type</Label>
                    <Select defaultValue="incident">
                      <SelectTrigger>
                        <SelectValue placeholder="Select report type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="incident">Incident Report</SelectItem>
                        <SelectItem value="arrest">Arrest Report</SelectItem>
                        <SelectItem value="vehicle">Vehicle Report</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="report-file">Report File</Label>
                    <Input
                      id="report-file"
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileSelect}
                      required
                    />
                    {selectedFile && (
                      <p className="text-sm text-muted-foreground">
                        Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Additional Notes</Label>
                    <Textarea
                      id="notes"
                      placeholder="Any additional information for the supervisor..."
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-2 justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsSubmitModalOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={!selectedFile || submitReportMutation.isPending}
                    >
                      {submitReportMutation.isPending ? 'Submitting...' : 'Submit'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {displayReports.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No Reports Submitted</h3>
                  <p className="text-muted-foreground mb-4">
                    You haven't submitted any reports yet. Use the templates to get started.
                  </p>
                  <Button onClick={() => setIsSubmitModalOpen(true)}>
                    Submit Your First Report
                  </Button>
                </CardContent>
              </Card>
            ) : (
              displayReports.map((report) => (
                <Card key={report.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-muted-foreground" />
                          <span className="font-medium">
                            Report #{report.id.toString().padStart(3, '0')}
                          </span>
                          {getStatusBadge(report.status)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Submitted: {new Date(report.createdAt).toLocaleDateString()}
                        </p>
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
                            setSelectedReport(report);
                            setIsViewModalOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownloadTemplate({ 
                            id: report.id.toString(), 
                            name: `Report-${report.id}`, 
                            description: '', 
                            fileUrl: report.fileUrl, 
                            department: '' 
                          })}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-2">Report Templates</h2>
            <p className="text-muted-foreground">
              Download official templates to ensure your reports meet department standards.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((template) => (
              <Card key={template.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Badge variant="outline">{template.department}</Badge>
                    <Button
                      onClick={() => handleDownloadTemplate(template)}
                      className="w-full gap-2"
                      variant="outline"
                    >
                      <Download className="h-4 w-4" />
                      Download Template
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* View Report Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Report Details</DialogTitle>
            <DialogDescription>
              Report #{selectedReport?.id.toString().padStart(3, '0')}
            </DialogDescription>
          </DialogHeader>
          {selectedReport && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Status</Label>
                  <div className="mt-1">
                    {getStatusBadge(selectedReport.status)}
                  </div>
                </div>
                <div>
                  <Label>Submitted</Label>
                  <p className="text-sm mt-1">
                    {new Date(selectedReport.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              {selectedReport.supervisorComment && (
                <div>
                  <Label>Supervisor Comment</Label>
                  <div className="mt-1 p-3 bg-muted rounded-lg">
                    <p className="text-sm">{selectedReport.supervisorComment}</p>
                  </div>
                </div>
              )}

              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => handleDownloadTemplate({ 
                    id: selectedReport.id.toString(), 
                    name: `Report-${selectedReport.id}`, 
                    description: '', 
                    fileUrl: selectedReport.fileUrl, 
                    department: '' 
                  })}
                >
                  Download File
                </Button>
                <Button onClick={() => setIsViewModalOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}