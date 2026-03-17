import { useState } from 'react';
import { Search, Network, FlaskConical, Pencil } from 'lucide-react';
import Header from '../components/layout/Header';

interface KnowledgeDomain {
  id: string;
  name: string;
  abbreviation: string;
  version: string;
  status: 'active' | 'development' | 'archived';
  description: string;
  conceptCount: number;
  relationCount: number;
  cqCoverage: number;
  completeness: number;
  color: 'green' | 'blue' | 'amber' | 'cyan' | 'rose' | 'teal';
}

const knowledgeDomains: KnowledgeDomain[] = [
  {
    id: '1',
    name: 'Fleet Management System',
    abbreviation: 'FMS',
    version: 'v1.5.1',
    status: 'active',
    description: 'Fleet management system knowledge domain, including vehicle management, driver management, maintenance concepts.',
    conceptCount: 32,
    relationCount: 78,
    cqCoverage: 78,
    completeness: 75,
    color: 'amber',
  },
  {
    id: '2',
    name: 'Human Resource Management',
    abbreviation: 'HRM',
    version: 'v0.9.0',
    status: 'development',
    description: 'Human resource management knowledge domain, including employee management, performance evaluation, payroll concepts.',
    conceptCount: 28,
    relationCount: 65,
    cqCoverage: 65,
    completeness: 60,
    color: 'blue',
  },
  {
    id: '3',
    name: 'Order Management System',
    abbreviation: 'OMS',
    version: 'v2.0.1',
    status: 'active',
    description: 'Order management system knowledge domain, including order processing, inventory allocation, delivery scheduling concepts.',
    conceptCount: 42,
    relationCount: 115,
    cqCoverage: 90,
    completeness: 86,
    color: 'rose',
  },
  {
    id: '4',
    name: 'Transport Management System',
    abbreviation: 'TMS',
    version: 'v1.8.2',
    status: 'active',
    description: 'Transport management system knowledge domain, including delivery, route optimization, vehicle scheduling core concepts.',
    conceptCount: 38,
    relationCount: 95,
    cqCoverage: 85,
    completeness: 82,
    color: 'green',
  },
  {
    id: '5',
    name: 'Warehouse Management System',
    abbreviation: 'WMS',
    version: 'v2.1.0',
    status: 'active',
    description: 'Warehouse management system knowledge domain, including inbound, outbound, inventory, stock management core concepts.',
    conceptCount: 45,
    relationCount: 120,
    cqCoverage: 92,
    completeness: 88,
    color: 'cyan',
  },
  {
    id: '6',
    name: 'Yard Management System',
    abbreviation: 'YMS',
    version: 'v1.2.3',
    status: 'active',
    description: 'Yard management system knowledge domain, including yard planning, equipment management, operation scheduling concepts.',
    conceptCount: 35,
    relationCount: 88,
    cqCoverage: 80,
    completeness: 77,
    color: 'teal',
  },
];

const statusConfig = {
  active: { label: 'Active', bgColor: 'bg-emerald-500/20', textColor: 'text-emerald-400' },
  development: { label: 'In Development', bgColor: 'bg-blue-500/20', textColor: 'text-blue-400' },
  archived: { label: 'Archived', bgColor: 'bg-gray-500/20', textColor: 'text-gray-400' },
};

const colorConfig = {
  green: { dot: 'bg-emerald-400', bar: 'bg-emerald-500' },
  blue: { dot: 'bg-blue-400', bar: 'bg-blue-500' },
  amber: { dot: 'bg-amber-400', bar: 'bg-amber-500' },
  cyan: { dot: 'bg-cyan-400', bar: 'bg-cyan-500' },
  rose: { dot: 'bg-rose-400', bar: 'bg-rose-500' },
  teal: { dot: 'bg-teal-400', bar: 'bg-teal-500' },
};

export default function Ontology() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredDomains = knowledgeDomains.filter((domain) =>
    domain.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    domain.abbreviation.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen">
      <Header title="Ontology" subtitle="Enterprise knowledge ontology, 6 domain knowledge graphs" />

      <div className="p-6 space-y-6">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search knowledge domains..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64 h-10 pl-10 pr-4 bg-dark-50 border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo/50 transition-colors"
            />
          </div>

          <button className="flex items-center gap-2 h-10 px-5 bg-indigo hover:bg-indigo-600 rounded-lg text-sm font-medium text-white transition-colors ml-auto">
            <Pencil className="w-4 h-4" />
            Build in Ontology Studio
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredDomains.map((domain) => {
            const colors = colorConfig[domain.color];
            const status = statusConfig[domain.status];

            return (
              <div
                key={domain.id}
                className="bg-dark-50 rounded-2xl border border-white/5 p-5 hover:border-indigo/30 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${colors.dot}`} />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-white">{domain.abbreviation}</h3>
                        <span className="text-gray-400">-</span>
                        <span className="text-gray-300 text-sm">{domain.name}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${status.bgColor} ${status.textColor}`}>
                          {status.label}
                        </span>
                        <span className="text-xs text-gray-500">{domain.version}</span>
                      </div>
                    </div>
                  </div>
                  <button className="p-1.5 rounded-lg hover:bg-white/5 transition-colors" data-tip="Edit in Ontology Studio">
                    <Pencil className="w-4 h-4 text-gray-500" />
                  </button>
                </div>

                <p className="text-sm text-gray-400 mb-4 line-clamp-2">
                  {domain.description}
                </p>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Concept Count</p>
                    <p className="text-lg font-semibold text-white">{domain.conceptCount}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Relation Count</p>
                    <p className="text-lg font-semibold text-white">{domain.relationCount}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-indigo text-white text-sm font-medium hover:bg-indigo-600 transition-colors">
                    <Network className="w-4 h-4" />
                    View Graph
                  </button>
                  <button className="px-3 py-2.5 rounded-lg bg-dark-100 border border-white/10 text-white hover:border-indigo/50 transition-colors">
                    <FlaskConical className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {filteredDomains.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-dark-50 flex items-center justify-center mb-4">
              <Search className="w-8 h-8 text-gray-600" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">No domains found</h3>
            <p className="text-sm text-gray-500">Try adjusting your search criteria</p>
          </div>
        )}
      </div>
    </div>
  );
}
