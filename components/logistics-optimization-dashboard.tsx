"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Ship, 
  Plane, 
  Truck, 
  Globe, 
  AlertTriangle, 
  Clock,
  TrendingUp,
  TrendingDown,
  MapPin,
  Package
} from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, Cell } from "recharts"

const shippingRoutes = [
  { id: 1, from: "베트남 하노이", to: "인천공항", mode: "air", status: "delayed", eta: "14일 지연", cost: "$85,000" },
  { id: 2, from: "베트남 하이퐁", to: "부산항", mode: "sea", status: "ontime", eta: "정상", cost: "$35,000" },
  { id: 3, from: "중국 선전", to: "천안 공장", mode: "truck", status: "ontime", eta: "정상", cost: "$12,000" },
]

const externalFactors = [
  { factor: "수에즈 운하 지연", impact: "높음", status: "active", description: "홍해 지역 분쟁으로 인한 우회 필요" },
  { factor: "유가 변동", impact: "중", status: "monitoring", description: "배럴당 $82, 전월 대비 +5%" },
  { factor: "환율 변동 (USD/KRW)", impact: "낮음", status: "stable", description: "1,320원, 안정적 추세" },
  { factor: "중국 춘절 물량 적체", impact: "중", status: "resolved", description: "해소 완료" },
]

const deliveryPerformance = [
  { date: "W1", 정시납품률: 92, 목표: 95 },
  { date: "W2", 정시납품률: 88, 목표: 95 },
  { date: "W3", 정시납품률: 85, 목표: 95 },
  { date: "W4", 정시납품률: 78, 목표: 95 },
  { date: "W5(예측)", 정시납품률: 72, 목표: 95 },
]

const costByMode = [
  { mode: "항공", cost: 85000, percent: 45 },
  { mode: "해상", cost: 65000, percent: 35 },
  { mode: "육로", cost: 38000, percent: 20 },
]

