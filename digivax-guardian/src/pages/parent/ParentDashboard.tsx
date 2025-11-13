import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import StatCard from '@/components/StatCard';
import axiosInstance from '@/lib/axios';
import { Baby, Calendar, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { toast } from 'sonner';

interface DashboardData {
  totalChildren: number;
  totalAppointments: number;
  completedVaccines: number;
  upcomingVaccines: number;
  missedVaccines: number;
}

const ParentDashboard = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await axiosInstance.get('/parents/dashboard');
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

  const chartData = [
    { name: 'Completed', value: data?.completedVaccines || 0, color: 'hsl(var(--success))' },
    { name: 'Upcoming', value: data?.upcomingVaccines || 0, color: 'hsl(var(--warning))' },
    { name: 'Missed', value: data?.missedVaccines || 0, color: 'hsl(var(--destructive))' },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Overview of your children's vaccination records</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Children"
            value={data?.totalChildren || 0}
            icon={Baby}
            variant="default"
          />
          <StatCard
            title="Total Appointments"
            value={data?.totalAppointments || 0}
            icon={Calendar}
            variant="default"
          />
          <StatCard
            title="Completed Vaccines"
            value={data?.completedVaccines || 0}
            icon={CheckCircle2}
            variant="success"
          />
          <StatCard
            title="Upcoming Vaccines"
            value={data?.upcomingVaccines || 0}
            icon={Clock}
            variant="warning"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-foreground mb-6">Vaccination Status</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold text-foreground mb-6">Quick Actions</h2>
            <div className="space-y-4">
              <a
                href="/parent/children"
                className="block p-4 rounded-lg border border-border hover:bg-muted transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Baby className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium text-foreground">Manage Children</p>
                    <p className="text-sm text-muted-foreground">Add or view your children's profiles</p>
                  </div>
                </div>
              </a>
              <a
                href="/parent/appointments"
                className="block p-4 rounded-lg border border-border hover:bg-muted transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium text-foreground">Book Appointment</p>
                    <p className="text-sm text-muted-foreground">Schedule a vaccination appointment</p>
                  </div>
                </div>
              </a>
              {data && data.missedVaccines > 0 && (
                <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
                    <div>
                      <p className="font-medium text-destructive">Attention Required</p>
                      <p className="text-sm text-destructive/80">
                        You have {data.missedVaccines} missed vaccination(s). Please book an appointment soon.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ParentDashboard;
