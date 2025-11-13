import { NavLink } from '@/components/NavLink';
import { useAuth } from '@/context/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  FileText, 
  Bell, 
  Clock, 
  Hospital, 
  Syringe,
  Baby,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(true);

  const parentLinks = [
    { to: '/parent/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/parent/children', icon: Baby, label: 'Children' },
    { to: '/parent/appointments', icon: Calendar, label: 'Appointments' },
    { to: '/parent/prescriptions', icon: FileText, label: 'Prescriptions' },
  ];

  const doctorLinks = [
    { to: '/doctor/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/doctor/appointments', icon: Calendar, label: 'Appointments' },
    { to: '/doctor/prescriptions', icon: FileText, label: 'Prescriptions' },
    { to: '/doctor/reminders', icon: Bell, label: 'Reminders' },
    { to: '/doctor/availability', icon: Clock, label: 'Availability' },
  ];

  const adminLinks = [
    { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/admin/doctors', icon: Users, label: 'Doctors' },
    { to: '/admin/hospitals', icon: Hospital, label: 'Hospitals' },
    { to: '/admin/vaccines', icon: Syringe, label: 'Vaccines' },
    { to: '/admin/appointments', icon: Calendar, label: 'Appointments' },
  ];

  const links = user?.role === 'parent' ? parentLinks : user?.role === 'doctor' ? doctorLinks : adminLinks;

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden bg-sidebar text-sidebar-foreground p-2 rounded-lg"
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      <aside
        className={`fixed top-0 left-0 h-screen bg-sidebar text-sidebar-foreground transition-transform duration-300 z-40 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } w-64 flex flex-col`}
      >
        <div className="p-6 border-b border-sidebar-border">
          <h1 className="text-2xl font-bold text-sidebar-foreground flex items-center gap-2">
            <Syringe className="h-6 w-6 text-sidebar-primary" />
            DigiVax
          </h1>
          <p className="text-sm text-sidebar-foreground/70 mt-1 capitalize">{user?.role} Portal</p>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-sidebar-foreground/80 hover:bg-sidebar-accent transition-colors"
              activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
            >
              <link.icon className="h-5 w-5" />
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-sidebar-border">
          <div className="mb-3 px-4">
            <p className="text-sm font-medium text-sidebar-foreground">{user?.name}</p>
            <p className="text-xs text-sidebar-foreground/60">{user?.email}</p>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sidebar-foreground/80 hover:bg-destructive hover:text-destructive-foreground transition-colors"
          >
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
