import React, { useEffect, useState } from 'react'
import { Navigate, Route, Routes, useNavigate, useLocation } from 'react-router-dom'
import {
  Activity, AlertCircle, ArrowRight, BarChart3, Bell, BookOpen, Bus,
  CalendarDays, CheckCircle2, ChevronDown, CircleDollarSign, ClipboardCheck,
  CreditCard, DoorOpen, FileText, GraduationCap, HelpCircle, LayoutDashboard,
  LogOut, Menu, MessageSquare, Moon, MoreHorizontal, Receipt, Search, Settings,
  ShieldCheck, Sun, Users, WalletCards, X, QrCode, Scan, Plus, UserPlus, Eye,
  Check, Clock, MapPin, Sparkles, Filter, RefreshCw, Car, Shield, Smartphone,
  AlertTriangle, ExternalLink, Radio, Printer, Camera
} from 'lucide-react'
import { roles, dashboardData, activities } from './data'
import { api } from './services/api'
import QrPassModal from './components/qr/QrPassModal'
import QrScannerModal from './components/qr/QrScannerModal'
import HalfDayLeaveModal from './components/tickets/HalfDayLeaveModal'
import LiveBusTracker from './components/transport/LiveBusTracker'
import UserCreationModal from './components/admin/UserCreationModal'
import GuardMobileScanner from './pages/gate/GuardMobileScanner'
import GuardPhoneConnectModal from './components/gate/GuardPhoneConnectModal'
import GateOutTimeSlipModal from './components/gate/GateOutTimeSlipModal'

const roleStorage = 'campus360_role'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/guard-scanner" element={<GuardMobileScanner />} />
      <Route path="/gate-mobile" element={<GuardMobileScanner />} />
      <Route path="/*" element={<ProtectedApp />} />
    </Routes>
  )
}

function ProtectedApp() {
  const [role, setRole] = useState(localStorage.getItem(roleStorage) || 'ADMIN')
  const navigate = useNavigate()
  const location = useLocation()

  // Auto-sync role when user enters URL like /admin, /teacher, /student, /gate, /driver, /accountant
  useEffect(() => {
    const p = location.pathname.toLowerCase()
    if (p.startsWith('/admin') && role !== 'ADMIN') {
      setRole('ADMIN')
      localStorage.setItem(roleStorage, 'ADMIN')
    } else if (p.startsWith('/teacher') && role !== 'TEACHER') {
      setRole('TEACHER')
      localStorage.setItem(roleStorage, 'TEACHER')
    } else if (p.startsWith('/student') && role !== 'STUDENT') {
      setRole('STUDENT')
      localStorage.setItem(roleStorage, 'STUDENT')
    } else if ((p.startsWith('/gate') || p.startsWith('/gate-security')) && role !== 'GATE_GUARD') {
      setRole('GATE_GUARD')
      localStorage.setItem(roleStorage, 'GATE_GUARD')
    } else if (p.startsWith('/driver') && role !== 'DRIVER') {
      setRole('DRIVER')
      localStorage.setItem(roleStorage, 'DRIVER')
    } else if (p.startsWith('/accountant') && role !== 'ACCOUNTANT') {
      setRole('ACCOUNTANT')
      localStorage.setItem(roleStorage, 'ACCOUNTANT')
    }
  }, [location.pathname])

  const logout = () => {
    localStorage.removeItem(roleStorage)
    localStorage.removeItem('campus360_token')
    localStorage.removeItem('campus360_user')
    setRole(null)
    navigate('/login')
  }

  const switchRole = (newRole) => {
    localStorage.setItem(roleStorage, newRole)
    setRole(newRole)
    const rolePaths = {
      ADMIN: '/admin',
      TEACHER: '/teacher',
      STUDENT: '/student',
      GATE_GUARD: '/gate',
      DRIVER: '/driver',
      ACCOUNTANT: '/accountant'
    }
    navigate(rolePaths[newRole] || '/dashboard')
  }

  return (
    <ERPLayout role={role} onLogout={logout} onSwitchRole={switchRole}>
      <Routes>
        <Route path="/" element={<Dashboard role={role} />} />
        <Route path="/dashboard" element={<Dashboard role={role} />} />
        
        {/* Explicit Role Dashboard Routes */}
        <Route path="/admin" element={<Dashboard role="ADMIN" />} />
        <Route path="/admin/*" element={<Dashboard role="ADMIN" />} />
        <Route path="/teacher" element={<Dashboard role="TEACHER" />} />
        <Route path="/teacher/*" element={<Dashboard role="TEACHER" />} />
        <Route path="/student" element={<Dashboard role="STUDENT" />} />
        <Route path="/student/*" element={<Dashboard role="STUDENT" />} />
        <Route path="/gate" element={<Dashboard role="GATE_GUARD" />} />
        <Route path="/gate/*" element={<Dashboard role="GATE_GUARD" />} />
        <Route path="/driver" element={<Dashboard role="DRIVER" />} />
        <Route path="/driver/*" element={<Dashboard role="DRIVER" />} />
        <Route path="/accountant" element={<Dashboard role="ACCOUNTANT" />} />
        <Route path="/accountant/*" element={<Dashboard role="ACCOUNTANT" />} />

        {/* Modules */}
        <Route path="/students" element={<ModulePage role={role} title="Students" icon={GraduationCap} />} />
        <Route path="/attendance" element={<ModulePage role={role} title="Attendance" icon={ClipboardCheck} />} />
        <Route path="/fees" element={<ModulePage role={role} title="Fees & Payments" icon={CircleDollarSign} />} />
        <Route path="/payroll" element={<ModulePage role={role} title="Payroll" icon={WalletCards} />} />
        <Route path="/transport" element={<ModulePage role={role} title="Transport" icon={Bus} />} />
        <Route path="/academics" element={<ModulePage role={role} title="Academics" icon={BookOpen} />} />
        <Route path="/helpdesk" element={<Helpdesk role={role} />} />
        <Route path="/reports" element={<ModulePage role={role} title="Reports & Analytics" icon={BarChart3} />} />
        <Route path="/settings" element={<ModulePage role={role} title="Settings" icon={Settings} />} />
        <Route path="*" element={<Dashboard role={role} />} />
      </Routes>
    </ERPLayout>
  )
}

