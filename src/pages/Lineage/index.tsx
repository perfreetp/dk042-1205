import { useState, useRef, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ZoomIn,
  ZoomOut,
  Maximize2,
  RefreshCw,
  ChevronRight,
  ChevronLeft,
  Database,
  Eye,
  FileText,
  Code,
  Layers,
} from 'lucide-react';
import { useAssetStore } from '@/store/useAssetStore';
import { generateLineageData } from '@/data/mockData';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import {
  cn,
  getQualityColor,
  getQualityLabel,
} from '@/utils';
import type { LineageNode, NodeType } from '@/types';

const nodeTypeIcons: Record<NodeType, React.ElementType> = {
  table: Database,
  view: Eye,
  api: Code,
  report: FileText,
};

const nodeTypeColors: Record<NodeType, string> = {
  table: 'from-cyan-500 to-blue-500',
  view: 'from-emerald-500 to-teal-500',
  api: 'from-amber-500 to-orange-500',
  report: 'from-violet-500 to-purple-500',
};

const nodeTypeLabels: Record<NodeType, string> = {
  table: '数据表',
  view: '视图',
  api: 'API',
  report: '报表',
};

interface LineageNodeCardProps {
  node: LineageNode;
  isCenter?: boolean;
  isSelected?: boolean;
  onClick: () => void;
}

function LineageNodeCard({ node, isCenter = false, isSelected = false, onClick }: LineageNodeCardProps) {
  const Icon = nodeTypeIcons[node.type];

  return (
    <div
      onClick={onClick}
      className={cn(
        'relative cursor-pointer transition-all duration-300 group',
        isCenter ? 'w-56' : 'w-44'
      )}
    >
      <div
        className={cn(
          'rounded-xl border backdrop-blur-sm p-4 transition-all duration-300',
          isCenter
            ? 'bg-dark-bg-800/90 border-tech-cyan-500/50 shadow-lg shadow-tech-cyan-500/20 scale-105'
            : isSelected
            ? 'bg-dark-bg-800/80 border-tech-cyan-400/50'
            : 'bg-dark-bg-800/60 border-dark-bg-600/50 hover:border-tech-cyan-500/40 hover:bg-dark-bg-800/80',
          'hover:shadow-lg hover:shadow-tech-cyan-500/10 hover:-translate-y-0.5'
        )}
      >
        {isCenter && (
          <div className="absolute -inset-1 bg-gradient-to-r from-tech-cyan-500/20 via-deep-blue-500/20 to-tech-cyan-500/20 rounded-xl -z-10 animate-pulse-slow" />
        )}

        <div className="flex items-start gap-3">
          <div
            className={cn(
              'w-10 h-10 rounded-lg bg-gradient-to-br flex items-center justify-center flex-shrink-0',
              nodeTypeColors[node.type],
              isCenter && 'node-pulse'
            )}
          >
            <Icon className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className={cn(
              'font-medium truncate',
              isCenter ? 'text-base text-slate-100' : 'text-sm text-slate-200'
            )}>
              {node.name}
            </div>
            <div className="text-xs text-slate-500 mt-0.5 truncate">
              {node.system}
            </div>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-dark-bg-700/50 flex items-center justify-between">
          <Badge size="sm" variant="default">
            {nodeTypeLabels[node.type]}
          </Badge>
          <div className="text-xs text-slate-500">
            第 {Math.abs(node.level) + 1} 层
          </div>
        </div>

        {isCenter && (
          <div className="absolute -top-2 -right-2">
            <Badge variant="cyan">当前</Badge>
          </div>
        )}
      </div>
    </div>
  );
}

function ConnectionLine({
  fromX,
  fromY,
  toX,
  toY,
  isHighlighted = false,
}: {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  isHighlighted?: boolean;
}) {
  const midX = (fromX + toX) / 2;

  return (
    <path
      d={`M ${fromX} ${fromY} C ${midX} ${fromY}, ${midX} ${toY}, ${toX} ${toY}`}
      fill="none"
      stroke={isHighlighted ? 'rgba(6, 182, 212, 0.6)' : 'rgba(100, 116, 139, 0.3)'}
      strokeWidth={isHighlighted ? 2 : 1.5}
      strokeDasharray={isHighlighted ? 'none' : '4 4'}
      className="transition-all duration-300"
    />
  );
}

