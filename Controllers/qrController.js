const ejs = require("ejs");
const path = require("path");
const Employee = require("../Modals/EmployeeModal");
const generateQrCode = require("../utils/generateQr");
const puppeteer = require("puppeteer");

exports.generateQrPDF = async (req, res) => {
  const { employeeIds, pagesPerEmployee } = req.body;

  try {
    const employees = await Employee.find({ _id: { $in: employeeIds } });

    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    for (const employee of employees) {
      const buffers = [];

      const qrCode = await generateQrCode(
        `http://localhost:3000/qr/${employee._id}`
      );

      const html = await ejs.renderFile(
        path.join(__dirname, "../views/template.ejs"),
        {
          Name: employee.name,
          Email: employee.email,
          Department: employee.department,
          employeeId: employee._id,
          qrCode,
        }
      );

      await page.setContent(html, { waitUntil: "networkidle0" });

      for (let i = 0; i < pagesPerEmployee; i++) {
        const buffer = await page.pdf({ format: "A4" });
        buffers.push(buffer);
      }

      const fullPdf = Buffer.concat(buffers);

      // Save PDF buffer in MongoDB
      employee.qrPdf = fullPdf;
      await employee.save();
    }

    await browser.close();

    res.status(200).json({ message: "QR PDFs generated and stored." });
  } catch (err) {
    console.error(err);
    res.status(500).send("Something went wrong generating QR PDF");
  }
};

exports.renderEmployee = async (req, res) => {
  const employeeId = req.params.id;
  try {
    const employee = await Employee.findById(employeeId);
    const qrCode = await generateQrCode(
      req.protocol + "://" + req.get("host") + req.originalUrl
    );
    res.render("template", {
      Name: employee.name,
      Email: employee.email,
      Department: employee.department,
      employeeId: employee._id,
      qrCode,
    });
  } catch (error) {
    console.error(error);
    res.status(404).send("Employee not found");
  }
};
exports.downloadQrPDF = async (req, res) => {
  const employeeId = req.params.id;

  try {
    const employee = await Employee.findById(employeeId);
    if (!employee || !employee.qrPdf) {
      return res.status(404).send("QR PDF not found");
    }

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=employee_${employeeId}_qr.pdf`,
    });

    res.send(employee.qrPdf);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error downloading QR PDF");
  }
};

