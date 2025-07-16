const QRCode = require("qrcode");

async function generateQrCode(data) {
  try {
    return await QRCode.toDataURL(data);
  } catch (error) {
    throw new Error("QR generation failed");
  }
}

module.exports = generateQrCode;
