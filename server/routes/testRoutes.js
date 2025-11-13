import express from "express";
import { sendEmail } from "../utils/emailService.js";

const router = express.Router();

router.get("/email", async (req, res) => {
  try {
    await sendEmail(
      process.env.EMAIL_USER,
      "DigiVax Email Test",
      "Hello Adarsh, your DigiVax email setup works!"
    );
    res.json({ message: "✅ Test email sent successfully!" });
  } catch (error) {
    console.error("Email test failed:", error);
    res.status(500).json({ message: "❌ Email test failed", error: error.message });
  }
});

export default router;

