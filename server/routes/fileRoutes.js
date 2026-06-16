const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../config/multer');
const { uploadFile, generateShareLink  } = require('../controllers/fileController');

router.post('/upload', authMiddleware, upload.single('file'), uploadFile);
router.post('/share/:fileId', authMiddleware, generateShareLink);

module.exports = router;