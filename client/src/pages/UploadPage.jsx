import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { Shield, Upload, File, X, CheckCircle, AlertCircle } from 'lucide-react';
import { fileAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const UploadPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);

  const onDrop = useCallback((acceptedFiles) => {
    setSelectedFile(acceptedFiles[0]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize: 10 * 1024 * 1024,
    multiple: false,
    onDropRejected: () => toast.error('File too large! Max 10MB allowed.')
  });

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleUpload = async () => {
    if (!selectedFile) return toast.error('Please select a file!');
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      const res = await fileAPI.upload(formData);
      setUploadedFile(res.data.file);
      toast.success('File uploaded and encrypted!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-teal-50 to-emerald-100">

      {/* Background decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-green-300 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-teal-300 rounded-full opacity-20 blur-3xl"></div>
      </div>

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-6">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/dashboard')}>
          <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-teal-500 rounded-lg flex items-center justify-center glow-green">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
            CipherSend
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-gray-600 text-sm">Hey, <span className="font-semibold text-green-600">{user?.username}</span></span>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 glass text-green-700 font-medium rounded-xl hover:bg-white/80 transition-all"
          >
            Dashboard
          </button>
          <button
            onClick={() => { logout(); navigate('/'); }}
            className="px-4 py-2 text-gray-500 hover:text-red-500 font-medium transition-colors"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 max-w-2xl mx-auto px-8 py-12">

        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-800 mb-3">
            Upload a{' '}
            <span className="bg-gradient-to-r from-green-500 to-teal-500 bg-clip-text text-transparent">
              File
            </span>
          </h1>
          <p className="text-gray-500">Your file will be encrypted with AES-256 instantly</p>
        </div>

        {!uploadedFile ? (
          <div className="glass rounded-3xl p-8 shadow-2xl">

            {/* Dropzone */}
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all
                ${isDragActive
                  ? 'border-green-500 bg-green-50/50 glow-green'
                  : 'border-gray-300 hover:border-green-400 hover:bg-green-50/30'
                }`}
            >
              <input {...getInputProps()} />
              <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-teal-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Upload className={`w-8 h-8 ${isDragActive ? 'text-green-500' : 'text-gray-400'}`} />
              </div>
              {isDragActive ? (
                <p className="text-green-600 font-semibold text-lg">Drop it here!</p>
              ) : (
                <>
                  <p className="text-gray-700 font-semibold text-lg mb-1">Drag & drop your file here</p>
                  <p className="text-gray-400 text-sm">or click to browse — max 10MB</p>
                </>
              )}
            </div>

            {/* Selected File */}
            {selectedFile && (
              <div className="mt-6 flex items-center gap-4 p-4 bg-green-50/80 rounded-2xl border border-green-200">
                <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-teal-400 rounded-xl flex items-center justify-center">
                  <File className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 truncate">{selectedFile.name}</p>
                  <p className="text-sm text-gray-500">{formatSize(selectedFile.size)}</p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}

            {/* Upload Button */}
            <button
              onClick={handleUpload}
              disabled={!selectedFile || uploading}
              className="w-full mt-6 py-4 bg-gradient-to-r from-green-500 to-teal-500 text-white font-semibold rounded-2xl hover:from-green-600 hover:to-teal-600 transition-all glow-green shadow-lg disabled:opacity-40 disabled:cursor-not-allowed text-lg"
            >
              {uploading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                  </svg>
                  Encrypting & Uploading...
                </span>
              ) : (
                '🔒 Encrypt & Upload'
              )}
            </button>

          </div>
        ) : (
          /* Success State */
          <div className="glass rounded-3xl p-8 shadow-2xl text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-teal-400 rounded-full flex items-center justify-center mx-auto mb-6 glow-green">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Encrypted & Uploaded!</h2>
            <p className="text-gray-500 mb-2">Your file is safely stored</p>
            <p className="font-medium text-green-600 mb-8">{uploadedFile.originalName}</p>

            <div className="flex gap-4">
              <button
                onClick={() => navigate('/share', { state: { fileId: uploadedFile._id } })}
                className="flex-1 py-3 bg-gradient-to-r from-green-500 to-teal-500 text-white font-semibold rounded-2xl hover:from-green-600 hover:to-teal-600 transition-all glow-green shadow-lg"
              >
                Generate Share Link →
              </button>
              <button
                onClick={() => { setSelectedFile(null); setUploadedFile(null); }}
                className="flex-1 py-3 glass text-green-700 font-semibold rounded-2xl hover:bg-white/80 transition-all"
              >
                Upload Another
              </button>
            </div>
          </div>
        )}

        {/* Security note */}
        <div className="mt-6 flex items-center gap-3 p-4 glass rounded-2xl">
          <AlertCircle className="w-5 h-5 text-teal-500 shrink-0" />
          <p className="text-sm text-gray-600">
            Files are encrypted with <span className="font-semibold text-green-600">AES-256</span> before storage. Plain files are never saved on our servers.
          </p>
        </div>

      </main>
    </div>
  );
};

export default UploadPage;