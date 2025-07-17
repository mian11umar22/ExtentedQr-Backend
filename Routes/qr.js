const express = require("express");
const router = express.Router();
const qrController = require("../Controllers/qrController");
const upload = require("../Middleware/multer");
router.post("/generate", qrController.generateQrPDF);
router.get("/all-pdfs", qrController.getAllEmployeePDFs);
router.get("/:id", qrController.renderEmployee);
router.post("/upload", upload.single("file"), qrController.uploadAndScanQr);

module.exports = router;