export default function Lineage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { assets } = useAssetStore();
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentAsset = assets.find((a) => a.id === id);
  const lineageData = id ? generateLineageData(id) : { nodes: [], edges: [] };

  // 按层级分组节点
  const nodesByLevel = lineageData.nodes.reduce((acc, node) => {
    if (!acc[node.level]) acc[node.level] = [];
    acc[node.level].push(node);
    return acc;
  }, {} as Record<number, LineageNode[]>);

  const levels = Object.keys(nodesByLevel)
    .map(Number)
    .sort((a, b) => a - b);

  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.1, 1.5));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.1, 0.5));
  const handleReset = () => {
    setZoom(1);
    setSelectedNode(null);
  };

  const handleNodeClick = (nodeId: string) => {
    if (nodeId === id) return;
    setSelectedNode(nodeId);
  };

  const selectedNodeData = lineageData.nodes.find((n) => n.id === selectedNode);

  // 计算连接线坐标
  const getNodePosition = (nodeId: string) => {
    const node = lineageData.nodes.find((n) => n.id === nodeId);
    if (!node) return { x: 0, y: 0 };

    const levelIndex = levels.indexOf(node.level);
    const levelNodes = nodesByLevel[node.level] || [];
    const nodeIndex = levelNodes.findIndex((n) => n.id === nodeId);

    const levelWidth = 280;
    const nodeHeight = 100;
    const nodeGap = 24;

    const x = levelIndex * levelWidth + 140;
    const totalHeight = levelNodes.length * nodeHeight + (levelNodes.length - 1) * nodeGap;
    const startY = (600 - totalHeight) / 2;
    const y = startY + nodeIndex * (nodeHeight + nodeGap) + nodeHeight / 2;

    return { x, y };
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg border border-dark-bg-600 text-slate-400 hover:bg-dark-bg-700 hover:text-slate-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-100">血缘视图</h1>
            <p className="text-sm text-slate-500">
              {currentAsset ? currentAsset.name : '数据资产'} 的上下游血缘关系
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleZoomOut}
            className="p-2 rounded-lg border border-dark-bg-600 text-slate-400 hover:bg-dark-bg-700 hover:text-slate-200 transition-colors"
            title="缩小"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-sm text-slate-500 w-12 text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={handleZoomIn}
            className="p-2 rounded-lg border border-dark-bg-600 text-slate-400 hover:bg-dark-bg-700 hover:text-slate-200 transition-colors"
            title="放大"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={handleReset}
            className="p-2 rounded-lg border border-dark-bg-600 text-slate-400 hover:bg-dark-bg-700 hover:text-slate-200 transition-colors"
            title="重置"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button className="p-2 rounded-lg border border-dark-bg-600 text-slate-400 hover:bg-dark-bg-700 hover:text-slate-200 transition-colors ml-2">
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 flex gap-6 min-h-0">
        {/* Graph Area */}
        <Card className="flex-1 overflow-hidden relative">
          <div className="absolute inset-0 bg-grid opacity-50" />

          <div
            ref={containerRef}
            className="absolute inset-0 overflow-auto p-8"
          >
            <div
              className="relative transition-transform duration-300"
              style={{
                transform: `scale(${zoom})`,
                transformOrigin: 'top left',
                width: levels.length * 280 + 100,
                minWidth: '100%',
              }}
            >
              {/* SVG for connections */}
              <svg
                className="absolute inset-0 pointer-events-none"
                style={{ width: levels.length * 280 + 200, height: 600 }}
              >
                {lineageData.edges.map((edge, index) => {
                  const fromPos = getNodePosition(edge.source);
                  const toPos = getNodePosition(edge.target);
                  const isHighlighted =
                    selectedNode === edge.source || selectedNode === edge.target ||
                    edge.source === id || edge.target === id;

                  return (
                    <ConnectionLine
                      key={index}
                      fromX={fromPos.x}
                      fromY={fromPos.y}
                      toX={toPos.x}
                      toY={toPos.y}
                      isHighlighted={isHighlighted || selectedNode === null}
                    />
                  );
                })}
              </svg>

              {/* Nodes */}
              <div className="relative" style={{ height: 600 }}>
                {levels.map((level) => {
                  const levelNodes = nodesByLevel[level] || [];
                  const totalHeight = levelNodes.length * 100 + (levelNodes.length - 1) * 24;
                  const startY = (600 - totalHeight) / 2;
                  const levelIndex = levels.indexOf(level);

                  return (
                    <div
                      key={level}
                      className="absolute flex flex-col gap-6"
                      style={{
                        left: levelIndex * 280,
                        top: startY,
                      }}
                    >
                      {levelNodes.map((node) => (
                        <LineageNodeCard
                          key={node.id}
                          node={node}
                          isCenter={node.id === id}
                          isSelected={selectedNode === node.id}
                          onClick={() => handleNodeClick(node.id)}
                        />
                      ))}
                    </div>
                  );
                })}
              </div>

              {/* Level labels */}
              <div className="absolute -top-6 left-0 right-0 flex">
                {levels.map((level, index) => (
                  <div
                    key={level}
                    className="text-xs text-slate-500 font-medium"
                    style={{ width: 280, textAlign: 'center' }}
                  >
                    {level < 0 ? `上游 ${Math.abs(level)} 层` : level > 0 ? `下游 ${level} 层` : '当前资产'}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="absolute bottom-4 left-4 flex items-center gap-4 p-3 bg-dark-bg-800/80 backdrop-blur-sm rounded-lg border border-dark-bg-700/50">
            <span className="text-xs text-slate-500">图例:</span>
            {(['table', 'view', 'api', 'report'] as NodeType[]).map((type) => {
              const Icon = nodeTypeIcons[type];
              return (
                <div key={type} className="flex items-center gap-1.5">
                  <div className={`w-4 h-4 rounded bg-gradient-to-br ${nodeTypeColors[type]}`}>
                    <Icon className="w-3 h-3 text-white m-0.5" />
                  </div>
                  <span className="text-xs text-slate-400">{nodeTypeLabels[type]}</span>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Side Panel */}
        {selectedNodeData && (
          <Card className="w-72 flex-shrink-0 p-5 animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-200">节点详情</h3>
              <button
                onClick={() => setSelectedNode(null)}
                className="text-slate-500 hover:text-slate-300"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <div className="text-xs text-slate-500 mb-1">名称</div>
                <div className="text-sm font-medium text-slate-200">
                  {selectedNodeData.name}
                </div>
              </div>

              <div>
                <div className="text-xs text-slate-500 mb-1">类型</div>
                <Badge variant="cyan">{nodeTypeLabels[selectedNodeData.type]}</Badge>
              </div>

              <div>
                <div className="text-xs text-slate-500 mb-1">所属系统</div>
                <div className="text-sm text-slate-300">{selectedNodeData.system}</div>
              </div>

              <div>
                <div className="text-xs text-slate-500 mb-1">层级</div>
                <div className="text-sm text-slate-300">
                  {selectedNodeData.level < 0
                    ? `上游第 ${Math.abs(selectedNodeData.level)} 层`
                    : selectedNodeData.level > 0
                    ? `下游第 ${selectedNodeData.level} 层`
                    : '当前节点'}
                </div>
              </div>

              <div className="pt-4 border-t border-dark-bg-700/50">
                <Link
                  to={`/asset/${selectedNodeData.id}`}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-tech-cyan-500 text-white text-sm font-medium rounded-lg hover:bg-tech-cyan-600 transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  查看详情
                </Link>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Stats bar */}
      <div className="mt-4 grid grid-cols-4 gap-4">
        <Card className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-tech-cyan-500/10 flex items-center justify-center">
            <Database className="w-5 h-5 text-tech-cyan-400" />
          </div>
          <div>
            <div className="text-lg font-bold text-slate-100">
              {lineageData.nodes.length}
            </div>
            <div className="text-xs text-slate-500">节点总数</div>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
            <ChevronLeft className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <div className="text-lg font-bold text-slate-100">
              {lineageData.nodes.filter((n) => n.level < 0).length}
            </div>
            <div className="text-xs text-slate-500">上游节点</div>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
            <ChevronRight className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <div className="text-lg font-bold text-slate-100">
              {lineageData.nodes.filter((n) => n.level > 0).length}
            </div>
            <div className="text-xs text-slate-500">下游节点</div>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center">
            <Layers className="w-5 h-5 text-violet-400" />
          </div>
          <div>
            <div className="text-lg font-bold text-slate-100">
              {levels.length}
            </div>
            <div className="text-xs text-slate-500">层级数</div>
          </div>
        </Card>
      </div>
    </div>
  );
}
