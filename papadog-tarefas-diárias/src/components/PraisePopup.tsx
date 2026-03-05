import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { Award, AlertCircle, X, ExternalLink, Trophy } from 'lucide-react';
import { Notification } from '../types';

export default function PraisePopup() {
  const { user, socket } = useAuth();
  const [currentPraise, setCurrentPraise] = useState<Notification | null>(null);

  useEffect(() => {
    if (user) {
      // Check for unread praises on mount
      fetch(`/api/notifications/${user.id}`)
        .then(res => res.json())
        .then(data => {
          const unreadPraise = data.find((n: Notification) => n.type === 'PRAISE' || n.type === 'ADJUSTMENT');
          if (unreadPraise) {
            setCurrentPraise(unreadPraise);
          }
        });
    }
  }, [user]);

  useEffect(() => {
    if (socket) {
      socket.on('new_praise', (data) => {
        setCurrentPraise(data);
      });
      return () => socket.off('new_praise');
    }
  }, [socket]);

  const handleClose = async () => {
    if (currentPraise) {
      await fetch(`/api/notifications/${currentPraise.id}/read`, { method: 'PATCH' });
      setCurrentPraise(null);
    }
  };

  return (
    <AnimatePresence>
      {currentPraise && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.8, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 40 }}
            className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/10"
          >
            {currentPraise.type === 'PRAISE' && (
              <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
                <Confetti />
              </div>
            )}

            <div className="p-10 text-center">
              <div className={cn(
                "w-24 h-24 mx-auto rounded-3xl flex items-center justify-center mb-8 shadow-2xl rotate-3",
                currentPraise.type === 'PRAISE' ? "bg-papadog-green text-white shadow-papadog-green/30" : "bg-amber-500 text-white shadow-amber-500/30"
              )}>
                {currentPraise.type === 'PRAISE' ? <Trophy className="w-12 h-12" /> : <AlertCircle className="w-12 h-12" />}
              </div>

              <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-2">
                {currentPraise.type === 'PRAISE' ? 'Excelente Trabalho!' : 'Ajuste Necessário'}
              </h3>
              <p className="text-slate-500 dark:text-slate-400 mb-8 font-medium">
                Diego Boechat enviou um feedback sobre sua tarefa.
              </p>

              <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl mb-8 border border-slate-100 dark:border-slate-800 text-left relative">
                <p className="italic text-slate-700 dark:text-slate-200 text-lg leading-relaxed">
                  "{currentPraise.message}"
                </p>
                {currentPraise.type === 'PRAISE' && (
                  <div className="mt-4 flex items-center gap-2 text-papadog-green font-bold">
                    <Award className="w-5 h-5" />
                    <span>+100 Pontos de Performance</span>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-3">
                <button 
                  onClick={handleClose}
                  className={cn(
                    "w-full py-4 rounded-2xl text-white font-bold text-lg shadow-xl transition-all active:scale-95",
                    currentPraise.type === 'PRAISE' ? "bg-papadog-green hover:bg-papadog-green-dark shadow-papadog-green/20" : "bg-amber-500 hover:bg-amber-600 shadow-amber-500/20"
                  )}
                >
                  Entendido
                </button>
                <button className="w-full py-3 rounded-2xl text-slate-400 font-bold text-sm hover:text-slate-600 dark:hover:text-slate-200 transition-all flex items-center justify-center gap-2">
                  <ExternalLink className="w-4 h-4" />
                  Ver Detalhes da Tarefa
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function Confetti() {
  return (
    <div className="absolute inset-0">
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ 
            top: -20, 
            left: `${Math.random() * 100}%`,
            rotate: 0,
            scale: Math.random() * 0.5 + 0.5
          }}
          animate={{ 
            top: '120%', 
            rotate: 360,
            left: `${Math.random() * 100}%`
          }}
          transition={{ 
            duration: Math.random() * 2 + 1, 
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute w-2 h-2 rounded-full bg-papadog-green opacity-40"
        />
      ))}
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
