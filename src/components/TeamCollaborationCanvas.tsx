import { useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  type Node,
  type Edge,
  Position,
  MarkerType,
  Handle,
  type NodeProps,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

const agentStatusConfig: Record<string, { label: string; dotColor: string; color: string; borderColor: string }> = {
  working: { label: 'Working', color: 'text-emerald-400', dotColor: 'bg-emerald-400', borderColor: '#34d399' },
  idle: { label: 'Idle', color: 'text-gray-400', dotColor: 'bg-gray-400', borderColor: '#9ca3af' },
  assign_task: { label: 'Assign Task', color: 'text-amber-400', dotColor: 'bg-amber-400', borderColor: '#fbbf24' },
};

interface AgentData {
  id: string;
  name: string;
  emoji: string;
  role: string;
  status: string;
  currentTask: string | null;
}

interface TeamData {
  id: string;
  name: string;
  type: string;
  agents: AgentData[];
}

function AgentNode({ data }: NodeProps) {
  const agent = data as unknown as AgentData & { isManager?: boolean };
  const status = agentStatusConfig[agent.status] || agentStatusConfig.idle;
  const isManager = agent.isManager;

  return (
    <>
      <Handle type="target" position={Position.Left} className="!bg-white/20 !w-2 !h-2 !border-0" />
      <div
        className={`rounded-xl border-2 p-3 transition-shadow hover:shadow-xl hover:shadow-black/30 ${
          isManager ? 'w-[200px]' : 'w-[180px]'
        }`}
        style={{
          background: isManager ? '#1a1a2e' : '#111119',
          borderColor: isManager ? '#6366f150' : status.borderColor + '30',
        }}
      >
        <div className="flex items-center gap-2 mb-1.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: isManager ? '#6366f120' : '#ffffff08' }}
          >
            <span className="text-base">{agent.emoji}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate">{agent.name}</p>
            <p className="text-[9px] text-gray-500 uppercase tracking-wider">{agent.role}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <span
            className={`w-1.5 h-1.5 rounded-full ${status.dotColor} ${agent.status === 'working' ? 'animate-pulse' : ''}`}
          />
          <span className={`text-[10px] font-medium ${status.color}`}>{status.label}</span>
        </div>
        {agent.currentTask && (
          <div className="mt-1.5 pt-1.5 border-t border-white/10">
            <p className="text-[10px] text-gray-400 line-clamp-1 leading-relaxed">{agent.currentTask}</p>
          </div>
        )}
      </div>
      <Handle type="source" position={Position.Right} className="!bg-white/20 !w-2 !h-2 !border-0" />
    </>
  );
}

const nodeTypes = { agentNode: AgentNode };

// Dashed edge style for potential (inactive) relationships
const dashedEdgeStyle = {
  stroke: '#6366f1',
  strokeWidth: 2,
  strokeDasharray: '8 6',
};

// Solid animated edge style for active task delegation
const activeEdgeStyle = {
  stroke: '#6366f1',
  strokeWidth: 2.5,
};

const dashedMarker = {
  type: MarkerType.ArrowClosed as const,
  color: '#6366f1',
  width: 18,
  height: 18,
};

const activeMarker = {
  type: MarkerType.ArrowClosed as const,
  color: '#6366f1',
  width: 20,
  height: 20,
};

function buildWorkflowLayout(agents: AgentData[]): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = agents.map((agent, i) => ({
    id: agent.id,
    type: 'agentNode',
    position: { x: i * 220, y: 40 },
    data: { ...agent },
    draggable: true,
  }));

  // Find the one active delegation: a pair where task is being delegated between agents
  // Priority: assign_task→working (explicit delegation), then working→working
  let activeEdgeIndex = -1;
  for (let i = 0; i < agents.length - 1; i++) {
    if (agents[i].status === 'assign_task' && agents[i + 1].status === 'working') {
      activeEdgeIndex = i;
      break;
    }
  }
  if (activeEdgeIndex === -1) {
    for (let i = 0; i < agents.length - 1; i++) {
      if (agents[i].status === 'working' && agents[i + 1].status === 'working') {
        activeEdgeIndex = i;
        break;
      }
    }
  }
  // Fallback: first working agent's outgoing edge
  if (activeEdgeIndex === -1) {
    for (let i = 0; i < agents.length - 1; i++) {
      if (agents[i].status === 'working' || agents[i].status === 'assign_task') {
        activeEdgeIndex = i;
        break;
      }
    }
  }

  const edges: Edge[] = agents.slice(0, -1).map((agent, i) => {
    const isActive = i === activeEdgeIndex;
    return {
      id: `e-${agent.id}-${agents[i + 1].id}`,
      source: agent.id,
      target: agents[i + 1].id,
      type: 'smoothstep',
      animated: isActive,
      style: isActive ? activeEdgeStyle : dashedEdgeStyle,
      markerEnd: isActive ? activeMarker : dashedMarker,
    };
  });

  return { nodes, edges };
}

function buildManagerLayout(agents: AgentData[]): { nodes: Node[]; edges: Edge[] } {
  const manager = agents.find((a) => a.role === 'Manager');
  const subordinates = agents.filter((a) => a.role !== 'Manager');

  const nodes: Node[] = [];
  const edges: Edge[] = [];

  if (manager) {
    nodes.push({
      id: manager.id,
      type: 'agentNode',
      position: { x: 0, y: subordinates.length > 2 ? ((subordinates.length - 1) * 140) / 2 - 40 : 50 },
      data: { ...manager, isManager: true },
      draggable: true,
    });

    // Pick one active delegation edge: first subordinate that is 'working'
    let activeTargetId: string | null = null;
    for (const sub of subordinates) {
      if (sub.status === 'working') {
        activeTargetId = sub.id;
        break;
      }
    }

    subordinates.forEach((agent, i) => {
      nodes.push({
        id: agent.id,
        type: 'agentNode',
        position: { x: 280, y: i * 140 },
        data: { ...agent },
        draggable: true,
      });

      const isActive = agent.id === activeTargetId;
      edges.push({
        id: `e-${manager.id}-${agent.id}`,
        source: manager.id,
        target: agent.id,
        type: 'smoothstep',
        animated: isActive,
        style: isActive ? activeEdgeStyle : dashedEdgeStyle,
        markerEnd: isActive ? activeMarker : dashedMarker,
      });
    });
  }

  return { nodes, edges };
}

export default function TeamCollaborationCanvas({ team }: { team: TeamData }) {
  const { nodes, edges } = useMemo(() => {
    if (team.type === 'manager') {
      return buildManagerLayout(team.agents);
    }
    return buildWorkflowLayout(team.agents);
  }, [team]);

  return (
    <div className="w-full h-[400px] rounded-xl overflow-hidden" style={{ background: '#0a0a14' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.3}
        maxZoom={1.5}
        proOptions={{ hideAttribution: true }}
        nodesDraggable={true}
        nodesConnectable={false}
        elementsSelectable={true}
        panOnDrag={true}
        zoomOnScroll={true}
      >
        <Background color="#ffffff08" gap={24} size={1} />
        <Controls
          className="!bg-[#1a1a2e] !border-white/10 !rounded-lg [&>button]:!bg-[#1a1a2e] [&>button]:!border-white/10 [&>button]:!text-white [&>button:hover]:!bg-white/10"
          showInteractive={false}
        />
      </ReactFlow>
    </div>
  );
}
