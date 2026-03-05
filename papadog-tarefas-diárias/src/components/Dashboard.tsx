import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  TrendingUp,
  Award,
  Users,
  Target,
  Trophy
} from 'lucide-react';
import { motion } from 'motion/react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { LEVELS } from '../utils';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetch('/api/stats')
      .then(res => res.json())
      .then(setStats);
  }, []);

  if (!stats) return <div className="p-8">Carregando...</div>;

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Olá, {user?.name.split(' ')[0]}</h2>
          <p className="text-slate-500 dark:text-slate-400">Bem-vindo ao painel estratégico PAPADOG.</p>
        </div>
        <div className="flex items-center gap-3 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400">Eficiência do Setor</p>
            <p className="text-lg font-bold text-papadog-green">{stats.sectorEfficiency}%</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Tarefas Criadas" 
          value={stats.total} 
          icon={Target} 
          color="bg-blue-500"
          trend="+12%"
        />
        <StatCard 
          title="Concluídas" 
          value={stats.completed} 
          icon={CheckCircle2} 
          color="bg-papadog-green"
          trend="+5%"
        />
        <StatCard 
          title="Pendentes" 
          value={stats.pending} 
          icon={Clock} 
          color="bg-amber-500"
          trend="-2%"
        />
        <StatCard 
          title="Atrasadas" 
          value={stats.overdue} 
          icon={AlertCircle} 
          color="bg-red-500"
          trend="+0%"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <div className="lg:col-span-2 glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">Desempenho Semanal</h3>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-papadog-green" />
                <span className="text-[10px] font-bold text-slate-400 uppercase">Tarefas</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span className="text-[10px] font-bold text-slate-400 uppercase">Metas</span>
              </div>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.chartData}>
                <defs>
                  <linearGradient id="colorTarefas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00A859" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#00A859" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorMetas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94A3B8'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94A3B8'}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="tarefas" stroke="#00A859" strokeWidth={3} fillOpacity={1} fill="url(#colorTarefas)" />
                <Area type="monotone" dataKey="metas" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorMetas)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Ranking */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">Ranking Mensal</h3>
            <Trophy className="w-5 h-5 text-amber-500" />
          </div>
          <div className="space-y-4">
            {stats.ranking.map((user: any, i: number) => (
              <div key={user.name} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img 
                      src={user.avatar} 
                      alt={user.name} 
                      className="w-10 h-10 rounded-full border-2 border-slate-100 dark:border-slate-800"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center text-[10px] font-bold shadow-sm border border-slate-100 dark:border-slate-800">
                      {i + 1}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{user.name}</p>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${LEVELS[user.level as keyof typeof LEVELS].bg} ${LEVELS[user.level as keyof typeof LEVELS].text}`}>
                      {user.level}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-papadog-green">{user.points} pts</p>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-6 py-3 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
            Ver Ranking Completo
          </button>
        </div>
      </div>

      {/* Employee of the Month */}
      {stats.ranking && stats.ranking.length > 0 && (
        <div className="bg-gradient-to-r from-papadog-green to-papadog-green-dark rounded-3xl p-8 text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl shadow-papadog-green/20">
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="absolute inset-0 bg-white/20 rounded-full animate-ping" />
              <img 
                src={stats.ranking[0]?.avatar} 
                alt="Destaque" 
                className="w-24 h-24 rounded-full border-4 border-white/30 relative z-10"
                referrerPolicy="no-referrer"
              />
              <div className="absolute -bottom-2 -right-2 bg-white text-papadog-green p-2 rounded-full shadow-lg z-20">
                <Award className="w-6 h-6" />
              </div>
            </div>
            <div>
              <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">Destaque do Mês</span>
              <h3 className="text-3xl font-bold mt-2">{stats.ranking[0]?.name}</h3>
              <p className="text-white/80 mt-1">Superou as metas em 15% este mês. Parabéns!</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 text-center min-w-[100px]">
              <p className="text-xs text-white/60">Pontos</p>
              <p className="text-2xl font-bold">{stats.ranking[0]?.points}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 text-center min-w-[100px]">
              <p className="text-xs text-white/60">Elo</p>
              <p className="text-2xl font-bold">{stats.ranking[0]?.level}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color, trend }: any) {
  return (
    <div className="glass-card p-6 group hover:border-papadog-green transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl ${color} text-white shadow-lg shadow-${color.split('-')[1]}-500/20`}>
          <Icon className="w-6 h-6" />
        </div>
        <span className={`text-xs font-bold px-2 py-1 rounded-lg ${trend.startsWith('+') ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
          {trend}
        </span>
      </div>
      <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{title}</p>
      <h4 className="text-3xl font-bold text-slate-900 dark:text-white mt-1">{value}</h4>
    </div>
  );
}
