const express = require("express");
const app = express();
const router = express.Router();
router.get("/preview", (req, res) => {
  res.render("Template", {
    Name: "Umar",
    Email: "umar@example.com",
    Department: "Finance",
    employeeId: 1001,
    qrCode: "", // for now keep empty or base64 QR later
  });
});

module.exports = router;
