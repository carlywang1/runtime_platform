import { useState } from 'react';
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Bot,
  Search,
  ChevronRight,
  RefreshCw,
  X,
} from 'lucide-react';
import Header from '../components/layout/Header';
import CustomSelect from '../components/CustomSelect';

type ActivityType = 'task_completed' | 'task_failed' | 'approval_processed' | 'config_changed' | 'agent_status' | 'system';

interface ActivityEntry {
  id: string;
  type: ActivityType;
  agent?: string;
  title: string;
  description: string;
  timestamp: string;
  details?: Record<string, string | number>;
}

const activityData: ActivityEntry[] = [
  {
    id: '1',
    type: 'task_completed',
    agent: 'Data Analyst Pro',
    title: 'Q4 Sales Report Generated',
    description: 'Successfully generated quarterly sales report with 12,847 transactions analyzed',
    timestamp: '2 minutes ago',
    details: { 
      reportId: 'RPT-2026-Q4-001',
      period: '2026 Q4',
      totalRevenue: '$2,847,392',
      transactionsAnalyzed: '12,847',
      topCategory: 'Electronics',
      avgOrderValue: '$221.50',
      duration: '3.2s'
    },
  },
  {
    id: '2',
    type: 'approval_processed',
    agent: 'Customer Support Agent',
    title: 'Refund Approved',
    description: 'Order #12847 refund of $299.99 processed and customer notified',
    timestamp: '5 minutes ago',
    details: { 
      orderId: 'ORD-12847',
      customerId: 'CUST-8392',
      customerName: 'Sarah Johnson',
      refundAmount: '$299.99',
      reason: 'Damaged Product',
      processedBy: 'Customer Support Agent',
      notificationSent: 'Yes'
    },
  },
  {
    id: '3',
    type: 'task_failed',
    agent: 'Financial Reconciliation Bot',
    title: 'Bank Sync Failed',
    description: 'Connection timeout while syncing with banking API',
    timestamp: '12 minutes ago',
    details: { 
      errorCode: 'TIMEOUT',
      bankAccount: 'ACC-****-4521',
      lastSuccessfulSync: '2026-03-17 08:30',
      attempts: '3',
      nextRetry: '2026-03-17 10:00'
    },
  },
  {
    id: '4',
    type: 'task_completed',
    agent: 'Code Review Assistant',
    title: 'PR #483 Merged',
    description: 'Auto-merged feature/user-auth branch to main after approval',
    timestamp: '18 minutes ago',
    details: { 
      pullRequestId: 'PR-483',
      branch: 'feature/user-auth',
      targetBranch: 'main',
      commits: '12',
      filesChanged: '24',
      linesAdded: '847',
      linesRemoved: '234',
      mergedBy: 'Code Review Assistant'
    },
  },
  {
    id: '5',
    type: 'agent_status',
    agent: 'Customer Support Agent',
    title: 'CRM Lookup Disabled',
    description: 'Temporarily disabled Salesforce CRM lookup for non-critical tickets',
    timestamp: '25 minutes ago',
    details: {
      configId: 'CFG-CRM-001',
      service: 'Salesforce CRM',
      status: 'Disabled',
      scope: 'Non-critical tickets',
      disabledBy: 'System Admin',
      reason: 'Performance optimization'
    },
  },
  {
    id: '6',
    type: 'task_completed',
    agent: 'Customer Support Agent',
    title: 'Batch Tickets Processed',
    description: '47 support tickets resolved in automated batch processing',
    timestamp: '32 minutes ago',
    details: { 
      batchId: 'BATCH-2026-0317-001',
      ticketsProcessed: '47',
      ticketsResolved: '44',
      ticketsEscalated: '3',
      avgResolutionTime: '4.2 min',
      customerSatisfaction: '94%'
    },
  },
  {
    id: '7',
    type: 'config_changed',
    title: 'Approval Policy Updated',
    description: 'Financial transaction threshold changed from $50 to $100',
    timestamp: '1 hour ago',
    details: { 
      policyId: 'POL-FIN-001',
      policyName: 'Financial Transactions',
      field: 'Approval Threshold',
      oldValue: '$50',
      newValue: '$100',
      updatedBy: 'Finance Manager',
      effectiveDate: '2026-03-17'
    },
  },
  {
    id: '8',
    type: 'task_completed',
    agent: 'Data Analyst Pro',
    title: 'Customer Segmentation Complete',
    description: 'Identified 5 new customer segments from purchase behavior analysis',
    timestamp: '1 hour ago',
    details: { 
      analysisId: 'SEG-2026-03-001',
      customersAnalyzed: '15,420',
      segmentsIdentified: '5',
      topSegment: 'High-Value Repeat',
      segmentSize: '2,847',
      avgLifetimeValue: '$4,521',
      confidenceScore: '92%'
    },
  },
  {
    id: '9',
    type: 'system',
    title: 'Daily Backup Completed',
    description: 'System configuration and agent states backed up successfully',
    timestamp: '2 hours ago',
    details: {
      backupId: 'BKP-2026-0317-001',
      backupSize: '2.4 GB',
      filesBackedUp: '8,492',
      duration: '12m 34s',
      location: 'AWS S3 us-east-1',
      status: 'Success'
    },
  },
  {
    id: '10',
    type: 'approval_processed',
    agent: 'Financial Reconciliation Bot',
    title: 'Ledger Adjustment Approved',
    description: 'Discrepancy of $1,247.50 adjusted and flagged for audit',
    timestamp: '2 hours ago',
    details: { 
      adjustmentId: 'ADJ-2026-0317-003',
      ledgerAccount: 'ACC-4521',
      discrepancyAmount: '$1,247.50',
      adjustmentType: 'Credit',
      auditFlag: 'Yes',
      approvedBy: 'Finance Manager',
      reason: 'Bank reconciliation'
    },
  },
  {
    id: '11',
    type: 'task_completed',
    agent: 'Code Review Assistant',
    title: 'Security Scan Completed',
    description: 'No vulnerabilities found in 234 files scanned',
    timestamp: '3 hours ago',
    details: { 
      scanId: 'SEC-2026-0317-001',
      filesScanned: '234',
      linesOfCode: '45,892',
      vulnerabilities: '0',
      warnings: '3',
      scanDuration: '8m 12s',
      lastScan: '2026-03-16'
    },
  },
  {
    id: '12',
    type: 'agent_status',
    agent: 'Marketing Content Creator',
    title: 'Agent Paused',
    description: 'Agent manually paused by administrator',
    timestamp: '3 days ago',
    details: {
      agentId: 'AGT-005',
      status: 'Paused',
      pausedBy: 'System Admin',
      pausedAt: '2026-03-14 16:30',
      reason: 'Scheduled maintenance',
      estimatedResume: '2026-03-18 09:00'
    },
  },
];

