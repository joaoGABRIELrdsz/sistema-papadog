import React, { useState } from 'react';
import { useAuth } from '../AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { Award, AlertCircle, X, Send } from 'lucide-react';
import { Task } from '../types';

interface PraiseModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task;
}

export default function PraiseModal({ isOpen, onClose, task }: PraiseModalProps) {
  const { user, refreshUser } = useAuth();
  const [message, setMessage] = useState('');
  const [points, setPoints] = useState(100);
  const [type, setType] = useState<'PRAISE' | 'ADJUSTMENT'>('PRAISE');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch('/api/praise', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          admin_id: user?.id,
          user_id: task.assigned_to,
          task_id: task.id,
          message,
          points: type === 'PRAISE' ? points : 0,
          type
        })
      });
      
      if (task.assigned_to === user?.id) {
        await refreshUser();
      }
      
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden"
          >
            <div className={`h-2 ${type === 'PRAISE' ? 'bg-papadog-green' : 'bg-amber-500'}`} />
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Avaliar Conclusão</h3>
                <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl mb-6 border border-slate-100 dark:border-slate-800">
                <p className="text-xs text-slate-400 uppercase font-bold mb-1">Tarefa</p>
                <p className="font-bold text-slate-900 dark:text-white">{task.title}</p>
                <p className="text-sm text-slate-500 mt-1">Responsável: {task.assigned_name}</p>
              </div>

              <div className="flex gap-4 mb-6">
                <button 
                  type="button"
                  onClick={() => setType('PRAISE')}
                  className={`flex-1 p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${
                    type === 'PRAISE' 
                      ? 'border-papadog-green bg-papadog-green/5 text-papadog-green' 
                      : 'border-slate-100 dark:border-slate-800 text-slate-400'
                  }`}
                >
                  <Award className="w-6 h-6" />
                  <span className="text-sm font-bold">Elogiar</span>
                </button>
                <button 
                  type="button"
                  onClick={() => setType('ADJUSTMENT')}
                  className={`flex-1 p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${
                    type === 'ADJUSTMENT' 
                      ? 'border-amber-500 bg-amber-500/5 text-amber-500' 
                      : 'border-slate-100 dark:border-slate-800 text-slate-400'
                  }`}
                >
                  <AlertCircle className="w-6 h-6" />
                  <span className="text-sm font-bold">Ajuste</span>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {type === 'PRAISE' && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Pontuação</label>
                    <input 
                      type="number" 
                      value={points}
                      onChange={(e) => setPoints(Number(e.target.value))}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none focus:ring-2 focus:ring-papadog-green"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Mensagem Profissional</label>
                  <textarea 
                    required
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={type === 'PRAISE' ? "Excelente execução..." : "Tarefa concluída, porém..."}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none focus:ring-2 focus:ring-papadog-green resize-none"
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className={`w-full py-4 rounded-xl text-white font-bold flex items-center justify-center gap-2 transition-all active:scale-95 ${
                    type === 'PRAISE' ? 'bg-papadog-green hover:bg-papadog-green-dark' : 'bg-amber-500 hover:bg-amber-600'
                  }`}
                >
                  {loading ? 'Enviando...' : (
                    <>
                      <Send className="w-5 h-5" />
                      Enviar Avaliação
                    </>
                  )}
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
