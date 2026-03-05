"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Slider } from "@/components/ui/slider"
import { CheckCircle2, TrendingUp, Clock, Zap, Package, Loader2 } from "lucide-react"
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LineChart,
  Line,
} from "recharts"

interface ScenarioConfig {
  demandVolume: number
  dueDate: string
  facilityUtilization: number
  inventoryLevel: number
  maxOvertime: number
  outsourcingAllowed: boolean
}

interface SimulationResultDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  config: ScenarioConfig
}

interface OptimizationOption {
  id: string
  name: string
  description: string
  cost: number
  leadTime: number
  quality: number
  feasibility: number
}

type SimulationStage = "computing" | "completed"

export function SimulationResultDialog({ open, onOpenChange, config }: SimulationResultDialogProps) {
  const [stage, setStage] = useState<SimulationStage>("computing")
  const [progress, setProgress] = useState(0)
  const [timelinePosition, setTimelinePosition] = useState(0)
  const [selectedOption, setSelectedOption] = useState<string>("opt1")

  useEffect(() => {
    if (open) {
      setStage("computing")
      setProgress(0)

      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval)
            setTimeout(() => setStage("completed"), 500)
            return 100
          }
          return prev + 10
        })
      }, 300)

      return () => clearInterval(interval)
    }
  }, [open])

  const options: OptimizationOption[] = [
    {
      id: "opt1",
      name: "방안 1: 균형 최적화",
      description: "비용과 시간을 균형있게 고려한 방안",
      cost: 4200,
      leadTime: 18,
      quality: 94,
      feasibility: 92,
    },
    {
      id: "opt2",
      name: "방안 2: 비용 우선",
      description: "최소 비용으로 목표 달성",
      cost: 3800,
      leadTime: 25,
      quality: 91,
      feasibility: 88,
    },
    {
      id: "opt3",
      name: "방안 3: 납기 우선",
      description: "최단 시간 내 납품 완료",
      cost: 4800,
      leadTime: 14,
      quality: 96,
      feasibility: 85,
    },
  ]

  const comparisonData = [
    { metric: "비용", 방안1: 93, 방안2: 100, 방안3: 88, 목표: 95 },
    { metric: "납기", 방안1: 90, 방안2: 72, 방안3: 100, 목표: 85 },
    { metric: "품질", 방안1: 96, 방안2: 93, 방안3: 98, 목표: 94 },
  ]

  const ganttData = [
    { task: "자재 조달", start: 0, duration: 3, phase: "준비" },
    { task: "사출 공정", start: 3, duration: 5, phase: "생산" },
    { task: "도장 공정", start: 8, duration: 4, phase: "생산" },
    { task: "조립 공정", start: 12, duration: 3, phase: "생산" },
    { task: "품질 검사", start: 15, duration: 2, phase: "검증" },
    { task: "포장 및 출하", start: 17, duration: 1, phase: "완료" },
  ]

  const flowData = [
    { day: 1, 천안: 200, 베트남: 150, 인도: 100 },
    { day: 5, 천안: 450, 베트남: 380, 인도: 280 },
    { day: 10, 천안: 800, 베트남: 720, 인도: 550 },
    { day: 15, 천안: 1200, 베트남: 1100, 인도: 850 },
    { day: 18, 천안: 1500, 베트남: 1400, 인도: 1100 },
  ]

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case "준비":
        return "#3b82f6"
      case "생산":
        return "#8b5cf6"
      case "검증":
        return "#f59e0b"
      case "완료":
        return "#22c55e"
      default:
        return "#6b7280"
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl bg-zinc-900 border-zinc-800 text-white max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Zap className="w-6 h-6 text-blue-400" />
            시뮬레이션 결과
          </DialogTitle>
          <DialogDescription className="sr-only">AI 최적화 시뮬레이션 결과 및 방안을 확인합니다.</DialogDescription>
        </DialogHeader>

        {stage === "computing" ? (
          <div className="py-12 space-y-6">
            <div className="flex items-center justify-center">
              <Loader2 className="w-16 h-16 text-blue-400 animate-spin" />
            </div>
            <div className="text-center space-y-2">
              <div className="text-lg font-semibold">AI 최적화 실행 중...</div>
              <div className="text-sm text-zinc-400">
                {config.demandVolume.toLocaleString()}개 생산을 위한 최적 방안을 계산하고 있습니다
              </div>
            </div>
            <div className="max-w-md mx-auto">
              <Progress value={progress} className="h-3" />
              <div className="text-center text-sm text-zinc-400 mt-2">{progress}% 완료</div>
            </div>
          </div>
        ) : (
          <div className="space-y-6 mt-4">
            {/* 최적화 방안 카드 */}
            <div className="grid grid-cols-3 gap-4">
              {options.map((option) => (
                <Card
                  key={option.id}
                  className={`p-4 cursor-pointer transition-colors ${
                    selectedOption === option.id
                      ? "bg-blue-500/20 border-blue-500"
                      : "bg-zinc-800/50 border-zinc-700 hover:bg-zinc-800"
                  }`}
                  onClick={() => setSelectedOption(option.id)}
                >
                  <div className="space-y-3">
                    <div>
                      <div className="font-semibold mb-1">{option.name}</div>
                      <div className="text-xs text-zinc-400">{option.description}</div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-zinc-900/50 rounded p-2">
                        <div className="text-zinc-400">비용</div>
                        <div className="font-semibold text-green-400">{option.cost}만원</div>
                      </div>
                      <div className="bg-zinc-900/50 rounded p-2">
                        <div className="text-zinc-400">납기</div>
                        <div className="font-semibold text-blue-400">{option.leadTime}일</div>
                      </div>
                      <div className="bg-zinc-900/50 rounded p-2">
                        <div className="text-zinc-400">품질</div>
                        <div className="font-semibold text-purple-400">{option.quality}점</div>
                      </div>
                      <div className="bg-zinc-900/50 rounded p-2">
                        <div className="text-zinc-400">실행가능성</div>
                        <div className="font-semibold text-yellow-400">{option.feasibility}%</div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* KPI 비교 */}
            <Card className="bg-zinc-800/50 border-zinc-700 p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-400" />
                KPI 비교 분석
              </h3>
              <ResponsiveContainer width="100%" height={350}>
                <RadarChart data={comparisonData}>
                  <PolarGrid stroke="#3f3f46" />
                  <PolarAngleAxis dataKey="metric" stroke="#a1a1aa" tick={{ fill: "#a1a1aa", fontSize: 14 }} />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#3f3f46" tick={{ fill: "#71717a" }} />
                  <Radar
                    name="방안1"
                    dataKey="방안1"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.3}
                    strokeWidth={2}
                  />
                  <Radar
                    name="방안2"
                    dataKey="방안2"
                    stroke="#8b5cf6"
                    fill="#8b5cf6"
                    fillOpacity={0.3}
                    strokeWidth={2}
                  />
                  <Radar
                    name="방안3"
                    dataKey="방안3"
                    stroke="#22c55e"
                    fill="#22c55e"
                    fillOpacity={0.3}
                    strokeWidth={2}
                  />
                  <Radar
                    name="목표"
                    dataKey="목표"
                    stroke="#ef4444"
                    fill="#ef4444"
                    fillOpacity={0.1}
                    strokeWidth={2}
                    strokeDasharray="5 5"
                  />
                  <Legend wrapperStyle={{ paddingTop: "20px" }} iconType="circle" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#18181b",
                      border: "1px solid #3f3f46",
                      borderRadius: "6px",
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </Card>

            {/* Gantt 차트 */}
            <Card className="bg-zinc-800/50 border-zinc-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Clock className="w-5 h-5 text-purple-400" />
                  생산 일정 타임라인
                </h3>
                <Badge className="bg-blue-500/20 text-blue-400">{selectedOption}</Badge>
              </div>

              {/* Timeline Slider */}
              <div className="mb-6">
                <div className="flex items-center justify-between text-sm text-zinc-400 mb-2">
                  <span>Day 0</span>
                  <span>Day {timelinePosition}</span>
                  <span>Day 18</span>
                </div>
                <Slider
                  value={[timelinePosition]}
                  onValueChange={(value) => setTimelinePosition(value[0])}
                  max={18}
                  step={1}
                  className="mb-2"
                />
              </div>

              {/* Gantt Bars */}
              <div className="space-y-3">
                {ganttData.map((item, index) => (
                  <div key={index} className="relative">
                    <div className="text-sm mb-1 flex items-center justify-between">
                      <span className="text-zinc-300">{item.task}</span>
                      <Badge variant="outline" style={{ backgroundColor: `${getPhaseColor(item.phase)}20` }}>
                        {item.phase}
                      </Badge>
                    </div>
                    <div className="relative h-8 bg-zinc-900 rounded overflow-hidden">
                      <div className="absolute inset-0 flex">
                        {Array.from({ length: 18 }).map((_, i) => (
                          <div key={i} className="flex-1 border-r border-zinc-800" />
                        ))}
                      </div>
                      <div
                        className="absolute h-full rounded transition-all"
                        style={{
                          left: `${(item.start / 18) * 100}%`,
                          width: `${(item.duration / 18) * 100}%`,
                          backgroundColor: getPhaseColor(item.phase),
                          opacity:
                            timelinePosition >= item.start && timelinePosition <= item.start + item.duration ? 1 : 0.5,
                        }}
                      >
                        <div className="flex items-center justify-center h-full text-xs font-semibold">
                          {item.duration}일
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* 자재 흐름 */}
            <Card className="bg-zinc-800/50 border-zinc-700 p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Package className="w-5 h-5 text-green-400" />
                공장별 생산 흐름
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={flowData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
                  <XAxis
                    dataKey="day"
                    stroke="#a1a1aa"
                    label={{ value: "일차", position: "insideBottom", offset: -5 }}
                  />
                  <YAxis stroke="#a1a1aa" label={{ value: "생산량", angle: -90, position: "insideLeft" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#18181b",
                      border: "1px solid #3f3f46",
                      borderRadius: "6px",
                    }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="천안" stroke="#3b82f6" strokeWidth={2} />
                  <Line type="monotone" dataKey="베트남" stroke="#8b5cf6" strokeWidth={2} />
                  <Line type="monotone" dataKey="인도" stroke="#22c55e" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </Card>

            {/* 주요 인사이트 */}
            <div className="grid grid-cols-3 gap-4">
              <Card className="bg-green-500/10 border-green-500/30 p-4">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-8 h-8 text-green-400" />
                  <div>
                    <div className="text-sm text-zinc-400">비용 절감</div>
                    <div className="text-2xl font-bold text-green-400">-12.5%</div>
                  </div>
                </div>
              </Card>
              <Card className="bg-blue-500/10 border-blue-500/30 p-4">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-8 h-8 text-blue-400" />
                  <div>
                    <div className="text-sm text-zinc-400">납기 단축</div>
                    <div className="text-2xl font-bold text-blue-400">-3일</div>
                  </div>
                </div>
              </Card>
              <Card className="bg-purple-500/10 border-purple-500/30 p-4">
                <div className="flex items-center gap-3">
                  <Zap className="w-8 h-8 text-purple-400" />
                  <div>
                    <div className="text-sm text-zinc-400">자원 효율</div>
                    <div className="text-2xl font-bold text-purple-400">+18%</div>
                  </div>
                </div>
              </Card>
            </div>

            {/* 액션 버튼 */}
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1 bg-transparent" onClick={() => onOpenChange(false)}>
                닫기
              </Button>
              <Button className="flex-1 bg-green-600 hover:bg-green-700">
                <CheckCircle2 className="w-4 h-4 mr-2" />
                선택한 방안 승인
              </Button>
              <Button variant="outline" className="flex-1 bg-transparent">
                새 시나리오 생성
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
