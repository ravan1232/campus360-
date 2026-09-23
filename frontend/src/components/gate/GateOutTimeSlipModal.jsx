import React from 'react';
import Modal from '../common/Modal';
import {
  ShieldCheck,
  Clock,
  User,
  Smartphone,
  CheckCircle2,
  Calendar,
  Printer,
  Copy,
  Check
} from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';

const GateOutTimeSlipModal = ({ isOpen, onClose, log }) => {
  const { addToast } = useNotifications();

  if (!log) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyRecord = () => {
    const text = `CAMPUS 360 GATE EXIT SLIP\nHolder: ${log.holder_name}\nID/Token: ${log.token}\nType: ${log.type}\nExit Out-Time: ${log.out_time || log.scanned_at}\nDevice: ${log.device || 'Guard Phone Scanner'}\nGate: ${log.gate || 'Main West Gate'}\nOfficer: ${log.officer || 'Officer Vikram Singh'}\nStatus: VERIFIED EXIT RECORDED`;
    navigator.clipboard.writeText(text);
    addToast('Exit clearance slip copied to clipboard!', 'success');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Official Gate Exit & Out-Time Slip" maxWidth="max-w-md">
      <div className="space-y-5">
        
        {/* Verification Banner */}
        <div className="p-4 rounded-3xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-center space-y-1.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-md shadow-emerald-600/30">
            <CheckCircle2 size={24} />
          </div>
          <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-200 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-100">
            AUTHENTICATED GATE CLEARANCE
          </span>
          <h3 className="text-lg font-black text-slate-900 dark:text-white">
            {log.holder_name}
          </h3>
          <p className="text-xs text-slate-500 font-bold">
            {log.type} • Token: <span className="font-mono text-emerald-600 dark:text-emerald-400">{log.token}</span>
          </p>
        </div>

        {/* Primary Out-Time Callout */}
        <div className="p-4 rounded-2xl bg-slate-900 text-white border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Clock size={20} />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Recorded Gate Out-Time
              </span>
              <span className="text-base font-black font-mono text-emerald-400">
                {log.out_time || log.scanned_at}
              </span>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500 text-slate-950">
            Saved
          </span>
        </div>

        {/* Detailed Audit Specifications */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2.5 text-xs">
          <div className="flex justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
            <span className="text-slate-500 font-bold">Pass Category</span>
            <span className="font-bold text-slate-900 dark:text-white">{log.type}</span>
          </div>

          <div className="flex justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
            <span className="text-slate-500 font-bold">Reason / Purpose</span>
            <span className="font-bold text-slate-900 dark:text-white">{log.reason || 'Authorized Outpass Departure'}</span>
          </div>

          <div className="flex justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
            <span className="text-slate-500 font-bold">Scanned Terminal</span>
            <span className="font-bold font-mono text-blue-600 dark:text-blue-400 flex items-center gap-1">
              <Smartphone size={13} />
              {log.device || '📱 Guard Security Phone (Handheld #01)'}
            </span>
          </div>

          <div className="flex justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
            <span className="text-slate-500 font-bold">Gate Station</span>
            <span className="font-bold text-slate-900 dark:text-white">{log.gate || 'Main West Gate'}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-slate-500 font-bold">Verifying Officer</span>
            <span className="font-bold text-slate-900 dark:text-white">{log.officer || 'Officer Vikram Singh'}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <button
            onClick={handleCopyRecord}
            className="btn-secondary flex-1 py-2.5 text-xs font-bold flex items-center justify-center gap-1.5"
          >
            <Copy size={15} />
            <span>Copy Record</span>
          </button>
          <button
            onClick={handlePrint}
            className="btn-primary flex-1 py-2.5 text-xs font-black bg-blue-600 hover:bg-blue-500 flex items-center justify-center gap-1.5"
          >
            <Printer size={15} />
            <span>Print Slip</span>
          </button>
        </div>

      </div>
    </Modal>
  );
};

export default GateOutTimeSlipModal;
