const express = require("express");
const router = express.Router();
const qrController = require("../Controllers/qrController");

router.post("/generate", qrController.generateQrPDF);
router.get("/:id", qrController.renderEmployee);
router.get("/qr/download/:id", qrController .downloadQrPDF);
module.exports = router;
