import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Plus, FileText, Edit, Trash2, Clock, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Assignment {
  id: string;
  title: string;
  description: string;
  due_date: string;
  total_marks: number;
  is_published: boolean;
  created_at: string;
  batch_id: string;
}

interface Batch {
  id: string;
  name: string;
}

interface AssignmentManagementProps {
  teacherId: string;
  onAssignmentsChange: () => void;
}

const AssignmentManagement = ({ teacherId, onAssignmentsChange }: AssignmentManagementProps) => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    batch_id: "",
    due_date: "",
    total_marks: 100,
    is_published: false
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchAssignments();
    fetchBatches();
  }, [teacherId]);

  const fetchAssignments = async () => {
    try {
      const { data, error } = await supabase
        .from('assignments')
        .select('*')
        .eq('teacher_id', teacherId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAssignments(data || []);
    } catch (error) {
      console.error('Error fetching assignments:', error);
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
      const assignmentData = {
        ...formData,
        due_date: formData.due_date ? new Date(formData.due_date).toISOString() : null
      };

      if (editingAssignment) {
        const { error } = await supabase
          .from('assignments')
          .update(assignmentData)
          .eq('id', editingAssignment.id);

        if (error) throw error;
        toast({ title: "Success", description: "Assignment updated successfully" });
      } else {
        const { error } = await supabase
          .from('assignments')
          .insert([{ ...assignmentData, teacher_id: teacherId }]);

        if (error) throw error;
        toast({ title: "Success", description: "Assignment created successfully" });
      }

      setIsDialogOpen(false);
      setEditingAssignment(null);
      resetForm();
      fetchAssignments();
      onAssignmentsChange();
    } catch (error) {
      console.error('Error saving assignment:', error);
      toast({
        title: "Error",
        description: "Failed to save assignment",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (assignment: Assignment) => {
    setEditingAssignment(assignment);
    setFormData({
      title: assignment.title,
      description: assignment.description,
      batch_id: assignment.batch_id,
      due_date: assignment.due_date ? new Date(assignment.due_date).toISOString().slice(0, 16) : "",
      total_marks: assignment.total_marks,
      is_published: assignment.is_published
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (assignmentId: string) => {
    if (!confirm("Are you sure you want to delete this assignment?")) return;

    try {
      const { error } = await supabase
        .from('assignments')
        .delete()
        .eq('id', assignmentId);

      if (error) throw error;
      toast({ title: "Success", description: "Assignment deleted successfully" });
      fetchAssignments();
      onAssignmentsChange();
    } catch (error) {
      console.error('Error deleting assignment:', error);
      toast({
        title: "Error",
        description: "Failed to delete assignment",
        variant: "destructive"
      });
    }
  };

  const togglePublished = async (assignmentId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('assignments')
        .update({ is_published: !currentStatus })
        .eq('id', assignmentId);

      if (error) throw error;
      toast({ 
        title: "Success", 
        description: `Assignment ${!currentStatus ? 'published' : 'unpublished'} successfully` 
      });
      fetchAssignments();
      onAssignmentsChange();
    } catch (error) {
      console.error('Error updating assignment:', error);
      toast({
        title: "Error",
        description: "Failed to update assignment",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setEditingAssignment(null);
    setFormData({
      title: "",
      description: "",
      batch_id: "",
      due_date: "",
      total_marks: 100,
      is_published: false
    });
  };

  const getBatchName = (batchId: string) => {
    const batch = batches.find(b => b.id === batchId);
    return batch?.name || "Unknown Batch";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-batangas font-bold text-foreground">Assignments</h2>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button variant="cubs">
              <Plus className="w-4 h-4 mr-2" />
              Create Assignment
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingAssignment ? "Edit Assignment" : "Create New Assignment"}</DialogTitle>
              <DialogDescription>
                {editingAssignment ? "Update assignment details" : "Create a new assignment for your students"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Assignment Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Math Worksheet 1"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Assignment instructions and details"
                  rows={4}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
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
                  <Label htmlFor="total_marks">Total Marks</Label>
                  <Input
                    id="total_marks"
                    type="number"
                    min="1"
                    value={formData.total_marks}
                    onChange={(e) => setFormData({ ...formData, total_marks: parseInt(e.target.value) })}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="due_date">Due Date (Optional)</Label>
                <Input
                  id="due_date"
                  type="datetime-local"
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="is_published">Publish Assignment</Label>
                <Switch
                  id="is_published"
                  checked={formData.is_published}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_published: checked })}
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? "Saving..." : editingAssignment ? "Update Assignment" : "Create Assignment"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {assignments.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No assignments yet</h3>
              <p className="text-muted-foreground text-center mb-6">Create assignments to assess your students</p>
            </CardContent>
          </Card>
        ) : (
          assignments.map((assignment) => (
            <Card key={assignment.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{assignment.title}</CardTitle>
                    <CardDescription>{assignment.description}</CardDescription>
                    <p className="text-sm text-muted-foreground mt-1">
                      Batch: {getBatchName(assignment.batch_id)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={assignment.is_published ? "default" : "secondary"}>
                      {assignment.is_published ? "Published" : "Draft"}
                    </Badge>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => togglePublished(assignment.id, assignment.is_published)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      {assignment.is_published ? "Unpublish" : "Publish"}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleEdit(assignment)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleDelete(assignment.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
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
    </div>
  );
};

export default AssignmentManagement;