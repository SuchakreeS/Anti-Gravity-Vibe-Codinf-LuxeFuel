import React, { useState, useEffect, createContext, useContext, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

// ─── Standalone API (callable outside React) ───
let _addToastFn = null;
let _showConfirmFn = null;

export const cyberToast = {
  success: (msg) => _addToastFn?.(msg, 'success'),
  error: (msg) => _addToastFn?.(msg, 'error'),
  warning: (msg) => _addToastFn?.(msg, 'warning'),
  info: (msg) => _addToastFn?.(msg, 'info'),
  confirm: (msg) => _showConfirmFn?.(msg),
};

// ─── React Context (for components that prefer hooks) ───
const ToastContext = createContext(cyberToast);
export const useCyberToast = () => useContext(ToastContext);

// ─── Provider ───
export const CyberToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const [confirmState, setConfirmState] = useState(null); // { message, resolve }
  const timersRef = useRef({});

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    if (timersRef.current[id]) {
      clearTimeout(timersRef.current[id]);
      delete timersRef.current[id];
    }
  }, []);

  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    timersRef.current[id] = setTimeout(() => removeToast(id), 5000);
  }, [removeToast]);

  const showConfirm = useCallback((message) => {
    return new Promise((resolve) => {
      setConfirmState({ message, resolve });
    });
  }, []);

  const handleConfirmAnswer = (answer) => {
    confirmState?.resolve(answer);
    setConfirmState(null);
  };

  // Register the standalone functions on mount
  useEffect(() => {
    _addToastFn = addToast;
    _showConfirmFn = showConfirm;
    return () => { _addToastFn = null; _showConfirmFn = null; };
  }, [addToast, showConfirm]);

  return (
    <ToastContext.Provider value={cyberToast}>
      {children}

      {/* ─── Confirm Dialog ─── */}
      <AnimatePresence>
        {confirmState && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-asphalt/80 backdrop-blur-md z-[10000]"
              onClick={() => handleConfirmAnswer(false)}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[10001] w-full max-w-sm"
            >
              <div className="bg-carbon border border-industrial-border rounded-sm overflow-hidden shadow-2xl">
                <div className="h-1.5 bg-turbo-orange animate-pulse" />
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-2 h-2 rounded-full bg-turbo-orange animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary">
                      System Confirm // Critical
                    </span>
                  </div>
                  <p className="font-['Rajdhani'] font-bold text-lg text-white uppercase italic tracking-wider mb-6">
                    {confirmState.message}
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleConfirmAnswer(false)}
                      className="flex-1 bg-asphalt border border-industrial-border text-text-secondary py-3 rounded-sm font-black text-xs uppercase tracking-widest hover:border-neon-violet hover:text-white transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleConfirmAnswer(true)}
                      className="flex-1 bg-turbo-orange text-asphalt py-3 rounded-sm font-black text-xs uppercase tracking-widest hover:bg-white transition-all shadow-[0_0_15px_rgba(249,115,22,0.3)]"
                    >
                      Confirm
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ─── Toast Stack ─── */}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ x: 100, opacity: 0, scale: 0.9, skewX: -10 }}
              animate={{ x: 0, opacity: 1, scale: 1, skewX: 0 }}
              exit={{ x: 50, opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="pointer-events-auto"
            >
              <div className="relative group overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent h-[2px] animate-scanline pointer-events-none" />
                
                <div className="bg-carbon/80 backdrop-blur-xl border border-industrial-border flex items-stretch min-w-[300px] shadow-2xl rounded-sm">
                  <div className={`w-1.5 ${
                    toast.type === 'success' ? 'bg-neon-violet' : 
                    toast.type === 'error' || toast.type === 'warning' ? 'bg-turbo-orange animate-pulse' : 
                    'bg-blue-500'
                  }`} />
                  
                  <div className="p-4 flex flex-col gap-1">
                    <div className="flex justify-between items-center gap-8">
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary opacity-50">
                        System Alert // {toast.type}
                      </span>
                      <button 
                        onClick={() => removeToast(toast.id)}
                        className="text-text-secondary hover:text-white transition-colors text-xs"
                      >
                        <X className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                    </div>
                    <p className="font-['Rajdhani'] font-bold text-sm tracking-widest text-white uppercase italic">
                      {toast.message}
                    </p>
                  </div>
                </div>

                <div className="absolute top-0 right-0 w-4 h-4 overflow-hidden opacity-20">
                  <div className="absolute top-[-8px] right-[-8px] w-4 h-4 bg-white rotate-45" />
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};
