import PDFDocument from "pdfkit";
import QRCode from "qrcode";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Generate a vaccination certificate PDF with QR code
 * @param {Object} appointment - Appointment object with populated fields
 * @param {Object} child - Child object
 * @param {Object} doctor - Doctor object
 * @param {Object} hospital - Hospital object
 * @param {Object} vaccine - Vaccine object
 * @param {String} verificationUrl - URL for QR code verification
 * @returns {Promise<String>} Path to generated certificate file
 */
export const generateCertificate = async (
  appointment,
  child,
  doctor,
  hospital,
  vaccine,
  verificationUrl
) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Create certificates directory if it doesn't exist
      const certificatesDir = path.join(__dirname, "../uploads/certificates");
      if (!fs.existsSync(certificatesDir)) {
        fs.mkdirSync(certificatesDir, { recursive: true });
      }
      
      // Generate filename
      const date = new Date().toISOString().split('T')[0].replace(/-/g, '');
      const filename = `${vaccine.name}_${child.name}_${date}.pdf`.replace(/\s+/g, '_');
      const filePath = path.join(certificatesDir, filename);
      
      // Create PDF document
      const doc = new PDFDocument({
        size: "A4",
        margin: 50,
        layout: "portrait"
      });
      
      // Pipe PDF to file
      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);
      
      // Generate QR code
      let qrCodeDataUrl;
      try {
        qrCodeDataUrl = await QRCode.toDataURL(verificationUrl);
      } catch (qrError) {
        console.error("Error generating QR code:", qrError);
        // Continue without QR code if generation fails
      }
      
      // Header
      doc.fontSize(24)
         .font("Helvetica-Bold")
         .fillColor("#1976d2")
         .text("VACCINATION CERTIFICATE", { align: "center" });
      
      doc.moveDown(1);
      
      // Decorative line
      doc.strokeColor("#1976d2")
         .lineWidth(2)
         .moveTo(50, doc.y)
         .lineTo(545, doc.y)
         .stroke();
      
      doc.moveDown(2);
      
      // Certificate content
      doc.fontSize(16)
         .font("Helvetica")
         .fillColor("#000000")
         .text("This is to certify that:", { align: "center" });
      
      doc.moveDown(1.5);
      
      // Child information box
      doc.fontSize(14)
         .font("Helvetica-Bold")
         .fillColor("#1976d2")
         .text("Child Information:", 50, doc.y);
      
      doc.fontSize(12)
         .font("Helvetica")
         .fillColor("#000000")
         .text(`Name: ${child.name}`, 70, doc.y + 20)
         .text(`Date of Birth: ${new Date(child.dateOfBirth).toLocaleDateString()}`, 70, doc.y + 5)
         .text(`Gender: ${child.gender}`, 70, doc.y + 5);
      
      doc.moveDown(1.5);
      
      // Vaccination details box
      doc.fontSize(14)
         .font("Helvetica-Bold")
         .fillColor("#1976d2")
         .text("Vaccination Details:", 50, doc.y);
      
      doc.fontSize(12)
         .font("Helvetica")
         .fillColor("#000000")
         .text(`Vaccine: ${vaccine.name}`, 70, doc.y + 20)
         .text(`Description: ${vaccine.description}`, 70, doc.y + 5)
         .text(`Date Administered: ${new Date(appointment.appointmentDate).toLocaleDateString()}`, 70, doc.y + 5)
         .text(`Time: ${new Date(appointment.appointmentDate).toLocaleTimeString()}`, 70, doc.y + 5);
      
      doc.moveDown(1.5);
      
      // Medical professional information
      doc.fontSize(14)
         .font("Helvetica-Bold")
         .fillColor("#1976d2")
         .text("Administered By:", 50, doc.y);
      
      doc.fontSize(12)
         .font("Helvetica")
         .fillColor("#000000")
         .text(`Doctor: ${doctor.name}`, 70, doc.y + 20)
         .text(`Hospital: ${hospital.name}`, 70, doc.y + 5)
         .text(`Address: ${hospital.address}`, 70, doc.y + 5);
      
      doc.moveDown(2);
      
      // QR Code (if generated)
      if (qrCodeDataUrl) {
        const qrImage = Buffer.from(qrCodeDataUrl.split(",")[1], "base64");
        doc.image(qrImage, 200, doc.y, { width: 150, height: 150 });
        doc.moveDown(2);
        doc.fontSize(10)
           .font("Helvetica")
           .fillColor("#666666")
           .text("Scan QR code to verify this certificate", { align: "center" });
      }
      
      doc.moveDown(2);
      
      // Footer
      doc.fontSize(10)
         .font("Helvetica")
         .fillColor("#666666")
         .text("This certificate is issued by DigiVax Digital Vaccination Management System", { align: "center" })
         .text(`Certificate ID: ${appointment._id}`, { align: "center" })
         .text(`Issued on: ${new Date().toLocaleDateString()}`, { align: "center" });
      
      // Finalize PDF
      doc.end();
      
      // Wait for stream to finish
      stream.on("finish", () => {
        resolve(filePath);
      });
      
      stream.on("error", (error) => {
        reject(error);
      });
    } catch (error) {
      reject(error);
    }
  });
};

export default { generateCertificate };

