"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import {
  ListChecks,
  User,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Clock,
  FileText,
  MessageSquare,
  Paperclip,
} from "lucide-react"

interface ActionItemDialogProps {
  isOpen: boolean
  onClose: () => void
  action: {
    id: string
    title: string
    assignee: string
    dueDate: string
    status: string
  }
}

export function ActionItemDialog({ isOpen, onClose, action }: ActionItemDialogProps) {
  const [progress, setProgress] = useState(65)

  // 액션 상세 정보
  const actionDetails = {
    description: "사출 성형기 #3의 온도 제어 시스템 점검 및 필요시 부품 교체 작업",
    priority: "긴급",
    category: "설비 개선",
    estimatedHours: 16,
    actualHours: 10.5,
    budget: "2,500만원",
    dependencies: ["예산 승인", "설비 부품 입고"],
  }

  // 진행 히스토리
  const history = [
    {
      date: "2026-01-10 14:30",
      user: "김철수",
      action: "액션 아이템 생성",
      comment: "불량률 증가에 따른 긴급 조치 필요",
    },
    {
      date: "2026-01-12 09:00",
      user: "이영희",
      action: "설비 초기 점검 완료",
      comment: "온도 센서 및 PID 컨트롤러 이상 확인",
    },
    {
      date: "2026-01-15 11:20",
      user: "박민수",
      action: "교체 부품 주문",
      comment: "PID 컨트롤러 모델 ABC-123 발주 (납기: 2일)",
    },
    {
      date: "2026-01-18 15:45",
      user: "김철수",
      action: "진행률 업데이트",
      comment: "부품 입고 완료, 교체 작업 준비중 (65%)",
    },
  ]

  // 체크리스트
  const [checklist, setChecklist] = useState([
    { id: 1, task: "설비 가동 중지 및 안전 점검", completed: true },
    { id: 2, task: "온도 센서 진단", completed: true },
    { id: 3, task: "PID 컨트롤러 진단", completed: true },
    { id: 4, task: "교체 부품 입고", completed: true },
    { id: 5, task: "불량 부품 교체", completed: false },
    { id: 6, task: "캘리브레이션", completed: false },
    { id: 7, task: "테스트 런", completed: false },
    { id: 8, task: "정상 가동 확인", completed: false },
  ])

  const completedTasks = checklist.filter((item) => item.completed).length

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden bg-zinc-900 border-zinc-800">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <ListChecks className="w-6 h-6 text-blue-400" />
            액션 아이템 상세
          </DialogTitle>
          <DialogDescription className="sr-only">액션 아이템 진행 상황 및 체크리스트를 관리합니다.</DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[calc(85vh-100px)] pr-4">
          <div className="space-y-4">
            {/* 액션 기본 정보 */}
            <Card className="bg-zinc-800/50 border-zinc-700 p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge
                      variant={
                        action.status === "완료" ? "default" : action.status === "진행중" ? "outline" : "destructive"
                      }
                    >
                      {action.status}
                    </Badge>
                    <Badge variant="destructive">{actionDetails.priority}</Badge>
                    <Badge variant="outline">{actionDetails.category}</Badge>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{action.title}</h3>
                  <p className="text-sm text-zinc-400">{actionDetails.description}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-4 text-sm">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-400" />
                  <div>
                    <p className="text-xs text-zinc-400">담당자</p>
                    <p className="font-semibold">{action.assignee}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-yellow-400" />
                  <div>
                    <p className="text-xs text-zinc-400">마감일</p>
                    <p className="font-semibold">{action.dueDate}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-green-400" />
                  <div>
                    <p className="text-xs text-zinc-400">소요 시간</p>
                    <p className="font-semibold">
                      {actionDetails.actualHours} / {actionDetails.estimatedHours}h
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-purple-400" />
                  <div>
                    <p className="text-xs text-zinc-400">예산</p>
                    <p className="font-semibold">{actionDetails.budget}</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* 진행률 */}
            <Card className="bg-zinc-800/50 border-zinc-700 p-4">
              <div className="flex items-center justify-between mb-2">
                <Label className="text-sm font-semibold">전체 진행률</Label>
                <span className="text-2xl font-bold font-mono text-blue-400">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2 mb-3" />
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span>
                  체크리스트: {completedTasks}/{checklist.length} 완료
                </span>
                <span>예상 완료: 1일 남음</span>
              </div>
            </Card>

            <Tabs defaultValue="checklist" className="w-full">
              <TabsList className="bg-zinc-800">
                <TabsTrigger value="checklist">체크리스트</TabsTrigger>
                <TabsTrigger value="history">진행 히스토리</TabsTrigger>
                <TabsTrigger value="dependencies">선행 조건</TabsTrigger>
              </TabsList>

              {/* 체크리스트 */}
              <TabsContent value="checklist" className="space-y-2 mt-3">
                {checklist.map((item) => (
                  <Card
                    key={item.id}
                    className={`bg-zinc-800/50 border-zinc-700 p-3 cursor-pointer transition-colors hover:bg-zinc-800 ${
                      item.completed ? "opacity-60" : ""
                    }`}
                    onClick={() => {
                      const newChecklist = checklist.map((c) =>
                        c.id === item.id ? { ...c, completed: !c.completed } : c,
                      )
                      setChecklist(newChecklist)
                      const completed = newChecklist.filter((c) => c.completed).length
                      setProgress(Math.round((completed / checklist.length) * 100))
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                          item.completed ? "bg-green-500 border-green-500" : "border-zinc-600 hover:border-zinc-500"
                        }`}
                      >
                        {item.completed && <CheckCircle2 className="w-4 h-4 text-white" />}
                      </div>
                      <span className={`text-sm ${item.completed ? "line-through text-zinc-500" : ""}`}>
                        {item.task}
                      </span>
                    </div>
                  </Card>
                ))}

                <Button className="w-full mt-3 bg-blue-600 hover:bg-blue-700">
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  진행률 저장
                </Button>
              </TabsContent>

              {/* 진행 히스토리 */}
              <TabsContent value="history" className="space-y-3 mt-3">
                <div className="relative">
                  {history.map((item, index) => (
                    <div key={index} className="relative pl-8 pb-4">
                      {/* 타임라인 라인 */}
                      {index < history.length - 1 && (
                        <div className="absolute left-2 top-6 bottom-0 w-0.5 bg-zinc-700" />
                      )}

                      {/* 타임라인 점 */}
                      <div className="absolute left-0 top-1 w-4 h-4 rounded-full bg-blue-500 border-2 border-zinc-900" />

                      <Card className="bg-zinc-800/50 border-zinc-700 p-3">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="text-xs text-zinc-500">{item.date}</p>
                            <p className="text-sm font-semibold mt-1">{item.action}</p>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {item.user}
                          </Badge>
                        </div>
                        <p className="text-xs text-zinc-400">{item.comment}</p>
                      </Card>
                    </div>
                  ))}
                </div>

                {/* 코멘트 추가 */}
                <Card className="bg-zinc-800/50 border-zinc-700 p-4">
                  <Label className="text-sm font-semibold mb-2 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-blue-400" />새 업데이트 추가
                  </Label>
                  <Textarea
                    placeholder="진행 상황이나 이슈를 작성하세요..."
                    className="bg-zinc-900 border-zinc-700 mb-2"
                    rows={3}
                  />
                  <div className="flex gap-2">
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                      업데이트 등록
                    </Button>
                    <Button size="sm" variant="outline" className="bg-transparent">
                      <Paperclip className="w-4 h-4 mr-1" />
                      파일 첨부
                    </Button>
                  </div>
                </Card>
              </TabsContent>

              {/* 선행 조건 */}
              <TabsContent value="dependencies" className="space-y-3 mt-3">
                <Card className="bg-zinc-800/50 border-zinc-700 p-4">
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-yellow-400" />
                    완료되어야 할 선행 작업
                  </h3>
                  <div className="space-y-2">
                    {actionDetails.dependencies.map((dep, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-green-400" />
                        <span>{dep}</span>
                        <Badge variant="outline" className="ml-auto bg-green-500/10 border-green-500/30 text-green-400">
                          완료
                        </Badge>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card className="bg-zinc-800/50 border-zinc-700 p-4">
                  <h3 className="text-sm font-semibold mb-3">이 작업을 기다리는 후속 작업</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-zinc-400">
                      <Clock className="w-4 h-4" />
                      <span>설비 가동 재개 및 정상 생산 확인</span>
                      <Badge variant="outline" className="ml-auto">
                        대기중
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-zinc-400">
                      <Clock className="w-4 h-4" />
                      <span>품질 데이터 3일간 모니터링</span>
                      <Badge variant="outline" className="ml-auto">
                        대기중
                      </Badge>
                    </div>
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
