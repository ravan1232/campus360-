import React, { useState, useRef, useEffect } from 'react';
import Modal from '../common/Modal';
import { api } from '../../services/api';
import { useNotifications } from '../../context/NotificationContext';
import {
  QrCode, Scan, ShieldCheck, CheckCircle2, XCircle, AlertTriangle, User,
  Clock, LogOut, Sparkles, Phone, Camera, Smartphone, Check, RefreshCw, Zap
} from 'lucide-react';

const QrScannerModal = ({ isOpen, onClose, onScanSuccess }) => {
  const [scannerMode, setScannerMode] = useState('camera'); // 'camera' | 'simulation' | 'phone'
  const [tokenInput, setTokenInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [scannedResult, setScannedResult] = useState(null);
  const [checkingOut, setCheckingOut] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [autoCheckout, setAutoCheckout] = useState(true);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const { addToast } = useNotifications();

  // Start Camera Stream
  const startCamera = async () => {
    setCameraError(null);
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setCameraActive(true);
      }
    } catch (err) {
      console.warn('Camera access unavailable:', err);
      setCameraError('Camera access unavailable or permission denied. You can use 1-Click Simulation or Guard Phone Scanner.');
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
    if (isOpen && scannerMode === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [isOpen, scannerMode]);

  const handleVerify = async (tokenToTest) => {
    const targetToken = tokenToTest || tokenInput;
    if (!targetToken.trim()) {
      addToast('Please enter or scan a QR token.', 'warning');
      return;
    }

    setLoading(true);
    setScannedResult(null);

    try {
      const res = await api.post('/gate/qr/verify', { token: targetToken.trim() });
      setScannedResult(res);

      if (res.valid) {
        addToast(`Verified: ${res.pass.holder_name} (${res.pass.title || res.pass.type})`, 'success', 'Pass Authentic');
        
        // Auto-log Out-Time if enabled
        if (autoCheckout && res.pass.status !== 'exited') {
          handleConfirmExit(res.pass);
        }
      } else {
        addToast(res.message, 'warning', 'Verification Warning');
      }
    } catch (err) {
      setScannedResult({
        valid: false,
        message: 'Invalid or unrecognized QR token. Pass does not exist in registry.'
      });
      addToast('Pass could not be verified.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmExit = async (passData) => {
    const target = passData || scannedResult?.pass;
    if (!target) return;

    const deviceName = scannerMode === 'phone'
      ? '📱 Guard Security Phone (Handheld #01)'
      : '🖥️ Main West Gate Camera Terminal';

    setCheckingOut(true);
    try {
      const res = await api.post('/gate/qr/checkout', {
        token: target.token || target.id,
        device: deviceName
      });

      if (res.success) {
        const outTime = res.out_time || res.pass?.out_time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        addToast(
          `Logged gate exit for ${res.pass.holder_name} at ${outTime}`,
          'success',
          'Out-Time Saved'
        );
        setScannedResult(prev => ({
          ...prev,
          valid: false,
          pass: { ...prev.pass, status: 'exited', out_time: outTime, device: deviceName },
          outTimeSaved: outTime,
          scannedDevice: deviceName,
          message: `Exit out-time successfully recorded: ${outTime}.`
        }));
        if (onScanSuccess) onScanSuccess(res.pass || target);
      }
    } catch (err) {
      addToast('Failed to log checkout at gate', 'error');
    } finally {
      setCheckingOut(false);
    }
  };

  const quickScanSimulations = [
    { label: 'Student Aiden Montgomery (STD-042)', token: 'OUTPASS-STD042-9981' },
    { label: 'Teacher Emergency: Prof. Vance (TCH-8821)', token: 'FACULTY-TCH8821' },
    { label: 'Campus Transit Bus 304 Permit', token: 'VEH-BUS304-2026' }
  ];

  return (
    <Modal isOpen={isOpen} onClose={() => { stopCamera(); onClose(); }} title="Gate Security QR Camera Scanner" maxWidth="max-w-xl">
      <div className="space-y-5">
        
        {/* Scanner Mode Tabs */}
        <div className="flex rounded-2xl bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700">
          <button
            type="button"
            onClick={() => setScannerMode('camera')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 ${
              scannerMode === 'camera'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-blue-600'
            }`}
          >
            <Camera size={15} />
            <span>Live Camera Scanner</span>
          </button>
          
          <button
            type="button"
            onClick={() => setScannerMode('phone')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 ${
              scannerMode === 'phone'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-blue-600'
            }`}
          >
            <Smartphone size={15} />
            <span>Guard Phone Mode</span>
          </button>

          <button
            type="button"
            onClick={() => setScannerMode('simulation')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 ${
              scannerMode === 'simulation'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-blue-600'
            }`}
          >
            <Sparkles size={15} />
            <span>1-Click Test Chips</span>
          </button>
        </div>

        {/* Auto Out-Time Checkbox */}
        <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs font-bold">
          <span className="text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Zap size={15} className="text-amber-500" />
            Automatic Out-Time Recording on QR Scan
          </span>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={autoCheckout}
              onChange={(e) => setAutoCheckout(e.target.checked)}
              className="h-4 w-4 rounded text-blue-600"
            />
            <span className="text-[11px] text-slate-500">Auto-Save</span>
          </label>
        </div>

        {/* MODE 1: Camera Scanner Viewfinder */}
        {scannerMode === 'camera' && (
          <div className="relative rounded-3xl overflow-hidden bg-slate-950 border-2 border-slate-700 shadow-xl flex flex-col items-center justify-center min-h-[260px]">
            {cameraActive ? (
              <div className="relative w-full h-64 overflow-hidden">
                <video
                  ref={videoRef}
                  playsInline
                  autoPlay
                  muted
                  className="w-full h-full object-cover"
                />
                {/* Laser Sweep Line */}
                <div className="absolute left-6 right-6 h-0.5 bg-emerald-400 shadow-[0_0_15px_#34d399] animate-laser pointer-events-none" />
                
                {/* Viewfinder Target Brackets */}
                <div className="absolute inset-8 border-2 border-white/40 border-dashed rounded-2xl pointer-events-none flex flex-col justify-between p-2">
                  <div className="flex justify-between">
                    <span className="w-5 h-5 border-t-4 border-l-4 border-emerald-400"></span>
                    <span className="w-5 h-5 border-t-4 border-r-4 border-emerald-400"></span>
                  </div>
                  <div className="flex justify-between">
                    <span className="w-5 h-5 border-b-4 border-l-4 border-emerald-400"></span>
                    <span className="w-5 h-5 border-b-4 border-r-4 border-emerald-400"></span>
                  </div>
                </div>

                <div className="absolute bottom-3 left-0 right-0 text-center">
                  <span className="px-3 py-1 rounded-full bg-slate-950/80 backdrop-blur text-white text-[11px] font-bold border border-white/20">
                    Align Teacher or Student QR Code in viewfinder
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                  <Camera size={28} />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">Camera Stream Standby</h4>
                  <p className="text-xs text-slate-400 max-w-xs mt-1">
                    {cameraError || 'Click below to start device camera or use simulation chips.'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={startCamera}
                  className="btn-primary text-xs py-2 px-4 bg-emerald-600 hover:bg-emerald-500"
                >
                  Start Camera Feed
                </button>
              </div>
            )}
          </div>
        )}

        {/* MODE 2: Guard Mobile Phone Connection */}
        {scannerMode === 'phone' && (
          <div className="p-5 rounded-3xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-850 border border-blue-200 dark:border-blue-900/50 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md">
                <Smartphone size={24} />
              </div>
              <div>
                <h4 className="font-black text-slate-900 dark:text-white text-sm">
                  Mobile Guard Scanner Terminal
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Connect your smartphone camera wirelessly to sync student and teacher out-times.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-mono flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 block font-sans font-bold">TERMINAL ID</span>
                <span className="font-black text-blue-600 dark:text-blue-400">GATE-WEST-PHONE-01</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block font-sans font-bold">LINK STATUS</span>
                <span className="text-emerald-600 font-bold flex items-center justify-end gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Ready to Sync
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => window.open('/guard-scanner', '_blank', 'width=420,height=820')}
              className="btn-primary w-full py-2.5 text-xs bg-emerald-600 hover:bg-emerald-500 font-bold flex items-center justify-center gap-2 shadow-md"
            >
              <Smartphone size={16} />
              <span>Launch Mobile Phone Scanner Window</span>
            </button>
            
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              When scanning from your phone camera, scan logs automatically timestamp and record the departure out-time into the school database.
            </p>
          </div>
        )}

        {/* Quick Simulation Chips */}
        <div>
          <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-blue-500" />
            Quick Test Outpass Tokens
          </label>
          <div className="space-y-1.5">
            {quickScanSimulations.map((sim, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setTokenInput(sim.token);
                  handleVerify(sim.token);
                }}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-slate-700 transition text-left flex items-center justify-between text-xs font-bold"
              >
                <span className="text-slate-800 dark:text-slate-200">{sim.label}</span>
                <span className="font-mono text-[10px] text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded-md">
                  {sim.token}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Manual Input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={tokenInput}
            onChange={(e) => setTokenInput(e.target.value)}
            placeholder="Or enter QR Pass Token (e.g. OUTPASS-STD042-9981)"
            className="input text-xs font-mono"
          />
          <button
            type="button"
            disabled={loading}
            onClick={() => handleVerify()}
            className="btn-primary shrink-0 px-4 text-xs font-extrabold"
          >
            {loading ? 'Scanning...' : 'Verify Token'}
          </button>
        </div>

        {/* Verification Result Card */}
        {scannedResult && (
          <div className={`p-5 rounded-3xl border-2 transition-all ${
            scannedResult.valid
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500/80 text-emerald-900 dark:text-emerald-200'
              : 'bg-rose-50 dark:bg-rose-950/40 border-rose-500/80 text-rose-900 dark:text-rose-200'
          }`}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black shadow-md ${
                  scannedResult.valid ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                }`}>
                  {scannedResult.valid ? <CheckCircle2 size={24} /> : <XCircle size={24} />}
                </div>
                <div>
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    scannedResult.valid
                      ? 'bg-emerald-200 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-100'
                      : 'bg-rose-200 dark:bg-rose-900 text-rose-900 dark:text-rose-100'
                  }`}>
                    {scannedResult.valid ? 'VERIFIED · GATE CLEARANCE APPROVED' : 'INVALID / EXPIRED PASS'}
                  </span>
                  <h4 className="text-base font-black text-slate-900 dark:text-white mt-0.5">
                    {scannedResult.pass?.holder_name || 'Unidentified Holder'}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 font-bold">
                    {scannedResult.pass?.title || scannedResult.pass?.type} • ID: {scannedResult.pass?.holder_id || scannedResult.pass?.token}
                  </p>
                </div>
              </div>

              {scannedResult.outTimeSaved && (
                <div className="text-right shrink-0">
                  <span className="text-[10px] font-black text-emerald-700 dark:text-emerald-400 block uppercase">
                    OUT-TIME SAVED
                  </span>
                  <span className="text-xs font-black font-mono text-emerald-800 dark:text-emerald-300">
                    {scannedResult.outTimeSaved}
                  </span>
                </div>
              )}
            </div>

            {scannedResult.pass && (
              <div className="mt-4 pt-3 border-t border-emerald-200 dark:border-emerald-800/80 grid grid-cols-2 gap-2 text-xs font-semibold">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block font-bold">Reason / Outpass Details</span>
                  <span className="text-slate-900 dark:text-white font-bold">{scannedResult.pass.reason || 'Official Departure'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block font-bold">Validity Window</span>
                  <span className="text-slate-900 dark:text-white font-bold">{scannedResult.pass.valid_until || 'Today, Active'}</span>
                </div>
              </div>
            )}

            {/* Out Time Action */}
            {scannedResult.valid && !scannedResult.outTimeSaved && (
              <div className="mt-4 pt-3 border-t border-emerald-200 dark:border-emerald-800 flex justify-end">
                <button
                  type="button"
                  disabled={checkingOut}
                  onClick={() => handleConfirmExit()}
                  className="btn-primary bg-emerald-600 hover:bg-emerald-700 py-2.5 px-5 text-xs font-black flex items-center gap-1.5 shadow-md"
                >
                  <LogOut size={16} />
                  <span>{checkingOut ? 'Recording Out-Time...' : 'Confirm Gate Exit & Save Out-Time'}</span>
                </button>
              </div>
            )}
          </div>
        )}

      </div>
    </Modal>
  );
};

export default QrScannerModal;
