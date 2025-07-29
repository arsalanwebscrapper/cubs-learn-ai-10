import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Calendar, Users, FileText, Eye, Edit, Trash2, Upload, ArrowLeft, Download } from "lucide-react";

interface Assignment {
  id: string;
  title: string;
  description: string;
  due_date: string;
  total_marks: number;
  is_published: boolean;
  created_at: string;
  batch_id: string;
  file_url?: string;
  file_name?: string;
  file_size?: number;
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
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [totalMarks, setTotalMarks] = useState("");
  const [selectedBatch, setSelectedBatch] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'view'>('list');
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
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

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setDueDate("");
    setTotalMarks("");
    setSelectedBatch("");
    setSelectedFile(null);
  };

  const handleFileUpload = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `assignments/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('assignments')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('assignments')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error('File upload error:', error);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !description.trim() || !dueDate || !totalMarks || !selectedBatch) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      let fileUrl = null;
      let fileName = null;
      let fileSize = null;

      if (selectedFile) {
        fileUrl = await handleFileUpload(selectedFile);
        fileName = selectedFile.name;
        fileSize = selectedFile.size;
      }

      const { data, error } = await supabase
        .from('assignments')
        .insert([
          {
            title: title.trim(),
            description: description.trim(),
            due_date: new Date(dueDate).toISOString(),
            total_marks: parseInt(totalMarks),
            batch_id: selectedBatch,
            teacher_id: teacherId,
            is_published: false,
            file_url: fileUrl,
            file_name: fileName,
            file_size: fileSize
          }
        ]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Assignment created successfully!"
      });

      resetForm();
      setShowForm(false);
      fetchAssignments();
      onAssignmentsChange();
    } catch (error) {
      console.error('Error creating assignment:', error);
      toast({
        title: "Error",
        description: "Failed to create assignment",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDescription = (description: string) => {
    return description.split('\n').map((line, index) => (
      <div key={index} className="mb-2">
        {line.startsWith('- ') ? (
          <li className="ml-4">{line.substring(2)}</li>
        ) : line.startsWith('# ') ? (
          <h3 className="font-semibold text-lg">{line.substring(2)}</h3>
        ) : line.startsWith('## ') ? (
          <h4 className="font-medium text-base">{line.substring(3)}</h4>
        ) : (
          <p>{line}</p>
        )}
      </div>
    ));
  };

  if (viewMode === 'view' && selectedAssignment) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => setViewMode('list')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to List
          </Button>
          <h2 className="text-2xl font-batangas font-bold">Assignment Details</h2>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">{selectedAssignment.title}</CardTitle>
              <Badge variant={selectedAssignment.is_published ? "default" : "secondary"}>
                {selectedAssignment.is_published ? "Published" : "Draft"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Due Date:</span>
                <p>{new Date(selectedAssignment.due_date).toLocaleDateString()}</p>
              </div>
              <div>
                <span className="font-medium">Total Marks:</span>
                <p>{selectedAssignment.total_marks}</p>
              </div>
            </div>
            
            <div>
              <span className="font-medium">Description:</span>
              <div className="mt-2 p-4 bg-muted rounded-lg">
                {formatDescription(selectedAssignment.description)}
              </div>
            </div>

            {selectedAssignment.file_url && (
              <div>
                <span className="font-medium">Attached File:</span>
                <div className="mt-2 flex items-center gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <a href={selectedAssignment.file_url} target="_blank" rel="noopener noreferrer">
                      <Download className="w-4 h-4 mr-2" />
                      {selectedAssignment.file_name}
                    </a>
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    ({(selectedAssignment.file_size! / 1024).toFixed(1)} KB)
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-batangas font-bold">Assignment Management</h2>
          <p className="text-muted-foreground">Create and manage assignments for your batches</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Create Assignment
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Assignment</CardTitle>
            <CardDescription>Fill in the details to create a new assignment</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Assignment Title</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter assignment title"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Use # for headings, ## for subheadings, - for bullet points"
                    className="min-h-[100px]"
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Formatting: Use # for headings, ## for subheadings, - for bullet points
                  </p>
                </div>

                <div>
                  <Label htmlFor="file">Upload File (Optional)</Label>
                  <Input
                    id="file"
                    type="file"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                  />
                  {selectedFile && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="dueDate">Due Date</Label>
                    <Input
                      id="dueDate"
                      type="datetime-local"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="totalMarks">Total Marks</Label>
                    <Input
                      id="totalMarks"
                      type="number"
                      min="1"
                      value={totalMarks}
                      onChange={(e) => setTotalMarks(e.target.value)}
                      placeholder="Enter total marks"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="batch">Select Batch</Label>
                  <Select value={selectedBatch} onValueChange={setSelectedBatch}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a batch" />
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
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? "Creating..." : "Create Assignment"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Your Assignments
            </CardTitle>
            <Badge variant="outline">{assignments.length} assignments</Badge>
          </div>
        </CardHeader>
        <CardContent>
          {assignments.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No assignments yet</h3>
              <p className="text-muted-foreground mb-6">Create your first assignment to get started</p>
              <Button onClick={() => setShowForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Assignment
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Batch</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Marks</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assignments.map((assignment) => (
                  <TableRow key={assignment.id}>
                    <TableCell className="font-medium">{assignment.title}</TableCell>
                    <TableCell>
                      {batches.find(b => b.id === assignment.batch_id)?.name || 'Unknown'}
                    </TableCell>
                    <TableCell>
                      {new Date(assignment.due_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{assignment.total_marks}</TableCell>
                    <TableCell>
                      <Badge variant={assignment.is_published ? "default" : "secondary"}>
                        {assignment.is_published ? "Published" : "Draft"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setSelectedAssignment(assignment);
                            setViewMode('view');
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={async () => {
                            try {
                              const { error } = await supabase
                                .from('assignments')
                                .update({ is_published: !assignment.is_published })
                                .eq('id', assignment.id);

                              if (error) throw error;

                              toast({
                                title: "Success",
                                description: `Assignment ${assignment.is_published ? 'unpublished' : 'published'} successfully!`
                              });

                              fetchAssignments();
                            } catch (error) {
                              console.error('Error updating assignment:', error);
                              toast({
                                title: "Error",
                                description: "Failed to update assignment",
                                variant: "destructive"
                              });
                            }
                          }}
                        >
                          {assignment.is_published ? "Unpublish" : "Publish"}
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={async () => {
                            try {
                              const { error } = await supabase
                                .from('assignments')
                                .delete()
                                .eq('id', assignment.id);

                              if (error) throw error;

                              toast({
                                title: "Success",
                                description: "Assignment deleted successfully!"
                              });

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
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AssignmentManagement;