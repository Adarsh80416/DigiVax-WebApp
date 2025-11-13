import Appointment from "../models/Appointment.js";
import Child from "../models/Child.js";
import User from "../models/User.js";
import DoctorAvailability from "../models/DoctorAvailability.js";
import Hospital from "../models/Hospital.js";
import Prescription from "../models/Prescription.js";
import { sendEmail } from "../utils/emailService.js";
import notificationService from "../utils/notificationService.js";
import certificateGenerator from "../utils/certificateGenerator.js";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

// Get all appointments for a doctor
// export const getAppointments = async (req, res) => {
//   try {
//     const doctorId = req.user?.userId || req.user?.id;
//     const appointments = await Appointment.find({ doctorId })
//       .populate("childId", "name dateOfBirth gender")
//       .populate("doctorId", "name email")
//       .populate("hospitalId", "name address contactInfo")
//       .populate("vaccineId", "name description recommendedAge dosesRequired")
//       .sort({ appointmentDate: 1 });
    
//     console.log(`Populated appointments count: ${appointments.length}`);
    
//     // Verify populated fields are non-null
//     const nullFields = appointments.filter(apt => 
//       !apt.childId || !apt.doctorId || !apt.hospitalId || !apt.vaccineId
//     );
//     if (nullFields.length > 0) {
//       console.warn(`⚠️ Found ${nullFields.length} appointments with null populated fields`);
//     }
    
//     res.status(200).json(appointments);
//   } catch (error) {
//     console.error("Error fetching doctor appointments:", error);
//     res.status(500).json({ message: error.message });
//   }
// };

export const getAppointments = async (req, res) => {
  try {
    const doctorId = req.user?.userId || req.user?.id;

    const appointments = await Appointment.find({ doctorId })
      .populate({
        path: "childId",
        select: "name dateOfBirth gender parentId",
        populate: {
          path: "parentId",
          model: "User",
          select: "name email phone"
        }
      })
      .populate("doctorId", "name email phone")
      .populate("hospitalId", "name address contactInfo")
      .populate("vaccineId", "name description recommendedAge dosesRequired")
      .sort({ appointmentDate: 1 });

    res.status(200).json(appointments);
  } catch (error) {
    console.error("Error fetching doctor appointments:", error);
    res.status(500).json({ message: error.message });
  }
};


