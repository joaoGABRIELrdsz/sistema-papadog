import React from 'react';
import { useAuth } from '../AuthContext';
import { 
  LayoutDashboard, 
  CheckSquare, 
  Trophy, 
  Users, 
  Settings, 
  LogOut,
  Target,
  FileText,
  ShieldCheck
} from 'lucide-react';
import { cn } from '../utils';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const { user, logout } = useAuth();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'tasks', label: 'Minhas Tarefas', icon: CheckSquare },
    { id: 'ranking', label: 'Ranking', icon: Trophy },
    { id: 'goals', label: 'Metas', icon: Target },
    { id: 'profile', label: 'Meu Perfil', icon: Settings },
  ];

  if (user?.role === 'ADMIN') {
    menuItems.push(
      { id: 'users', label: 'Colaboradores', icon: Users },
      { id: 'reports', label: 'Relatórios', icon: FileText }
    );
  }

  return (
    <aside className="w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col h-screen sticky top-0">
      <div className="p-8 flex items-center gap-3">
        <div className="w-10 h-10 bg-papadog-green rounded-xl flex items-center justify-center shadow-lg shadow-papadog-green/20">
          <ShieldCheck className="text-white w-6 h-6" />
        </div>
        <div>
          <h1 className="font-bold text-xl text-slate-900 dark:text-white leading-tight">PAPADOG</h1>
          <p className="text-[10px] uppercase tracking-widest text-papadog-green font-bold">Corporativo</p>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={cn(
              "sidebar-item w-full",
              activeTab === item.id && "active"
            )}
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-100 dark:border-slate-800">
        <button 
          onClick={logout}
          className="sidebar-item w-full text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Sair</span>
        </button>
      </div>
    </aside>
  );
}
