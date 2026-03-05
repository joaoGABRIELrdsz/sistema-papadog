import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { Trophy, Medal, Star, Target, TrendingUp } from 'lucide-react';
import { LEVELS, cn } from '../utils';
import { motion } from 'motion/react';

export default function Ranking() {
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/users')
      .then(res => res.json())
      .then(data => setUsers(data.sort((a: any, b: any) => b.points - a.points)));
  }, []);

  return (
    <div className="p-8 space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Elite PAPADOG</h2>
        <p className="text-slate-500 dark:text-slate-400">Os colaboradores com melhor desempenho no sistema.</p>
      </div>

      {/* Podium */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end max-w-4xl mx-auto pt-12">
        {/* 2nd Place */}
        {users[1] && (
          <PodiumItem 
            user={users[1]} 
            rank={2} 
            height="h-48" 
            color="bg-slate-300" 
            icon={<Medal className="w-8 h-8 text-slate-500" />}
          />
        )}
        {/* 1st Place */}
        {users[0] && (
          <PodiumItem 
            user={users[0]} 
            rank={1} 
            height="h-64" 
            color="bg-amber-400" 
            icon={<Trophy className="w-12 h-12 text-amber-600" />}
            featured
          />
        )}
        {/* 3rd Place */}
        {users[2] && (
          <PodiumItem 
            user={users[2]} 
            rank={3} 
            height="h-40" 
            color="bg-orange-400" 
            icon={<Medal className="w-8 h-8 text-orange-600" />}
          />
        )}
      </div>

      {/* Full List */}
      <div className="glass-card overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 dark:text-white">Ranking Geral</h3>
          <div className="flex items-center gap-2 text-xs font-bold text-papadog-green">
            <TrendingUp className="w-4 h-4" />
            <span>Atualizado em tempo real</span>
          </div>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {users.map((user, i) => (
            <div key={user.id} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
              <div className="flex items-center gap-6">
                <span className="w-8 text-center font-black text-slate-300 dark:text-slate-700 text-xl">#{i + 1}</span>
                <div className="flex items-center gap-4">
                  <img 
                    src={user.avatar} 
                    alt={user.name} 
                    className="w-12 h-12 rounded-2xl border-2 border-slate-100 dark:border-slate-800"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">{user.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${LEVELS[user.level as keyof typeof LEVELS].bg} ${LEVELS[user.level as keyof typeof LEVELS].text}`}>
                        {user.level}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl font-black text-papadog-green">{user.points}</p>
                <p className="text-[10px] uppercase font-bold text-slate-400">Pontos Acumulados</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PodiumItem({ user, rank, height, color, icon, featured }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center"
    >
      <div className="relative mb-4">
        <img 
          src={user.avatar} 
          alt={user.name} 
          className={cn(
            "rounded-full border-4 border-white dark:border-slate-800 shadow-2xl",
            featured ? "w-32 h-32" : "w-24 h-24"
          )}
          referrerPolicy="no-referrer"
        />
        <div className={cn(
          "absolute -bottom-2 -right-2 w-10 h-10 rounded-full flex items-center justify-center shadow-lg",
          color
        )}>
          <span className="font-black text-white text-lg">{rank}</span>
        </div>
      </div>
      <p className="font-bold text-slate-900 dark:text-white text-center mb-4">{user.name}</p>
      <div className={cn(
        "w-full rounded-t-3xl flex flex-col items-center justify-center gap-2 shadow-2xl",
        height,
        featured ? "bg-papadog-green text-white" : "bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-100 dark:border-slate-800"
      )}>
        {icon}
        <p className="font-black text-2xl">{user.points}</p>
        <p className="text-[10px] uppercase font-bold opacity-60">Pontos</p>
      </div>
    </motion.div>
  );
}
