import Child from "../models/Child.js";
import Appointment from "../models/Appointment.js";
import User from "../models/User.js";
import Prescription from "../models/Prescription.js";
import fs from "fs";

// Add a child
export const addChild = async (req, res) => {
  try {
    const { name, dateOfBirth, gender } = req.body;
    const parentId = req.user?.userId || req.user?.id;

    const child = await Child.create({
      name,
      dateOfBirth,
      gender,
      parentId
    });

    res.status(201).json({
      message: "Child added successfully",
      child
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all children of a parent
export const getChildren = async (req, res) => {
  try {
    const parentId = req.user?.userId || req.user?.id;
    const children = await Child.find({ parentId }).populate("vaccinationHistory.vaccineId");
    res.status(200).json(children);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single child
export const getChild = async (req, res) => {
  try {
    const { childId } = req.params;
    const child = await Child.findById(childId).populate("vaccinationHistory.vaccineId");
    res.status(200).json(child);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Book an appointment
export const bookAppointment = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    const { childId, doctorId, hospitalId, vaccineId, appointmentDate } = req.body;

    // Validate required fields
    if (!childId || !doctorId || !hospitalId || !vaccineId || !appointmentDate) {
      return res.status(400).json({ 
        message: "Please provide all required fields: childId, doctorId, hospitalId, vaccineId, appointmentDate" 
      });
    }

    // Verify child belongs to the authenticated parent
    const child = await Child.findById(childId);
    if (!child) {
      return res.status(404).json({ message: "Child not found" });
    }

    // Log IDs for debugging
    console.log("Child parentId:", child.parentId?.toString(), "Authenticated parentId:", userId);

    // DEV_MODE bypass (optional)
    if (process.env.DEV_MODE !== "true") {
      if (!child.parentId) {
        return res.status(403).json({ 
          message: "Access denied - Child has no parent assigned" 
        });
      }

      if (child.parentId?.toString() !== userId?.toString()) {
        return res.status(403).json({ 
          message: "Access denied - This child does not belong to you" 
        });
      }
    } else {
      console.warn("⚠️ DEV_MODE active — skipping ownership validation for bookAppointment");
    }

    // Validate appointmentDate is in the future
    const appointmentDateTime = new Date(appointmentDate);
    if (appointmentDateTime < new Date()) {
      return res.status(400).json({ 
        message: "Appointment date must be in the future" 
      });
    }

    const appointment = await Appointment.create({
      childId,
      doctorId,
      hospitalId,
      vaccineId,
      appointmentDate: appointmentDateTime,
      status: "scheduled"
    });

    // Populate appointment for response
    await appointment.populate("childId", "name dateOfBirth gender");
    await appointment.populate("doctorId", "name email");
    await appointment.populate("hospitalId", "name address contactInfo");
    await appointment.populate("vaccineId", "name description recommendedAge dosesRequired");

    res.status(201).json({
      message: "Appointment booked successfully",
      appointment
    });
  } catch (error) {
    console.error("Error booking appointment:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
};

// Get all appointments for parent's children
export const getAppointments = async (req, res) => {
  try {
    const parentId = req.user?.userId || req.user?.id;
    
    // Get all children of the parent
    const children = await Child.find({ parentId });
    const childIds = children.map(child => child._id);
    
    if (childIds.length === 0) {
      return res.status(200).json([]);
    }
    
    const appointments = await Appointment.find({ childId: { $in: childIds } })
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
    console.error("Error fetching parent appointments:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get prescriptions for parent's children
export const getPrescriptions = async (req, res) => {
  try {
    const parentId = req.user?.userId || req.user?.id;
    const { childId, appointmentId } = req.query;
    
    // Get all children of the parent
    const children = await Child.find({ parentId });
    const childIds = children.map(child => child._id);
    
    const query = { parentId };
    if (childId) {
      // Verify child belongs to parent
      if (!childIds.some(id => id.toString() === childId)) {
        return res.status(403).json({ 
          message: "Access denied - This child does not belong to you" 
        });
      }
      query.childId = childId;
    } else {
      query.childId = { $in: childIds };
    }
    
    if (appointmentId) {
      query.appointmentId = appointmentId;
    }
    
    const prescriptions = await Prescription.find(query)
      .populate("appointmentId", "appointmentDate status")
      .populate("childId", "name")
      .populate("doctorId", "name email")
      .sort({ createdAt: -1 });
    
    res.status(200).json(prescriptions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Download prescription (for parents)
export const downloadPrescription = async (req, res) => {
  try {
    const parentId = req.user?.userId || req.user?.id;
    const { prescriptionId } = req.params;
    
    const prescription = await Prescription.findById(prescriptionId);
    
    if (!prescription) {
      return res.status(404).json({ message: "Prescription not found" });
    }
    
    // Verify parent has access
    if (prescription.parentId.toString() !== parentId) {
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
