import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";
import {
  getAppointments,
  updateAppointmentStatus,
  getAppointmentsByStatus,
  sendReminder,
  getAvailability,
  setAvailability,
  deleteAvailability,
  uploadPrescription,
  getPrescriptions,
  downloadPrescription
} from "../controllers/doctorController.js";
import { getDoctorDashboard } from "../controllers/dashboardController.js";

const router = express.Router();

router.use(protect(["doctor"]));

router.get("/appointments", getAppointments);
router.get("/appointments/status", getAppointmentsByStatus);
router.put("/appointments/:appointmentId/status", updateAppointmentStatus);
router.post("/reminders", sendReminder);
router.get("/availability", getAvailability);
router.post("/availability", setAvailability);
router.delete("/availability/:availabilityId", deleteAvailability);
router.post("/prescriptions", upload.single("file"), uploadPrescription);
router.get("/prescriptions", getPrescriptions);
router.get("/prescriptions/:prescriptionId/download", downloadPrescription);
router.get("/dashboard", getDoctorDashboard);

export default router;
