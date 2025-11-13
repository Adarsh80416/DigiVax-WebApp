import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";

import Login from "./pages/Login";
import Register from "./pages/Register";
import ParentDashboard from "./pages/parent/ParentDashboard";
import Children from "./pages/parent/Children";
import Appointments from "./pages/parent/Appointments";
import Prescriptions from "./pages/parent/Prescriptions";
import DoctorDashboard from "./pages/doctor/DoctorDashboard";
import DoctorAppointments from "./pages/doctor/DoctorAppointments";
import DoctorPrescriptions from "./pages/doctor/DoctorPrescriptions";
import Reminders from "./pages/doctor/Reminders";
import Availability from "./pages/doctor/Availability";
import AdminDashboard from "./pages/admin/AdminDashboard";
import Doctors from "./pages/admin/Doctors";
import Hospitals from "./pages/admin/Hospitals";
import Vaccines from "./pages/admin/Vaccines";
import AdminAppointments from "./pages/admin/AdminAppointments";
import Certificate from "./pages/Certificate";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/certificate/:appointmentId" element={<Certificate />} />
            
            {/* Parent Routes */}
            <Route
              path="/parent/dashboard"
              element={
                <ProtectedRoute allowedRoles={['parent']}>
                  <ParentDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/parent/children"
              element={
                <ProtectedRoute allowedRoles={['parent']}>
                  <Children />
                </ProtectedRoute>
              }
            />
            <Route
              path="/parent/appointments"
              element={
                <ProtectedRoute allowedRoles={['parent']}>
                  <Appointments />
                </ProtectedRoute>
              }
            />
            <Route
              path="/parent/prescriptions"
              element={
                <ProtectedRoute allowedRoles={['parent']}>
                  <Prescriptions />
                </ProtectedRoute>
              }
            />
            
            {/* Doctor Routes */}
            <Route
              path="/doctor/dashboard"
              element={
                <ProtectedRoute allowedRoles={['doctor']}>
                  <DoctorDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/doctor/appointments"
              element={
                <ProtectedRoute allowedRoles={['doctor']}>
                  <DoctorAppointments />
                </ProtectedRoute>
              }
            />
            <Route
              path="/doctor/prescriptions"
              element={
                <ProtectedRoute allowedRoles={['doctor']}>
                  <DoctorPrescriptions />
                </ProtectedRoute>
              }
            />
            <Route
              path="/doctor/reminders"
              element={
                <ProtectedRoute allowedRoles={['doctor']}>
                  <Reminders />
                </ProtectedRoute>
              }
            />
            <Route
              path="/doctor/availability"
              element={
                <ProtectedRoute allowedRoles={['doctor']}>
                  <Availability />
                </ProtectedRoute>
              }
            />
            
            {/* Admin Routes */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/doctors"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Doctors />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/hospitals"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Hospitals />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/vaccines"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Vaccines />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/appointments"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminAppointments />
                </ProtectedRoute>
              }
            />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
