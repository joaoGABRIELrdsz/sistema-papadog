import React, { useState, useRef } from 'react';
import { useAuth } from '../AuthContext';
import { 
  User, 
  Mail, 
  Camera, 
  Save, 
  Shield, 
  Award,
  CheckCircle2,
  Lock,
  RefreshCw
} from 'lucide-react';
import { LEVELS, cn } from '../utils';
import { motion, AnimatePresence } from 'motion/react';

const PRESET_AVATARS = [
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Diego",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Joao",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Douglas",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Maria",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Ana",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Bia",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Leo",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Gabi",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Rafa",
];

export default function Profile() {
  const { user, setUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const currentLevel = user?.level || 'Bronze';
  const levelData = LEVELS[currentLevel as keyof typeof LEVELS] || LEVELS.Bronze;
  
  // Find next level
  const levelsArray = Object.entries(LEVELS);
  const currentLevelIndex = levelsArray.findIndex(([name]) => name === currentLevel);
  const nextLevel = currentLevelIndex !== -1 && currentLevelIndex < levelsArray.length - 1 
    ? levelsArray[currentLevelIndex + 1] 
    : null;

  const pointsInCurrentLevel = (user?.points || 0) - levelData.min;
  const totalPointsInLevel = levelData.max - levelData.min;
  const progress = Math.min(100, Math.max(0, (pointsInCurrentLevel / totalPointsInLevel) * 100));

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Update avatar first if changed
      if (avatar !== user?.avatar) {
        await fetch(`/api/users/${user?.id}/avatar`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ avatar })
        });
      }

      // Update name/email
      const res = await fetch(`/api/users/${user?.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, role: user?.role })
      });

      if (res.ok) {
        setUser({ ...user, name, email, avatar });
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Meu Perfil</h2>
        <p className="text-slate-500 dark:text-slate-400">Gerencie suas informações pessoais e foto de perfil.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-card p-8 text-center flex flex-col items-center">
            <div className="relative group">
              <div className="relative">
                <img 
                  src={avatar} 
                  alt={user?.name} 
                  className="w-32 h-32 rounded-3xl border-4 border-white dark:border-slate-800 shadow-xl object-cover transition-transform group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <button 
                  onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                  className="absolute -bottom-2 -right-2 p-2 bg-papadog-green text-white rounded-xl shadow-lg hover:scale-110 transition-all"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <h3 className="mt-6 font-bold text-xl text-slate-900 dark:text-white">{user?.name}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{user?.email}</p>
            
            <div className={cn(
              "px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-all duration-500",
              LEVELS[user?.level as keyof typeof LEVELS]?.bg || "bg-slate-100",
              LEVELS[user?.level as keyof typeof LEVELS]?.text || "text-slate-500",
              (LEVELS[user?.level as keyof typeof LEVELS] as any)?.glow
            )}>
              <Award className="w-4 h-4" />
              Elo {user?.level}
            </div>

            <div className="mt-8 w-full pt-8 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-[10px] uppercase font-bold text-slate-400">Pontos</p>
                <p className="text-xl font-black text-papadog-green">{user?.points}</p>
              </div>
              <div className="text-center">
                <p className="text-[10px] uppercase font-bold text-slate-400">Cargo</p>
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{user?.role}</p>
              </div>
            </div>
          </div>

          <AnimatePresence>
            {showAvatarPicker && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="glass-card p-4 grid grid-cols-5 gap-2"
              >
                {PRESET_AVATARS.map((av, i) => (
                  <button 
                    key={i}
                    onClick={() => {
                      setAvatar(av);
                      setShowAvatarPicker(false);
                    }}
                    className={cn(
                      "w-10 h-10 rounded-lg overflow-hidden border-2 transition-all hover:scale-110",
                      avatar === av ? "border-papadog-green" : "border-transparent"
                    )}
                  >
                    <img src={av} alt="Avatar" className="w-full h-full object-cover" />
                  </button>
                ))}
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-papadog-green transition-colors"
                >
                  <Camera className="w-5 h-5" />
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="glass-card p-6 bg-papadog-green/5 border-papadog-green/20">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-5 h-5 text-papadog-green" />
              <h4 className="font-bold text-slate-900 dark:text-white">Segurança</h4>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Sua conta está protegida. Lembre-se de usar senhas fortes e não compartilhá-las.
            </p>
            <button className="w-full py-2.5 rounded-xl border border-papadog-green/30 text-papadog-green text-xs font-bold hover:bg-papadog-green/10 transition-all flex items-center justify-center gap-2">
              <Lock className="w-4 h-4" />
              Alterar Senha
            </button>
          </div>
        </div>

        {/* Edit Form */}
        <div className="lg:col-span-2">
          <div className="glass-card p-8">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Informações Pessoais</h3>
            <form onSubmit={handleUpdate} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Nome Completo</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      type="text" 
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-2.5 pl-11 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none focus:ring-2 focus:ring-papadog-green text-slate-900 dark:text-white transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">E-mail Corporativo</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      type="email" 
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-2.5 pl-11 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none focus:ring-2 focus:ring-papadog-green text-slate-900 dark:text-white transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {success && (
                    <motion.div 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center gap-1.5 text-emerald-500 text-sm font-bold"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Perfil atualizado com sucesso!
                    </motion.div>
                  )}
                </div>
                <button 
                  type="submit"
                  disabled={loading}
                  className="btn-primary px-8 py-3"
                >
                  <Save className="w-5 h-5" />
                  {loading ? 'Salvando...' : 'Salvar Alterações'}
                </button>
              </div>
            </form>
          </div>

          <div className="mt-8 glass-card p-8 bg-slate-900 text-white overflow-hidden relative">
            <div className="relative z-10">
              <h3 className="text-xl font-bold mb-2">
                {nextLevel ? `Próximo Nível: ${nextLevel[0]}` : 'Nível Máximo Atingido!'}
              </h3>
              <p className="text-slate-400 text-sm mb-6">
                {nextLevel 
                  ? 'Continue concluindo tarefas para subir de nível e ganhar recompensas.' 
                  : 'Você atingiu o topo! Continue mantendo sua excelência.'}
              </p>
              
              {nextLevel && (
                <>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-widest text-papadog-green">Progresso</span>
                    <span className="text-xs font-bold">{user?.points} / {levelData.max} pts</span>
                  </div>
                  <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      className="h-full bg-papadog-green shadow-[0_0_15px_rgba(0,168,89,0.5)]"
                    />
                  </div>
                </>
              )}
            </div>
            <Award className="absolute -right-8 -bottom-8 w-48 h-48 text-white/5 rotate-12" />
          </div>
        </div>
      </div>
    </div>
  );
}
