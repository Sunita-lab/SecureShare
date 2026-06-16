const File = require('../models/File');
const upload = require('../config/multer');
const path = require('path');
const fs = require('fs');
const { encryptFile } = require('../utils/encryption');

exports.uploadFile = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const uploadedPath = req.file.path;
    const encryptedFileName = `enc-${req.file.filename}`;
    const encryptedPath = path.join('uploads', encryptedFileName);

    // Encrypt the file
    await encryptFile(uploadedPath, encryptedPath);
    // Remove the original unencrypted file
    fs.unlinkSync(uploadedPath);
    const file = await File.create({
      originalName: req.file.originalname,
      encryptedName: req.file.filename,
      size: req.file.size,
      mimeType: req.file.mimetype,
      uploadedBy: req.user.id
    });

    res.status(201).json({ message: 'File uploaded!', file });

  } catch (err) {
    res.status(500).json({ message: 'Upload failed', error: err.message });
  }
};