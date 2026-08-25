'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/dashboard-layout';
import { AuthGuard } from '../../components/auth-guard';
import { useAuth } from '../../lib/auth/auth-context';
import { Task, TaskPriority, TaskStatus, UserProfile, Client } from '../../lib/types';
import {
  CheckSquare,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Building2,
  User,
  Shield,
  Trash2,
  RefreshCw,
  Sparkles,
  ChevronRight,
  Filter,
  Check
} from 'lucide-react';

const DEFAULT_TASKS: Task[] = [
  {
    id: 'tsk_01',
    title: 'Design & Launch 3 Eye Care Visual Ads for Jeevansphere',
    description: 'Create 3 high-converting creative visuals and marketing copy for Jeevansphere clinic targeting eye care consultations. Please review brand tone and launch approval.',
    priority: 'URGENT',
    status: 'TODO',
    assignedToId: 'usr_harshit',
    assignedToName: 'Harshit Singh',
    assignedToEmail: 'harshitsingh19622@gmail.com',
    assignedById: 'usr_aman',
    assignedByName: 'Aman Sir',
    clientId: 'cli_jeevansphere_default',
    clientName: 'Jeevansphere',
    dueDate: '2026-08-30',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'tsk_02',
    title: 'Setup & Verify Live Deployment Link & Google Ads Tracking',
    description: 'Link the GitHub code repository and live deployment URL for Jeevansphere in the Client Business Hub.',
    priority: 'HIGH',
    status: 'TODO',
    assignedToId: 'usr_harshit',
    assignedToName: 'Harshit Singh',
    assignedToEmail: 'harshitsingh19622@gmail.com',
    assignedById: 'usr_aman',
    assignedByName: 'Aman Sir',
    clientId: 'cli_jeevansphere_default',
    clientName: 'Jeevansphere',
    dueDate: '2026-09-02',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export default function TasksPage() {
  const { profile, role, user: authUser } = useAuth();
  const [tasks, setTasks] = useState<Task[]>(DEFAULT_TASKS);
  const [teamUsers, setTeamUsers] = useState<UserProfile[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Tab & Filter state
  const [activeTab, setActiveTab] = useState<'my' | 'team'>('my');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // New Task Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM' as TaskPriority,
    assignedToEmail: '',
    clientId: '',
    dueDate: '',
  });

  const isSuperOrManager = role === 'ADMIN' || role === 'MANAGER' || profile?.email === 'aman@codekap.com';

  const fetchTasks = async () => {
    try {
      const effectiveUserId = profile?.uid || authUser?.uid || 'usr_aman';
      const headers = { 'X-User-Id': effectiveUserId };

      const url = isSuperOrManager && activeTab === 'team'
        ? '/api/tasks?all=true'
        : `/api/tasks?userId=${encodeURIComponent(effectiveUserId)}`;

      const [taskRes, userRes, clientRes] = await Promise.all([
        fetch(url, { headers }),
        fetch('/api/admin/users', { headers }),
        fetch('/api/clients', { headers }),
      ]);

      if (taskRes.ok) {
        const data = await taskRes.json();
        if (Array.isArray(data) && data.length > 0) {
          setTasks(data);
        }
      }
      if (userRes.ok) {
        const uData = await userRes.json();
        if (Array.isArray(uData) && uData.length > 0) {
          setTeamUsers(uData);
        }
      }
      if (clientRes.ok) {
        const cData = await clientRes.json();
        if (Array.isArray(cData) && cData.length > 0) {
          setClients(cData);
        }
      }
    } catch (err: any) {
      console.warn('Tasks note: Using fallback baseline', err);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [activeTab, profile]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title.trim() || !newTask.assignedToEmail) return;

    setSubmitting(true);
    setError('');
    setSuccessMessage('');

    try {
      const selectedUser = teamUsers.find(u => u.email === newTask.assignedToEmail);
      const selectedClient = clients.find(c => c.id === newTask.clientId);
      const effectiveUserId = profile?.uid || authUser?.uid || 'usr_aman';

      const payload = {
        title: newTask.title.trim(),
        description: newTask.description.trim(),
        priority: newTask.priority,
        assignedToId: selectedUser?.uid || newTask.assignedToEmail,
        assignedToName: selectedUser?.name || newTask.assignedToEmail.split('@')[0],
        assignedToEmail: newTask.assignedToEmail,
        clientId: selectedClient?.id || undefined,
        clientName: selectedClient?.name || undefined,
        dueDate: newTask.dueDate || undefined,
      };

      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': effectiveUserId,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccessMessage(`Task assigned successfully to ${payload.assignedToName}!`);
        setIsModalOpen(false);
        setNewTask({
          title: '',
          description: '',
          priority: 'MEDIUM',
          assignedToEmail: '',
          clientId: '',
          dueDate: '',
        });
        fetchTasks();
      } else {
        setError(data.error || 'Failed to create task.');
      }
    } catch (err: any) {
      setError(err.message || 'Error creating task.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    try {
      const effectiveUserId = profile?.uid || authUser?.uid || 'usr_aman';
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': effectiveUserId,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        setTasks(prev =>
          prev.map(t => (t.id === taskId ? { ...t, status: newStatus } : t))
        );
      }
    } catch (err) {
      console.error('Error updating task status:', err);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    try {
      const effectiveUserId = profile?.uid || authUser?.uid || 'usr_aman';
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
        headers: { 'X-User-Id': effectiveUserId },
      });

      if (res.ok) {
        setTasks(prev => prev.filter(t => t.id !== taskId));
      }
    } catch (err) {
      console.error('Error deleting task:', err);
    }
  };

  const filteredTasks = tasks.filter(t => {
    if (statusFilter === 'ALL') return true;
    return t.status === statusFilter;
  });

  const getPriorityBadge = (priority: TaskPriority) => {
    switch (priority) {
      case 'URGENT':
        return <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 text-[10px] font-bold">URGENT</span>;
      case 'HIGH':
        return <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-bold">HIGH</span>;
      case 'MEDIUM':
        return <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px] font-bold">MEDIUM</span>;
      case 'LOW':
        return <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-bold">LOW</span>;
      default:
        return null;
    }
  };

  return (
    <AuthGuard>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-blue-600 mb-1">
                <CheckSquare className="w-4 h-4" />
                <span>Team Task Delegation & Workflows</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
                Team Tasks & Deliverables
              </h1>
              <p className="text-sm text-slate-500 font-medium mt-1">
                Assign tasks to specific team members, track execution milestones, and monitor marketing deliverables.
              </p>
            </div>

            <div className="flex items-center gap-3">
              {isSuperOrManager && (
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/20 flex items-center gap-2 transition-all hover:scale-[1.01]"
                >
                  <Plus className="w-4 h-4" />
                  <span>Assign Task to Member</span>
                </button>
              )}
            </div>
          </div>

          {/* Feedback messages */}
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}
          {successMessage && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Top Control Tabs & Filters */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('my')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'my'
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                My Assigned Tasks ({tasks.filter(t => t.assignedToEmail === profile?.email || t.assignedToId === profile?.uid).length})
              </button>

              {isSuperOrManager && (
                <button
                  onClick={() => setActiveTab('team')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    activeTab === 'team'
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  All Team Tasks (Super Admin View)
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" /> Filter:
              </span>
              {(['ALL', 'TODO', 'IN_PROGRESS', 'COMPLETED'] as const).map(st => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    statusFilter === st
                      ? 'bg-slate-900 text-white font-bold'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {st === 'ALL' ? 'All' : st === 'TODO' ? 'To Do' : st === 'IN_PROGRESS' ? 'In Progress' : 'Completed'}
                </button>
              ))}
            </div>
          </div>

          {/* Task List Table / Grid */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            {loading ? (
              <div className="p-12 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
                <span>Loading assigned tasks...</span>
              </div>
            ) : filteredTasks.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                  <CheckSquare className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">
                  {statusFilter !== 'ALL' ? `No ${statusFilter.toLowerCase().replace('_', ' ')} tasks found` : 'No tasks assigned yet'}
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  {isSuperOrManager
                    ? 'As Super Admin, you can assign marketing tasks, creative reviews, or campaign optimization duties to team members.'
                    : 'You do not have any pending tasks right now. Great job!'}
                </p>
                {isSuperOrManager && (
                  <div className="pt-2">
                    <button
                      onClick={() => setIsModalOpen(true)}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/20"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Assign First Task</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {filteredTasks.map(task => {
                  const isCompleted = task.status === 'COMPLETED';
                  const isInProgress = task.status === 'IN_PROGRESS';

                  return (
                    <div
                      key={task.id}
                      className={`p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors hover:bg-slate-50/70 ${
                        isCompleted ? 'bg-slate-50/40 opacity-80' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3.5 flex-1 min-w-0">
                        {/* Quick Checkbox Status Toggle */}
                        <button
                          onClick={() =>
                            handleStatusChange(task.id, isCompleted ? 'TODO' : 'COMPLETED')
                          }
                          className={`w-5 h-5 rounded-lg border flex items-center justify-center mt-0.5 transition-all ${
                            isCompleted
                              ? 'bg-emerald-600 border-emerald-600 text-white'
                              : isInProgress
                              ? 'border-blue-500 bg-blue-50 text-blue-600'
                              : 'border-slate-300 hover:border-blue-600 text-transparent'
                          }`}
                          title={isCompleted ? 'Mark as Incomplete' : 'Mark as Completed'}
                        >
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </button>

                        <div className="space-y-1.5 flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3
                              className={`text-sm font-bold text-slate-900 ${
                                isCompleted ? 'line-through text-slate-400' : ''
                              }`}
                            >
                              {task.title}
                            </h3>
                            {getPriorityBadge(task.priority)}
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                isCompleted
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : isInProgress
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {task.status.replace('_', ' ')}
                            </span>
                          </div>

                          {task.description && (
                            <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
                              {task.description}
                            </p>
                          )}

                          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                            <div className="flex items-center gap-1.5 font-medium text-slate-700">
                              <User className="w-3.5 h-3.5 text-blue-600" />
                              <span>Assigned to: <strong>{task.assignedToName}</strong> ({task.assignedToEmail})</span>
                            </div>

                            {task.clientName && (
                              <div className="flex items-center gap-1.5 text-slate-600">
                                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                                <span>Client: <strong>{task.clientName}</strong></span>
                              </div>
                            )}

                            {task.dueDate && (
                              <div className="flex items-center gap-1.5 text-slate-600">
                                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                <span>Due: <strong>{task.dueDate}</strong></span>
                              </div>
                            )}

                            <span className="text-[11px] text-slate-400">
                              By {task.assignedByName} • {new Date(task.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Action Status Menu */}
                      <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                        <select
                          value={task.status}
                          onChange={(e) => handleStatusChange(task.id, e.target.value as TaskStatus)}
                          className="text-xs font-semibold p-2 rounded-xl border border-slate-200 bg-white text-slate-700 focus:ring-2 focus:ring-blue-600"
                        >
                          <option value="TODO">To Do</option>
                          <option value="IN_PROGRESS">In Progress</option>
                          <option value="COMPLETED">Completed</option>
                          <option value="CANCELLED">Cancelled</option>
                        </select>

                        {isSuperOrManager && (
                          <button
                            onClick={() => handleDeleteTask(task.id)}
                            className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Delete Task"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Modal: Assign Task to Member */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 md:p-8 border border-slate-200 shadow-2xl space-y-5 my-8">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <CheckSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-base font-extrabold text-slate-900">Assign Task to Team Member</h2>
                    <p className="text-xs text-slate-500">Task will immediately appear on the member's dashboard</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateTask} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Assign To Team Member *
                  </label>
                  <select
                    required
                    value={newTask.assignedToEmail}
                    onChange={(e) => setNewTask({ ...newTask, assignedToEmail: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 font-medium focus:ring-2 focus:ring-blue-600 text-slate-900"
                  >
                    <option value="">-- Select Member --</option>
                    {teamUsers.map(u => (
                      <option key={u.uid} value={u.email}>
                        {u.name} ({u.email}) - [{u.role}]
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Task Title / Objective *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Design 3 Ad Creatives for G1 Sphere Dental Campaign"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-600 text-slate-900"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Task Instructions & Details
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Describe deliverables, required copywriting style, target patient demographics, or ad budget guidance..."
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-600 text-slate-900"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Priority</label>
                    <select
                      value={newTask.priority}
                      onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as TaskPriority })}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 font-semibold focus:ring-2 focus:ring-blue-600 text-slate-900"
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                      <option value="URGENT">Urgent ⚡</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Due Date (Optional)</label>
                    <input
                      type="date"
                      value={newTask.dueDate}
                      onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-600 text-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Associated Client Business (Optional)
                  </label>
                  <select
                    value={newTask.clientId}
                    onChange={(e) => setNewTask({ ...newTask, clientId: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-600 text-slate-900"
                  >
                    <option value="">-- No Specific Client (General Task) --</option>
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.industry})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl text-[11px] text-blue-800 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>An email alert will also be dispatched directly to the team member's inbox.</span>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || !newTask.title.trim() || !newTask.assignedToEmail}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/20 flex items-center gap-2 disabled:opacity-60"
                  >
                    {submitting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Assigning...</span>
                      </>
                    ) : (
                      <>
                        <CheckSquare className="w-4 h-4" />
                        <span>Assign Task</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </DashboardLayout>
    </AuthGuard>
  );
}
