import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { User, Session } from '@supabase/supabase-js';
import { 
  Users, 
  BookOpen, 
  Calendar, 
  TrendingUp, 
  Plus, 
  GraduationCap,
  FileText,
  Clock,
  Award,
  LogOut
} from "lucide-react";
import cubsMascot from "@/assets/cubs-mascot.png";

interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  role: string;
}

interface Batch {
  id: string;
  name: string;
  description: string;
  max_students: number;
  is_active: boolean;
  created_at: string;
}

interface Student {
  id: string;
  full_name: string;
  email: string;
  age: number;
  grade: string;
  enrollment_date: string;
  batch_id: string;
}

interface Assignment {
  id: string;
  title: string;
  description: string;
  due_date: string;
  total_marks: number;
  is_published: boolean;
  created_at: string;
}

const TeacherDashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (!session?.user) {
          navigate('/auth');
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (!session?.user) {
        navigate('/auth');
      } else {
        fetchUserData(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchUserData = async (userId: string) => {
    try {
      setLoading(true);
      
      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        toast({
          title: "Error",
          description: "Failed to fetch profile data",
          variant: "destructive"
        });
        return;
      }

      setProfile(profileData);

      // Check if user is teacher
      if (profileData?.role !== 'teacher') {
        if (profileData?.role === 'super_admin') {
          navigate('/admin-dashboard');
        } else {
          toast({
            title: "Access Denied",
            description: "You don't have teacher access",
            variant: "destructive"
          });
          navigate('/auth');
        }
        return;
      }

      // Fetch teacher's batches
      const { data: batchesData, error: batchesError } = await supabase
        .from('batches')
        .select('*')
        .eq('teacher_id', userId)
        .order('created_at', { ascending: false });

      if (batchesError) {
        console.error('Error fetching batches:', batchesError);
      } else {
        setBatches(batchesData || []);
      }

      // Fetch teacher's students
      const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select('*')
        .eq('teacher_id', userId)
        .order('enrollment_date', { ascending: false });

      if (studentsError) {
        console.error('Error fetching students:', studentsError);
      } else {
        setStudents(studentsData || []);
      }

      // Fetch teacher's assignments
      const { data: assignmentsData, error: assignmentsError } = await supabase
        .from('assignments')
        .select('*')
        .eq('teacher_id', userId)
        .order('created_at', { ascending: false });

      if (assignmentsError) {
        console.error('Error fetching assignments:', assignmentsError);
      } else {
        setAssignments(assignmentsData || []);
      }

    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch dashboard data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } else {
      navigate('/');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-hero">
        <div className="text-center">
          <img src={cubsMascot} alt="Loading" className="w-16 h-16 animate-pulse mx-auto mb-4" />
          <p className="text-primary font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return null;
  }

  const activeStudents = students.length;
  const activeBatches = batches.filter(b => b.is_active).length;
  const publishedAssignments = assignments.filter(a => a.is_published).length;

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-sm border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img src={cubsMascot} alt="StudyCubs" className="w-10 h-10" />
              <div>
                <h1 className="text-xl font-batangas font-bold text-primary">Teacher Dashboard</h1>
                <p className="text-sm text-muted-foreground">Welcome back, {profile.full_name}</p>
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
              <CardTitle className="text-sm font-medium">Active Students</CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{activeStudents}</div>
              <p className="text-xs text-muted-foreground">Enrolled students</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Batches</CardTitle>
              <GraduationCap className="h-4 w-4 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-secondary">{activeBatches}</div>
              <p className="text-xs text-muted-foreground">Running batches</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Assignments</CardTitle>
              <FileText className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{publishedAssignments}</div>
              <p className="text-xs text-muted-foreground">Published assignments</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <TrendingUp className="h-4 w-4 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-secondary">85%</div>
              <p className="text-xs text-muted-foreground">Student engagement</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="batches" className="space-y-6">
          <TabsList className="grid w-full lg:w-[600px] grid-cols-4">
            <TabsTrigger value="batches">Batches</TabsTrigger>
            <TabsTrigger value="students">Students</TabsTrigger>
            <TabsTrigger value="assignments">Assignments</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="batches" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-batangas font-bold text-foreground">Your Batches</h2>
              <Button variant="cubs">
                <Plus className="w-4 h-4 mr-2" />
                Create Batch
              </Button>
            </div>
            
            <div className="grid gap-6">
              {batches.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <GraduationCap className="w-12 h-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">No batches yet</h3>
                    <p className="text-muted-foreground text-center mb-6">Create your first batch to start teaching students</p>
                    <Button variant="cubs">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Your First Batch
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                batches.map((batch) => (
                  <Card key={batch.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">{batch.name}</CardTitle>
                          <CardDescription>{batch.description}</CardDescription>
                        </div>
                        <Badge variant={batch.is_active ? "default" : "secondary"}>
                          {batch.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>Max Students: {batch.max_students}</span>
                        <span>Created: {new Date(batch.created_at).toLocaleDateString()}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="students" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-batangas font-bold text-foreground">Your Students</h2>
              <Button variant="cubs">
                <Plus className="w-4 h-4 mr-2" />
                Add Student
              </Button>
            </div>

            <div className="grid gap-4">
              {students.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Users className="w-12 h-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">No students yet</h3>
                    <p className="text-muted-foreground text-center mb-6">Add students to start your teaching journey</p>
                    <Button variant="cubs">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Your First Student
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                students.map((student) => (
                  <Card key={student.id}>
                    <CardContent className="flex items-center justify-between p-6">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-primary font-semibold">
                            {student.full_name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-semibold">{student.full_name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {student.email} • Grade {student.grade} • Age {student.age}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">
                          Enrolled: {new Date(student.enrollment_date).toLocaleDateString()}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="assignments" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-batangas font-bold text-foreground">Assignments</h2>
              <Button variant="cubs">
                <Plus className="w-4 h-4 mr-2" />
                Create Assignment
              </Button>
            </div>

            <div className="grid gap-4">
              {assignments.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <FileText className="w-12 h-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">No assignments yet</h3>
                    <p className="text-muted-foreground text-center mb-6">Create assignments to assess your students</p>
                    <Button variant="cubs">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Your First Assignment
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                assignments.map((assignment) => (
                  <Card key={assignment.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">{assignment.title}</CardTitle>
                          <CardDescription>{assignment.description}</CardDescription>
                        </div>
                        <Badge variant={assignment.is_published ? "default" : "secondary"}>
                          {assignment.is_published ? "Published" : "Draft"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>Total Marks: {assignment.total_marks}</span>
                        <span className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          Due: {assignment.due_date ? new Date(assignment.due_date).toLocaleDateString() : 'No due date'}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl font-batangas">Profile Information</CardTitle>
                <CardDescription>Manage your account details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-2xl text-primary font-bold">
                      {profile.full_name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">{profile.full_name}</h3>
                    <p className="text-muted-foreground">{profile.email}</p>
                    <Badge variant="outline" className="mt-2">
                      <Award className="w-3 h-3 mr-1" />
                      Teacher
                    </Badge>
                  </div>
                </div>
                
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-2">Teaching Stats</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Total Students:</span>
                        <span className="font-medium">{activeStudents}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Active Batches:</span>
                        <span className="font-medium">{activeBatches}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Assignments Created:</span>
                        <span className="font-medium">{assignments.length}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Quick Actions</h4>
                    <div className="space-y-2">
                      <Button variant="outline" size="sm" className="w-full justify-start">
                        <Plus className="w-4 h-4 mr-2" />
                        Create New Batch
                      </Button>
                      <Button variant="outline" size="sm" className="w-full justify-start">
                        <Users className="w-4 h-4 mr-2" />
                        Add Students
                      </Button>
                      <Button variant="outline" size="sm" className="w-full justify-start">
                        <FileText className="w-4 h-4 mr-2" />
                        Create Assignment
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default TeacherDashboard;