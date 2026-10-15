import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Target, Building2, Sparkles, Activity } from 'lucide-react';

const Onboarding: React.FC = () => {
  const { onboard } = useAuth();
  const navigate = useNavigate();
  const [targetRole, setTargetRole] = useState<string>('Software Engineer');
  const [targetCompanies, setTargetCompanies] = useState<string>('NVIDIA, Google');
  const [experienceLevel, setExperienceLevel] = useState<string>('MEDIUM');
  const [preferredLanguage, setPreferredLanguage] = useState<string>('PYTHON');
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const success = await onboard({
      targetRole,
      targetCompanies,
      experienceLevel,
      preferredLanguage
    });
    if (success) {
      navigate('/dashboard');
    } else {
      alert("Failed to initialize profile. Please retry.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-zinc-100 flex items-center justify-center grid-mesh font-sans relative px-4">
      <div className="absolute inset-0 radial-highlight pointer-events-none" />

      <div className="w-full max-w-lg border border-border bg-background-panel rounded-lg shadow-2xl p-8 relative z-10 space-y-6">
        
        {/* Header */}
        <div>
          <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded border border-brand-violet/30 bg-brand-violet/10 text-brand-violet text-[10px] font-mono mb-2 uppercase">
            <Target size={12} />
            <span>Profile Initialization</span>
          </div>
          <h2 className="text-xl font-bold font-mono text-zinc-100 uppercase">Initialize Lab DNA</h2>
          <p className="text-xs text-zinc-400">Configure your target objectives to generate your technical performance parameters.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">Target Engineering Role</label>
              <select
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="w-full bg-background border border-border rounded px-3 py-2 text-sm font-mono text-zinc-200 focus:outline-none focus:border-brand-cyan"
              >
                <option value="Software Engineer">Software Engineer</option>
                <option value="Full Stack Developer">Full Stack Developer</option>
                <option value="Backend Developer">Backend Developer</option>
                <option value="Frontend Developer">Frontend Developer</option>
                <option value="Data Engineer">Data Engineer</option>
                <option value="ML Engineer">ML Engineer</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">Preferred IDE Language</label>
              <select
                value={preferredLanguage}
                onChange={(e) => setPreferredLanguage(e.target.value)}
                className="w-full bg-background border border-border rounded px-3 py-2 text-sm font-mono text-zinc-200 focus:outline-none focus:border-brand-cyan"
              >
                <option value="JAVA">Java</option>
                <option value="PYTHON">Python</option>
                <option value="JAVASCRIPT">JavaScript</option>
                <option value="CPP">C++</option>
                <option value="C">C</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">Experience Level</label>
              <select
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value)}
                className="w-full bg-background border border-border rounded px-3 py-2 text-sm font-mono text-zinc-200 focus:outline-none focus:border-brand-cyan"
              >
                <option value="BEGINNER">Beginner (L1)</option>
                <option value="EASY">Easy (L2)</option>
                <option value="MEDIUM">Medium (L3 - Mid level)</option>
                <option value="HARD">Hard (L4 - Senior)</option>
                <option value="EXPERT">Expert (Staff+)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">Target Companies</label>
              <div className="relative">
                <Building2 className="absolute left-3 top-3.5 text-zinc-500" size={14} />
                <input
                  type="text"
                  placeholder="NVIDIA, Google, Meta"
                  value={targetCompanies}
                  onChange={(e) => setTargetCompanies(e.target.value)}
                  className="w-full bg-background border border-border rounded pl-10 pr-3 py-2.5 text-sm font-mono text-zinc-200 focus:outline-none focus:border-brand-cyan"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded bg-brand-violet text-white font-bold font-mono text-sm hover:bg-brand-violet/90 transition flex items-center justify-center space-x-2 pt-4"
          >
            {loading ? (
              <Activity className="animate-spin" size={16} />
            ) : (
              <>
                <span>Generate DNA Parameters</span>
                <Sparkles size={14} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Onboarding;
