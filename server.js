import express from "express";
import cors from "cors";
import multer from "multer";
import fs from "fs";
import { exec } from "child_process";
import path from "path";

const app = express();
const upload = multer({ dest: "uploads/" });

app.use(cors({ origin: "*" }));

app.post("/lock-pdf", upload.single("pdf"), (req, res) => {
  if (!req.file || !req.body.password) {
    return res.status(400).send("PDF file and password required");
  }

  const inputPath = req.file.path;
  const outputPath = path.join("uploads", "locked-" + req.file.originalname);
  const password = req.body.password;

  const cmd = `qpdf --encrypt "${password}" "${password}" 256 -- "${inputPath}" "${outputPath}"`;

  exec(cmd, (error, stdout, stderr) => {
    if (error) {
      console.error("qpdf error:", stderr);
      return res.status(500).send("Failed to lock PDF: " + stderr);
    }

    const fileStream = fs.createReadStream(outputPath);
    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${req.file.originalname}"`
    });
    fileStream.pipe(res);

    fileStream.on("end", () => {
      fs.unlinkSync(inputPath);
      fs.unlinkSync(outputPath);
    });
  });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));
