import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import axiosInstance from '@/lib/axios';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserCog, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'sonner';

interface Doctor {
  _id: string;
  name: string;
  email: string;
  phone: string;
  isVerified: boolean;
}

const Doctors = () => {
  const [approved, setApproved] = useState<Doctor[]>([]);
  const [pending, setPending] = useState<Doctor[]>([]);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const [approvedRes, pendingRes] = await Promise.all([
        axiosInstance.get('/admin/doctors'),
        axiosInstance.get('/admin/doctors/pending'),
      ]);
      setApproved(approvedRes.data);
      setPending(pendingRes.data);
    } catch (error) {
      toast.error('Failed to load doctors');
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await axiosInstance.put(`/admin/doctors/${id}/approve`);
      toast.success('Doctor approved');
      fetchDoctors();
    } catch (error) {
      toast.error('Failed to approve doctor');
    }
  };

  const handleReject = async (id: string) => {
    try {
      await axiosInstance.put(`/admin/doctors/${id}/reject`);
      toast.success('Doctor rejected');
      fetchDoctors();
    } catch (error) {
      toast.error('Failed to reject doctor');
    }
  };

  const DoctorCard = ({ doctor, showActions = false }: { doctor: Doctor; showActions?: boolean }) => (
    <Card className="p-6">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-full bg-primary/10">
            <UserCog className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">{doctor.name}</h3>
            <p className="text-sm text-muted-foreground">{doctor.email}</p>
            <p className="text-sm text-muted-foreground">{doctor.phone}</p>
            {doctor.isVerified && <Badge className="mt-2">Verified</Badge>}
          </div>
        </div>
        {showActions && (
          <div className="flex gap-2">
            <Button onClick={() => handleApprove(doctor._id)} size="sm" variant="default">
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Approve
            </Button>
            <Button onClick={() => handleReject(doctor._id)} size="sm" variant="destructive">
              <XCircle className="h-4 w-4 mr-2" />
              Reject
            </Button>
          </div>
        )}
      </div>
    </Card>
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Doctors</h1>
          <p className="text-muted-foreground mt-1">Manage doctor registrations and approvals</p>
        </div>

        <Tabs defaultValue="approved" className="space-y-6">
          <TabsList>
            <TabsTrigger value="approved">
              Approved ({approved.length})
            </TabsTrigger>
            <TabsTrigger value="pending">
              Pending Approval ({pending.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="approved" className="space-y-4">
            {approved.map((doctor) => (
              <DoctorCard key={doctor._id} doctor={doctor} />
            ))}
            {approved.length === 0 && (
              <Card className="p-12 text-center">
                <UserCog className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No approved doctors</p>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="pending" className="space-y-4">
            {pending.map((doctor) => (
              <DoctorCard key={doctor._id} doctor={doctor} showActions />
            ))}
            {pending.length === 0 && (
              <Card className="p-12 text-center">
                <UserCog className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No pending approvals</p>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Doctors;
