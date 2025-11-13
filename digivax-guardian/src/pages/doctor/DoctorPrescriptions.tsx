import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import axiosInstance from '@/lib/axios';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { FileText, Upload, Download, Plus } from 'lucide-react';
import { toast } from 'sonner';

interface Prescription {
  _id: string;
  child?: { name?: string };
  parent?: { name?: string };
  notes?: string;
  fileUrl?: string;
  createdAt?: string;
}

const DoctorPrescriptions = () => {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    appointmentId: '',
    notes: '',
  });
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    fetchPrescriptions();
    fetchAppointments();
  }, []);

  const fetchPrescriptions = async () => {
    try {
      const response = await axiosInstance.get('/doctors/prescriptions');
      setPrescriptions(response.data || []);
    } catch (error) {
      console.error('Error loading prescriptions:', error);
      toast.error('Failed to load prescriptions');
    }
  };

  const fetchAppointments = async () => {
    try {
      const response = await axiosInstance.get('/doctors/appointments');
      const data = response.data || [];
      setAppointments(data.filter((apt: any) => apt.status === 'completed'));
    } catch (error) {
      console.error('Failed to load appointments:', error);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.error('Please select a file');
      return;
    }

    const data = new FormData();
    data.append('appointmentId', formData.appointmentId);
    data.append('notes', formData.notes);
    data.append('file', file);

    try {
      await axiosInstance.post('/doctors/prescriptions', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Prescription uploaded successfully');
      setIsUploadOpen(false);
      setFormData({ appointmentId: '', notes: '' });
      setFile(null);
      fetchPrescriptions();
    } catch (error) {
      console.error('Error uploading prescription:', error);
      toast.error('Failed to upload prescription');
    }
  };

  const handleDownload = async (id: string) => {
    try {
      const response = await axiosInstance.get(`/doctors/prescriptions/${id}/download`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `prescription-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Prescription downloaded');
    } catch (error) {
      console.error('Error downloading prescription:', error);
      toast.error('Failed to download prescription');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Prescriptions</h1>
            <p className="text-muted-foreground mt-1">Upload and manage patient prescriptions</p>
          </div>
          <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Upload Prescription
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload New Prescription</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleUpload} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="appointment">Appointment</Label>
                  <select
                    id="appointment"
                    value={formData.appointmentId}
                    onChange={(e) => setFormData({ ...formData, appointmentId: e.target.value })}
                    className="w-full border border-input rounded-lg px-3 py-2 bg-background"
                    required
                  >
                    <option value="">Select Appointment</option>
                    {appointments.map((apt) => (
                      <option key={apt._id} value={apt._id}>
                        {apt.child?.name || 'Unknown Child'} - {apt.vaccine?.name || 'Unknown Vaccine'}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Add prescription notes"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="file">File</Label>
                  <Input
                    id="file"
                    type="file"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    required
                  />
                </div>

                <Button type="submit" className="w-full">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Prescription Cards */}
        <div className="grid gap-6">
          {prescriptions.length === 0 ? (
            <p className="text-muted-foreground text-center mt-4">No prescriptions found.</p>
          ) : (
            prescriptions.map((prescription) => (
              <Card key={prescription._id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-primary/10">
                      <FileText className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">
                        Prescription for {prescription.child?.name || 'Unknown Child'}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Parent: {prescription.parent?.name || 'Unknown Parent'}
                      </p>
                      <p className="text-sm text-muted-foreground mt-2">
                        {prescription.notes || 'No notes provided'}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {prescription.createdAt
                          ? new Date(prescription.createdAt).toLocaleDateString()
                          : 'No Date'}
                      </p>
                    </div>
                  </div>
                  {prescription.fileUrl && (
                    <Button
                      onClick={() => handleDownload(prescription._id)}
                      variant="outline"
                      size="sm"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  )}
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DoctorPrescriptions;
