import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// 方案 1: 像素风虚拟办公室
interface Agent {
  id: string;
  name: string;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  status: 'idle' | 'working' | 'thinking' | 'moving';
  color: string;
  deskX?: number;
  deskY?: number;
}

export default function TeamVisualization1() {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [agents, setAgents] = useState<Agent[]>([
    { id: '1', name: 'Research Agent', x: 100, y: 150, targetX: 100, targetY: 150, status: 'idle', color: '#3b82f6', deskX: 100, deskY: 150 },
    { id: '2', name: 'Code Agent', x: 300, y: 150, targetX: 300, targetY: 150, status: 'idle', color: '#10b981', deskX: 300, deskY: 150 },
    { id: '3', name: 'Review Agent', x: 500, y: 150, targetX: 500, targetY: 150, status: 'idle', color: '#f59e0b', deskX: 500, deskY: 150 },
    { id: '4', name: 'Test Agent', x: 200, y: 300, targetX: 200, targetY: 300, status: 'idle', color: '#8b5cf6', deskX: 200, deskY: 300 },
  ]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrame: number;
    let frame = 0;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // 绘制地板网格
      ctx.strokeStyle = '#e5e7eb';
      ctx.lineWidth = 1;
      for (let i = 0; i < canvas.width; i += 40) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
      }
      for (let i = 0; i < canvas.height; i += 40) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
        ctx.stroke();
      }

      // 绘制办公桌
      agents.forEach(agent => {
        if (agent.deskX && agent.deskY) {
          ctx.fillStyle = '#9ca3af';
          ctx.fillRect(agent.deskX - 20, agent.deskY - 15, 40, 30);
          ctx.fillStyle = '#6b7280';
          ctx.fillRect(agent.deskX - 18, agent.deskY - 13, 36, 26);
        }
      });

      // 绘制 Agents
      agents.forEach(agent => {
        // 身体（像素风格）
        ctx.fillStyle = agent.color;
        ctx.fillRect(agent.x - 8, agent.y - 16, 16, 24);
        
        // 头部
        ctx.fillStyle = agent.status === 'thinking' ? '#fbbf24' : agent.color;
        ctx.fillRect(agent.x - 6, agent.y - 20, 12, 8);
        
        // 眼睛
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(agent.x - 4, agent.y - 18, 3, 3);
        ctx.fillRect(agent.x + 1, agent.y - 18, 3, 3);
        
        // 状态指示
        if (agent.status === 'working') {
          // 打字动画
          const offset = Math.sin(frame * 0.2) * 2;
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(agent.x - 10, agent.y + 10 + offset, 4, 4);
          ctx.fillRect(agent.x - 4, agent.y + 10 + offset, 4, 4);
          ctx.fillRect(agent.x + 2, agent.y + 10 + offset, 4, 4);
        } else if (agent.status === 'thinking') {
          // 思考气泡
          ctx.fillStyle = '#ffffff';
          ctx.strokeStyle = agent.color;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(agent.x + 15, agent.y - 25, 12, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = agent.color;
          ctx.fillText('...', agent.x + 10, agent.y - 22);
        }
        
        // 名字标签
        ctx.fillStyle = '#1f2937';
        ctx.font = '10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(agent.name, agent.x, agent.y + 20);
      });

      frame++;
      animationFrame = requestAnimationFrame(draw);
    };

    draw();

    return () => cancelAnimationFrame(animationFrame);
  }, [agents]);

  // 模拟 Agent 状态变化
  useEffect(() => {
    const interval = setInterval(() => {
      setAgents(prev => prev.map(agent => {
        const statuses: Agent['status'][] = ['idle', 'working', 'thinking', 'moving'];
        const newStatus = statuses[Math.floor(Math.random() * statuses.length)];
        
        if (newStatus === 'moving' && agent.deskX && agent.deskY) {
          // 随机走动
          const randomX = Math.random() * 600 + 50;
          const randomY = Math.random() * 350 + 50;
          return { ...agent, status: newStatus, targetX: randomX, targetY: randomY };
        }
        
        return { ...agent, status: newStatus };
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // 移动动画
  useEffect(() => {
    const interval = setInterval(() => {
      setAgents(prev => prev.map(agent => {
        if (agent.status === 'moving') {
          const dx = agent.targetX - agent.x;
          const dy = agent.targetY - agent.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 2) {
            return { ...agent, x: agent.targetX, y: agent.targetY, status: 'idle' };
          }
          
          const speed = 2;
          return {
            ...agent,
            x: agent.x + (dx / distance) * speed,
            y: agent.y + (dy / distance) * speed,
          };
        }
        return agent;
      }));
    }, 50);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <button onClick={() => navigate(-1)} className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-900">
        <ArrowLeft size={20} />
        返回
      </button>
      
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-2">方案 1: 像素风虚拟办公室</h1>
        <p className="text-gray-600 mb-6">每个 Agent 是像素角色，在办公室场景中移动和工作</p>
        
        <div className="border-4 border-gray-800 rounded-lg overflow-hidden bg-gray-100">
          <canvas 
            ref={canvasRef} 
            width={700} 
            height={400}
            className="w-full"
          />
        </div>
        
        <div className="mt-4 grid grid-cols-4 gap-4">
          {agents.map(agent => (
            <div key={agent.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: agent.color }} />
              <div className="flex-1">
                <div className="text-sm font-medium">{agent.name}</div>
                <div className="text-xs text-gray-500">{agent.status}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
