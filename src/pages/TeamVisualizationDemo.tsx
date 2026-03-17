import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Gamepad2, GitBranch, LayoutGrid } from 'lucide-react';

export default function TeamVisualizationDemo() {
  const navigate = useNavigate();

  const demos = [
    {
      id: 1,
      title: '方案 1: 像素风虚拟办公室',
      description: 'Agent 是像素角色，在办公室场景中移动和工作',
      icon: Gamepad2,
      color: 'from-blue-500 to-cyan-500',
      path: '/team-viz-1'
    },
    {
      id: 2,
      title: '方案 2: 流程图式协作视图',
      description: '用节点和连线展示 Agent 协作关系和数据流',
      icon: GitBranch,
      color: 'from-purple-500 to-pink-500',
      path: '/team-viz-2'
    },
    {
      id: 3,
      title: '方案 3: 混合式场景卡片',
      description: '场景卡片 + 状态指示器，平衡趣味性和信息密度',
      icon: LayoutGrid,
      color: 'from-orange-500 to-red-500',
      path: '/team-viz-3'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">AI Teams 可视化方案</h1>
          <p className="text-lg text-gray-600">点击查看三种不同的 UI 展示方案</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {demos.map(demo => {
            const Icon = demo.icon;
            return (
              <div
                key={demo.id}
                onClick={() => navigate(demo.path)}
                className="group cursor-pointer"
              >
                <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:-translate-y-2">
                  {/* 渐变头部 */}
                  <div className={`h-32 bg-gradient-to-br ${demo.color} flex items-center justify-center relative overflow-hidden`}>
                    <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity" />
                    <Icon size={64} className="text-white relative z-10" />
                  </div>

                  {/* 内容 */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{demo.title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{demo.description}</p>
                  </div>

                  {/* 底部按钮 */}
                  <div className="px-6 pb-6">
                    <button className="w-full py-3 bg-gray-100 group-hover:bg-gray-900 text-gray-700 group-hover:text-white rounded-lg transition-all duration-300 font-medium">
                      查看演示
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 说明 */}
        <div className="mt-12 bg-white rounded-xl shadow-md p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-3">关于这些方案</h2>
          <div className="space-y-2 text-sm text-gray-600">
            <p><strong>方案 1</strong> 适合趣味性产品，像 Pixel Agents 那样用动画角色展示</p>
            <p><strong>方案 2</strong> 适合 B 端产品，清晰展示复杂的协作逻辑</p>
            <p><strong>方案 3</strong> 适合快速落地，平衡视觉效果和开发成本</p>
          </div>
        </div>
      </div>
    </div>
  );
}
