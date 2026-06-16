const File = require('../models/File');
const upload = require('../config/multer');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
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
      encryptedName: encryptedFileName,
      size: req.file.size,
      mimeType: req.file.mimetype,
      uploadedBy: req.user.id
    });

    res.status(201).json({ message: 'File uploaded!', file });

  } catch (err) {
    res.status(500).json({ message: 'Upload failed', error: err.message });
  }
};


exports.generateShareLink = async (req, res) => {
  try {
    const { fileId } = req.params;
    const { expiresIn, downloadLimit, password } = req.body;

    // File dhundo
    const file = await File.findOne({ _id: fileId, uploadedBy: req.user.id });
    if (!file) return res.status(404).json({ message: 'File not found' });

    // Expiry set karo
    const expiryMap = {
      '1h': 1 * 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000
    };
    const expiresAt = new Date(Date.now() + (expiryMap[expiresIn] || expiryMap['24h']));

    // Password hash karo agar diya ho
    let hashedPassword = null;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    // Token generate karo
    const shareToken = uuidv4();

    // File update karo
    file.shareToken = shareToken;
    file.expiresAt = expiresAt;
    file.downloadLimit = downloadLimit || 1;
    file.password = hashedPassword;
    await file.save();

    const shareLink = `http://localhost:5000/api/files/download/${shareToken}`;

    res.json({ shareLink, expiresAt, shareToken });

  } catch (err) {
    res.status(500).json({ message: 'Error generating link', error: err.message });
  }
};