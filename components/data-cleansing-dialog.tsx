"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { AlertTriangle, CheckCircle2, RefreshCw, ArrowRight } from "lucide-react"

interface DataIssue {
  id: string
  type: "duplicate" | "inconsistent" | "missing" | "invalid"
  entity: string
  description: string
  affectedRecords: number
  severity: "high" | "medium" | "low"
}

interface DataCleansingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  issue: DataIssue
}

export function DataCleansingDialog({ open, onOpenChange, issue }: DataCleansingDialogProps) {
  const [activeTab, setActiveTab] = useState("analysis")
  const [selectedRecords, setSelectedRecords] = useState<string[]>([])
  const [cleansingMethod, setCleansingMethod] = useState("auto")

  // 샘플 중복 레코드
  const duplicateRecords = [
    {
      id: "REC001",
      original: { code: "MAT-XYZ-991", name: "Galaxy 디스플레이 패널", supplier: "공급업체A" },
      duplicate: { code: "MAT-XYZ-991A", name: "Galaxy Display Panel", supplier: "공급업체A" },
      confidence: 95,
    },
    {
      id: "REC002",
      original: { code: "MAT-ABC-123", name: "배터리 모듈", supplier: "공급업체B" },
      duplicate: { code: "MAT-ABC-123B", name: "Battery Module", supplier: "공급업체B" },
      confidence: 88,
    },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl bg-zinc-900 border-zinc-800 text-white max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <RefreshCw className="w-6 h-6 text-purple-400" />
            데이터 정제 워크플로우
          </DialogTitle>
          <DialogDescription className="sr-only">데이터 품질 이슈 분석 및 정제 작업을 수행합니다.</DialogDescription>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="destructive">{issue.severity.toUpperCase()}</Badge>
            <span className="text-sm text-zinc-400">
              {issue.id} - {issue.entity}
            </span>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-4 bg-zinc-800">
            <TabsTrigger value="analysis">이슈 분석</TabsTrigger>
            <TabsTrigger value="review">레코드 검토</TabsTrigger>
            <TabsTrigger value="method">정제 방법</TabsTrigger>
            <TabsTrigger value="execute">실행 및 검증</TabsTrigger>
          </TabsList>

          {/* 1단계: 이슈 분석 */}
          <TabsContent value="analysis" className="space-y-4 mt-4">
            <Card className="bg-zinc-800/50 border-zinc-700 p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-400" />
                이슈 개요
              </h3>
              <div className="space-y-2 text-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-zinc-400">이슈 유형:</span>
                    <span className="ml-2 font-semibold">{issue.type}</span>
                  </div>
                  <div>
                    <span className="text-zinc-400">영향 레코드:</span>
                    <span className="ml-2 font-semibold text-red-400">{issue.affectedRecords}건</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-zinc-400">설명:</span>
                    <p className="mt-1 text-zinc-300">{issue.description}</p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="bg-zinc-800/50 border-zinc-700 p-4">
              <h3 className="font-semibold mb-3">AI 분석 결과</h3>
              <div className="space-y-3 text-sm">
                <div className="bg-blue-500/10 border border-blue-500/30 rounded p-3">
                  <div className="font-semibold text-blue-400 mb-1">패턴 탐지</div>
                  <p className="text-zinc-300">
                    자재 코드의 접미사 차이(없음 vs 'A')로 인한 중복이 발견되었습니다. 동일한 공급업체 및 유사한
                    제품명을 가진 레코드입니다.
                  </p>
                </div>
                <div className="bg-purple-500/10 border border-purple-500/30 rounded p-3">
                  <div className="font-semibold text-purple-400 mb-1">영향 분석</div>
                  <p className="text-zinc-300">
                    재고 관리 시스템에서 동일 제품이 2개의 코드로 관리되어 재고 정확도가 저하되고 있습니다. 주문 및 생산
                    계획에 혼선이 발생할 수 있습니다.
                  </p>
                </div>
                <div className="bg-green-500/10 border border-green-500/30 rounded p-3">
                  <div className="font-semibold text-green-400 mb-1">권장 조치</div>
                  <p className="text-zinc-300">
                    중복 레코드를 하나의 마스터 레코드로 병합하고, 관련 트랜잭션 데이터의 참조를 업데이트할 것을
                    권장합니다.
                  </p>
                </div>
              </div>
            </Card>

            <div className="flex justify-end">
              <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setActiveTab("review")}>
                레코드 검토 <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </TabsContent>

          {/* 2단계: 레코드 검토 */}
          <TabsContent value="review" className="space-y-4 mt-4">
            <Card className="bg-zinc-800/50 border-zinc-700 p-4">
              <h3 className="font-semibold mb-4">중복 레코드 비교</h3>
              <div className="space-y-4">
                {duplicateRecords.map((record) => (
                  <Card key={record.id} className="bg-zinc-900/50 border-zinc-700 p-4">
                    <div className="flex items-start gap-4">
                      <Checkbox
                        checked={selectedRecords.includes(record.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedRecords([...selectedRecords, record.id])
                          } else {
                            setSelectedRecords(selectedRecords.filter((id) => id !== record.id))
                          }
                        }}
                        className="mt-1"
                      />
                      <div className="flex-1 grid grid-cols-2 gap-4">
                        <div>
                          <Badge className="bg-blue-500/20 text-blue-400 mb-2">원본 레코드</Badge>
                          <div className="space-y-1 text-sm">
                            <div>
                              <span className="text-zinc-400">코드:</span>
                              <span className="ml-2 font-mono">{record.original.code}</span>
                            </div>
                            <div>
                              <span className="text-zinc-400">이름:</span>
                              <span className="ml-2">{record.original.name}</span>
                            </div>
                            <div>
                              <span className="text-zinc-400">공급업체:</span>
                              <span className="ml-2">{record.original.supplier}</span>
                            </div>
                          </div>
                        </div>
                        <div>
                          <Badge className="bg-red-500/20 text-red-400 mb-2">중복 레코드</Badge>
                          <div className="space-y-1 text-sm">
                            <div>
                              <span className="text-zinc-400">코드:</span>
                              <span className="ml-2 font-mono">{record.duplicate.code}</span>
                            </div>
                            <div>
                              <span className="text-zinc-400">이름:</span>
                              <span className="ml-2">{record.duplicate.name}</span>
                            </div>
                            <div>
                              <span className="text-zinc-400">공급업체:</span>
                              <span className="ml-2">{record.duplicate.supplier}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/50">
                        {record.confidence}% 일치
                      </Badge>
                    </div>
                  </Card>
                ))}
              </div>
              <div className="mt-4 text-sm text-zinc-400">선택된 레코드: {selectedRecords.length}개</div>
            </Card>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setActiveTab("analysis")}>
                이전
              </Button>
              <Button
                className="bg-blue-600 hover:bg-blue-700"
                onClick={() => setActiveTab("method")}
                disabled={selectedRecords.length === 0}
              >
                정제 방법 선택 <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </TabsContent>

          {/* 3단계: 정제 방법 */}
          <TabsContent value="method" className="space-y-4 mt-4">
            <Card className="bg-zinc-800/50 border-zinc-700 p-4">
              <h3 className="font-semibold mb-4">정제 방법 선택</h3>
              <RadioGroup value={cleansingMethod} onValueChange={setCleansingMethod}>
                <Card
                  className={`p-4 mb-3 cursor-pointer transition-colors ${
                    cleansingMethod === "auto" ? "bg-purple-500/20 border-purple-500" : "bg-zinc-800/50 border-zinc-700"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <RadioGroupItem value="auto" id="auto" className="mt-1" />
                    <Label htmlFor="auto" className="cursor-pointer flex-1">
                      <div className="font-semibold mb-1">자동 병합 (권장)</div>
                      <p className="text-sm text-zinc-400">
                        AI가 가장 완전한 레코드를 마스터로 선택하고 나머지를 병합합니다. 참조 데이터는 자동으로
                        업데이트됩니다.
                      </p>
                    </Label>
                  </div>
                </Card>

                <Card
                  className={`p-4 mb-3 cursor-pointer transition-colors ${
                    cleansingMethod === "manual"
                      ? "bg-purple-500/20 border-purple-500"
                      : "bg-zinc-800/50 border-zinc-700"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <RadioGroupItem value="manual" id="manual" className="mt-1" />
                    <Label htmlFor="manual" className="cursor-pointer flex-1">
                      <div className="font-semibold mb-1">수동 선택</div>
                      <p className="text-sm text-zinc-400">마스터 레코드를 직접 선택하고 병합할 필드를 지정합니다.</p>
                    </Label>
                  </div>
                </Card>

                <Card
                  className={`p-4 cursor-pointer transition-colors ${
                    cleansingMethod === "archive"
                      ? "bg-purple-500/20 border-purple-500"
                      : "bg-zinc-800/50 border-zinc-700"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <RadioGroupItem value="archive" id="archive" className="mt-1" />
                    <Label htmlFor="archive" className="cursor-pointer flex-1">
                      <div className="font-semibold mb-1">보관 처리</div>
                      <p className="text-sm text-zinc-400">중복 레코드를 삭제하지 않고 아카이브 상태로 변경합니다.</p>
                    </Label>
                  </div>
                </Card>
              </RadioGroup>
            </Card>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setActiveTab("review")}>
                이전
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setActiveTab("execute")}>
                실행 및 검증 <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </TabsContent>

          {/* 4단계: 실행 및 검증 */}
          <TabsContent value="execute" className="space-y-4 mt-4">
            <Card className="bg-zinc-800/50 border-zinc-700 p-4">
              <h3 className="font-semibold mb-3">정제 작업 요약</h3>
              <div className="space-y-2 text-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-zinc-400">선택된 레코드:</span>
                    <span className="ml-2 font-semibold">{selectedRecords.length}개</span>
                  </div>
                  <div>
                    <span className="text-zinc-400">정제 방법:</span>
                    <span className="ml-2 font-semibold">
                      {cleansingMethod === "auto"
                        ? "자동 병합"
                        : cleansingMethod === "manual"
                          ? "수동 선택"
                          : "보관 처리"}
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-400">예상 소요 시간:</span>
                    <span className="ml-2 font-semibold">약 2분</span>
                  </div>
                  <div>
                    <span className="text-zinc-400">영향받는 시스템:</span>
                    <span className="ml-2 font-semibold">ERP, WMS, MES</span>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="bg-yellow-500/10 border-yellow-500/30 p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5" />
                <div className="text-sm">
                  <div className="font-semibold text-yellow-400 mb-1">주의사항</div>
                  <p className="text-zinc-300">
                    데이터 정제 작업은 실시간으로 진행되며, 관련 시스템에 즉시 반영됩니다. 작업 전 백업이 자동으로
                    생성됩니다.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="bg-green-500/10 border-green-500/30 p-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-8 h-8 text-green-400" />
                <div>
                  <div className="font-semibold text-green-400">준비 완료</div>
                  <div className="text-sm text-zinc-300">데이터 정제 작업을 실행할 준비가 되었습니다.</div>
                </div>
              </div>
            </Card>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setActiveTab("method")}>
                이전
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  취소
                </Button>
                <Button
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => {
                    onOpenChange(false)
                  }}
                >
                  정제 작업 실행
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
