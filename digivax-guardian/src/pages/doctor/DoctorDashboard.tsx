import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import StatCard from '@/components/StatCard';
import axiosInstance from '@/lib/axios';
import { Calendar, CheckCircle2, Clock, XCircle, Syringe } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';

interface DashboardData {
  totalAppointments: number;
  completedAppointments: number;
  scheduledAppointments: number;
  missedAppointments: number;
  cancelledAppointments: number;
  topVaccines: { vaccine: string; count: number }[];
}

const DoctorDashboard = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await axiosInstance.get('/doctors/dashboard');
      setData(response.data);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Overview of your appointments and activities</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Appointments"
            value={data?.totalAppointments || 0}
            icon={Calendar}
            variant="default"
          />
          <StatCard
            title="Completed"
            value={data?.completedAppointments || 0}
            icon={CheckCircle2}
            variant="success"
          />
          <StatCard
            title="Scheduled"
            value={data?.scheduledAppointments || 0}
            icon={Clock}
            variant="warning"
          />
          <StatCard
            title="Missed/Cancelled"
            value={(data?.missedAppointments || 0) + (data?.cancelledAppointments || 0)}
            icon={XCircle}
            variant="destructive"
          />
        </div>

        <Card className="p-6">
          <h2 className="text-xl font-semibold text-foreground mb-6">Top Administered Vaccines</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data?.topVaccines || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="vaccine" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="hsl(var(--primary))" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold text-foreground mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a
              href="/doctor/appointments"
              className="block p-4 rounded-lg border border-border hover:bg-muted transition-colors"
            >
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium text-foreground">View Appointments</p>
                  <p className="text-sm text-muted-foreground">Manage your schedule</p>
                </div>
              </div>
            </a>
            <a
              href="/doctor/availability"
              className="block p-4 rounded-lg border border-border hover:bg-muted transition-colors"
            >
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium text-foreground">Set Availability</p>
                  <p className="text-sm text-muted-foreground">Update your schedule</p>
                </div>
              </div>
            </a>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default DoctorDashboard;
