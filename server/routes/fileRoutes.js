const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../config/multer');
const { uploadFile, generateShareLink, downloadFile, getMyFiles, deleteFile, revokeLink, getStats  } = require('../controllers/fileController');

router.post('/upload', authMiddleware, upload.single('file'), uploadFile);
router.post('/share/:fileId', authMiddleware, generateShareLink);
router.post('/download/:token', downloadFile);
router.get('/myfiles', authMiddleware, getMyFiles);
router.delete('/delete/:fileId', authMiddleware, deleteFile);
router.patch('/revoke/:fileId', authMiddleware, revokeLink);
router.get('/stats', authMiddleware, getStats);

module.exports = router;