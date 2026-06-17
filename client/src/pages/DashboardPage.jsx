import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Upload, Link, Download, Trash2, XCircle, CheckCircle, Clock, File, BarChart2 } from 'lucide-react';
import { fileAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [files, setFiles] = useState([]);
  const [stats, setStats] = useState({ totalFiles: 0, activeLinks: 0, totalDownloads: 0 });
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [filesRes, statsRes] = await Promise.all([
        fileAPI.getMyFiles(),
        fileAPI.getStats(),
      ]);
      setFiles(filesRes.data.files);
      setStats(statsRes.data);
    } catch (err) {
      toast.error('Could not load dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleDelete = async (fileId) => {
    if (!window.confirm('Delete this file permanently?')) return;
    try {
      await fileAPI.deleteFile(fileId);
      toast.success('File deleted!');
      fetchData();
    } catch (err) {
      toast.error('Could not delete file');
    }
  };

  const handleRevoke = async (fileId) => {
    if (!window.confirm('Revoke share link for this file?')) return;
    try {
      await fileAPI.revokeLink(fileId);
      toast.success('Link revoked!');
      fetchData();
    } catch (err) {
      toast.error('Could not revoke link');
    }
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
  };

  const isExpired = (file) => {
    if (!file.expiresAt) return false;
    return new Date() > new Date(file.expiresAt);
  };

  const isLimitReached = (file) => {
    return file.downloadCount >= file.downloadLimit;
  };

  const getStatus = (file) => {
    if (!file.isActive) return { label: 'Revoked', color: 'text-red-500 bg-red-50' };
    if (isExpired(file)) return { label: 'Expired', color: 'text-orange-500 bg-orange-50' };
    if (isLimitReached(file)) return { label: 'Limit Reached', color: 'text-yellow-600 bg-yellow-50' };
    if (file.shareToken) return { label: 'Active', color: 'text-green-600 bg-green-50' };
    return { label: 'No Link', color: 'text-gray-500 bg-gray-50' };
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
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-teal-500 rounded-lg flex items-center justify-center glow-green">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
            SecureShare
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-gray-600 text-sm">Hey, <span className="font-semibold text-green-600">{user?.username}</span></span>
          <button
            onClick={() => navigate('/upload')}
            className="px-4 py-2 bg-gradient-to-r from-green-500 to-teal-500 text-white font-medium rounded-xl hover:from-green-600 hover:to-teal-600 transition-all glow-green shadow-md flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Upload
          </button>
          <button
            onClick={() => { logout(); navigate('/'); }}
            className="px-4 py-2 text-gray-500 hover:text-red-500 font-medium transition-colors"
          >
            Logout
          </button>
        </div>
      </nav>

      <main className="relative z-10 max-w-6xl mx-auto px-8 py-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Your{' '}
            <span className="bg-gradient-to-r from-green-500 to-teal-500 bg-clip-text text-transparent">
              Dashboard
            </span>
          </h1>
          <p className="text-gray-500">Manage all your encrypted files and share links</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          {[
            { label: 'Total Files', value: stats.totalFiles, icon: <File className="w-6 h-6" />, color: 'from-green-400 to-green-600' },
            { label: 'Active Links', value: stats.activeLinks, icon: <Link className="w-6 h-6" />, color: 'from-teal-400 to-teal-600' },
            { label: 'Total Downloads', value: stats.totalDownloads, icon: <Download className="w-6 h-6" />, color: 'from-emerald-400 to-emerald-600' },
          ].map((stat) => (
            <div key={stat.label} className="glass rounded-2xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center text-white glow-green`}>
                  {stat.icon}
                </div>
                <BarChart2 className="w-5 h-5 text-gray-300" />
              </div>
              <div className="text-3xl font-bold text-gray-800 mb-1">{stat.value}</div>
              <div className="text-sm text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Files Table */}
        <div className="glass rounded-3xl shadow-xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-5 border-b border-white/50">
            <h2 className="text-lg font-semibold text-gray-800">Your Files</h2>
            <button
              onClick={() => navigate('/upload')}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-teal-500 text-white text-sm font-medium rounded-xl hover:from-green-600 hover:to-teal-600 transition-all"
            >
              <Upload className="w-4 h-4" />
              New Upload
            </button>
          </div>

          {loading ? (
            <div className="text-center py-16 text-gray-400">Loading...</div>
          ) : files.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <File className="w-8 h-8 text-gray-300" />
              </div>
              <p className="text-gray-500 mb-4">No files uploaded yet</p>
              <button
                onClick={() => navigate('/upload')}
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-teal-500 text-white font-medium rounded-xl"
              >
                Upload First File
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-white/30">
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">File</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Size</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Downloads</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Expires</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Status</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/40">
                  {files.map((file) => {
                    const status = getStatus(file);
                    return (
                      <tr key={file._id} className="hover:bg-white/30 transition-colors">
                        {/* File Name */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-gradient-to-br from-green-100 to-teal-100 rounded-lg flex items-center justify-center shrink-0">
                              <File className="w-4 h-4 text-teal-600" />
                            </div>
                            <span className="font-medium text-gray-800 truncate max-w-[180px]">
                              {file.originalName}
                            </span>
                          </div>
                        </td>

                        {/* Size */}
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {formatSize(file.size)}
                        </td>

                        {/* Downloads */}
                        <td className="px-6 py-4 text-sm text-gray-600">
                          <span className="font-medium">{file.downloadCount}</span>
                          <span className="text-gray-400"> / {file.downloadLimit}</span>
                        </td>

                        {/* Expires */}
                        <td className="px-6 py-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDate(file.expiresAt)}
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${status.color}`}>
                            {status.label}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {/* Share Link */}
                            <button
                              onClick={() => navigate('/share', { state: { fileId: file._id } })}
                              title="Generate Share Link"
                              className="p-2 text-teal-500 hover:bg-teal-50 rounded-lg transition-colors"
                            >
                              <Link className="w-4 h-4" />
                            </button>

                            {/* Revoke */}
                            {file.isActive && file.shareToken && (
                              <button
                                onClick={() => handleRevoke(file._id)}
                                title="Revoke Link"
                                className="p-2 text-orange-500 hover:bg-orange-50 rounded-lg transition-colors"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            )}

                            {/* Delete */}
                            <button
                              onClick={() => handleDelete(file._id)}
                              title="Delete File"
                              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </main>
    </div>
  );
};

export default DashboardPage;