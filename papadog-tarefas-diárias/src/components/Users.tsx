import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { 
  Users as UsersIcon, 
  Plus, 
  Search, 
  MoreVertical, 
  Mail, 
  Shield,
  Award,
  Edit2,
  Trash2,
  X,
  Save,
  RefreshCw,
  Camera
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

export default function Users() {
  const { user: currentUser, setUser } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [editingUser, setEditingUser] = useState<any>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('USER');
  const [avatar, setAvatar] = useState(PRESET_AVATARS[0]);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = () => {
    fetch('/api/users')
      .then(res => res.json())
      .then(setUsers);
  };

  const handleEdit = (user: any) => {
    setEditingUser(user);
    setName(user.name);
    setEmail(user.email);
    setRole(user.role);
    setAvatar(user.avatar);
    setShowEditModal(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    // Update basic info
    const res = await fetch(`/api/users/${editingUser.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, role })
    });

    // Update avatar if changed
    if (avatar !== editingUser.avatar) {
      await fetch(`/api/users/${editingUser.id}/avatar`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatar })
      });
    }

    if (res.ok) {
      if (editingUser.id === currentUser?.id) {
        setUser({ ...currentUser, name, email, role, avatar });
      }
      setShowEditModal(false);
      fetchUsers();
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Tem certeza que deseja excluir este colaborador? Todas as tarefas associadas também serão excluídas.')) {
      const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchUsers();
      } else {
        const data = await res.json();
        alert(data.error || 'Erro ao excluir usuário');
      }
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/users/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        name, 
        email, 
        role,
        password: 'papadog-user',
        avatar
      })
    });
    if (res.ok) {
      setShowCreateModal(false);
      fetchUsers();
      // Reset form
      setName('');
      setEmail('');
      setRole('USER');
      setAvatar(PRESET_AVATARS[0]);
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Colaboradores</h2>
          <p className="text-slate-500 dark:text-slate-400">Gerencie a equipe e permissões do sistema.</p>
        </div>
        <button className="btn-primary" onClick={() => {
          setAvatar(PRESET_AVATARS[Math.floor(Math.random() * PRESET_AVATARS.length)]);
          setShowCreateModal(true);
        }}>
          <Plus className="w-5 h-5" />
          Novo Colaborador
        </button>
      </div>

      <div className="glass-card p-4 flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Buscar por nome ou e-mail..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-xl py-2.5 pl-11 pr-4 text-sm outline-none focus:ring-2 focus:ring-papadog-green transition-all text-slate-900 dark:text-white"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsers.map((user) => (
          <div key={user.id} className="glass-card p-6 group hover:border-papadog-green transition-all duration-300">
            <div className="flex items-start justify-between mb-6">
              <div className="relative">
                <img 
                  src={user.avatar} 
                  alt={user.name} 
                  className="w-16 h-16 rounded-2xl border-2 border-slate-100 dark:border-slate-800"
                  referrerPolicy="no-referrer"
                />
                <div className={cn(
                  "absolute -bottom-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900 shadow-lg",
                  user.role === 'ADMIN' ? "bg-papadog-green text-white" : "bg-slate-100 text-slate-400"
                )}>
                  <Shield className="w-4 h-4" />
                </div>
              </div>
              <div className="flex gap-1">
                <button 
                  onClick={() => handleEdit(user)}
                  className="p-2 text-slate-400 hover:text-papadog-green dark:hover:text-papadog-green transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                {user.id !== currentUser?.id && user.id !== 1 && (
                  <button 
                    onClick={() => handleDelete(user.id)}
                    className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            <h3 className="font-bold text-lg text-slate-900 dark:text-white">{user.name}</h3>
            <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
              <Mail className="w-4 h-4" />
              {user.email}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Elo Atual</p>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${LEVELS[user.level as keyof typeof LEVELS].bg} ${LEVELS[user.level as keyof typeof LEVELS].text}`}>
                  {user.level}
                </span>
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase font-bold text-slate-400">Pontos</p>
                <p className="font-bold text-papadog-green">{user.points}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {showEditModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowEditModal(false)}
              className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-8 overflow-hidden"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Editar Colaborador</h3>
                <button onClick={() => setShowEditModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
              <form onSubmit={handleUpdate} className="space-y-4">
                <div className="flex justify-center mb-6">
                  <div className="relative group">
                    <img src={avatar} alt="Avatar" className="w-24 h-24 rounded-2xl border-4 border-slate-100 dark:border-slate-800 shadow-lg" />
                    <button 
                      type="button"
                      onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                      className="absolute -bottom-2 -right-2 p-2 bg-papadog-green text-white rounded-lg shadow-lg"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {showAvatarPicker && (
                  <div className="grid grid-cols-5 gap-2 mb-6 p-2 bg-slate-50 dark:bg-slate-800 rounded-xl">
                    {PRESET_AVATARS.map((av, i) => (
                      <button 
                        key={i}
                        type="button"
                        onClick={() => {
                          setAvatar(av);
                          setShowAvatarPicker(false);
                        }}
                        className={cn(
                          "w-full aspect-square rounded-lg overflow-hidden border-2 transition-all",
                          avatar === av ? "border-papadog-green" : "border-transparent"
                        )}
                      >
                        <img src={av} alt="Avatar" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nome Completo</label>
                  <input 
                    type="text" 
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none focus:ring-2 focus:ring-papadog-green text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">E-mail Corporativo</label>
                  <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none focus:ring-2 focus:ring-papadog-green text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Cargo/Permissão</label>
                  <select 
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none focus:ring-2 focus:ring-papadog-green text-slate-900 dark:text-white"
                  >
                    <option value="USER">Colaborador (USER)</option>
                    <option value="ADMIN">Gestor (ADMIN)</option>
                  </select>
                </div>
                <div className="flex gap-3 mt-8">
                  <button 
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 btn-primary py-3"
                  >
                    <Save className="w-5 h-5" />
                    Salvar Alterações
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Create Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCreateModal(false)}
              className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-8 overflow-hidden"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Novo Colaborador</h3>
                <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="flex justify-center mb-6">
                  <div className="relative group">
                    <img src={avatar} alt="Avatar" className="w-24 h-24 rounded-2xl border-4 border-slate-100 dark:border-slate-800 shadow-lg" />
                    <button 
                      type="button"
                      onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                      className="absolute -bottom-2 -right-2 p-2 bg-papadog-green text-white rounded-lg shadow-lg"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {showAvatarPicker && (
                  <div className="grid grid-cols-5 gap-2 mb-6 p-2 bg-slate-50 dark:bg-slate-800 rounded-xl">
                    {PRESET_AVATARS.map((av, i) => (
                      <button 
                        key={i}
                        type="button"
                        onClick={() => {
                          setAvatar(av);
                          setShowAvatarPicker(false);
                        }}
                        className={cn(
                          "w-full aspect-square rounded-lg overflow-hidden border-2 transition-all",
                          avatar === av ? "border-papadog-green" : "border-transparent"
                        )}
                      >
                        <img src={av} alt="Avatar" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nome Completo</label>
                  <input 
                    type="text" 
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none focus:ring-2 focus:ring-papadog-green text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">E-mail Corporativo</label>
                  <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none focus:ring-2 focus:ring-papadog-green text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Cargo/Permissão</label>
                  <select 
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none focus:ring-2 focus:ring-papadog-green text-slate-900 dark:text-white"
                  >
                    <option value="USER">Colaborador (USER)</option>
                    <option value="ADMIN">Gestor (ADMIN)</option>
                  </select>
                </div>
                <div className="flex gap-3 mt-8">
                  <button 
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 btn-primary py-3"
                  >
                    <Plus className="w-5 h-5" />
                    Criar Colaborador
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
