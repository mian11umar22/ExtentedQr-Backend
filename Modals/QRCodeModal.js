const mongoose = require("mongoose");

const QrCodeSchema = new mongoose.Schema({
  employeeId: {
    type: Number,
    required: true,
    unique: true,
  },
  pdfFiles: [
    {
      fileName: String,
      filePath: String,  
      createdAt: { type: Date, default: Date.now },
    },
  ],
});

module.exports = mongoose.model("QRCode", QrCodeSchema);
