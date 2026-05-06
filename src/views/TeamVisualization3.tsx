'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Users, Brain, Code, Search, CheckCircle, Loader, FileText, MessageSquare } from 'lucide-react';

// 方案 3: 混合式场景卡片 - 单个 Team 视图
interface Agent {
  id: string;
  name: string;
  status: 'idle' | 'working' | 'thinking' | 'completed';
  icon: any;
  task: string;
}

export default function TeamVisualization3() {
  const router = useRouter();
  const [team, setTeam] = useState({
    name: 'Product Development Team',
    description: 'AI 驱动的产品开发协作团队',
    progress: 65,
  });

  const [agents, setAgents] = useState<Agent[]>([
    { id: '1', name: 'Research Agent', status: 'completed', icon: Search, task: '市场调研' },
    { id: '2', name: 'Design Agent', status: 'completed', icon: Brain, task: 'UI 设计' },
    { id: '3', name: 'Frontend Agent', status: 'working', icon: Code, task: '前端开发' },
    { id: '4', name: 'Backend Agent', status: 'thinking', icon: FileText, task: 'API 开发' },
    { id: '5', name: 'Review Agent', status: 'idle', icon: CheckCircle, task: '代码审查' },
    { id: '6', name: 'Communication Agent', status: 'idle', icon: MessageSquare, task: '文档编写' },
  ]);

  // 模拟状态变化
  useEffect(() => {
    const interval = setInterval(() => {
      setAgents(prev => prev.map(agent => {
        if (Math.random() > 0.7) {
          const statuses: typeof agent.status[] = ['idle', 'working', 'thinking', 'completed'];
          return { ...agent, status: statuses[Math.floor(Math.random() * statuses.length)] };
        }
        return agent;
      }));
      
      setTeam(prev => ({
        ...prev,
        progress: Math.min(100, prev.progress + Math.random() * 3)
      }));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle size={16} className="text-green-500" />;
      case 'working': return <Loader size={16} className="text-blue-500 animate-spin" />;
      case 'thinking': return <Brain size={16} className="text-purple-500 animate-pulse" />;
      default: return <div className="w-4 h-4 rounded-full bg-gray-300" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'border-green-500 bg-green-50';
      case 'working': return 'border-blue-500 bg-blue-50';
      case 'thinking': return 'border-purple-500 bg-purple-50';
      default: return 'border-gray-300 bg-gray-50';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <button onClick={() => router.back()} className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-900">
        <ArrowLeft size={20} />
        返回
      </button>
      
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Team 头部 */}
          <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 p-8 text-white relative overflow-hidden">
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
              <div className="absolute bottom-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-3">
                <Users size={32} />
                <h1 className="text-3xl font-bold">{team.name}</h1>
              </div>
              <p className="text-blue-100 text-lg">{team.description}</p>
              
              {/* 整体进度 */}
              <div className="mt-6">
                <div className="flex justify-between text-sm mb-2">
                  <span>整体进度</span>
                  <span className="font-bold">{Math.round(team.progress)}%</span>
                </div>
                <div className="w-full bg-white/30 rounded-full h-3 overflow-hidden backdrop-blur">
                  <div 
                    className="bg-white h-full transition-all duration-500 rounded-full shadow-lg"
                    style={{ width: `${team.progress}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Agent 场景区域 */}
          <div className="p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-purple-500 rounded" />
              Team Members
            </h2>

            {/* 场景容器 */}
            <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 border-2 border-gray-200 min-h-[400px]">
              {/* 装饰性背景元素 - 模拟办公环境 */}
              <div className="absolute inset-0 overflow-hidden rounded-2xl opacity-5">
                <div className="grid grid-cols-6 gap-4 p-4">
                  {[...Array(18)].map((_, i) => (
                    <div key={i} className="bg-gray-400 rounded-lg h-12" />
                  ))}
                </div>
              </div>

              {/* Agent 卡片网格 */}
              <div className="relative grid grid-cols-2 lg:grid-cols-3 gap-4">
                {agents.map((agent, idx) => {
                  const Icon = agent.icon;
                  return (
                    <div 
                      key={agent.id} 
                      className={`group relative bg-white rounded-xl border-2 ${getStatusColor(agent.status)} transition-all duration-300 hover:scale-105 hover:shadow-xl`}
                      style={{ 
                        animationDelay: `${idx * 0.1}s`,
                      }}
                    >
                      {/* 状态指示灯 */}
                      <div className={`absolute -top-2 -right-2 w-6 h-6 rounded-full border-3 border-white shadow-lg ${
                        agent.status === 'completed' ? 'bg-green-500' : 
                        agent.status === 'working' ? 'bg-blue-500 animate-pulse' : 
                        agent.status === 'thinking' ? 'bg-purple-500 animate-pulse' : 
                        'bg-gray-400'
                      }`} />

                      <div className="p-4">
                        {/* Agent 图标 */}
                        <div className={`w-16 h-16 mx-auto mb-3 rounded-xl flex items-center justify-center ${
                          agent.status === 'completed' ? 'bg-green-100' : 
                          agent.status === 'working' ? 'bg-blue-100' : 
                          agent.status === 'thinking' ? 'bg-purple-100' : 
                          'bg-gray-100'
                        }`}>
                          <Icon size={32} className={
                            agent.status === 'completed' ? 'text-green-600' : 
                            agent.status === 'working' ? 'text-blue-600' : 
                            agent.status === 'thinking' ? 'text-purple-600' : 
                            'text-gray-400'
                          } />
                        </div>

                        {/* Agent 信息 */}
                        <div className="text-center">
                          <h3 className="font-bold text-gray-900 mb-1">{agent.name}</h3>
                          <p className="text-xs text-gray-500 mb-2">{agent.task}</p>
                          
                          {/* 状态标签 */}
                          <div className="flex items-center justify-center gap-1">
                            {getStatusIcon(agent.status)}
                            <span className="text-xs font-medium capitalize text-gray-600">
                              {agent.status}
                            </span>
                          </div>
                        </div>

                        {/* 工作动画效果 */}
                        {agent.status === 'working' && (
                          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 统计信息 */}
            <div className="mt-6 grid grid-cols-4 gap-4">
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <div className="text-2xl font-bold text-green-600">{agents.filter(a => a.status === 'completed').length}</div>
                <div className="text-sm text-gray-600">已完成</div>
              </div>
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="text-2xl font-bold text-blue-600">{agents.filter(a => a.status === 'working').length}</div>
                <div className="text-sm text-gray-600">工作中</div>
              </div>
              <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                <div className="text-2xl font-bold text-purple-600">{agents.filter(a => a.status === 'thinking').length}</div>
                <div className="text-sm text-gray-600">思考中</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="text-2xl font-bold text-gray-600">{agents.filter(a => a.status === 'idle').length}</div>
                <div className="text-sm text-gray-600">空闲</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
