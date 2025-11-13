import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import axiosInstance from '@/lib/axios';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Bell, Send, Calendar, Baby, Syringe, Building2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface Appointment {
  _id: string;
  child?: {
    name: string;
    dateOfBirth: string;
    parentId?: {
      name: string;
      email?: string;
      phone?: string;
    };
  };
  childId?: {
    name: string;
    dateOfBirth: string;
    parentId?: {
      name: string;
      email?: string;
      phone?: string;
    };
  };
  parent?: { name: string; email?: string };
  hospital?: { name: string; address?: string };
  hospitalId?: { name: string; address?: string };
  vaccine?: { name: string };
  vaccineId?: { name: string };
  appointmentDate?: string;
  status: string;
}


const Reminders = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

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

  const handleSendReminder = async () => {
    if (!selectedAppointment || !message.trim()) {
      toast.error('Please enter a message');
      return;
    }

    try {
      setSending(true);
      await axiosInstance.post('/doctors/reminders', {
        appointmentId: selectedAppointment._id,
        message: message.trim(),
      });
      toast.success('Reminder sent successfully');
      setIsModalOpen(false);
      setSelectedAppointment(null);
      setMessage('');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to send reminder');
    } finally {
      setSending(false);
    }
  };

  const openReminderModal = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    const child = appointment.child || appointment.childId;
    const vaccine = appointment.vaccine || appointment.vaccineId;
    const childName = child?.name || 'your child';
    const vaccineName = vaccine?.name || 'vaccination';
    const dateStr = appointment.appointmentDate ? new Date(appointment.appointmentDate).toLocaleDateString() : 'the scheduled date';
    setMessage(`Please bring your child ${childName} on ${dateStr} for the ${vaccineName} vaccination.`);
    setIsModalOpen(true);
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
        <div>
          <h1 className="text-3xl font-bold text-foreground">Reminders</h1>
          <p className="text-muted-foreground mt-1">Send appointment reminders to parents</p>
        </div>

        {appointments.length === 0 ? (
          <Card className="p-12 text-center bg-white shadow-md rounded-xl">
            <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No appointments found</p>
          </Card>
        ) : (
          <Card className="bg-white shadow-md rounded-xl p-4">
            <div className="overflow-x-auto">
              <Table className="w-full text-sm border border-gray-200">
                <TableHeader>
                  <TableRow>
                    <TableHead>Child</TableHead>
                    <TableHead>Parent</TableHead>
                    <TableHead>Hospital</TableHead>
                    <TableHead>Vaccine</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {appointments.map((appointment) => {
                    const child = appointment.child || appointment.childId;
                    const parent = child?.parentId;
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

                        <TableCell>{parent?.name || 'Unknown Parent'}</TableCell>

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
                            {appointment.appointmentDate
                              ? new Date(appointment.appointmentDate).toLocaleString()
                              : 'N/A'}
                          </div>
                        </TableCell>

                        <TableCell>{getStatusBadge(appointment.status)}</TableCell>

                        <TableCell>
                          <Button
                            onClick={() => openReminderModal(appointment)}
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                          >
                            <Send className="h-4 w-4 mr-2" />
                            Send Reminder
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>

              </Table>
            </div>
          </Card>
        )}

        {/* Send Reminder Modal */}
        <Dialog open={isModalOpen} onOpenChange={(open) => {
          setIsModalOpen(open);
          if (!open) {
            setSelectedAppointment(null);
            setMessage('');
          }
        }}>
          <DialogContent className="bg-white p-6 rounded-lg shadow-lg w-[400px] max-w-[90vw]">
            <DialogHeader>
              <DialogTitle>Send Appointment Reminder</DialogTitle>
            </DialogHeader>
            {selectedAppointment && (() => {
              const child = selectedAppointment.child || selectedAppointment.childId;
              const hospital = selectedAppointment.hospital || selectedAppointment.hospitalId;
              const vaccine = selectedAppointment.vaccine || selectedAppointment.vaccineId;
              return (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Appointment Details</Label>
                    <div className="p-3 bg-muted rounded-md text-sm">
                      <p><strong>Child:</strong> {child?.name || 'Unknown Child'}</p>
                      <p><strong>Vaccine:</strong> {vaccine?.name || 'Unknown Vaccine'}</p>
                      <p><strong>Date:</strong> {selectedAppointment.appointmentDate ? new Date(selectedAppointment.appointmentDate).toLocaleString() : 'N/A'}</p>
                      <p><strong>Hospital:</strong> {hospital?.name || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Reminder Message</Label>
                    <Textarea
                      id="message"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Enter reminder message"
                      rows={4}
                      className="w-full"
                    />
                  </div>
                  <Button
                    onClick={handleSendReminder}
                    disabled={sending || !message.trim()}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                  >
                    {sending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Send Reminder
                      </>
                    )}
                  </Button>
                </div>
              );
            })()}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default Reminders;
