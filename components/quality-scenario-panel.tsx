"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { AlertTriangle, TrendingUp, TrendingDown, Play, ShieldCheck, Target, Gauge, AlertCircle } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from "recharts"
import { SimulationEngineDialog } from "@/components/simulation-engine-dialog"

interface QualityScenarioPanelProps {
  onExecute: (option: string) => void
}

export function QualityScenarioPanel({ onExecute }: QualityScenarioPanelProps) {
  const [selectedOption, setSelectedOption] = useState("option1")
  const [showSimulation, setShowSimulation] = useState(false)

  const yieldData = [
    { name: "W1", 현재수율: 94.2, 목표수율: 97, 예측수율: 94.2 },
    { name: "W2", 현재수율: 93.8, 목표수율: 97, 예측수율: 95.1 },
    { name: "W3", 현재수율: 94.5, 목표수율: 97, 예측수율: 96.2 },
    { name: "W4", 현재수율: null, 목표수율: 97, 예측수율: 97.1 },
    { name: "W5", 현재수율: null, 목표수율: 97, 예측수율: 97.8 },
  ]

  const handleExecuteClick = () => {
    setShowSimulation(true)
  }

  const getOptionLabel = () => {
    if (selectedOption === "option1") return "옵션 1: 검사 파라미터 최적화"
    if (selectedOption === "option2") return "옵션 2: 공정 조건 조정"
    return "옵션 3: 설비 예방정비"
  }

  const getOptionDetails = () => {
    if (selectedOption === "option1") {
      return {
        affectedSystems: ["QMS", "MES", "AOI"],
        estimatedTime: "예상 소요: 2일",
        riskLevel: "낮음",
      }
    }
    if (selectedOption === "option2") {
      return {
        affectedSystems: ["MES", "PLC", "SCADA"],
        estimatedTime: "예상 소요: 5일",
        riskLevel: "중",
      }
    }
    return {
      affectedSystems: ["EAM", "MES", "CMMS"],
      estimatedTime: "예상 소요: 1일",
      riskLevel: "낮음",
    }
  }

  const optionDetails = getOptionDetails()

  return (
    <>
      <div className="w-full lg:w-96 bg-zinc-900 border-t lg:border-t-0 lg:border-l border-zinc-800 flex flex-col max-h-screen overflow-auto">
        {/* 헤더 */}
        <div className="p-4 border-b border-zinc-800">
          <Badge className="mb-2 bg-yellow-600 animate-pulse">
            <AlertCircle className="w-3 h-3 mr-1" />
            수율 저하 감지
          </Badge>
          <h2 className="font-semibold text-base lg:text-lg mb-1">Vina2 SMT 라인 수율 이상</h2>
          <p className="text-xs lg:text-sm text-zinc-400">현재 수율 94.2% (목표 97% 미달)</p>
          <div className="flex gap-2 mt-2">
            <Badge variant="outline" className="text-xs bg-zinc-800">
              <Target className="w-3 h-3 mr-1" />
              대상: Galaxy S25 센서 모듈
            </Badge>
          </div>
        </div>

        {/* 시나리오 옵션 */}
        <div className="p-4 space-y-4 flex-1 overflow-auto">
          <div>
            <h3 className="text-sm font-semibold mb-3">수율 최적화 시나리오 선택</h3>
            <RadioGroup value={selectedOption} onValueChange={setSelectedOption}>
              <Card
                className={`p-4 mb-3 cursor-pointer transition-all ${
                  selectedOption === "option1" ? "bg-green-500/20 border-green-500 shadow-lg shadow-green-500/10" : "bg-zinc-800/50 border-zinc-700 hover:border-zinc-600"
                }`}
              >
                <div className="flex items-start gap-3">
                  <RadioGroupItem value="option1" id="q-option1" className="mt-1" />
                  <Label htmlFor="q-option1" className="cursor-pointer flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <ShieldCheck className="w-4 h-4 text-green-400" />
                      <span className="font-semibold text-sm">옵션 1: 검사 파라미터 최적화</span>
                    </div>
                    <p className="text-xs text-zinc-400 mb-2">AOI 검사 임계값 조정 및 허용 오차 최적화</p>
                    <div className="flex flex-wrap gap-2 text-xs">
                      <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/50">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        수율 +2.8%
                      </Badge>
                      <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/50">
                        비용 절감 $120K
                      </Badge>
                    </div>
                  </Label>
                </div>
              </Card>

              <Card
                className={`p-4 mb-3 cursor-pointer transition-all ${
                  selectedOption === "option2" ? "bg-green-500/20 border-green-500 shadow-lg shadow-green-500/10" : "bg-zinc-800/50 border-zinc-700 hover:border-zinc-600"
                }`}
              >
                <div className="flex items-start gap-3">
                  <RadioGroupItem value="option2" id="q-option2" className="mt-1" />
                  <Label htmlFor="q-option2" className="cursor-pointer flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Gauge className="w-4 h-4 text-blue-400" />
                      <span className="font-semibold text-sm">옵션 2: 공정 조건 조정</span>
                    </div>
                    <p className="text-xs text-zinc-400 mb-2">리플로우 온도 프로파일 및 솔더 페이스트 조정</p>
                    <div className="flex flex-wrap gap-2 text-xs">
                      <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/50">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        수율 +3.5%
                      </Badge>
                      <Badge variant="outline" className="bg-yellow-500/10 text-yellow-400 border-yellow-500/50">
                        <TrendingDown className="w-3 h-3 mr-1" />
                        리스크 중
                      </Badge>
                    </div>
                  </Label>
                </div>
              </Card>

              <Card
                className={`p-4 cursor-pointer transition-all ${
                  selectedOption === "option3" ? "bg-green-500/20 border-green-500 shadow-lg shadow-green-500/10" : "bg-zinc-800/50 border-zinc-700 hover:border-zinc-600"
                }`}
              >
                <div className="flex items-start gap-3">
                  <RadioGroupItem value="option3" id="q-option3" className="mt-1" />
                  <Label htmlFor="q-option3" className="cursor-pointer flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <AlertTriangle className="w-4 h-4 text-orange-400" />
                      <span className="font-semibold text-sm">옵션 3: 설비 예방정비</span>
                    </div>
                    <p className="text-xs text-zinc-400 mb-2">SMT 마운터 노즐 교체 및 캘리브레이션</p>
                    <div className="flex flex-wrap gap-2 text-xs">
                      <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/50">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        수율 +1.5%
                      </Badge>
                      <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/50">
                        안정성 향상
                      </Badge>
                    </div>
                  </Label>
                </div>
              </Card>
            </RadioGroup>
          </div>

          {/* 선택된 옵션 상세 정보 */}
          <Card className="bg-zinc-800/30 border-zinc-700 p-3">
            <h4 className="text-xs font-semibold text-zinc-400 mb-2">영향받는 시스템</h4>
            <div className="flex flex-wrap gap-1 mb-2">
              {optionDetails.affectedSystems.map((system, idx) => (
                <Badge key={idx} variant="outline" className="text-[10px] bg-zinc-900">
                  {system}
                </Badge>
              ))}
            </div>
            <div className="flex justify-between text-xs text-zinc-400">
              <span>{optionDetails.estimatedTime}</span>
              <span>리스크: <span className={optionDetails.riskLevel === "낮음" ? "text-green-400" : "text-yellow-400"}>{optionDetails.riskLevel}</span></span>
            </div>
          </Card>

          {/* 수율 추이 차트 */}
          <div>
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Target className="w-4 h-4 text-green-400" />
              수율 추이 및 예측
            </h3>
            <Card className="bg-zinc-800/50 border-zinc-700 p-3">
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={yieldData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
                  <XAxis dataKey="name" stroke="#a1a1aa" style={{ fontSize: "11px" }} />
                  <YAxis stroke="#a1a1aa" style={{ fontSize: "10px" }} domain={[92, 100]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#18181b",
                      border: "1px solid #3f3f46",
                      borderRadius: "6px",
                      fontSize: "12px",
                    }}
                    formatter={(value: number) => value ? `${value}%` : "-"}
                  />
                  <Legend wrapperStyle={{ fontSize: "11px" }} />
                  <ReferenceLine y={97} stroke="#22c55e" strokeDasharray="5 5" label={{ value: "목표", fill: "#22c55e", fontSize: 10 }} />
                  <Line type="monotone" dataKey="현재수율" stroke="#ef4444" strokeWidth={2} dot={{ fill: "#ef4444" }} connectNulls={false} />
                  <Line type="monotone" dataKey="예측수율" stroke="#3b82f6" strokeWidth={2} strokeDasharray="5 5" dot={{ fill: "#3b82f6" }} />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </div>

          {/* 실행 버튼 */}
          <Button 
            size="lg" 
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold gap-2" 
            onClick={handleExecuteClick}
          >
            <Play className="w-4 h-4" />
            수율 최적화 시뮬레이션
          </Button>
          <p className="text-[10px] text-zinc-500 text-center">
            AIP 엔진이 품질관리 시스템(QMS)과 연동하여 최적화 방안을 실행합니다.
          </p>
        </div>
      </div>

      {/* Simulation Engine Dialog */}
      <SimulationEngineDialog
        open={showSimulation}
        onOpenChange={setShowSimulation}
        selectedOption={getOptionLabel()}
      />
    </>
  )
}
