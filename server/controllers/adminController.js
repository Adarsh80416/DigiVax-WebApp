import User from "../models/User.js";
import Hospital from "../models/Hospital.js";
import Vaccine from "../models/Vaccine.js";
import Appointment from "../models/Appointment.js";
import Child from "../models/Child.js";

// Get all analytics
export const getAnalytics = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalDoctors = await User.countDocuments({ role: "doctor" });
    const totalParents = await User.countDocuments({ role: "parent" });
    const totalChildren = await Child.countDocuments();
    const totalHospitals = await Hospital.countDocuments();
    const totalAppointments = await Appointment.countDocuments();
    const totalVaccines = await Vaccine.countDocuments();
    
    const appointmentsByStatus = await Appointment.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);

    const vaccinationStats = await Child.aggregate([
      { $unwind: "$vaccinationHistory" },
      {
        $group: {
          _id: "$vaccinationHistory.status",
          count: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      totalUsers,
      totalDoctors,
      totalParents,
      totalChildren,
      totalHospitals,
      totalAppointments,
      totalVaccines,
      appointmentsByStatus,
      vaccinationStats
    });
  } catch (error) {
    console.error("Analytics error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Manage Doctors
export const getAllDoctors = async (req, res) => {
  try {
    const doctors = await User.find({ role: "doctor" }).select("-password");
    res.status(200).json(doctors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get pending doctors (not approved)
export const getPendingDoctors = async (req, res) => {
  try {
    const pendingDoctors = await User.find({ 
      role: "doctor", 
      isApproved: false 
    }).select("-password");
    res.status(200).json(pendingDoctors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Approve doctor
export const approveDoctor = async (req, res) => {
  try {
    const { doctorId } = req.params;
    
    const doctor = await User.findById(doctorId);
    
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }
    
    if (doctor.role !== "doctor") {
      return res.status(400).json({ message: "User is not a doctor" });
    }
    
    doctor.isApproved = true;
    await doctor.save();
    
    res.status(200).json({
      message: "Doctor approved successfully",
      doctor: {
        _id: doctor._id,
        name: doctor.name,
        email: doctor.email,
        isApproved: doctor.isApproved
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Reject doctor
export const rejectDoctor = async (req, res) => {
  try {
    const { doctorId } = req.params;
    
    const doctor = await User.findById(doctorId);
    
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }
    
    if (doctor.role !== "doctor") {
      return res.status(400).json({ message: "User is not a doctor" });
    }
    
    doctor.isApproved = false;
    await doctor.save();
    
    res.status(200).json({
      message: "Doctor rejected successfully",
      doctor: {
        _id: doctor._id,
        name: doctor.name,
        email: doctor.email,
        isApproved: doctor.isApproved
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Manage Hospitals
export const createHospital = async (req, res) => {
  try {
    const { name, address, contactInfo } = req.body;

    if (!name || !address) {
      return res.status(400).json({ message: "Name and address are required" });
    }

    const existing = await Hospital.findOne({ name });
    if (existing) {
      return res.status(400).json({ message: "Hospital already exists" });
    }

    const hospital = await Hospital.create({
      name,
      address,
      contactInfo: contactInfo || ""
    });

    return res.status(201).json({
      message: "Hospital created successfully",
      hospital
    });
  } catch (error) {
    console.error("❌ Error creating hospital:", error);
    return res.status(500).json({ message: "Server error while creating hospital" });
  }
};

export const getAllHospitals = async (req, res) => {
  try {
    const hospitals = await Hospital.find().populate("doctorIds");
    res.status(200).json(hospitals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Manage Vaccines
export const createVaccine = async (req, res) => {
  try {
    const { name, description, recommendedAge, dosesRequired } = req.body;
    const vaccine = await Vaccine.create({ name, description, recommendedAge, dosesRequired });
    res.status(201).json({ message: "Vaccine created successfully", vaccine });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllVaccines = async (req, res) => {
  try {
    const vaccines = await Vaccine.find();
    res.status(200).json(vaccines);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all appointments
export const getAllAppointments = async (req, res) => {
  try {
    const status = req.query.status;
    const query = status ? { status } : {};
    
    const appointments = await Appointment.find(query)
      .populate("childId", "name dateOfBirth gender")
      .populate("doctorId", "name email")
      .populate("hospitalId", "name address contactInfo")
      .populate("vaccineId", "name description recommendedAge dosesRequired")
      .sort({ appointmentDate: -1 });
    
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
    console.error("Error fetching admin appointments:", error);
    res.status(500).json({ message: error.message });
  }
};
