import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { 
  Target, 
  TrendingUp, 
  CheckCircle2, 
  Flag, 
  Plus, 
  X, 
  Save, 
  ChevronRight,
  Calendar,
  Clock,
  Trash2,
  Edit
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const cn = (...classes: any[]) => classes.filter(Boolean).join(' ');

export default function Goals() {
  const { user } = useAuth();
  const [companyGoals, setCompanyGoals] = useState<any[]>([]);
  const [individualGoals, setIndividualGoals] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [targetValue, setTargetValue] = useState('');
  const [type, setType] = useState('INDIVIDUAL');
  const [frequency, setFrequency] = useState('MONTHLY');
  const [assignedTo, setAssignedTo] = useState('');
  const [assignedUsers, setAssignedUsers] = useState<number[]>([]);
  const [startDate, setStartDate] = useState('');

  useEffect(() => {
    fetchGoals();
    if (user?.role === 'ADMIN') {
      fetch('/api/users').then(res => res.json()).then(setUsers);
    }
  }, [user]);

  const fetchGoals = async () => {
    if (!user) return;
    
    const [compRes, indRes] = await Promise.all([
      fetch('/api/goals?type=COMPANY').then(res => res.json()),
      fetch(`/api/goals?userId=${user.id}&type=INDIVIDUAL`).then(res => res.json())
    ]);
    
    setCompanyGoals(compRes);
    setIndividualGoals(indRes);
  };

  const toggleUserSelection = (userId: number) => {
    setAssignedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId) 
        : [...prev, userId]
    );
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch('/api/goals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        target_value: Number(targetValue),
        type,
        frequency,
        user_id: type === 'COMPANY' ? null : (assignedTo || user.id),
        assigned_users: type === 'COMPANY' ? assignedUsers : [],
        start_date: startDate
      })
    });
    
    if (res.ok) {
      setShowCreate(false);
      fetchGoals();
      // Reset
      setTitle('');
      setTargetValue('');
      setAssignedTo('');
      setAssignedUsers([]);
      setStartDate('');
    }
    setLoading(false);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGoal) return;
    setLoading(true);
    
    const res = await fetch(`/api/goals/${selectedGoal.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        target_value: Number(targetValue),
        type,
        frequency,
        assigned_users: type === 'COMPANY' ? assignedUsers : [],
        start_date: startDate
      })
    });
    
    if (res.ok) {
      setShowEdit(false);
      setSelectedGoal(null);
      fetchGoals();
      // Reset
      setTitle('');
      setTargetValue('');
      setAssignedTo('');
      setAssignedUsers([]);
      setStartDate('');
    }
    setLoading(false);
  };

  const openEdit = (goal: any) => {
    setSelectedGoal(goal);
    setTitle(goal.title);
    setTargetValue(goal.target_value);
    setType(goal.type);
    setFrequency(goal.frequency);
    setStartDate(goal.start_date || '');
    setAssignedUsers(goal.assigned_users || []);
    setShowEdit(true);
  };

  const updateProgress = async (id: number, currentValue: number) => {
    await fetch(`/api/goals/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ current_value: currentValue })
    });
    fetchGoals();
  };

  const toggleStatus = async (id: number, currentStatus: string) => {
    const newStatus = currentStatus === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
    await fetch(`/api/goals/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    });
    fetchGoals();
  };

  const handleDelete = async (id: number) => {
    if (confirm('Deseja excluir esta meta?')) {
      await fetch(`/api/goals/${id}`, { method: 'DELETE' });
      fetchGoals();
    }
  };

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Metas Estratégicas</h2>
          <p className="text-slate-500 dark:text-slate-400">Acompanhe o progresso dos objetivos do Grupo PAPADOG.</p>
        </div>
        {user?.role === 'ADMIN' && (
          <button onClick={() => setShowCreate(true)} className="btn-primary">
            <Plus className="w-5 h-5" />
            Nova Meta
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Company Goals */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <Flag className="w-5 h-5 text-papadog-green" />
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">Metas Corporativas</h3>
          </div>
          {companyGoals.length === 0 ? (
            <p className="text-sm text-slate-400 italic">Nenhuma meta corporativa definida.</p>
          ) : (
            companyGoals.map((goal) => (
              <GoalCard 
                key={goal.id} 
                goal={goal} 
                isAdmin={user?.role === 'ADMIN'} 
                currentUserId={user?.id}
                users={users}
                onUpdate={updateProgress}
                onToggleStatus={toggleStatus}
                onDelete={handleDelete}
                onEdit={openEdit}
              />
            ))
          )}
        </div>

        {/* Individual Goals */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <Target className="w-5 h-5 text-papadog-green" />
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">Minhas Metas</h3>
          </div>
          {individualGoals.length === 0 ? (
            <p className="text-sm text-slate-400 italic">Você não possui metas individuais no momento.</p>
          ) : (
            individualGoals.map((goal) => (
              <GoalCard 
                key={goal.id} 
                goal={goal} 
                isAdmin={user?.role === 'ADMIN'} 
                currentUserId={user?.id}
                users={users}
                onUpdate={updateProgress}
                onToggleStatus={toggleStatus}
                onDelete={handleDelete}
                onEdit={openEdit}
              />
            ))
          )}
        </div>
      </div>

      {/* Performance Indicator */}
      <div className="glass-card p-8 flex items-center justify-between bg-emerald-50/50 dark:bg-emerald-500/5 border-emerald-100 dark:border-emerald-500/20">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-papadog-green text-white rounded-2xl flex items-center justify-center shadow-lg shadow-papadog-green/20">
            <TrendingUp className="w-8 h-8" />
          </div>
          <div>
            <h4 className="text-xl font-bold text-slate-900 dark:text-white">Indicador de Performance do Setor</h4>
            <p className="text-slate-500 dark:text-slate-400">Sua equipe está operando com alta eficiência este mês.</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-4xl font-black text-papadog-green">94.2%</p>
          <div className="w-48 h-2 bg-slate-200 dark:bg-slate-800 rounded-full mt-2 overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: '94.2%' }}
              className="h-full bg-papadog-green"
            />
          </div>
        </div>
      </div>

      {/* Create/Edit Goal Modal */}
      <AnimatePresence>
        {(showCreate || showEdit) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setShowCreate(false);
                setShowEdit(false);
                setSelectedGoal(null);
              }}
              className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-8 overflow-hidden max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {showEdit ? 'Editar Meta' : 'Nova Meta'}
                </h3>
                <button 
                  onClick={() => {
                    setShowCreate(false);
                    setShowEdit(false);
                    setSelectedGoal(null);
                  }} 
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
              <form onSubmit={showEdit ? handleUpdate : handleCreate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Título da Meta</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Ex: 120 Cadastros de Clientes"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none focus:ring-2 focus:ring-papadog-green text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Valor Alvo (Número)</label>
                  <input 
                    type="number" 
                    required
                    value={targetValue}
                    onChange={(e) => setTargetValue(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none focus:ring-2 focus:ring-papadog-green text-slate-900 dark:text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Data de Início</label>
                    <input 
                      type="date" 
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none focus:ring-2 focus:ring-papadog-green text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Frequência</label>
                    <select 
                      value={frequency}
                      onChange={(e) => setFrequency(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none focus:ring-2 focus:ring-papadog-green text-slate-900 dark:text-white"
                    >
                      <option value="DAILY">Diária</option>
                      <option value="WEEKLY">Semanal</option>
                      <option value="MONTHLY">Mensal</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tipo de Meta</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      type="button"
                      disabled={showEdit}
                      onClick={() => setType('INDIVIDUAL')}
                      className={`py-2.5 rounded-xl border font-bold text-sm transition-all ${type === 'INDIVIDUAL' ? 'bg-papadog-green/10 border-papadog-green text-papadog-green' : 'border-slate-200 dark:border-slate-700 text-slate-500'} ${showEdit ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      Individual
                    </button>
                    <button 
                      type="button"
                      disabled={showEdit}
                      onClick={() => setType('COMPANY')}
                      className={`py-2.5 rounded-xl border font-bold text-sm transition-all ${type === 'COMPANY' ? 'bg-papadog-green/10 border-papadog-green text-papadog-green' : 'border-slate-200 dark:border-slate-700 text-slate-500'} ${showEdit ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      Corporativa
                    </button>
                  </div>
                </div>
                {type === 'INDIVIDUAL' ? (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Designar para</label>
                    <select 
                      value={assignedTo}
                      disabled={showEdit}
                      onChange={(e) => setAssignedTo(e.target.value)}
                      className={`w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none focus:ring-2 focus:ring-papadog-green text-slate-900 dark:text-white ${showEdit ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <option value="">Eu mesmo</option>
                      {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Participantes da Meta</label>
                    <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                      {users.map(u => (
                        <button
                          key={u.id}
                          type="button"
                          onClick={() => toggleUserSelection(u.id)}
                          className={cn(
                            "flex items-center gap-2 p-2 rounded-lg text-xs font-medium transition-all",
                            assignedUsers.includes(u.id) 
                              ? "bg-papadog-green text-white shadow-md" 
                              : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100"
                          )}
                        >
                          <img src={u.avatar} alt="" className="w-5 h-5 rounded-full" />
                          {u.name.split(' ')[0]}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex gap-3 mt-8">
                  <button 
                    type="button"
                    onClick={() => {
                      setShowCreate(false);
                      setShowEdit(false);
                      setSelectedGoal(null);
                    }}
                    className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    disabled={loading}
                    className="flex-1 btn-primary py-3"
                  >
                    <Save className="w-5 h-5" />
                    {loading ? 'Salvando...' : (showEdit ? 'Salvar Alterações' : 'Salvar Meta')}
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

function GoalCard({ goal, isAdmin, currentUserId, users, onUpdate, onToggleStatus, onDelete, onEdit }: any) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(goal.current_value);
  const percentage = Math.min(100, (goal.current_value / goal.target_value) * 100);
  const isOwner = goal.user_id === currentUserId || (goal.assigned_users && goal.assigned_users.includes(currentUserId));
  const canUpdate = isAdmin || isOwner;
  
  const frequencyLabels: any = {
    'DAILY': 'Diária',
    'WEEKLY': 'Semanal',
    'MONTHLY': 'Mensal'
  };

  return (
    <div className={`glass-card p-6 transition-all ${goal.status === 'COMPLETED' ? 'opacity-75 grayscale-[0.5]' : ''}`}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-bold text-slate-900 dark:text-white">{goal.title}</h4>
            <span className="text-[10px] px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-full font-bold uppercase tracking-wider">
              {frequencyLabels[goal.frequency]}
            </span>
          </div>
          <div className="flex items-center gap-3 mb-1">
            <p className="text-xs text-slate-400">
              Progresso: <span className="font-bold text-slate-600 dark:text-slate-300">{goal.current_value}</span> / {goal.target_value}
            </p>
            {goal.start_date && (
              <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold">
                <Calendar className="w-3 h-3" />
                Início: {new Date(goal.start_date).toLocaleDateString('pt-BR')}
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-1">
          {isAdmin && (
            <button 
              onClick={() => onEdit(goal)}
              className="p-1.5 text-slate-300 hover:text-papadog-green transition-colors"
              title="Editar Meta"
            >
              <Edit className="w-4 h-4" />
            </button>
          )}
          {isAdmin && (
            <button 
              onClick={() => onDelete(goal.id)}
              className="p-1.5 text-slate-300 hover:text-red-500 transition-colors"
              title="Excluir Meta"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          <button 
            onClick={() => onToggleStatus(goal.id, goal.status)}
            className={`p-1.5 rounded-lg transition-all ${goal.status === 'COMPLETED' ? 'bg-papadog-green text-white' : 'text-slate-300 hover:text-papadog-green hover:bg-papadog-green/10'}`}
            title={goal.status === 'COMPLETED' ? "Reabrir Meta" : "Concluir Meta"}
          >
            <CheckCircle2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden relative group">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          className={`h-full transition-all duration-1000 ${goal.status === 'COMPLETED' ? 'bg-emerald-500' : 'bg-papadog-green'}`}
        />
      </div>

      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-2">
          <p className="text-xs font-bold text-slate-400">{Math.round(percentage)}% Concluído</p>
          {canUpdate && !isEditing && (
            <button 
              onClick={() => setIsEditing(true)}
              className="text-[10px] bg-papadog-green/10 text-papadog-green px-2 py-0.5 rounded font-bold hover:bg-papadog-green/20 transition-all"
            >
              Atualizar Valor
            </button>
          )}
        </div>
        
        {isEditing ? (
          <div className="flex items-center gap-2">
            <input 
              type="number" 
              value={tempValue}
              onChange={(e) => setTempValue(Number(e.target.value))}
              className="w-20 px-2 py-1 text-xs rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none focus:ring-1 focus:ring-papadog-green text-slate-900 dark:text-white"
            />
            <button 
              onClick={() => {
                onUpdate(goal.id, tempValue);
                setIsEditing(false);
              }}
              className="p-1 bg-papadog-green text-white rounded hover:bg-papadog-green-dark transition-all"
            >
              <Save className="w-3 h-3" />
            </button>
            <button 
              onClick={() => setIsEditing(false)}
              className="p-1 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {goal.assigned_users && goal.assigned_users.length > 0 && goal.assigned_users.slice(0, 3).map((uid: number) => {
                const u = users.find((user: any) => user.id === uid);
                return u ? (
                  <img 
                    key={uid}
                    src={u.avatar} 
                    alt="" 
                    className="w-5 h-5 rounded-full border border-white dark:border-slate-900" 
                  />
                ) : null;
              })}
              {goal.assigned_users && goal.assigned_users.length > 3 && (
                <div className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[8px] font-bold text-slate-500 border border-white dark:border-slate-900">
                  +{goal.assigned_users.length - 3}
                </div>
              )}
            </div>
            {goal.status === 'COMPLETED' && (
              <div className="flex items-center gap-1 text-emerald-500">
                <CheckCircle2 className="w-3 h-3" />
                <span className="text-[10px] font-bold uppercase">Concluída</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
