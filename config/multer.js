const fs = require("fs");
const path = require("path");

const multer = require("multer");

const uploadDirectory = path.join(__dirname, "..", "uploads");

if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, { recursive: true });
}

const allowedMimeTypes = [
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
];

const allowedExtensions = [".pdf", ".jpg", ".jpeg", ".png"];

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log("[MULTER] Upload destination resolved", {
      applicationId: req.params.applicationId,
      documentType: req.params.documentType,
      destination: uploadDirectory,
    });
    cb(null, uploadDirectory);
  },
  filename: (req, file, cb) => {
    const safeDocumentType = (req.params.documentType || "document")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    const extension = path.extname(file.originalname).toLowerCase();
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const generatedFileName = `${safeDocumentType}-${uniqueSuffix}${extension}`;

    console.log("[MULTER] File name generated", {
      applicationId: req.params.applicationId,
      documentType: req.params.documentType,
      originalFileName: file.originalname,
      generatedFileName,
      mimeType: file.mimetype,
    });

    cb(null, generatedFileName);
  },
});

const fileFilter = (req, file, cb) => {
  const extension = path.extname(file.originalname).toLowerCase();
  const isMimeTypeValid = allowedMimeTypes.includes(file.mimetype);
  const isExtensionValid = allowedExtensions.includes(extension);

  if (!isMimeTypeValid || !isExtensionValid) {
    const error = new Error(
      "Invalid file type. Only PDF, JPG, JPEG, and PNG files are allowed."
    );
    error.statusCode = 400;
    return cb(error);
  }

  console.log("[MULTER] File validated", {
    applicationId: req.params.applicationId,
    documentType: req.params.documentType,
    originalFileName: file.originalname,
    mimeType: file.mimetype,
    extension,
  });

  return cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

module.exports = upload;
