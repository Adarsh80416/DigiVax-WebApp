import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  addChild,
  getChildren,
  getChild,
  bookAppointment,
  getAppointments,
  getPrescriptions,
  downloadPrescription
} from "../controllers/parentController.js";
import { getVaccineRecommendations } from "../controllers/recommendationController.js";
import { getParentDashboard } from "../controllers/dashboardController.js";

const router = express.Router();

router.use(protect(["parent"]));

router.post("/children", addChild);
router.get("/children", getChildren);
router.get("/children/:childId", getChild);
router.get("/children/:childId/recommendations", getVaccineRecommendations);
router.post("/appointments", bookAppointment);
router.get("/appointments", getAppointments);
router.get("/prescriptions", getPrescriptions);
router.get("/prescriptions/:prescriptionId/download", downloadPrescription);
router.get("/dashboard", getParentDashboard);

export default router;
