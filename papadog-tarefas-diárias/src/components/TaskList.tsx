import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Plus,
  Filter,
  MoreVertical,
  Calendar,
  User as UserIcon,
  Paperclip,
  Download,
  FileText,
  Edit,
  Trash2,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Task, Priority } from '../types';
import { PRIORITY_COLORS, cn } from '../utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import PraiseModal from './PraiseModal';

export default function TaskList() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState('ALL');
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [activeMenu, setActiveMenu] = useState<number | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showPraise, setShowPraise] = useState(false);

  // Create Task Form State
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newAssignee, setNewAssignee] = useState('');
  const [newAssignmentType, setNewAssignmentType] = useState<'INDIVIDUAL' | 'GROUP'>('INDIVIDUAL');
  const [newAssignedUsers, setNewAssignedUsers] = useState<number[]>([]);
  const [newPriority, setNewPriority] = useState<Priority>('MEDIUM');
  const [newStartDate, setNewStartDate] = useState('');
  const [newDueDate, setNewDueDate] = useState('');
  const [newAttachment, setNewAttachment] = useState<string | null>(null);
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      fetchTasks();
      if (user.role === 'ADMIN') {
        fetch('/api/users').then(res => res.json()).then(setUsers);
      }
    }
  }, [user]);

  const fetchTasks = async () => {
    if (!user) return;
    const res = await fetch(`/api/tasks?userId=${user.id}&role=${user.role}`);
    const data = await res.json();
    setTasks(data);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewAttachment(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleComplete = async (id: number) => {
    await fetch(`/api/tasks/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'COMPLETED' })
    });
    fetchTasks();
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: newTitle,
        description: newDesc,
        assigned_to: newAssignmentType === 'INDIVIDUAL' ? newAssignee : null,
        assignment_type: newAssignmentType,
        assigned_users: newAssignmentType === 'GROUP' ? newAssignedUsers : [],
        priority: newPriority,
        start_date: newStartDate,
        due_date: newDueDate,
        attachment: newAttachment
      })
    });
    setShowCreate(false);
    fetchTasks();
    // Reset form
    setNewTitle('');
    setNewDesc('');
    setNewStartDate('');
    setNewDueDate('');
    setNewAttachment(null);
    setNewAssignedUsers([]);
    setNewAssignmentType('INDIVIDUAL');
  };

  const toggleUserSelection = (userId: number) => {
    setNewAssignedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId) 
        : [...prev, userId]
    );
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask) return;
    
    await fetch(`/api/tasks/${selectedTask.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: newTitle,
        description: newDesc,
        assigned_to: newAssignmentType === 'INDIVIDUAL' ? newAssignee : null,
        assignment_type: newAssignmentType,
        assigned_users: newAssignmentType === 'GROUP' ? newAssignedUsers : [],
        priority: newPriority,
        start_date: newStartDate,
        due_date: newDueDate,
        attachment: newAttachment
      })
    });
    setShowEdit(false);
    setSelectedTask(null);
    fetchTasks();
    // Reset form
    setNewTitle('');
    setNewDesc('');
    setNewStartDate('');
    setNewDueDate('');
    setNewAttachment(null);
    setNewAssignee('');
    setNewAssignedUsers([]);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Deseja excluir esta tarefa?')) {
      await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
      fetchTasks();
    }
  };

  const openEdit = (task: Task) => {
    setSelectedTask(task);
    setNewTitle(task.title);
    setNewDesc(task.description || '');
    setNewPriority(task.priority);
    setNewStartDate(task.start_date || '');
    setNewDueDate(task.due_date);
    setNewAttachment(task.attachment || null);
    setNewAssignmentType(task.assignment_type || 'INDIVIDUAL');
    if (task.assignment_type === 'GROUP') {
      setNewAssignedUsers(task.assigned_users || []);
    } else {
      setNewAssignee(String(task.assigned_to || ''));
    }
    setShowEdit(true);
    setActiveMenu(null);
  };

  const downloadAttachment = (base64: string, filename: string) => {
    const link = document.createElement('a');
    link.href = base64;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredTasks = tasks.filter(t => {
    if (filter === 'ALL') return true;
    return t.status === filter;
  });

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Gestão de Tarefas</h2>
          <p className="text-slate-500 dark:text-slate-400">Acompanhe e gerencie suas atividades diárias.</p>
        </div>
        <div className="flex gap-3">
          {user?.role === 'ADMIN' && (
            <button 
              onClick={() => setShowCreate(true)}
              className="btn-primary"
            >
              <Plus className="w-5 h-5" />
              Nova Tarefa
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <button 
          onClick={() => setFilter('ALL')}
          className={cn(
            "px-4 py-2 rounded-lg text-sm font-bold transition-all",
            filter === 'ALL' ? "bg-papadog-green text-white" : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          )}
        >
          Todas
        </button>
        <button 
          onClick={() => setFilter('PENDING')}
          className={cn(
            "px-4 py-2 rounded-lg text-sm font-bold transition-all",
            filter === 'PENDING' ? "bg-amber-500 text-white" : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          )}
        >
          Pendentes
        </button>
        <button 
          onClick={() => setFilter('COMPLETED')}
          className={cn(
            "px-4 py-2 rounded-lg text-sm font-bold transition-all",
            filter === 'COMPLETED' ? "bg-papadog-green text-white" : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          )}
        >
          Concluídas
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredTasks.map((task) => (
          <motion.div 
            layout
            key={task.id}
            className="glass-card p-5 flex items-center justify-between group"
          >
            <div className="flex items-center gap-4">
              <button 
                onClick={() => task.status === 'PENDING' && handleComplete(task.id)}
                className={cn(
                  "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                  task.status === 'COMPLETED' 
                    ? "bg-papadog-green border-papadog-green text-white" 
                    : "border-slate-300 dark:border-slate-700 hover:border-papadog-green text-transparent"
                )}
              >
                <CheckCircle2 className="w-4 h-4" />
              </button>
              <div>
                <h4 className={cn(
                  "font-bold text-slate-900 dark:text-white",
                  task.status === 'COMPLETED' && "line-through text-slate-400 dark:text-slate-600"
                )}>
                  {task.title}
                </h4>
                <div className="flex items-center gap-4 mt-1">
                  <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full uppercase", PRIORITY_COLORS[task.priority])}>
                    {task.priority}
                  </span>
                  <div className="flex items-center gap-1 text-xs text-slate-400">
                    <Calendar className="w-3 h-3" />
                    <span>
                      {task.start_date ? format(new Date(task.start_date), "dd/MM", { locale: ptBR }) : 'Imediato'} 
                      {' → '} 
                      {format(new Date(task.due_date), "dd/MM", { locale: ptBR })}
                    </span>
                  </div>
                  {user?.role === 'ADMIN' && (
                    <div className="flex items-center gap-1 text-xs text-slate-400">
                      <UserIcon className="w-3 h-3" />
                      {task.assignment_type === 'GROUP' ? 'Equipe' : task.assigned_name}
                    </div>
                  )}
                  {task.attachment && (
                    <button 
                      onClick={() => downloadAttachment(task.attachment!, `Anexo_Tarefa_${task.id}`)}
                      className="flex items-center gap-1 text-xs text-papadog-green font-bold hover:underline"
                    >
                      <Paperclip className="w-3 h-3" />
                      Ver Anexo
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 relative">
              {user?.role === 'ADMIN' && task.status === 'COMPLETED' && (
                <button 
                  onClick={() => {
                    setSelectedTask(task);
                    setShowPraise(true);
                  }}
                  className="px-3 py-1.5 bg-emerald-100 text-emerald-600 rounded-lg text-xs font-bold hover:bg-emerald-200 transition-all"
                >
                  Avaliar
                </button>
              )}
              {user?.role === 'ADMIN' && (
                <div className="relative">
                  <button 
                    onClick={() => setActiveMenu(activeMenu === task.id ? null : task.id)}
                    className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                  >
                    <MoreVertical className="w-5 h-5" />
                  </button>
                  
                  <AnimatePresence>
                    {activeMenu === task.id && (
                      <>
                        <div 
                          className="fixed inset-0 z-10" 
                          onClick={() => setActiveMenu(null)}
                        />
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.95, y: -10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: -10 }}
                          className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-100 dark:border-slate-800 py-2 z-20"
                        >
                          <button 
                            onClick={() => openEdit(task)}
                            className="w-full px-4 py-2 text-left text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2"
                          >
                            <Edit className="w-4 h-4" />
                            Editar Tarefa
                          </button>
                          <button 
                            onClick={() => handleDelete(task.id)}
                            className="w-full px-4 py-2 text-left text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                          >
                            <Trash2 className="w-4 h-4" />
                            Excluir Tarefa
                          </button>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Create/Edit Task Modal */}
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
                setSelectedTask(null);
              }}
              className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-8 overflow-hidden max-h-[90vh] overflow-y-auto"
            >
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
                {showEdit ? 'Editar Tarefa' : 'Nova Tarefa'}
              </h3>
              <form onSubmit={showEdit ? handleUpdate : handleCreate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Título</label>
                  <input 
                    type="text" 
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none focus:ring-2 focus:ring-papadog-green text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Descrição</label>
                  <textarea 
                    rows={3}
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none focus:ring-2 focus:ring-papadog-green text-slate-900 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tipo de Atribuição</label>
                    <select 
                      value={newAssignmentType}
                      onChange={(e) => setNewAssignmentType(e.target.value as 'INDIVIDUAL' | 'GROUP')}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none focus:ring-2 focus:ring-papadog-green text-slate-900 dark:text-white"
                    >
                      <option value="INDIVIDUAL">Individual</option>
                      <option value="GROUP">Em Grupo</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Prioridade</label>
                    <select 
                      value={newPriority}
                      onChange={(e) => setNewPriority(e.target.value as Priority)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none focus:ring-2 focus:ring-papadog-green text-slate-900 dark:text-white"
                    >
                      <option value="LOW">Baixa</option>
                      <option value="MEDIUM">Média</option>
                      <option value="HIGH">Alta</option>
                      <option value="URGENT">Urgente</option>
                    </select>
                  </div>
                </div>

                {newAssignmentType === 'INDIVIDUAL' ? (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Responsável</label>
                    <select 
                      value={newAssignee}
                      onChange={(e) => setNewAssignee(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none focus:ring-2 focus:ring-papadog-green text-slate-900 dark:text-white"
                    >
                      <option value="">Selecione...</option>
                      {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Membros do Grupo</label>
                    <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                      {users.map(u => (
                        <button
                          key={u.id}
                          type="button"
                          onClick={() => toggleUserSelection(u.id)}
                          className={cn(
                            "flex items-center gap-2 p-2 rounded-lg text-xs font-medium transition-all",
                            newAssignedUsers.includes(u.id) 
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

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Data de Início</label>
                    <input 
                      type="date" 
                      value={newStartDate}
                      onChange={(e) => setNewStartDate(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none focus:ring-2 focus:ring-papadog-green text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Prazo Final</label>
                    <input 
                      type="date" 
                      required
                      value={newDueDate}
                      onChange={(e) => setNewDueDate(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none focus:ring-2 focus:ring-papadog-green text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Anexar Documento</label>
                  <div className="relative">
                    <input 
                      type="file" 
                      onChange={handleFileChange}
                      className="hidden" 
                      id="task-file"
                    />
                    <label 
                      htmlFor="task-file"
                      className={cn(
                        "w-full px-4 py-2.5 rounded-xl border border-dashed flex items-center justify-center gap-2 cursor-pointer transition-all",
                        newAttachment ? "border-papadog-green bg-papadog-green/5 text-papadog-green" : "border-slate-200 dark:border-slate-700 text-slate-400 hover:border-papadog-green"
                      )}
                    >
                      {newAttachment ? <CheckCircle2 className="w-4 h-4" /> : <Paperclip className="w-4 h-4" />}
                      <span className="text-xs font-bold">{newAttachment ? 'Arquivo Pronto' : 'Selecionar Arquivo'}</span>
                    </label>
                  </div>
                </div>
                <div className="flex gap-3 mt-8">
                  <button 
                    type="button"
                    onClick={() => {
                      setShowCreate(false);
                      setShowEdit(false);
                      setSelectedTask(null);
                    }}
                    className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 btn-primary py-3"
                  >
                    {showEdit ? 'Salvar Alterações' : 'Criar Tarefa'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {selectedTask && (
        <PraiseModal 
          isOpen={showPraise} 
          onClose={() => {
            setShowPraise(false);
            setSelectedTask(null);
            fetchTasks();
          }} 
          task={selectedTask} 
        />
      )}
    </div>
  );
}
