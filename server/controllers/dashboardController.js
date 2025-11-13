import Appointment from "../models/Appointment.js";
import Child from "../models/Child.js";
import Vaccine from "../models/Vaccine.js";
import { getVaccineStatus } from "../utils/vaccineScheduler.js";

/**
 * Get doctor dashboard analytics
 */
export const getDoctorDashboard = async (req, res) => {
  try {
    const doctorId = req.user.userId;
    
    // Get all appointments for this doctor
    const appointments = await Appointment.find({ doctorId })
      .populate("vaccineId", "name");
    
    // Calculate statistics
    const totalAppointments = appointments.length;
    const completed = appointments.filter(a => a.status === "completed").length;
    const scheduled = appointments.filter(a => a.status === "scheduled").length;
    const missed = appointments.filter(a => a.status === "missed").length;
    const cancelled = appointments.filter(a => a.status === "cancelled").length;
    
    // Get top vaccines
    const vaccineCounts = {};
    appointments.forEach(appointment => {
      if (appointment.vaccineId && appointment.status === "completed") {
        const vaccineName = appointment.vaccineId.name;
        vaccineCounts[vaccineName] = (vaccineCounts[vaccineName] || 0) + 1;
      }
    });
    
    const topVaccines = Object.entries(vaccineCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    
    res.status(200).json({
      totalAppointments,
      completed,
      scheduled,
      missed,
      cancelled,
      topVaccines
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get parent dashboard analytics
 */
export const getParentDashboard = async (req, res) => {
  try {
    const parentId = req.user.userId;
    
    // Get all children of the parent
    const children = await Child.find({ parentId }).populate("vaccinationHistory.vaccineId");
    const childIds = children.map(child => child._id);
    
    // Get all appointments for parent's children
    const appointments = await Appointment.find({ childId: { $in: childIds } });
    
    // Get all vaccines
    const vaccines = await Vaccine.find();
    
    // Calculate vaccine statuses across all children
    let completedVaccines = 0;
    let upcomingVaccines = 0;
    let missedVaccines = 0;
    
    children.forEach(child => {
      vaccines.forEach(vaccine => {
        const status = getVaccineStatus(
          child.dateOfBirth,
          vaccine.recommendedAge,
          child.vaccinationHistory || [],
          vaccine._id
        );
        
        if (status.status === "completed") {
          completedVaccines++;
        } else if (status.status === "upcoming") {
          upcomingVaccines++;
        } else if (status.status === "missed") {
          missedVaccines++;
        }
      });
    });
    
    // Calculate appointment statistics
    const totalAppointments = appointments.length;
    const completedAppointments = appointments.filter(a => a.status === "completed").length;
    const scheduledAppointments = appointments.filter(a => a.status === "scheduled").length;
    const missedAppointments = appointments.filter(a => a.status === "missed").length;
    
    res.status(200).json({
      totalChildren: children.length,
      totalAppointments,
      completedAppointments,
      scheduledAppointments,
      missedAppointments,
      completedVaccines,
      upcomingVaccines,
      missedVaccines
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export default { getDoctorDashboard, getParentDashboard };

