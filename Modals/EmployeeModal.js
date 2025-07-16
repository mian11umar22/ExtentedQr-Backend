const mongoose = require("mongoose");
const EmployeeSchema = new mongoose.Schema({
  employeeId: {
    type: Number,
    required: true,
  },
  Name: {
    type: String,
    required: true,
  },
  Email: {
    type: String,
    required: true,
  },
  Department: {
    type: String,
    required: true,
  },
    qrPdf: Buffer,
});
module.exports = mongoose.model("Employees", EmployeeSchema);
