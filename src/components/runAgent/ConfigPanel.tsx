import { Pencil } from 'lucide-react';
import type { ConfigField } from '../../data/runAgentScenarios';

interface ConfigPanelProps {
  agentName: string;
  agentDescription: string;
  fields: ConfigField[];
  highlightFields?: string[];
  editing?: boolean;
  onFieldChange?: (name: string, value: string) => void;
  onEditStart?: () => void;
  onEditCancel?: () => void;
  onSave?: () => void;
}

export default function ConfigPanel({
  agentName,
  agentDescription,
  fields,
  highlightFields = [],
  editing = true,
  onFieldChange,
  onEditStart,
  onEditCancel,
  onSave,
}: ConfigPanelProps) {
  const allRequiredFilled = fields
    .filter((f) => f.required)
    .every((f) => f.value.trim() !== '');

  const filledCount = fields.filter((f) => f.value.trim()).length;

  return (
    <div className="flex flex-col h-full">
      {/* Agent header */}
      <div className="px-5 pt-4 pb-3 border-b border-white/5 flex-shrink-0">
        <h2 className="text-sm font-semibold text-white mb-0.5">{agentName}</h2>
        <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{agentDescription}</p>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        {/* Title row: label + count + edit */}
        <div className="border-b border-white/5">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-300">Environment Configuration</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-white/5 text-gray-500">
                {filledCount}/{fields.length}
              </span>
            </div>
            {!editing && (
              <button
                onClick={onEditStart}
                className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium text-gray-400 hover:text-indigo-300 hover:bg-indigo/10 transition-colors"
              >
                <Pencil className="w-3 h-3" />
                Edit
              </button>
            )}
          </div>

          {/* Config fields */}
          <div className="px-4 pb-3 space-y-2">
            {fields.map((field) => (
              <div
                key={field.name}
                className={`py-2 px-3 rounded-lg bg-black/40 transition-colors ${
                  highlightFields.includes(field.name) ? 'animate-flash-green' : ''
                }`}
              >
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs font-medium text-gray-300">
                    {field.label}
                    {editing && field.required && !field.value.trim() && (
                      <span className="text-rose-400 ml-0.5">*</span>
                    )}
                  </span>
                  {field.value.trim() ? (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-emerald-500/15 text-emerald-400">FILLED</span>
                  ) : field.required ? (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-rose-500/15 text-rose-400">REQUIRED</span>
                  ) : (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-white/5 text-gray-500">OPTIONAL</span>
                  )}
                </div>
                {editing ? (
                  <input
                    type="text"
                    value={field.value}
                    onChange={(e) => onFieldChange?.(field.name, e.target.value)}
                    placeholder={field.placeholder}
                    className={`w-full h-7 px-2 rounded-lg bg-white/[0.03] text-xs text-white placeholder-gray-600 focus:outline-none transition-colors ${
                      field.required && !field.value.trim()
                        ? 'border border-rose-500/20 focus:border-rose-500/40'
                        : 'border border-white/[0.06] focus:border-indigo/40'
                    }`}
                  />
                ) : (
                  <p className="text-[11px] text-gray-500 truncate">
                    {field.value || <span className="italic text-gray-600">—</span>}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom action — same position as ParamStatePanel's Confirm/Run */}
      <div className="px-4 py-3 border-t border-white/5 flex-shrink-0">
        <button
          onClick={onSave}
          className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold transition-all ${
            allRequiredFilled
              ? 'bg-gradient-to-r from-indigo to-[#7F43AD] text-white hover:opacity-90'
              : 'bg-white/5 text-gray-500 cursor-not-allowed'
          }`}
        >
          Save Configuration
        </button>
      </div>
    </div>
  );
}
