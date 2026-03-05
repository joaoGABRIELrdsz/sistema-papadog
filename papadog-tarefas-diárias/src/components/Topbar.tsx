import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { useTheme } from '../ThemeContext';
import { 
  Sun, 
  Moon, 
  Bell, 
  Search,
  CheckCircle2,
  AlertCircle,
  Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Notification } from '../types';

interface TopbarProps {
  setActiveTab?: (tab: string) => void;
}

export default function Topbar({ setActiveTab }: TopbarProps) {
  const { user, socket, refreshUser } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    if (user) {
      fetch(`/api/notifications/${user.id}`)
        .then(res => res.json())
        .then(setNotifications);
    }
  }, [user]);

  useEffect(() => {
    if (socket) {
      const handleNewPraise = (data: any) => {
        setNotifications(prev => [data, ...prev]);
        refreshUser();
      };
      const handleAdminNotification = (data: any) => {
        if (user?.role === 'ADMIN') {
          setNotifications(prev => [data, ...prev]);
        }
      };

      socket.on('new_praise', handleNewPraise);
      socket.on('admin_notification', handleAdminNotification);
      return () => {
        socket.off('new_praise', handleNewPraise);
        socket.off('admin_notification', handleAdminNotification);
      };
    }
  }, [socket, user]);

  const markAsRead = async (id: number) => {
    await fetch(`/api/notifications/${id}/read`, { method: 'PATCH' });
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <header className="h-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-8 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <div className="relative w-full group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-papadog-green transition-colors" />
          <input 
            type="text" 
            placeholder="Buscar tarefas, colaboradores..."
            className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-xl py-2.5 pl-11 pr-4 text-sm focus:ring-2 focus:ring-papadog-green outline-none transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <button 
          onClick={toggleTheme}
          className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-all"
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-all relative"
          >
            <Bell className="w-5 h-5" />
            {notifications.length > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-papadog-green rounded-full border-2 border-white dark:border-slate-900" />
            )}
          </button>

          <AnimatePresence>
            {showNotifications && (
              <>
                <div className="fixed inset-0" onClick={() => setShowNotifications(false)} />
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-4 w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
                >
                  <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <h3 className="font-bold text-slate-900 dark:text-white">Notificações</h3>
                    <span className="text-xs bg-papadog-green/10 text-papadog-green px-2 py-1 rounded-full font-bold">
                      {notifications.length} novas
                    </span>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-slate-400 text-sm">
                        Nenhuma nova notificação
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div 
                          key={n.id}
                          className="p-4 border-b border-slate-50 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                          onClick={() => markAsRead(n.id)}
                        >
                          <div className="flex gap-3">
                            <div className={cn(
                              "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                              n.type === 'PRAISE' ? "bg-emerald-100 text-emerald-600" :
                              n.type === 'ADJUSTMENT' ? "bg-amber-100 text-amber-600" :
                              "bg-blue-100 text-blue-600"
                            )}>
                              {n.type === 'PRAISE' ? <Award className="w-4 h-4" /> :
                               n.type === 'ADJUSTMENT' ? <AlertCircle className="w-4 h-4" /> :
                               <CheckCircle2 className="w-4 h-4" />}
                            </div>
                            <div>
                              <p className="text-sm text-slate-800 dark:text-slate-200 leading-snug">{n.message}</p>
                              <p className="text-[10px] text-slate-400 mt-1">Agora mesmo</p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        <div className="h-8 w-px bg-slate-200 dark:bg-slate-800" />

        <div 
          className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => setActiveTab?.('profile')}
        >
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-slate-900 dark:text-white">{user?.name}</p>
            <p className="text-[10px] uppercase tracking-wider text-papadog-green font-bold">{user?.role}</p>
          </div>
          <img 
            src={user?.avatar} 
            alt={user?.name}
            className="w-10 h-10 rounded-xl border-2 border-papadog-green/20"
            referrerPolicy="no-referrer"
          />
        </div>
      </div>
    </header>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
