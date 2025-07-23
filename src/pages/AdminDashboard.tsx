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
  GraduationCap, 
  TrendingUp, 
  Award,
  FileText,
  Calendar,
  LogOut,
  Shield,
  BarChart3,
  UserCheck
} from "lucide-react";
import cubsMascot from "@/assets/cubs-mascot.png";

interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

interface Teacher extends Profile {
  batch_count?: number;
  student_count?: number;
}

interface Student {
  id: string;
  full_name: string;
  email: string;
  age: number;
  grade: string;
  teacher_id: string;
  batch_id: string;
  enrollment_date: string;
  is_active: boolean;
}

interface Batch {
  id: string;
  name: string;
  description: string;
  teacher_id: string;
  max_students: number;
  is_active: boolean;
  created_at: string;
}

interface Assignment {
  id: string;
  title: string;
  description: string;
  teacher_id: string;
  batch_id: string;
  due_date: string;
  total_marks: number;
  is_published: boolean;
  created_at: string;
}

const AdminDashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
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

      // Check if user is super admin
      if (profileData?.role !== 'super_admin') {
        if (profileData?.role === 'teacher') {
          navigate('/teacher-dashboard');
        } else {
          toast({
            title: "Access Denied",
            description: "You don't have admin access",
            variant: "destructive"
          });
          navigate('/auth');
        }
        return;
      }

      // Fetch all data for admin view
      await Promise.all([
        fetchTeachers(),
        fetchStudents(),
        fetchBatches(),
        fetchAssignments()
      ]);

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

  const fetchTeachers = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'teacher')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching teachers:', error);
    } else {
      setTeachers(data || []);
    }
  };

  const fetchStudents = async () => {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .order('enrollment_date', { ascending: false });

    if (error) {
      console.error('Error fetching students:', error);
    } else {
      setStudents(data || []);
    }
  };

  const fetchBatches = async () => {
    const { data, error } = await supabase
      .from('batches')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching batches:', error);
    } else {
      setBatches(data || []);
    }
  };

  const fetchAssignments = async () => {
    const { data, error } = await supabase
      .from('assignments')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching assignments:', error);
    } else {
      setAssignments(data || []);
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
          <p className="text-primary font-medium">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return null;
  }

  const totalTeachers = teachers.length;
  const activeTeachers = teachers.filter(t => t.is_active).length;
  const totalStudents = students.length;
  const activeStudents = students.filter(s => s.is_active).length;
  const totalBatches = batches.length;
  const activeBatches = batches.filter(b => b.is_active).length;
  const totalAssignments = assignments.length;
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
                <h1 className="text-xl font-batangas font-bold text-primary">Super Admin Dashboard</h1>
                <p className="text-sm text-muted-foreground">Welcome back, {profile.full_name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="border-primary text-primary">
                <Shield className="w-3 h-3 mr-1" />
                Super Admin
              </Badge>
              <Button onClick={handleSignOut} variant="outline" size="sm">
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Teachers</CardTitle>
              <GraduationCap className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{activeTeachers}</div>
              <p className="text-xs text-muted-foreground">
                {totalTeachers} total • {activeTeachers} active
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Students</CardTitle>
              <Users className="h-4 w-4 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-secondary">{activeStudents}</div>
              <p className="text-xs text-muted-foreground">
                {totalStudents} total • {activeStudents} active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Batches</CardTitle>
              <BookOpen className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{activeBatches}</div>
              <p className="text-xs text-muted-foreground">
                {totalBatches} total • {activeBatches} active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Assignments</CardTitle>
              <FileText className="h-4 w-4 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-secondary">{publishedAssignments}</div>
              <p className="text-xs text-muted-foreground">
                {totalAssignments} total • {publishedAssignments} published
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full lg:w-[800px] grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="teachers">Teachers</TabsTrigger>
            <TabsTrigger value="students">Students</TabsTrigger>
            <TabsTrigger value="batches">Batches</TabsTrigger>
            <TabsTrigger value="assignments">Assignments</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="w-5 h-5 mr-2 text-primary" />
                    Platform Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Total Platform Users</span>
                    <span className="font-bold text-primary">{totalTeachers + 1}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Total Students Enrolled</span>
                    <span className="font-bold text-secondary">{totalStudents}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Active Learning Batches</span>
                    <span className="font-bold text-primary">{activeBatches}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Assignments Created</span>
                    <span className="font-bold text-secondary">{totalAssignments}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2 text-secondary" />
                    Growth Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Teacher Retention Rate</span>
                    <span className="font-bold text-primary">95%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Student Engagement</span>
                    <span className="font-bold text-secondary">87%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Assignment Completion</span>
                    <span className="font-bold text-primary">82%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Platform Satisfaction</span>
                    <span className="font-bold text-secondary">4.8/5</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 text-sm">
                    <UserCheck className="w-4 h-4 text-primary" />
                    <span>New teacher registration by {teachers[0]?.full_name || 'Unknown'}</span>
                    <span className="text-muted-foreground ml-auto">2 hours ago</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm">
                    <BookOpen className="w-4 h-4 text-secondary" />
                    <span>New batch created: "{batches[0]?.name || 'Math Fundamentals'}"</span>
                    <span className="text-muted-foreground ml-auto">5 hours ago</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm">
                    <FileText className="w-4 h-4 text-primary" />
                    <span>Assignment published: "{assignments[0]?.title || 'Weekly Quiz'}"</span>
                    <span className="text-muted-foreground ml-auto">1 day ago</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="teachers" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-batangas font-bold text-foreground">All Teachers</h2>
              <Badge variant="outline">{totalTeachers} registered teachers</Badge>
            </div>

            <div className="grid gap-4">
              {teachers.map((teacher) => (
                <Card key={teacher.id}>
                  <CardContent className="flex items-center justify-between p-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-primary font-semibold">
                          {teacher.full_name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold">{teacher.full_name}</h3>
                        <p className="text-sm text-muted-foreground">{teacher.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <Badge variant={teacher.is_active ? "default" : "secondary"}>
                        {teacher.is_active ? "Active" : "Inactive"}
                      </Badge>
                      <div className="text-right text-sm text-muted-foreground">
                        <p>Joined: {new Date(teacher.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="students" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-batangas font-bold text-foreground">All Students</h2>
              <Badge variant="outline">{totalStudents} enrolled students</Badge>
            </div>

            <div className="grid gap-4">
              {students.map((student) => (
                <Card key={student.id}>
                  <CardContent className="flex items-center justify-between p-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center">
                        <span className="text-secondary font-semibold">
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
                    <div className="flex items-center space-x-4">
                      <Badge variant={student.is_active ? "default" : "secondary"}>
                        {student.is_active ? "Active" : "Inactive"}
                      </Badge>
                      <div className="text-right text-sm text-muted-foreground">
                        <p>Enrolled: {new Date(student.enrollment_date).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="batches" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-batangas font-bold text-foreground">All Batches</h2>
              <Badge variant="outline">{totalBatches} created batches</Badge>
            </div>

            <div className="grid gap-4">
              {batches.map((batch) => (
                <Card key={batch.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{batch.name}</CardTitle>
                        <CardDescription>{batch.description}</CardDescription>
                        <p className="text-sm text-primary mt-1">
                          Teacher ID: {batch.teacher_id}
                        </p>
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
              ))}
            </div>
          </TabsContent>

          <TabsContent value="assignments" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-batangas font-bold text-foreground">All Assignments</h2>
              <Badge variant="outline">{totalAssignments} created assignments</Badge>
            </div>

            <div className="grid gap-4">
              {assignments.map((assignment) => (
                <Card key={assignment.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{assignment.title}</CardTitle>
                        <CardDescription>{assignment.description}</CardDescription>
                        <p className="text-sm text-primary mt-1">
                          Teacher ID: {assignment.teacher_id}
                        </p>
                      </div>
                      <Badge variant={assignment.is_published ? "default" : "secondary"}>
                        {assignment.is_published ? "Published" : "Draft"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>Total Marks: {assignment.total_marks}</span>
                      <span>Due: {assignment.due_date ? new Date(assignment.due_date).toLocaleDateString() : 'No due date'}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;