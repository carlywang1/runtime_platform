import { useState } from 'react';
import { Search, UserPlus, Mail, ChevronDown, Plus, MoreHorizontal, Pencil, Trash2, Bot, Users } from 'lucide-react';
import Header from '../components/layout/Header';

type Tab = 'users' | 'roles';
type Permission = 'Manage' | 'View' | 'None';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
  color: string;
  hasEmail: boolean;
  agents: string;
  joinedDate: string;
}

interface RolePermission {
  feature: string;
  permission: Permission;
}

interface RoleCategory {
  name: string;
  permissions: RolePermission[];
}

interface WorkforceAccess {
  name: string;
  type: 'agent' | 'team';
  permission: Permission;
}

interface Role {
  name: string;
  count: number;
  workforceAccess: WorkforceAccess[];
  categories: RoleCategory[];
}

const users: User[] = [
  { id: '1', name: 'Taylor Zhang', email: 'taylor.zhang@item.com', role: 'Owner', avatar: 'T', color: 'bg-purple-500', hasEmail: true, agents: 'All Agents', joinedDate: 'Jan 10, 2025' },
  { id: '2', name: 'Jordan Lee', email: 'j.lee@item.com', role: 'Admin', avatar: 'J', color: 'bg-indigo-500', hasEmail: true, agents: 'All Agents', joinedDate: 'Feb 3, 2025' },
  { id: '3', name: 'Alex Chen', email: 'a.chen@item.com', role: 'Team Manager', avatar: 'A', color: 'bg-emerald-500', hasEmail: true, agents: 'WMS Inbound Team, Recruiting Team', joinedDate: 'Mar 15, 2025' },
  { id: '4', name: 'Sam Rivera', email: 's.rivera@item.com', role: 'Viewer', avatar: 'S', color: 'bg-amber-500', hasEmail: false, agents: 'Customer Support Agent', joinedDate: 'Jun 22, 2025' },
  { id: '5', name: 'Morgan Wu', email: 'm.wu@item.com', role: 'Contributor', avatar: 'M', color: 'bg-cyan-500', hasEmail: false, agents: 'Code Review Assistant, Data Analyst Pro', joinedDate: 'Sep 1, 2025' },
];

const allWorkforceItems: Omit<WorkforceAccess, 'permission'>[] = [
  { name: 'Customer Support Agent', type: 'agent' },
  { name: 'Financial Reconciliation Bot', type: 'agent' },
  { name: 'Code Review Assistant', type: 'agent' },
  { name: 'Data Analyst Pro', type: 'agent' },
  { name: 'WMS Inbound Team', type: 'team' },
  { name: 'Recruiting Team', type: 'team' },
  { name: 'New Employee Onboarding Team', type: 'team' },
  { name: 'Sales Intelligence Team', type: 'team' },
  { name: 'Customer Success Pipeline', type: 'team' },
];

