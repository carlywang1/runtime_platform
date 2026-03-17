import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowUpCircle, CheckCircle, Bot, Users, ChevronDown, ChevronUp, Clock, Sparkles, FlaskConical } from 'lucide-react';
import Header from '../components/layout/Header';
import CustomSelect from '../components/CustomSelect';

interface VersionItem {
  id: string;
  name: string;
  type: 'agent' | 'team';
  avatar?: string;
  currentVersion: string;
  latestVersion: string;
  source: 'marketplace' | 'ide_build';
  lastUpdated: string;
  updatedBy: string;
  releaseNotes: {
    version: string;
    date: string;
    highlights: string[];
    details: string;
  }[];
}

const versionData: VersionItem[] = [
  {
    id: '1',
    name: 'Customer Support Agent',
    type: 'agent',
    avatar: 'https://images.pexels.com/photos/8438918/pexels-photo-8438918.jpeg?auto=compress&cs=tinysrgb&w=100',
    currentVersion: 'v2.3.0',
    latestVersion: 'v2.5.0',
    source: 'marketplace',
    lastUpdated: 'Mar 10, 2026',
    updatedBy: 'Taylor Zhang',
    releaseNotes: [
      {
        version: 'v2.5.0',
        date: 'Mar 16, 2026',
        highlights: ['Multi-language support for 12 new languages', 'Smart escalation with sentiment analysis', 'Reduced response latency by 40%'],
        details: 'This major update introduces multi-language ticket handling, improved escalation logic powered by sentiment analysis, and significant performance optimizations.',
      },
      {
        version: 'v2.4.0',
        date: 'Mar 12, 2026',
        highlights: ['WhatsApp channel integration', 'New fallback handler for edge cases'],
        details: 'Added WhatsApp Business as a support channel and improved handling of unrecognized queries.',
      },
    ],
  },
  {
    id: '2',
    name: 'Financial Reconciliation Bot',
    type: 'agent',
    avatar: 'https://images.pexels.com/photos/4481259/pexels-photo-4481259.jpeg?auto=compress&cs=tinysrgb&w=100',
    currentVersion: 'v1.8.0',
    latestVersion: 'v2.0.0',
    source: 'marketplace',
    lastUpdated: 'Mar 5, 2026',
    updatedBy: 'System (Steward)',
    releaseNotes: [
      {
        version: 'v2.0.0',
        date: 'Mar 15, 2026',
        highlights: ['Complete ledger engine rewrite', 'Real-time bank sync support', 'New audit trail dashboard'],
        details: 'Major version upgrade with a rewritten reconciliation engine, real-time sync capabilities, and enhanced audit compliance features.',
      },
      {
        version: 'v1.9.0',
        date: 'Mar 10, 2026',
        highlights: ['Improved error recovery', 'Multi-currency support'],
        details: 'Added automatic retry logic for failed syncs and support for 25+ currencies.',
      },
    ],
  },
  {
    id: '3',
    name: 'WMS Inbound Team',
    type: 'team',
    currentVersion: 'v2.4.0',
    latestVersion: 'v2.5.1',
    source: 'ide_build',
    lastUpdated: 'Mar 14, 2026',
    updatedBy: 'Taylor Zhang',
    releaseNotes: [
      {
        version: 'v2.5.1',
        date: 'Mar 17, 2026',
        highlights: ['Hotfix for Storage Allocator timeout', 'Improved Label Generator accuracy'],
        details: 'Patch release fixing a timeout issue in the Storage Allocator agent and improving label generation accuracy to 99.2%.',
      },
      {
        version: 'v2.5.0',
        date: 'Mar 16, 2026',
        highlights: ['New Quality Inspector rules engine', 'Team-wide performance monitoring', 'Receipt Validator batch mode'],
        details: 'Major update adding a configurable rules engine for quality inspection, centralized performance dashboards, and batch processing for receipt validation.',
      },
    ],
  },
  {
    id: '4',
    name: 'Sales Intelligence Team',
    type: 'team',
    currentVersion: 'v1.0.0',
    latestVersion: 'v1.2.0',
    source: 'marketplace',
    lastUpdated: 'Mar 1, 2026',
    updatedBy: 'Taylor Zhang',
    releaseNotes: [
      {
        version: 'v1.2.0',
        date: 'Mar 14, 2026',
        highlights: ['CRM data enrichment pipeline', 'Lead scoring model v2', 'Automated follow-up sequences'],
        details: 'Introduces automated CRM enrichment, an improved ML-based lead scoring model, and configurable follow-up email sequences.',
      },
      {
        version: 'v1.1.0',
        date: 'Mar 8, 2026',
        highlights: ['Pipeline visualization', 'Deal probability estimates'],
        details: 'Added visual pipeline tracking and AI-powered deal probability predictions.',
      },
    ],
  },
  {
    id: '5',
    name: 'Code Review Assistant',
    type: 'agent',
    avatar: 'https://images.pexels.com/photos/11035471/pexels-photo-11035471.jpeg?auto=compress&cs=tinysrgb&w=100',
    currentVersion: 'v3.1.0',
    latestVersion: 'v3.1.0',
    source: 'ide_build',
    lastUpdated: 'Mar 16, 2026',
    updatedBy: 'Taylor Zhang',
    releaseNotes: [],
  },
  {
    id: '6',
    name: 'Data Analyst Pro',
    type: 'agent',
    avatar: 'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=100',
    currentVersion: 'v4.2.0',
    latestVersion: 'v4.2.0',
    source: 'marketplace',
    lastUpdated: 'Mar 15, 2026',
    updatedBy: 'System (Steward)',
    releaseNotes: [],
  },
];

