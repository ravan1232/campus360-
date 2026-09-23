import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, getRoleDefaultPath } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import {
  GraduationCap,
  Lock,
  Mail,
  ArrowRight,
  Shield,
  BookOpen,
  User,
  DollarSign,
  Bus,
  KeyRound,
  CheckCircle2
} from 'lucide-react';

const QUICK_ROLES = [
  {
    role: 'admin',
    name: 'Dr. Sarah Jenkins',
    title: 'Principal & Executive Director',
    email: 'admin@campus360.edu',
    icon: Shield,
    color: 'from-purple-500 to-indigo-600',
    badge: 'Executive Hub'
  },
  {
    role: 'teacher',
    name: 'Prof. Marcus Vance',
    title: 'Senior Physics Faculty',
    email: 'teacher@campus360.edu',
    icon: BookOpen,
    color: 'from-blue-500 to-cyan-600',
    badge: 'Classroom & Attendance'
  },
  {
    role: 'student',
    name: 'Aiden Montgomery',
    title: 'Grade 11-A Scholar',
    email: 'student@campus360.edu',
    icon: User,
    color: 'from-emerald-500 to-teal-600',
    badge: 'Courses, Fees & Route'
  },
  {
    role: 'accountant',
    name: 'Rachel Sterling, CPA',
    title: 'Chief Financial Bursar',
    email: 'accountant@campus360.edu',
    icon: DollarSign,
    color: 'from-amber-500 to-orange-600',
    badge: 'Invoicing & Payroll'
  },
  {
    role: 'driver',
    name: 'Robert Henderson',
    title: 'Fleet Lead - Bus 304',
    email: 'driver@campus360.edu',
    icon: Bus,
    color: 'from-cyan-500 to-blue-600',
    badge: 'Route R-14 Transit'
  },
  {
    role: 'gate',
    name: 'Officer Vikram Singh',
    title: 'Campus Security Officer',
    email: 'gate@campus360.edu',
    icon: KeyRound,
    color: 'from-rose-500 to-red-600',
    badge: 'Visitor & Perimeter'
  }
];

const Login = () => {
  const [email, setEmail] = useState('admin@campus360.edu');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const { login, quickLogin } = useAuth();
  const { addToast } = useNotifications();
  const navigate = useNavigate();

  const handleStandardLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      addToast(`Welcome back, ${res.user.name}!`, 'success', 'Login Successful');
      navigate(getRoleDefaultPath(res.user.role));
    } else {
      setErrorMsg(res.message || 'Invalid email or password.');
    }
  };

  const handleQuickRoleSelect = async (roleObj) => {
    setEmail(roleObj.email);
    setPassword('password123');
    setLoading(true);
    setErrorMsg('');

    const res = await quickLogin(roleObj.role);
    setLoading(false);

    if (res.success) {
      addToast(`Logged in as ${roleObj.name} (${roleObj.role})`, 'success', 'Demo Session Ready');
      navigate(getRoleDefaultPath(roleObj.role));
    } else {
      setErrorMsg(res.message || 'Quick login encountered an error.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative ambient background glows */}
      <div className="absolute top-0 -left-40 w-96 h-96 bg-brand-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 -right-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center px-4">
        {/* Brand Crest */}
        <div className="inline-flex p-3 rounded-2xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-violet-500 text-white shadow-xl shadow-brand-500/30 mb-4 ring-1 ring-white/20">
          <GraduationCap className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-extrabold tracking-tight text-white">
          Campus 360
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          Unified Full-Stack Enterprise School ERP System
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl relative z-10 px-4">
        <div className="glass-card bg-slate-900/80 border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-xl">
          
          {errorMsg && (
            <div className="mb-6 p-4 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs font-medium flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
              {errorMsg}
            </div>
          )}

          {/* Login Form */}
          <form className="space-y-4" onSubmit={handleStandardLogin}>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Institutional Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-700 bg-slate-950/60 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all"
                  placeholder="name@campus360.edu"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-700 bg-slate-950/60 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all"
                  placeholder="••••••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-brand-600 via-indigo-600 to-violet-600 hover:from-brand-500 hover:to-violet-500 shadow-lg shadow-brand-500/30 transition-all disabled:opacity-50"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In to Campus 360'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick 1-Click Role Switcher Demo Grid */}
          <div className="mt-8 pt-6 border-t border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                1-Click Quick Demo Sign-In
              </span>
              <span className="text-[11px] text-brand-400 font-medium">
                Password: password123
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {QUICK_ROLES.map((r) => {
                const Icon = r.icon;
                return (
                  <button
                    key={r.role}
                    type="button"
                    onClick={() => handleQuickRoleSelect(r)}
                    className="p-3 rounded-xl border border-slate-800 bg-slate-950/40 hover:bg-slate-800/60 hover:border-slate-700 transition-all text-left flex flex-col justify-between group"
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <div className={`p-1.5 rounded-lg bg-gradient-to-br ${r.color} text-white`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 group-hover:text-brand-400">
                        {r.role}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-slate-200 truncate mt-1">
                      {r.name.split(' ')[0]} {r.name.split(' ')[1] || ''}
                    </span>
                    <span className="text-[10px] text-slate-500 truncate">
                      {r.badge}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* Footer info */}
        <p className="mt-6 text-center text-xs text-slate-500">
          Campus 360 ERP • Multi-Tenant RBAC Architecture • 2026 Academic Edition
        </p>
      </div>
    </div>
  );
};

export default Login;
