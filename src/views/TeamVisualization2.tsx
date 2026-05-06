'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Zap, Database, Mail, FileText } from 'lucide-react';

// 方案 2: 流程图式协作视图
interface AgentNode {
  id: string;
  name: string;
  type: 'lead' | 'specialist';
  status: 'idle' | 'working' | 'completed' | 'waiting';
  x: number;
  y: number;
  icon: any;
}

interface Connection {
  from: string;
  to: string;
  label: string;
  active: boolean;
}

export default function TeamVisualization2() {
  const router = useRouter();
  const [nodes] = useState<AgentNode[]>([
    { id: 'lead', name: 'Team Lead', type: 'lead', status: 'working', x: 50, y: 20, icon: Zap },
    { id: 'research', name: 'Research Agent', type: 'specialist', status: 'completed', x: 20, y: 60, icon: Database },
    { id: 'code', name: 'Code Agent', type: 'specialist', status: 'working', x: 50, y: 60, icon: FileText },
    { id: 'review', name: 'Review Agent', type: 'specialist', status: 'waiting', x: 80, y: 60, icon: Mail },
  ]);

  const [connections, setConnections] = useState<Connection[]>([
    { from: 'lead', to: 'research', label: 'Task: 调研', active: false },
    { from: 'lead', to: 'code', label: 'Task: 实现', active: true },
    { from: 'lead', to: 'review', label: 'Task: 审查', active: false },
    { from: 'research', to: 'code', label: 'Data', active: true },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setConnections(prev => prev.map(conn => ({
        ...conn,
        active: Math.random() > 0.5
      })));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'working': return 'bg-blue-500';
      case 'waiting': return 'bg-gray-400';
      default: return 'bg-gray-300';
    }
  };

  const getStatusBorder = (status: string) => {
    switch (status) {
      case 'completed': return 'border-green-500';
      case 'working': return 'border-blue-500 animate-pulse';
      case 'waiting': return 'border-gray-400';
      default: return 'border-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <button onClick={() => router.back()} className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-900">
        <ArrowLeft size={20} />
        返回
      </button>
      
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-2">方案 2: 流程图式协作视图</h1>
        <p className="text-gray-600 mb-6">用节点和连线展示 Agent 协作关系和数据流</p>
        
        <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-8 border-2 border-gray-200" style={{ height: '500px' }}>
          {/* SVG 连接线 */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {connections.map((conn, idx) => {
              const fromNode = nodes.find(n => n.id === conn.from);
              const toNode = nodes.find(n => n.id === conn.to);
              if (!fromNode || !toNode) return null;
              
              const x1 = fromNode.x;
              const y1 = fromNode.y;
              const x2 = toNode.x;
              const y2 = toNode.y;
              
              return (
                <g key={idx}>
                  <line
                    x1={`${x1}%`}
                    y1={`${y1}%`}
                    x2={`${x2}%`}
                    y2={`${y2}%`}
                    stroke={conn.active ? '#3b82f6' : '#d1d5db'}
                    strokeWidth={conn.active ? '3' : '2'}
                    strokeDasharray={conn.active ? '0' : '5,5'}
                    markerEnd="url(#arrowhead)"
                  />
                  {conn.active && (
                    <circle r="4" fill="#3b82f6">
                      <animateMotion dur="2s" repeatCount="indefinite">
                        <mpath href={`#path${idx}`} />
                      </animateMotion>
                    </circle>
                  )}
                  <path id={`path${idx}`} d={`M ${x1},${y1} L ${x2},${y2}`} fill="none" />
                </g>
              );
            })}
            <defs>
              <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                <polygon points="0 0, 10 3, 0 6" fill="#3b82f6" />
              </marker>
            </defs>
          </svg>

          {/* Agent 节点 */}
          {nodes.map(node => {
            const Icon = node.icon;
            return (
              <div
                key={node.id}
                className={`absolute transform -translate-x-1/2 -translate-y-1/2 ${node.type === 'lead' ? 'w-32 h-32' : 'w-28 h-28'}`}
                style={{ left: `${node.x}%`, top: `${node.y}%` }}
              >
                <div className={`w-full h-full rounded-xl border-4 ${getStatusBorder(node.status)} bg-white shadow-lg flex flex-col items-center justify-center p-3 relative`}>
                  <div className={`absolute -top-2 -right-2 w-6 h-6 rounded-full ${getStatusColor(node.status)} border-2 border-white`} />
                  <Icon size={node.type === 'lead' ? 32 : 28} className="text-gray-700 mb-2" />
                  <div className="text-xs font-bold text-center text-gray-800">{node.name}</div>
                  <div className="text-xs text-gray-500 mt-1">{node.status}</div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 grid grid-cols-4 gap-3">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-sm">Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="text-sm">Working</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gray-400" />
            <span className="text-sm">Waiting</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gray-300" />
            <span className="text-sm">Idle</span>
          </div>
        </div>
      </div>
    </div>
  );
}
