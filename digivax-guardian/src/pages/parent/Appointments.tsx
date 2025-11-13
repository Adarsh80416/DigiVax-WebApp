import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import axiosInstance from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Calendar as CalendarIcon, Clock, MapPin, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface Appointment {
  _id: string;
  child?: { name: string };
  childId?: { name: string };
  doctor?: { name: string };
  doctorId?: { name: string };
  hospital?: { name: string; address: string };
  hospitalId?: { name: string; address: string };
  vaccine?: { name: string };
  vaccineId?: { name: string };
  appointmentDate?: string;
  status: string;
}

const Appointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [children, setChildren] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [vaccines, setVaccines] = useState<any[]>([]);
  const [isBookOpen, setIsBookOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [formData, setFormData] = useState({
    childId: '',
    doctorId: '',
    hospitalId: '',
    vaccineId: '',
    appointmentDate: '',
  });

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchAppointments(),
        fetchChildren(),
        fetchDoctors(),
        fetchHospitals(),
        fetchVaccines(),
      ]);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const fetchAppointments = async () => {
    try {
      const response = await axiosInstance.get('/parents/appointments');
      setAppointments(response.data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load appointments');
    }
  };

  const fetchChildren = async () => {
    try {
      const response = await axiosInstance.get('/parents/children');
      setChildren(response.data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load children');
    }
  };

  const fetchDoctors = async () => {
    try {
      const response = await axiosInstance.get('/admin/doctors');
      setDoctors(response.data);
    } catch (error: any) {
      console.error('Failed to load doctors:', error);
    }
  };

  const fetchHospitals = async () => {
    try {
      const response = await axiosInstance.get('/admin/hospitals');
      setHospitals(response.data);
    } catch (error: any) {
      console.error('Failed to load hospitals:', error);
    }
  };

  const fetchVaccines = async () => {
    try {
      const response = await axiosInstance.get('/admin/vaccines');
      setVaccines(response.data);
    } catch (error: any) {
      console.error('Failed to load vaccines:', error);
    }
  };

  const handleBookAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setBooking(true);
      // Convert datetime-local format to ISO string if needed
      const payload = {
        ...formData,
        appointmentDate: formData.appointmentDate ? new Date(formData.appointmentDate).toISOString() : formData.appointmentDate,
      };
      await axiosInstance.post('/parents/appointments', payload);
      toast.success('Appointment booked successfully');
      setIsBookOpen(false);
      setFormData({ childId: '', doctorId: '', hospitalId: '', vaccineId: '', appointmentDate: '' });
      await fetchAppointments();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to book appointment');
    } finally {
      setBooking(false);
    }
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
            <p className="text-muted-foreground mt-1">Manage vaccination appointments</p>
          </div>
          <Dialog open={isBookOpen} onOpenChange={setIsBookOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md">
                <Plus className="h-4 w-4 mr-2" />
                Book Appointment
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg bg-white p-6 rounded-lg shadow-lg">
              <DialogHeader>
                <DialogTitle>Book New Appointment</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleBookAppointment} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="child">Child</Label>
                  <select
                    id="child"
                    value={formData.childId}
                    onChange={(e) => setFormData({ ...formData, childId: e.target.value })}
                    className="w-full border border-input rounded-lg px-3 py-2 bg-background"
                    required
                    disabled={booking}
                  >
                    <option value="">Select Child</option>
                    {children.map((child) => (
                      <option key={child._id} value={child._id}>{child.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="doctor">Doctor</Label>
                  <select
                    id="doctor"
                    value={formData.doctorId}
                    onChange={(e) => setFormData({ ...formData, doctorId: e.target.value })}
                    className="w-full border border-input rounded-lg px-3 py-2 bg-background"
                    required
                    disabled={booking}
                  >
                    <option value="">Select Doctor</option>
                    {doctors.map((doctor) => (
                      <option key={doctor._id} value={doctor._id}>{doctor.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hospital">Hospital</Label>
                  <select
                    id="hospital"
                    value={formData.hospitalId}
                    onChange={(e) => setFormData({ ...formData, hospitalId: e.target.value })}
                    className="w-full border border-input rounded-lg px-3 py-2 bg-background"
                    required
                    disabled={booking}
                  >
                    <option value="">Select Hospital</option>
                    {hospitals.map((hospital) => (
                      <option key={hospital._id} value={hospital._id}>{hospital.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vaccine">Vaccine</Label>
                  <select
                    id="vaccine"
                    value={formData.vaccineId}
                    onChange={(e) => setFormData({ ...formData, vaccineId: e.target.value })}
                    className="w-full border border-input rounded-lg px-3 py-2 bg-background"
                    required
                    disabled={booking}
                  >
                    <option value="">Select Vaccine</option>
                    {vaccines.map((vaccine) => (
                      <option key={vaccine._id} value={vaccine._id}>{vaccine.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">Date & Time</Label>
                  <Input
                    id="date"
                    type="datetime-local"
                    value={formData.appointmentDate}
                    onChange={(e) => setFormData({ ...formData, appointmentDate: e.target.value })}
                    required
                    disabled={booking}
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                  disabled={booking}
                >
                  {booking ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Booking...
                    </>
                  ) : (
                    'Book Appointment'
                  )}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {appointments.length === 0 ? (
          <Card className="p-12 text-center bg-white shadow-md rounded-xl">
            <CalendarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">No appointments found</p>
            <Button 
              onClick={() => setIsBookOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
            >
              <Plus className="h-4 w-4 mr-2" />
              Book Your First Appointment
            </Button>
          </Card>
        ) : (
          <div className="grid gap-6">
            {appointments.map((appointment) => {
              const child = appointment.child || appointment.childId;
              const doctor = appointment.doctor || appointment.doctorId;
              const hospital = appointment.hospital || appointment.hospitalId;
              const vaccine = appointment.vaccine || appointment.vaccineId;
              return (
                <Card key={appointment._id} className="p-6 bg-white shadow-md rounded-xl">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">{vaccine?.name || 'Unknown Vaccine'}</h3>
                      <p className="text-muted-foreground">For {child?.name || 'Unknown Child'}</p>
                    </div>
                    {getStatusBadge(appointment.status)}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-start gap-2">
                      <CalendarIcon className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-muted-foreground">Date & Time</p>
                        <p className="font-medium text-foreground">
                          {appointment.appointmentDate ? new Date(appointment.appointmentDate).toLocaleString() : 'N/A'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-muted-foreground">Doctor</p>
                        <p className="font-medium text-foreground">{doctor?.name || 'Unknown Doctor'}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-muted-foreground">Hospital</p>
                        <p className="font-medium text-foreground">{hospital?.name || 'N/A'}</p>
                        <p className="text-xs text-muted-foreground">{hospital?.address || ''}</p>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Appointments;
