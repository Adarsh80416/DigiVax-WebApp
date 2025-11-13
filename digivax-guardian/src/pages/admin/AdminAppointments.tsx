import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import axiosInstance from '@/lib/axios';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar, Baby, UserCog, Building2, Syringe, Search, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface Appointment {
  _id: string;
  child?: { name: string };
  childId?: { name: string };
  parent?: { name: string };
  doctor?: { name: string };
  doctorId?: { name: string };
  hospital?: { name: string; address?: string };
  hospitalId?: { name: string; address?: string };
  vaccine?: { name: string };
  vaccineId?: { name: string };
  appointmentDate?: string;
  status: string;
}

const AdminAppointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/admin/appointments');
      setAppointments(response.data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load appointments');
    } finally {
      setLoading(false);
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

  const filteredAppointments = appointments.filter((apt) => {
    const matchesStatus = filter === 'all' || apt.status === filter;
    const childName = (apt.child?.name || apt.childId?.name || '').toLowerCase();
    const doctorName = (apt.doctor?.name || apt.doctorId?.name || '').toLowerCase();
    const parentName = (apt.parent?.name || '').toLowerCase();
    const matchesSearch = searchQuery === '' || 
      childName.includes(searchQuery.toLowerCase()) ||
      doctorName.includes(searchQuery.toLowerCase()) ||
      parentName.includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

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
        <div>
          <h1 className="text-3xl font-bold text-foreground">All Appointments</h1>
          <p className="text-muted-foreground mt-1">System-wide appointment overview</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by doctor or child name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full"
            />
          </div>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-full sm:w-48">
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

        {filteredAppointments.length === 0 ? (
          <Card className="p-12 text-center bg-white shadow-md rounded-xl">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No appointments found</p>
          </Card>
        ) : (
          <Card className="bg-white shadow-md rounded-xl p-4">
            <div className="overflow-x-auto">
              <Table className="w-full text-sm border border-gray-200">
                <TableHeader>
                  <TableRow>
                    <TableHead>Child</TableHead>
                    <TableHead>Doctor</TableHead>
                    <TableHead>Hospital</TableHead>
                    <TableHead>Vaccine</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAppointments.map((appointment) => {
                    const child = appointment.child || appointment.childId;
                    const doctor = appointment.doctor || appointment.doctorId;
                    const hospital = appointment.hospital || appointment.hospitalId;
                    const vaccine = appointment.vaccine || appointment.vaccineId;
                    return (
                      <TableRow key={appointment._id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <Baby className="h-4 w-4 text-muted-foreground" />
                            {child?.name || 'Unknown Child'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <UserCog className="h-4 w-4 text-muted-foreground" />
                            Dr. {doctor?.name || 'Unknown Doctor'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                            {hospital?.name || 'N/A'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Syringe className="h-4 w-4 text-muted-foreground" />
                            {vaccine?.name || 'Unknown Vaccine'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            {appointment.appointmentDate ? new Date(appointment.appointmentDate).toLocaleString() : 'N/A'}
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(appointment.status)}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminAppointments;
