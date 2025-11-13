import cron from "node-cron";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import Appointment from "../models/Appointment.js";
import User from "../models/User.js";
import Child from "../models/Child.js";

dotenv.config();

// Check for email credentials
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  console.error("❌ Missing EMAIL_USER or EMAIL_PASS in .env — cannot send emails.");
}

// Create nodemailer transporter
export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Verify transporter on startup
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ Email transporter verification failed:", error);
  } else {
    console.log("✅ Email transporter ready to send messages");
  }
});

// Send email function
export const sendEmail = async (to, subject, text, html) => {
  try {
    if (!to || !subject) {
      throw new Error("Email recipient and subject are required");
    }

    // Check if credentials exist
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      throw new Error("Email credentials not configured. Please set EMAIL_USER and EMAIL_PASS in .env");
    }
    
    const info = await transporter.sendMail({
      from: `"DigiVax System" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html
    });
    console.log(`✅ Email sent to ${to}:`, info.response);
    return info;
  } catch (error) {
    console.error(`❌ Error sending email:`, error);
    throw error; // Re-throw so calling code can handle it
  }
};

// Check and send appointment reminders
export const sendAppointmentReminders = async () => {
  try {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const dayAfter = new Date(tomorrow);
    dayAfter.setDate(dayAfter.getDate() + 1);

    // Find appointments scheduled for tomorrow
    const appointments = await Appointment.find({
      appointmentDate: {
        $gte: tomorrow,
        $lt: dayAfter
      },
      status: "scheduled"
    })
      .populate("childId doctorId hospitalId vaccineId");

    for (const appointment of appointments) {
      // Get parent details
      const child = await Child.findById(appointment.childId).populate("parentId", "name email");
      if (!child || !child.parentId || !child.parentId.email) continue;

      const parent = child.parentId;
      const vaccine = appointment.vaccineId;
      const hospital = appointment.hospitalId;

      const subject = "🔔 Vaccine Appointment Reminder - Tomorrow";
      const text = `
Dear ${parent.name},

This is a reminder that your child ${child.name} has a vaccination appointment scheduled for tomorrow.

Vaccine: ${vaccine.name}
Date: ${new Date(appointment.appointmentDate).toLocaleDateString()}
Time: ${new Date(appointment.appointmentDate).toLocaleTimeString()}
Hospital: ${hospital.name}
Address: ${hospital.address}

Please ensure you arrive on time.

Best regards,
DigiVax Team
      `;

      const html = `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2 style="color: #1976d2;">🔔 Vaccine Appointment Reminder</h2>
  <p>Dear ${parent.name},</p>
  <p>This is a reminder that your child <strong>${child.name}</strong> has a vaccination appointment scheduled for <strong>tomorrow</strong>.</p>
  
  <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
    <p><strong>Vaccine:</strong> ${vaccine.name}</p>
    <p><strong>Date:</strong> ${new Date(appointment.appointmentDate).toLocaleDateString()}</p>
    <p><strong>Time:</strong> ${new Date(appointment.appointmentDate).toLocaleTimeString()}</p>
    <p><strong>Hospital:</strong> ${hospital.name}</p>
    <p><strong>Address:</strong> ${hospital.address}</p>
  </div>
  
  <p>Please ensure you arrive on time.</p>
  
  <p>Best regards,<br>DigiVax Team</p>
</div>
      `;

      await sendEmail(parent.email, subject, text, html);
    }

    console.log(`✅ Sent ${appointments.length} appointment reminders`);
  } catch (error) {
    console.error("❌ Error sending appointment reminders:", error);
  }
};

// Schedule daily email check at 9 AM
cron.schedule("0 9 * * *", () => {
  console.log("🕘 Running scheduled appointment reminder check...");
  sendAppointmentReminders();
});

// Default export for backward compatibility
export default { sendAppointmentReminders, sendEmail };
