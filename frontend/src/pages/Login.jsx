import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { KeyRound, Mail, ArrowRight, Sparkles } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        if (user.role === 'ROLE_ADMIN') {
          navigate('/admin/cars');
        } else {
          navigate('/sales/dashboard');
        }
      }
      toast.success('Welcome back');
    } catch {
      toast.error('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen min-h-[100dvh] flex flex-col lg:flex-row">
      {/* Brand panel — hidden on small phones optional, show from sm */}
      <div className="hidden sm:flex lg:w-[45%] xl:w-[42%] bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 text-white p-8 lg:p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-blue-500 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full bg-indigo-600 blur-3xl" />
        </div>
        <div className="relative">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 backdrop-blur font-bold text-lg ring-1 ring-white/20">
            NT
          </div>
        </div>
        <div className="relative space-y-6 max-w-md">
          <h2 className="text-3xl lg:text-4xl font-bold leading-tight tracking-tight">
            Smart incentive management for automotive sales
          </h2>
          <p className="text-slate-300 text-base leading-relaxed">
            Model-based tier configuration, real-time payout preview, and monthly submission
            tracking — built for Nippon Toyota field teams.
          </p>
          <ul className="space-y-3 text-sm text-slate-400">
            <li className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-400 shrink-0" />
              Per-model incentive slabs
            </li>
            <li className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-400 shrink-0" />
              Role-based admin &amp; sales dashboards
            </li>
            <li className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-400 shrink-0" />
              Secure JWT authentication
            </li>
          </ul>
        </div>
        <p className="relative text-xs text-slate-500">© Nippon Toyota Incentive Platform</p>
      </div>

      {/* Form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 bg-slate-50">
        <div className="w-full max-w-md">
          <div className="sm:hidden text-center mb-8">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white font-bold mb-3">
              NT
            </div>
            <h1 className="text-xl font-bold text-slate-900">Nippon Incentive</h1>
          </div>

          <div className="card card-body shadow-lg shadow-slate-200/50">
            <h2 className="text-xl font-bold text-slate-900 mb-1">Sign in</h2>
            <p className="text-sm text-slate-500 mb-6">Access your dashboard</p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="label-field">Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="input-field pl-10"
                    placeholder="you@company.com"
                    autoComplete="email"
                  />
                </div>
              </div>
              <div>
                <label className="label-field">Password</label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="input-field pl-10"
                    placeholder="••••••••"
                    autoComplete="current-password"
                  />
                </div>
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full py-3">
                {loading ? 'Signing in…' : (
                  <>
                    Sign in
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-slate-100">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
                Demo accounts
              </p>
              <div className="grid grid-cols-1 gap-2 text-xs text-slate-600 bg-slate-50 rounded-xl p-3 ring-1 ring-slate-100">
                <p>
                  <span className="font-semibold text-slate-700">Admin:</span> admin@example.com /
                  admin123
                </p>
                <p>
                  <span className="font-semibold text-slate-700">Sales:</span> sales@example.com /
                  sales123
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
