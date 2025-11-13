import cron from "node-cron";
import Appointment from "../models/Appointment.js";
import User from "../models/User.js";
import { sendEmail, transporter } from "../utils/emailService.js";

/**
 * Send appointment reminders 24 hours before scheduled appointments
 * Runs every 15 minutes
 */
export const sendAppointmentReminders = async () => {
  try {
    // Check if email transporter is ready
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.warn("⚠️ Skipping reminder job - Email credentials not configured");
      return;
    }

    // Verify transporter is ready
    try {
      await transporter.verify();
    } catch (error) {
      console.error("❌ Email transporter not ready, skipping reminder job:", error.message);
      return;
    }
    const now = new Date();
    const next24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    
    // Find appointments scheduled in the next 24h with reminderSent: false
    const appointments = await Appointment.find({
      status: "scheduled",
      reminderSent: false,
      appointmentDate: {
        $gte: now,
        $lte: next24Hours
      }
    })
      .populate("childId", "name parentId")
      .populate("doctorId", "name")
      .populate("hospitalId", "name address")
      .populate("vaccineId", "name");
    
    for (const appointment of appointments) {
      try {
        // Get parent details via child's parentId
        const parent = await User.findById(appointment.childId.parentId);
        if (!parent || !parent.email) {
          console.warn(`⚠️ Parent email not found for appointment ${appointment._id}`);
          continue;
        }
        
        const child = appointment.childId;
        const doctor = appointment.doctorId;
        const hospital = appointment.hospitalId;
        const vaccine = appointment.vaccineId;
        
        // Format appointment date
        const appointmentDate = new Date(appointment.appointmentDate);
        const dateStr = appointmentDate.toLocaleDateString();
        const timeStr = appointmentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        // Prepare email text
        const subject = "🔔 Vaccination Appointment Reminder";
        const text = `Dear ${parent.name},

This is a reminder that your child ${child.name} has a vaccination appointment scheduled.

Appointment Details:
- Child: ${child.name}
- Vaccine: ${vaccine.name}
- Date: ${dateStr}
- Time: ${timeStr}
- Hospital: ${hospital.name}
- Address: ${hospital.address}
- Doctor: ${doctor.name}

Please ensure you arrive on time.

Best regards,
DigiVax Team`;
        
        // Send email using emailService
        await sendEmail(parent.email, subject, text);
        
        // Mark reminder as sent
        appointment.reminderSent = true;
        await appointment.save();
        
        console.log(`✅ Reminder sent for appointment ${appointment._id} to ${parent.email}`);
      } catch (error) {
        console.error(`❌ Error sending reminder for appointment ${appointment._id}:`, error);
      }
    }
    
    if (appointments.length > 0) {
      console.log(`✅ Sent ${appointments.length} appointment reminders`);
    }
  } catch (error) {
    console.error("❌ Error in reminder job:", error);
  }
};

// Schedule job to run every 15 minutes
cron.schedule("*/15 * * * *", () => {
  console.log("🕘 Running scheduled appointment reminder check...");
  sendAppointmentReminders();
});

console.log("✅ Appointment reminder job scheduled (runs every 15 minutes)");

export default { sendAppointmentReminders };

