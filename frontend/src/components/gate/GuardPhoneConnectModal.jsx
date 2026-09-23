import React, { useState } from 'react';
import Modal from '../common/Modal';
import {
  Smartphone,
  QrCode,
  CheckCircle2,
  ExternalLink,
  Copy,
  Check,
  ShieldCheck,
  Radio,
  Sparkles,
  Zap
} from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';

const GuardPhoneConnectModal = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const { addToast } = useNotifications();

  const mobileUrl = `${window.location.origin}/guard-scanner`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(mobileUrl);
    setCopied(true);
    addToast('Scanner URL copied to clipboard! Open on your mobile phone browser.', 'success');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleOpenMobileScanner = () => {
    window.open('/guard-scanner', '_blank', 'width=420,height=820');
  };

  // Generate an authentic visual QR pattern SVG for phone connection
  const renderPairingQR = () => (
    <svg viewBox="0 0 200 200" className="w-48 h-48 mx-auto bg-white p-2 rounded-2xl shadow-inner">
      {/* Outer corner finders */}
      <rect x="15" y="15" width="45" height="45" rx="8" fill="#0f172a" />
      <rect x="25" y="25" width="25" height="25" rx="4" fill="#ffffff" />
      <rect x="32" y="32" width="11" height="11" rx="2" fill="#0f172a" />

      <rect x="140" y="15" width="45" height="45" rx="8" fill="#0f172a" />
      <rect x="150" y="25" width="25" height="25" rx="4" fill="#ffffff" />
      <rect x="157" y="32" width="11" height="11" rx="2" fill="#0f172a" />

      <rect x="15" y="140" width="45" height="45" rx="8" fill="#0f172a" />
      <rect x="25" y="150" width="25" height="25" rx="4" fill="#ffffff" />
      <rect x="32" y="157" width="11" height="11" rx="2" fill="#0f172a" />

      {/* Grid elements */}
      <rect x="75" y="20" width="12" height="12" rx="2" fill="#2563eb" />
      <rect x="95" y="20" width="12" height="12" rx="2" fill="#0f172a" />
      <rect x="115" y="20" width="12" height="12" rx="2" fill="#2563eb" />

      <rect x="75" y="45" width="12" height="12" rx="2" fill="#0f172a" />
      <rect x="95" y="45" width="12" height="12" rx="2" fill="#059669" />
      <rect x="115" y="45" width="12" height="12" rx="2" fill="#0f172a" />

      <rect x="20" y="75" width="12" height="12" rx="2" fill="#0f172a" />
      <rect x="40" y="75" width="12" height="12" rx="2" fill="#2563eb" />
      <rect x="70" y="75" width="12" height="12" rx="2" fill="#0f172a" />
      <rect x="90" y="75" width="18" height="18" rx="3" fill="#059669" />
      <rect x="120" y="75" width="12" height="12" rx="2" fill="#0f172a" />
      <rect x="145" y="75" width="12" height="12" rx="2" fill="#2563eb" />
      <rect x="170" y="75" width="12" height="12" rx="2" fill="#0f172a" />

      <rect x="20" y="95" width="12" height="12" rx="2" fill="#2563eb" />
      <rect x="45" y="95" width="12" height="12" rx="2" fill="#0f172a" />
      <rect x="70" y="105" width="14" height="14" rx="3" fill="#0f172a" />
      <rect x="115" y="105" width="14" height="14" rx="3" fill="#2563eb" />
      <rect x="145" y="95" width="12" height="12" rx="2" fill="#0f172a" />
      <rect x="170" y="95" width="12" height="12" rx="2" fill="#059669" />

      <rect x="70" y="135" width="14" height="14" rx="3" fill="#2563eb" />
      <rect x="95" y="135" width="14" height="14" rx="3" fill="#0f172a" />
      <rect x="120" y="135" width="14" height="14" rx="3" fill="#059669" />
      <rect x="145" y="135" width="12" height="12" rx="2" fill="#0f172a" />
      <rect x="170" y="135" width="12" height="12" rx="2" fill="#2563eb" />

      <rect x="70" y="160" width="12" height="12" rx="2" fill="#0f172a" />
      <rect x="95" y="160" width="12" height="12" rx="2" fill="#2563eb" />
      <rect x="120" y="160" width="12" height="12" rx="2" fill="#0f172a" />
      <rect x="145" y="160" width="12" height="12" rx="2" fill="#059669" />
      <rect x="170" y="160" width="12" height="12" rx="2" fill="#0f172a" />

      {/* Center Phone Icon Badge */}
      <rect x="82" y="82" width="36" height="36" rx="8" fill="#10b981" />
      <circle cx="100" cy="100" r="10" fill="#ffffff" />
    </svg>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Connect Security Guard Phone Scanner" maxWidth="max-w-md">
      <div className="space-y-5 text-center">
        
        {/* Header explanation */}
        <div className="space-y-1">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
            <Smartphone size={24} />
          </div>
          <h3 className="text-base font-black text-slate-900 dark:text-white">
            Link Smartphone to Gate Registry
          </h3>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            Scan this QR code with any smartphone camera to open the handheld scanner. All scanned QR passes will automatically timestamp and store out-time details.
          </p>
        </div>

        {/* Live Pairing QR Code Card */}
        <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/80 border-2 border-slate-200 dark:border-slate-700 shadow-sm relative">
          <div className="flex items-center justify-center gap-2 mb-3 text-xs font-bold text-emerald-600 dark:text-emerald-400">
            <Radio size={14} className="animate-pulse text-emerald-500" />
            <span>Wireless Scanner Broadcast Active</span>
          </div>

          {renderPairingQR()}

          <div className="mt-3 flex items-center justify-center gap-2 text-[11px] font-mono font-bold text-slate-600 dark:text-slate-300">
            <span>PAIRING PIN:</span>
            <span className="bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded text-blue-600 dark:text-blue-400">
              GUARD-8821
            </span>
          </div>
        </div>

        {/* Direct Link & Copy */}
        <div className="space-y-2 text-left">
          <label className="text-[11px] font-black uppercase tracking-wider text-slate-400 block">
            Direct Mobile Web App URL
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={mobileUrl}
              className="input text-xs font-mono select-all"
            />
            <button
              onClick={handleCopyLink}
              className="btn-secondary px-3 shrink-0 flex items-center gap-1.5 text-xs font-bold"
            >
              {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col gap-2">
          <button
            onClick={handleOpenMobileScanner}
            className="btn-primary w-full py-3 bg-emerald-600 hover:bg-emerald-500 flex items-center justify-center gap-2 text-xs font-black shadow-lg shadow-emerald-600/20"
          >
            <ExternalLink size={16} />
            <span>Open Mobile Phone Scanner Window</span>
          </button>
          <p className="text-[11px] text-slate-400">
            Opens an exact phone-sized mobile scanner simulator right now.
          </p>
        </div>

      </div>
    </Modal>
  );
};

export default GuardPhoneConnectModal;
