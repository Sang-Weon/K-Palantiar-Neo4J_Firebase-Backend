"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { AlertTriangle, TrendingUp, TrendingDown, Play, Ship, Plane, Truck, Clock, Globe, DollarSign } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from "recharts"
import { SimulationEngineDialog } from "@/components/simulation-engine-dialog"

interface LogisticsScenarioPanelProps {
  onExecute: (option: string) => void
}

export function LogisticsScenarioPanel({ onExecute }: LogisticsScenarioPanelProps) {
  const [selectedOption, setSelectedOption] = useState("option1")
  const [showSimulation, setShowSimulation] = useState(false)

  const costComparisonData = [
    { name: "항공 긴급", 비용: 85000, 시간: 3, color: "#ef4444" },
    { name: "해상 특송", 비용: 35000, 시간: 12, color: "#3b82f6" },
    { name: "복합 운송", 비용: 52000, 시간: 7, color: "#22c55e" },
  ]

  const handleExecuteClick = () => {
    setShowSimulation(true)
  }

  const getOptionLabel = () => {
    if (selectedOption === "option1") return "옵션 1: 항공 긴급 운송"
    if (selectedOption === "option2") return "옵션 2: 해상 특송"
    return "옵션 3: 복합 운송 (항공+육로)"
  }

  const getOptionDetails = () => {
    if (selectedOption === "option1") {
      return {
        affectedSystems: ["TMS", "WMS", "Customs"],
        estimatedTime: "소요 시간: 3일",
        riskLevel: "낮음",
        route: "베트남 하노이 -> 인천공항 -> 천안 공장"
      }
    }
    if (selectedOption === "option2") {
      return {
        affectedSystems: ["TMS", "Port System", "WMS"],
        estimatedTime: "소요 시간: 12일",
        riskLevel: "높음 (납기 초과)",
        route: "베트남 하이퐁 -> 부산항 -> 천안 공장"
      }
    }
    return {
      affectedSystems: ["TMS", "WMS", "Cross-docking"],
      estimatedTime: "소요 시간: 7일",
      riskLevel: "중",
      route: "베트남 하노이 -> 홍콩 -> 인천항 -> 천안 공장"
    }
  }

  const optionDetails = getOptionDetails()

  return (
    <>
      <div className="w-full lg:w-96 bg-zinc-900 border-t lg:border-t-0 lg:border-l border-zinc-800 flex flex-col max-h-screen overflow-auto">
        {/* 헤더 */}
        <div className="p-4 border-b border-zinc-800">
          <Badge variant="destructive" className="mb-2 animate-pulse">
            <Globe className="w-3 h-3 mr-1" />
            대외 변수 발생
          </Badge>
          <h2 className="font-semibold text-base lg:text-lg mb-1">수에즈 운하 지연 사태</h2>
          <p className="text-xs lg:text-sm text-zinc-400">핵심 부품 IC Chip 배송 14일 지연 예상</p>
          <div className="flex gap-2 mt-2 flex-wrap">
            <Badge variant="outline" className="text-xs bg-red-500/10 text-red-400 border-red-500/50">
              <Clock className="w-3 h-3 mr-1" />
              긴급도: 최상
            </Badge>
            <Badge variant="outline" className="text-xs bg-zinc-800">
              영향: 생산 라인 중단 위험
            </Badge>
          </div>
        </div>

        {/* 시나리오 옵션 */}
        <div className="p-4 space-y-4 flex-1 overflow-auto">
          <div>
            <h3 className="text-sm font-semibold mb-3">물류 대응 시나리오 선택</h3>
            <RadioGroup value={selectedOption} onValueChange={setSelectedOption}>
              <Card
                className={`p-4 mb-3 cursor-pointer transition-all ${
                  selectedOption === "option1" ? "bg-red-500/20 border-red-500 shadow-lg shadow-red-500/10" : "bg-zinc-800/50 border-zinc-700 hover:border-zinc-600"
                }`}
              >
                <div className="flex items-start gap-3">
                  <RadioGroupItem value="option1" id="l-option1" className="mt-1" />
                  <Label htmlFor="l-option1" className="cursor-pointer flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Plane className="w-4 h-4 text-red-400" />
                      <span className="font-semibold text-sm">옵션 1: 항공 긴급 운송</span>
                    </div>
                    <p className="text-xs text-zinc-400 mb-2">하노이-인천 전세기 긴급 배송</p>
                    <div className="flex flex-wrap gap-2 text-xs">
                      <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/50">
                        <Clock className="w-3 h-3 mr-1" />
                        3일 소요
                      </Badge>
                      <Badge variant="outline" className="bg-red-500/10 text-red-400 border-red-500/50">
                        <DollarSign className="w-3 h-3 mr-1" />
                        비용 +142%
                      </Badge>
                    </div>
                  </Label>
                </div>
              </Card>

              <Card
                className={`p-4 mb-3 cursor-pointer transition-all ${
                  selectedOption === "option2" ? "bg-blue-500/20 border-blue-500 shadow-lg shadow-blue-500/10" : "bg-zinc-800/50 border-zinc-700 hover:border-zinc-600"
                }`}
              >
                <div className="flex items-start gap-3">
                  <RadioGroupItem value="option2" id="l-option2" className="mt-1" />
                  <Label htmlFor="l-option2" className="cursor-pointer flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Ship className="w-4 h-4 text-blue-400" />
                      <span className="font-semibold text-sm">옵션 2: 해상 특송</span>
                    </div>
                    <p className="text-xs text-zinc-400 mb-2">희망봉 우회 해상 특송 (Express)</p>
                    <div className="flex flex-wrap gap-2 text-xs">
                      <Badge variant="outline" className="bg-yellow-500/10 text-yellow-400 border-yellow-500/50">
                        <Clock className="w-3 h-3 mr-1" />
                        12일 소요
                      </Badge>
                      <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/50">
                        <TrendingDown className="w-3 h-3 mr-1" />
                        비용 절감
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
                  <RadioGroupItem value="option3" id="l-option3" className="mt-1" />
                  <Label htmlFor="l-option3" className="cursor-pointer flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Truck className="w-4 h-4 text-green-400" />
                      <span className="font-semibold text-sm">옵션 3: 복합 운송 (권장)</span>
                    </div>
                    <p className="text-xs text-zinc-400 mb-2">항공(하노이-홍콩) + 해상(홍콩-인천)</p>
                    <div className="flex flex-wrap gap-2 text-xs">
                      <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/50">
                        <Clock className="w-3 h-3 mr-1" />
                        7일 소요
                      </Badge>
                      <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/50">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        균형 최적
                      </Badge>
                    </div>
                  </Label>
                </div>
              </Card>
            </RadioGroup>
          </div>

          {/* 선택된 옵션 상세 정보 */}
          <Card className="bg-zinc-800/30 border-zinc-700 p-3">
            <h4 className="text-xs font-semibold text-zinc-400 mb-2">운송 경로</h4>
            <p className="text-xs text-zinc-300 mb-2">{optionDetails.route}</p>
            <h4 className="text-xs font-semibold text-zinc-400 mb-2 mt-3">연동 시스템</h4>
            <div className="flex flex-wrap gap-1 mb-2">
              {optionDetails.affectedSystems.map((system, idx) => (
                <Badge key={idx} variant="outline" className="text-[10px] bg-zinc-900">
                  {system}
                </Badge>
              ))}
            </div>
            <div className="flex justify-between text-xs text-zinc-400">
              <span>{optionDetails.estimatedTime}</span>
              <span>리스크: <span className={
                optionDetails.riskLevel === "낮음" ? "text-green-400" : 
                optionDetails.riskLevel === "중" ? "text-yellow-400" : "text-red-400"
              }>{optionDetails.riskLevel}</span></span>
            </div>
          </Card>

          {/* 비용/시간 비교 차트 */}
          <div>
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-green-400" />
              비용 vs 소요시간 분석
            </h3>
            <Card className="bg-zinc-800/50 border-zinc-700 p-3">
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={costComparisonData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
                  <XAxis type="number" stroke="#a1a1aa" style={{ fontSize: "10px" }} tickFormatter={(v) => `$${v/1000}K`} />
                  <YAxis dataKey="name" type="category" stroke="#a1a1aa" style={{ fontSize: "10px" }} width={70} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#18181b",
                      border: "1px solid #3f3f46",
                      borderRadius: "6px",
                      fontSize: "12px",
                    }}
                    formatter={(value: number, name: string) => {
                      if (name === "비용") return [`$${value.toLocaleString()}`, "비용"]
                      return [`${value}일`, "소요 시간"]
                    }}
                  />
                  <Bar dataKey="비용" radius={[0, 4, 4, 0]}>
                    {costComparisonData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>

          {/* 실행 버튼 */}
          <Button 
            size="lg" 
            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold gap-2" 
            onClick={handleExecuteClick}
          >
            <Play className="w-4 h-4" />
            물류 최적화 시뮬레이션
          </Button>
          <p className="text-[10px] text-zinc-500 text-center">
            AIP 엔진이 TMS/WMS와 연동하여 최적 운송 경로를 실행합니다.
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