const typeConfig: Record<ActivityType, { icon: typeof CheckCircle; color: string; bgColor: string; label: string }> = {
  task_completed: { icon: CheckCircle, color: 'text-emerald-400', bgColor: 'bg-emerald-500/20', label: 'Completed' },
  task_failed: { icon: XCircle, color: 'text-rose-400', bgColor: 'bg-rose-500/20', label: 'Failed' },
  approval_processed: { icon: CheckCircle, color: 'text-indigo-400', bgColor: 'bg-indigo/20', label: 'Approved' },
  config_changed: { icon: RefreshCw, color: 'text-amber-400', bgColor: 'bg-amber-500/20', label: 'Config' },
  agent_status: { icon: Bot, color: 'text-cyan-400', bgColor: 'bg-cyan-500/20', label: 'Status' },
  system: { icon: Clock, color: 'text-gray-400', bgColor: 'bg-gray-500/20', label: 'System' },
};

export default function Activity() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<ActivityType | 'all'>('all');
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'form' | 'json'>('form');
  const [selectedAgent, setSelectedAgent] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const selectedActivityData = activityData.find((a) => a.id === selectedActivity);

  // Get unique agents for filter
  const uniqueAgents = Array.from(new Set(activityData.map((a) => a.agent).filter(Boolean))) as string[];

  const filteredActivities = activityData.filter((activity) => {
    const matchesSearch =
      activity.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (activity.agent?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
    const matchesType = selectedType === 'all' || activity.type === selectedType;
    const matchesAgent = selectedAgent === 'all' || activity.agent === selectedAgent;
    
    // Status filter logic
    let matchesStatus = true;
    if (selectedStatus === 'completed') {
      matchesStatus = activity.type === 'task_completed';
    } else if (selectedStatus === 'failed') {
      matchesStatus = activity.type === 'task_failed';
    } else if (selectedStatus === 'approvals') {
      matchesStatus = activity.type === 'approval_processed';
    }
    
    return matchesSearch && matchesType && matchesAgent && matchesStatus;
  });

  const handleActivityClick = (activityId: string) => {
    setSelectedActivity(selectedActivity === activityId ? null : activityId);
    setViewMode('form'); // Reset to form view when opening new activity
  };

  return (
    <div className="min-h-screen flex">
      {/* Main Content */}
      <div className={`flex-1 transition-all ${selectedActivity ? 'mr-[600px]' : ''}`}>
      <Header title="Tasks" subtitle="Recent agent actions and system events" />

      <div className="p-6 space-y-6">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search activities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64 h-10 pl-10 pr-4 bg-dark-50 border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo/50 transition-colors"
            />
          </div>

          {/* Agent/Team Filter */}
          <CustomSelect
            value={selectedAgent}
            onChange={setSelectedAgent}
            options={[
              { value: 'all', label: 'All Agents' },
              ...uniqueAgents.map((agent) => ({ value: agent, label: agent })),
            ]}
          />

          {/* Status Filter */}
          <CustomSelect
            value={selectedStatus}
            onChange={setSelectedStatus}
            options={[
              { value: 'all', label: 'All Status' },
              { value: 'completed', label: 'Completed' },
              { value: 'failed', label: 'Failed' },
              { value: 'approvals', label: 'Pending Approvals' },
            ]}
          />
        </div>

        <div className="bg-dark-50 rounded-2xl border border-white/5 overflow-hidden">
          <div className="divide-y divide-white/5">
            {filteredActivities.map((activity) => {
              const config = typeConfig[activity.type];
              const Icon = config.icon;

              return (
                <div
                  key={activity.id}
                  onClick={() => handleActivityClick(activity.id)}
                  className={`p-4 transition-colors cursor-pointer group ${
                    selectedActivity === activity.id ? 'bg-white/10' : 'hover:bg-black/20'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-xl ${config.bgColor} flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`w-5 h-5 ${config.color}`} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-white">{activity.title}</h4>
                        {activity.agent && (
                          <span className="px-2 py-0.5 rounded text-xs bg-white/5 text-gray-400">
                            {activity.agent}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">{activity.description}</p>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="text-xs text-gray-600">{activity.timestamp}</span>
                      <ChevronRight className="w-4 h-4 text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredActivities.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16">
              <Search className="w-12 h-12 text-gray-700 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">No activities found</h3>
              <p className="text-sm text-gray-500">Try adjusting your search or filter</p>
            </div>
          )}
        </div>
      </div>
      </div>

      {/* Right Panel - Detail View */}
      {selectedActivityData && (
        <div className="fixed right-0 top-0 w-[600px] h-screen bg-dark-50 border-l border-white/5 overflow-y-auto">
          {/* Header */}
          <div className="p-6 border-b border-white/5 sticky top-0 bg-dark-50 z-10">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  {selectedActivityData.agent && (
                    <span className="px-2 py-1 rounded text-xs bg-white/5 text-gray-400">
                      {selectedActivityData.agent}
                    </span>
                  )}
                  <span className={`px-2 py-1 rounded text-xs ${typeConfig[selectedActivityData.type].bgColor} ${typeConfig[selectedActivityData.type].color}`}>
                    {typeConfig[selectedActivityData.type].label}
                  </span>
                </div>
                <h2 className="text-lg font-semibold text-white mb-1">{selectedActivityData.title}</h2>
                <p className="text-sm text-gray-500">{selectedActivityData.timestamp}</p>
              </div>
              <button
                onClick={() => setSelectedActivity(null)}
                className="p-2 rounded-lg hover:bg-white/5 transition-colors flex-shrink-0"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* View Mode Toggle */}
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('form')}
                className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  viewMode === 'form'
                    ? 'bg-indigo text-white'
                    : 'bg-black/60 text-gray-400 hover:text-white'
                }`}
              >
                Form View
              </button>
              <button
                onClick={() => setViewMode('json')}
                className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  viewMode === 'json'
                    ? 'bg-indigo text-white'
                    : 'bg-black/60 text-gray-400 hover:text-white'
                }`}
              >
                JSON View
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {viewMode === 'form' ? (
              <div className="space-y-6">
                {/* Description */}
                <div>
                  <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Description</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{selectedActivityData.description}</p>
                </div>

                {/* Output Details */}
                {selectedActivityData.details && (
                  <div>
                    <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Execution Result</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {Object.entries(selectedActivityData.details).map(([key, value]) => (
                        <div key={key} className="bg-black/40 rounded-xl p-4">
                          <div className="text-xs text-gray-500 mb-1 capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </div>
                          <div className="text-base font-medium text-white">{value}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Additional Info */}
                <div>
                  <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Task Information</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between py-2 border-b border-white/5">
                      <span className="text-sm text-gray-500">Task ID</span>
                      <span className="text-sm text-white font-mono">{selectedActivityData.id}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-white/5">
                      <span className="text-sm text-gray-500">Type</span>
                      <span className="text-sm text-white">{typeConfig[selectedActivityData.type].label}</span>
                    </div>
                    {selectedActivityData.agent && (
                      <div className="flex items-center justify-between py-2 border-b border-white/5">
                        <span className="text-sm text-gray-500">Agent</span>
                        <span className="text-sm text-white">{selectedActivityData.agent}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between py-2 border-b border-white/5">
                      <span className="text-sm text-gray-500">Timestamp</span>
                      <span className="text-sm text-white">{selectedActivityData.timestamp}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Raw JSON Output</h3>
                <pre className="bg-black/60 rounded-xl p-4 text-xs text-gray-300 overflow-x-auto">
                  {JSON.stringify(selectedActivityData, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
