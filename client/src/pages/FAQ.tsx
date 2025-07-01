import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, HelpCircle, Users, Shield, Award, FileText } from "lucide-react";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  tags: string[];
}

const faqData: FAQItem[] = [
  // General Questions
  {
    id: "general-1",
    question: "How do I create an account?",
    answer: "To create an account, click the 'Register' button on the homepage. Fill out the required information including username, email, and password. After registration, you'll be able to submit applications to join departments.",
    category: "general",
    tags: ["account", "registration", "new user"]
  },
  {
    id: "general-2",
    question: "What are the different user roles?",
    answer: "There are four main roles: Candidate (new applicants), Member (active department members), Supervisor (can review applications), and Admin (full system access). Each role has different permissions and access levels.",
    category: "general",
    tags: ["roles", "permissions", "hierarchy"]
  },
  {
    id: "general-3",
    question: "How long does application review take?",
    answer: "Applications are typically reviewed within 24-48 hours. The review time may vary depending on the department and current application volume. You'll receive notifications when your application status changes.",
    category: "general",
    tags: ["applications", "timing", "review"]
  },

  // Applications
  {
    id: "applications-1",
    question: "What types of applications can I submit?",
    answer: "You can submit various applications including: Entry (join department), Promotion (rank advancement), Qualification (certifications), Transfer (between departments/divisions), Leave (time off), and Joint assignments (multiple departments).",
    category: "applications",
    tags: ["application types", "entry", "promotion", "transfer"]
  },
  {
    id: "applications-2",
    question: "How many applications can I submit per month?",
    answer: "Entry applications are limited to 3 per month. Leave applications are limited to 2 per month. There's a 7-day cooldown between promotion and qualification applications. Limits reset on the 1st of each month.",
    category: "applications",
    tags: ["limits", "restrictions", "cooldown"]
  },
  {
    id: "applications-3",
    question: "What happens after my application is approved?",
    answer: "After approval, you may need to take a test depending on the application type. You'll be notified when the test becomes available. Once completed, supervisors will review your results and finalize your application.",
    category: "applications",
    tags: ["approval", "testing", "process"]
  },
  {
    id: "applications-4",
    question: "Can I edit my application after submission?",
    answer: "No, applications cannot be edited after submission. If you need to make changes, you'll need to submit a new application. Make sure to review all information carefully before submitting.",
    category: "applications",
    tags: ["editing", "changes", "submission"]
  },

  // Testing
  {
    id: "testing-1",
    question: "How do the qualification tests work?",
    answer: "Tests are timed (typically 20 minutes) and cover department-specific knowledge. You must stay focused on the test window - losing focus will trigger warnings and may cancel the test. Results are immediately available after submission.",
    category: "testing",
    tags: ["tests", "timing", "anti-cheat", "focus"]
  },
  {
    id: "testing-2",
    question: "What happens if I lose focus during a test?",
    answer: "The system monitors window focus during tests. First violation gives a warning. Second violation automatically cancels the test. This prevents cheating and ensures fair testing conditions.",
    category: "testing",
    tags: ["anti-cheat", "focus", "violations", "cancellation"]
  },
  {
    id: "testing-3",
    question: "Can I retake a failed test?",
    answer: "Yes, you can retake tests after a 24-hour waiting period. Contact your supervisor if you need additional study materials or guidance before retaking.",
    category: "testing",
    tags: ["retake", "failed", "waiting period"]
  },

  // Departments
  {
    id: "departments-1",
    question: "Which departments are available?",
    answer: "Available departments include LSPD (Los Santos Police Department), LSFD (Los Santos Fire Department), EMS (Emergency Medical Services), and BCSO (Blaine County Sheriff's Office). Each has different requirements and specializations.",
    category: "departments",
    tags: ["LSPD", "LSFD", "EMS", "BCSO", "departments"]
  },
  {
    id: "departments-2",
    question: "Can I be in multiple departments?",
    answer: "Yes, you can apply for joint assignments or secondary department positions. This requires separate applications and approval from both departments. Some combinations may have restrictions.",
    category: "departments",
    tags: ["multiple", "joint", "secondary", "combinations"]
  },
  {
    id: "departments-3",
    question: "How do I transfer between departments?",
    answer: "Submit a Transfer Department application specifying your current and target departments. Include reasons for the transfer. Both departments must approve the transfer, and you may need to complete additional training.",
    category: "departments",
    tags: ["transfer", "departments", "approval", "training"]
  },

  // Reports & Support
  {
    id: "support-1",
    question: "How do I submit a report?",
    answer: "Go to the Reports section in your dashboard. Download the appropriate template, fill it out completely, and upload the completed document. Reports are reviewed by supervisors and you'll receive feedback.",
    category: "support",
    tags: ["reports", "templates", "upload", "review"]
  },
  {
    id: "support-2",
    question: "What file formats are accepted for reports?",
    answer: "Reports must be submitted as PDF or Word documents (.pdf, .doc, .docx). Maximum file size is 10MB. Use official templates to ensure proper formatting.",
    category: "support",
    tags: ["file formats", "PDF", "Word", "templates"]
  },
  {
    id: "support-3",
    question: "How do I contact support?",
    answer: "Use the Support section to create a ticket. Describe your issue clearly and include relevant details. Support staff will respond and work with you to resolve the issue.",
    category: "support",
    tags: ["support tickets", "contact", "help", "issues"]
  }
];

