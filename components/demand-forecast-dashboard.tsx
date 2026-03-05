"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Package,
  Factory,
  Globe,
  BarChart3,
  Activity,
  Calendar,
  ArrowRight,
  CheckCircle2,
  Clock,
} from "lucide-react"
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
} from "recharts"

export function DemandForecastDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState("monthly")

  // 수요 예측 데이터
  const demandForecastData = [
    { month: "1월", actual: 45000, forecast: 44000, capacity: 50000 },
    { month: "2월", actual: 48000, forecast: 47500, capacity: 50000 },
    { month: "3월", actual: null, forecast: 52000, capacity: 50000 },
    { month: "4월", actual: null, forecast: 55000, capacity: 55000 },
    { month: "5월", actual: null, forecast: 58000, capacity: 55000 },
    { month: "6월", actual: null, forecast: 54000, capacity: 55000 },
  ]

  // 제품별 수요
  const productDemandData = [
    { product: "Galaxy S25", current: 35000, forecast: 42000, change: 20 },
    { product: "Galaxy S24", current: 28000, forecast: 22000, change: -21 },
    { product: "Galaxy A55", current: 15000, forecast: 18000, change: 20 },
    { product: "Galaxy Z Fold", current: 8000, forecast: 10000, change: 25 },
  ]

  // 지역별 수요
  const regionalData = [
    { region: "한국", value: 25 },
    { region: "북미", value: 30 },
    { region: "유럽", value: 22 },
    { region: "아시아", value: 18 },
    { region: "기타", value: 5 },
  ]

  // 최근 수요 변경 이벤트
  const demandEvents = [
    {
      id: 1,
      type: "increase",
      product: "Galaxy S25",
      customer: "SEC (삼성전자)",
      change: "+2,000대",
      date: "2026-03-05",
      status: "pending",
      urgency: "high",
    },
    {
      id: 2,
      type: "decrease",
      product: "Galaxy S24",
      customer: "SEC (삼성전자)",
      change: "-1,500대",
      date: "2026-03-03",
      status: "resolved",
      urgency: "medium",
    },
    {
      id: 3,
      type: "increase",
      product: "Galaxy A55",
      customer: "SEC (삼성전자)",
      change: "+800대",
      date: "2026-03-01",
      status: "resolved",
      urgency: "low",
    },
  ]

  // 공장별 생산 현황
  const factoryStatus = [
    { name: "천안 본사", capacity: 94, utilization: 88, status: "normal" },
    { name: "베트남 Vina1", capacity: 92, utilization: 91, status: "high" },
    { name: "베트남 Vina2", capacity: 88, utilization: 85, status: "normal" },
  ]

  return (
    <div className="space-y-6">
      {/* 상단 KPI 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-zinc-800/50 border-zinc-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-zinc-400">이번 달 수요</p>
              <p className="text-2xl font-bold">52,000</p>
              <div className="flex items-center gap-1 mt-1">
                <TrendingUp className="w-3 h-3 text-green-400" />
                <span className="text-xs text-green-400">+8.3% vs 전월</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-blue-400" />
            </div>
          </div>
        </Card>

        <Card className="bg-zinc-800/50 border-zinc-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-zinc-400">생산 가능량</p>
              <p className="text-2xl font-bold">50,000</p>
              <div className="flex items-center gap-1 mt-1">
                <AlertTriangle className="w-3 h-3 text-yellow-400" />
                <span className="text-xs text-yellow-400">초과 수요 예상</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-full bg-yellow-500/10 flex items-center justify-center">
              <Factory className="w-6 h-6 text-yellow-400" />
            </div>
          </div>
        </Card>

        <Card className="bg-zinc-800/50 border-zinc-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-zinc-400">납기 준수율</p>
              <p className="text-2xl font-bold">96.8%</p>
              <div className="flex items-center gap-1 mt-1">
                <TrendingDown className="w-3 h-3 text-red-400" />
                <span className="text-xs text-red-400">-1.2% vs 목표</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-green-400" />
            </div>
          </div>
        </Card>

        <Card className="bg-zinc-800/50 border-zinc-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-zinc-400">미해결 알림</p>
              <p className="text-2xl font-bold text-red-400">1</p>
              <div className="flex items-center gap-1 mt-1">
                <Clock className="w-3 h-3 text-zinc-400" />
                <span className="text-xs text-zinc-400">대기 중</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-400" />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 수요 예측 차트 */}
        <Card className="lg:col-span-2 bg-zinc-800/50 border-zinc-700 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-400" />
              수요 예측 vs 생산 능력
            </h3>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={selectedPeriod === "weekly" ? "default" : "outline"}
                onClick={() => setSelectedPeriod("weekly")}
                className="text-xs h-7"
              >
                주간
              </Button>
              <Button
                size="sm"
                variant={selectedPeriod === "monthly" ? "default" : "outline"}
                onClick={() => setSelectedPeriod("monthly")}
                className="text-xs h-7"
              >
                월간
              </Button>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={demandForecastData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
              <XAxis dataKey="month" stroke="#a1a1aa" style={{ fontSize: "12px" }} />
              <YAxis stroke="#a1a1aa" style={{ fontSize: "11px" }} tickFormatter={(v) => `${v / 1000}K`} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#18181b",
                  border: "1px solid #3f3f46",
                  borderRadius: "6px",
                  fontSize: "12px",
                }}
              />
              <Legend wrapperStyle={{ fontSize: "12px" }} />
              <Area
                type="monotone"
                dataKey="capacity"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.1}
                strokeDasharray="5 5"
                name="생산 능력"
              />
              <Area
                type="monotone"
                dataKey="forecast"
                stroke="#8b5cf6"
                fill="#8b5cf6"
                fillOpacity={0.3}
                name="수요 예측"
              />
              <Line type="monotone" dataKey="actual" stroke="#22c55e" strokeWidth={2} name="실제 수요" dot />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* 수요 변경 이벤트 */}
        <Card className="bg-zinc-800/50 border-zinc-700 p-4">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-400" />
            수요 변경 이벤트
          </h3>
          <div className="space-y-3">
            {demandEvents.map((event) => (
              <div
                key={event.id}
                className={`p-3 rounded-lg border ${
                  event.status === "pending"
                    ? "bg-red-500/10 border-red-500/30"
                    : "bg-zinc-900/50 border-zinc-700"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold">{event.product}</span>
                  <Badge
                    variant="outline"
                    className={
                      event.type === "increase"
                        ? "text-green-400 border-green-400/50"
                        : "text-red-400 border-red-400/50"
                    }
                  >
                    {event.change}
                  </Badge>
                </div>
                <p className="text-xs text-zinc-400">{event.customer}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[10px] text-zinc-500">{event.date}</span>
                  <Badge
                    variant="outline"
                    className={
                      event.status === "pending"
                        ? "text-yellow-400 border-yellow-400/50 text-[10px]"
                        : "text-green-400 border-green-400/50 text-[10px]"
                    }
                  >
                    {event.status === "pending" ? "대기 중" : "해결됨"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 제품별 수요 현황 */}
        <Card className="bg-zinc-800/50 border-zinc-700 p-4">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Package className="w-5 h-5 text-purple-400" />
            제품별 수요 현황
          </h3>
          <div className="space-y-3">
            {productDemandData.map((product, idx) => (
              <div key={idx} className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{product.product}</span>
                    <span
                      className={`text-xs ${product.change > 0 ? "text-green-400" : "text-red-400"}`}
                    >
                      {product.change > 0 ? "+" : ""}
                      {product.change}%
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-zinc-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${(product.current / 50000) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-zinc-400 w-16 text-right">
                      {(product.current / 1000).toFixed(0)}K
                    </span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-zinc-500" />
                <div className="w-16 text-right">
                  <span className="text-sm font-semibold">{(product.forecast / 1000).toFixed(0)}K</span>
                  <p className="text-[10px] text-zinc-500">예측</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* 공장별 현황 */}
        <Card className="bg-zinc-800/50 border-zinc-700 p-4">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Factory className="w-5 h-5 text-green-400" />
            공장별 가동 현황
          </h3>
          <div className="space-y-4">
            {factoryStatus.map((factory, idx) => (
              <div key={idx}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">{factory.name}</span>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={
                        factory.status === "high"
                          ? "text-yellow-400 border-yellow-400/50 text-[10px]"
                          : "text-green-400 border-green-400/50 text-[10px]"
                      }
                    >
                      {factory.status === "high" ? "높은 가동률" : "정상"}
                    </Badge>
                    <span className="text-sm font-bold">{factory.utilization}%</span>
                  </div>
                </div>
                <div className="h-2 bg-zinc-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      factory.utilization > 90
                        ? "bg-yellow-500"
                        : factory.utilization > 80
                          ? "bg-green-500"
                          : "bg-blue-500"
                    }`}
                    style={{ width: `${factory.utilization}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-zinc-500 mt-1">
                  <span>가동률</span>
                  <span>최대 능력: {factory.capacity}%</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
