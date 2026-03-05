import React, { useState } from 'react';
import { useAuth } from '../AuthContext';
import { motion } from 'motion/react';
import { LogIn, ShieldCheck } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(email, password);
    } catch (err) {
      setError('E-mail ou senha incorretos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-950 p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl p-8 border border-slate-200 dark:border-slate-800">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-papadog-green rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-papadog-green/20">
              <ShieldCheck className="text-white w-10 h-10" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Grupo PAPADOG</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Gestão de Tarefas Corporativas</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">E-mail Corporativo</label>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-papadog-green outline-none transition-all"
                placeholder="exemplo@papadog.com.br"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Senha</label>
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-papadog-green outline-none transition-all"
                placeholder="••••••••"
              />
            </div>

            {error && <p className="text-red-500 text-sm text-center">{error}</p>}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full btn-primary py-3 text-lg"
            >
              {loading ? 'Entrando...' : (
                <>
                  <LogIn className="w-5 h-5" />
                  Acessar Sistema
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800 text-center">
            <p className="text-xs text-slate-400">Acesso restrito a colaboradores autorizados.</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
