import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Key, User, ShieldAlert, Sparkles, Activity } from 'lucide-react';

const Login: React.FC = () => {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState<boolean>(false);
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [fullName, setFullName] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!username || !password || (isRegister && !fullName)) {
      setError("Please fill in all fields.");
      setLoading(false);
      return;
    }

    try {
      if (isRegister) {
        await register(username, password, fullName);
        navigate('/onboard');
      } else {
        const success = await login(username, password);
        if (success) {
          navigate('/dashboard');
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "Authentication failed. Please verify credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-zinc-100 flex items-center justify-center grid-mesh font-sans relative px-4">
      <div className="absolute inset-0 radial-highlight pointer-events-none" />

      <div className="w-full max-w-md border border-border bg-background-panel rounded-lg shadow-2xl p-8 relative z-10">
        
        {/* Header Title */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative flex items-center justify-center mb-2">
            <svg viewBox="0 0 100 100" className="w-12 h-12 filter drop-shadow-[0_0_12px_rgba(34,211,238,0.4)]" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="login-logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#22d3ee" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
              <polygon points="50,8 86,29 86,71 50,92 14,71 14,29" stroke="url(#login-logo-grad)" strokeWidth="3" strokeLinejoin="round" className="opacity-40" />
              <polygon points="50,15 80,32 80,68 50,85 20,68 20,32" stroke="rgba(255, 255, 255, 0.1)" strokeWidth="1" strokeLinejoin="round" />
              <path d="M 36 38 L 24 50 L 36 62" stroke="#22d3ee" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M 64 38 L 76 50 L 64 62" stroke="#8b5cf6" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M 44 42 C 48 46, 52 54, 56 58" stroke="rgba(255, 255, 255, 0.7)" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M 56 42 C 52 46, 48 54, 44 58" stroke="rgba(255, 255, 255, 0.7)" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="50" cy="50" r="4" fill="#22d3ee" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold font-mono tracking-widest text-zinc-100 uppercase">KODEXIS</h2>
          <p className="text-[10px] text-zinc-500 font-mono tracking-wider">AI INTERVIEW LABORATORY</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded border border-red-500/30 bg-red-500/10 text-red-400 text-xs font-mono flex items-center space-x-2">
            <ShieldAlert size={14} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-3 text-zinc-500" size={16} />
                <input
                  type="text"
                  placeholder="e.g. Alex Morgan"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-background border border-border rounded pl-10 pr-4 py-2.5 text-sm font-mono text-zinc-200 focus:outline-none focus:border-brand-cyan transition"
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">Username</label>
            <div className="relative">
              <User className="absolute left-3 top-3 text-zinc-500" size={16} />
              <input
                type="text"
                placeholder="e.g. alex"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-background border border-border rounded pl-10 pr-4 py-2.5 text-sm font-mono text-zinc-200 focus:outline-none focus:border-brand-cyan transition"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">Password</label>
            <div className="relative">
              <Key className="absolute left-3 top-3 text-zinc-500" size={16} />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-background border border-border rounded pl-10 pr-4 py-2.5 text-sm font-mono text-zinc-200 focus:outline-none focus:border-brand-cyan transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded bg-brand-cyan text-background font-bold font-mono text-sm hover:bg-brand-cyan/95 transition flex items-center justify-center space-x-2"
          >
            {loading ? (
              <Activity className="animate-spin" size={16} />
            ) : (
              <>
                <span>{isRegister ? 'Register Account' : 'Authenticate Session'}</span>
                <Sparkles size={14} />
              </>
            )}
          </button>
        </form>

        {/* Footer Toggle */}
        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsRegister(!isRegister);
              setError(null);
            }}
            className="text-xs font-mono text-zinc-400 hover:text-brand-cyan transition"
          >
            {isRegister
              ? 'Already registered? Authenticate here'
              : "New candidate? Generate profile key"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
