"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Database, 
  ArrowUpRight, 
  ArrowDownRight, 
  CheckCircle2, 
  Clock, 
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Minus,
  FileText,
  Activity,
  Layers,
  AlertCircle,
  History
} from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, Cell, ReferenceLine } from "recharts"

interface WritebackRecord {
  id: string
  timestamp: Date
  category: "demand" | "quality" | "logistics"
  scenario: string
  status: "completed" | "pending" | "failed"
  beforeMetrics: {
    efficiency: number
    cost: number
    risk: number
    leadTime?: number
    yield?: number
  }
  afterMetrics: {
    efficiency: number
    cost: number
    risk: number
    leadTime?: number
    yield?: number
  }
  affectedSystems: string[]
  records: number
}

// 샘플 데이터 - 실제로는 Firebase에서 가져옴
const sampleWritebackHistory: WritebackRecord[] = [
  {
    id: "WB-2024-0312-001",
    timestamp: new Date(Date.now() - 3600000),
    category: "demand",
    scenario: "옵션 1: 긴급 생산 증대",
    status: "completed",
    beforeMetrics: { efficiency: 85, cost: 850, risk: 25, leadTime: 18 },
    afterMetrics: { efficiency: 97.5, cost: 920, risk: 18, leadTime: 15 },
    affectedSystems: ["SAP ERP", "MES", "SCM", "QMS"],
    records: 7
  },
  {
    id: "WB-2024-0312-002",
    timestamp: new Date(Date.now() - 7200000),
    category: "quality",
    scenario: "옵션 1: 검사 파라미터 최적화",
    status: "completed",
    beforeMetrics: { efficiency: 88, cost: 120, risk: 15, yield: 94.2 },
    afterMetrics: { efficiency: 91, cost: 0, risk: 8, yield: 97.0 },
    affectedSystems: ["QMS", "MES", "AOI"],
    records: 4
  },
  {
    id: "WB-2024-0312-003",
    timestamp: new Date(Date.now() - 10800000),
    category: "logistics",
    scenario: "옵션 3: 복합 운송 (권장)",
    status: "completed",
    beforeMetrics: { efficiency: 78, cost: 85, risk: 40, leadTime: 14 },
    afterMetrics: { efficiency: 83, cost: 52, risk: 12, leadTime: 7 },
    affectedSystems: ["TMS", "WMS", "Cross-docking"],
    records: 5
  },
]

const overallTrendData = [
  { date: "03/06", 수요최적화: 12, 품질최적화: 8, 물류최적화: 5, total: 25 },
  { date: "03/07", 수요최적화: 15, 품질최적화: 12, 물류최적화: 8, total: 35 },
  { date: "03/08", 수요최적화: 18, 품질최적화: 14, 물류최적화: 10, total: 42 },
  { date: "03/09", 수요최적화: 22, 품질최적화: 18, 물류최적화: 12, total: 52 },
  { date: "03/10", 수요최적화: 28, 품질최적화: 22, 물류최적화: 15, total: 65 },
  { date: "03/11", 수요최적화: 32, 품질최적화: 25, 물류최적화: 18, total: 75 },
  { date: "03/12", 수요최적화: 38, 품질최적화: 28, 물류최적화: 22, total: 88 },
]

const systemSyncStatus = [
  { system: "SAP ERP", syncs: 24, lastSync: "2분 전", status: "active" },
  { system: "MES", syncs: 18, lastSync: "5분 전", status: "active" },
  { system: "QMS", syncs: 12, lastSync: "8분 전", status: "active" },
  { system: "TMS", syncs: 8, lastSync: "15분 전", status: "active" },
  { system: "WMS", syncs: 6, lastSync: "20분 전", status: "idle" },
  { system: "SCM", syncs: 10, lastSync: "12분 전", status: "active" },
]

