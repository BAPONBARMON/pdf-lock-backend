const express = require('express');
const multer = require('multer');
const cors = require('cors');
const { PDFDocument } = require('pdf-lib-with-encrypt');

const app = express();
app.use(cors());
const upload = multer({ storage: multer.memoryStorage() });

app.post('/lock-pdf', upload.single('pdf'), async (req, res)=>{
  try {
    const pdfBytes = req.file.buffer;
    const password = req.body.password;
    const pdfDoc = await PDFDocument.load(pdfBytes);

    pdfDoc.encrypt({
      userPassword: password,
      ownerPassword: password,
      permissions: { print:'lowResolution' }
    });

    const lockedPdf = await pdfDoc.save();

    res.set({
      'Content-Type':'application/pdf',
      'Content-Disposition':'attachment; filename=LockedDocument.pdf',
      'Content-Length':lockedPdf.length
    });
    res.send(lockedPdf);
  } catch(e){
    res.status(500).send('Error locking PDF');
  }
});

app.listen(3000, ()=>console.log('Server running at http://localhost:3000'));