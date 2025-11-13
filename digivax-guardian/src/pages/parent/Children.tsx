import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import axiosInstance from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Baby, Calendar } from 'lucide-react';
import { toast } from 'sonner';

interface Child {
  _id: string;
  name: string;
  dateOfBirth: string;
  gender: string;
}

interface Recommendation {
  vaccine: { name: string };
  status: string;
  scheduledDate?: string;
}

const Children = () => {
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChild, setSelectedChild] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', dateOfBirth: '', gender: 'male' });

  useEffect(() => {
    fetchChildren();
  }, []);

  const fetchChildren = async () => {
    try {
      const response = await axiosInstance.get('/parents/children');
      setChildren(response.data);
    } catch (error) {
      toast.error('Failed to load children');
    }
  };

  const fetchRecommendations = async (childId: string) => {
    try {
      const response = await axiosInstance.get(`/parents/children/${childId}/recommendations`);
      setRecommendations(response.data);
      setSelectedChild(childId);
    } catch (error) {
      toast.error('Failed to load recommendations');
    }
  };

  const handleAddChild = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axiosInstance.post('/parents/children', formData);
      toast.success('Child added successfully');
      setIsAddOpen(false);
      setFormData({ name: '', dateOfBirth: '', gender: 'male' });
      fetchChildren();
    } catch (error) {
      toast.error('Failed to add child');
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", label: string }> = {
      completed: { variant: 'default', label: 'Completed' },
      upcoming: { variant: 'secondary', label: 'Upcoming' },
      missed: { variant: 'destructive', label: 'Missed' },
    };
    const config = variants[status] || { variant: 'outline', label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">My Children</h1>
            <p className="text-muted-foreground mt-1">Manage your children's profiles and vaccination records</p>
          </div>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Child
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Child</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddChild} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dob">Date of Birth</Label>
                  <Input
                    id="dob"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <select
                    id="gender"
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full border border-input rounded-lg px-3 py-2 bg-background"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
                <Button type="submit" className="w-full">Add Child</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {children.map((child) => (
            <Card key={child._id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-full bg-primary/10">
                    <Baby className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{child.name}</h3>
                    <p className="text-sm text-muted-foreground capitalize">{child.gender}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  {new Date(child.dateOfBirth).toLocaleDateString()}
                </div>
              </div>
              <Button
                onClick={() => fetchRecommendations(child._id)}
                variant="outline"
                className="w-full"
              >
                View Vaccines
              </Button>
            </Card>
          ))}
        </div>

        {selectedChild && recommendations.length > 0 && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">Vaccine Recommendations</h2>
            <div className="space-y-3">
              {recommendations.map((rec, index) => (
                <div key={index} className="flex items-center justify-between p-4 rounded-lg border border-border">
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{rec.vaccine.name}</p>
                    {rec.scheduledDate && (
                      <p className="text-sm text-muted-foreground">
                        Scheduled: {new Date(rec.scheduledDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  {getStatusBadge(rec.status)}
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Children;
