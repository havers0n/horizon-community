import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Clock, Eye, EyeOff } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Question {
  id: number;
  text: string;
  options: string[];
  correctAnswer?: number; // Only shown after test completion
}

interface TestExam {
  id: number;
  title: string;
  durationMinutes: number;
  questions: Question[];
  applicationId?: number;
}

interface TestResult {
  score: number;
  percentage: number;
  passed: boolean;
  correctAnswers: number;
  totalQuestions: number;
}

export default function TestExam() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  // Test state
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [testStarted, setTestStarted] = useState(false);
  const [testCompleted, setTestCompleted] = useState(false);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  
  // Anti-cheat system
  const [focusLost, setFocusLost] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const testContainerRef = useRef<HTMLDivElement>(null);

  // Get test ID from URL params (would be implemented with proper routing)
  const testId = 1; // Mock test ID

  // Fetch test data
  const { data: test, isLoading } = useQuery<TestExam>({
    queryKey: ['/api/tests', testId],
    enabled: false // Will be enabled when real API is ready
  });

  // Mock test data for demonstration
  const mockTest: TestExam = {
    id: 1,
    title: "LSPD Entry Exam",
    durationMinutes: 20,
    applicationId: 1,
    questions: [
      {
        id: 1,
        text: "What is the maximum speed limit in residential areas?",
        options: ["25 mph", "30 mph", "35 mph", "40 mph"]
      },
      {
        id: 2,
        text: "Which radio code indicates 'officer needs assistance'?",
        options: ["10-4", "10-13", "10-20", "10-99"]
      },
      {
        id: 3,
        text: "What should you do when pursuing a suspect?",
        options: [
          "Chase at any speed necessary",
          "Follow traffic laws strictly",
          "Call for backup first",
          "Request helicopter support"
        ]
      }
    ]
  };

  const currentTest = test || mockTest;

  // Submit test mutation
  const submitTestMutation = useMutation({
    mutationFn: async (answers: Record<number, number>) => {
      // This would submit to real API: /api/tests/:id/submit
      const response = await apiRequest('POST', `/api/tests/${testId}/submit`, { answers });
      return response.json();
    },
    onSuccess: (result: TestResult) => {
      setTestResult(result);
      setTestCompleted(true);
      queryClient.invalidateQueries({ queryKey: ['/api/applications'] });
      
      toast({
        title: result.passed ? "Test Passed!" : "Test Failed",
        description: `Score: ${result.score}/${result.totalQuestions} (${result.percentage}%)`,
        variant: result.passed ? "default" : "destructive"
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit test. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Timer effect
  useEffect(() => {
    if (testStarted && timeLeft > 0 && !testCompleted) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            // Auto-submit when time runs out
            handleSubmitTest();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [testStarted, timeLeft, testCompleted]);

  // Anti-cheat: Focus monitoring
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && testStarted && !testCompleted) {
        setIsVisible(false);
        setFocusLost(prev => {
          const newCount = prev + 1;
          
          if (newCount === 1) {
            toast({
              title: "Warning!",
              description: "Do not leave the test window. Next violation will end the test.",
              variant: "destructive"
            });
          } else if (newCount >= 2) {
            toast({
              title: "Test Terminated",
              description: "Test cancelled due to multiple focus violations.",
              variant: "destructive"
            });
            handleSubmitTest(); // Auto-submit with current answers
          }
          
          return newCount;
        });
      } else {
        setIsVisible(true);
      }
    };

    const handleBlur = () => {
      if (testStarted && !testCompleted) {
        handleVisibilityChange();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
    };
  }, [testStarted, testCompleted]);

  const handleStartTest = () => {
    setTestStarted(true);
    setTimeLeft(currentTest.durationMinutes * 60);
  };

  const handleAnswerSelect = (questionId: number, answerIndex: number) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answerIndex
    }));
  };

  const handleSubmitTest = () => {
    if (Object.keys(answers).length === 0) {
      toast({
        title: "No answers provided",
        description: "Please answer at least one question before submitting.",
        variant: "destructive"
      });
      return;
    }

    // Mock result calculation
    const mockResult: TestResult = {
      score: Math.floor(Math.random() * currentTest.questions.length),
      percentage: Math.floor(Math.random() * 100),
      passed: Math.random() > 0.3,
      correctAnswers: Math.floor(Math.random() * currentTest.questions.length),
      totalQuestions: currentTest.questions.length
    };

    setTestResult(mockResult);
    setTestCompleted(true);
    
    // In real implementation, would call submitTestMutation.mutate(answers)
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading test...</div>;
  }

  if (testCompleted && testResult) {
    return (
      <div className="container mx-auto p-6 max-w-2xl">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">
              {testResult.passed ? "Test Completed Successfully!" : "Test Not Passed"}
            </CardTitle>
            <CardDescription>
              {currentTest.title}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">
                {testResult.percentage}%
              </div>
              <Badge variant={testResult.passed ? "default" : "destructive"} className="text-sm">
                {testResult.score}/{testResult.totalQuestions} Correct
              </Badge>
            </div>
            
            <Progress value={testResult.percentage} className="w-full" />
            
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-2xl font-semibold">{testResult.correctAnswers}</div>
                <div className="text-sm text-muted-foreground">Correct Answers</div>
              </div>
              <div>
                <div className="text-2xl font-semibold">
                  {testResult.totalQuestions - testResult.correctAnswers}
                </div>
                <div className="text-sm text-muted-foreground">Incorrect Answers</div>
              </div>
            </div>

            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {testResult.passed 
                  ? "Your test result has been automatically recorded and will be reviewed by supervisors."
                  : "You can retake this test after 24 hours. Contact your supervisor for additional guidance."
                }
              </AlertDescription>
            </Alert>

            <div className="flex gap-2 justify-center">
              <Button onClick={() => setLocation('/applications')}>
                View Applications
              </Button>
              <Button variant="outline" onClick={() => setLocation('/dashboard')}>
                Back to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!testStarted) {
    return (
      <div className="container mx-auto p-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{currentTest.title}</CardTitle>
            <CardDescription>
              Please read the instructions carefully before starting
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                <span>Duration: {currentTest.durationMinutes} minutes</span>
              </div>
              <div className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                <span>Questions: {currentTest.questions.length}</span>
              </div>
            </div>

            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="space-y-2">
                <div className="font-semibold">Anti-Cheat Policy:</div>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Do not leave or minimize this window during the test</li>
                  <li>First violation: Warning</li>
                  <li>Second violation: Test automatically cancelled</li>
                  <li>Focus loss is monitored and recorded</li>
                </ul>
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              <div className="text-sm text-muted-foreground">
                <ul className="list-disc list-inside space-y-1">
                  <li>You can navigate between questions freely</li>
                  <li>All answers are automatically saved</li>
                  <li>Submit when you're confident with your answers</li>
                  <li>Results are immediately available</li>
                </ul>
              </div>
            </div>

            <Button onClick={handleStartTest} className="w-full" size="lg">
              Start Test
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQ = currentTest.questions[currentQuestion];

  return (
    <div ref={testContainerRef} className="container mx-auto p-6 max-w-4xl">
      {/* Header with timer and progress */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Badge variant="outline">
            Question {currentQuestion + 1} of {currentTest.questions.length}
          </Badge>
          {focusLost > 0 && (
            <Badge variant="destructive">
              Focus Lost: {focusLost}/2
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-4">
          {!isVisible && (
            <div className="flex items-center gap-1 text-red-500">
              <EyeOff className="h-4 w-4" />
              <span className="text-sm">Window not focused</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            <span className={`font-mono text-lg ${timeLeft < 300 ? 'text-red-500' : ''}`}>
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>
      </div>

      <Progress 
        value={(currentQuestion + 1) / currentTest.questions.length * 100} 
        className="mb-6" 
      />

      {/* Question */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-xl">
            {currentQ.text}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {currentQ.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(currentQ.id, index)}
                className={`w-full p-4 text-left border rounded-lg transition-colors ${
                  answers[currentQ.id] === index
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full border-2 ${
                    answers[currentQ.id] === index
                      ? 'border-primary bg-primary'
                      : 'border-border'
                  }`} />
                  <span>{option}</span>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
          disabled={currentQuestion === 0}
        >
          Previous Question
        </Button>

        <div className="flex gap-2">
          {currentQuestion === currentTest.questions.length - 1 ? (
            <Button 
              onClick={handleSubmitTest}
              disabled={submitTestMutation.isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              {submitTestMutation.isPending ? 'Submitting...' : 'Submit Test'}
            </Button>
          ) : (
            <Button
              onClick={() => setCurrentQuestion(prev => Math.min(currentTest.questions.length - 1, prev + 1))}
            >
              Next Question
            </Button>
          )}
        </div>
      </div>

      {/* Question indicator */}
      <div className="mt-6 flex justify-center">
        <div className="flex gap-2">
          {currentTest.questions.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentQuestion(index)}
              className={`w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                index === currentQuestion
                  ? 'bg-primary text-primary-foreground'
                  : answers[currentTest.questions[index].id] !== undefined
                  ? 'bg-green-100 text-green-700 border border-green-300'
                  : 'bg-muted text-muted-foreground border border-border'
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}