const roles: Role[] = [
  {
    name: 'Owner', count: 1,
    workforceAccess: allWorkforceItems.map((i) => ({ ...i, permission: 'Manage' as Permission })),
    categories: [
      { name: 'Control', permissions: [
        { feature: 'Pending Approvals', permission: 'Manage' },
        { feature: 'Tasks', permission: 'Manage' },
        { feature: 'Security', permission: 'Manage' },
        { feature: 'Version Control', permission: 'Manage' },
      ]},
      { name: 'Configuration', permissions: [
        { feature: 'Connectors', permission: 'Manage' },
        { feature: 'Ontology Studio', permission: 'Manage' },
        { feature: 'Secrets & Tokens', permission: 'Manage' },
        { feature: 'Webhooks', permission: 'Manage' },
        { feature: 'Schedule (Cron)', permission: 'Manage' },
        { feature: 'User Management', permission: 'Manage' },
      ]},
    ],
  },
  {
    name: 'Admin', count: 1,
    workforceAccess: allWorkforceItems.map((i) => ({ ...i, permission: 'Manage' as Permission })),
    categories: [
      { name: 'Control', permissions: [
        { feature: 'Pending Approvals', permission: 'Manage' },
        { feature: 'Tasks', permission: 'Manage' },
        { feature: 'Security', permission: 'View' },
        { feature: 'Version Control', permission: 'Manage' },
      ]},
      { name: 'Configuration', permissions: [
        { feature: 'Connectors', permission: 'Manage' },
        { feature: 'Ontology Studio', permission: 'Manage' },
        { feature: 'Secrets & Tokens', permission: 'Manage' },
        { feature: 'Webhooks', permission: 'Manage' },
        { feature: 'Schedule (Cron)', permission: 'Manage' },
        { feature: 'User Management', permission: 'Manage' },
      ]},
    ],
  },
  {
    name: 'Team Manager', count: 1,
    workforceAccess: [
      { name: 'Customer Support Agent', type: 'agent', permission: 'Manage' },
      { name: 'Financial Reconciliation Bot', type: 'agent', permission: 'View' },
      { name: 'Code Review Assistant', type: 'agent', permission: 'None' },
      { name: 'Data Analyst Pro', type: 'agent', permission: 'None' },
      { name: 'WMS Inbound Team', type: 'team', permission: 'Manage' },
      { name: 'Recruiting Team', type: 'team', permission: 'Manage' },
      { name: 'New Employee Onboarding Team', type: 'team', permission: 'View' },
      { name: 'Sales Intelligence Team', type: 'team', permission: 'None' },
      { name: 'Customer Success Pipeline', type: 'team', permission: 'None' },
    ],
    categories: [
      { name: 'Control', permissions: [
        { feature: 'Pending Approvals', permission: 'Manage' },
        { feature: 'Tasks', permission: 'View' },
        { feature: 'Security', permission: 'None' },
        { feature: 'Version Control', permission: 'View' },
      ]},
      { name: 'Configuration', permissions: [
        { feature: 'Connectors', permission: 'View' },
        { feature: 'Ontology Studio', permission: 'View' },
        { feature: 'Secrets & Tokens', permission: 'None' },
        { feature: 'Webhooks', permission: 'View' },
        { feature: 'Schedule (Cron)', permission: 'View' },
        { feature: 'User Management', permission: 'None' },
      ]},
    ],
  },
  { name: 'Contributor', count: 1,
    workforceAccess: [
      { name: 'Customer Support Agent', type: 'agent', permission: 'View' },
      { name: 'Financial Reconciliation Bot', type: 'agent', permission: 'None' },
      { name: 'Code Review Assistant', type: 'agent', permission: 'Manage' },
      { name: 'Data Analyst Pro', type: 'agent', permission: 'Manage' },
      { name: 'WMS Inbound Team', type: 'team', permission: 'None' },
      { name: 'Recruiting Team', type: 'team', permission: 'None' },
      { name: 'New Employee Onboarding Team', type: 'team', permission: 'None' },
      { name: 'Sales Intelligence Team', type: 'team', permission: 'View' },
      { name: 'Customer Success Pipeline', type: 'team', permission: 'None' },
    ],
    categories: [
      { name: 'Control', permissions: [
        { feature: 'Pending Approvals', permission: 'View' },
        { feature: 'Tasks', permission: 'View' },
        { feature: 'Security', permission: 'None' },
        { feature: 'Version Control', permission: 'View' },
      ]},
      { name: 'Configuration', permissions: [
        { feature: 'Connectors', permission: 'View' },
        { feature: 'Ontology Studio', permission: 'View' },
        { feature: 'Secrets & Tokens', permission: 'None' },
        { feature: 'Webhooks', permission: 'None' },
        { feature: 'Schedule (Cron)', permission: 'None' },
        { feature: 'User Management', permission: 'None' },
      ]},
    ],
  },
  { name: 'Viewer', count: 1,
    workforceAccess: [
      { name: 'Customer Support Agent', type: 'agent', permission: 'View' },
      { name: 'Financial Reconciliation Bot', type: 'agent', permission: 'None' },
      { name: 'Code Review Assistant', type: 'agent', permission: 'None' },
      { name: 'Data Analyst Pro', type: 'agent', permission: 'None' },
      { name: 'WMS Inbound Team', type: 'team', permission: 'View' },
      { name: 'Recruiting Team', type: 'team', permission: 'None' },
      { name: 'New Employee Onboarding Team', type: 'team', permission: 'None' },
      { name: 'Sales Intelligence Team', type: 'team', permission: 'None' },
      { name: 'Customer Success Pipeline', type: 'team', permission: 'None' },
    ],
    categories: [
      { name: 'Control', permissions: [
        { feature: 'Pending Approvals', permission: 'None' },
        { feature: 'Tasks', permission: 'View' },
        { feature: 'Security', permission: 'None' },
        { feature: 'Version Control', permission: 'None' },
      ]},
      { name: 'Configuration', permissions: [
        { feature: 'Connectors', permission: 'None' },
        { feature: 'Ontology Studio', permission: 'None' },
        { feature: 'Secrets & Tokens', permission: 'None' },
        { feature: 'Webhooks', permission: 'None' },
        { feature: 'Schedule (Cron)', permission: 'None' },
        { feature: 'User Management', permission: 'None' },
      ]},
    ],
  },
];

