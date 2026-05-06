interface AgentInfoBannerProps {
  name: string;
  emoji: string;
  description?: string;
}

export default function AgentInfoBanner({ name, emoji, description }: AgentInfoBannerProps) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 mb-3 bg-indigo-500/8 border border-indigo-500/20 rounded-xl">
      <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-base flex-shrink-0">
        {emoji}
      </div>
      <div>
        <div className="text-sm font-semibold text-gray-200">{name}</div>
        {description && <div className="text-xs text-gray-500 mt-0.5">{description}</div>}
      </div>
    </div>
  );
}
