import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Shield, Link, Copy, Check, Clock, Download, Lock, ChevronDown } from 'lucide-react';
import { fileAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const ShareLinkPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const [files, setFiles] = useState([]);
  const [selectedFileId, setSelectedFileId] = useState(location.state?.fileId || '');
  const [settings, setSettings] = useState({
    expiresIn: '24h',
    downloadLimit: 5,
    password: '',
  });
  const [generatedLink, setGeneratedLink] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const res = await fileAPI.getMyFiles();
        setFiles(res.data.files);
      } catch (err) {
        toast.error('Could not load files');
      }
    };
    fetchFiles();
  }, []);

  const handleGenerate = async () => {
    if (!selectedFileId) return toast.error('Please select a file!');
    setLoading(true);
    try {
      const res = await fileAPI.generateShareLink(selectedFileId, settings);
      setGeneratedLink(res.data.shareLink);
      setExpiresAt(res.data.expiresAt);
      toast.success('Share link generated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate link');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    // Share link mein localhost:5000 ki jagah localhost:5173 use karenge
    
    navigator.clipboard.writeText(generatedLink);
    setCopied(true);
    toast.success('Link copied!');
    setTimeout(() => setCopied(false), 3000);
  };

  const formatExpiry = (dateStr) => {
    return new Date(dateStr).toLocaleString();
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
          <button onClick={() => navigate('/dashboard')} className="px-4 py-2 glass text-green-700 font-medium rounded-xl hover:bg-white/80 transition-all">
            Dashboard
          </button>
          <button onClick={() => { logout(); navigate('/'); }} className="px-4 py-2 text-gray-500 hover:text-red-500 font-medium transition-colors">
            Logout
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 max-w-2xl mx-auto px-8 py-12">

        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-800 mb-3">
            Generate{' '}
            <span className="bg-gradient-to-r from-green-500 to-teal-500 bg-clip-text text-transparent">
              Share Link
            </span>
          </h1>
          <p className="text-gray-500">Configure access controls for your file</p>
        </div>

        <div className="glass rounded-3xl p-8 shadow-2xl space-y-6">

          {/* File Select */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select File</label>
            <div className="relative">
              <select
                value={selectedFileId}
                onChange={(e) => setSelectedFileId(e.target.value)}
                className="w-full px-4 py-3 bg-white/70 border border-white/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 transition-all text-gray-800 appearance-none"
              >
                <option value="">-- Choose a file --</option>
                {files.map((file) => (
                  <option key={file._id} value={file._id}>
                    {file.originalName} ({(file.size / 1024).toFixed(1)} KB)
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Expiry */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              <Clock className="inline w-4 h-4 mr-1 text-teal-500" />
              Link Expiry
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: '1h', label: '1 Hour' },
                { value: '24h', label: '24 Hours' },
                { value: '7d', label: '7 Days' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setSettings({ ...settings, expiresIn: opt.value })}
                  className={`py-3 rounded-xl font-medium transition-all ${
                    settings.expiresIn === opt.value
                      ? 'bg-gradient-to-r from-green-500 to-teal-500 text-white glow-green shadow-lg'
                      : 'bg-white/70 text-gray-600 hover:bg-white/90'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Download Limit */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              <Download className="inline w-4 h-4 mr-1 text-teal-500" />
              Download Limit
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[1, 5, 10].map((limit) => (
                <button
                  key={limit}
                  onClick={() => setSettings({ ...settings, downloadLimit: limit })}
                  className={`py-3 rounded-xl font-medium transition-all ${
                    settings.downloadLimit === limit
                      ? 'bg-gradient-to-r from-green-500 to-teal-500 text-white glow-green shadow-lg'
                      : 'bg-white/70 text-gray-600 hover:bg-white/90'
                  }`}
                >
                  {limit} {limit === 1 ? 'Download' : 'Downloads'}
                </button>
              ))}
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Lock className="inline w-4 h-4 mr-1 text-teal-500" />
              Password Protection{' '}
              <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              type="password"
              placeholder="Set a password for this file"
              value={settings.password}
              required={true}
              onChange={(e) => setSettings({ ...settings, password: e.target.value })}
              className="w-full px-4 py-3 bg-white/70 border border-white/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 transition-all text-gray-800 placeholder-gray-400"
            />
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={loading || !selectedFileId}
            className="w-full py-4 bg-gradient-to-r from-green-500 to-teal-500 text-white font-semibold rounded-2xl hover:from-green-600 hover:to-teal-600 transition-all glow-green shadow-lg disabled:opacity-40 disabled:cursor-not-allowed text-lg"
          >
            {loading ? 'Generating...' : '🔗 Generate Secure Link'}
          </button>

        </div>

        {/* Generated Link */}
        {generatedLink && (
          <div className="mt-6 glass rounded-3xl p-6 shadow-xl">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-teal-400 rounded-lg flex items-center justify-center">
                <Link className="w-4 h-4 text-white" />
              </div>
              <h3 className="font-semibold text-gray-800">Your Secure Link</h3>
            </div>

            {/* Link Box */}
            <div className="flex items-center gap-3 p-4 bg-white/80 rounded-2xl border border-green-200 mb-4">
              <p className="flex-1 text-sm text-gray-600 truncate font-mono">
                {generatedLink}
              </p>
              <button
                onClick={handleCopy}
                className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
                  copied
                    ? 'bg-green-500 text-white'
                    : 'bg-gradient-to-r from-green-500 to-teal-500 text-white hover:from-green-600 hover:to-teal-600'
                }`}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>

            {/* Expiry Info */}
            <p className="text-sm text-gray-500 text-center">
              ⏰ Expires at: <span className="font-medium text-gray-700">{formatExpiry(expiresAt)}</span>
            </p>
          </div>
        )}

      </main>
    </div>
  );
};

export default ShareLinkPage;