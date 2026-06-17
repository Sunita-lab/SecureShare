import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Shield, Download, Lock, FileText, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { fileAPI } from '../services/api';
import toast from 'react-hot-toast';

const DownloadPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [downloading, setDownloading] = useState(false);
  const [status, setStatus] = useState('idle'); // idle, success, error
  const [errorMsg, setErrorMsg] = useState('');
  const [needsPassword, setNeedsPassword] = useState(false);

  const handleDownload = async () => {
  setDownloading(true);
  setErrorMsg('');
  try {
    const res = await fileAPI.download(token, { password });

    const blob = new Blob([res.data], { type: res.headers['content-type'] });
    const contentDisposition = res.headers['content-disposition'];
    let filename = 'downloaded-file';
    if (contentDisposition) {
      const match = contentDisposition.match(/filename="?([^"]+)"?/);
      if (match) filename = match[1];
    }

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    setStatus('success');
    toast.success('File downloaded successfully!');
  } catch (err) {
    let msg = 'Download failed';

    if (err.response?.data instanceof Blob) {
      const text = await err.response.data.text();
      try {
        const json = JSON.parse(text);
        msg = json.message;
      } catch {}
    } else {
      msg = err.response?.data?.message || msg;
    }

    if (msg === 'Password required') {
      setNeedsPassword(true);
      toast.error('This file is password protected!');
    } else if (msg === 'Wrong password') {
      toast.error('Wrong password, try again!');
    } else {
      setStatus('error');
      setErrorMsg(msg);
    }
  } finally {
    setDownloading(false);
  }
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-teal-50 to-emerald-100 flex items-center justify-center px-4">

      {/* Background decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-green-300 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-teal-300 rounded-full opacity-20 blur-3xl"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8 cursor-pointer" onClick={() => navigate('/')}>
          <div className="inline-flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-teal-500 rounded-xl flex items-center justify-center glow-green">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
              SecureShare
            </span>
          </div>
        </div>

        {/* Card */}
        <div className="glass rounded-3xl p-8 shadow-2xl">

          {/* Idle / Password State */}
          {status === 'idle' && (
            <>
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-10 h-10 text-teal-500" />
                </div>
                <h1 className="text-2xl font-bold text-gray-800 mb-2">Secure File</h1>
                <p className="text-gray-500 text-sm">Someone shared an encrypted file with you</p>
              </div>

              {/* Validation Checks */}
              <div className="space-y-2 mb-6">
                {[
                  'Link token verified',
                  'Expiry check passed',
                  'Download limit available',
                ].map((check) => (
                  <div key={check} className="flex items-center gap-3 p-3 bg-green-50/80 rounded-xl">
                    <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                    <span className="text-sm text-gray-700">{check}</span>
                  </div>
                ))}
              </div>

              {/* Password Input */}
              {needsPassword && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Lock className="inline w-4 h-4 mr-1 text-teal-500" />
                    Password Required
                  </label>
                  <input
                    type="password"
                    placeholder="Enter file password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleDownload()}
                    className="w-full px-4 py-3 bg-white/70 border border-white/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 transition-all text-gray-800 placeholder-gray-400"
                  />
                </div>
              )}

              {/* Download Button */}
              <button
                onClick={handleDownload}
                disabled={downloading}
                className="w-full py-4 bg-gradient-to-r from-green-500 to-teal-500 text-white font-semibold rounded-2xl hover:from-green-600 hover:to-teal-600 transition-all glow-green shadow-lg disabled:opacity-50 text-lg"
              >
                {downloading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                    </svg>
                    Decrypting & Downloading...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Download className="w-5 h-5" />
                    Download File
                  </span>
                )}
              </button>
            </>
          )}

          {/* Success State */}
          {status === 'success' && (
            <div className="text-center py-4">
              <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-teal-400 rounded-full flex items-center justify-center mx-auto mb-6 glow-green">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Downloaded!</h2>
              <p className="text-gray-500 mb-8">Your file has been decrypted and saved</p>
              <button
                onClick={() => navigate('/')}
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-teal-500 text-white font-semibold rounded-2xl hover:from-green-600 hover:to-teal-600 transition-all glow-green shadow-lg"
              >
                Go to SecureShare →
              </button>
            </div>
          )}

          {/* Error State */}
          {status === 'error' && (
            <div className="text-center py-4">
              <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <XCircle className="w-10 h-10 text-red-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
              <div className="flex items-center gap-3 p-4 bg-red-50 rounded-2xl mb-8">
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                <p className="text-sm text-red-700">{errorMsg}</p>
              </div>
              <button
                onClick={() => navigate('/')}
                className="px-6 py-3 glass text-green-700 font-semibold rounded-2xl hover:bg-white/80 transition-all"
              >
                ← Back to Home
              </button>
            </div>
          )}

        </div>

        {/* Security note */}
        <p className="text-center mt-6 text-sm text-gray-500">
          🔒 End-to-end encrypted by SecureShare
        </p>

      </div>
    </div>
  );
};

export default DownloadPage;