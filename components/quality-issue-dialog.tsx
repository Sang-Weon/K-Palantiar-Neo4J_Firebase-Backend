"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertCircle, CheckCircle2, Clock, User, FileText } from "lucide-react"
import { QualityImpactCalculator } from "./quality-impact-calculator"

interface QualityIssue {
  id: string
  title: string
  severity: "high" | "medium" | "low"
  process: string
  defectRate: number
  occurredAt: string
}

interface QualityIssueDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  issue: QualityIssue
}

interface ActionItem {
  id: string
  title: string
  assignee: string
  dueDate: string
  status: "pending" | "in-progress" | "completed"
}

export function QualityIssueDialog({ open, onOpenChange, issue }: QualityIssueDialogProps) {
  const [activeTab, setActiveTab] = useState("details")
  const [showImpactCalculator, setShowImpactCalculator] = useState(false)
  const [actionItems, setActionItems] = useState<ActionItem[]>([
    {
      id: "A001",
      title: "설비 점검 및 조정",
      assignee: "김철수",
      dueDate: "2026-01-15",
      status: "in-progress",
    },
    {
      id: "A002",
      title: "작업 표준서 업데이트",
      assignee: "이영희",
      dueDate: "2026-01-20",
      status: "pending",
    },
  ])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge className="bg-green-500/20 text-green-400 border-green-500/50">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            완료
          </Badge>
        )
      case "in-progress":
        return (
          <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/50">
            <Clock className="w-3 h-3 mr-1" />
            진행중
          </Badge>
        )
      case "pending":
        return (
          <Badge variant="outline" className="text-zinc-400">
            대기
          </Badge>
        )
    }
  }

  const handleImpactConfirm = (impact: any) => {
    window.dispatchEvent(
      new CustomEvent("qualityImpactConfirmed", {
        detail: { issueId: issue.id, impact },
      }),
    )
    setShowImpactCalculator(false)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl bg-zinc-900 border-zinc-800 text-white max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <AlertCircle className="w-6 h-6 text-red-400" />
            품질 이슈 워크플로우
          </DialogTitle>
          <DialogDescription className="sr-only">품질 이슈 상세 정보 및 조치 계획을 관리합니다.</DialogDescription>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="destructive">{issue.severity.toUpperCase()}</Badge>
            <span className="text-sm text-zinc-400">{issue.id}</span>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-5 bg-zinc-800">
            <TabsTrigger value="details">이슈 상세</TabsTrigger>
            <TabsTrigger value="action-plan">조치 계획</TabsTrigger>
            <TabsTrigger value="action-items">액션 아이템</TabsTrigger>
            <TabsTrigger value="verification">검증 결과</TabsTrigger>
            <TabsTrigger value="impact">영향도 분석</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4 mt-4">
            <Card className="bg-zinc-800/50 border-zinc-700 p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-400" />
                이슈 정보
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-zinc-400 mb-1">제목</div>
                  <div className="font-semibold">{issue.title}</div>
                </div>
                <div>
                  <div className="text-zinc-400 mb-1">발생 공정</div>
                  <div className="font-semibold">{issue.process}</div>
                </div>
                <div>
                  <div className="text-zinc-400 mb-1">불량률</div>
                  <div className="font-semibold text-red-400">{issue.defectRate}%</div>
                </div>
                <div>
                  <div className="text-zinc-400 mb-1">발생 시간</div>
                  <div className="font-semibold">{issue.occurredAt}</div>
                </div>
              </div>
            </Card>

            <Card className="bg-zinc-800/50 border-zinc-700 p-4">
              <h3 className="font-semibold mb-3">근본 원인 분석</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-zinc-400">직접 원인:</span> 조립 토크 설정값 부족 (현재 140N, 요구 150N)
                </div>
                <div>
                  <span className="text-zinc-400">간접 원인:</span> 설비 노후화로 인한 정밀도 저하
                </div>
                <div>
                  <span className="text-zinc-400">근본 원인:</span> 정기 점검 주기 미준수 및 예방 보전 체계 미흡
                </div>
              </div>
            </Card>

            <Card className="bg-zinc-800/50 border-zinc-700 p-4">
              <h3 className="font-semibold mb-3">영향 범위</h3>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-red-500/10 border border-red-500/30 rounded p-3 text-center">
                  <div className="text-xs text-zinc-400 mb-1">영향받은 제품</div>
                  <div className="text-2xl font-bold text-red-400">234</div>
                  <div className="text-xs text-zinc-400 mt-1">개</div>
                </div>
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded p-3 text-center">
                  <div className="text-xs text-zinc-400 mb-1">예상 손실</div>
                  <div className="text-2xl font-bold text-yellow-400">5.2</div>
                  <div className="text-xs text-zinc-400 mt-1">백만원</div>
                </div>
                <div className="bg-blue-500/10 border border-blue-500/30 rounded p-3 text-center">
                  <div className="text-xs text-zinc-400 mb-1">복구 예상 시간</div>
                  <div className="text-2xl font-bold text-blue-400">8</div>
                  <div className="text-xs text-zinc-400 mt-1">시간</div>
                </div>
              </div>
            </Card>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                닫기
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setActiveTab("action-plan")}>
                조치 계획 작성
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="action-plan" className="space-y-4 mt-4">
            <Card className="bg-zinc-800/50 border-zinc-700 p-4">
              <h3 className="font-semibold mb-3">임시 조치 (Containment)</h3>
              <div className="space-y-3">
                <div>
                  <Label>조치 내용</Label>
                  <Textarea
                    placeholder="임시 조치 내용을 입력하세요..."
                    className="mt-1 bg-zinc-900 border-zinc-700"
                    defaultValue="1. 해당 라인 즉시 중단
