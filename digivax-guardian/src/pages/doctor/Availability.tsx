import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import axiosInstance from '@/lib/axios';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Clock, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface AvailabilitySlot {
  _id: string;
  day: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

const Availability = () => {
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [formData, setFormData] = useState({
    day: 'Monday',
    startTime: '',
    endTime: '',
    isAvailable: true,
  });

  useEffect(() => {
    fetchAvailability();
  }, []);

  const fetchAvailability = async () => {
    try {
      const response = await axiosInstance.get('/doctors/availability');
      setSlots(response.data);
    } catch (error) {
      toast.error('Failed to load availability');
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axiosInstance.post('/doctors/availability', formData);
      toast.success('Availability added');
      setIsAddOpen(false);
      setFormData({ day: 'Monday', startTime: '', endTime: '', isAvailable: true });
      fetchAvailability();
    } catch (error) {
      toast.error('Failed to add availability');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await axiosInstance.delete(`/doctors/availability/${id}`);
      toast.success('Availability removed');
      fetchAvailability();
    } catch (error) {
      toast.error('Failed to delete availability');
    }
  };

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Availability</h1>
            <p className="text-muted-foreground mt-1">Manage your weekly schedule</p>
          </div>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Slot
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Availability Slot</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAdd} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="day">Day</Label>
                  <select
                    id="day"
                    value={formData.day}
                    onChange={(e) => setFormData({ ...formData, day: e.target.value })}
                    className="w-full border border-input rounded-lg px-3 py-2 bg-background"
                  >
                    {days.map((day) => (
                      <option key={day} value={day}>{day}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="start">Start Time</Label>
                  <Input
                    id="start"
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end">End Time</Label>
                  <Input
                    id="end"
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    required
                  />
                </div>
                <Button type="submit" className="w-full">Add Availability</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4">
          {days.map((day) => (
            <Card key={day} className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">{day}</h3>
              <div className="space-y-2">
                {slots
                  .filter((slot) => slot.day === day)
                  .map((slot) => (
                    <div key={slot._id} className="flex items-center justify-between p-3 rounded-lg bg-muted">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-foreground">
                          {slot.startTime} - {slot.endTime}
                        </span>
                      </div>
                      <Button
                        onClick={() => handleDelete(slot._id)}
                        variant="ghost"
                        size="sm"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                {slots.filter((slot) => slot.day === day).length === 0 && (
                  <p className="text-sm text-muted-foreground">No availability set</p>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Availability;
