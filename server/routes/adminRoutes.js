import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getAnalytics,
  getAllDoctors,
  getPendingDoctors,
  approveDoctor,
  rejectDoctor,
  createHospital,
  getAllHospitals,
  createVaccine,
  getAllVaccines,
  getAllAppointments
} from "../controllers/adminController.js";

const router = express.Router();

// Public GET routes - anyone authenticated can view
router.get("/doctors", protect(), getAllDoctors);
router.get("/hospitals", protect(), getAllHospitals);
router.get("/vaccines", protect(), getAllVaccines);

// Admin-only routes
router.get("/analytics", protect(["admin"]), getAnalytics);
router.get("/doctors/pending", protect(["admin"]), getPendingDoctors);
router.put("/doctors/:doctorId/approve", protect(["admin"]), approveDoctor);
router.put("/doctors/:doctorId/reject", protect(["admin"]), rejectDoctor);
router.post("/hospitals", protect(["admin"]), createHospital);
router.post("/vaccines", protect(["admin"]), createVaccine);
router.get("/appointments", protect(["admin"]), getAllAppointments);

export default router;
