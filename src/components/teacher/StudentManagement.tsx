import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Plus, Users, Edit, Trash2, Key, Copy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Student {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  age: number;
  grade: string;
  parent_name: string;
  parent_phone: string;
  parent_email: string;
  batch_id: string;
  is_active: boolean;
  username: string;
  is_login_enabled: boolean;
  enrollment_date: string;
  generated_password?: string;
}

interface Batch {
  id: string;
  name: string;
}

interface StudentManagementProps {
  teacherId: string;
  onStudentsChange: () => void;
}

const StudentManagement = ({ teacherId, onStudentsChange }: StudentManagementProps) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCredentialsDialogOpen, setIsCredentialsDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [generatedCredentials, setGeneratedCredentials] = useState<{username: string, password: string} | null>(null);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    age: 5,
    grade: "",
    parent_name: "",
    parent_phone: "",
    parent_email: "",
    batch_id: "",
    is_active: true
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchStudents();
    fetchBatches();
  }, [teacherId]);

  const fetchStudents = async () => {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('teacher_id', teacherId)
        .order('enrollment_date', { ascending: false });

      if (error) throw error;
      setStudents(data || []);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const fetchBatches = async () => {
    try {
      const { data, error } = await supabase
        .from('batches')
        .select('id, name')
        .eq('teacher_id', teacherId)
        .eq('is_active', true);

      if (error) throw error;
      setBatches(data || []);
    } catch (error) {
      console.error('Error fetching batches:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingStudent) {
        const { error } = await supabase
          .from('students')
          .update(formData)
          .eq('id', editingStudent.id);

        if (error) throw error;
        toast({ title: "Success", description: "Student updated successfully" });
      } else {
        const { error } = await supabase
          .from('students')
          .insert([{ ...formData, teacher_id: teacherId }]);

        if (error) throw error;
        toast({ title: "Success", description: "Student added successfully" });
      }

      setIsDialogOpen(false);
      setEditingStudent(null);
      resetForm();
      fetchStudents();
      onStudentsChange();
    } catch (error) {
      console.error('Error saving student:', error);
      toast({
        title: "Error",
        description: "Failed to save student",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    setFormData({
      full_name: student.full_name,
      email: student.email,
      phone: student.phone,
      age: student.age,
      grade: student.grade,
      parent_name: student.parent_name,
      parent_phone: student.parent_phone,
      parent_email: student.parent_email,
      batch_id: student.batch_id,
      is_active: student.is_active
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (studentId: string) => {
    if (!confirm("Are you sure you want to delete this student?")) return;

    try {
      const { error } = await supabase
        .from('students')
        .delete()
        .eq('id', studentId);

      if (error) throw error;
      toast({ title: "Success", description: "Student deleted successfully" });
      fetchStudents();
      onStudentsChange();
    } catch (error) {
      console.error('Error deleting student:', error);
      toast({
        title: "Error",
        description: "Failed to delete student",
        variant: "destructive"
      });
    }
  };

  const generateCredentials = async (student: Student) => {
    setSelectedStudent(student);
    const username = `${student.full_name.toLowerCase().replace(/\s+/g, '')}_${student.id.slice(-4)}`;
    const password = Math.random().toString(36).slice(-8);

    try {
      const { data, error } = await supabase.rpc('generate_student_credentials', {
        p_student_id: student.id,
        p_username: username,
        p_password: password
      });

      if (error) throw error;

      const result = data as any;
      if (result.success) {
        // Update the students list to show the generated password
        setStudents(prev => prev.map(s => 
          s.id === student.id 
            ? { ...s, username, generated_password: password, is_login_enabled: true }
            : s
        ));
        setGeneratedCredentials({ username, password });
        setIsCredentialsDialogOpen(true);
        fetchStudents();
        toast({ title: "Success", description: "Student credentials generated successfully" });
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error generating credentials:', error);
      toast({
        title: "Error",
        description: "Failed to generate student credentials",
        variant: "destructive"
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied", description: "Copied to clipboard" });
  };

  const resetForm = () => {
    setEditingStudent(null);
    setFormData({
      full_name: "",
      email: "",
      phone: "",
      age: 5,
      grade: "",
      parent_name: "",
      parent_phone: "",
      parent_email: "",
      batch_id: "",
      is_active: true
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-batangas font-bold text-foreground">Your Students</h2>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button variant="cubs">
              <Plus className="w-4 h-4 mr-2" />
              Add Student
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingStudent ? "Edit Student" : "Add New Student"}</DialogTitle>
              <DialogDescription>
                {editingStudent ? "Update student information" : "Add a new student to your class"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    min="3"
                    max="18"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="grade">Grade</Label>
                  <Input
                    id="grade"
                    value={formData.grade}
                    onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="batch_id">Batch</Label>
                  <Select value={formData.batch_id} onValueChange={(value) => setFormData({ ...formData, batch_id: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a batch" />
                    </SelectTrigger>
                    <SelectContent>
                      {batches.map((batch) => (
                        <SelectItem key={batch.id} value={batch.id}>
                          {batch.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="parent_name">Parent Name</Label>
                  <Input
                    id="parent_name"
                    value={formData.parent_name}
                    onChange={(e) => setFormData({ ...formData, parent_name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="parent_phone">Parent Phone</Label>
                  <Input
                    id="parent_phone"
                    value={formData.parent_phone}
                    onChange={(e) => setFormData({ ...formData, parent_phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="parent_email">Parent Email</Label>
                  <Input
                    id="parent_email"
                    type="email"
                    value={formData.parent_email}
                    onChange={(e) => setFormData({ ...formData, parent_email: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="is_active">Active Student</Label>
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? "Saving..." : editingStudent ? "Update Student" : "Add Student"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Student Credentials Dialog */}
      <Dialog open={isCredentialsDialogOpen} onOpenChange={setIsCredentialsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Student Login Credentials</DialogTitle>
            <DialogDescription>
              Generated login credentials for {selectedStudent?.full_name}
            </DialogDescription>
          </DialogHeader>
          {generatedCredentials && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Username</Label>
                <div className="flex gap-2">
                  <Input value={generatedCredentials.username} readOnly />
                  <Button size="sm" variant="outline" onClick={() => copyToClipboard(generatedCredentials.username)}>
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Password</Label>
                <div className="flex gap-2">
                  <Input value={generatedCredentials.password} readOnly />
                  <Button size="sm" variant="outline" onClick={() => copyToClipboard(generatedCredentials.password)}>
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>Important:</strong> Please share these credentials with the student securely. 
                  The password cannot be retrieved later, only reset.
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <div className="grid gap-4">
        {students.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Users className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No students yet</h3>
              <p className="text-muted-foreground text-center mb-6">Add students to start your teaching journey</p>
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
                    <div className="flex gap-2 mt-1">
                      <Badge variant={student.is_active ? "default" : "secondary"}>
                        {student.is_active ? "Active" : "Inactive"}
                      </Badge>
                      {student.is_login_enabled && (
                        <div className="flex flex-col gap-1">
                          <Badge variant="outline">Login Enabled</Badge>
                          {student.username && (
                            <div className="text-xs text-muted-foreground">
                              <div>Username: <span className="font-mono">{student.username}</span></div>
                              {student.generated_password && (
                                <div>Password: <span className="font-mono">{student.generated_password}</span></div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!student.is_login_enabled && (
                    <Button size="sm" variant="outline" onClick={() => generateCredentials(student)}>
                      <Key className="w-4 h-4 mr-1" />
                      Generate Login
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" onClick={() => handleEdit(student)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => handleDelete(student.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default StudentManagement;