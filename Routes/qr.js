const express = require("express");
const router = express.Router();
const qrController = require("../Controllers/qrController");

router.post("/generate", qrController.generateQrPDF);
router.get("/all-pdfs", qrController.getAllEmployeePDFs);   
router.get("/:id", qrController.renderEmployee);
 
module.exports = router;
