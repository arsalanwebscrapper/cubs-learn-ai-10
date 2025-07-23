import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { LogOut, FileText, Clock, CheckCircle, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import cubsMascot from "@/assets/cubs-mascot.png";

interface StudentAssignment {
  assignment_id: string;
  title: string;
  description: string;
  due_date: string;
  total_marks: number;
  is_published: boolean;
  created_at: string;
  submitted: boolean;
  submission_id: string;
  marks_obtained: number;
  feedback: string;
  graded_at: string;
}

interface Student {
  id: string;
  full_name: string;
  batch_id: string;
  username: string;
}

const StudentDashboard = () => {
  const [student, setStudent] = useState<Student | null>(null);
  const [assignments, setAssignments] = useState<StudentAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submissionText, setSubmissionText] = useState("");
  const [selectedAssignment, setSelectedAssignment] = useState<StudentAssignment | null>(null);
  const [isSubmissionDialogOpen, setIsSubmissionDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    checkStudentSession();
  }, []);

  const checkStudentSession = () => {
    const studentData = localStorage.getItem('student_session');
    if (!studentData) {
      window.location.href = '/student-login';
      return;
    }

    try {
      const student = JSON.parse(studentData);
      setStudent(student);
      fetchAssignments(student.id);
    } catch (error) {
      console.error('Error parsing student session:', error);
      localStorage.removeItem('student_session');
      window.location.href = '/student-login';
    }
  };

  const fetchAssignments = async (studentId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.rpc('get_student_assignments', {
        p_student_id: studentId
      });

      if (error) throw error;
      setAssignments(data || []);
    } catch (error) {
      console.error('Error fetching assignments:', error);
      toast({
        title: "Error",
        description: "Failed to fetch assignments",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAssignment = async () => {
    if (!selectedAssignment || !student || !submissionText.trim()) {
      toast({
        title: "Error",
        description: "Please provide your submission text",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('assignment_submissions')
        .insert([{
          assignment_id: selectedAssignment.assignment_id,
          student_id: student.id,
          submission_text: submissionText.trim()
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Assignment submitted successfully"
      });

      setIsSubmissionDialogOpen(false);
      setSubmissionText("");
      setSelectedAssignment(null);
      fetchAssignments(student.id);
    } catch (error) {
      console.error('Error submitting assignment:', error);
      toast({
        title: "Error",
        description: "Failed to submit assignment",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem('student_session');
    window.location.href = '/student-login';
  };

  const openSubmissionDialog = (assignment: StudentAssignment) => {
    setSelectedAssignment(assignment);
    setSubmissionText("");
    setIsSubmissionDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-hero">
        <div className="text-center">
          <img src={cubsMascot} alt="Loading" className="w-16 h-16 animate-pulse mx-auto mb-4" />
          <p className="text-primary font-medium">Loading your assignments...</p>
        </div>
      </div>
    );
  }

  if (!student) {
    return null;
  }

  const submittedCount = assignments.filter(a => a.submitted).length;
  const pendingCount = assignments.filter(a => !a.submitted).length;
  const gradedCount = assignments.filter(a => a.graded_at).length;

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-sm border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img src={cubsMascot} alt="StudyCubs" className="w-10 h-10" />
              <div>
                <h1 className="text-xl font-batangas font-bold text-primary">Student Dashboard</h1>
                <p className="text-sm text-muted-foreground">Welcome, {student.full_name}</p>
              </div>
            </div>
            <Button onClick={handleSignOut} variant="outline" size="sm">
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Assignments</CardTitle>
              <FileText className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{assignments.length}</div>
              <p className="text-xs text-muted-foreground">Available assignments</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Submitted</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{submittedCount}</div>
              <p className="text-xs text-muted-foreground">Completed assignments</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{pendingCount}</div>
              <p className="text-xs text-muted-foreground">Pending submissions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Graded</CardTitle>
              <CheckCircle className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{gradedCount}</div>
              <p className="text-xs text-muted-foreground">Graded assignments</p>
            </CardContent>
          </Card>
        </div>

        {/* Assignments List */}
        <div className="space-y-6">
          <h2 className="text-2xl font-batangas font-bold text-foreground">Your Assignments</h2>
          
          {assignments.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No assignments yet</h3>
                <p className="text-muted-foreground text-center">Your teacher hasn't assigned any assignments yet. Check back later!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {assignments.map((assignment) => (
                <Card key={assignment.assignment_id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{assignment.title}</CardTitle>
                        <CardDescription>{assignment.description}</CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        {assignment.submitted ? (
                          <Badge variant="default">Submitted</Badge>
                        ) : (
                          <Badge variant="secondary">Pending</Badge>
                        )}
                        {assignment.graded_at && (
                          <Badge variant="outline">
                            {assignment.marks_obtained}/{assignment.total_marks}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        <span className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          Due: {assignment.due_date ? new Date(assignment.due_date).toLocaleDateString() : 'No due date'}
                        </span>
                        <span>Total Marks: {assignment.total_marks}</span>
                      </div>
                      {!assignment.submitted && (
                        <Button onClick={() => openSubmissionDialog(assignment)} variant="cubs">
                          <Upload className="w-4 h-4 mr-2" />
                          Submit Assignment
                        </Button>
                      )}
                    </div>
                    {assignment.graded_at && assignment.feedback && (
                      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                        <h4 className="text-sm font-medium text-blue-900 mb-1">Teacher's Feedback</h4>
                        <p className="text-sm text-blue-800">{assignment.feedback}</p>
                        <p className="text-xs text-blue-600 mt-1">
                          Graded on: {new Date(assignment.graded_at).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Submission Dialog */}
      <Dialog open={isSubmissionDialogOpen} onOpenChange={setIsSubmissionDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Submit Assignment</DialogTitle>
            <DialogDescription>
              Submit your work for: {selectedAssignment?.title}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Your Submission</label>
              <Textarea
                value={submissionText}
                onChange={(e) => setSubmissionText(e.target.value)}
                placeholder="Write your assignment submission here..."
                rows={8}
                className="w-full"
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button 
                onClick={handleSubmitAssignment} 
                disabled={submitting || !submissionText.trim()}
                className="flex-1"
              >
                {submitting ? "Submitting..." : "Submit Assignment"}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsSubmissionDialogOpen(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentDashboard;