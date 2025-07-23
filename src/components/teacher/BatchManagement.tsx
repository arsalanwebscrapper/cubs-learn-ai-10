import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Plus, GraduationCap, Edit, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Batch {
  id: string;
  name: string;
  description: string;
  max_students: number;
  is_active: boolean;
  created_at: string;
}

interface BatchManagementProps {
  teacherId: string;
  onBatchesChange: () => void;
}

const BatchManagement = ({ teacherId, onBatchesChange }: BatchManagementProps) => {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBatch, setEditingBatch] = useState<Batch | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    max_students: 30,
    is_active: true
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchBatches();
  }, [teacherId]);

  const fetchBatches = async () => {
    try {
      const { data, error } = await supabase
        .from('batches')
        .select('*')
        .eq('teacher_id', teacherId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBatches(data || []);
    } catch (error) {
      console.error('Error fetching batches:', error);
      toast({
        title: "Error",
        description: "Failed to fetch batches",
        variant: "destructive"
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingBatch) {
        const { error } = await supabase
          .from('batches')
          .update(formData)
          .eq('id', editingBatch.id);

        if (error) throw error;
        toast({ title: "Success", description: "Batch updated successfully" });
      } else {
        const { error } = await supabase
          .from('batches')
          .insert([{ ...formData, teacher_id: teacherId }]);

        if (error) throw error;
        toast({ title: "Success", description: "Batch created successfully" });
      }

      setIsDialogOpen(false);
      setEditingBatch(null);
      setFormData({ name: "", description: "", max_students: 30, is_active: true });
      fetchBatches();
      onBatchesChange();
    } catch (error) {
      console.error('Error saving batch:', error);
      toast({
        title: "Error",
        description: "Failed to save batch",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (batch: Batch) => {
    setEditingBatch(batch);
    setFormData({
      name: batch.name,
      description: batch.description,
      max_students: batch.max_students,
      is_active: batch.is_active
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (batchId: string) => {
    if (!confirm("Are you sure you want to delete this batch?")) return;

    try {
      const { error } = await supabase
        .from('batches')
        .delete()
        .eq('id', batchId);

      if (error) throw error;
      toast({ title: "Success", description: "Batch deleted successfully" });
      fetchBatches();
      onBatchesChange();
    } catch (error) {
      console.error('Error deleting batch:', error);
      toast({
        title: "Error",
        description: "Failed to delete batch",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setEditingBatch(null);
    setFormData({ name: "", description: "", max_students: 30, is_active: true });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-batangas font-bold text-foreground">Your Batches</h2>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button variant="cubs">
              <Plus className="w-4 h-4 mr-2" />
              Create Batch
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingBatch ? "Edit Batch" : "Create New Batch"}</DialogTitle>
              <DialogDescription>
                {editingBatch ? "Update batch information" : "Add a new batch for your students"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Batch Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Math Grade 5 - Morning"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of the batch"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max_students">Maximum Students</Label>
                <Input
                  id="max_students"
                  type="number"
                  min="1"
                  max="100"
                  value={formData.max_students}
                  onChange={(e) => setFormData({ ...formData, max_students: parseInt(e.target.value) })}
                  required
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="is_active">Active Batch</Label>
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? "Saving..." : editingBatch ? "Update Batch" : "Create Batch"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6">
        {batches.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <GraduationCap className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No batches yet</h3>
              <p className="text-muted-foreground text-center mb-6">Create your first batch to start teaching students</p>
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
                  <div className="flex items-center gap-2">
                    <Badge variant={batch.is_active ? "default" : "secondary"}>
                      {batch.is_active ? "Active" : "Inactive"}
                    </Badge>
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(batch)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(batch.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
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
    </div>
  );
};

export default BatchManagement;