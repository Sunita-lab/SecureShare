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

    // IV ko file ke start mein likho
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

    // Pehle IV padho
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