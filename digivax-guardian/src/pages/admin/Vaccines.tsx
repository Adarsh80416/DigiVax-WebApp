import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import axiosInstance from '@/lib/axios';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Syringe, Plus, Calendar } from 'lucide-react';
import { toast } from 'sonner';

interface Vaccine {
  _id: string;
  name: string;
  description: string;
  recommendedAge: string;
}

const Vaccines = () => {
  const [vaccines, setVaccines] = useState<Vaccine[]>([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '', recommendedAge: '' });

  useEffect(() => {
    fetchVaccines();
  }, []);

  const fetchVaccines = async () => {
    try {
      const response = await axiosInstance.get('/admin/vaccines');
      setVaccines(response.data);
    } catch (error) {
      toast.error('Failed to load vaccines');
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axiosInstance.post('/admin/vaccines', formData);
      toast.success('Vaccine added successfully');
      setIsAddOpen(false);
      setFormData({ name: '', description: '', recommendedAge: '' });
      fetchVaccines();
    } catch (error) {
      toast.error('Failed to add vaccine');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Vaccines</h1>
            <p className="text-muted-foreground mt-1">Manage vaccine catalog</p>
          </div>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Vaccine
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Vaccine</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAdd} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Vaccine Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="age">Recommended Age</Label>
                  <Input
                    id="age"
                    placeholder="e.g., 2 months, 6 months"
                    value={formData.recommendedAge}
                    onChange={(e) => setFormData({ ...formData, recommendedAge: e.target.value })}
                    required
                  />
                </div>
                <Button type="submit" className="w-full">Add Vaccine</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {vaccines.map((vaccine) => (
            <Card key={vaccine._id} className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-full bg-success/10">
                  <Syringe className="h-6 w-6 text-success" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-foreground">{vaccine.name}</h3>
                  <p className="text-sm text-muted-foreground mt-2">{vaccine.description}</p>
                  <div className="flex items-center gap-2 mt-3 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Recommended: {vaccine.recommendedAge}</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Vaccines;
