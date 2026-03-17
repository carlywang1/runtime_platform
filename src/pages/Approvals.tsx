import { useState } from 'react';
import {
  Check,
  X,
  ChevronRight,
  FileText,
  Mail,
  ArrowRightLeft,
} from 'lucide-react';
import Header from '../components/layout/Header';
import { approvalTasks } from '../data/mockData';

const priorityConfig = {
  high: { label: 'HIGH', color: 'text-rose-400', cardBg: 'bg-rose-500/[0.06]', cardBorder: 'border-l-rose-500/40', hoverBg: 'hover:bg-rose-500/[0.1]', selectedBg: 'bg-rose-500/[0.12]', iconBg: 'bg-rose-500/10', iconColor: 'text-rose-400', summaryBg: 'bg-rose-500/[0.06]', summaryBorder: 'border-rose-500/10' },
  medium: { label: 'MEDIUM', color: 'text-amber-400', cardBg: 'bg-amber-500/[0.06]', cardBorder: 'border-l-amber-500/40', hoverBg: 'hover:bg-amber-500/[0.1]', selectedBg: 'bg-amber-500/[0.12]', iconBg: 'bg-amber-500/10', iconColor: 'text-amber-400', summaryBg: 'bg-amber-500/[0.06]', summaryBorder: 'border-amber-500/10' },
  low: { label: 'LOW', color: 'text-gray-400', cardBg: 'bg-white/[0.03]', cardBorder: 'border-l-gray-500/30', hoverBg: 'hover:bg-white/[0.06]', selectedBg: 'bg-white/[0.08]', iconBg: 'bg-white/5', iconColor: 'text-gray-400', summaryBg: 'bg-white/[0.03]', summaryBorder: 'border-white/5' },
};

const actionTypeConfig = {
  quote: { label: 'QUOTE', color: 'text-rose-400', icon: FileText },
  email: { label: 'EMAIL', color: 'text-amber-400', icon: Mail },
  stage_change: { label: 'STAGE CHANGE', color: 'text-amber-400', icon: ArrowRightLeft },
};

export default function Approvals() {
  const [selectedTask, setSelectedTask] = useState<string | null>(null);

  const groupedTasks = {
    high: approvalTasks.filter((t) => t.priority === 'high' && t.status === 'pending'),
    medium: approvalTasks.filter((t) => t.priority === 'medium' && t.status === 'pending'),
    low: approvalTasks.filter((t) => t.priority === 'low' && t.status === 'pending'),
  };

  const selectedTaskData = approvalTasks.find((t) => t.id === selectedTask);
  const totalPending = groupedTasks.high.length + groupedTasks.medium.length + groupedTasks.low.length;

  const handleTaskClick = (taskId: string) => {
    setSelectedTask(selectedTask === taskId ? null : taskId);
  };

  return (
    <div className="min-h-screen flex">
      <div className="flex-1 border-r border-white/5">
        <Header title="Pending Approvals" subtitle="" />

        <div className="p-6 pb-0">
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white/[0.03] rounded-xl p-4 border border-white/5">
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Pending Approvals</div>
              <div className="text-3xl font-semibold text-white">{totalPending}</div>
            </div>
            <div className={`${priorityConfig.high.summaryBg} rounded-xl p-4 border ${priorityConfig.high.summaryBorder}`}>
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">High Priority</div>
              <div className={`text-3xl font-semibold ${priorityConfig.high.color}`}>{groupedTasks.high.length}</div>
            </div>
            <div className={`${priorityConfig.medium.summaryBg} rounded-xl p-4 border ${priorityConfig.medium.summaryBorder}`}>
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Medium Priority</div>
              <div className={`text-3xl font-semibold ${priorityConfig.medium.color}`}>{groupedTasks.medium.length}</div>
            </div>
          </div>
        </div>

        <div className="p-6 pt-0 space-y-6">
          {(['high', 'medium', 'low'] as const).map((level) => {
            const tasks = groupedTasks[level];
            const config = priorityConfig[level];
            if (tasks.length === 0) return null;
            return (
              <div key={level}>
                <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">{config.label}</h3>
                <div className="space-y-2">
                  {tasks.map((task) => {
                    const actionType = actionTypeConfig[task.actionType as keyof typeof actionTypeConfig];
                    const Icon = actionType.icon;
                    const isSelected = selectedTask === task.id;
                    return (
                      <button
                        key={task.id}
                        onClick={() => handleTaskClick(task.id)}
                        className={`w-full flex items-center gap-3 p-4 rounded-xl border-l-2 transition-colors text-left ${
                          isSelected
                            ? `${config.selectedBg} ${config.cardBorder}`
                            : `${config.cardBg} ${config.cardBorder} ${config.hoverBg}`
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-lg ${config.iconBg} flex items-center justify-center flex-shrink-0`}>
                          <Icon className={`w-5 h-5 ${config.iconColor}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-[10px] font-semibold ${actionType.color}`}>{actionType.label}</span>
                          </div>
                          <p className="text-sm font-medium text-white truncate">{task.taskDescription}</p>
                          <p className="text-xs text-gray-500">from {task.agentName}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-600 flex-shrink-0" />
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {selectedTaskData && (
        <div className="w-[600px] bg-dark-50 border-l border-white/5">
          <div className="p-6 border-b border-white/5">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-[10px] font-semibold ${actionTypeConfig[selectedTaskData.actionType as keyof typeof actionTypeConfig].color}`}>
                    {actionTypeConfig[selectedTaskData.actionType as keyof typeof actionTypeConfig].label}
                  </span>
                </div>
                <h2 className="text-lg font-semibold text-white mb-1">{selectedTaskData.taskDescription}</h2>
                <p className="text-sm text-gray-500">from {selectedTaskData.agentName}</p>
              </div>
              <button onClick={() => setSelectedTask(null)} className="p-2 rounded-lg hover:bg-white/5 transition-colors flex-shrink-0">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <p className="text-sm text-gray-400 leading-relaxed">{selectedTaskData.context}</p>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-500">Plan</span>
                <span className="text-sm text-white">Enterprise</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-500">Amount</span>
                <span className="text-sm text-white">$52,000/year</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-500">Client</span>
                <span className="text-sm text-white">TechVentures Inc</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-500">Discount</span>
                <span className="text-sm text-white">15% volume discount</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-500">Valid Until</span>
                <span className="text-sm text-white">2026-03-17</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-500">Payment Terms</span>
                <span className="text-sm text-white">Net 45</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-500">Decision Maker</span>
                <span className="text-sm text-white">Sarah Chen, VP Operations</span>
              </div>
            </div>
          </div>

          <div className="p-6 border-t border-white/5 flex gap-3">
            <button className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 transition-colors">
              <Check className="w-5 h-5" />
              <span className="font-medium">Approve</span>
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white transition-colors">
              <X className="w-5 h-5" />
              <span className="font-medium">Reject</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
