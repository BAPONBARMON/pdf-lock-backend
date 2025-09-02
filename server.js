import express from "express";
import cors from "cors";
import multer from "multer";
import { PDFDocument } from "pdf-lib";
import fs from "fs";

const app = express();
const upload = multer({ dest: "uploads/" });

// ✅ Enable CORS for all origins
app.use(cors({ origin: "*" }));

// PDF Lock route
app.post("/lock-pdf", upload.single("pdf"), async (req, res) => {
  try {
    const password = req.body.password;
    if (!password || !req.file) {
      return res.status(400).send("PDF file and password are required.");
    }

    const pdfBytes = fs.readFileSync(req.file.path);

    // Load existing PDF and encrypt
    const pdfDoc = await PDFDocument.load(pdfBytes);
    pdfDoc.encrypt({
      userPassword: password,
      ownerPassword: password,
      permissions: {
        printing: "highResolution",
        modifying: false,
        copying: false,
        annotating: false,
        fillingForms: false,
        contentAccessibility: false,
        documentAssembly: false,
      },
    });

    const lockedPdfBytes = await pdfDoc.save();

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": "attachment; filename=locked.pdf",
    });

    res.send(Buffer.from(lockedPdfBytes));
  } catch (err) {
    console.error("Error locking PDF:", err);
    res.status(500).send("Failed to lock PDF: " + err.message);
  }
});

// Start server
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));
