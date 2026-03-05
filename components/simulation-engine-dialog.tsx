"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Play, Sparkles, TrendingUp, DollarSign, ShieldAlert, CheckCircle2, Loader2 } from "lucide-react"
import { AIPLogic, SimulationScenario } from "@/lib/aip-logic"

interface SimulationEngineDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedOption: string
}

export function SimulationEngineDialog({ open, onOpenChange, selectedOption }: SimulationEngineDialogProps) {
  const [isRunning, setIsRunning] = useState(false)
  const [result, setResult] = useState<SimulationScenario | null>(null)

  // 다이얼로그가 열릴 때 상태 초기화
  useEffect(() => {
    if (open) {
      setIsRunning(false)
      setResult(null)
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl bg-zinc-900 border-zinc-800 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Sparkles className="w-6 h-6 text-purple-400" />
            AIP 시뮬레이션 엔진: {selectedOption}
          </DialogTitle>
          <DialogDescription className="text-zinc-400">
            디지털 트윈 온톨로지를 기반으로 최적의 의사결정 시나리오를 분석합니다.
          </DialogDescription>
        </DialogHeader>

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
                  <Button size="sm" className="bg-purple-600 hover:bg-purple-700 gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    이 방안 수락 및 실행
                  </Button>
                  <Button size="sm" variant="outline" className="bg-transparent border-zinc-600" onClick={() => setResult(null)}>
                    다시 시뮬레이션
                  </Button>
                </div>
              </Card>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
