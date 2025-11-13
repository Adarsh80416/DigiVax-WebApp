import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import StatCard from '@/components/StatCard';
import axiosInstance from '@/lib/axios';
import { Users, UserCog, Hospital, Syringe, Calendar, Activity } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';

interface Analytics {
  totalUsers: number;
  totalDoctors: number;
  totalParents: number;
  totalHospitals: number;
  totalVaccines: number;
  totalAppointments: number;
  appointmentsByStatus: { status: string; count: number }[];
  vaccinationCompletion: { status: string; count: number }[];
}

const AdminDashboard = () => {
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await axiosInstance.get('/admin/analytics');
      setData(response.data);
    } catch (error) {
      toast.error('Failed to load analytics');
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

  const statusColors = {
    scheduled: 'hsl(var(--warning))',
    completed: 'hsl(var(--success))',
    cancelled: 'hsl(var(--destructive))',
    missed: 'hsl(var(--destructive))',
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">System-wide analytics and management</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard title="Total Users" value={data?.totalUsers || 0} icon={Users} variant="default" />
          <StatCard title="Doctors" value={data?.totalDoctors || 0} icon={UserCog} variant="default" />
          <StatCard title="Parents" value={data?.totalParents || 0} icon={Users} variant="default" />
          <StatCard title="Hospitals" value={data?.totalHospitals || 0} icon={Hospital} variant="default" />
          <StatCard title="Vaccines" value={data?.totalVaccines || 0} icon={Syringe} variant="success" />
          <StatCard title="Appointments" value={data?.totalAppointments || 0} icon={Calendar} variant="default" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-foreground mb-6">Appointment Status Distribution</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data?.appointmentsByStatus || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="count"
                  label={({ status, percent }) => `${status} ${(percent * 100).toFixed(0)}%`}
                >
                  {(data?.appointmentsByStatus || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={statusColors[entry.status as keyof typeof statusColors] || 'hsl(var(--muted))'} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold text-foreground mb-6">Vaccination Completion</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data?.vaccinationCompletion || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="status" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        <Card className="p-6">
          <h2 className="text-xl font-semibold text-foreground mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { href: '/admin/doctors', label: 'Manage Doctors', icon: UserCog },
              { href: '/admin/hospitals', label: 'Manage Hospitals', icon: Hospital },
              { href: '/admin/vaccines', label: 'Manage Vaccines', icon: Syringe },
              { href: '/admin/appointments', label: 'View Appointments', icon: Calendar },
            ].map((action) => (
              <a
                key={action.href}
                href={action.href}
                className="block p-4 rounded-lg border border-border hover:bg-muted transition-colors"
              >
                <div className="flex items-center gap-3">
                  <action.icon className="h-5 w-5 text-primary" />
                  <p className="font-medium text-foreground">{action.label}</p>
                </div>
              </a>
            ))}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
