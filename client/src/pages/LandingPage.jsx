import { useNavigate } from 'react-router-dom';
import { Shield, Upload, Link, Download, Lock, Zap, Eye } from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-teal-50 to-emerald-100 overflow-hidden">
      
      {/* Background decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-green-300 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-teal-300 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-200 rounded-full opacity-10 blur-3xl"></div>
      </div>

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-teal-500 rounded-lg flex items-center justify-center glow-green">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
            CipherSend
          </span>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/login')}
            className="px-4 py-2 text-green-700 font-medium hover:text-teal-600 transition-colors"
          >
            Login
          </button>
          <button
            onClick={() => navigate('/register')}
            className="px-5 py-2 bg-gradient-to-r from-green-500 to-teal-500 text-white font-medium rounded-xl hover:from-green-600 hover:to-teal-600 transition-all glow-green shadow-lg"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 flex flex-col items-center text-center px-8 pt-16 pb-24">
        
        {/* Badge */}
        <div className="flex items-center gap-2 glass px-4 py-2 rounded-full mb-8 shadow-sm">
          <Zap className="w-4 h-4 text-teal-500" />
          <span className="text-sm font-medium text-teal-700">AES-256 Military Grade Encryption</span>
        </div>

        {/* Heading */}
        <h1 className="text-6xl font-extrabold mb-6 leading-tight max-w-4xl">
          Share Files.{' '}
          <span className="bg-gradient-to-r from-green-500 to-teal-500 bg-clip-text text-transparent">
            Stay Secure.
          </span>
          <br />
          Always.
        </h1>

        <p className="text-xl text-gray-600 max-w-2xl mb-10 leading-relaxed">
          Upload, encrypt, and share files with full control — set expiry dates, 
          download limits, and password protection. Your files, your rules.
        </p>

        {/* CTA Buttons */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/register')}
            className="px-8 py-4 bg-gradient-to-r from-green-500 to-teal-500 text-white font-semibold rounded-2xl hover:from-green-600 hover:to-teal-600 transition-all glow-green shadow-xl text-lg"
          >
            Start Sharing Free
          </button>
          <button
            onClick={() => navigate('/login')}
            className="px-8 py-4 glass text-green-700 font-semibold rounded-2xl hover:bg-white/80 transition-all shadow-lg text-lg"
          >
            Sign In →
          </button>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-12 mt-16">
          {[
            { value: 'AES-256', label: 'Encryption' },
            { value: '100%', label: 'Private' },
            { value: 'Zero', label: 'Data Selling' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
                {stat.value}
              </div>
              <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 px-8 pb-24">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
          Everything you need to share{' '}
          <span className="bg-gradient-to-r from-green-500 to-teal-500 bg-clip-text text-transparent">
            securely
          </span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {[
            {
              icon: <Upload className="w-6 h-6" />,
              title: 'Encrypted Upload',
              desc: 'Every file is encrypted with AES-256 before touching our servers. Plain files never stored.',
              color: 'from-green-400 to-green-600'
            },
            {
              icon: <Link className="w-6 h-6" />,
              title: 'Smart Share Links',
              desc: 'Set expiry (1h, 24h, 7d), download limits (1, 5, 10), and optional password protection.',
              color: 'from-teal-400 to-teal-600'
            },
            {
              icon: <Download className="w-6 h-6" />,
              title: 'Secure Download',
              desc: 'Recipients download and decrypt instantly. Links auto-expire after conditions are met.',
              color: 'from-emerald-400 to-emerald-600'
            },
            {
              icon: <Lock className="w-6 h-6" />,
              title: 'Password Protection',
              desc: 'Add an extra layer — recipients must enter password before downloading.',
              color: 'from-green-500 to-teal-500'
            },
            {
              icon: <Eye className="w-6 h-6" />,
              title: 'Full Dashboard',
              desc: 'Track all uploads, active links, download counts, and revoke access anytime.',
              color: 'from-teal-500 to-emerald-500'
            },
            {
              icon: <Zap className="w-6 h-6" />,
              title: 'Auto Cleanup',
              desc: 'Expired files are automatically deleted from storage — no manual work needed.',
              color: 'from-emerald-500 to-green-500'
            },
          ].map((feature) => (
            <div key={feature.title} className="glass rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
              <div className={`w-12 h-12 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center text-white mb-4 glow-green`}>
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">{feature.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Bottom */}
      <section className="relative z-10 px-8 pb-24 text-center">
        <div className="glass max-w-2xl mx-auto rounded-3xl p-12 shadow-xl">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Ready to share{' '}
            <span className="bg-gradient-to-r from-green-500 to-teal-500 bg-clip-text text-transparent">
              securely?
            </span>
          </h2>
          <p className="text-gray-600 mb-8">Join CipherSend — free, fast, and fully encrypted.</p>
          <button
            onClick={() => navigate('/register')}
            className="px-8 py-4 bg-gradient-to-r from-green-500 to-teal-500 text-white font-semibold rounded-2xl hover:from-green-600 hover:to-teal-600 transition-all glow-green shadow-xl text-lg"
          >
            Create Free Account →
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 text-center pb-8 text-gray-500 text-sm">
        Built with 💚 — CipherSend © 2026
      </footer>

    </div>
  );
};

export default LandingPage;