const permissionColor: Record<string, string> = {
  Manage: 'text-emerald-400',
  View: 'text-gray-400',
  None: 'text-gray-600',
};

export default function UserManagement() {
  const [tab, setTab] = useState<Tab>('users');
  const [userSearch, setUserSearch] = useState('');
  const [roleSearch, setRoleSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState('Owner');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [workforceSearch, setWorkforceSearch] = useState('');
  const [workforceTypeFilter, setWorkforceTypeFilter] = useState<'all' | 'agent' | 'team'>('all');

  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  const filteredRoles = roles.filter((r) =>
    r.name.toLowerCase().includes(roleSearch.toLowerCase())
  );

  const activeRole = roles.find((r) => r.name === selectedRole);

  const filteredWorkforce = activeRole
    ? activeRole.workforceAccess.filter((item) => {
        const matchesSearch = item.name.toLowerCase().includes(workforceSearch.toLowerCase());
        const matchesType = workforceTypeFilter === 'all' || item.type === workforceTypeFilter;
        return matchesSearch && matchesType;
      })
    : [];

  const toggleUser = (id: string) => {
    setSelectedUsers((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  const toggleAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map((u) => u.id));
    }
  };

  return (
    <div className="min-h-screen">
      <Header title="User Management" subtitle="Manage team members, roles, and permissions" />

      <div className="p-6 space-y-6">
        {/* Tabs */}
        <div className="flex gap-0 border-b border-white/10">
          <button
            onClick={() => setTab('users')}
            className={`px-4 py-2.5 text-sm font-medium transition-colors relative ${
              tab === 'users' ? 'text-white' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            Users
            {tab === 'users' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo" />}
          </button>
          <button
            onClick={() => setTab('roles')}
            className={`px-4 py-2.5 text-sm font-medium transition-colors relative ${
              tab === 'roles' ? 'text-white' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            Roles
            {tab === 'roles' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo" />}
          </button>
        </div>

        {/* Users Tab */}
        {tab === 'users' && (
          <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-52 h-10 pl-10 pr-4 bg-dark-50 border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo/50 transition-colors"
                />
              </div>
              <span className="text-xs text-gray-500">({selectedUsers.length}/{users.length}) Selected Users</span>
              <button className="flex items-center gap-2 h-10 px-4 bg-indigo hover:bg-indigo-600 rounded-lg text-sm font-medium text-white transition-colors ml-auto">
                <UserPlus className="w-4 h-4" />
                Add User
              </button>
            </div>

            {/* Table */}
            <div className="bg-dark-50 rounded-2xl border border-white/5 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="w-10 p-4">
                      <input
                        type="checkbox"
                        checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                        onChange={toggleAll}
                        className="w-4 h-4 rounded border-white/20 bg-transparent accent-indigo"
                      />
                    </th>
                    <th className="text-left p-4 text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th className="text-left p-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <span className="flex items-center gap-1">Role <ChevronDown className="w-3 h-3" /></span>
                    </th>
                    <th className="text-left p-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Accessible Agents</th>
                    <th className="text-left p-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                    <th className="text-left p-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="w-10 p-4">
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user.id)}
                          onChange={() => toggleUser(user.id)}
                          className="w-4 h-4 rounded border-white/20 bg-transparent accent-indigo"
                        />
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-white">{user.name}</span>
                          {user.hasEmail && <Mail className="w-3 h-3 text-gray-500" />}
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">{user.email}</p>
                      </td>
                      <td className="p-4 text-sm text-gray-300">{user.role}</td>
                      <td className="p-4 text-sm text-gray-400 max-w-[200px]">
                        <span className="line-clamp-1">{user.agents}</span>
                      </td>
                      <td className="p-4 text-sm text-gray-400">{user.joinedDate}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-1">
                          <button className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition-colors" data-tip="Edit">
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button className="p-1.5 rounded-lg text-gray-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors" data-tip="Remove">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          <button className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition-colors" data-tip="More">
                            <MoreHorizontal className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredUsers.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12">
                  <p className="text-sm text-gray-500">No users found</p>
                </div>
              )}

              {/* Pagination */}
              <div className="flex items-center justify-end gap-3 px-4 py-3 border-t border-white/5">
                <span className="text-xs text-gray-500">1–{filteredUsers.length} of {users.length}</span>
                <div className="flex gap-1">
                  <button className="w-7 h-7 rounded flex items-center justify-center text-gray-500 hover:bg-white/5 text-xs">&lt;</button>
                  <button className="w-7 h-7 rounded flex items-center justify-center text-gray-500 hover:bg-white/5 text-xs">&gt;</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Roles Tab */}
        {tab === 'roles' && (
          <div className="flex gap-6">
            {/* Left: Role List */}
            <div className="w-56 flex-shrink-0 space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search roles..."
                  value={roleSearch}
                  onChange={(e) => setRoleSearch(e.target.value)}
                  className="w-full h-9 pl-9 pr-3 bg-dark-50 border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo/50 transition-colors"
                />
              </div>

              <button className="flex items-center gap-1.5 text-sm text-indigo-400 hover:text-indigo-300 transition-colors px-1">
                <Plus className="w-3.5 h-3.5" />
                New Custom Role
              </button>

              <div className="space-y-0.5">
                {filteredRoles.map((role) => (
                  <button
                    key={role.name}
                    onClick={() => setSelectedRole(role.name)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors ${
                      selectedRole === role.name
                        ? 'bg-indigo/10 text-indigo-300 font-medium'
                        : 'text-gray-400 hover:bg-white/[0.03] hover:text-gray-300'
                    }`}
                  >
                    <span>{role.name}</span>
                    <span className="text-xs text-gray-600">{role.count}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Right: Role Permissions */}
            <div className="flex-1 min-w-0">
              {activeRole && (
                <div className="space-y-8">
                  <h2 className="text-xl font-semibold text-white">{activeRole.name}</h2>

                  {/* AI Workforce Access */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-semibold text-white">AI Workforce Access</h3>
                      <span className="text-xs text-gray-500">
                        {activeRole.workforceAccess.filter((i) => i.permission !== 'None').length} / {activeRole.workforceAccess.length} accessible
                      </span>
                    </div>
                    <div className="rounded-xl border border-white/5 overflow-hidden">
                      {/* Search + filter bar */}
                      <div className="flex items-center gap-2 px-4 py-2.5 bg-white/[0.02] border-b border-white/5">
                        <div className="relative flex-1">
                          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-600" />
                          <input
                            type="text"
                            placeholder="Search agents & teams..."
                            value={workforceSearch}
                            onChange={(e) => setWorkforceSearch(e.target.value)}
                            className="w-full h-8 pl-8 pr-3 bg-black/40 border border-white/5 rounded-lg text-xs text-white placeholder-gray-600 focus:outline-none focus:border-indigo/40 transition-colors"
                          />
                        </div>
                        <div className="flex items-center bg-black/40 rounded-lg p-0.5 border border-white/5">
                          {(['all', 'agent', 'team'] as const).map((t) => (
                            <button
                              key={t}
                              onClick={() => setWorkforceTypeFilter(t)}
                              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                                workforceTypeFilter === t ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'
                              }`}
                            >
                              {t === 'all' ? 'All' : t === 'agent' ? 'Agents' : 'Teams'}
                            </button>
                          ))}
                        </div>
                      </div>
                      {/* Column header */}
                      <div className="grid grid-cols-[auto_1fr_80px] gap-3 px-4 py-2 border-b border-white/5">
                        <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider w-8" />
                        <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">Agent / Team</span>
                        <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider text-right">Access</span>
                      </div>
                      {/* Scrollable list */}
                      <div className="divide-y divide-white/5 max-h-[320px] overflow-y-auto">
                        {filteredWorkforce.length > 0 ? filteredWorkforce.map((item) => {
                          const hasAccess = item.permission !== 'None';
                          return (
                            <div
                              key={item.name}
                              className={`grid grid-cols-[auto_1fr_80px] gap-3 items-center px-4 py-3 transition-colors ${
                                hasAccess ? 'hover:bg-white/[0.02]' : 'opacity-40'
                              }`}
                            >
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                hasAccess
                                  ? item.type === 'agent' ? 'bg-purple-500/20' : 'bg-cyan-500/20'
                                  : 'bg-white/5'
                              }`}>
                                {item.type === 'agent' ? (
                                  <Bot className={`w-4 h-4 ${hasAccess ? 'text-purple-400' : 'text-gray-600'}`} />
                                ) : (
                                  <Users className={`w-4 h-4 ${hasAccess ? 'text-cyan-400' : 'text-gray-600'}`} />
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className={`text-sm truncate ${hasAccess ? 'text-white' : 'text-gray-600'}`}>{item.name}</p>
                                <p className="text-[10px] text-gray-600">{item.type === 'agent' ? 'Agent' : 'Team'}</p>
                              </div>
                              <div className="text-right">
                                {hasAccess ? (
                                  <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium ${
                                    item.permission === 'Manage'
                                      ? 'bg-emerald-500/20 text-emerald-400'
                                      : 'bg-gray-500/20 text-gray-400'
                                  }`}>
                                    {item.permission}
                                  </span>
                                ) : (
                                  <span className="text-[10px] text-gray-600">No access</span>
                                )}
                              </div>
                            </div>
                          );
                        }) : (
                          <div className="flex items-center justify-center py-8">
                            <p className="text-xs text-gray-600">No matching agents or teams</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Platform Permissions */}
                  <div>
                    <h3 className="text-sm font-semibold text-white mb-3">Platform Permissions</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {activeRole.categories.map((cat) => (
                        <div key={cat.name} className="rounded-xl border border-white/5 overflow-hidden">
                          <div className="px-4 py-2.5 bg-white/[0.02] border-b border-white/5">
                            <span className="text-xs font-semibold text-white">{cat.name}</span>
                          </div>
                          <div className="divide-y divide-white/5">
                            {cat.permissions.map((p) => (
                              <div key={p.feature} className="flex items-center justify-between px-4 py-2.5">
                                <span className="text-sm text-gray-300">{p.feature}</span>
                                <span className={`text-sm ${permissionColor[p.permission]}`}>{p.permission}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
