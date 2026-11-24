'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Car, Zap, CheckCircle2, X } from 'lucide-react';
import { useAppStore } from '@/store/app-store';

export function DynamicIsland() {
  const { dynamicAlert, setDynamicAlert } = useAppStore();

  return (
    <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
      <AnimatePresence>
        {dynamicAlert && (
          <motion.div
            initial={{ scale: 0.85, opacity: 0, y: -20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: -20 }}
            transition={{ type: 'spring', stiffness: 450, damping: 30 }}
            className="dynamic-island pointer-events-auto px-4 py-2.5 flex items-center gap-3 min-w-[280px] max-w-sm backdrop-blur-3xl"
          >
            <div 
              className="h-7 w-7 rounded-full flex items-center justify-center shrink-0 shadow-sm"
              style={{ backgroundColor: dynamicAlert.color || '#30d158' }}
            >
              {dynamicAlert.icon === 'car' ? (
                <Car className="h-4 w-4 text-white" />
              ) : dynamicAlert.icon === 'pro' ? (
                <Sparkles className="h-4 w-4 text-white" />
              ) : (
                <CheckCircle2 className="h-4 w-4 text-white" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-white tracking-tight truncate">
                {dynamicAlert.title}
              </div>
              <div className="text-[11px] text-white/70 truncate">
                {dynamicAlert.subtitle}
              </div>
            </div>

            <button
              onClick={() => setDynamicAlert(null)}
              className="p-1 rounded-full text-white/50 hover:text-white transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