2. 불량품 234개 격리 및 재검사 실시
3. 토크 설정값을 140N에서 155N으로 조정"
                  />
                </div>
              </div>
            </Card>

            <Card className="bg-zinc-800/50 border-zinc-700 p-4">
              <h3 className="font-semibold mb-3">영구 대책 (Corrective Action)</h3>
              <div className="space-y-3">
                <div>
                  <Label>대책 내용</Label>
                  <Textarea
                    placeholder="영구 대책 내용을 입력하세요..."
                    className="mt-1 bg-zinc-900 border-zinc-700"
                    defaultValue="1. 조립 설비 토크 센서 교체 (예산: 300만원)
2. 정기 점검 주기를 월 1회에서 주 1회로 변경
3. 작업자 재교육 프로그램 실시
4. SPC 관리도 도입으로 실시간 모니터링 강화"
                  />
                </div>
              </div>
            </Card>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setActiveTab("details")}>
                이전
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setActiveTab("action-items")}>
                액션 아이템 생성
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="action-items" className="space-y-4 mt-4">
            <Card className="bg-zinc-800/50 border-zinc-700 p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">액션 아이템 목록</h3>
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                  + 새 아이템 추가
                </Button>
              </div>

              <div className="space-y-3">
                {actionItems.map((item) => (
                  <Card key={item.id} className="bg-zinc-900/50 border-zinc-700 p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getStatusBadge(item.status)}
                          <span className="text-xs text-zinc-400">{item.id}</span>
                        </div>
                        <div className="font-semibold mb-2">{item.title}</div>
                        <div className="flex items-center gap-4 text-xs text-zinc-400">
                          <div className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {item.assignee}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {item.dueDate}
                          </div>
                        </div>
                      </div>
                      <Select
                        defaultValue={item.status}
                        onValueChange={(value) => {
                          setActionItems(
                            actionItems.map((a) =>
                              a.id === item.id ? { ...a, status: value as ActionItem["status"] } : a,
                            ),
                          )
                        }}
                      >
                        <SelectTrigger className="w-32 bg-zinc-900 border-zinc-700">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-900 border-zinc-700">
                          <SelectItem value="pending">대기</SelectItem>
                          <SelectItem value="in-progress">진행중</SelectItem>
                          <SelectItem value="completed">완료</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>

            <Card className="bg-zinc-800/50 border-zinc-700 p-4">
              <h3 className="font-semibold mb-3">새 액션 아이템 추가</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <Label>제목</Label>
                  <Input placeholder="액션 아이템 제목" className="mt-1 bg-zinc-900 border-zinc-700" />
                </div>
                <div>
                  <Label>담당자</Label>
                  <Input placeholder="담당자 이름" className="mt-1 bg-zinc-900 border-zinc-700" />
                </div>
                <div>
                  <Label>마감일</Label>
                  <Input type="date" className="mt-1 bg-zinc-900 border-zinc-700" />
                </div>
              </div>
            </Card>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setActiveTab("action-plan")}>
                이전
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setActiveTab("verification")}>
                검증 단계로
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="verification" className="space-y-4 mt-4">
            <Card className="bg-zinc-800/50 border-zinc-700 p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-400" />
                재발 방지 검증
              </h3>
              <div className="space-y-3">
                <div>
                  <Label>검증 방법</Label>
                  <Textarea
                    placeholder="검증 방법을 입력하세요..."
                    className="mt-1 bg-zinc-900 border-zinc-700"
                    defaultValue="1. 조립 토크 값 연속 100개 샘플 측정
2. 모든 샘플이 150N 이상 기준 충족 확인
3. 7일간 불량률 모니터링 (목표: <0.5%)"
                  />
                </div>
                <div>
                  <Label>검증 결과</Label>
                  <Textarea
                    placeholder="검증 결과를 입력하세요..."
                    className="mt-1 bg-zinc-900 border-zinc-700"
                    defaultValue="[2026-01-18 검증 완료]
- 샘플 100개 측정: 평균 158N (최소 152N, 최대 164N)
- 7일간 불량률: 0.3% (목표 달성)
- 재발 없음 확인"
                  />
                </div>
              </div>
            </Card>

            <Card className="bg-green-500/10 border-green-500/30 p-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-8 h-8 text-green-400" />
                <div>
                  <div className="font-semibold text-green-400">검증 완료</div>
                  <div className="text-sm text-zinc-300">모든 조치가 완료되었으며 재발 방지가 확인되었습니다.</div>
                </div>
              </div>
            </Card>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setActiveTab("action-items")}>
                이전
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setActiveTab("impact")}>
                영향도 분석으로
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="impact" className="mt-4">
            <QualityImpactCalculator issueTitle={issue.title} onConfirm={handleImpactConfirm} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
