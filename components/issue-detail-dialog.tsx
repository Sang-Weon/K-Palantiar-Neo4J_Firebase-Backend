"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { AlertTriangle, Lightbulb, TrendingDown, CheckCircle2, Clock, Users, BarChart3, Sparkles } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { SolutionDetailDialog } from "./solution-detail-dialog"
import { useState } from "react"

interface IssueDetailDialogProps {
  isOpen: boolean
  onClose: () => void
  issue: {
    id: string
    title: string
    severity: string
    date: string
  }
}

export function IssueDetailDialog({ isOpen, onClose, issue }: IssueDetailDialogProps) {
  const [selectedSolution, setSelectedSolution] = useState<any>(null)
  const [isSolutionDialogOpen, setIsSolutionDialogOpen] = useState(false)

  // 이슈 영향도 데이터
  const impactData = [
    { date: "1주전", 불량률: 0.3, 생산량: 100 },
    { date: "6일전", 불량률: 0.35, 생산량: 98 },
    { date: "5일전", 불량률: 0.42, 생산량: 95 },
    { date: "4일전", 불량률: 0.58, 생산량: 92 },
    { date: "3일전", 불량률: 0.65, 생산량: 88 },
    { date: "2일전", 불량률: 0.72, 생산량: 85 },
    { date: "어제", 불량률: 0.68, 생산량: 87 },
  ]

  // 근본 원인 분석
  const rootCauses = [
    {
      category: "설비 이상",
      probability: 75,
      description: "사출 성형기 #3의 온도 제어 시스템 오작동",
      evidence: ["온도 로그에서 ±5°C 편차 감지", "성형 사이클 시간 15% 증가", "불량품 80%가 해당 설비에서 발생"],
    },
    {
      category: "원자재 품질",
      probability: 45,
      description: "최근 입고된 폴리머 수지 배치의 점도 불균일",
      evidence: ["입고 검사 데이터에서 점도 편차 확인", "동일 배치 사용 시 불량률 상승 패턴"],
    },
    {
      category: "작업 환경",
      probability: 30,
      description: "공장 내 습도 상승으로 인한 원료 흡습",
      evidence: ["최근 1주일간 평균 습도 65% → 78%", "건조 시간 부족 가능성"],
    },
  ]

  // AI 추천 해결방안
  const solutions = [
    {
      priority: "긴급",
      title: "설비 #3 온도 제어 시스템 점검 및 교체",
      impact: "불량률 70% 감소 예상",
      cost: "2,500만원",
      timeline: "2-3일",
      steps: [
        "설비 가동 중지 및 안전 점검",
        "온도 센서 및 제어 모듈 진단",
        "불량 부품 교체 (예상: PID 컨트롤러)",
        "캘리브레이션 및 테스트 런",
      ],
      kpis: [
        { metric: "불량률", current: "0.68%", target: "0.20%", improvement: "71%" },
        { metric: "생산량", current: "87%", target: "100%", improvement: "15%" },
      ],
    },
    {
      priority: "높음",
      title: "원자재 배치 전수 검사 및 재고 관리 강화",
      impact: "향후 유사 이슈 50% 예방",
      cost: "800만원 (검사 장비)",
      timeline: "1주일",
      steps: [
        "현재 재고 중 의심 배치 식별 및 격리",
        "입고 검사 기준 강화 (점도, 수분 함량)",
        "공급업체와 품질 기준 재협의",
        "실시간 품질 모니터링 시스템 도입",
      ],
      kpis: [
        { metric: "원자재 불량률", current: "2.3%", target: "0.5%", improvement: "78%" },
        { metric: "공정 안정성", current: "85%", target: "95%", improvement: "12%" },
      ],
    },
    {
      priority: "중간",
      title: "공장 환경 제어 시스템 개선",
      impact: "장기적 품질 안정성 향상",
      cost: "5,000만원",
      timeline: "2주일",
      steps: [
        "제습 시스템 용량 증설",
        "원료 저장 구역 온습도 관리 강화",
        "자동화된 환경 모니터링 구축",
        "계절별 환경 관리 프로토콜 수립",
      ],
      kpis: [
        { metric: "습도 편차", current: "±15%", target: "±5%", improvement: "67%" },
        { metric: "원료 품질 유지", current: "90%", target: "98%", improvement: "9%" },
      ],
    },
  ]

  const handleViewSolutionDetail = (solution: any) => {
    setSelectedSolution(solution)
    setIsSolutionDialogOpen(true)
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-5xl max-h-[85vh] overflow-hidden bg-zinc-900 border-zinc-800">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-yellow-400" />
              이슈 상세 분석
            </DialogTitle>
            <DialogDescription className="sr-only">이슈 상세 정보 및 AI 기반 해결 방안을 확인합니다.</DialogDescription>
          </DialogHeader>

          <ScrollArea className="h-[calc(85vh-100px)] pr-4">
            <div className="space-y-4">
              {/* 이슈 기본 정보 */}
              <Card className="bg-zinc-800/50 border-zinc-700 p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge
                        variant={
                          issue.severity === "높음" ? "destructive" : issue.severity === "중간" ? "default" : "outline"
                        }
                      >
                        {issue.severity}
                      </Badge>
                      <span className="text-sm text-zinc-400">{issue.date}</span>
                    </div>
                    <h3 className="text-lg font-semibold">{issue.title}</h3>
                  </div>
                  <Badge variant="outline" className="bg-red-500/10 border-red-500/30 text-red-400">
                    진행중
                  </Badge>
                </div>

                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div className="flex items-center gap-2">
                    <TrendingDown className="w-4 h-4 text-red-400" />
                    <div>
                      <p className="text-xs text-zinc-400">생산 영향</p>
                      <p className="text-sm font-semibold">-13% 감소</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-yellow-400" />
                    <div>
                      <p className="text-xs text-zinc-400">발생 기간</p>
                      <p className="text-sm font-semibold">7일</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-400" />
                    <div>
                      <p className="text-xs text-zinc-400">담당팀</p>
                      <p className="text-sm font-semibold">생산관리팀</p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* 영향도 트렌드 */}
              <Card className="bg-zinc-800/50 border-zinc-700 p-4">
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-blue-400" />
                  불량률 및 생산량 추이
                </h3>
                <ResponsiveContainer width="100%" height={180}>
                  <LineChart data={impactData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
                    <XAxis dataKey="date" stroke="#a1a1aa" style={{ fontSize: "11px" }} />
                    <YAxis yAxisId="left" stroke="#ef4444" style={{ fontSize: "11px" }} />
                    <YAxis yAxisId="right" orientation="right" stroke="#22c55e" style={{ fontSize: "11px" }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#27272a", border: "1px solid #3f3f46", borderRadius: "6px" }}
                    />
                    <Line yAxisId="left" type="monotone" dataKey="불량률" stroke="#ef4444" strokeWidth={2} />
                    <Line yAxisId="right" type="monotone" dataKey="생산량" stroke="#22c55e" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </Card>

              <Tabs defaultValue="diagnosis" className="w-full">
                <TabsList className="bg-zinc-800">
                  <TabsTrigger value="diagnosis">근본 원인 진단</TabsTrigger>
                  <TabsTrigger value="solutions">해결 방안</TabsTrigger>
                </TabsList>

                {/* 근본 원인 진단 */}
                <TabsContent value="diagnosis" className="space-y-3 mt-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <p className="text-sm text-zinc-400">AI 기반 다차원 분석 결과</p>
                  </div>

                  {rootCauses.map((cause, index) => (
                    <Card key={index} className="bg-zinc-800/50 border-zinc-700 p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold">{cause.category}</h4>
                            <Badge variant={cause.probability > 60 ? "destructive" : "outline"}>
                              확률 {cause.probability}%
                            </Badge>
                          </div>
                          <p className="text-sm text-zinc-300 mb-3">{cause.description}</p>
                        </div>
                      </div>
                      <div className="bg-zinc-900 rounded p-3">
                        <p className="text-xs font-semibold text-zinc-400 mb-2">근거 데이터:</p>
                        <ul className="space-y-1">
                          {cause.evidence.map((item, idx) => (
                            <li key={idx} className="text-xs text-zinc-400 flex items-start gap-2">
                              <span className="text-blue-400 mt-0.5">•</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </Card>
                  ))}
                </TabsContent>

                {/* 해결 방안 */}
                <TabsContent value="solutions" className="space-y-3 mt-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb className="w-4 h-4 text-yellow-400" />
                    <p className="text-sm text-zinc-400">우선순위별 실행 가능 방안</p>
                  </div>

                  {solutions.map((solution, index) => (
                    <Card key={index} className="bg-zinc-800/50 border-zinc-700 p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge
                              variant={
                                solution.priority === "긴급"
                                  ? "destructive"
                                  : solution.priority === "높음"
                                    ? "default"
                                    : "outline"
                              }
                            >
                              {solution.priority}
                            </Badge>
                            <h4 className="font-semibold">{solution.title}</h4>
                          </div>
                          <div className="grid grid-cols-3 gap-3 text-xs mb-3">
                            <div>
                              <span className="text-zinc-400">예상 효과:</span>
                              <span className="ml-1 text-green-400">{solution.impact}</span>
                            </div>
                            <div>
                              <span className="text-zinc-400">비용:</span>
                              <span className="ml-1 font-mono">{solution.cost}</span>
                            </div>
                            <div>
                              <span className="text-zinc-400">소요 시간:</span>
                              <span className="ml-1">{solution.timeline}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 실행 단계 */}
                      <div className="bg-zinc-900 rounded p-3 mb-3">
                        <p className="text-xs font-semibold text-zinc-400 mb-2">실행 단계:</p>
                        <ol className="space-y-2">
                          {solution.steps.map((step, idx) => (
                            <li key={idx} className="text-xs text-zinc-300 flex items-start gap-2">
                              <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center flex-shrink-0 text-[10px] font-semibold">
                                {idx + 1}
                              </span>
                              <span className="mt-0.5">{step}</span>
                            </li>
                          ))}
                        </ol>
                      </div>

                      {/* KPI 개선 예측 */}
                      <div className="bg-zinc-900 rounded p-3">
                        <p className="text-xs font-semibold text-zinc-400 mb-2">예상 KPI 개선:</p>
                        <div className="space-y-2">
                          {solution.kpis.map((kpi, idx) => (
                            <div key={idx} className="flex items-center justify-between text-xs">
                              <span className="text-zinc-400">{kpi.metric}</span>
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-red-400">{kpi.current}</span>
                                <span className="text-zinc-600">→</span>
                                <span className="font-mono text-green-400">{kpi.target}</span>
                                <Badge variant="outline" className="bg-green-500/10 border-green-500/30 text-green-400">
                                  +{kpi.improvement}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-2 mt-3">
                        <Button size="sm" className="flex-1 bg-blue-600 hover:bg-blue-700">
                          <CheckCircle2 className="w-4 h-4 mr-1" />이 방안 실행
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="bg-transparent"
                          onClick={() => handleViewSolutionDetail(solution)}
                        >
                          상세 계획 보기
                        </Button>
                      </div>
                    </Card>
                  ))}
                </TabsContent>
              </Tabs>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* 상세 계획 보기 다이얼로그 */}
      {selectedSolution && (
        <SolutionDetailDialog
          isOpen={isSolutionDialogOpen}
          onClose={() => setIsSolutionDialogOpen(false)}
          solution={selectedSolution}
        />
      )}
    </>
  )
}
