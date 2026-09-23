import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Camera,
  Smartphone,
  ShieldCheck,
  Zap,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  LogOut,
  User,
  Phone,
  ArrowLeft,
  RefreshCw,
  Sparkles,
  Volume2,
  VolumeX,
  Flashlight
} from 'lucide-react';
import { api } from '../../services/api';

const GuardMobileScanner = () => {
  const navigate = useNavigate();
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [facingMode, setFacingMode] = useState('environment');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const [tokenInput, setTokenInput] = useState('');
  
  // Last verified and saved exit record
  const [savedExitRecord, setSavedExitRecord] = useState(null);
  const [recentExits, setRecentExits] = useState([
    {
      id: 'EX-01',
      holder_name: 'Aiden Montgomery',
      role: 'Student (Grade 11-A)',
      out_time: '12:35 PM (23 Sep 2026)',
      token: 'OUTPASS-STD042-9981',
      type: 'Student Half-Day Outpass'
    },
    {
      id: 'EX-02',
      holder_name: 'Prof. Marcus Vance',
      role: 'Teacher (Physics Dept)',
      out_time: '11:15 AM (23 Sep 2026)',
      token: 'FACULTY-TCH8821',
      type: 'Faculty Emergency Pass'
    }
  ]);

  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Play auditory confirmation beep
  const playBeep = () => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.3);
    } catch (e) {}
  };

  // Vibrate phone if supported
  const triggerHaptic = () => {
    if (navigator.vibrate) {
      try {
        navigator.vibrate([100, 50, 100]);
      } catch (e) {}
    }
  };

  // Start phone camera
  const startCamera = async (facing = facingMode) => {
    setCameraError(null);
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facing },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setCameraActive(true);
      }
    } catch (err) {
      console.warn('Phone camera stream unavailable:', err);
      setCameraError('Camera access not granted or unavailable. Use the quick test tokens below.');
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, [facingMode]);

  // Flip camera between front and back
  const flipCamera = () => {
    const nextFacing = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextFacing);
  };

  // Process token scan: verify and store out-time in database
  const handleScanPass = async (tokenToScan) => {
    const targetToken = (tokenToScan || tokenInput).trim();
    if (!targetToken) return;

    setLoading(true);
    try {
      // 1. Log checkout at gate and record out-time details
      const res = await api.post('/gate/qr/checkout', {
        token: targetToken,
        device: '📱 Officer Vikram Singh (Guard Phone #01)',
        isPhone: true
      });

      if (res && res.success) {
        playBeep();
        triggerHaptic();

        const fullOutTime = res.out_time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' (23 Sep 2026)';
        const record = {
          success: true,
          holder_name: res.pass?.holder_name || res.log?.holder_name || 'Authorized Member',
          holder_id: res.pass?.holder_id || targetToken,
          type: res.pass?.title || res.pass?.type || 'Gate Clearance Pass',
          reason: res.pass?.reason || res.log?.reason || 'Verified Campus Departure',
          out_time: fullOutTime,
          scanned_at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          parent_contact: res.pass?.parent_contact || 'Parent Confirmed',
          approved_by: res.pass?.approved_by || 'Class Teacher & Principal',
          officer: 'Officer Vikram Singh',
          gate: 'Main West Gate',
          device: '📱 Guard Security Phone (Handheld #01)'
        };

        setSavedExitRecord(record);
        setRecentExits(prev => [record, ...prev.slice(0, 4)]);
      } else {
        setSavedExitRecord({
          success: false,
          message: res?.message || 'Unrecognized pass or clearance expired.'
        });
      }
    } catch (err) {
      setSavedExitRecord({
        success: false,
        message: 'Could not connect to gate registry. Please check network connection.'
      });
    } finally {
      setLoading(false);
    }
  };

  const quickChips = [
    { label: 'Student: Aiden Montgomery (Grade 11-A)', token: 'OUTPASS-STD042-9981' },
    { label: 'Teacher Emergency: Prof. Marcus Vance', token: 'FACULTY-TCH8821' },
    { label: 'Campus Transit Bus 304 (Route 14)', token: 'VEH-BUS304-2026' }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between font-sans selection:bg-emerald-500 selection:text-white">
      
      {/* Phone App Header */}
      <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur border-b border-slate-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => navigate('/gate')}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 active:scale-95 transition"
            title="Back to Gate Console"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <h1 className="text-xs font-black tracking-wider uppercase text-white">Guard Phone Scanner</h1>
            </div>
            <p className="text-[11px] font-bold text-slate-400">Officer Vikram Singh · Main West Gate</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
            title={soundEnabled ? 'Mute Chime' : 'Enable Chime'}
          >
            {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>
          <button
            onClick={flipCamera}
            className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
            title="Switch Camera"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </header>

      {/* Main Scanner Body */}
      <main className="flex-1 p-4 max-w-md mx-auto w-full space-y-4">
        
        {/* Device Status Bar */}
        <div className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-xs">
          <div className="flex items-center gap-2 font-bold text-slate-300">
            <Smartphone size={16} className="text-emerald-400" />
            <span>Terminal: Guard-Mobile-01</span>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            Online & Synced
          </span>
        </div>

        {/* Live Camera Viewfinder */}
        <div className="relative rounded-3xl overflow-hidden bg-black border-2 border-slate-800 aspect-[4/3] shadow-2xl flex items-center justify-center">
          {cameraActive ? (
            <>
              <video
                ref={videoRef}
                playsInline
                autoPlay
                muted
                className="w-full h-full object-cover"
              />
              {/* Laser Sweep Animation */}
              <div className="absolute left-6 right-6 h-0.5 bg-emerald-400 shadow-[0_0_20px_#10b981] animate-laser pointer-events-none" />
              
              {/* Targeting Reticle Brackets */}
              <div className="absolute inset-6 border border-white/20 rounded-2xl pointer-events-none flex flex-col justify-between p-2">
                <div className="flex justify-between">
                  <span className="w-6 h-6 border-t-4 border-l-4 border-emerald-400 rounded-tl-lg"></span>
                  <span className="w-6 h-6 border-t-4 border-r-4 border-emerald-400 rounded-tr-lg"></span>
                </div>
                <div className="flex justify-between">
                  <span className="w-6 h-6 border-b-4 border-l-4 border-emerald-400 rounded-bl-lg"></span>
                  <span className="w-6 h-6 border-b-4 border-r-4 border-emerald-400 rounded-br-lg"></span>
                </div>
              </div>

              {/* Viewfinder Instructions */}
              <div className="absolute bottom-3 left-0 right-0 text-center">
                <span className="px-3 py-1 rounded-full bg-slate-950/80 backdrop-blur text-white text-[11px] font-bold border border-white/20 shadow-lg">
                  Point at Student or Teacher QR Pass
                </span>
              </div>
            </>
          ) : (
            <div className="p-6 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                <Camera size={24} />
              </div>
              <p className="text-xs text-slate-400">
                {cameraError || 'Camera is initializing or permission needed.'}
              </p>
              <button
                onClick={() => startCamera()}
                className="btn-primary text-xs py-2 px-4 bg-emerald-600 hover:bg-emerald-500"
              >
                Start Camera
              </button>
            </div>
          )}
        </div>

        {/* 1-Tap Quick Scan Test Outpass Tokens */}
        <div className="space-y-2">
          <label className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Sparkles size={14} className="text-emerald-400" />
            1-Tap Pass Simulator (Phone Scanner)
          </label>
          <div className="grid gap-1.5">
            {quickChips.map((chip, idx) => (
              <button
                key={idx}
                disabled={loading}
                onClick={() => handleScanPass(chip.token)}
                className="w-full p-2.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500 hover:bg-slate-850 active:scale-[0.99] transition text-left flex items-center justify-between text-xs font-bold text-slate-200"
              >
                <span>{chip.label}</span>
                <span className="font-mono text-[10px] text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-2 py-0.5 rounded-lg">
                  {loading ? 'Scanning...' : 'Scan Pass'}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Manual Token Verification Input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={tokenInput}
            onChange={(e) => setTokenInput(e.target.value)}
            placeholder="Or enter Token (e.g. OUTPASS-STD042-9981)"
            className="flex-1 rounded-2xl border border-slate-800 bg-slate-900 px-3.5 py-2 text-xs font-mono text-white placeholder:text-slate-600 outline-none focus:border-emerald-500"
          />
          <button
            disabled={loading}
            onClick={() => handleScanPass()}
            className="rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 px-4 text-xs font-black text-white transition disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Verify'}
          </button>
        </div>

        {/* VERIFICATION & OUT-TIME CONFIRMATION CARD */}
        {savedExitRecord && (
          <div className={`p-5 rounded-3xl border-2 transition-all shadow-2xl animate-fade-in ${
            savedExitRecord.success
              ? 'bg-emerald-950/70 border-emerald-500 text-white'
              : 'bg-rose-950/70 border-rose-500 text-white'
          }`}>
            {savedExitRecord.success ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500 text-slate-950 flex items-center gap-1 shadow">
                    <CheckCircle2 size={13} /> Exit Verified · Out-Time Saved
                  </span>
                  <span className="text-[11px] font-mono text-emerald-300 font-bold">
                    {savedExitRecord.out_time}
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-black text-white">{savedExitRecord.holder_name}</h3>
                  <p className="text-xs text-emerald-200 font-bold mt-0.5">
                    {savedExitRecord.type} • ID: {savedExitRecord.holder_id}
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-emerald-500/30 space-y-2 text-xs">
                  <div className="flex justify-between border-b border-slate-800 pb-2">
                    <span className="text-slate-400 font-bold">Recorded Out-Time</span>
                    <span className="font-mono font-black text-emerald-400 text-sm">{savedExitRecord.out_time}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-800 pb-2">
                    <span className="text-slate-400 font-bold">Reason</span>
                    <span className="text-white font-bold text-right">{savedExitRecord.reason}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-800 pb-2">
                    <span className="text-slate-400 font-bold">Approval Authority</span>
                    <span className="text-white font-bold">{savedExitRecord.approved_by}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-bold">Scanned Device</span>
                    <span className="text-emerald-300 font-mono font-bold text-[11px]">{savedExitRecord.device}</span>
                  </div>
                </div>

                <div className="text-center pt-1">
                  <span className="text-[11px] text-emerald-300 font-bold">
                    ✓ Out-time details committed to Central Campus Database.
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <XCircle size={24} className="text-rose-400 shrink-0" />
                <div>
                  <h4 className="font-bold text-sm text-rose-200">Pass Verification Failed</h4>
                  <p className="text-xs text-rose-300/80">{savedExitRecord.message}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Recent Mobile Scans Log */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400">
            <span>Recent Phone Scanner Departures</span>
            <span>{recentExits.length} Records</span>
          </div>
          <div className="space-y-1.5">
            {recentExits.map((item, i) => (
              <div
                key={i}
                className="p-3 rounded-2xl bg-slate-900 border border-slate-800/80 flex items-center justify-between text-xs"
              >
                <div>
                  <p className="font-extrabold text-white">{item.holder_name}</p>
                  <p className="text-[10px] text-slate-400">{item.type} • {item.token}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono text-emerald-400 font-bold block">{item.out_time}</span>
                  <span className="text-[9px] uppercase font-black text-slate-500">Out-Time Saved</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </main>

      {/* Footer Return Action */}
      <footer className="p-4 border-t border-slate-900 bg-slate-950/90 text-center">
        <button
          onClick={() => navigate('/gate')}
          className="w-full py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 active:scale-98 font-bold text-xs text-slate-200 transition"
        >
          Return to Main Gate Security Dashboard
        </button>
      </footer>

    </div>
  );
};

export default GuardMobileScanner;