export function WritebackTrackingDashboard() {
  const [selectedRecord, setSelectedRecord] = useState<WritebackRecord | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "demand": return "bg-blue-500"
      case "quality": return "bg-green-500"
      case "logistics": return "bg-orange-500"
      default: return "bg-zinc-500"
    }
  }

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "demand": return "수요 예측"
      case "quality": return "품질 관리"
      case "logistics": return "물류 최적화"
      default: return "기타"
    }
  }

  const getMetricChange = (before: number, after: number) => {
    const diff = after - before
    const percent = ((diff / before) * 100).toFixed(1)
    return { diff, percent, isPositive: diff > 0 }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await new Promise(resolve => setTimeout(resolve, 1500))
    setIsRefreshing(false)
  }

  // 전체 최적화 현황 계산
  const totalOptimization = {
    efficiency: 88 + 12.5 + 2.8 + 5,
    costSaved: 185 + 120 + 33,
    riskReduced: 25 - 18 + 15 - 8 + 40 - 12,
    systemsSynced: 16
  }

  return (
    <div className="p-6 space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Database className="w-6 h-6 text-purple-400" />
            Write-Back 변동 추적 대시보드
          </h1>
          <p className="text-zinc-400 text-sm mt-1">AIP 최적화 결과의 레거시 시스템 반영 현황을 실시간으로 모니터링합니다</p>
        </div>
        <Button 
          variant="outline" 
          className="gap-2"
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
          새로고침
        </Button>
      </div>

      {/* 전체 최적화 현황 KPI */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 border-purple-500/30 p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-purple-400" />
            <span className="text-sm text-zinc-400">총 효율성 향상</span>
          </div>
          <div className="text-3xl font-bold text-purple-400">+{totalOptimization.efficiency.toFixed(1)}%</div>
          <p className="text-xs text-zinc-500 mt-1">모든 최적화 시나리오 합산</p>
        </Card>
        <Card className="bg-gradient-to-br from-green-500/20 to-green-600/10 border-green-500/30 p-4">
          <div className="flex items-center gap-2 mb-2">
            <ArrowDownRight className="w-5 h-5 text-green-400" />
            <span className="text-sm text-zinc-400">총 비용 절감</span>
          </div>
          <div className="text-3xl font-bold text-green-400">${totalOptimization.costSaved}K</div>
          <p className="text-xs text-zinc-500 mt-1">월간 예상 절감액</p>
        </Card>
        <Card className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 border-blue-500/30 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-5 h-5 text-blue-400" />
            <span className="text-sm text-zinc-400">리스크 감소</span>
          </div>
          <div className="text-3xl font-bold text-blue-400">-{totalOptimization.riskReduced}pt</div>
          <p className="text-xs text-zinc-500 mt-1">종합 리스크 지수 감소</p>
        </Card>
        <Card className="bg-gradient-to-br from-orange-500/20 to-orange-600/10 border-orange-500/30 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Layers className="w-5 h-5 text-orange-400" />
            <span className="text-sm text-zinc-400">연동 시스템</span>
          </div>
          <div className="text-3xl font-bold text-orange-400">{totalOptimization.systemsSynced}</div>
          <p className="text-xs text-zinc-500 mt-1">레거시 시스템 Write-Back 완료</p>
        </Card>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 좌측: Write-Back 이력 */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="bg-zinc-900 border-zinc-800 p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold flex items-center gap-2">
                <History className="w-4 h-4 text-purple-400" />
                Write-Back 이력 (변동 전/후 비교)
              </h3>
              <Badge variant="outline" className="text-xs">최근 24시간</Badge>
            </div>
            <div className="space-y-3">
              {sampleWritebackHistory.map((record) => (
                <Card 
                  key={record.id}
                  className={`bg-zinc-800/50 border-zinc-700 p-4 cursor-pointer transition-all hover:border-zinc-600 ${selectedRecord?.id === record.id ? "ring-2 ring-purple-500" : ""}`}
                  onClick={() => setSelectedRecord(record)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Badge className={`${getCategoryColor(record.category)} text-white text-[10px]`}>
                        {getCategoryLabel(record.category)}
                      </Badge>
                      <span className="font-semibold text-sm">{record.scenario}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                      <span className="text-xs text-zinc-400">
                        {record.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                  
                  {/* 변동 전/후 비교 */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                    <div className="bg-zinc-900 rounded p-2">
                      <span className="text-[10px] text-zinc-500">효율성</span>
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-zinc-400">{record.beforeMetrics.efficiency}%</span>
                        <ArrowUpRight className="w-3 h-3 text-green-400" />
                        <span className="text-xs font-bold text-green-400">{record.afterMetrics.efficiency}%</span>
                      </div>
                    </div>
                    <div className="bg-zinc-900 rounded p-2">
                      <span className="text-[10px] text-zinc-500">비용 변동</span>
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-zinc-400">${record.beforeMetrics.cost}K</span>
                        {record.afterMetrics.cost < record.beforeMetrics.cost ? (
                          <>
                            <ArrowDownRight className="w-3 h-3 text-green-400" />
                            <span className="text-xs font-bold text-green-400">${record.afterMetrics.cost}K</span>
                          </>
                        ) : (
                          <>
                            <ArrowUpRight className="w-3 h-3 text-red-400" />
                            <span className="text-xs font-bold text-red-400">${record.afterMetrics.cost}K</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="bg-zinc-900 rounded p-2">
                      <span className="text-[10px] text-zinc-500">리스크</span>
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-zinc-400">{record.beforeMetrics.risk}</span>
                        <ArrowDownRight className="w-3 h-3 text-green-400" />
                        <span className="text-xs font-bold text-green-400">{record.afterMetrics.risk}</span>
                      </div>
                    </div>
                    <div className="bg-zinc-900 rounded p-2">
                      <span className="text-[10px] text-zinc-500">반영 시스템</span>
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-bold text-purple-400">{record.affectedSystems.length}개</span>
                        <span className="text-[10px] text-zinc-500">({record.records} records)</span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </Card>

          {/* 최적화 추이 차트 */}
          <Card className="bg-zinc-900 border-zinc-800 p-4">
            <h3 className="font-semibold flex items-center gap-2 mb-4">
              <TrendingUp className="w-4 h-4 text-green-400" />
              누적 최적화 추이 (7일간)
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={overallTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
                <XAxis dataKey="date" stroke="#a1a1aa" style={{ fontSize: "11px" }} />
                <YAxis stroke="#a1a1aa" style={{ fontSize: "11px" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#18181b",
                    border: "1px solid #3f3f46",
                    borderRadius: "6px",
                    fontSize: "12px",
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "11px" }} />
                <Line type="monotone" dataKey="수요최적화" stroke="#3b82f6" strokeWidth={2} dot={{ fill: "#3b82f6" }} />
                <Line type="monotone" dataKey="품질최적화" stroke="#22c55e" strokeWidth={2} dot={{ fill: "#22c55e" }} />
                <Line type="monotone" dataKey="물류최적화" stroke="#f97316" strokeWidth={2} dot={{ fill: "#f97316" }} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* 우측: 시스템 동기화 현황 */}
        <div className="space-y-4">
          <Card className="bg-zinc-900 border-zinc-800 p-4">
            <h3 className="font-semibold flex items-center gap-2 mb-4">
              <Database className="w-4 h-4 text-blue-400" />
              레거시 시스템 동기화 현황
            </h3>
            <div className="space-y-3">
              {systemSyncStatus.map((system, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-zinc-800/50 rounded border border-zinc-700">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${system.status === "active" ? "bg-green-400 animate-pulse" : "bg-zinc-500"}`} />
                    <div>
                      <span className="text-sm font-semibold">{system.system}</span>
                      <p className="text-[10px] text-zinc-500">{system.lastSync}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {system.syncs} syncs
                  </Badge>
                </div>
              ))}
            </div>
          </Card>

          {/* 선택된 레코드 상세 */}
          {selectedRecord && (
            <Card className="bg-zinc-900 border-zinc-800 p-4">
              <h3 className="font-semibold flex items-center gap-2 mb-4">
                <FileText className="w-4 h-4 text-purple-400" />
                상세 변동 내역
              </h3>
              <div className="space-y-3">
                <div className="p-3 bg-zinc-800/50 rounded">
                  <span className="text-xs text-zinc-400">실행 ID</span>
                  <p className="text-sm font-mono">{selectedRecord.id}</p>
                </div>
                <div className="p-3 bg-zinc-800/50 rounded">
                  <span className="text-xs text-zinc-400">영향받은 시스템</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedRecord.affectedSystems.map((system, idx) => (
                      <Badge key={idx} variant="outline" className="text-[10px]">
                        {system}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded">
                    <span className="text-[10px] text-red-400">변경 전</span>
                    <p className="text-lg font-bold text-red-400">{selectedRecord.beforeMetrics.efficiency}%</p>
                  </div>
                  <div className="p-3 bg-green-500/10 border border-green-500/20 rounded">
                    <span className="text-[10px] text-green-400">변경 후</span>
                    <p className="text-lg font-bold text-green-400">{selectedRecord.afterMetrics.efficiency}%</p>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* 카테고리별 기여도 */}
          <Card className="bg-zinc-900 border-zinc-800 p-4">
            <h3 className="font-semibold flex items-center gap-2 mb-4">
              <Activity className="w-4 h-4 text-orange-400" />
              카테고리별 최적화 기여도
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-blue-500" />
                  <span className="text-sm">수요 예측</span>
                </div>
                <span className="text-sm font-bold text-blue-400">+12.5%</span>
              </div>
              <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: "45%" }} />
              </div>
              
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-green-500" />
                  <span className="text-sm">품질 관리</span>
                </div>
                <span className="text-sm font-bold text-green-400">+2.8%</span>
              </div>
              <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full" style={{ width: "25%" }} />
              </div>
              
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-orange-500" />
                  <span className="text-sm">물류 최적화</span>
                </div>
                <span className="text-sm font-bold text-orange-400">+5.0%</span>
              </div>
              <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full bg-orange-500 rounded-full" style={{ width: "30%" }} />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
