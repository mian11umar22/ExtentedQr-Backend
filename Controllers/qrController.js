const ejs = require("ejs");
const path = require("path");
const fs = require("fs");
const Employee = require("../Modals/EmployeeModal");
const generateQrCode = require("../utils/generateQr");
const QRCodeModel = require("../Modals/QRCodeModal");
const puppeteer = require("puppeteer");
const checkQr = require("../utils/qrScanner");

// Generate QR PDFs and save file paths
exports.generateQrPDF = async (req, res) => {
  const { employeeIds, pagesPerEmployee, templateType } = req.body;

  try {
    const employees = await Employee.find({ _id: { $in: employeeIds } });

    const browser = await puppeteer.launch({
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    const pdfPaths = [];

    for (const employee of employees) {
      const templateFile =
        templateType === "qr-only" ? "qr_only_template.ejs" : "template.ejs";

      for (let i = 0; i < pagesPerEmployee; i++) {
        // Construct file name and public file URL
        const filename = `${employee.Name}-${employee.employeeId}-${i + 1}.pdf`;
        const fileUrl = `${req.protocol}://${req.get(
          "host"
        )}/qrcodes/${filename}`;

        // Determine what the QR code should link to
        const qrCodeUrl =
          templateType === "qr-only"
            ? `${req.protocol}://${req.get("host")}/qr/qr-only/${
                employee.employeeId
              }`
            : `${req.protocol}://${req.get("host")}/qr/${employee.employeeId}`;

        const qrCode = await generateQrCode(qrCodeUrl);

        // Render the template
        const html = await ejs.renderFile(
          path.join(__dirname, "../views", templateFile),
          {
            Name: employee.Name,
            Email: employee.Email,
            Department: employee.Department,
            employeeId: employee.employeeId,
            qrCode,
          }
        );

        await page.setContent(html, { waitUntil: "networkidle0" });

        // Generate PDF
        const pdfBuffer = await page.pdf({
          format: "A4",
          printBackground: true,
        });

        const filePath = path.join(__dirname, "../public/qrcodes", filename);
        fs.writeFileSync(filePath, pdfBuffer);
        pdfPaths.push(fileUrl);

        // Save to DB
        await QRCodeModel.findOneAndUpdate(
          { employeeId: employee.employeeId },
          {
            $push: {
              pdfFiles: {
                fileName: filename,
                filePath: fileUrl,
                templateType: templateType,
                qrPointsTo: qrCodeUrl,
              },
            },
          },
          { upsert: true, new: true }
        );
      }
    }

    await browser.close();
    res.json({ files: pdfPaths });
  } catch (err) {
    console.error(err);
    res.status(500).send("Something went wrong generating QR PDF");
  }
};

// Render QR page for default template
exports.renderEmployee = async (req, res) => {
  const employeeId = parseInt(req.params.id);

  if (isNaN(employeeId)) {
    return res.status(400).send("Invalid employee ID");
  }

  // Determine template based on the URL
  const isQrOnly = req.path.startsWith("/qr/qr-only");
  const templateType = isQrOnly ? "qr-only" : "default";

  try {
    const employee = await Employee.findOne({ employeeId });
    if (!employee) return res.status(404).send("Employee not found");

    const qrCodeUrl = isQrOnly
      ? `${req.protocol}://${req.get("host")}/qr/qr-only/${employeeId}`
      : `${req.protocol}://${req.get("host")}/qr/${employeeId}`;

    const qrCode = await generateQrCode(qrCodeUrl);

    const templateFile = isQrOnly ? "qr_only_template" : "Template";

    res.render(templateFile, {
      Name: employee.Name,
      Email: employee.Email,
      Department: employee.Department,
      employeeId: employee.employeeId,
      qrCode,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error rendering template");
  }
};

// Get all employees with their PDF files
exports.getAllEmployeePDFs = async (req, res) => {
  try {
    const qrRecords = await QRCodeModel.find({
      pdfFiles: { $exists: true, $not: { $size: 0 } },
    });

    if (!qrRecords.length) {
      return res.json({ success: true, data: [] });
    }

    const employeeIds = qrRecords.map((qr) => qr.employeeId);
    const employees = await Employee.find({ employeeId: { $in: employeeIds } });

    const qrMap = {};
    qrRecords.forEach((qr) => {
      qrMap[qr.employeeId] = qr.pdfFiles;
    });

    const result = employees.map((emp) => ({
      employeeId: emp.employeeId,
      name: emp.Name,
      email: emp.Email,
      department: emp.Department,
      pdfFiles: qrMap[emp.employeeId] || [],
    }));

    res.json({ success: true, data: result });
  } catch (err) {
    console.error("Error fetching employee PDFs:", err);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch employee PDFs" });
  }
};

// Upload a file and scan QR from it
exports.uploadAndScanQr = async (req, res) => {
  const file = req.file;
  if (!file) {
    return res.status(400).json({ error: "Please upload a file" });
  }

  const filepath = file.path;
  const filetype = file.mimetype;

  const qrdata = await checkQr(filepath, filetype);
  if (qrdata) {
    res.status(200).json({
      message: "QR code found!",
      qrdata: qrdata,
      file: file.filename,
    });
  } else {
    res.status(200).json({
      message: "No QR code found in the file.",
      file: file.filename,
    });
  }
};
