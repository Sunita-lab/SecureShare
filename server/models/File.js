const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  originalName: { type: String, required: true },
  encryptedName: { type: String, required: true },
  size: { type: Number, required: true },
  mimeType: { type: String, required: true },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  shareToken: { type: String, unique: true, sparse: true },
  expiresAt: { type: Date },
  downloadLimit: { type: Number, default: 1 },
  downloadCount: { type: Number, default: 0 },
  password: { type: String, default: null },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('File', fileSchema);