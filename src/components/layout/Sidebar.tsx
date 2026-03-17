import { NavLink } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import {
  LayoutDashboard,
  Bot,
  MessageCircle,
  ClipboardCheck,
  Plug,
  BookOpen,
  Sparkles,
  Activity,
  Wrench,
  ChevronDown,
  ChevronRight,
  Users,
  GitBranch,
  UserCog,
  Store,
  Coins,
  ExternalLink,
  Building2,
} from 'lucide-react';

interface NavItem {
  path: string;
  icon: typeof LayoutDashboard;
  label: string;
  badge?: number;
  external?: boolean;
}

interface NavSection {
  label: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    label: 'AI Workforce',
    items: [
      { path: '/agents', icon: Bot, label: 'Agents' },
      { path: '/teams', icon: Users, label: 'Teams' },
    ],
  },
  {
    label: 'Control',
    items: [
      { path: '/approvals', icon: ClipboardCheck, label: 'Pending Approvals' },
      { path: '/activity', icon: Activity, label: 'Tasks' },
      { path: '/version-control', icon: GitBranch, label: 'Version Control' },
    ],
  },
  {
    label: 'Knowledge',
    items: [
      { path: '/ontology', icon: BookOpen, label: 'Ontology' },
    ],
  },
  {
    label: 'Settings',
    items: [
      { path: '/settings', icon: Wrench, label: 'Config' },
      { path: '/connectors', icon: Plug, label: 'Connectors' },
      { path: '/user-management', icon: UserCog, label: 'User Management' },
    ],
  },
  {
    label: 'Marketplace',
    items: [
      { path: '/marketplace/agents', icon: Store, label: 'Discover Agents', external: true },
      { path: '/marketplace/credits', icon: Coins, label: 'Buy Credits', external: true },
    ],
  },
];

export default function Sidebar() {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleExternalClick = (label: string) => {
    setToast(`Will redirect to Marketplace — ${label}`);
    setTimeout(() => setToast(null), 2500);
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-72 bg-white/[0.02] border-r border-white/5 z-50 flex flex-col">
      <div className="h-14 flex items-center px-4 border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-indigo flex items-center justify-center">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="font-semibold text-white text-sm">AGENT FACTORY</span>
            <p className="text-[10px] text-gray-500 tracking-wide">RUNTIME PLATFORM</p>
          </div>
        </div>
      </div>

      <NavLink
        to="/steward"
        className={({ isActive }) =>
          `mx-3 mt-4 flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 ${
            isActive
              ? 'bg-indigo text-white shadow-lg shadow-indigo/20'
              : 'bg-indigo/10 text-indigo-300 hover:bg-indigo/20'
          }`
        }
      >
        <div className="w-8 h-8 rounded-lg bg-indigo/30 flex items-center justify-center">
          <MessageCircle className="w-4 h-4" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-1.5">
            <span className="font-medium text-sm">Steward</span>
            <Sparkles className="w-3 h-3" />
          </div>
        </div>
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
      </NavLink>

      <nav className="flex-1 py-4 px-3 space-y-5 overflow-y-auto">
        {navSections.map((section) => (
          <div key={section.label}>
            <div className="flex items-center gap-1 px-3 mb-2">
              <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">
                {section.label}
              </span>
              <ChevronDown className="w-3 h-3 text-gray-600" />
            </div>
            <div className="space-y-0.5">
              {section.items.map((item) =>
                item.external ? (
                  <button
                    key={item.path}
                    onClick={() => handleExternalClick(item.label)}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 text-gray-400 hover:bg-white/[0.03] hover:text-gray-300"
                  >
                    <item.icon className="w-4 h-4" />
                    <span className="text-sm">{item.label}</span>
                    <ExternalLink className="w-3 h-3 ml-auto text-gray-600" />
                  </button>
                ) : (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${
                        isActive
                          ? 'bg-white/5 text-white'
                          : 'text-gray-400 hover:bg-white/[0.03] hover:text-gray-300'
                      }`
                    }
                  >
                    <item.icon className="w-4 h-4" />
                    <span className="text-sm">{item.label}</span>
                    {item.badge && (
                      <span className="ml-auto px-1.5 py-0.5 rounded text-[10px] font-medium bg-indigo/20 text-indigo-300">
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                )
              )}
            </div>
          </div>
        ))}
      </nav>

      <div ref={userMenuRef} className="p-3 border-t border-white/5 space-y-3 relative">
        {/* Credits Section */}
        <div className="flex items-center gap-1.5 px-2 py-1">
          <Sparkles className="w-4 h-4 text-yellow-400" />
          <span className="text-sm text-gray-400">Credits</span>
          <span className="text-sm text-white font-medium">2,847</span>
        </div>

        {/* User Button */}
        <button
          onClick={() => setShowUserMenu(!showUserMenu)}
          className="w-full flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-white/5 transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white text-xs font-semibold">
            TZ
          </div>
          <div className="flex-1 min-w-0 text-left">
            <p className="text-sm font-medium text-white truncate">Taylor Zhang</p>
          </div>
          <ChevronRight className={`w-4 h-4 text-gray-500 transition-transform ${showUserMenu ? 'rotate-90' : ''}`} />
        </button>

        {showUserMenu && (
          <div className="absolute bottom-16 left-0 right-0 mx-3 bg-[#1e1e1e] rounded-xl shadow-2xl border border-white/10 overflow-hidden">
            {/* User Info */}
            <div className="px-4 py-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-purple-500 flex items-center justify-center text-white text-lg font-semibold flex-shrink-0">
                  T
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">Taylor Zhang</p>
                  <p className="text-xs text-gray-500 truncate">taylor.zhang@item.com</p>
                </div>
              </div>
            </div>

            <div className="h-px bg-white/10" />

            {/* Menu Items */}
            <div className="py-2">
              <button
                onClick={() => { handleExternalClick('Marketplace'); setShowUserMenu(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/[0.06] transition-colors text-left"
              >
                <Store className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-200">Marketplace</span>
                <ExternalLink className="w-3.5 h-3.5 text-gray-500 ml-auto" />
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/[0.06] transition-colors text-left">
                <Building2 className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-200">ITEM, LLC</span>
              </button>
            </div>

            <div className="h-px bg-white/10" />

            <div className="py-2">
              <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/[0.06] transition-colors text-left">
                <span className="text-sm text-rose-400">Sign Out</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Toast notification */}
      {toast && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2.5 rounded-xl bg-indigo text-white text-xs font-medium shadow-lg shadow-indigo/30 whitespace-nowrap animate-fade-in flex items-center gap-2 z-[60]">
          <ExternalLink className="w-3.5 h-3.5" />
          {toast}
        </div>
      )}
    </aside>
  );
}
