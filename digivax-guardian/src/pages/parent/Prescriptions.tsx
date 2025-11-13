import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import axiosInstance from '@/lib/axios';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Download, Calendar } from 'lucide-react';
import { toast } from 'sonner';

interface Prescription {
  _id: string;
  childId?: { _id?: string; name?: string };
  doctorId?: { _id?: string; name?: string; email?: string };
  appointmentId?: { _id?: string; appointmentDate?: string; status?: string };
  notes?: string;
  description?: string;
  fileName?: string;
  createdAt: string;
}

const Prescriptions = () => {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const fetchPrescriptions = async () => {
    try {
      const response = await axiosInstance.get('/parents/prescriptions');
      setPrescriptions(response.data);
    } catch (error) {
      toast.error('Failed to load prescriptions');
    }
  };

  const handleDownload = async (id: string) => {
    try {
      const response = await axiosInstance.get(`/parents/prescriptions/${id}/download`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `prescription-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Prescription downloaded successfully');
    } catch (error) {
      toast.error('Failed to download prescription');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Prescriptions</h1>
          <p className="text-muted-foreground mt-1">View and download medical prescriptions</p>
        </div>

        <div className="grid gap-6">
          {prescriptions.map((prescription) => (
            <Card key={prescription._id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">
                      Prescription for {prescription.childId?.name || 'Unknown Child'}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Dr. {prescription.doctorId?.name || 'Unknown Doctor'}
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      {prescription.notes || prescription.description || 'No notes provided'}
                    </p>
                  </div>
                </div>
                <Button onClick={() => handleDownload(prescription._id)} variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                {new Date(prescription.createdAt).toLocaleDateString()}
              </div>
            </Card>
          ))}
          {prescriptions.length === 0 && (
            <Card className="p-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No prescriptions found</p>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Prescriptions;
