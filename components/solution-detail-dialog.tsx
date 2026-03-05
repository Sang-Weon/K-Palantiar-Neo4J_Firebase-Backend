"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Calendar, Users, TrendingUp, CheckCircle2, Clock, DollarSign, AlertCircle, Target } from "lucide-react"
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend } from "recharts"

interface SolutionDetailDialogProps {
  isOpen: boolean
  onClose: () => void
  solution: {
    priority: string
    title: string
    impact: string
    cost: string
    timeline: string
  }
}

export function SolutionDetailDialog({ isOpen, onClose, solution }: SolutionDetailDialogProps) {
  // 실행 일정 타임라인
  const timeline = [
    {
      phase: "준비",
      department: "생산관리팀",
      duration: "1일",
      tasks: ["설비 가동 중지 계획 수립", "부품 발주 및 납품 확인", "작업자 안전 교육"],
      status: "완료",
    },
    {
      phase: "진단",
      department: "설비팀",
      duration: "1일",
      tasks: ["온도 센서 정밀 검사", "PID 컨트롤러 오류 로그 분석", "배선 및 연결부 점검"],
      status: "진행중",
    },
    {
      phase: "교체",
      department: "설비팀 + 외주",
      duration: "0.5일",
      tasks: ["불량 부품 제거", "신규 PID 컨트롤러 설치", "배선 재작업"],
      status: "대기",
    },
    {
      phase: "검증",
      department: "품질관리팀",
      duration: "0.5일",
      tasks: ["온도 캘리브레이션", "테스트 런 10회 실행", "품질 데이터 수집 및 분석"],
      status: "대기",
    },
  ]

  // 담당 부서별 역할
  const departments = [
    {
      name: "생산관리팀",
      role: "총괄 조정",
      leader: "김철수 차장",
      members: 3,
      responsibilities: ["프로젝트 일정 관리", "부서 간 협업 조정", "경영진 보고"],
    },
    {
      name: "설비팀",
      role: "실행 주체",
      leader: "이영희 과장",
      members: 5,
      responsibilities: ["설비 점검 및 진단", "부품 교체 작업", "설비 재가동 및 모니터링"],
    },
    {
      name: "품질관리팀",
      role: "검증 및 승인",
      leader: "박민수 과장",
      members: 4,
      responsibilities: ["품질 기준 검증", "테스트 런 감독", "최종 승인"],
    },
    {
      name: "구매팀",
      role: "지원",
      leader: "최지현 대리",
      members: 2,
      responsibilities: ["부품 긴급 발주", "외주 업체 계약", "예산 집행"],
    },
  ]

  // KPI 연관성 분석 (방사형 차트)
  const kpiRadarData = [
    { kpi: "생산량", 현재: 87, 목표: 100, 개선후: 98 },
    { kpi: "품질", 현재: 65, 목표: 95, 개선후: 92 },
    { kpi: "비용효율", 현재: 78, 목표: 90, 개선후: 88 },
    { kpi: "납기준수", 현재: 82, 목표: 95, 개선후: 93 },
    { kpi: "설비가동률", 현재: 88, 목표: 95, 개선후: 94 },
  ]

  // 효과 분석 데이터
  const effectAnalysis = [
    {
      category: "직접 효과",
      items: [
        { metric: "불량률 감소", value: "0.68% → 0.20%", impact: "월 1,200만원 절감" },
        { metric: "생산량 회복", value: "87% → 100%", impact: "월 매출 4,500만원 증가" },
        { metric: "설비 가동률", value: "88% → 94%", impact: "생산 효율 6% 개선" },
      ],
    },
    {
      category: "간접 효과",
      items: [
        { metric: "작업자 신뢰도", value: "+15%", impact: "안전사고 감소 예상" },
        { metric: "고객 만족도", value: "+12%", impact: "SEC 평가 점수 상승" },
        { metric: "예방 정비 체계", value: "구축", impact: "향후 유사 이슈 80% 예방" },
      ],
    },
  ]

  // 리스크 및 제약사항
  const risks = [
    { level: "높음", description: "부품 납기 지연 시 전체 일정 2-3일 지연", mitigation: "대체 공급업체 사전 확보" },
    { level: "중간", description: "테스트 런 중 추가 문제 발견 가능성", mitigation: "예비 시간 1일 확보" },
    { level: "낮음", description: "외주 작업자 숙련도 이슈", mitigation: "사내 설비팀 감독 배치" },
  ]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden bg-zinc-900 border-zinc-800">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Target className="w-6 h-6 text-blue-400" />
            상세 실행 계획
          </DialogTitle>
          <DialogDescription className="sr-only">해결 방안의 상세 실행 계획 및 담당 부서를 확인합니다.</DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[calc(90vh-100px)] pr-4">
          <div className="space-y-4">
            {/* 계획 개요 */}
            <Card className="bg-zinc-800/50 border-zinc-700 p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant={solution.priority === "긴급" ? "destructive" : "default"}>
                      {solution.priority}
                    </Badge>
                    <h3 className="text-lg font-semibold">{solution.title}</h3>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mt-3">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-green-400" />
                      <div>
                        <p className="text-xs text-zinc-400">예상 효과</p>
                        <p className="text-sm font-semibold text-green-400">{solution.impact}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-yellow-400" />
                      <div>
                        <p className="text-xs text-zinc-400">소요 비용</p>
                        <p className="text-sm font-semibold">{solution.cost}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-400" />
                      <div>
                        <p className="text-xs text-zinc-400">소요 기간</p>
                        <p className="text-sm font-semibold">{solution.timeline}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* 실행 일정 타임라인 */}
            <Card className="bg-zinc-800/50 border-zinc-700 p-4">
              <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-400" />
                단계별 실행 일정
              </h3>
              <div className="space-y-3">
                {timeline.map((phase, index) => (
                  <div key={index} className="relative">
                    {index !== timeline.length - 1 && (
                      <div className="absolute left-[15px] top-10 bottom-0 w-0.5 bg-zinc-700" />
                    )}
                    <div className="flex gap-3">
                      <div className="flex-shrink-0">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            phase.status === "완료"
                              ? "bg-green-500/20 text-green-400"
                              : phase.status === "진행중"
                                ? "bg-blue-500/20 text-blue-400 animate-pulse"
                                : "bg-zinc-700 text-zinc-400"
                          }`}
                        >
                          {phase.status === "완료" ? (
                            <CheckCircle2 className="w-4 h-4" />
                          ) : (
                            <span className="text-xs font-semibold">{index + 1}</span>
                          )}
                        </div>
                      </div>
                      <Card className="flex-1 bg-zinc-900 border-zinc-700 p-3">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold">{phase.phase}</h4>
                              <Badge variant="outline" className="text-xs">
                                {phase.duration}
                              </Badge>
                              <Badge
                                variant={
                                  phase.status === "완료"
                                    ? "default"
                                    : phase.status === "진행중"
                                      ? "default"
                                      : "outline"
                                }
                                className={
                                  phase.status === "완료"
                                    ? "bg-green-500/20 border-green-500/30 text-green-400"
                                    : phase.status === "진행중"
                                      ? "bg-blue-500/20 border-blue-500/30 text-blue-400"
                                      : ""
                                }
                              >
                                {phase.status}
                              </Badge>
                            </div>
                            <p className="text-xs text-zinc-400 flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              담당: {phase.department}
                            </p>
                          </div>
                        </div>
                        <ul className="space-y-1 mt-2">
                          {phase.tasks.map((task, idx) => (
                            <li key={idx} className="text-xs text-zinc-300 flex items-start gap-2">
                              <span className="text-blue-400 mt-0.5">•</span>
                              <span>{task}</span>
                            </li>
                          ))}
                        </ul>
                      </Card>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* 담당 부서 및 역할 */}
            <Card className="bg-zinc-800/50 border-zinc-700 p-4">
              <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-400" />
                담당 부서 및 책임
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {departments.map((dept, index) => (
                  <Card key={index} className="bg-zinc-900 border-zinc-700 p-3">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-sm">{dept.name}</h4>
                        <p className="text-xs text-zinc-400">{dept.role}</p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {dept.members}명
                      </Badge>
                    </div>
                    <div className="bg-zinc-800 rounded p-2 mb-2">
                      <p className="text-xs text-zinc-400">책임자</p>
                      <p className="text-sm font-semibold">{dept.leader}</p>
                    </div>
                    <div>
                      <p className="text-xs text-zinc-400 mb-1">주요 책임:</p>
                      <ul className="space-y-0.5">
                        {dept.responsibilities.map((resp, idx) => (
                          <li key={idx} className="text-xs text-zinc-300 flex items-start gap-1">
                            <span className="text-purple-400">→</span>
                            <span>{resp}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* KPI 연관성 분석 */}
              <Card className="bg-zinc-800/50 border-zinc-700 p-4">
                <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                  <Target className="w-4 h-4 text-green-400" />
                  KPI 영향 분석
                </h3>
                <ResponsiveContainer width="100%" height={280}>
                  <RadarChart data={kpiRadarData}>
                    <PolarGrid stroke="#3f3f46" />
                    <PolarAngleAxis dataKey="kpi" stroke="#a1a1aa" style={{ fontSize: "11px" }} />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#52525b" style={{ fontSize: "10px" }} />
                    <Radar name="현재" dataKey="현재" stroke="#ef4444" fill="#ef4444" fillOpacity={0.3} />
                    <Radar name="개선 후" dataKey="개선후" stroke="#22c55e" fill="#22c55e" fillOpacity={0.3} />
                    <Radar
                      name="목표"
                      dataKey="목표"
                      stroke="#3b82f6"
                      fill="none"
                      strokeDasharray="5 5"
                      strokeWidth={2}
                    />
                    <Legend
                      wrapperStyle={{ fontSize: "11px" }}
                      iconType="circle"
                      formatter={(value) => <span style={{ color: "#a1a1aa" }}>{value}</span>}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </Card>

              {/* 효과 분석 */}
              <Card className="bg-zinc-800/50 border-zinc-700 p-4">
                <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-yellow-400" />
                  기대 효과 분석
                </h3>
                <div className="space-y-3">
                  {effectAnalysis.map((category, index) => (
                    <div key={index}>
                      <h4 className="text-xs font-semibold text-zinc-400 mb-2">{category.category}</h4>
                      <div className="space-y-2">
                        {category.items.map((item, idx) => (
                          <Card key={idx} className="bg-zinc-900 border-zinc-700 p-2">
                            <div className="flex items-start justify-between mb-1">
                              <span className="text-xs font-semibold">{item.metric}</span>
                              <Badge
                                variant="outline"
                                className="text-xs bg-blue-500/10 border-blue-500/30 text-blue-400"
                              >
                                {item.value}
                              </Badge>
                            </div>
                            <p className="text-xs text-green-400">{item.impact}</p>
                          </Card>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* 리스크 및 대응 방안 */}
            <Card className="bg-zinc-800/50 border-zinc-700 p-4">
              <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-orange-400" />
                리스크 및 대응 방안
              </h3>
              <div className="space-y-2">
                {risks.map((risk, index) => (
                  <Card key={index} className="bg-zinc-900 border-zinc-700 p-3">
                    <div className="flex items-start gap-3">
                      <Badge
                        variant={risk.level === "높음" ? "destructive" : risk.level === "중간" ? "default" : "outline"}
                        className="mt-0.5"
                      >
                        {risk.level}
                      </Badge>
                      <div className="flex-1">
                        <p className="text-sm text-zinc-300 mb-2">{risk.description}</p>
                        <div className="bg-zinc-800 rounded p-2">
                          <p className="text-xs text-zinc-400 mb-1">대응 방안:</p>
                          <p className="text-xs text-blue-400">{risk.mitigation}</p>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>

            {/* 액션 버튼 */}
            <div className="flex gap-3 pt-2">
              <Button className="flex-1 bg-green-600 hover:bg-green-700">
                <CheckCircle2 className="w-4 h-4 mr-2" />
                실행 계획 승인
              </Button>
              <Button variant="outline" className="bg-transparent">
                PDF로 내보내기
              </Button>
              <Button variant="outline" className="bg-transparent" onClick={onClose}>
                닫기
              </Button>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