function Login() {
  const [selected, setSelected] = useState('ADMIN')
  const [username, setUsername] = useState('admin@campus360.edu')
  const [password, setPassword] = useState('password123')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleRoleSelect = (roleKey) => {
    setSelected(roleKey)
    const emailMap = {
      ADMIN: 'admin@campus360.edu',
      TEACHER: 'teacher@campus360.edu',
      STUDENT: 'student@campus360.edu',
      ACCOUNTANT: 'accountant@campus360.edu',
      DRIVER: 'driver@campus360.edu',
      GATE_GUARD: 'gate@campus360.edu'
    }
    setUsername(emailMap[roleKey] || 'demo@campus360.edu')
  }

  const login = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await api.post('/auth/login', {
        email: username,
        password: password,
        role: selected.toLowerCase() === 'gate_guard' ? 'gate' : selected.toLowerCase()
      })

      localStorage.setItem(roleStorage, selected)
      if (res.token) localStorage.setItem('campus360_token', res.token)
      if (res.user) localStorage.setItem('campus360_user', JSON.stringify(res.user))

      navigate('/dashboard')
    } catch (err) {
      console.warn('Login request handled locally:', err)
      localStorage.setItem(roleStorage, selected)
      navigate('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="grid min-h-screen lg:grid-cols-2">
        {/* Left Side: School Campus Hero Photography Banner */}
        <div className="relative hidden overflow-hidden lg:flex lg:flex-col lg:justify-between p-12">
          {/* Background School Picture with Dark Gradient Scrim */}
          <div className="absolute inset-0 z-0">
            <img
              src="/images/campus_hero.jpg"
              alt="Campus 360 International School Building"
              className="w-full h-full object-cover object-center scale-105 hover:scale-100 transition-transform duration-1000"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-blue-950/75" />
          </div>

          <div className="relative z-10">
            <Brand light />
            <div className="mt-20 max-w-xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-blue-200 backdrop-blur-md">
                <ShieldCheck size={16} className="text-emerald-400" />
                <span>Enterprise School ERP · Live QR Access Control</span>
              </div>
              <h1 className="text-5xl font-extrabold leading-tight tracking-tight text-white drop-shadow-md">
                One platform for your entire school.
              </h1>
              <p className="mt-6 text-lg leading-8 text-blue-100/90 font-medium drop-shadow">
                Real-time connection between student half-day outpasses, class teacher approvals, live transit bus tracking, and gate security verification.
              </p>
            </div>
          </div>

          {/* Feature Badges with School Thumbnails */}
          <div className="relative z-10 grid grid-cols-3 gap-4 text-xs font-semibold text-white">
            <div className="p-3 rounded-2xl bg-white/10 backdrop-blur border border-white/15 flex items-center gap-2.5">
              <Users className="text-cyan-400" size={18} />
              <span>6 Unified Portals</span>
            </div>
            <div className="p-3 rounded-2xl bg-white/10 backdrop-blur border border-white/15 flex items-center gap-2.5">
              <QrCode className="text-emerald-400" size={18} />
              <span>Digital Gate QR Passes</span>
            </div>
            <div className="p-3 rounded-2xl bg-white/10 backdrop-blur border border-white/15 flex items-center gap-2.5">
              <Bus className="text-amber-400" size={18} />
              <span>Live Bus GPS Transit</span>
            </div>
          </div>
        </div>

        {/* Right Side: Modern Login Form with 1-Click Role Switcher */}
        <div className="flex items-center justify-center bg-slate-50 p-6 text-slate-900 dark:bg-slate-900 dark:text-slate-100">
          <div className="w-full max-w-md">
            <div className="mb-8 lg:hidden"><Brand /></div>
            
            <div className="card p-8 shadow-xl border border-slate-200 dark:border-slate-800">
              <div className="mb-6">
                <p className="text-xs font-bold uppercase tracking-wider text-blue-600">CAMPUS360 ENTERPRISE SUITE</p>
                <h2 className="mt-1 text-3xl font-extrabold tracking-tight">Sign in</h2>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Select a portal or enter credentials to continue.</p>
              </div>

              {/* 1-Click Role Selector Chips */}
              <div className="mb-6">
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Select Role Portal
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(roles).map(([key, r]) => {
                    const isSelected = selected === key
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => handleRoleSelect(key)}
                        className={`p-2 rounded-xl text-xs font-bold text-center border transition-all ${
                          isSelected
                            ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/30'
                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-blue-400'
                        }`}
                      >
                        {r.short || r.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              <form onSubmit={login} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                    Email / Username
                  </label>
                  <input
                    className="input"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter school email"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                    Password
                  </label>
                  <input
                    className="input"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                </div>

                <div className="flex items-center justify-between text-xs">
                  <label className="flex items-center gap-2 text-slate-600 dark:text-slate-400 cursor-pointer">
                    <input type="checkbox" className="h-4 w-4 rounded text-blue-600" defaultChecked /> Remember me
                  </label>
                  <button type="button" className="font-semibold text-blue-600 hover:underline">Forgot password?</button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary flex w-full items-center justify-center gap-2 py-3 text-sm font-bold bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/25"
                >
                  {loading ? 'Authenticating...' : `Enter as ${roles[selected]?.label || selected}`}
                  <ArrowRight size={18} />
                </button>
              </form>

              <div className="mt-5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-900/60 p-3.5 text-xs text-blue-900 dark:text-blue-200">
                <strong>Instant Demo Access:</strong> Choose any role above (Admin, Teacher, Student, Gate Security, Driver, Accountant) to access live real-time tools.
              </div>
            </div>

            <p className="mt-6 text-center text-xs text-slate-400">© 2026 Campus360 · Next-Gen Smart School ERP</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function ERPLayout({ role, onLogout, onSwitchRole, children }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [dark, setDark] = useState(false)
  const [roleMenuOpen, setRoleMenuOpen] = useState(false)
  const nav = navigationFor(role) || []
  const r = roles[role] || roles.ADMIN

  return (
    <div className={dark ? 'dark' : ''}>
      <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        {mobileOpen && <div onClick={() => setMobileOpen(false)} className="fixed inset-0 z-30 bg-slate-950/50 lg:hidden" />}
        
        <aside className={`fixed inset-y-0 left-0 z-40 w-72 transform border-r border-slate-200 bg-white transition-transform dark:border-slate-800 dark:bg-slate-900 lg:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex h-full flex-col">
            <div className="flex h-20 items-center justify-between border-b border-slate-100 px-6 dark:border-slate-800">
              <Brand />
              <button onClick={() => setMobileOpen(false)} className="lg:hidden"><X /></button>
            </div>
            
            <div className="border-b border-slate-100 p-4 dark:border-slate-800">
              <p className="mb-2 px-1 text-[10px] font-black uppercase tracking-widest text-slate-400">
                ACTIVE PORTAL
              </p>
              <div
                onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                className="cursor-pointer rounded-2xl bg-slate-50 p-3.5 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 hover:border-blue-400 transition"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="grid h-11 w-11 place-items-center rounded-xl bg-blue-600 font-bold text-white shadow-md shadow-blue-600/30">
                      {(r.short || r.label)[0]}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-slate-900 dark:text-white">{r.label}</p>
                      <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold">Click to Switch</p>
                    </div>
                  </div>
                  <ChevronDown size={16} className={`text-slate-400 transition-transform ${roleMenuOpen ? 'rotate-180' : ''}`} />
                </div>
              </div>

              {/* 1-Click Role Switcher Grid in Sidebar */}
              <div className="mt-3 grid grid-cols-2 gap-1.5">
                {Object.entries(roles).map(([k, ro]) => (
                  <button
                    key={k}
                    onClick={() => {
                      onSwitchRole(k);
                      setRoleMenuOpen(false);
                    }}
                    className={`px-2 py-1.5 text-[11px] font-bold rounded-xl transition text-left truncate flex items-center gap-1.5 ${
                      role === k
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    <span>{k === 'ADMIN' ? '👑' : k === 'TEACHER' ? '👨‍🏫' : k === 'STUDENT' ? '🎓' : k === 'GATE_GUARD' ? '🛡️' : k === 'DRIVER' ? '🚌' : '💼'}</span>
                    <span className="truncate">{ro.short || ro.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <nav className="flex-1 overflow-y-auto p-4">
              <p className="mb-3 px-3 text-[11px] font-bold uppercase tracking-widest text-slate-400">Workspace</p>
              <div className="space-y-1">
                {nav.map(item => <NavItem key={item.to} {...item} />)}
              </div>
              <p className="mb-3 mt-7 px-3 text-[11px] font-bold uppercase tracking-widest text-slate-400">System</p>
              <NavItem to="/helpdesk" label="Help & Support" icon={HelpCircle} />
              <NavItem to="/settings" label="Settings" icon={Settings} />
            </nav>
            
            <div className="border-t border-slate-100 p-4 dark:border-slate-800">
              <button onClick={onLogout} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-slate-600 hover:bg-red-50 hover:text-red-600 dark:text-slate-300 dark:hover:bg-red-950/30 transition-colors">
                <LogOut size={18} /> Sign out
              </button>
            </div>
          </div>
        </aside>

        <div className="lg:pl-72">
          <header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95 md:px-8 gap-3">
            <div className="flex items-center gap-3">
              <button onClick={() => setMobileOpen(true)} className="rounded-xl p-2 hover:bg-slate-100 lg:hidden dark:hover:bg-slate-800"><Menu /></button>
              <div className="relative hidden md:block">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                <input className="w-64 sm:w-80 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-100/90 py-2.5 pl-10 pr-4 text-xs font-semibold outline-none focus:border-blue-600 focus:bg-white dark:bg-slate-800 dark:focus:bg-slate-900 transition" placeholder="Search students, staff, tickets, passes..." />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button onClick={() => setDark(!dark)} className="rounded-xl p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" title="Toggle theme">
                {dark ? <Sun size={19} /> : <Moon size={19} />}
              </button>
              <button className="relative rounded-xl p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <Bell size={19} />
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
              </button>
              
              <div className="ml-2 flex items-center gap-3 border-l border-slate-200 pl-4 dark:border-slate-700">
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-black text-slate-900 dark:text-white">
                    {role === 'STUDENT' ? 'Aiden Montgomery' : role === 'TEACHER' ? 'Prof. Marcus Vance' : role === 'GATE_GUARD' ? 'Officer Vikram Singh' : role === 'DRIVER' ? 'Robert Henderson' : role === 'ACCOUNTANT' ? 'Rachel Sterling' : 'Dr. Sarah Jenkins'}
                  </p>
                  <p className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">{r.label}</p>
                </div>
                <div className="grid h-10 w-10 place-items-center rounded-2xl bg-blue-600 font-black text-white shadow-md shadow-blue-600/30">
                  {(r.short || r.label)[0]}
                </div>
              </div>
            </div>
          </header>
          
          <main className="min-h-[calc(100vh-80px)] p-4 md:p-8">{children}</main>
        </div>
      </div>
    </div>
  )
}

function Dashboard({ role }) {
  const d = dashboardData[role] || dashboardData.ADMIN
  const [isHalfDayModalOpen, setIsHalfDayModalOpen] = useState(false)
  const [isScannerOpen, setIsScannerOpen] = useState(false)
  const [isPhoneConnectOpen, setIsPhoneConnectOpen] = useState(false)
  const [selectedLogSlip, setSelectedLogSlip] = useState(null)
  const [isUserModalOpen, setIsUserModalOpen] = useState(false)
  const [viewingPass, setViewingPass] = useState(null)
  const [pendingLeaves, setPendingLeaves] = useState([])
  const [approvedPass, setApprovedPass] = useState({
    token: 'OUTPASS-STD042-9981',
    type: 'student_outpass',
    title: 'Student Half-Day Digital Outpass',
    holder_name: 'Aiden Montgomery',
    holder_id: 'STD-2026-042',
    reason: 'Specialist Orthodontic Appointment with Dr. Hayes',
    departure_time: '12:30 PM',
    approved_by: 'Prof. Marcus Vance (Class Teacher)',
    parent_contact: 'Eleanor Montgomery (+1-555-0999)',
    valid_until: 'Today, 03:00 PM',
    status: 'approved'
  })

  // Teacher Approval Action
  const handleTeacherApprove = async (leaveId) => {
    try {
      const res = await api.patch(`/tickets/half-day-leaves/${leaveId}/approve`, {})
      if (res && res.success) {
        setPendingLeaves(prev => prev.map(l => l.id === leaveId ? { ...l, status: 'approved', qr_token: res.leave.qr_token } : l))
      }
    } catch (e) {
      console.warn('Teacher approval handled:', e)
    }
  }

  const [gateLogs, setGateLogs] = useState([
    {
      id: 1,
      token: 'OUTPASS-STD042-9981',
      holder_name: 'Aiden Montgomery',
      type: 'Student Half-Day Outpass',
      reason: 'Specialist Orthodontic Appointment with Dr. Hayes',
      scanned_at: '12:35 PM',
      out_time: '12:35 PM (23 Sep 2026)',
      device: '📱 Guard Security Phone #01',
      action: 'GATE_EXIT_VERIFIED',
      gate: 'Main West Gate',
      officer: 'Officer Vikram Singh',
      status: 'EXIT_RECORDED'
    },
    {
      id: 2,
      token: 'FACULTY-TCH8821',
      holder_name: 'Prof. Marcus Vance',
      type: 'Faculty Emergency Pass',
      reason: 'Urgent Family & Medical Clearance',
      scanned_at: '11:15 AM',
      out_time: '11:15 AM (23 Sep 2026)',
      device: '📱 Guard Security Phone #01',
      action: 'GATE_EXIT_VERIFIED',
      gate: 'Main West Gate',
      officer: 'Officer Vikram Singh',
      status: 'EXIT_RECORDED'
    }
  ]);

  const fetchGateLogs = async () => {
    try {
      const res = await api.get('/gate/qr/logs');
      if (res && res.logs && res.logs.length > 0) setGateLogs(res.logs);
    } catch (e) {}
  };

  // Load initial backend leaves and gate logs
  useEffect(() => {
    const fetchLeaves = async () => {
      try {
        const res = await api.get('/tickets/half-day-leaves');
        if (res && res.leaves) {
          setPendingLeaves(res.leaves);
        }
      } catch (e) {}
    };
    fetchLeaves();
    fetchGateLogs();
  }, []);

  // School image mapping by role
  const heroImageMap = {
    ADMIN: { img: '/images/campus_hero.jpg', caption: 'Campus 360 Main Academic Complex' },
    TEACHER: { img: '/images/smart_classroom.jpg', caption: 'STEM & Robotics Smart Learning Hub' },
    STUDENT: { img: '/images/smart_classroom.jpg', caption: 'Modern Digital Library & Innovation Lab' },
    GATE_GUARD: { img: '/images/gate_security.jpg', caption: 'Main Campus West Gate Security Control' },
    DRIVER: { img: '/images/campus_bus.jpg', caption: 'Fleet Transit Bus 304 on Route 14' },
    ACCOUNTANT: { img: '/images/campus_hero.jpg', caption: 'Campus 360 Bursar & Administrative Wing' }
  }

  const currentHero = heroImageMap[role] || heroImageMap.ADMIN

  return (
    <div className="mx-auto max-w-[1600px] space-y-7">
      
      {/* Top Banner & Date */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-semibold text-blue-600">OVERVIEW</p>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight md:text-4xl">{d.title}</h1>
          <p className="mt-2 text-slate-500 dark:text-slate-400">{d.subtitle}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {role === 'STUDENT' && (
            <>
              <button
                onClick={() => setIsHalfDayModalOpen(true)}
                className="btn-primary flex items-center gap-2 bg-amber-600 hover:bg-amber-500 shadow-md text-xs py-2 px-3.5"
              >
                <LogOut size={16} /> Apply for Half-Day Leave
              </button>
              <button
                onClick={() => {
                  const emgToken = `EMG-STD-${Math.floor(1000 + Math.random() * 9000)}`;
                  setViewingPass({
                    token: emgToken,
                    type: 'student_emergency_outpass',
                    title: 'Student Urgent Medical / Emergency Pass',
                    holder_name: 'Aiden Montgomery',
                    holder_id: 'STD-2026-042',
                    reason: 'Urgent Medical Emergency / Infirmary Referral',
                    departure_time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    parent_contact: 'Eleanor Montgomery (+1-555-0999)',
                    valid_until: 'Today, 04:00 PM',
                    emergency: true,
                    status: 'approved'
                  });
                }}
                className="btn-danger flex items-center gap-2 text-xs py-2 px-3.5 shadow-md"
              >
                <AlertTriangle size={16} /> 🚨 Emergency Gate Outpass
              </button>
            </>
          )}

          {role === 'TEACHER' && (
            <button
              onClick={() => {
                const emgToken = `EMG-TCH-${Math.floor(1000 + Math.random() * 9000)}`;
                setViewingPass({
                  token: emgToken,
                  type: 'faculty_emergency_outpass',
                  title: 'Teacher Emergency Gate Clearance Pass',
                  holder_name: 'Prof. Marcus Vance',
                  holder_id: 'TCH-8821',
                  department: 'Physics & Applied Sciences',
                  reason: 'Urgent Family & Medical Clearance',
                  departure_time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  valid_until: 'Today, 06:00 PM',
                  emergency: true,
                  status: 'approved'
                });
              }}
              className="btn-danger flex items-center gap-2 text-xs py-2 px-3.5 shadow-md"
            >
              <AlertTriangle size={16} /> 🚨 Request Emergency Gate Pass
            </button>
          )}

          {role === 'GATE_GUARD' && (
            <>
              <button
                onClick={() => setIsPhoneConnectOpen(true)}
                className="btn-secondary flex items-center gap-2 text-xs py-2 px-3.5 shadow-md border-emerald-500/40 text-emerald-700 dark:text-emerald-300 font-bold"
              >
                <Smartphone size={16} className="text-emerald-500" /> 📱 Connect Guard Phone
              </button>
              <button
                onClick={() => setIsScannerOpen(true)}
                className="btn-emerald flex items-center gap-2 text-xs py-2 px-3.5 shadow-md"
              >
                <Camera size={16} /> 📷 Open Camera Scanner
              </button>
            </>
          )}

          {role === 'ADMIN' && (
            <button
              onClick={() => setIsUserModalOpen(true)}
              className="btn-primary flex items-center gap-2 text-xs py-2 px-3.5 shadow-md"
            >
              <UserPlus size={16} /> + Add Campus Member
            </button>
          )}

          <div className="btn-secondary flex items-center justify-center gap-2 text-xs py-2 px-3 font-bold">
            <CalendarDays size={16} /> 23 September 2026
          </div>
        </div>
      </div>

      {/* Role-Specific School Photo Hero Banner */}
      <div className="relative h-48 sm:h-56 w-full rounded-3xl overflow-hidden shadow-md">
        <img
          src={currentHero.img}
          alt={currentHero.caption}
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-950/60 to-transparent" />
        
        <div className="absolute inset-0 p-6 sm:p-8 flex flex-col justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/20 text-white backdrop-blur border border-white/20">
              <ShieldCheck size={14} className="text-emerald-400" />
              {currentHero.caption}
            </span>
          </div>

          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-white drop-shadow">
              Welcome back, {role === 'STUDENT' ? 'Aiden Montgomery' : role === 'TEACHER' ? 'Prof. Marcus Vance' : role === 'GATE_GUARD' ? 'Officer Vikram Singh' : role === 'DRIVER' ? 'Robert Henderson' : role === 'ACCOUNTANT' ? 'Rachel Sterling' : 'Dr. Sarah Jenkins'}
            </h2>
            <p className="text-sm text-blue-100/90 mt-1 max-w-xl">
              {role === 'GATE_GUARD'
                ? 'Universal QR code verification, instant outpass checkout, and vehicle fleet monitoring.'
                : role === 'STUDENT'
                ? 'Your active timetable, digital outpass logout pass, and real-time bus GPS tracker.'
                : role === 'TEACHER'
                ? 'Manage class attendance, review student half-day leave outpass applications, and marks.'
                : 'Enterprise School Management, Cross-Role Workflow Automation & Campus Safety.'}
            </p>
          </div>
        </div>
      </div>

      {/* Role-Specific Featured Alert Banner for Student */}
      {role === 'STUDENT' && approvedPass && (
        <div className="p-5 rounded-3xl bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 dark:from-emerald-950/40 dark:via-slate-900 dark:to-blue-950/40 border border-emerald-300 dark:border-emerald-800 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-md shadow-emerald-600/30">
              <QrCode className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                Active QR Outpass Ready for Gate Logout
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                Approved by Class Teacher Prof. Marcus Vance • Departure: {approvedPass.departure_time} • Token: {approvedPass.token}
              </p>
            </div>
          </div>
          <button
            onClick={() => setViewingPass(approvedPass)}
            className="btn-primary flex items-center gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-500 shrink-0 shadow-md"
          >
            <Eye size={16} /> Display Gate QR Pass
          </button>
        </div>
      )}

      {/* Teacher Role: Half-Day Leave Approval Tray */}
      {role === 'TEACHER' && (
        <div className="card p-6 border-l-4 border-l-blue-600">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                Student Half-Day Gate Outpass Requests
              </h3>
              <p className="text-xs text-slate-500">
                Review and approve student early departure requests. Approved requests instantly generate encrypted Digital QR Outpasses.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
              {pendingLeaves.length} Applications
            </span>
          </div>

          <div className="mt-4 space-y-3">
            {pendingLeaves.map(leave => (
              <div key={leave.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-slate-900 dark:text-white">{leave.student_name}</span>
                    <span className="text-xs text-slate-400">({leave.roll || 'STD-042'}) · {leave.grade || 'Grade 11-A'}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      leave.status === 'approved' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                    }`}>
                      {leave.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    <strong>Reason:</strong> {leave.reason} • <strong>Intended Departure:</strong> {leave.departure_time}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Parent: {leave.parent_confirmation} • Mode: {leave.transport_mode || 'Parent Pickup'}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {leave.status === 'approved' ? (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 font-bold text-xs">
                      <CheckCircle2 size={16} /> QR Outpass Issued: {leave.qr_token}
                    </div>
                  ) : (
                    <button
                      onClick={() => handleTeacherApprove(leave.id)}
                      className="btn-primary flex items-center gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-500 shadow-sm"
                    >
                      <Check size={16} /> Approve & Issue QR Outpass
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Gate Guard Role: Gate Security Quick Access */}
      {role === 'GATE_GUARD' && (
        <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            {/* Card 1: Live Camera Console */}
            <div className="card p-6 border-l-4 border-l-emerald-600 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center font-bold">
                    <Scan size={24} />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Gate Scanner Console</h3>
                    <p className="text-xs text-slate-500">Scan passes with live desktop/tablet camera.</p>
                  </div>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-4 leading-relaxed">
                  Scan student outpasses, emergency teacher passes, and vehicle permits. Automatic laser reticle and instant exit logging.
                </p>
              </div>
              <button
                onClick={() => setIsScannerOpen(true)}
                className="btn-primary mt-6 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 py-3 shadow-md"
              >
                <Scan size={18} /> Open Live Scanner Console
              </button>
            </div>

            {/* Card 2: Guard Mobile Phone Scanner Connect */}
            <div className="card p-6 border-l-4 border-l-indigo-600 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center font-bold">
                    <Smartphone size={24} />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Connect Guard Phone</h3>
                    <p className="text-xs text-slate-500">Handheld smartphone scanner with out-time sync.</p>
                  </div>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-4 leading-relaxed">
                  Pair your personal smartphone camera to scan passes anywhere at the gate. Scans automatically record and commit out-time details to the database.
                </p>
              </div>
              <div className="mt-6 flex gap-2">
                <button
                  onClick={() => setIsPhoneConnectOpen(true)}
                  className="btn-secondary flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-bold border-indigo-500/50 text-indigo-700 dark:text-indigo-300"
                >
                  <Smartphone size={16} /> Connect Phone
                </button>
                <button
                  onClick={() => window.open('/guard-scanner', '_blank', 'width=420,height=820')}
                  className="btn-primary flex-1 flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 py-3 text-xs font-black shadow-md shadow-indigo-600/20"
                >
                  <ExternalLink size={16} /> Open Scanner
                </button>
              </div>
            </div>

            {/* Card 3: Issue Universal Gate QR Pass */}
            <div className="card p-6 border-l-4 border-l-blue-600 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center font-bold">
                    <QrCode size={24} />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Issue Gate QR Pass</h3>
                    <p className="text-xs text-slate-500">Instant digital passes for Visitors & Delivery.</p>
                  </div>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-4 leading-relaxed">
                  Issue instant time-limited SVG QR passes for parent meetings, delivery vans, external contractors, and faculty.
                </p>
              </div>
              <button
                onClick={() => {
                  setViewingPass({
                    token: `VIS-${Math.floor(1000 + Math.random() * 9000)}`,
                    type: 'visitor_pass',
                    title: 'Campus Visitor Pass',
                    holder_name: 'Jonathan Reed',
                    holder_id: 'VIS-9941',
                    reason: 'Parent-Teacher Academic Review',
                    departure_time: '04:00 PM',
                    valid_until: 'Today, 05:30 PM',
                    status: 'active'
                  })
                }}
                className="btn-secondary mt-6 flex items-center justify-center gap-2 py-3"
              >
                <QrCode size={18} /> Generate Visitor Pass
              </button>
            </div>
          </div>

        {/* Live Gate Exit & Out-Time Audit Log Table */}
        <div className="card overflow-hidden border-2 border-slate-200 dark:border-slate-800">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                Verified Gate Exit & Out-Time Logs
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Real-time timestamped departures automatically recorded to database upon camera or phone QR scan.
              </p>
            </div>
            <button
              onClick={fetchGateLogs}
              className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5 font-bold"
            >
              <RefreshCw size={14} /> Refresh Logs
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-semibold">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-[11px] font-black uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-3.5">Member Name</th>
                  <th className="px-5 py-3.5">Pass Token</th>
                  <th className="px-5 py-3.5">Category</th>
                  <th className="px-5 py-3.5">Exit Out-Time</th>
                  <th className="px-5 py-3.5">Terminal / Device</th>
                  <th className="px-5 py-3.5">Gate Post</th>
                  <th className="px-5 py-3.5 text-right">Clearance Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {gateLogs.map((log, idx) => (
                  <tr key={log.id || idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                    <td className="px-5 py-3.5 font-bold text-slate-900 dark:text-white">
                      {log.holder_name}
                      <div className="text-[10px] text-slate-400 font-mono font-normal">Officer: {log.officer || 'Vikram Singh'}</div>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-blue-600 dark:text-blue-400 font-bold">{log.token}</td>
                    <td className="px-5 py-3.5 text-slate-600 dark:text-slate-300">{log.type}</td>
                    <td className="px-5 py-3.5 font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                      <span className="inline-flex items-center gap-1">
                        <Clock size={12} className="text-emerald-500" />
                        {log.out_time || log.scanned_at}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600 dark:text-slate-300 font-mono text-[11px]">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border border-slate-200 dark:border-slate-700">
                        <Smartphone size={12} className="text-emerald-500" />
                        {log.device || '📱 Guard Phone #01'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-500">{log.gate || 'Main West Gate'}</td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => setSelectedLogSlip(log)}
                        className="btn-secondary text-[11px] py-1 px-2.5 font-bold hover:border-emerald-500 hover:text-emerald-600 transition"
                      >
                        Inspect Slip
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      )}

      {/* 4 StatCards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {d.stats.map(([label, value, trend, icon]) => (
          <div className="card p-5" key={label}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">{label}</p>
                <p className="mt-2 text-3xl font-extrabold">{value}</p>
              </div>
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-blue-50 text-blue-600 text-lg">{icon}</div>
            </div>
            <p className="mt-4 text-xs font-semibold text-emerald-600">{trend}</p>
          </div>
        ))}
      </div>

      {/* Live Transit GPS Telemetry on Student / Transport / Driver / Admin view */}
      {(role === 'STUDENT' || role === 'DRIVER' || role === 'ADMIN' || role === 'GATE_GUARD') && (
        <LiveBusTracker />
      )}

      {/* Charts & Quick Actions */}
      <div className="grid gap-6 xl:grid-cols-3">
        <div className="card p-6 xl:col-span-2">
          <SectionHeader title="Attendance overview" subtitle="School attendance for the last 7 days" action="View report" />
          <AttendanceChart />
        </div>
        <div className="card p-6">
          <SectionHeader title="Quick actions" subtitle="Common tasks" />
          <div className="mt-5 grid grid-cols-2 gap-3">
            <QuickAction icon={GraduationCap} label="Students" />
            <QuickAction icon={ClipboardCheck} label="Attendance" />
            <QuickAction icon={Receipt} label="Payments" />
            <QuickAction icon={MessageSquare} label="Requests" />
          </div>
        </div>
      </div>

      {/* Modals */}
      <HalfDayLeaveModal
        isOpen={isHalfDayModalOpen}
        onClose={() => setIsHalfDayModalOpen(false)}
        onSubmitted={() => {
          setApprovedPass({
            token: 'OUTPASS-STD042-PENDING',
            type: 'student_outpass',
            title: 'Half-Day Leave Submitted',
            holder_name: 'Aiden Montgomery',
            holder_id: 'STD-2026-042',
            reason: 'Submitted to Prof. Marcus Vance for approval',
            departure_time: '12:30 PM',
            valid_until: 'Pending Teacher Approval',
            status: 'pending'
          })
        }}
      />

      <QrScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanSuccess={() => {
          fetchGateLogs();
        }}
      />

      <UserCreationModal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
      />

      <QrPassModal
        isOpen={!!viewingPass}
        onClose={() => setViewingPass(null)}
        pass={viewingPass}
      />

      <GuardPhoneConnectModal
        isOpen={isPhoneConnectOpen}
        onClose={() => {
          setIsPhoneConnectOpen(false);
          fetchGateLogs();
        }}
      />

      <GateOutTimeSlipModal
        isOpen={!!selectedLogSlip}
        onClose={() => setSelectedLogSlip(null)}
        log={selectedLogSlip}
      />

    </div>
  )
}

function ModulePage({ title, icon: Icon, role }) {
  const data = moduleData(title)
  const roleLabel = (roles[role]?.label || role).toUpperCase()
  const [isScannerOpen, setIsScannerOpen] = useState(false)
  const [isAddUserOpen, setIsAddUserOpen] = useState(false)
  const [viewingPass, setViewingPass] = useState(null)
  const [usersList, setUsersList] = useState([])
  const [filterQuery, setFilterQuery] = useState('')

  // Load backend users for the Students module
  useEffect(() => {
    if (title === 'Students') {
      const fetchUsers = async () => {
        const res = await api.get('/users')
        if (res && res.users) {
          setUsersList(res.users)
        }
      }
      fetchUsers()
    }
  }, [title])

  return (
    <div className="mx-auto max-w-[1600px] space-y-7">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div className="flex items-center gap-4">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-blue-50 text-blue-600"><Icon size={26} /></div>
          <div><p className="text-sm font-semibold text-blue-600">{roleLabel}</p><h1 className="text-3xl font-extrabold">{title}</h1></div>
        </div>

        <div className="flex items-center gap-2">
          {title === 'Gate Management' && (
            <button
              onClick={() => setIsScannerOpen(true)}
              className="btn-primary flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 shadow-md"
            >
              <Scan size={16} /> Scan Gate QR
            </button>
          )}

          {title === 'Students' && (
            <button
              onClick={() => setIsAddUserOpen(true)}
              className="btn-primary flex items-center gap-2 shadow-md"
            >
              <UserPlus size={16} /> + Add Campus Member
            </button>
          )}

          <button
            onClick={() => {
              if (title === 'Gate Management') setIsScannerOpen(true);
              else setIsAddUserOpen(true);
            }}
            className="btn-secondary"
          >
            + Action
          </button>
        </div>
      </div>

      {/* If Gate Management, embed Gate Security photo hero */}
      {title === 'Gate Management' && (
        <div className="relative h-44 sm:h-48 w-full rounded-2xl overflow-hidden shadow-sm">
          <img
            src="/images/gate_security.jpg"
            alt="Campus Gate Security Station"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-950/60 to-transparent p-6 flex flex-col justify-end">
            <h3 className="text-xl font-bold text-white">Main West Gate Security & Access Control</h3>
            <p className="text-xs text-slate-200">Electronic boom barrier control, student outpass checkouts, and staff vehicle RFID registry.</p>
          </div>
        </div>
      )}

      {/* If Transport module, embed Live Bus Location Tracker */}
      {title === 'Transport' && (
        <LiveBusTracker />
      )}

      {/* If Academics module, embed Smart Classroom photo */}
      {title === 'Academics' && (
        <div className="relative h-44 sm:h-48 w-full rounded-2xl overflow-hidden shadow-sm">
          <img
            src="/images/smart_classroom.jpg"
            alt="Smart Classroom and Robotics Hub"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-950/60 to-transparent p-6 flex flex-col justify-end">
            <h3 className="text-xl font-bold text-white">Academic Curriculum & Smart Innovation Labs</h3>
            <p className="text-xs text-slate-200">Class schedules, teacher lesson plans, marks entry, and STEM project submissions.</p>
          </div>
        </div>
      )}

      <div className="card overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-5 md:flex-row md:items-center md:justify-between dark:border-slate-800">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17}/>
            <input
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              className="input py-2.5 pl-10"
              placeholder={`Search ${title.toLowerCase()}...`}
            />
          </div>
          <div className="flex gap-2">
            <button className="btn-secondary flex items-center gap-1.5"><Filter size={15} /> Filter</button>
            <button className="btn-secondary">Export CSV</button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500 dark:bg-slate-800/50">
              <tr>
                <th className="px-6 py-4">Name / Reference</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Updated / Role Details</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {data
                .filter(row => !filterQuery || row.name.toLowerCase().includes(filterQuery.toLowerCase()) || row.ref.toLowerCase().includes(filterQuery.toLowerCase()))
                .map((row, i) => (
                <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="px-6 py-4 font-semibold">
                    {row.name}
                    <div className="text-xs font-normal text-slate-400">{row.ref}</div>
                  </td>
                  <td className="px-6 py-4 text-slate-500">{row.category}</td>
                  <td className="px-6 py-4"><Status text={row.status} /></td>
                  <td className="px-6 py-4 text-slate-500">{row.updated}</td>
                  <td className="px-6 py-4 text-right">
                    {title === 'Gate Management' ? (
                      <button
                        onClick={() => {
                          setViewingPass({
                            token: row.ref,
                            title: row.name,
                            holder_name: row.name,
                            holder_id: row.ref,
                            type: 'gate_pass',
                            valid_until: 'Today, 06:00 PM',
                            status: row.status.toLowerCase()
                          });
                        }}
                        className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1 ml-auto"
                      >
                        <Eye size={14} /> View QR
                      </button>
                    ) : (
                      <button className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800">
                        <MoreHorizontal size={18}/>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <QrScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
      />

      <UserCreationModal
        isOpen={isAddUserOpen}
        onClose={() => setIsAddUserOpen(false)}
        onUserCreated={(newUser) => {
          setUsersList(prev => [newUser, ...prev])
        }}
      />

      <QrPassModal
        isOpen={!!viewingPass}
        onClose={() => setViewingPass(null)}
        pass={viewingPass}
      />
    </div>
  )
}

function Helpdesk() {
  const [isHalfDayModalOpen, setIsHalfDayModalOpen] = useState(false)
  const tickets = [
    ['LV-8891', 'Half-day leave: Orthodontic appointment', 'Academics (Teacher)', 'Approved', 'Student Aiden'],
    ['FIN-1023', 'Fee receipt not visible', 'Finance', 'In Progress', 'Student'],
    ['ACA-2044', 'Attendance correction request', 'Academic', 'Resolved', 'Student'],
    ['TRN-1132', 'Bus pickup delay', 'Transport', 'Open', 'Driver'],
    ['ADM-8841', 'ID card replacement', 'Administration', 'Open', 'Teacher']
  ]
  return (
    <div className="mx-auto max-w-[1400px] space-y-7">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-semibold text-blue-600">SUPPORT CENTER</p>
          <h1 className="mt-1 text-3xl font-extrabold">Help & Support</h1>
          <p className="mt-2 text-slate-500">Route student grievances, half-day leaves, and departmental issues.</p>
        </div>
        <button
          onClick={() => setIsHalfDayModalOpen(true)}
          className="btn-primary"
        >
          + Create request
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <StatBox title="Open" value="12" icon={AlertCircle}/>
        <StatBox title="In progress" value="8" icon={Activity}/>
        <StatBox title="Resolved" value="126" icon={CheckCircle2}/>
        <StatBox title="Avg. response" value="2.4h" icon={MessageSquare}/>
      </div>

      <div className="card overflow-hidden">
        <div className="border-b border-slate-100 p-6 dark:border-slate-800">
          <SectionHeader title="Active requests & outpasses" subtitle="Track every issue from teacher approval to gate exit." />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-800/50">
              <tr>
                <th className="px-6 py-4">Ticket</th>
                <th className="px-6 py-4">Issue / Reason</th>
                <th className="px-6 py-4">Department</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Created by</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {tickets.map(t=>(
                <tr key={t[0]}>
                  <td className="px-6 py-4 font-bold text-blue-600">{t[0]}</td>
                  <td className="px-6 py-4 font-semibold">{t[1]}</td>
                  <td className="px-6 py-4 text-slate-500">{t[2]}</td>
                  <td className="px-6 py-4"><Status text={t[3]}/></td>
                  <td className="px-6 py-4 text-slate-500">{t[4]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <HalfDayLeaveModal
        isOpen={isHalfDayModalOpen}
        onClose={() => setIsHalfDayModalOpen(false)}
      />
    </div>
  )
}

function SectionHeader({title, subtitle, action}) {
  return <div className="flex items-center justify-between gap-3"><div><h2 className="font-bold">{title}</h2><p className="mt-1 text-xs text-slate-500">{subtitle}</p></div>{action && <button className="text-sm font-semibold text-blue-600 hover:underline">{action}</button>}</div>
}

function AttendanceChart() {
  const bars = [72, 81, 78, 88, 94, 91, 95]
  return (
    <div className="mt-8 flex h-56 items-end gap-3 md:gap-6">
      {bars.map((h, i) => (
        <div className="flex flex-1 flex-col items-center gap-3" key={i}>
          <div className="relative flex h-44 w-full items-end justify-center rounded-xl bg-slate-50 dark:bg-slate-800">
            <div
              className="w-2/3 rounded-lg bg-blue-600 transition-all duration-300 hover:bg-blue-700"
              style={{ height: `${h}%` }}
            />
          </div>
          <span className="text-xs font-semibold text-slate-400">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}
          </span>
        </div>
      ))}
    </div>
  )
}

function QuickAction({icon: Icon, label}) {
  return (
    <button className="group flex flex-col items-center gap-3 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 text-sm font-semibold hover:border-blue-200 hover:bg-blue-50/60 dark:hover:bg-slate-800 transition">
      <span className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 group-hover:bg-white dark:group-hover:bg-slate-700 group-hover:text-blue-600 transition shadow-sm">
        <Icon size={19} />
      </span>
      {label}
    </button>
  )
}

function Status({text}) {
  const map = {
    Open: 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300',
    'In Progress': 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300',
    Resolved: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300',
    Approved: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300',
    Pending: 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300',
    Rejected: 'bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-300',
    Active: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'
  }
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${map[text] || 'bg-slate-100 text-slate-600'}`}>
      {text}
    </span>
  )
}

function Brand({light = false}) {
  return (
    <div className="flex items-center gap-3">
      <div className={`grid h-10 w-10 place-items-center rounded-xl ${light ? 'bg-white text-blue-700 shadow-md' : 'bg-blue-600 text-white shadow-md shadow-blue-500/30'} font-black text-lg`}>
        C
      </div>
      <div>
        <div className={`text-lg font-extrabold tracking-tight ${light ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
          Campus360
        </div>
        <div className={`text-[10px] font-semibold uppercase tracking-widest ${light ? 'text-blue-200' : 'text-slate-400'}`}>
          School ERP
        </div>
      </div>
    </div>
  )
}

function StatBox({title, value, icon: Icon}) {
  return (
    <div className="card p-5">
      <Icon className="text-blue-600" size={20} />
      <p className="mt-4 text-sm text-slate-500">{title}</p>
      <p className="mt-1 text-2xl font-extrabold text-slate-800 dark:text-white">{value}</p>
    </div>
  )
}

function NavItem({to, label, icon: Icon}) {
  const location = useLocation()
  const navigate = useNavigate()
  const active = location.pathname === to || (to !== '/dashboard' && location.pathname.startsWith(to))
  return (
    <a
      href={to}
      onClick={(e) => {
        e.preventDefault()
        navigate(to)
      }}
      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
        active
          ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 font-bold'
          : 'text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'
      }`}
    >
      <Icon size={18} />
      {label}
    </a>
  )
}

function navigationFor(role) {
  const common = [{to:'/dashboard',label:'Dashboard',icon:LayoutDashboard}]
  const map = {
    ADMIN: [...common,{to:'/students',label:'Students',icon:GraduationCap},{to:'/academics',label:'Academics',icon:BookOpen},{to:'/attendance',label:'Attendance',icon:ClipboardCheck},{to:'/fees',label:'Finance',icon:CircleDollarSign},{to:'/transport',label:'Transport',icon:Bus},{to:'/gate',label:'Gate Management',icon:DoorOpen},{to:'/reports',label:'Reports',icon:BarChart3}],
    TEACHER: [...common,{to:'/students',label:'My Students',icon:GraduationCap},{to:'/academics',label:'My Classes',icon:BookOpen},{to:'/attendance',label:'Attendance',icon:ClipboardCheck},{to:'/reports',label:'Marks & Reports',icon:BarChart3}],
    STUDENT: [...common,{to:'/academics',label:'My Classes',icon:BookOpen},{to:'/attendance',label:'Attendance',icon:ClipboardCheck},{to:'/fees',label:'Fees',icon:CircleDollarSign},{to:'/transport',label:'Transport',icon:Bus}],
    ACCOUNTANT: [...common,{to:'/fees',label:'Fee Collection',icon:CircleDollarSign},{to:'/payroll',label:'Payroll',icon:WalletCards},{to:'/reports',label:'Financial Reports',icon:BarChart3}],
    DRIVER: [...common,{to:'/transport',label:'My Bus & Route',icon:Bus},{to:'/students',label:'Assigned Students',icon:GraduationCap}],
    GATE_GUARD: [...common,{to:'/gate',label:'Entry & Exit',icon:DoorOpen},{to:'/students',label:'Student Lookup',icon:GraduationCap},{to:'/transport',label:'Vehicle Log',icon:Bus}]
  }
  return map[role] || map.ADMIN
}

function moduleData(title) {
  const sets = {
    Students: [
      ['Aiden Montgomery', 'STD-2026-042 · Class 11-A', 'Student', 'Active', 'Outpass Approved'],
      ['Aarav Sharma','ST-1023 · Class 10-A','Student','Active','2 min ago'],
      ['Ananya Rao','ST-1024 · Class 10-A','Student','Active','15 min ago'],
      ['Kabir Singh','ST-1025 · Class 9-B','Student','Pending','1 hr ago'],
      ['Meera Patel','ST-1026 · Class 8-C','Student','Active','2 hrs ago'],
      ['Prof. Marcus Vance', 'TCH-8821 · Physics Dept', 'Faculty', 'Active', 'Class Teacher 11-A'],
      ['Robert Henderson', 'DRV-104 · Route 14', 'Transport', 'Active', 'Lead Driver BUS-304'],
      ['Officer Vikram Singh', 'SEC-091 · West Gate', 'Security', 'Active', 'Gate Control Officer']
    ],
    Attendance: [['10-A Mathematics','ATT-8821','Class','Approved','Today'],['9-B Science','ATT-8819','Class','Approved','Today'],['8-C English','ATT-8812','Class','Pending','Today'],['7-A Computer','ATT-8808','Class','Approved','Yesterday']],
    'Fees & Payments': [['Aiden Montgomery','INV-2026-002','Term 2 Tuition','Pending','Due Oct 15'],['Aarav Sharma','PAY-5521','Tuition','Approved','8 min ago'],['Ananya Rao','PAY-5520','Transport','Approved','21 min ago'],['Kabir Singh','PAY-5519','Tuition','Pending','1 hr ago'],['Meera Patel','PAY-5518','Tuition','Approved','2 hrs ago']],
    Payroll: [['Prof. Marcus Vance','PAYR-0926','Senior Faculty','Approved','Disbursed'],['Dr. Sarah Jenkins','PAYR-0927','Principal','Approved','Disbursed'],['Robert Henderson','PAYR-0928','Fleet Lead Driver','Approved','Disbursed'],['Rachel Sterling','PAYR-0929','Chief Accountant','Approved','Disbursed']],
    Transport: [['Route 14 · BUS-304','BUS-304','Campus Express (Active GPS)','Approved','Approaching Westfield (3m)'],['Route 12 · BUS-012','BUS-012','East Side Route','Approved','07:30 AM'],['Route 08 · BUS-008','BUS-008','North Suburbs Route','Approved','07:45 AM'],['Fleet Bus 105','BUS-105','Maintenance Inspection','Pending','Tomorrow']],
    'Gate Management': [
      ['Aiden Montgomery · STD-042', 'OUTPASS-STD042-9981', 'Student Half-Day Outpass', 'Approved', 'Teacher Verified (12:30 PM)'],
      ['Robert Henderson · BUS-304', 'VEH-BUS304-2026', 'School Transit Permit', 'Approved', 'Route 14 Clearance'],
      ['Prof. Marcus Vance', 'TCH-8821-2026', 'Senior Faculty Pass', 'Approved', 'Physics Dept'],
      ['Jonathan Reed', 'VIS-4091', 'Visitor Pass', 'Approved', 'Parent Meeting (09:15 AM)'],
      ['Dr. Claire Laurent', 'VIS-4092', 'Guest Lecturer', 'Approved', 'Robotics Dept (10:00 AM)']
    ],
    Academics: [['Mathematics · Class 11-A','CLS-11A-MATH','Subject','Active','Today'],['Physics & Mechanics · Class 11-A','CLS-11A-PHY','Subject','Active','Today'],['Chemistry Lab · Class 11-A','CLS-11A-CHEM','Subject','Active','Yesterday'],['STEM Project: Autonomous Rover','STEM-301','Project','Pending','Due Friday']],
    'Reports & Analytics': [['Campus Gate In/Out Audit Report','REP-GATE-09','Security','Approved','Today'],['Student Attendance Summary','REP-ATT-09','Attendance','Approved','Today'],['Q3 Fee Collection & Dues','REP-FIN-09','Finance','Approved','Today'],['Fleet Route 14 Telemetry Log','REP-TRN-09','Transport','Approved','Today']],
    Settings: [['Gate QR Token Security Policy','SET-SEC-01','Security','Active','Enforced'],['Student Outpass Approval Rules','SET-RULE-02','Policy','Active','Enforced'],['Live GPS Polling Interval','SET-TRN-03','System','Active','15s interval'],['School Profile & Term Dates','SET-ORG-04','Academic','Active','2026-2027']]
  }
  return (sets[title] || sets.Students).map(([name,ref,category,status,updated])=>({name,ref,category,status,updated}))
}

export default App
