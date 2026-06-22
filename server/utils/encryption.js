const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY; // 32 characters hona chahiye
const IV_LENGTH = 16;

// File Encrypt
exports.encryptFile = (inputPath, outputPath) => {
  return new Promise((resolve, reject) => {
    const iv = crypto.randomBytes(IV_LENGTH);
    const key = Buffer.from(ENCRYPTION_KEY, 'utf8').slice(0, 32);
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);

    const input = fs.createReadStream(inputPath);
    const output = fs.createWriteStream(outputPath);

    // Write IV to the beginning of the output file
    output.write(iv);

    input.pipe(cipher).pipe(output);

    output.on('finish', () => resolve(outputPath));
    output.on('error', reject);
  });
};

// File Decrypt
exports.decryptFile = (inputPath, outputPath) => {
  return new Promise((resolve, reject) => {
    const input = fs.createReadStream(inputPath);
    const key = Buffer.from(ENCRYPTION_KEY, 'utf8').slice(0, 32);

    // Read IV from the beginning of the input file
    const chunks = [];
    input.on('data', chunk => chunks.push(chunk));
    input.on('end', () => {
      const fileBuffer = Buffer.concat(chunks);
      const iv = fileBuffer.slice(0, IV_LENGTH);
      const encryptedData = fileBuffer.slice(IV_LENGTH);

      const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);

      try {
        const decrypted = Buffer.concat([
          decipher.update(encryptedData),
          decipher.final()
        ]);

        fs.writeFileSync(outputPath, decrypted);
        resolve(outputPath);
      } catch (err) {
        reject(err);
      }
    });
    input.on('error', reject);
  });
};

const { getBucket } = require('../config/gridfs');
const { Readable } = require('stream');

exports.uploadToGridFS = (filePath, fileName) => {
  return new Promise((resolve, reject) => {
    const bucket = getBucket();
    const readStream = require('fs').createReadStream(filePath);
    const uploadStream = bucket.openUploadStream(fileName);
    
    readStream.pipe(uploadStream);
    
    uploadStream.on('finish', () => resolve(uploadStream.id));
    uploadStream.on('error', reject);
  });
};

exports.downloadFromGridFS = (fileName, destPath) => {
  return new Promise((resolve, reject) => {
    const bucket = getBucket();
    const writeStream = require('fs').createWriteStream(destPath);
    const downloadStream = bucket.openDownloadStreamByName(fileName);
    
    downloadStream.pipe(writeStream);
    
    writeStream.on('finish', resolve);
    writeStream.on('error', reject);
    downloadStream.on('error', reject);
  });
};

exports.deleteFromGridFS = async (fileName) => {
  const bucket = getBucket();
  const files = await bucket.find({ filename: fileName }).toArray();
  if (files.length > 0) {
    await bucket.delete(files[0]._id);
  }
};


    



