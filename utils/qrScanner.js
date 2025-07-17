const fs = require("fs");
const path = require("path");
const Jimp = require("jimp");
const QrCode = require("qrcode-reader");
const jsQR = require("jsqr");
const { createCanvas, loadImage } = require("@napi-rs/canvas");
const { exec } = require("child_process");

// ----- Utility to log and cleanup -----
const log = (msg) => console.log("🔹", msg);

// ----- Preprocessing + Scan with qrcode-reader -----
const checkQRInImage = async (filePath) => {
  const buffer = fs.readFileSync(filePath);
  const image = await Jimp.read(buffer);

  await image.grayscale().contrast(0.5).resize(500, Jimp.AUTO);

  const qr = new QrCode();
  return new Promise((resolve) => {
    qr.callback = (err, value) => {
      if (err || !value) {
        log("Primary QR scan failed (qrcode-reader)");
        return resolve(null);
      }

      resolve(value.result);
    };
    qr.decode(image.bitmap);
  });
};

// ----- Fallback using jsQR -----
const checkQRWithJsQR = async (filePath) => {
  try {
    const img = await loadImage(filePath);
    const canvas = createCanvas(img.width, img.height);
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);
    const imageData = ctx.getImageData(0, 0, img.width, img.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height);
    if (code) {
      return code.data;
    }
  } catch (error) {
    console.error("❌ jsQR fallback failed:", error);
  }
  return null;
};

// ----- PDF to Image -----
const convertPDFToImage = (pdfPath) => {
  return new Promise((resolve, reject) => {
    const dir = path.dirname(pdfPath);
    const base = path.basename(pdfPath, ".pdf");
    const outputPath = path.join(dir, base + "_page1");
    const cmd = `pdftocairo -jpeg -singlefile -f 1 -l 1 "${pdfPath}" "${outputPath}"`;

    exec(cmd, (error) => {
      if (error) return reject(error);
      resolve(outputPath + ".jpg");
    });
  });
};

// ----- DOCX to PDF -----
const convertDOCXToPDF = (docxPath) => {
  return new Promise((resolve, reject) => {
    const dir = path.dirname(docxPath);
    const isWindows = process.platform === "win32";
    const sofficeCmd = isWindows
      ? `"C:\\Program Files\\LibreOffice\\program\\soffice.exe"`
      : "soffice";
    const cmd = `${sofficeCmd} --headless --convert-to pdf "${docxPath}" --outdir "${dir}"`;

    exec(cmd, (error) => {
      if (error) return reject(error);
      const base = path.basename(docxPath, ".docx").trim();
      resolve(path.join(dir, `${base}.pdf`));
    });
  });
};

// ----- Main QR Check Function -----
const checkQR = async (filePath) => {
  const ext = path.extname(filePath).toLowerCase();

  try {
    let finalImage = null;
    if ([".png", ".jpg", ".jpeg"].includes(ext)) {
      finalImage = filePath;
    } else if (ext === ".pdf") {
      finalImage = await convertPDFToImage(filePath);
    } else if (ext === ".docx") {
      const pdfPath = await convertDOCXToPDF(filePath);
      finalImage = await convertPDFToImage(pdfPath);
      fs.unlinkSync(pdfPath);
    } else {
      log("❌ Unsupported file type: " + ext);
      return null;
    }

    // Try primary QR detection
    let qrData = await checkQRInImage(finalImage);

    // Try fallback if not found
    if (!qrData) {
      qrData = await checkQRWithJsQR(finalImage);
    }

    // Cleanup temp image
    if (ext === ".pdf" || ext === ".docx") {
      fs.unlinkSync(finalImage);
    }

    return qrData;
  } catch (error) {
    console.error("❌ QR scanning failed:", error);
    return null;
  }
};

module.exports = checkQR;
