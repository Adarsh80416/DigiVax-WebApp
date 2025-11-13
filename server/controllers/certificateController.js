import Appointment from "../models/Appointment.js";

const buildPublicUrl = (rawUrl) => {
  if (!rawUrl) return null;
  if (/^https?:\/\//i.test(rawUrl)) {
    return rawUrl;
  }
  const normalizedPath = rawUrl.startsWith("/") ? rawUrl : `/${rawUrl}`;
  const baseUrl = (process.env.BASE_URL || "http://localhost:5000").replace(/\/$/, "");
  return `${baseUrl}${normalizedPath}`;
};

/**
 * Verify vaccination certificate via QR code
 * Returns appointment details for verification
 */
export const verifyCertificate = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    
    const appointment = await Appointment.findById(appointmentId)
      .populate("childId", "name dateOfBirth gender")
      .populate("doctorId", "name email")
      .populate("hospitalId", "name address contactInfo")
      .populate("vaccineId", "name description recommendedAge dosesRequired");
    
    if (!appointment) {
      return res.status(404).json({ 
        message: "Certificate not found or invalid" 
      });
    }
    
    // Only return verification for completed appointments
    if (appointment.status !== "completed") {
      return res.status(400).json({ 
        message: "This appointment has not been completed yet" 
      });
    }
    
    res.status(200).json({
      verified: true,
      message: "Certificate verified successfully",
      appointment: {
        _id: appointment._id,
        child: {
          name: appointment.childId.name,
          dateOfBirth: appointment.childId.dateOfBirth,
          gender: appointment.childId.gender
        },
        vaccine: {
          name: appointment.vaccineId.name,
          description: appointment.vaccineId.description
        },
        doctor: {
          name: appointment.doctorId.name,
          email: appointment.doctorId.email
        },
        hospital: {
          name: appointment.hospitalId.name,
          address: appointment.hospitalId.address
        },
        appointmentDate: appointment.appointmentDate,
        completedAt: appointment.updatedAt,
        certificateUrl: buildPublicUrl(appointment.certificateUrl)
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export default { verifyCertificate };

