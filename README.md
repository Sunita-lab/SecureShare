# 🔐 CipherSend

> **Built during Internship at Xyzon Innovation — Task 4**

A full-stack encrypted file sharing web application where users can upload files, encrypt them with AES-256, and share them via secure links with configurable expiry, download limits, and password protection.

**Live Demo:** [cyphersend.vercel.app](https://cyphersend.vercel.app)  
**Backend API:** [secureshare-k4fe.onrender.com](https://secureshare-k4fe.onrender.com)

---

## 📌 About This Project

CipherSend was built as **Task 4** during an internship at **Xyzon Innovation**. The goal was to design and implement a production-ready secure file sharing system from scratch — covering backend architecture, cryptography, access control, and a polished frontend UI.

The project was built over 4 days:
- **Day 1** — Full backend (Auth, Upload, Encryption, Share Links, Download, Dashboard API, Cleanup)
- **Day 2** — Full frontend (6 pages with Glassmorphism + Cyberpunk UI)
- **Day 3** — Testing, bug fixes, deployment, and documentation
- **Day 4 (v0.2)** — Persistent file storage with MongoDB GridFS, rebranding to CipherSend

---

## ✨ Features

- 🔐 **User Authentication** — Register & Login with JWT tokens, bcrypt password hashing
- 📤 **File Upload** — Drag & drop interface, up to 10MB, any file type
- 🔒 **AES-256 Encryption** — Every file is encrypted before storage; plain files never saved
- 💾 **Persistent Storage** — Encrypted files stored in MongoDB GridFS — survives server restarts and redeploys
- 🔗 **Smart Share Links** — Cryptographically unique tokens with:
  - Expiry settings (1 hour, 24 hours, 7 days)
  - Download limits (1, 5, or 10 downloads)
  - Password protection (required)
- 📥 **Secure Download** — Validates token, expiry, limit, and password before decrypting
- 📊 **User Dashboard** — View all files, track download counts, revoke links, delete files
- 🧹 **Auto Cleanup** — Cron job runs every hour to delete expired/limit-reached files
- 🛡️ **Security Hardening** — Helmet.js, CORS, Rate Limiting, Input Validation

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js (Vite), Tailwind CSS, React Router |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas (Mongoose) |
| File Storage | MongoDB GridFS |
| Auth | JWT, bcryptjs |
| Encryption | Node.js `crypto` module (AES-256-CBC) |
| File Upload | Multer |
| Scheduling | node-cron |
| Security | Helmet.js, express-rate-limit, CORS |
| Deployment | Vercel (frontend), Render (backend) |

---

## 🗂️ Project Structure

```
ciphersend/
├── server/                    # Backend
│   ├── config/
│   │   ├── multer.js          # File upload config
│   │   └── gridfs.js          # GridFS initialization
│   ├── controllers/
│   │   ├── authController.js  # Register, Login
│   │   └── fileController.js  # Upload, Share, Download, Dashboard
│   ├── middleware/
│   │   ├── authMiddleware.js  # JWT verification
│   │   └── validate.js        # Input validation
│   ├── models/
│   │   ├── User.js            # User schema
│   │   └── File.js            # File schema
│   ├── routes/
│   │   ├── authRoutes.js      # /api/auth/*
│   │   └── fileRoutes.js      # /api/files/*
│   ├── utils/
│   │   ├── encryption.js      # AES-256 encrypt/decrypt + GridFS helpers
│   │   └── cleanupJob.js      # Cron job
│   └── server.js              # Entry point
│
└── client/                    # Frontend
    └── src/
        ├── context/
        │   └── AuthContext.jsx # Global auth state
        ├── pages/
        │   ├── LandingPage.jsx
        │   ├── LoginPage.jsx
        │   ├── RegisterPage.jsx
        │   ├── UploadPage.jsx
        │   ├── ShareLinkPage.jsx
        │   ├── DownloadPage.jsx
        │   └── DashboardPage.jsx
        ├── services/
        │   └── api.js          # Axios API calls
        └── App.jsx             # Routes
```

---

## 🔄 Application Flow

```
01. User Registers & Logs In
        ↓
02. Uploads File (drag & drop)
        ↓
03. File Encrypted with AES-256
        ↓
04. Encrypted File Stored in MongoDB GridFS (permanent)
        ↓
05. Secure Share Link Generated
    (with token + expiry + limit + password)
        ↓
06. Link Shared with Recipient
        ↓
07. Recipient Opens Link
        ↓
08. System Validates:
    - Token valid?
    - Link expired?
    - Download limit reached?
    - Password correct?
        ↓
09. File fetched from GridFS → Decrypted on the fly
        ↓
10. File Downloaded by Recipient
        ↓
11. Download Count Incremented
        ↓
12. Auto Cleanup removes expired files hourly
```

---

## ⚙️ Local Setup

### Prerequisites
- Node.js v18+
- MongoDB Atlas account

### Backend Setup

```bash
# Clone the repo
git clone https://github.com/Sunita-lab/CipherSend
cd CipherSend/server

# Install dependencies
npm install --legacy-peer-deps

# Create .env file
cp .env.example .env
# Fill in your values (see below)

# Run development server
npm run dev
```

**`.env` file:**
```env
PORT=5000
MONGO_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/ciphersend
JWT_SECRET=your_super_secret_key_here
ENCRYPTION_KEY=your_exactly_32_character_key_here
FRONTEND_URL=http://localhost:5173
```

### Frontend Setup

```bash
cd ../client

# Install dependencies
npm install

# Create .env file
echo "VITE_API_URL=http://localhost:5000/api" > .env

# Run development server
npm run dev
```

Open `http://localhost:5173` 🚀

---

## 🌐 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |

### Files (Protected — Bearer Token required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/files/upload` | Upload & encrypt file |
| POST | `/api/files/share/:fileId` | Generate share link |
| GET/POST | `/api/files/download/:token` | Download & decrypt file |
| GET | `/api/files/myfiles` | Get all user files |
| GET | `/api/files/stats` | Get dashboard stats |
| DELETE | `/api/files/delete/:fileId` | Delete file |
| PATCH | `/api/files/revoke/:fileId` | Revoke share link |

---

## 🧠 Technical Decisions

### Why AES-256-CBC?
AES-256 is the industry standard for symmetric encryption. CBC (Cipher Block Chaining) mode was chosen because it chains each block with the previous one using an IV (Initialization Vector), making identical files produce different ciphertext every time — preventing pattern analysis attacks.

### Why JWT over Sessions?
JWTs are stateless — no session store needed on the server. This makes the backend horizontally scalable and works well with the separate frontend/backend deployment architecture.

### Why store IV with the file?
The IV is prepended to the encrypted file during storage. During decryption, the first 16 bytes are extracted as the IV and the rest is decrypted. This is a standard and secure pattern — IV does not need to be secret, only random.

### Why node-cron for cleanup?
A background cron job running every hour ensures expired files are automatically purged without requiring any user action. This keeps storage clean and enforces the stated expiry contracts.

### Why MongoDB GridFS over Cloudinary?
Initially Cloudinary was attempted for persistent storage, but free tier restrictions blocked raw file delivery. GridFS was chosen because it uses the existing MongoDB Atlas connection — no additional service, no access control issues, and files are stored as encrypted chunks directly in the database.

### Why Multer with disk storage?
Multer's disk storage temporarily writes the uploaded file before encryption. After AES-256 encryption and GridFS upload, both the plain and encrypted local copies are immediately deleted — ensuring no unencrypted data persists on disk.

---

## 🚧 Challenges Faced

### 1. MongoDB Unique Index on null values
**Problem:** The `shareToken` field had `unique: true` — when multiple files had `null` as shareToken (before link generation), MongoDB threw a duplicate key error.  
**Solution:** Added `sparse: true` to the index — sparse indexes ignore null values entirely.

### 2. File Case Sensitivity on Linux
**Problem:** Windows is case-insensitive so `User.js` and `user.js` are the same. But Render runs on Linux which is case-sensitive — causing `Cannot find module '../models/User'`.  
**Solution:** Used `git rm --cached` to clear Git's cache and re-added the files with correct casing.

### 3. Blob Response Error Parsing
**Problem:** When download failed (wrong password, expired link), the error response was a Blob (due to `responseType: 'blob'`) — JSON parsing failed and the UI showed a generic error.  
**Solution:** Added Blob-to-text conversion before JSON parsing in the catch block to correctly extract the error message.

### 4. Render Ephemeral Filesystem
**Problem:** Render's free tier has an ephemeral filesystem — uploaded files get wiped on every redeploy.  
**Solution:** Migrated to MongoDB GridFS — files stored permanently in MongoDB Atlas. Attempted Cloudinary first but free tier blocked raw file delivery.

### 5. Cloudinary Raw File Access
**Problem:** Cloudinary blocked raw file delivery on free tier — "Blocked for delivery" error even after uploading successfully.  
**Solution:** Switched to MongoDB GridFS which uses the existing Atlas connection with no delivery restrictions.

### 6. React Router on Vercel
**Problem:** Direct URL access to routes like `/download/:token` returned 404 on Vercel because Vercel serves static files and doesn't know about React Router routes.  
**Solution:** Added a `vercel.json` with a rewrite rule to redirect all requests to `index.html`.

### 7. CORS Configuration
**Problem:** During development CORS was set to `localhost:3000` — switching to Vite changed the port to `5173`, and later deployment to Vercel required the production URL.  
**Solution:** Used environment variable `FRONTEND_URL` on the backend and updated CORS origin dynamically per environment.

### 8. Multer Peer Dependency Conflict
**Problem:** `multer-gridfs-storage` required multer v1 but project used multer v2 — `npm install` failed on Render.  
**Solution:** Used `--legacy-peer-deps` flag in both local install and Render build command.

---

## 🔮 Future Improvements (v0.3)

- 📧 Email notifications when a file is downloaded
- 📊 Per-file download history with recipient info
- 👁️ File preview before download (images, PDFs)
- 🌙 Dark mode toggle
- 🔑 Two-Factor Authentication (2FA)
- 📁 My Opened Files section in dashboard
- 🔍 Search & filter files in dashboard
- 📈 Upload progress percentage

---

## 📦 Versions

| Version | What changed |
|---------|-------------|
| v0.1 | Initial release — full backend + frontend |
| v0.2 | GridFS persistent storage, rebranding to CipherSend |

---

## 👩‍💻 Author

**Sunita Satpathy**  
Intern at **Xyzon Innovations Pvt LTD**  
Task 4 — Secure File Sharing System  
Built: June 2026

---

## 📄 License

This project was built as part of an internship task at Xyzon Innovation.