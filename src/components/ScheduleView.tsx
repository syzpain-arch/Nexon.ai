import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  Plus,
  Clock,
  CheckCircle2,
  Circle,
  AlertCircle,
  Trash2,
  Filter,
  RefreshCw,
  Sparkles,
  Tag,
  ArrowUpRight,
  Search,
} from 'lucide-react';
import { Task } from '../types/client.js';
import { api } from '../services/apiClient.js';

interface ScheduleViewProps {
  tasks: Task[];
  onTasksUpdated: () => void;
}

export const ScheduleView: React.FC<ScheduleViewProps> = ({ tasks, onTasksUpdated }) => {
  const [naturalLanguageInput, setNaturalLanguageInput] = useState('');
  const [isSubmittingNlp, setIsSubmittingNlp] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [isEvaluatingCron, setIsEvaluatingCron] = useState(false);

  // Manual modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<Task['priority']>('medium');
  const [newTaskTags, setNewTaskTags] = useState('');

  // Handle Natural Language Task creation
  const handleNlpTaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!naturalLanguageInput.trim() || isSubmittingNlp) return;

    setIsSubmittingNlp(true);
    try {
      await api.createTask({ rawCommand: naturalLanguageInput });
      setNaturalLanguageInput('');
      onTasksUpdated();
    } catch (err: any) {
      alert(`Task parsing failed: ${err.message}`);
    } finally {
      setIsSubmittingNlp(false);
    }
  };

  // Handle Manual Task creation
  const handleManualTaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    try {
      await api.createTask({
        title: newTaskTitle,
        description: newTaskDesc,
        dueDate: newTaskDueDate ? new Date(newTaskDueDate).toISOString() : new Date(Date.now() + 86400000).toISOString(),
        priority: newTaskPriority,
        tags: newTaskTags ? newTaskTags.split(',').map((t) => t.trim()) : ['Manual'],
      });
      setIsAddModalOpen(false);
      setNewTaskTitle('');
      setNewTaskDesc('');
      setNewTaskDueDate('');
      setNewTaskTags('');
      onTasksUpdated();
    } catch (err: any) {
      alert(`Failed to create task: ${err.message}`);
    }
  };

  // Handle Status Toggle
  const handleToggleStatus = async (task: Task) => {
    const nextStatus: Task['status'] =
      task.status === 'completed' ? 'pending' : 'completed';
    await api.updateTask(task.id, { status: nextStatus });
    onTasksUpdated();
  };

  // Handle Delete
  const handleDeleteTask = async (id: string) => {
    if (confirm('Delete this task from Jarvis schedule matrix?')) {
      await api.deleteTask(id);
      onTasksUpdated();
    }
  };

  // Trigger Immediate Background Cron Job
  const handleTriggerCron = async () => {
    setIsEvaluatingCron(true);
    try {
      await api.triggerCronEvaluation();
      onTasksUpdated();
    } catch (e) {}
    setTimeout(() => setIsEvaluatingCron(false), 800);
  };

  // Filter Tasks
  const filteredTasks = tasks.filter((t) => {
    if (statusFilter !== 'all' && t.status !== statusFilter) return false;
    if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        t.title.toLowerCase().includes(q) ||
        (t.description && t.description.toLowerCase().includes(q)) ||
        t.tags.some((tag) => tag.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const getPriorityBadgeClass = (priority: Task['priority']) => {
    switch (priority) {
      case 'critical':
        return 'bg-rose-950/80 text-rose-300 border-rose-500/40 shadow-[0_0_8px_rgba(244,63,94,0.2)]';
      case 'high':
        return 'bg-amber-950/80 text-amber-300 border-amber-500/40';
      case 'medium':
        return 'bg-cyan-950/80 text-cyan-300 border-cyan-500/40';
      case 'low':
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="space-y-4 p-3 lg:p-4">
      {/* Top Banner with Natural Language Task Parser */}
      <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-3.5 backdrop-blur-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 mb-3">
          <div>
            <div className="flex items-center space-x-2">
              <CalendarIcon className="h-4 w-4 text-cyan-400" />
              <h2 className="font-tech text-sm font-bold tracking-wider text-white uppercase">
                Task & Schedule Engine
              </h2>
            </div>
            <p className="text-[10px] text-slate-500 font-mono mt-0.5">
              Automated NLP String Parsing &bull; Node-Cron Evaluator &bull; Multi-Channel Synchronization
            </p>
          </div>

          <div className="flex items-center space-x-1.5">
            <button
              onClick={handleTriggerCron}
              disabled={isEvaluatingCron}
              className="flex items-center space-x-1.5 rounded border border-slate-800 bg-slate-900 px-2.5 py-1 text-[10px] font-mono text-cyan-300 hover:bg-slate-800 transition-colors"
              title="Force node-cron evaluation for overdue & upcoming reminders"
            >
              <RefreshCw className={`h-3 w-3 ${isEvaluatingCron ? 'animate-spin' : ''}`} />
              <span>Evaluate Cron (30s)</span>
            </button>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center space-x-1 rounded bg-cyan-600 px-3 py-1 text-[10px] font-mono font-bold text-white uppercase shadow-[0_0_10px_rgba(6,182,212,0.4)] hover:bg-cyan-500 transition-colors"
            >
              <Plus className="h-3 w-3" />
              <span>New Task</span>
            </button>
          </div>
        </div>

        {/* NLP Natural Language Input Bar */}
        <form onSubmit={handleNlpTaskSubmit} className="relative">
          <div className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-950 p-1.5 focus-within:border-cyan-500 transition-all">
            <div className="flex h-7 w-7 items-center justify-center rounded bg-slate-900 text-cyan-400">
              <Sparkles className="h-3.5 w-3.5" />
            </div>
            <input
              type="text"
              value={naturalLanguageInput}
              onChange={(e) => setNaturalLanguageInput(e.target.value)}
              placeholder='Auto-parse natural text (e.g. "Remind me to call John tomorrow at 5 PM", "Urgent reactor test Friday 2pm")...'
              disabled={isSubmittingNlp}
              className="flex-1 bg-transparent px-2 py-0.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none font-sans"
            />
            <button
              type="submit"
              disabled={!naturalLanguageInput.trim() || isSubmittingNlp}
              className="flex items-center gap-1 rounded bg-cyan-500/10 border border-cyan-500/30 px-2.5 py-1 text-[10px] font-mono text-cyan-300 hover:bg-cyan-500/20 disabled:opacity-40 transition-colors font-bold uppercase"
            >
              {isSubmittingNlp ? 'PARSING...' : 'PARSE & SCHEDULE'}
              <ArrowUpRight className="h-3 w-3" />
            </button>
          </div>
        </form>
      </div>

      {/* Control Bar: Filters, Search, Views */}
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        {/* Search */}
        <div className="flex items-center gap-2 rounded border border-slate-800 bg-slate-900/60 px-2.5 py-1 text-xs w-full sm:w-60">
          <Search className="h-3 w-3 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search scheduled tasks..."
            className="w-full bg-transparent text-xs text-slate-200 placeholder-slate-500 focus:outline-none font-sans"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-1.5">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded border border-slate-800 bg-slate-900 px-2 py-1 text-[10px] font-mono text-slate-300 focus:border-cyan-500 focus:outline-none"
          >
            <option value="all">Status: All</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="rounded border border-slate-800 bg-slate-900 px-2 py-1 text-[10px] font-mono text-slate-300 focus:border-cyan-500 focus:outline-none"
          >
            <option value="all">Priority: All</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          {/* View Mode Toggle */}
          <div className="flex rounded border border-slate-800 bg-slate-900 p-0.5 text-[10px] font-mono">
            <button
              onClick={() => setViewMode('calendar')}
              className={`rounded px-2 py-0.5 transition-all ${
                viewMode === 'calendar' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400'
              }`}
            >
              Grid Matrix
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`rounded px-2 py-0.5 transition-all ${
                viewMode === 'list' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400'
              }`}
            >
              Table View
            </button>
          </div>
        </div>
      </div>

      {/* Main Task List or Calendar Matrix */}
      {viewMode === 'calendar' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredTasks.length === 0 ? (
            <div className="col-span-full py-10 text-center rounded-lg border border-slate-800 bg-slate-900/30">
              <CalendarIcon className="h-6 w-6 text-slate-600 mx-auto mb-1.5" />
              <p className="text-xs font-mono text-slate-400">No scheduled tasks match your filter criteria.</p>
            </div>
          ) : (
            filteredTasks.map((task) => {
              const isOverdue = new Date(task.dueDate).getTime() < Date.now() && task.status !== 'completed';
              const isCompleted = task.status === 'completed';

              return (
                <div
                  key={task.id}
                  className={`group relative rounded-lg border p-3 backdrop-blur-xl transition-all ${
                    isCompleted
                      ? 'border-slate-800 bg-slate-950/60 border-l-2 border-l-emerald-500 opacity-75'
                      : isOverdue
                      ? 'border-slate-800 bg-slate-900/50 border-l-2 border-l-rose-500'
                      : task.priority === 'high' || task.priority === 'critical'
                      ? 'border-slate-800 bg-slate-900/50 border-l-2 border-l-amber-500'
                      : 'border-slate-800 bg-slate-900/50 border-l-2 border-l-cyan-500'
                  }`}
                >
                  {/* Task Card Header */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <button
                      onClick={() => handleToggleStatus(task)}
                      className="mt-0.5 text-slate-400 hover:text-cyan-400 transition-colors"
                      title={isCompleted ? 'Mark Pending' : 'Mark Completed'}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                      ) : (
                        <Circle className="h-4 w-4 hover:text-cyan-400 text-slate-500" />
                      )}
                    </button>

                    <div className="flex-1">
                      <h3
                        className={`text-xs font-semibold leading-snug ${
                          isCompleted ? 'text-slate-500 line-through' : 'text-slate-100'
                        }`}
                      >
                        {task.title}
                      </h3>
                      {task.description && (
                        <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">{task.description}</p>
                      )}
                    </div>

                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 transition-all"
                      title="Delete task"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Due Date & Priority Info */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80 text-[10px] font-mono">
                    <div className="flex items-center gap-1 text-slate-400">
                      <Clock className="h-3 w-3 text-cyan-400" />
                      <span className={isOverdue ? 'text-rose-400 font-bold' : ''}>
                        {new Date(task.dueDate).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <span
                        className={`rounded px-1.5 py-0.2 text-[9px] font-bold uppercase border ${getPriorityBadgeClass(
                          task.priority
                        )}`}
                      >
                        {task.priority}
                      </span>
                      <span className="rounded bg-slate-950 px-1 py-0.2 text-[9px] text-slate-500 border border-slate-800">
                        {task.source.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* Tags */}
                  {task.tags && task.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {task.tags.map((tag, i) => (
                        <span
                          key={i}
                          className="rounded bg-slate-950 px-1 py-0.2 text-[9px] text-slate-400 border border-slate-800 font-mono"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      ) : (
        /* List View */
        <div className="rounded-lg border border-slate-800 bg-slate-900/50 overflow-hidden backdrop-blur-xl">
          <table className="w-full text-left text-xs font-mono">
            <thead className="border-b border-slate-800 bg-slate-950/90 text-slate-400 uppercase text-[10px]">
              <tr>
                <th className="p-2.5">Status</th>
                <th className="p-2.5">Title / Description</th>
                <th className="p-2.5">Due Date</th>
                <th className="p-2.5">Priority</th>
                <th className="p-2.5">Source</th>
                <th className="p-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {filteredTasks.map((t) => (
                <tr key={t.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="p-2.5">
                    <button onClick={() => handleToggleStatus(t)}>
                      {t.status === 'completed' ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                      ) : (
                        <Circle className="h-3.5 w-3.5 text-slate-500 hover:text-cyan-400" />
                      )}
                    </button>
                  </td>
                  <td className="p-2.5 font-sans">
                    <div className={t.status === 'completed' ? 'line-through text-slate-500 text-xs' : 'text-slate-200 text-xs'}>
                      {t.title}
                    </div>
                    {t.description && <div className="text-[10px] text-slate-400">{t.description}</div>}
                  </td>
                  <td className="p-2.5 text-slate-300 text-[11px]">
                    {new Date(t.dueDate).toLocaleString()}
                  </td>
                  <td className="p-2.5">
                    <span className={`rounded px-1.5 py-0.2 text-[9px] border ${getPriorityBadgeClass(t.priority)}`}>
                      {t.priority.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-2.5 text-slate-400 text-[10px]">{t.source.toUpperCase()}</td>
                  <td className="p-2.5 text-right">
                    <button
                      onClick={() => handleDeleteTask(t.id)}
                      className="text-slate-500 hover:text-rose-400 p-1"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Manual Task Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-lg border border-slate-800 bg-slate-900 p-5 shadow-2xl">
            <h3 className="font-tech text-sm font-bold text-slate-100 mb-3 flex items-center gap-2 uppercase">
              <Plus className="h-3.5 w-3.5 text-cyan-400" />
              Create Scheduled Directive
            </h3>
            <form onSubmit={handleManualTaskSubmit} className="space-y-3 text-xs font-mono">
              <div>
                <label className="block text-slate-400 mb-1 text-[10px]">TASK TITLE *</label>
                <input
                  type="text"
                  required
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="e.g. Flight test authorization"
                  className="w-full rounded border border-slate-700 bg-slate-950 p-2 text-slate-100 focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 text-[10px]">DESCRIPTION</label>
                <textarea
                  value={newTaskDesc}
                  onChange={(e) => setNewTaskDesc(e.target.value)}
                  placeholder="Additional context or notes..."
                  rows={2}
                  className="w-full rounded border border-slate-700 bg-slate-950 p-2 text-slate-100 focus:border-cyan-500 focus:outline-none font-sans"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-slate-400 mb-1 text-[10px]">DUE DATE & TIME</label>
                  <input
                    type="datetime-local"
                    value={newTaskDueDate}
                    onChange={(e) => setNewTaskDueDate(e.target.value)}
                    className="w-full rounded border border-slate-700 bg-slate-950 p-1.5 text-slate-100 focus:border-cyan-500 focus:outline-none text-[11px]"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 text-[10px]">PRIORITY</label>
                  <select
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value as any)}
                    className="w-full rounded border border-slate-700 bg-slate-950 p-1.5 text-slate-100 focus:border-cyan-500 focus:outline-none text-[11px]"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 text-[10px]">TAGS (COMMA SEPARATED)</label>
                <input
                  type="text"
                  value={newTaskTags}
                  onChange={(e) => setNewTaskTags(e.target.value)}
                  placeholder="Engineering, Priority, Satellite"
                  className="w-full rounded border border-slate-700 bg-slate-950 p-2 text-slate-100 focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2.5 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="rounded border border-slate-700 px-3 py-1 text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded bg-cyan-600 px-3.5 py-1 font-bold text-white uppercase hover:bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.4)]"
                >
                  Schedule Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
