"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Play, Sparkles, TrendingUp, DollarSign, ShieldAlert, CheckCircle2, Loader2, Database, ArrowRight, AlertCircle, FileText, RotateCcw } from "lucide-react"
import { AIPLogic, SimulationScenario } from "@/lib/aip-logic"
import { OntologyService, WritebackAction } from "@/lib/ontology-service"

interface SimulationEngineDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedOption: string
}

type DialogStage = "simulation" | "writeback"

export function SimulationEngineDialog({ open, onOpenChange, selectedOption }: SimulationEngineDialogProps) {
  const [isRunning, setIsRunning] = useState(false)
  const [result, setResult] = useState<SimulationScenario | null>(null)
  const [dialogStage, setDialogStage] = useState<DialogStage>("simulation")
  
  // Writeback 상태
  const [writebackStage, setWritebackStage] = useState<WritebackAction["status"] | "preparing">("preparing")
  const [writebackProgress, setWritebackProgress] = useState(0)
  const [writebackLogs, setWritebackLogs] = useState<string[]>([])
  const [writebackDetails, setWritebackDetails] = useState<any[]>([])
  const [actionId, setActionId] = useState<string | null>(null)

  // 다이얼로그가 열릴 때 상태 초기화
  useEffect(() => {
    if (open) {
      setIsRunning(false)
      setResult(null)
      setDialogStage("simulation")
      setWritebackStage("preparing")
      setWritebackProgress(0)
      setWritebackLogs([])
      setWritebackDetails([])
      setActionId(null)
    }
  }, [open])

  const handleStartSimulation = async () => {
    setIsRunning(true)
    setResult(null)

    try {
      // 3초간 시뮬레이션 애니메이션
      await new Promise(resolve => setTimeout(resolve, 3000));

      const simulationResult = await AIPLogic.simulateScenario(selectedOption, {
        timestamp: Date.now(),
        intensity: "high"
      });

      setResult(simulationResult);
    } catch (error) {
      console.error("Simulation failed:", error);
    } finally {
      setIsRunning(false)
    }
  }

  const handleAcceptAndExecute = async () => {
    if (!result) return;
    
    setDialogStage("writeback")
    setWritebackStage("preparing")
    setWritebackProgress(0)
    setWritebackLogs(["[AIP] Kinetic 계층 트랜잭션 수립 중..."])
    setWritebackDetails([])

    try {
      const decision = `${selectedOption} - ${result.recommendation}`;
      const id = await OntologyService.executeWriteback({
        actionTypeId: "k-palantir-integrated-action",
        decision: decision,
        status: "pending",
        progress: 5,
        logs: ["[AIP] 분석 결과 기반 실행 계획 작성 완료"],
        results: [],
      });
      setActionId(id);

      // 실시간 상태 구독
      const unsubscribe = OntologyService.subscribeToAction(id, (action) => {
        setWritebackStage(action.status);
        setWritebackProgress(action.progress);
        setWritebackLogs(action.logs);
        setWritebackDetails(action.results || []);
      });

      // 시뮬레이션: 서버 프로세싱
      await simulateServerProcessing(id);

      return () => unsubscribe();
    } catch (error) {
      console.error("Writeback failed:", error);
      setWritebackStage("failed");
    }
  };

  const simulateServerProcessing = async (id: string) => {
    const currentLogs = ["[AIP] 분석 결과 기반 실행 계획 작성 완료"];

    const steps = [
      { status: "processing", progress: 20, log: "[SAP ERP] 생산 계획 (PP) 모듈 업데이트 요청 중..." },
      { status: "processing", progress: 35, log: "[SAP ERP] Global_Plant 재고 수위 조정 (SKU_Component #7701)" },
      { status: "processing", progress: 50, log: "[MES] 천안 공장 생산 라인 스케줄링 재배치 반영" },
      { status: "processing", progress: 65, log: "[MES] 베트남 Vina2 공장 야간 라인 가동 스케줄 등록" },
      { status: "processing", progress: 80, log: "[Logistics] Logistics_Hub 컨테이너 배차 우선순위 상향 조정" },
      { status: "processing", progress: 90, log: "[QMS] 품질관리 시스템 검사 기준 업데이트" },
      {
        status: "completed", progress: 100, log: "[Success] 최적화 시나리오 모든 하위 시스템 반영 완료",
        result: { system: "K-Palantir Kernel", module: "Ontology Sync", records: 7 }
      },
    ];

    for (const step of steps) {
      await new Promise(resolve => setTimeout(resolve, 1200));
      currentLogs.push(step.log);

      const updates: Partial<WritebackAction> = {
        status: step.status as WritebackAction["status"],
        progress: step.progress,
        logs: [...currentLogs],
      };

      if (step.result) {
        const newResults = [
          { system: "SAP ERP", module: "PP (생산계획)", records: 3, status: "synced" },
          { system: "MES", module: "Production Control", records: 2, status: "synced" },
          { system: "QMS", module: "Quality Management", records: 1, status: "synced" },
          { system: "K-Palantir", module: "Ontology Kernel", records: 1, status: "synced" },
        ];
        setWritebackDetails(newResults);
        updates.results = newResults;
      }

      await OntologyService.updateWritebackAction(id, updates);
    }
  };

  const getWritebackStageTitle = () => {
    switch (writebackStage) {
      case "preparing": return "트랜잭션 초기화"
      case "pending": return "커널 대기 중"
      case "processing": return "시스템 비동기 반영 중"
      case "completed": return "반영 성공"
      case "failed": return "오류 발생"
      default: return "진행 중"
    }
  }

  const handleBackToSimulation = () => {
    setDialogStage("simulation")
    setWritebackStage("preparing")
    setWritebackProgress(0)
    setWritebackLogs([])
    setWritebackDetails([])
    setActionId(null)
  }

  const handleCompleteAndClose = () => {
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl bg-zinc-900 border-zinc-800 text-white max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            {dialogStage === "simulation" ? (
              <>
                <Sparkles className="w-6 h-6 text-purple-400" />
                AIP 시뮬레이션 엔진: {selectedOption}
              </>
            ) : (
              <>
                <Database className="w-6 h-6 text-green-400" />
                키네틱 계층: 레거시 시스템 Write-Back
              </>
            )}
          </DialogTitle>
          <DialogDescription className="text-zinc-400">
            {dialogStage === "simulation" 
              ? "디지털 트윈 온톨로지를 기반으로 최적의 의사결정 시나리오를 분석합니다."
              : `실행 ID: ${actionId || "생성 중..."}`
            }
          </DialogDescription>
        </DialogHeader>

        {dialogStage === "simulation" && (
          <div className="space-y-6 mt-4">
            {!result && !isRunning && (
              <Card className="p-8 border-dashed border-zinc-700 bg-transparent flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 rounded-full bg-purple-500/10 flex items-center justify-center mb-4">
                  <Play className="w-8 h-8 text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2">시뮬레이션 준비 완료</h3>
                <p className="text-sm text-zinc-400 mb-6 max-w-md">
                  선택한 시나리오 변수를 바탕으로 생산 효율, 비용 절감액, 리스크 점수를 예측합니다.
                </p>
                <Button onClick={handleStartSimulation} className="bg-purple-600 hover:bg-purple-700 px-8">
                  시뮬레이션 실행 시작
                </Button>
              </Card>
            )}

            {isRunning && (
              <Card className="p-12 border-zinc-700 bg-zinc-800/30 flex flex-col items-center justify-center">
                <Loader2 className="w-12 h-12 text-purple-400 animate-spin mb-4" />
                <h3 className="text-lg font-semibold mb-1">AI 추론 및 엔진 가동 중...</h3>
                <p className="text-sm text-zinc-500 mb-6 font-mono text-center">
                  데이터 수집 &gt; 온톨로지 매핑 &gt; 시나리오 연산 &gt; 최적화 제안 생성
                </p>
                <div className="w-full max-w-xs space-y-2">
                  <Progress value={65} className="h-1" />
                  <p className="text-[10px] text-zinc-500 text-right italic">AIP Engine v2.4 initialized...</p>
                </div>
              </Card>
            )}

            {result && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="bg-zinc-800/50 border-zinc-700 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-4 h-4 text-green-400" />
                      <span className="text-xs text-zinc-400">생산 효율 향상</span>
                    </div>
                    <div className="text-2xl font-bold">+{result.prediction.efficiencyGain}%</div>
                  </Card>
                  <Card className="bg-zinc-800/50 border-zinc-700 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="w-4 h-4 text-blue-400" />
                      <span className="text-xs text-zinc-400">예상 비용 절감</span>
                    </div>
                    <div className="text-2xl font-bold">${result.prediction.costReduction.toLocaleString()}K</div>
                  </Card>
                  <Card className="bg-zinc-800/50 border-zinc-700 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <ShieldAlert className="w-4 h-4 text-orange-400" />
                      <span className="text-xs text-zinc-400">예상 리스크 점수</span>
                    </div>
                    <div className="text-2xl font-bold">{result.prediction.riskScore} / 100</div>
                  </Card>
                </div>

                <Card className="bg-purple-500/10 border-purple-500/30 p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-5 h-5 text-purple-400" />
                    <h3 className="font-semibold text-purple-400">AIP 최적화 제안</h3>
                  </div>
                  <p className="text-zinc-300 text-sm leading-relaxed mb-4">
                    {result.recommendation}
                  </p>
                  <div className="flex gap-2">
                    <Button size="sm" className="bg-green-600 hover:bg-green-700 gap-1" onClick={handleAcceptAndExecute}>
                      <CheckCircle2 className="w-3 h-3" />
                      이 방안 수락 및 실행
                    </Button>
                    <Button size="sm" variant="outline" className="bg-transparent border-zinc-600" onClick={() => setResult(null)}>
                      <RotateCcw className="w-3 h-3 mr-1" />
                      다시 시뮬레이션
                    </Button>
                  </div>
                </Card>
              </div>
            )}
          </div>
        )}

        {dialogStage === "writeback" && (
          <div className="space-y-6 mt-4">
            {/* 진행 상태 카드 */}
            <Card className="bg-zinc-800/50 border-zinc-700 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  {writebackStage === "completed" ? (
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                  ) : writebackStage === "failed" ? (
                    <AlertCircle className="w-5 h-5 text-red-400" />
                  ) : (
                    <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
                  )}
                  <span className="font-semibold">{getWritebackStageTitle()}</span>
                </div>
                <Badge className="bg-blue-600 font-mono">{Math.round(writebackProgress)}%</Badge>
              </div>
              <Progress value={writebackProgress} className="h-2" />
            </Card>

            {/* 대상 시스템 목록 */}
            <Card className="bg-zinc-800/50 border-zinc-700 p-4">
              <div className="flex items-center gap-2 mb-4">
                <Database className="w-4 h-4 text-blue-400" />
                <h3 className="text-sm font-semibold">Write-Back 대상 레거시 시스템</h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { name: "SAP ERP", module: "PP (생산계획)", icon: "📊" },
                  { name: "MES", module: "Production Control", icon: "🏭" },
                  { name: "QMS", module: "Quality Management", icon: "✅" },
                  { name: "SCM", module: "Supply Chain", icon: "🚚" },
                ].map((system, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-zinc-900 rounded border border-zinc-700">
                    <span className="text-xl">{system.icon}</span>
                    <div className="flex-1">
                      <span className="text-sm font-bold">{system.name}</span>
                      <p className="text-[10px] text-zinc-500">{system.module}</p>
                    </div>
                    {writebackProgress >= (index + 1) * 25 ? (
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                    ) : writebackProgress >= index * 25 ? (
                      <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-zinc-600" />
                    )}
                  </div>
                ))}
              </div>
            </Card>

            {/* Write-back Summary */}
            {writebackDetails.length > 0 && (
              <Card className="bg-zinc-800/50 border-zinc-700 p-4">
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="w-4 h-4 text-green-400" />
                  <h3 className="text-sm font-semibold">Ontology Write-back Summary</h3>
                </div>
                <div className="space-y-2">
                  {writebackDetails.map((detail, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-zinc-900 rounded border border-zinc-700">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold">{detail.system}</span>
                        <span className="text-[10px] text-zinc-500">{detail.module}</span>
                      </div>
                      <Badge variant="outline" className="text-green-400 border-green-400">
                        Sync: {detail.records} Records
                      </Badge>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* 로그 */}
            <Card className="bg-black/30 border-zinc-700 p-4">
              <div className="flex items-center gap-2 mb-3">
                <ArrowRight className="w-4 h-4 text-purple-400" />
                <h3 className="text-sm font-semibold">AIP Integration Logs</h3>
              </div>
              <div className="space-y-1 font-mono text-[11px] max-h-40 overflow-auto">
                {writebackLogs.map((log, index) => (
                  <div key={index} className="text-zinc-400 border-l border-zinc-700 pl-3 py-0.5">
                    <span className="text-zinc-600 mr-2">[{new Date().toLocaleTimeString()}]</span>
                    {log}
                  </div>
                ))}
              </div>
            </Card>

            {/* 성공 메시지 */}
            {writebackStage === "completed" && (
              <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg text-sm text-green-400 animate-in fade-in zoom-in duration-300">
                <div className="flex items-center gap-2 font-bold mb-1">
                  <CheckCircle2 className="w-4 h-4" />
                  제안된 최적화 루프가 성공적으로 완결되었습니다.
                </div>
                SAP ERP, MES, QMS 등 레거시 시스템에 실시간 반영이 완료되어 대시보드에 업데이트 중입니다.
              </div>
            )}

            {/* 실패 메시지 */}
            {writebackStage === "failed" && (
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-400 animate-in fade-in zoom-in duration-300">
                <div className="flex items-center gap-2 font-bold mb-1">
                  <AlertCircle className="w-4 h-4" />
                  Write-Back 프로세스 중 오류가 발생했습니다.
                </div>
                시스템 관리자에게 문의하거나 다시 시도해 주세요.
              </div>
            )}

            {/* 액션 버튼 */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 bg-transparent"
                onClick={handleBackToSimulation}
                disabled={writebackStage === "processing" || writebackStage === "pending"}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                시뮬레이션으로 돌아가기
              </Button>
              <Button
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold"
                onClick={handleCompleteAndClose}
                disabled={writebackStage !== "completed" && writebackStage !== "failed"}
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                완료 및 대시보드 확인
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
