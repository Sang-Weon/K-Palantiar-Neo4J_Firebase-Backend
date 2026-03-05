"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { IssueDetailDialog } from "@/components/issue-detail-dialog"
import { ActionItemDialog } from "@/components/action-item-dialog"
import {
  Package,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  ListChecks,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Building2,
  Network,
} from "lucide-react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
} from "recharts"

interface FactoryDetailDialogProps {
  isOpen: boolean
  onClose: () => void
  factory: {
    id: string
    name: string
    location: string
    status: string
    statusText: string
    products: string[]
    annualTarget: { revenue: number; units: number }
    annualActual: { revenue: number; units: number }
    kpis: Array<{ name: string; value: number; target: number; unit: string }>
    issues: Array<{ id: string; title: string; severity: string; date: string }>
    actions: Array<{ id: string; title: string; assignee: string; dueDate: string; status: string }>
    economicIndicators: Array<{ name: string; value: string; change: number }>
    relationships: Array<{ factory: string; type: string; description: string }>
  }
}

export function FactoryDetailDialog({ isOpen, onClose, factory }: FactoryDetailDialogProps) {
  const [selectedIssue, setSelectedIssue] = useState<{
    id: string
    title: string
    severity: string
    date: string
  } | null>(null)
  const [selectedAction, setSelectedAction] = useState<{
    id: string
    title: string
    assignee: string
    dueDate: string
    status: string
  } | null>(null)

  const performanceData = [
    { month: "1월", 목표: 850, 실적: 820 },
    { month: "2월", 목표: 850, 실적: 880 },
    { month: "3월", 목표: 850, 실적: 920 },
    { month: "4월", 목표: 850, 실적: 890 },
    { month: "5월", 목표: 850, 실적: 950 },
    { month: "6월", 목표: 850, 실적: 920 },
  ]

  const kpiRadarData = factory.kpis.map((kpi) => ({
    indicator: kpi.name,
    달성률: (kpi.value / kpi.target) * 100,
    목표: 100,
  }))

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-zinc-900 border-zinc-800">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-xl">
              <Building2 className="w-6 h-6 text-blue-400" />
              {factory.name}
              <Badge variant={factory.status === "critical" ? "destructive" : "default"}>{factory.statusText}</Badge>
            </DialogTitle>
            <DialogDescription className="sr-only">공장 상세 정보, KPI, 이슈 및 액션 아이템을 관리합니다.</DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="bg-zinc-800">
              <TabsTrigger value="overview">개요</TabsTrigger>
              <TabsTrigger value="issues">이슈 관리</TabsTrigger>
              <TabsTrigger value="actions">액션 아이템</TabsTrigger>
              <TabsTrigger value="economics">경제 지표</TabsTrigger>
              <TabsTrigger value="relationships">공장 연관성</TabsTrigger>
            </TabsList>

            {/* 개요 탭 */}
            <TabsContent value="overview" className="space-y-4 mt-4">
              <Card className="bg-zinc-800/50 border-zinc-700 p-4">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Package className="w-5 h-5 text-blue-400" />
                  주요 생산 품목
                </h3>
                <div className="flex flex-wrap gap-2">
                  {factory.products.map((product, index) => (
                    <Badge key={index} variant="outline" className="bg-blue-500/10 border-blue-500/30 text-blue-400">
                      {product}
                    </Badge>
                  ))}
                </div>
              </Card>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card className="bg-zinc-800/50 border-zinc-700 p-4">
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-400" />
                    연간 목표 대비 실적
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2 text-sm">
                        <span className="text-zinc-400">매출 목표</span>
                        <span className="font-mono">
                          {factory.annualActual.revenue.toLocaleString()} /{" "}
                          {factory.annualTarget.revenue.toLocaleString()}억원
                        </span>
                      </div>
                      <Progress
                        value={(factory.annualActual.revenue / factory.annualTarget.revenue) * 100}
                        className="h-2"
                      />
                      <p className="text-xs text-right mt-1 text-green-400">
                        {((factory.annualActual.revenue / factory.annualTarget.revenue) * 100).toFixed(1)}% 달성
                      </p>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2 text-sm">
                        <span className="text-zinc-400">생산량 목표</span>
                        <span className="font-mono">
                          {factory.annualActual.units.toLocaleString()} / {factory.annualTarget.units.toLocaleString()}
                          개
                        </span>
                      </div>
                      <Progress
                        value={(factory.annualActual.units / factory.annualTarget.units) * 100}
                        className="h-2"
                      />
                      <p className="text-xs text-right mt-1 text-green-400">
                        {((factory.annualActual.units / factory.annualTarget.units) * 100).toFixed(1)}% 달성
                      </p>
                    </div>
                  </div>
                </Card>

                {/* 월별 실적 추이 */}
                <Card className="bg-zinc-800/50 border-zinc-700 p-4">
                  <h3 className="text-sm font-semibold mb-3">월별 생산 실적 추이</h3>
                  <ResponsiveContainer width="100%" height={180}>
                    <LineChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
                      <XAxis dataKey="month" stroke="#a1a1aa" style={{ fontSize: "12px" }} />
                      <YAxis stroke="#a1a1aa" style={{ fontSize: "12px" }} />
                      <Tooltip
                        contentStyle={{ backgroundColor: "#27272a", border: "1px solid #3f3f46", borderRadius: "6px" }}
                        labelStyle={{ color: "#e4e4e7" }}
                      />
                      <Legend />
                      <Line type="monotone" dataKey="목표" stroke="#6b7280" strokeDasharray="5 5" />
                      <Line type="monotone" dataKey="실적" stroke="#22c55e" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </Card>
              </div>

              {/* 주요 KPI */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card className="bg-zinc-800/50 border-zinc-700 p-4">
                  <h3 className="text-lg font-semibold mb-4">주요 KPI 현황</h3>
                  <div className="space-y-3">
                    {factory.kpis.map((kpi, index) => (
                      <div key={index} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-zinc-400">{kpi.name}</span>
                          <span className="font-mono">
                            {kpi.value}
                            {kpi.unit} / {kpi.target}
                            {kpi.unit}
                          </span>
                        </div>
                        <Progress value={(kpi.value / kpi.target) * 100} className="h-1.5" />
                      </div>
                    ))}
                  </div>
                </Card>

                <Card className="bg-zinc-800/50 border-zinc-700 p-4">
                  <h3 className="text-lg font-semibold mb-4">KPI 균형 분석</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <RadarChart data={kpiRadarData}>
                      <PolarGrid stroke="#3f3f46" />
                      <PolarAngleAxis dataKey="indicator" stroke="#a1a1aa" style={{ fontSize: "11px" }} />
                      <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#a1a1aa" style={{ fontSize: "10px" }} />
                      <Radar name="달성률" dataKey="달성률" stroke="#22c55e" fill="#22c55e" fillOpacity={0.3} />
                      <Radar
                        name="목표"
                        dataKey="목표"
                        stroke="#6b7280"
                        fill="#6b7280"
                        fillOpacity={0.1}
                        strokeDasharray="5 5"
                      />
                      <Legend />
                    </RadarChart>
                  </ResponsiveContainer>
                </Card>
              </div>
            </TabsContent>

            {/* 이슈 관리 탭 */}
            <TabsContent value="issues" className="space-y-4 mt-4">
              <Card className="bg-zinc-800/50 border-zinc-700 p-4">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-400" />
                  주요 이슈 현황
                </h3>
                <div className="space-y-3">
                  {factory.issues.map((issue) => (
                    <Card
                      key={issue.id}
                      className="bg-zinc-900 border-zinc-700 p-4 hover:border-zinc-600 transition-colors cursor-pointer"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge
                              variant={
                                issue.severity === "높음"
                                  ? "destructive"
                                  : issue.severity === "중간"
                                    ? "default"
                                    : "outline"
                              }
                              className="text-xs"
                            >
                              {issue.severity}
                            </Badge>
                            <span className="text-xs text-zinc-500">{issue.date}</span>
                          </div>
                          <h4 className="font-semibold text-sm">{issue.title}</h4>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="ml-2 bg-transparent"
                          onClick={() => setSelectedIssue(issue)}
                        >
                          상세보기
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </Card>
            </TabsContent>

            {/* 액션 아이템 탭 */}
            <TabsContent value="actions" className="space-y-4 mt-4">
              <Card className="bg-zinc-800/50 border-zinc-700 p-4">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <ListChecks className="w-5 h-5 text-blue-400" />
                  액션 아이템 관리
                </h3>
                <div className="space-y-3">
                  {factory.actions.map((action) => (
                    <Card key={action.id} className="bg-zinc-900 border-zinc-700 p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge
                              variant={
                                action.status === "완료"
                                  ? "default"
                                  : action.status === "진행중"
                                    ? "outline"
                                    : "destructive"
                              }
                              className="text-xs"
                            >
                              {action.status}
                            </Badge>
                            <span className="text-xs text-zinc-500">마감: {action.dueDate}</span>
                          </div>
                          <h4 className="font-semibold text-sm mb-1">{action.title}</h4>
                          <p className="text-xs text-zinc-400">담당: {action.assignee}</p>
                        </div>
                        {action.status === "완료" ? (
                          <CheckCircle2 className="w-5 h-5 text-green-400 ml-2" />
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            className="ml-2 bg-transparent"
                            onClick={() => setSelectedAction(action)}
                          >
                            수정
                          </Button>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              </Card>
            </TabsContent>

            {/* 경제 지표 탭 */}
            <TabsContent value="economics" className="space-y-4 mt-4">
              <Card className="bg-zinc-800/50 border-zinc-700 p-4">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-400" />
                  주요 경제 지표
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {factory.economicIndicators.map((indicator, index) => (
                    <Card key={index} className="bg-zinc-900 border-zinc-700 p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="text-sm font-medium text-zinc-400">{indicator.name}</h4>
                        {indicator.change > 0 ? (
                          <ArrowUpRight className="w-4 h-4 text-red-400" />
                        ) : (
                          <ArrowDownRight className="w-4 h-4 text-green-400" />
                        )}
                      </div>
                      <p className="text-2xl font-bold font-mono mb-1">{indicator.value}</p>
                      <p className={`text-xs ${indicator.change > 0 ? "text-red-400" : "text-green-400"}`}>
                        전월 대비 {indicator.change > 0 ? "+" : ""}
                        {indicator.change}%
                      </p>
                    </Card>
                  ))}
                </div>
              </Card>
            </TabsContent>

            {/* 공장 연관성 탭 */}
            <TabsContent value="relationships" className="space-y-4 mt-4">
              <Card className="bg-zinc-800/50 border-zinc-700 p-4">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Network className="w-5 h-5 text-purple-400" />
                  공장 간 업무 및 생산 연관성
                </h3>
                <div className="space-y-4">
                  {factory.relationships.map((rel, index) => (
                    <Card key={index} className="bg-zinc-900 border-zinc-700 p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                          <Building2 className="w-5 h-5 text-purple-400" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold">{rel.factory}</h4>
                            <Badge variant="outline" className="text-xs">
                              {rel.type}
                            </Badge>
                          </div>
                          <p className="text-sm text-zinc-400">{rel.description}</p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </Card>

              <Card className="bg-zinc-800/50 border-zinc-700 p-4">
                <h3 className="text-sm font-semibold mb-4">물류 흐름도</h3>
                <div className="relative h-48 bg-zinc-900 rounded-lg p-6">
                  <div className="flex items-center justify-around h-full">
                    <div className="text-center">
                      <div className="w-20 h-20 rounded-full bg-blue-500/20 border-2 border-blue-500 flex items-center justify-center mb-2">
                        <span className="text-sm font-semibold">천안</span>
                      </div>
                      <p className="text-xs text-zinc-400">중간재 생산</p>
                    </div>
                    <div className="flex-1 flex items-center justify-center">
                      <ArrowUpRight className="w-8 h-8 text-blue-400" />
                    </div>
                    <div className="text-center">
                      <div className="w-20 h-20 rounded-full bg-green-500/20 border-2 border-green-500 flex items-center justify-center mb-2">
                        <span className="text-sm font-semibold">베트남</span>
                      </div>
                      <p className="text-xs text-zinc-400">최종 조립</p>
                    </div>
                    <div className="flex-1 flex items-center justify-center">
                      <ArrowUpRight className="w-8 h-8 text-blue-400" />
                    </div>
                    <div className="text-center">
                      <div className="w-20 h-20 rounded-full bg-yellow-500/20 border-2 border-yellow-500 flex items-center justify-center mb-2">
                        <span className="text-sm font-semibold">인도</span>
                      </div>
                      <p className="text-xs text-zinc-400">부품 공급</p>
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {selectedIssue && (
        <IssueDetailDialog isOpen={!!selectedIssue} onClose={() => setSelectedIssue(null)} issue={selectedIssue} />
      )}

      {selectedAction && (
        <ActionItemDialog isOpen={!!selectedAction} onClose={() => setSelectedAction(null)} action={selectedAction} />
      )}
    </>
  )
}
