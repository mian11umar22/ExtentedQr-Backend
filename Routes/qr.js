const express = require("express");
const router = express.Router();
const qrController = require("../Controllers/qrController");
const upload = require("../Middleware/multer");
router.post("/qr/generate", qrController.generateQrPDF);
router.get("/qr/all-pdfs", qrController.getAllEmployeePDFs);

router.get("/qr/qr-only/:id", qrController.renderEmployee);
router.get("/qr/:id", qrController.renderEmployee);


router.post("/qr/upload", upload.single("file"), qrController.uploadAndScanQr);

module.exports = router;