// Update appointment status
export const updateAppointmentStatus = async (req, res) => {
  try {
    const doctorId = req.user?.userId || req.user?.id;
    const { appointmentId } = req.params;
    const { status, notes } = req.body;

    // Validate status if provided
    if (status && !["scheduled", "completed", "cancelled", "missed"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    // Find appointment first to verify ownership
    const appointment = await Appointment.findById(appointmentId);
    
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // DEV_MODE bypass (optional)
    if (process.env.DEV_MODE !== "true") {
      // Verify the appointment belongs to the authenticated doctor
      if (appointment.doctorId?.toString() !== doctorId?.toString()) {
        console.warn("Doctor ID mismatch:", { doctorId, appointmentDoctor: appointment.doctorId });
        return res.status(403).json({ 
          message: "Access denied - This appointment does not belong to you" 
        });
      }
    } else {
      console.warn("⚠️ DEV_MODE active — skipping ownership validation for updateAppointmentStatus");
    }

    // Update appointment
    appointment.status = status || appointment.status;
    if (notes !== undefined) {
      appointment.notes = notes;
    }
    await appointment.save();

    // Populate for response
    await appointment.populate("childId", "name dateOfBirth gender");
    await appointment.populate("doctorId", "name email");
    await appointment.populate("hospitalId", "name address contactInfo");
    await appointment.populate("vaccineId", "name description recommendedAge dosesRequired");

    // If status is completed, update child's vaccination history and generate certificate
    if (status === "completed") {
      const childId = appointment.childId._id || appointment.childId;
      const child = await Child.findById(childId);
      if (child) {
        const vaccineId = appointment.vaccineId._id || appointment.vaccineId;
        const existingVaccination = child.vaccinationHistory.find(
          v => v.vaccineId && v.vaccineId.toString() === vaccineId.toString()
        );
        
        if (existingVaccination) {
          existingVaccination.status = "completed";
          existingVaccination.date = new Date();
          existingVaccination.administeredBy = doctorId;
        } else {
          child.vaccinationHistory.push({
            vaccineId: vaccineId,
            status: "completed",
            date: new Date(),
            administeredBy: doctorId
          });
        }
        await child.save();
      }
      
      // Generate certificate if not already generated
      if (!appointment.certificateUrl) {
        try {
          // Get populated data for certificate
          const populatedAppointment = await Appointment.findById(appointmentId)
            .populate("childId", "name dateOfBirth gender")
            .populate("doctorId", "name email")
            .populate("hospitalId", "name address contactInfo")
            .populate("vaccineId", "name description recommendedAge dosesRequired");
          
          const verificationUrl = `${process.env.BASE_URL || "http://localhost:5000"}/api/certificates/verify/${appointmentId}`;
          
          const { publicUrl } = await certificateGenerator.generateCertificate(
            populatedAppointment,
            populatedAppointment.childId,
            populatedAppointment.doctorId,
            populatedAppointment.hospitalId,
            populatedAppointment.vaccineId,
            verificationUrl
          );
          
          // Update appointment with certificate URL
          appointment.certificateUrl = publicUrl;
          await appointment.save();
          
          console.log(`✅ Certificate generated for appointment ${appointmentId}`);
        } catch (certError) {
          console.error(`❌ Error generating certificate:`, certError);
          // Don't fail the request if certificate generation fails
        }
      }
    }

    res.status(200).json({
      message: "Appointment status updated successfully",
      appointment
    });
  } catch (error) {
    console.error("Error updating appointment status:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get appointments by status
export const getAppointmentsByStatus = async (req, res) => {
  try {
    const doctorId = req.user?.userId || req.user?.id;
    const { status } = req.query;
    
    const appointments = await Appointment.find({ 
      doctorId, 
      status: status || "scheduled" 
    })
      .populate("childId", "name dateOfBirth gender")
      .populate("doctorId", "name email")
      .populate("hospitalId", "name address contactInfo")
      .populate("vaccineId", "name description recommendedAge dosesRequired")
      .sort({ appointmentDate: 1 });
    
    console.log(`Populated appointments count: ${appointments.length}`);
    
    // Verify populated fields are non-null
    const nullFields = appointments.filter(apt => 
      !apt.childId || !apt.doctorId || !apt.hospitalId || !apt.vaccineId
    );
    if (nullFields.length > 0) {
      console.warn(`⚠️ Found ${nullFields.length} appointments with null populated fields`);
    }
    
    res.status(200).json(appointments);
  } catch (error) {
    console.error("Error fetching appointments by status:", error);
    res.status(500).json({ message: error.message });
  }
};

// Send reminder email to parent
export const sendReminder = async (req, res) => {
  try {
    const doctorId = req.user?.userId || req.user?.id;
    const { appointmentId, message } = req.body;

    const appointment = await Appointment.findById(appointmentId)
      .populate("childId", "name parentId")
      .populate("doctorId", "name email")
      .populate("hospitalId", "name")
      .populate("vaccineId", "name");

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    const appointmentDoctorId =
      appointment.doctorId?._id?.toString() || appointment.doctorId?.toString();

    if (appointmentDoctorId !== doctorId?.toString()) {
      return res.status(403).json({
        message: "Access denied - This appointment does not belong to you",
      });
    }

    // ✅ Get parent's email
    const parent = await User.findById(appointment.childId.parentId);
    if (!parent || !parent.email) {
      return res.status(404).json({ message: "Parent email not found" });
    }

    const emailText =
      message ||
      `Hello ${appointment.childId.name}, this is a reminder for your vaccination appointment on ${new Date(
        appointment.appointmentDate
      ).toLocaleString()} for ${appointment.vaccineId.name}.`;

    await sendEmail(
      parent.email,
      "Vaccination Appointment Reminder",
      emailText
    );

    appointment.reminderSent = true;
    await appointment.save();

    res.status(200).json({
      message: "Reminder sent successfully",
    });
  } catch (error) {
    console.error("Error sending reminder:", error);
    res.status(500).json({ message: "Error sending reminder", error: error.message });
  }
};

// Get doctor's availability
export const getAvailability = async (req, res) => {
  try {
    const doctorId = req.user?.userId || req.user?.id;
    const { hospitalId } = req.query;
    
    const query = { doctorId };
    if (hospitalId) {
      query.hospitalId = hospitalId;
    }
    
    const availability = await DoctorAvailability.find(query)
      .populate("hospitalId", "name address")
      .sort({ dayOfWeek: 1, startTime: 1 });
    
    res.status(200).json(availability);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add or update availability
export const setAvailability = async (req, res) => {
  try {
    const doctorId = req.user?.userId;
    if (!doctorId) {
      return res.status(401).json({ message: "Unauthorized: doctorId missing" });
    }

    const { hospitalId, dayOfWeek, startTime, endTime, isAvailable } = req.body;

    if (!hospitalId || !dayOfWeek || !startTime || !endTime) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const hospital = await Hospital.findById(hospitalId);
    if (!hospital) {
      return res.status(404).json({ message: "Hospital not found" });
    }

    const normalizedDayOfWeek = dayOfWeek.toLowerCase();

    // Validate time format and logic
    const start = startTime.split(':').map(Number);
    const end = endTime.split(':').map(Number);
    const startMinutes = start[0] * 60 + start[1];
    const endMinutes = end[0] * 60 + end[1];
    
    if (endMinutes <= startMinutes) {
      return res.status(400).json({ 
        message: "End time must be after start time" 
      });
    }

    const existing = await DoctorAvailability.findOne({
      doctorId,
      hospitalId,
      dayOfWeek: normalizedDayOfWeek
    });

    let availability;
    if (existing) {
      existing.startTime = startTime;
      existing.endTime = endTime;
      existing.isAvailable = isAvailable ?? true;
      await existing.save();
      availability = existing;
    } else {
      availability = await DoctorAvailability.create({
        doctorId,
        hospitalId,
        dayOfWeek: normalizedDayOfWeek,
        startTime,
        endTime,
        isAvailable: isAvailable ?? true
      });
    }

    const populatedAvailability = await DoctorAvailability.findById(availability._id)
      .populate("hospitalId", "name address");

    return res.status(201).json({
      message: "Availability set successfully",
      availability: populatedAvailability
    });
  } catch (error) {
    console.error("❌ Error setting availability:", error);
    if (error.code === 11000) {
      return res.status(400).json({ 
        message: "Availability for this hospital and day already exists" 
      });
    }
    return res.status(500).json({ message: "Server error while setting availability" });
  }
};

// Delete availability
export const deleteAvailability = async (req, res) => {
  try {
    const doctorId = req.user?.userId || req.user?.id;
    const { availabilityId } = req.params;
    
    const availability = await DoctorAvailability.findOneAndDelete({
      _id: availabilityId,
      doctorId
    });
    
    if (!availability) {
      return res.status(404).json({ 
        message: "Availability not found or you don't have permission to delete it" 
      });
    }
    
    res.status(200).json({
      message: "Availability deleted successfully"
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Upload prescription
export const uploadPrescription = async (req, res) => {
  try {
    const doctorId = req.user?.userId || req.user?.id;
    const { appointmentId, description } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ message: "Please upload a file" });
    }
    
    if (!appointmentId) {
      // Delete uploaded file if appointmentId is missing
      if (req.file.path) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({ message: "Please provide appointmentId" });
    }
    
    // Verify appointment exists and belongs to doctor
    const appointment = await Appointment.findById(appointmentId)
      .populate("childId");
    
    if (!appointment) {
      // Delete uploaded file
      if (req.file.path) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(404).json({ message: "Appointment not found" });
    }
    
    // Handle both populated and non-populated doctorId
    const appointmentDoctorId = appointment.doctorId?._id?.toString() || appointment.doctorId?.toString();
    if (appointmentDoctorId !== doctorId?.toString()) {
      // Delete uploaded file
      if (req.file.path) {
        fs.unlinkSync(req.file.path);
      }
      console.warn("Doctor ID mismatch:", { doctorId, appointmentDoctor: appointment.doctorId });
      return res.status(403).json({ 
        message: "Access denied - This appointment does not belong to you" 
      });
    }
    
    // Get child and parent info
    const childId = appointment.childId._id || appointment.childId;
    const child = await Child.findById(childId);
    
    if (!child) {
      // Delete uploaded file
      if (req.file.path) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(404).json({ message: "Child not found" });
    }
    
    // Create prescription record
    const prescription = await Prescription.create({
      appointmentId,
      childId: child._id,
      doctorId,
      parentId: child.parentId,
      fileName: req.file.originalname,
      filePath: req.file.path,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      description: description || ""
    });
    
    res.status(201).json({
      message: "Prescription uploaded successfully",
      prescription: {
        _id: prescription._id,
        appointmentId: prescription.appointmentId,
        fileName: prescription.fileName,
        fileSize: prescription.fileSize,
        mimeType: prescription.mimeType,
        description: prescription.description,
        createdAt: prescription.createdAt
      }
    });
  } catch (error) {
    // Delete uploaded file on error
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.error("Error deleting file:", unlinkError);
      }
    }
    res.status(500).json({ message: error.message });
  }
};

// Get prescriptions (for doctors)
export const getPrescriptions = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    const role = req.user?.role || req.user?.userRole || "parent";

    // Try to use a Prescription model if present (optional)
    let records = [];
    try {
      // Prescription may not exist in your schema; if it does, this will get used
      if (typeof Prescription !== "undefined") {
        const query =
          role === "parent"
            ? { parentId: userId }
            : role === "doctor"
            ? { doctorId: userId }
            : {};
        records = await Prescription.find(query)
          .populate("childId", "name dateOfBirth parentId")
          .populate("doctorId", "name email")
          .populate("hospitalId", "name address contactInfo")
          .lean();
      }
    } catch (e) {
      records = [];
    }

    // Fallback: search appointments that include prescription data
    if (!records || records.length === 0) {
      if (role === "parent") {
        // get child ids for this parent
        const children = await Child.find({ parentId: userId }).select("_id").lean();
        const childIds = (children || []).map((c) => c._id);
        records = await Appointment.find({
          childId: { $in: childIds },
          $or: [{ prescriptionUrl: { $exists: true } }, { prescription: { $exists: true } }]
        })
          .populate("childId", "name dateOfBirth parentId")
          .populate("doctorId", "name email")
          .populate("hospitalId", "name address contactInfo")
          .lean();
      } else if (role === "doctor") {
        records = await Appointment.find({
          doctorId: userId,
          $or: [{ prescriptionUrl: { $exists: true } }, { prescription: { $exists: true } }]
        })
          .populate("childId", "name dateOfBirth parentId")
          .populate("doctorId", "name email")
          .populate("hospitalId", "name address contactInfo")
          .lean();
      } else {
        records = [];
      }
    }

    // Sanitize and normalize output so frontend never receives undefined nested objects
    const sanitized = (records || []).map((r) => ({
      _id: r._id || null,
      child: {
        _id: r.childId?._id || r.childId || null,
        name: r.childId?.name || "Unknown child",
        dateOfBirth: r.childId?.dateOfBirth || null
      },
      doctor: {
        _id: r.doctorId?._id || r.doctorId || null,
        name: r.doctorId?.name || "Unknown doctor",
        email: r.doctorId?.email || ""
      },
      hospital: {
        _id: r.hospitalId?._id || r.hospitalId || null,
        name: r.hospitalId?.name || "Unknown hospital",
        address: r.hospitalId?.address || ""
      },
      prescriptionUrl: r.prescriptionUrl || null,
      prescription: r.prescription || null,
      appointmentDate: r.appointmentDate || r.appointmentDate === 0 ? r.appointmentDate : null,
      createdAt: r.createdAt || null
    }));

    return res.status(200).json({ success: true, data: sanitized });
  } catch (error) {
    console.error("Error fetching prescriptions:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch prescriptions" });
  }
};

// Download prescription
export const downloadPrescription = async (req, res) => {
  try {
    const doctorId = req.user?.userId || req.user?.id;
    const { prescriptionId } = req.params;
    
    const prescription = await Prescription.findById(prescriptionId);
    
    if (!prescription) {
      return res.status(404).json({ message: "Prescription not found" });
    }
    
    // Verify doctor has access
    if (prescription.doctorId.toString() !== doctorId) {
      return res.status(403).json({ 
        message: "Access denied - You don't have permission to access this prescription" 
      });
    }
    
    // Check if file exists
    if (!fs.existsSync(prescription.filePath)) {
      return res.status(404).json({ message: "File not found on server" });
    }
    
    // Send file
    res.setHeader("Content-Type", prescription.mimeType);
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${prescription.fileName}"`
    );
    
    const fileStream = fs.createReadStream(prescription.filePath);
    fileStream.pipe(res);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