const typeOptions = [
  { value: 'all', label: 'All Types' },
  { value: 'agent', label: 'Agents' },
  { value: 'team', label: 'Teams' },
];

const statusOptions = [
  { value: 'all', label: 'All Status' },
  { value: 'update_available', label: 'Update Available' },
  { value: 'up_to_date', label: 'Up to Date' },
];

export default function VersionControl() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const filtered = versionData.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || item.type === typeFilter;
    const hasUpdate = item.currentVersion !== item.latestVersion;
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'update_available' && hasUpdate) ||
      (statusFilter === 'up_to_date' && !hasUpdate);
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleUpdate = (id: string) => {
    setUpdatingId(id);
    setTimeout(() => setUpdatingId(null), 2000);
  };

  const updatesAvailable = versionData.filter((i) => i.currentVersion !== i.latestVersion).length;

  return (
    <div className="min-h-screen">
      <Header title="Version Control" subtitle={`${updatesAvailable} update${updatesAvailable !== 1 ? 's' : ''} available`} />

      <div className="p-6 space-y-6">
        {/* Toolbar */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search agents & teams..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64 h-10 pl-10 pr-4 bg-dark-50 border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo/50 transition-colors"
            />
          </div>
          <CustomSelect value={typeFilter} onChange={setTypeFilter} options={typeOptions} />
          <CustomSelect value={statusFilter} onChange={setStatusFilter} options={statusOptions} />

          {updatesAvailable > 0 && (
            <button className="flex items-center gap-1.5 h-8 px-3 bg-indigo hover:bg-indigo-600 rounded-lg text-xs font-medium text-white transition-colors ml-auto">
              <ArrowUpCircle className="w-3.5 h-3.5" />
              Update All ({updatesAvailable})
            </button>
          )}
        </div>

        {/* Version Cards */}
        <div className="space-y-3">
          {filtered.map((item) => {
            const hasUpdate = item.currentVersion !== item.latestVersion;
            const isExpanded = expandedId === item.id;
            const isUpdating = updatingId === item.id;
            const latestNotes = item.releaseNotes[0];

            return (
              <div
                key={item.id}
                className={`bg-dark-50 rounded-2xl border transition-all ${
                  hasUpdate ? 'border-indigo/20' : 'border-white/5'
                }`}
              >
                {/* Main Row */}
                <div className="p-5">
                  <div className="flex items-center gap-4">
                    {/* Icon */}
                    {item.avatar ? (
                      <img src={item.avatar} alt={item.name} className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-indigo/20 flex items-center justify-center flex-shrink-0">
                        {item.type === 'team' ? <Users className="w-5 h-5 text-indigo-400" /> : <Bot className="w-5 h-5 text-indigo-400" />}
                      </div>
                    )}

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-white">{item.name}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                          item.type === 'team' ? 'bg-cyan-500/20 text-cyan-400' : 'bg-purple-500/20 text-purple-400'
                        }`}>
                          {item.type === 'team' ? 'Team' : 'Agent'}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                          item.source === 'marketplace' ? 'bg-indigo/20 text-indigo-300' : 'bg-emerald-500/20 text-emerald-300'
                        }`}>
                          {item.source === 'marketplace' ? 'Hired' : 'IDE Build'}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span>Current: <span className="text-white font-medium">{item.currentVersion}</span></span>
                        {hasUpdate && (
                          <>
                            <span className="text-gray-600">→</span>
                            <span>Latest: <span className="text-emerald-400 font-medium">{item.latestVersion}</span></span>
                          </>
                        )}
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />Updated {item.lastUpdated}</span>
                      </div>

                      {/* Release highlight preview */}
                      {hasUpdate && latestNotes && (
                        <p className="text-xs text-gray-400 mt-2 line-clamp-1">{latestNotes.highlights[0]}</p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {hasUpdate ? (
                        <>
                          <button
                            onClick={() => navigate(`/version-control/test/${item.id}`, { state: { name: item.name, type: item.type, latestVersion: item.latestVersion, currentVersion: item.currentVersion } })}
                            className="flex items-center gap-1 h-7 px-2.5 rounded-md bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 text-[11px] font-medium transition-colors"
                          >
                            <FlaskConical className="w-3 h-3" />
                            Try {item.latestVersion}
                          </button>
                          <button
                            onClick={() => handleUpdate(item.id)}
                            disabled={isUpdating}
                            className={`flex items-center gap-1 h-7 px-3 rounded-md text-[11px] font-medium transition-colors ${
                              isUpdating
                                ? 'bg-emerald-500/20 text-emerald-400 cursor-wait'
                                : 'bg-indigo hover:bg-indigo-600 text-white'
                            }`}
                          >
                            {isUpdating ? (
                              <>
                                <Sparkles className="w-3 h-3 animate-spin" />
                                Updating...
                              </>
                            ) : (
                              <>
                                <ArrowUpCircle className="w-3 h-3" />
                                Update
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => setExpandedId(isExpanded ? null : item.id)}
                            className="w-7 h-7 rounded-md flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/10 transition-colors"
                          >
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                        </>
                      ) : (
                        <span className="flex items-center gap-1 h-7 px-2.5 text-[11px] font-medium text-emerald-400">
                          <CheckCircle className="w-3 h-3" />
                          Up to date
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded Release Notes */}
                {isExpanded && hasUpdate && latestNotes && (
                  <div className="border-t border-white/5 px-5 py-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-semibold text-white">{latestNotes.version}</span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-500/20 text-emerald-400">Latest</span>
                      <span className="text-xs text-gray-500">{latestNotes.date}</span>
                    </div>
                    <p className="text-xs text-gray-400 mb-2">{latestNotes.details}</p>
                    <ul className="space-y-1">
                      {latestNotes.highlights.map((h) => (
                        <li key={h} className="flex items-start gap-2 text-xs text-gray-300">
                          <span className="text-indigo-400 mt-0.5">•</span>
                          {h}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-dark-50 flex items-center justify-center mb-4">
              <Search className="w-8 h-8 text-gray-600" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">No results found</h3>
            <p className="text-sm text-gray-500">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
