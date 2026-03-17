import {
  Bot,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import Header from '../components/layout/Header';
import { agents, approvalTasks } from '../data/mockData';

const metrics = [
  {
    title: 'Active Agents',
    value: agents.filter((a) => a.status === 'active').length,
    total: agents.length,
    icon: Bot,
    color: 'from-indigo-400 to-indigo',
  },
  {
    title: 'Tasks Today',
    value: '247',
    change: 12.5,
    icon: Activity,
    color: 'from-emerald-400 to-emerald-600',
  },
  {
    title: 'Pending Approvals',
    value: approvalTasks.filter((t) => t.status === 'pending').length,
    urgent: approvalTasks.filter((t) => t.priority === 'critical' || t.priority === 'high').length,
    icon: Clock,
    color: 'from-amber-400 to-amber-600',
  },
  {
    title: 'Monthly Cost',
    value: '$1,003.80',
    change: -8.3,
    icon: DollarSign,
    color: 'from-cyan-400 to-cyan-600',
  },
];

const recentActivity = [
  {
    agent: 'Data Analyst Pro',
    action: 'Completed quarterly sales report',
    time: '2 min ago',
    status: 'success',
  },
  {
    agent: 'Customer Support Agent',
    action: 'Resolved 15 support tickets',
    time: '5 min ago',
    status: 'success',
  },
  {
    agent: 'Financial Reconciliation Bot',
    action: 'Connection timeout error',
    time: '1 hour ago',
    status: 'error',
  },
  {
    agent: 'Code Review Assistant',
    action: 'Reviewed PR #482, #483',
    time: '2 hours ago',
    status: 'success',
  },
  {
    agent: 'Customer Support Agent',
    action: 'Escalated high-priority ticket',
    time: '3 hours ago',
    status: 'pending',
  },
];

export default function Dashboard() {
  return (
    <div className="min-h-screen">
      <Header title="Dashboard" subtitle="Runtime Platform Overview" />

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map((metric) => (
            <div
              key={metric.title}
              className="bg-dark-50 rounded-2xl p-5 border border-white/5 hover:border-indigo/30 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-1">{metric.title}</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-semibold text-white">
                      {metric.value}
                    </span>
                    {'total' in metric && (
                      <span className="text-sm text-gray-500">/ {metric.total}</span>
                    )}
                  </div>
                  {'change' in metric && metric.change !== undefined && (
                    <div
                      className={`flex items-center gap-1 mt-2 text-sm ${
                        metric.change > 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {metric.change > 0 ? (
                        <ArrowUpRight className="w-4 h-4" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4" />
                      )}
                      <span>{Math.abs(metric.change)}%</span>
                      <span className="text-gray-500">vs last month</span>
                    </div>
                  )}
                  {'urgent' in metric && metric.urgent > 0 && (
                    <p className="text-sm text-amber-400 mt-2">
                      {metric.urgent} high priority
                    </p>
                  )}
                </div>
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${metric.color} flex items-center justify-center`}
                >
                  <metric.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-dark-50 rounded-2xl border border-white/5">
            <div className="p-5 border-b border-white/5">
              <h2 className="text-lg font-semibold text-white">Agent Performance</h2>
            </div>
            <div className="p-5">
              <div className="space-y-4">
                {agents
                  .filter((a) => a.status === 'active')
                  .slice(0, 4)
                  .map((agent) => (
                    <div
                      key={agent.id}
                      className="flex items-center gap-4 p-4 rounded-xl bg-black/60 hover:bg-black/60 transition-colors"
                    >
                      <img
                        src={agent.avatar}
                        alt={agent.name}
                        className="w-12 h-12 rounded-xl object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-white truncate">
                            {agent.name}
                          </h3>
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              agent.source === 'marketplace'
                                ? 'bg-indigo/20 text-indigo-300'
                                : 'bg-emerald-500/20 text-emerald-300'
                            }`}
                          >
                            {agent.source === 'marketplace' ? 'Hired' : 'IDE Build'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500">{agent.category}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold text-white">
                          {agent.tasksCompleted.toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-500">tasks</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold text-emerald-400">
                          {agent.successRate}%
                        </p>
                        <p className="text-sm text-gray-500">success</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold text-white">
                          {agent.source === 'marketplace' 
                            ? `${(agent.costThisMonth * 5).toFixed(0)}`
                            : `${(agent.costThisMonth * 1000).toFixed(0)}K`
                          }
                        </p>
                        <p className="text-sm text-gray-500">
                          {agent.source === 'marketplace' ? 'credits' : 'tokens'}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          <div className="bg-dark-50 rounded-2xl border border-white/5">
            <div className="p-5 border-b border-white/5">
              <h2 className="text-lg font-semibold text-white">Recent Activity</h2>
            </div>
            <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
              {recentActivity.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 rounded-xl hover:bg-black/60 transition-colors"
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      activity.status === 'success'
                        ? 'bg-emerald-500/20'
                        : activity.status === 'error'
                        ? 'bg-rose-500/20'
                        : 'bg-amber-500/20'
                    }`}
                  >
                    {activity.status === 'success' ? (
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                    ) : activity.status === 'error' ? (
                      <AlertCircle className="w-4 h-4 text-rose-400" />
                    ) : (
                      <Clock className="w-4 h-4 text-amber-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {activity.agent}
                    </p>
                    <p className="text-sm text-gray-500 truncate">{activity.action}</p>
                  </div>
                  <span className="text-xs text-gray-500 flex-shrink-0">
                    {activity.time}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-dark-50 rounded-2xl border border-white/5">
            <div className="p-5 border-b border-white/5 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">System Health</h2>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-400">
                Operational
              </span>
            </div>
            <div className="p-5 space-y-4">
              {[
                { name: 'API Response Time', value: 45, unit: 'ms', status: 'good' },
                { name: 'Agent Availability', value: 99.8, unit: '%', status: 'good' },
                { name: 'Task Queue', value: 12, unit: 'pending', status: 'normal' },
                { name: 'Memory Usage', value: 67, unit: '%', status: 'normal' },
              ].map((item) => (
                <div key={item.name} className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-400">{item.name}</span>
                      <span className="text-sm font-medium text-white">
                        {item.value}
                        {item.unit}
                      </span>
                    </div>
                    <div className="h-1.5 bg-black/60 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          item.status === 'good'
                            ? 'bg-emerald-500'
                            : item.status === 'normal'
                            ? 'bg-indigo'
                            : 'bg-amber-500'
                        }`}
                        style={{ width: `${Math.min(item.value, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-dark-50 rounded-2xl border border-white/5">
            <div className="p-5 border-b border-white/5 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Quick Actions</h2>
            </div>
            <div className="p-5 grid grid-cols-2 gap-3">
              {[
                { label: 'Review Approvals', icon: ClipboardCheck, count: 4 },
                { label: 'Configure Agent', icon: Settings, count: 1 },
                { label: 'View Traces', icon: TrendingUp },
                { label: 'Add Connector', icon: Plug },
              ].map((action) => (
                <button
                  key={action.label}
                  className="flex items-center gap-3 p-4 rounded-xl bg-black/60 hover:bg-indigo/20 border border-transparent hover:border-indigo/30 transition-all text-left group"
                >
                  <action.icon className="w-5 h-5 text-gray-400 group-hover:text-indigo-300" />
                  <span className="text-sm font-medium text-white">{action.label}</span>
                  {'count' in action && (
                    <span className="ml-auto px-2 py-0.5 rounded-full text-xs font-medium bg-indigo text-white">
                      {action.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const ClipboardCheck = CheckCircle;
const Settings = TrendingUp;
const Plug = Activity;
