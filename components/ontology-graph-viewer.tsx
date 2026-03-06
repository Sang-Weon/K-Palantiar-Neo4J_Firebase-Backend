"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Network, Eye, Zap, GitBranch, Filter, ZoomIn, ZoomOut, Loader2, Database } from "lucide-react"
import { useState, useEffect } from "react"
import { AIReasoningDialog } from "./ai-reasoning-dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { OntologyService, ObjectType, LinkType } from "@/lib/ontology-service"

// 가시화를 위한 좌표 자동 배치 헬퍼 (대체투자 그래프 대응)
const getPosition = (index: number, level: number) => {
  const spacingX = 220;
  const spacingY = 160;
  const offsetX = 80;

  const x = offsetX + (index % 3) * spacingX + (level % 2 === 0 ? 50 : 0);
  const y = level * spacingY + (index > 2 ? 40 : 0);

  return { x, y };
};

export function OntologyGraphViewer() {
  const [objectTypes, setObjectTypes] = useState<ObjectType[]>([])
  const [linkTypes, setLinkTypes] = useState<LinkType[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [showAIReasoning, setShowAIReasoning] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(0.7)

  useEffect(() => {
    setIsLoading(true)
    const unsubscribeObjects = OntologyService.subscribeToObjectTypes((data) => {
      setObjectTypes(data);
      setIsLoading(false);
    });
    const unsubscribeLinks = OntologyService.subscribeToLinkTypes(setLinkTypes);

    return () => {
      unsubscribeObjects();
      unsubscribeLinks();
    };
  }, []);

  const getLevel = (typeName: string) => {
    const name = typeName.toLowerCase();
    if (name.includes("fund") || name.includes("펀드")) return 0;
    if (name.includes("company") || name.includes("회사") || name.includes("gp") || name.includes("lp")) return 1;
    if (name.includes("project") || name.includes("프로젝트") || name.includes("사업")) return 2;
    if (name.includes("tranche") || name.includes("트랜치")) return 2.5;
    if (name.includes("collateral") || name.includes("담보")) return 3;
    if (name.includes("covenant") || name.includes("약정")) return 3.5;
    if (name.includes("cashflow") || name.includes("현금흐름")) return 4;
    if (name.includes("valuation") || name.includes("평가")) return 5;
    return 3;
  };

  // 객체 데이터를 그래프 노드로 변환
  const nodes = objectTypes.map((obj, index) => {
    const level = getLevel(obj.name);
    return {
      id: obj.name,
      type: obj.name,
      name: obj.name.replace(/_/g, "\n"),
      ...getPosition(index, level),
      level: level,
      status: "정상",
      description: obj.description,
      kpi: obj.properties?.map(p => ({ name: p.name, value: p.type === 'number' ? '98.2%' : 'Active' }))
    }
  });

  const links = linkTypes.map(link => ({
    from: link.fromType,
    to: link.toType,
    label: link.name,
    weight: 3
  }));

  const selectedNode = nodes.find(n => n.id === selectedNodeId);

  const getNodeColor = (typeName: string) => {
    const name = typeName.toLowerCase();
    if (name.includes("fund") || name.includes("펀드")) return "bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.3)]";
    if (name.includes("company") || name.includes("회사") || name.includes("gp")) return "bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)]";
    if (name.includes("project") || name.includes("프로젝트")) return "bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]";
    if (name.includes("tranche") || name.includes("트랜치")) return "bg-amber-500";
    if (name.includes("collateral") || name.includes("담보")) return "bg-cyan-500";
    if (name.includes("covenant") || name.includes("약정")) return "bg-rose-500";
    if (name.includes("cashflow") || name.includes("현금흐름")) return "bg-green-500";
    if (name.includes("valuation") || name.includes("평가")) return "bg-purple-500";
    if (name.includes("lp")) return "bg-orange-500";
    return "bg-zinc-500";
  }

  return (
    <>
      <Card className="bg-zinc-900 border-zinc-800 p-6 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 blur-[120px] -z-1" />

        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Network className="w-6 h-6 text-blue-400" />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-bold">이지자산평가 대체투자 온톨로지</h2>
              <p className="text-xs text-zinc-500">실시간 Firebase 동기화 기반 자산 지식 그래프</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isLoading && <Loader2 className="w-4 h-4 animate-spin text-blue-400" />}
            <Button size="sm" variant="outline" className="border-zinc-700 bg-zinc-800/50" onClick={() => setShowAIReasoning(true)}>
              <Eye className="w-4 h-4 mr-1" />
              AI 가치평가 추론
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => setZoomLevel(prev => Math.max(0.3, prev - 0.1))}>
              <ZoomOut className="w-4 h-4" />
            </Button>
            <span className="text-xs font-mono text-zinc-500 w-10 text-center">{Math.round(zoomLevel * 100)}%</span>
            <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => setZoomLevel(prev => Math.min(1.5, prev + 0.1))}>
              <ZoomIn className="w-4 h-4" />
            </Button>
          </div>
          <div className="h-4 w-[1px] bg-zinc-800" />
          <div className="flex gap-4">
            <div className="flex items-center gap-2 text-[10px] text-zinc-500">
              <div className="w-2 h-2 bg-indigo-500 rounded-full" /> 펀드
            </div>
            <div className="flex items-center gap-2 text-[10px] text-zinc-500">
              <div className="w-2 h-2 bg-emerald-500 rounded-full" /> 프로젝트
            </div>
            <div className="flex items-center gap-2 text-[10px] text-zinc-500">
              <div className="w-2 h-2 bg-amber-500 rounded-full" /> 트랜치
            </div>
            <div className="flex items-center gap-2 text-[10px] text-zinc-500">
              <div className="w-2 h-2 bg-rose-500 rounded-full" /> 약정
            </div>
          </div>
        </div>

        <div className="relative bg-zinc-950/50 rounded-xl border border-zinc-800 h-[500px] overflow-hidden group">
          {nodes.length === 0 && !isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center space-y-3">
              <Database className="w-12 h-12 text-zinc-800" />
              <p className="text-zinc-500 text-sm italic">매핑된 데이터가 없습니다. 온톨로지 위자드를 먼저 실행해 주세요.</p>
            </div>
          )}

          <svg className="w-full h-full cursor-grab active:cursor-grabbing"
            style={{
              transform: `scale(${zoomLevel})`,
              transformOrigin: "center",
              transition: "transform 0.2s ease-out"
            }}
          >
            <defs>
              <marker id="arrow" markerWidth="10" markerHeight="10" refX="25" refY="5" orient="auto">
                <path d="M0,0 L0,10 L10,5 Z" fill="#3f3f46" />
              </marker>
              <filter id="glow">
                <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* 링크 */}
            {links.map((link, i) => {
              const fromNode = nodes.find(n => n.id === link.from);
              const toNode = nodes.find(n => n.id === link.to);
              if (!fromNode || !toNode) return null;
              return (
                <g key={i}>
                  <line x1={fromNode.x} y1={fromNode.y} x2={toNode.x} y2={toNode.y}
                    stroke="#3f3f46" strokeWidth="2" markerEnd="url(#arrow)" />
                  <text x={(fromNode.x + toNode.x) / 2} y={(fromNode.y + toNode.y) / 2 - 10}
                    fill="#71717a" fontSize="9" textAnchor="middle" className="font-mono">{link.label}</text>
                </g>
              )
            })}

            {/* 노드 */}
            {nodes.map((node) => (
              <g key={node.id} className="cursor-pointer" onClick={() => setSelectedNodeId(node.id)}>
                <circle cx={node.x} cy={node.y} r="25"
                  className={`${getNodeColor(node.type)} transition-all duration-300 ${selectedNodeId === node.id ? 'stroke-white stroke-2 scale-110' : 'opacity-80'}`}
                  filter={selectedNodeId === node.id ? "url(#glow)" : ""}
                />
                <text x={node.x} y={node.y + 40} fill="white" fontSize="10" fontWeight="bold" textAnchor="middle" className="pointer-events-none">
                  {node.name.split('\n').map((line, i) => (
                    <tspan key={i} x={node.x} dy={i === 0 ? 0 : "1.2em"}>{line}</tspan>
                  ))}
                </text>
              </g>
            ))}
          </svg>
        </div>

        {selectedNode && (
          <Card className="mt-4 bg-zinc-800/40 border-zinc-700/50 p-4 animate-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${getNodeColor(selectedNode.type)}`} />
                <h3 className="font-bold text-lg">{selectedNode.name}</h3>
              </div>
              <Badge variant="outline" className="text-zinc-500 border-zinc-700 uppercase font-mono text-[10px]">
                Neo4j:Node
              </Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="md:col-span-2">
                <p className="text-xs text-zinc-400 leading-relaxed mb-4">{selectedNode.description}</p>
                <div className="flex gap-2">
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-[11px] h-7">가치평가 분석</Button>
                  <Button size="sm" variant="outline" className="bg-transparent border-zinc-700 text-[11px] h-7">연관 관계 탐색</Button>
                </div>
              </div>
              <div className="space-y-2">
                {selectedNode.kpi?.map((k, i) => (
                  <div key={i} className="bg-black/30 rounded p-2 flex justify-between items-center">
                    <span className="text-[10px] text-zinc-500">{k.name}</span>
                    <span className="text-xs font-bold text-blue-400">{k.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}
      </Card>

      <AIReasoningDialog open={showAIReasoning} onOpenChange={setShowAIReasoning} />
    </>
  )
}