export default function FAQ() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = [
    { id: "all", name: "All Categories", icon: HelpCircle },
    { id: "general", name: "General", icon: Users },
    { id: "applications", name: "Applications", icon: FileText },
    { id: "testing", name: "Testing", icon: Award },
    { id: "departments", name: "Departments", icon: Shield },
    { id: "support", name: "Reports & Support", icon: HelpCircle }
  ];

  // Filter FAQ items
  const filteredFAQ = faqData.filter(item => {
    const matchesSearch = 
      item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Frequently Asked Questions</h1>
        <p className="text-muted-foreground">
          Find answers to common questions about our CAD system, applications, and procedures.
        </p>
      </div>

      {/* Search */}
      <div className="mb-8">
        <div className="relative max-w-md mx-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search questions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="space-y-6">
        <TabsList className="grid grid-cols-2 lg:grid-cols-6 w-full">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <TabsTrigger 
                key={category.id} 
                value={category.id}
                className="gap-2 text-xs sm:text-sm"
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{category.name}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {categories.map((category) => (
          <TabsContent key={category.id} value={category.id}>
            <div className="space-y-6">
              {filteredFAQ.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <HelpCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">No questions found</h3>
                    <p className="text-muted-foreground">
                      {searchTerm 
                        ? "Try adjusting your search terms or browse different categories."
                        : "No questions available in this category."
                      }
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <Accordion type="single" collapsible className="space-y-4">
                  {filteredFAQ.map((item, index) => (
                    <AccordionItem 
                      key={item.id} 
                      value={item.id}
                      className="border rounded-lg px-6"
                    >
                      <AccordionTrigger className="text-left hover:no-underline py-4">
                        <div className="space-y-2">
                          <div className="font-medium">{item.question}</div>
                          <div className="flex flex-wrap gap-1">
                            {item.tags.slice(0, 3).map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pb-4">
                        <div className="text-muted-foreground leading-relaxed">
                          {item.answer}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Contact Support */}
      <Card className="mt-12">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Still need help?
          </CardTitle>
          <CardDescription>
            Can't find what you're looking for? Our support team is here to help.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            If you couldn't find an answer to your question, please create a support ticket 
            and our team will get back to you as soon as possible.
          </p>
          <div className="flex gap-4">
            <a 
              href="/support" 
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
            >
              Create Support Ticket
            </a>
            <a 
              href="mailto:support@cadsystem.com" 
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
            >
              Email Support
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}