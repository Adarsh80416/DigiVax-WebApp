import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import axiosInstance from '@/lib/axios';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Calendar, Baby, Syringe, Building2, Loader2 } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface Appointment {
  _id: string;
  child?: { name: string; dateOfBirth: string };
  childId?: { name: string; dateOfBirth: string };
  parent?: { name: string };
  hospital?: { name: string; address?: string };
  hospitalId?: { name: string; address?: string };
  vaccine?: { name: string };
  vaccineId?: { name: string };
  appointmentDate?: string;
  status: string;
}

const DoctorAppointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState<string | null>(null);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [notes, setNotes] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/doctors/appointments');
      setAppointments(response.data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!selectedAppointment || !newStatus) return;

    try {
      setUpdating(true);
      const payload: { status: string; notes?: string } = { status: newStatus };
      if (notes.trim()) {
        payload.notes = notes.trim();
      }
      await axiosInstance.put(`/doctors/appointments/${selectedAppointment}/status`, payload);
      toast.success('Appointment status updated successfully');
      setStatusModalOpen(false);
      setSelectedAppointment(null);
      setNewStatus('');
      setNotes('');
      fetchAppointments();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const openStatusModal = (appointmentId: string, currentStatus: string) => {
    setSelectedAppointment(appointmentId);
    setNewStatus(currentStatus);
    setNotes('');
    setStatusModalOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      scheduled: 'secondary',
      completed: 'default',
      cancelled: 'destructive',
      missed: 'destructive',
    };
    return <Badge variant={variants[status] || 'outline'}>{status}</Badge>;
  };

  const filteredAppointments = filter === 'all' 
    ? appointments 
    : appointments.filter(apt => apt.status === filter);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Appointments</h1>
            <p className="text-muted-foreground mt-1">Manage your patient appointments</p>
          </div>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Appointments</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
              <SelectItem value="missed">Missed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-6">
          {filteredAppointments.map((appointment) => {
            const child = appointment.child || appointment.childId;
            const hospital = appointment.hospital || appointment.hospitalId;
            const vaccine = appointment.vaccine || appointment.vaccineId;
            return (
              <Card key={appointment._id} className="p-6 bg-white shadow-md rounded-xl">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-primary/10">
                      <Baby className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">{child?.name || 'Unknown Child'}</h3>
                      <p className="text-sm text-muted-foreground">
                        Parent: {appointment.parent?.name || 'Unknown Parent'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        DOB: {child?.dateOfBirth ? new Date(child.dateOfBirth).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(appointment.status)}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Syringe className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium text-foreground">{vaccine?.name || 'Unknown Vaccine'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span className="text-foreground">{hospital?.name || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-foreground">
                      {appointment.appointmentDate ? new Date(appointment.appointmentDate).toLocaleString() : 'N/A'}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 pt-4 border-t border-border">
                  <Button
                    onClick={() => openStatusModal(appointment._id, appointment.status)}
                    size="sm"
                    variant="default"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                  >
                    Update Status
                  </Button>
                </div>
              </Card>
            );
          })}
          {filteredAppointments.length === 0 && (
            <Card className="p-12 text-center bg-white shadow-md rounded-xl">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No appointments found</p>
            </Card>
          )}
        </div>

        {/* Status Update Modal */}
        <Dialog open={statusModalOpen} onOpenChange={(open) => {
          setStatusModalOpen(open);
          if (!open) {
            setSelectedAppointment(null);
            setNewStatus('');
            setNotes('');
          }
        }}>
          <DialogContent className="bg-white p-6 rounded-lg shadow-lg w-[400px]">
            <DialogHeader>
              <DialogTitle>Update Appointment Status</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="missed">Missed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any additional notes..."
                  rows={3}
                  className="w-full"
                />
              </div>
              <Button
                onClick={handleStatusUpdate}
                disabled={updating || !newStatus}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
              >
                {updating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Status'
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default DoctorAppointments;