export function LogisticsOptimizationDashboard() {
  const getModeIcon = (mode: string) => {
    switch (mode) {
      case "air": return <Plane className="w-4 h-4 text-red-400" />
      case "sea": return <Ship className="w-4 h-4 text-blue-400" />
      case "truck": return <Truck className="w-4 h-4 text-green-400" />
      default: return <Package className="w-4 h-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delayed": return "bg-red-500/10 text-red-400 border-red-500/50"
      case "ontime": return "bg-green-500/10 text-green-400 border-green-500/50"
      default: return "bg-zinc-500/10 text-zinc-400"
    }
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "높음": return "text-red-400"
      case "중": return "text-yellow-400"
      case "낮음": return "text-green-400"
      default: return "text-zinc-400"
    }
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Globe className="w-5 h-5 text-orange-400" />
            대외변수 대응 물류 최적화
          </h2>
          <p className="text-sm text-zinc-400">글로벌 공급망 리스크 모니터링 및 운송 최적화</p>
        </div>
        <Badge variant="destructive" className="animate-pulse">
          <AlertTriangle className="w-3 h-3 mr-1" />
          대외변수 감지됨
        </Badge>
      </div>

      {/* KPI 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-zinc-900 border-zinc-800 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-red-400" />
            <span className="text-xs text-zinc-400">평균 지연 시간</span>
          </div>
          <div className="text-2xl font-bold text-red-400">+5.2일</div>
          <p className="text-xs text-zinc-500">전월 대비 +3.1일</p>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800 p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="w-4 h-4 text-yellow-400" />
            <span className="text-xs text-zinc-400">정시 납품률</span>
          </div>
          <div className="text-2xl font-bold text-yellow-400">78%</div>
          <p className="text-xs text-zinc-500">목표 95% 미달</p>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800 p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-red-400" />
            <span className="text-xs text-zinc-400">물류비 증가</span>
          </div>
          <div className="text-2xl font-bold text-red-400">+18%</div>
          <p className="text-xs text-zinc-500">우회 운송으로 인한 추가 비용</p>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800 p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-orange-400" />
            <span className="text-xs text-zinc-400">영향받는 주문</span>
          </div>
          <div className="text-2xl font-bold text-orange-400">12건</div>
          <p className="text-xs text-zinc-500">긴급 대응 필요</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 대외 변수 현황 */}
        <Card className="bg-zinc-900 border-zinc-800 p-4">
          <h3 className="font-semibold flex items-center gap-2 mb-4">
            <AlertTriangle className="w-4 h-4 text-orange-400" />
            대외 변수 모니터링
          </h3>
          <div className="space-y-3">
            {externalFactors.map((factor, index) => (
              <div key={index} className="p-3 bg-zinc-800/50 rounded border border-zinc-700">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-sm">{factor.factor}</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold ${getImpactColor(factor.impact)}`}>
                      영향: {factor.impact}
                    </span>
                    <Badge variant="outline" className={
                      factor.status === "active" ? "bg-red-500/10 text-red-400 border-red-500/50" :
                      factor.status === "monitoring" ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/50" :
                      "bg-green-500/10 text-green-400 border-green-500/50"
                    }>
                      {factor.status === "active" ? "활성" : factor.status === "monitoring" ? "감시중" : "해소"}
                    </Badge>
                  </div>
                </div>
                <p className="text-xs text-zinc-400">{factor.description}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* 정시 납품률 추이 */}
        <Card className="bg-zinc-900 border-zinc-800 p-4">
          <h3 className="font-semibold flex items-center gap-2 mb-4">
            <Clock className="w-4 h-4 text-blue-400" />
            정시 납품률 추이
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={deliveryPerformance}>
              <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
              <XAxis dataKey="date" stroke="#a1a1aa" style={{ fontSize: "11px" }} />
              <YAxis stroke="#a1a1aa" style={{ fontSize: "11px" }} domain={[60, 100]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#18181b",
                  border: "1px solid #3f3f46",
                  borderRadius: "6px",
                  fontSize: "12px",
                }}
                formatter={(value: number) => `${value}%`}
              />
              <Legend wrapperStyle={{ fontSize: "11px" }} />
              <Line type="monotone" dataKey="정시납품률" stroke="#ef4444" strokeWidth={2} dot={{ fill: "#ef4444" }} />
              <Line type="monotone" dataKey="목표" stroke="#22c55e" strokeWidth={2} strokeDasharray="5 5" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* 운송 경로 현황 */}
        <Card className="bg-zinc-900 border-zinc-800 p-4">
          <h3 className="font-semibold flex items-center gap-2 mb-4">
            <MapPin className="w-4 h-4 text-purple-400" />
            주요 운송 경로 현황
          </h3>
          <div className="space-y-3">
            {shippingRoutes.map((route) => (
              <div key={route.id} className="p-3 bg-zinc-800/50 rounded border border-zinc-700">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getModeIcon(route.mode)}
                    <span className="text-sm font-semibold">{route.from}</span>
                    <span className="text-zinc-500">→</span>
                    <span className="text-sm font-semibold">{route.to}</span>
                  </div>
                  <Badge variant="outline" className={getStatusColor(route.status)}>
                    {route.eta}
                  </Badge>
                </div>
                <div className="flex justify-between text-xs text-zinc-400">
                  <span>예상 비용: {route.cost}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* 운송 모드별 비용 */}
        <Card className="bg-zinc-900 border-zinc-800 p-4">
          <h3 className="font-semibold flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-green-400" />
            운송 모드별 비용 분포
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={costByMode} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
              <XAxis type="number" stroke="#a1a1aa" style={{ fontSize: "10px" }} tickFormatter={(v) => `$${v/1000}K`} />
              <YAxis dataKey="mode" type="category" stroke="#a1a1aa" style={{ fontSize: "11px" }} width={50} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#18181b",
                  border: "1px solid #3f3f46",
                  borderRadius: "6px",
                  fontSize: "12px",
                }}
                formatter={(value: number) => `$${value.toLocaleString()}`}
              />
              <Bar dataKey="cost" radius={[0, 4, 4, 0]}>
                <Cell fill="#ef4444" />
                <Cell fill="#3b82f6" />
                <Cell fill="#22c55e" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  )
}
