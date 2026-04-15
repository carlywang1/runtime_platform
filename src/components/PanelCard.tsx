import { ChevronDown } from 'lucide-react';

interface PanelCardProps {
  icon: React.ElementType;
  iconClass: string;
  title: string;
  onClick: () => void;
  isActive: boolean;
}

export default function PanelCard({ icon: Icon, iconClass, title, onClick, isActive }: PanelCardProps) {
  return (
    <button
      onClick={onClick}
      className={`mt-2 w-full flex items-center gap-2 px-2.5 py-2 rounded-lg border transition-all text-left cursor-pointer ${
        isActive
          ? 'bg-indigo/[0.06] border-indigo/30 border-l-2 border-l-indigo'
          : 'bg-white/[0.02] border-white/[0.06] hover:border-white/[0.12] hover:bg-white/[0.04]'
      }`}
    >
      <div className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 ${iconClass}`}>
        <Icon className="w-3 h-3" />
      </div>
      <span className="flex-1 min-w-0 text-[11px] font-medium text-gray-300 truncate">{title}</span>
      {isActive ? (
        <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-indigo/20 text-indigo-300 flex-shrink-0">Open</span>
      ) : (
        <ChevronDown className="w-3 h-3 -rotate-90 text-gray-600 flex-shrink-0" />
      )}
    </button>
  );
}
