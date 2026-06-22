const File = require('../models/File');
const upload = require('../config/multer');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');
const { encryptFile, decryptFile, uploadToGridFS, downloadFromGridFS, deleteFromGridFS } = require('../utils/encryption');
const axios = require('axios');

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
    // Upload the encrypted file to GridFS
    await uploadToGridFS(encryptedPath, encryptedFileName);
    // Remove the encrypted file from local storage
    fs.unlinkSync(encryptedPath);
    const file = await File.create({
      originalName: req.file.originalname,
      encryptedName: encryptedFileName,
      size: req.file.size,
      mimeType: req.file.mimetype,
      uploadedBy: req.user.id
    });

    res.status(201).json({ message: 'File uploaded and encrypted!', file });

  } catch (err) {
    res.status(500).json({ message: 'Upload failed', error: err.message });
  }
};


exports.generateShareLink = async (req, res) => {
  try {
    const { fileId } = req.params;
    const { expiresIn, downloadLimit, password } = req.body;

    // Search the file by ID and ensure it belongs to the user
    const file = await File.findOne({ _id: fileId, uploadedBy: req.user.id });
    if (!file) return res.status(404).json({ message: 'File not found' });

    // Set Expiry based on user input
    const expiryMap = {
      '1h': 1 * 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000
    };
    const expiresAt = new Date(Date.now() + (expiryMap[expiresIn] || expiryMap['24h']));

    // Hash the password 
    if (!password) return res.status(400).json({ message: 'Password is required' });
    let hashedPassword = null;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    // Generate Token
    const shareToken = uuidv4();

    // File update karo
    file.shareToken = shareToken;
    file.expiresAt = expiresAt;
    file.downloadLimit = downloadLimit || 1;
    file.password = hashedPassword;
    await file.save();

    const shareLink = `${process.env.FRONTEND_URL}/download/${shareToken}`;

    res.json({ shareLink, expiresAt, shareToken });

  } catch (err) {
    res.status(500).json({ message: 'Error generating link', error: err.message });
  }
};

exports.downloadFile = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    // Search file by token 
    const file = await File.findOne({ shareToken: token });
    if (!file) return res.status(404).json({ message: 'Invalid link' });

    // Link active ?
    if (!file.isActive) return res.status(400).json({ message: 'Link has been revoked' });

    // Expiry check
    if (file.expiresAt && new Date() > file.expiresAt) {
      return res.status(400).json({ message: 'Link has expired' });
    }

    // Download limit check
    if (file.downloadCount >= file.downloadLimit) {
      return res.status(400).json({ message: 'Download limit reached' });
    }

    // Password check
    if (file.password) {
      if (!password) return res.status(401).json({ message: 'Password required' });
      const isMatch = await bcrypt.compare(password, file.password);
      if (!isMatch) return res.status(401).json({ message: 'Wrong password' });
    }

    // GridFS se encrypted file download karo
    const encryptedPath = path.join('uploads', file.encryptedName);
    const decryptedPath = path.join('uploads', `dec-${file.originalName}`);

    // GridFS se file fetch karo local mein
    await downloadFromGridFS(file.encryptedName, encryptedPath);

    // Decrypt karo
    await decryptFile(encryptedPath, decryptedPath);

    // Local encrypted copy delete karo
    fs.unlinkSync(encryptedPath);

    // Download count update karo
    file.downloadCount += 1;
    await file.save();

    // File bhejo user ko
    res.download(decryptedPath, file.originalName, (err) => {
      // Decrypted file delete karo
      if (fs.existsSync(decryptedPath)) {
        fs.unlinkSync(decryptedPath);
      }
      if (err) console.error('Download error:', err);
    });

  } catch (err) {
    res.status(500).json({ message: 'Download failed', error: err.message });
  }
};

// User all files
exports.getMyFiles = async (req, res) => {
  try {
    const files = await File.find({ uploadedBy: req.user.id }).sort({ createdAt: -1 });
    res.json({ files });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching files', error: err.message });
  }
};

// File delete 
exports.deleteFile = async (req, res) => {
  try {
    const file = await File.findOne({ _id: req.params.fileId, uploadedBy: req.user.id });
    if (!file) return res.status(404).json({ message: 'File not found' });
    //Delete from GridFS
    await deleteFromGridFS(file.encryptedName);

    await file.deleteOne();
    res.json({ message: 'File deleted successfully' });

  } catch (err) {
    res.status(500).json({ message: 'Error deleting file', error: err.message });
  }
};

// Share link revoke 
exports.revokeLink = async (req, res) => {
  try {
    const file = await File.findOne({ _id: req.params.fileId, uploadedBy: req.user.id });
    if (!file) return res.status(404).json({ message: 'File not found' });

    file.isActive = false;
    await file.save();

    res.json({ message: 'Link revoked successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error revoking link', error: err.message });
  }
};

// Dashboard stats
exports.getStats = async (req, res) => {
  try {
    const files = await File.find({ uploadedBy: req.user.id });

    const totalFiles = files.length;
    const activeLinks = files.filter(f => f.isActive && f.shareToken).length;
    const totalDownloads = files.reduce((sum, f) => sum + f.downloadCount, 0);

    res.json({ totalFiles, activeLinks, totalDownloads });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching stats', error: err.message });
  }
};