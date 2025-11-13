import nodemailer from "nodemailer";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Load .env from root directory
dotenv.config({ path: path.resolve(__dirname, "..", ".env") });

if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  console.error("❌ EMAIL_USER or EMAIL_PASS missing in .env");
} else {
  console.log("✅ Email credentials loaded successfully for:", process.env.EMAIL_USER);
}

// ✅ Gmail transporter (App Password required)
export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
    minVersion: "TLSv1.2",
  },
});

// ✅ Verify transporter on startup
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ Email transporter verification failed:", error);
  } else {
    console.log("✅ Email transporter ready to send messages");
  }
});

// ✅ Send email helper
export const sendEmail = async (to, subject, text) => {
  try {
    const info = await transporter.sendMail({
      from: `"DigiVax System" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
    });
    console.log(`📧 Email sent successfully to ${to}:`, info.response);
    return true;
  } catch (error) {
    console.error("❌ Error sending email:", error);
    throw error;
  }
};
