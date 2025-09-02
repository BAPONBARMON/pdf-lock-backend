const express = require("express");
const multer = require("multer");
const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

const app = express();
const upload = multer({ dest: "uploads/" });
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("✅ PDF Locker Backend Running...");
});

app.post("/lock", upload.single("pdf"), (req, res) => {
  if (!req.file) {
    return res.status(400).send("❌ No PDF uploaded");
  }

  const password = req.body.password;
  if (!password) {
    return res.status(400).send("❌ Password required");
  }

  const inputPath = req.file.path;
  const outputPath = path.join("uploads", `locked-${Date.now()}.pdf`);

  // qpdf command for password protection
  const cmd = `qpdf --encrypt ${password} ${password} 256 -- ${inputPath} ${outputPath}`;

  exec(cmd, (err) => {
    if (err) {
      console.error("Encryption error:", err);
      return res.status(500).send("❌ Error encrypting PDF");
    }

    res.download(outputPath, "locked.pdf", (downloadErr) => {
      if (downloadErr) {
        console.error("Download error:", downloadErr);
      }

      // cleanup
      fs.unlinkSync(inputPath);
      fs.unlinkSync(outputPath);
    });
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
