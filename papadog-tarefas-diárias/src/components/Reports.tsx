import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { 
  FileText, 
  Download, 
  Filter, 
  Calendar,
  User as UserIcon,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function Reports() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>('ALL');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/tasks?role=ADMIN').then(res => res.json()).then(setTasks);
    fetch('/api/users').then(res => res.json()).then(setUsers);
  }, []);

  const generatePDF = async () => {
    setLoading(true);
    try {
      const filteredTasks = tasks.filter(t => selectedUser === 'ALL' || t.assigned_to === Number(selectedUser));
      const stats = {
        total: filteredTasks.length,
        completed: filteredTasks.filter(t => t.status === 'COMPLETED').length,
        pending: filteredTasks.filter(t => t.status === 'PENDING').length,
      };

      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();

      // Header
      doc.setFillColor(0, 168, 89); // Papadog Green
      doc.rect(0, 0, pageWidth, 40, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      doc.text('RELATÓRIO DE DESEMPENHO', 15, 20);
      
      doc.setFontSize(10);
      doc.text('GRUPO PAPADOG - CORPORATIVO', 15, 30);
      
      doc.setFontSize(10);
      doc.text(`Emissão: ${format(new Date(), "dd/MM/yyyy HH:mm")}`, pageWidth - 60, 25);

      // Summary Section
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(14);
      doc.text('Resumo Executivo', 15, 55);

      autoTable(doc, {
        startY: 60,
        head: [['Métrica', 'Valor']],
        body: [
          ['Total de Tarefas', stats.total.toString()],
          ['Tarefas Concluídas', stats.completed.toString()],
          ['Tarefas Pendentes', stats.pending.toString()],
          ['Taxa de Conclusão', `${stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%`]
        ],
        theme: 'striped',
        headStyles: { fillColor: [0, 168, 89] }
      });

      // Tasks Table
      doc.setFontSize(14);
      doc.text('Detalhamento de Atividades', 15, (doc as any).lastAutoTable.finalY + 15);

      const tableData = filteredTasks.map(t => [
        t.title,
        t.assigned_name || 'N/A',
        t.status === 'COMPLETED' ? 'Concluída' : 'Pendente',
        format(new Date(t.due_date), 'dd/MM/yyyy')
      ]);

      autoTable(doc, {
        startY: (doc as any).lastAutoTable.finalY + 20,
        head: [['Tarefa', 'Responsável', 'Status', 'Prazo']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [0, 168, 89] },
        styles: { fontSize: 9 }
      });

      // Footer
      const finalY = (doc as any).lastAutoTable.finalY + 30;
      doc.setFontSize(10);
      doc.text('__________________________________', pageWidth / 2 - 35, finalY);
      doc.text('Diego Boechat', pageWidth / 2 - 15, finalY + 7);
      doc.setFontSize(8);
      doc.text('Gestor Administrativo', pageWidth / 2 - 18, finalY + 12);

      doc.save(`RELATORIO_PAPADOG_${format(new Date(), 'dd_MM_yyyy_HHmm')}.pdf`);
      
      alert('Relatório gerado com sucesso! O arquivo foi enviado para sua pasta de Downloads.');
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      alert('Ocorreu um erro ao gerar o relatório. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const filteredTasks = tasks.filter(t => selectedUser === 'ALL' || t.assigned_to === Number(selectedUser));
  const stats = {
    total: filteredTasks.length,
    completed: filteredTasks.filter(t => t.status === 'COMPLETED').length,
    pending: filteredTasks.filter(t => t.status === 'PENDING').length,
  };

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Relatórios Executivos</h2>
          <p className="text-slate-500 dark:text-slate-400">Gere relatórios de desempenho e produtividade.</p>
        </div>
        <button 
          onClick={generatePDF}
          disabled={loading}
          className="btn-primary"
        >
          <Download className="w-5 h-5" />
          {loading ? 'Gerando...' : 'Exportar PDF'}
        </button>
      </div>

      <div className="glass-card p-6 flex items-center gap-6">
        <div className="flex items-center gap-3">
          <Filter className="w-5 h-5 text-slate-400" />
          <span className="text-sm font-bold text-slate-600 dark:text-slate-400">Filtrar por Colaborador:</span>
        </div>
        <select 
          value={selectedUser}
          onChange={(e) => setSelectedUser(e.target.value)}
          className="bg-slate-100 dark:bg-slate-800 border-none rounded-xl px-4 py-2 text-sm font-bold outline-none focus:ring-2 focus:ring-papadog-green"
        >
          <option value="ALL">Todos os Colaboradores</option>
          {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
        </select>
      </div>

      {/* Report Preview */}
      <div id="report-content" className="bg-white dark:bg-slate-900 rounded-3xl p-12 shadow-sm border border-slate-100 dark:border-slate-800 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b-4 border-papadog-green pb-8 mb-8">
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white">RELATÓRIO DE DESEMPENHO</h1>
            <p className="text-papadog-green font-bold tracking-widest uppercase text-sm">Grupo PAPADOG</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-400">Data de Emissão</p>
            <p className="font-bold text-slate-900 dark:text-white">{format(new Date(), "dd 'de' MMMM, yyyy", { locale: ptBR })}</p>
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-6 mb-12">
          <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-800">
            <p className="text-xs text-slate-400 uppercase font-bold mb-1">Total de Tarefas</p>
            <p className="text-3xl font-black text-slate-900 dark:text-white">{stats.total}</p>
          </div>
          <div className="bg-emerald-50 dark:bg-emerald-500/10 p-6 rounded-2xl border border-emerald-100 dark:border-emerald-500/20">
            <p className="text-xs text-emerald-600 uppercase font-bold mb-1">Concluídas</p>
            <p className="text-3xl font-black text-emerald-600">{stats.completed}</p>
          </div>
          <div className="bg-amber-50 dark:bg-amber-500/10 p-6 rounded-2xl border border-amber-100 dark:border-amber-500/20">
            <p className="text-xs text-amber-600 uppercase font-bold mb-1">Pendentes</p>
            <p className="text-3xl font-black text-amber-600">{stats.pending}</p>
          </div>
        </div>

        {/* Table */}
        <div className="space-y-4 mb-12">
          <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-4">Detalhamento de Atividades</h3>
          <div className="border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-800">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Tarefa</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Responsável</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Prazo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredTasks.map(task => (
                  <tr key={task.id}>
                    <td className="px-6 py-4 text-sm font-bold text-slate-900 dark:text-white">{task.title}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">{task.assigned_name}</td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${
                        task.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
                      }`}>
                        {task.status === 'COMPLETED' ? 'Concluída' : 'Pendente'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">{format(new Date(task.due_date), 'dd/MM/yyyy')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-end justify-between mt-20">
          <div className="text-sm text-slate-400">
            <p>Relatório gerado automaticamente pelo sistema</p>
            <p>© 2024 Grupo PAPADOG - Todos os direitos reservados</p>
          </div>
          <div className="text-center border-t border-slate-200 dark:border-slate-800 pt-4 w-64">
            <p className="font-bold text-slate-900 dark:text-white">Diego Boechat</p>
            <p className="text-xs text-slate-400 uppercase tracking-widest">Gestor Administrativo</p>
          </div>
        </div>
      </div>
    </div>
  );
}
