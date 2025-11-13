import express from "express";
import { verifyCertificate } from "../controllers/certificateController.js";

const router = express.Router();

// Public route - no authentication required for QR code verification
router.get("/verify/:appointmentId", verifyCertificate);

export default router;

