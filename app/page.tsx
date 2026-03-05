"use client"

import { useState } from "react"
import { OntologySidebar } from "@/components/ontology-sidebar"
import { GlobalMap } from "@/components/global-map"
import { ScenarioPanel } from "@/components/scenario-panel"
import { QualityDefenseDashboard } from "@/components/quality-defense-dashboard"
import { MDMDashboard } from "@/components/mdm-dashboard"
import { SimulationScenarioBuilder } from "@/components/simulation-scenario-builder"
import { OntologyGraphViewer } from "@/components/ontology-graph-viewer"
import { FeedbackLoopViewer } from "@/components/feedback-loop-viewer"
import { OntologyConfigManager } from "@/components/ontology-config-manager"
import { DemandForecastDashboard } from "@/components/demand-forecast-dashboard"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function Page() {
  const [selectedMenu, setSelectedMenu] = useState("기업 Operation Dashboard")
  const { toast } = useToast()

  const handleExecuteOption = (option: string) => {
    toast({
      title: "시나리오 실행 완료",
      description: `${option}이(가) 성공적으로 실행되었습니다. 레거시 시스템(ERP, MES, QMS)에 반영되었습니다.`,
    })
  }

  return (
    <div className="h-screen w-full bg-slate-950 text-white overflow-hidden flex flex-col lg:flex-row">
      {/* 좌측 사이드바 */}
      <OntologySidebar selectedMenu={selectedMenu} onMenuSelect={setSelectedMenu} />

      {/* 메인 콘텐츠 영역 */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-auto">
        {/* 중앙 캔버스 */}
        <div className="flex-1 p-4 lg:p-6 space-y-4 lg:space-y-6 overflow-auto">
          <header className="space-y-2">
            <h1 className="text-2xl lg:text-3xl font-bold text-balance">
              온톨로지 기반 제조기업 Operation 최적화 Agent
            </h1>
            <p className="text-sm lg:text-base text-zinc-400">실시간 공급망 모니터링 및 시나리오 시뮬레이션</p>
          </header>

          {selectedMenu === "온톨로지 뷰" && (
            <Tabs defaultValue="graph" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-zinc-900">
                <TabsTrigger value="graph">온톨로지 그래프</TabsTrigger>
                <TabsTrigger value="config">구성 관리</TabsTrigger>
                <TabsTrigger value="feedback">피드백 루프</TabsTrigger>
              </TabsList>
              <TabsContent value="graph" className="mt-6">
                <OntologyGraphViewer />
              </TabsContent>
              <TabsContent value="config" className="mt-6">
                <OntologyConfigManager />
              </TabsContent>
              <TabsContent value="feedback" className="mt-6">
                <FeedbackLoopViewer />
              </TabsContent>
            </Tabs>
          )}

          {selectedMenu === "기업 Operation Dashboard" && <GlobalMap />}

          {selectedMenu === "데이터 정제 기준정보 관리" && <MDMDashboard />}

          {selectedMenu === "품질관리 및 수율 최적화" && <QualityDefenseDashboard />}

          {selectedMenu === "생산 최적화 시뮬레이션" && <SimulationScenarioBuilder />}

          {selectedMenu === "수요 예측 및 최적대응" && <DemandForecastDashboard />}
        </div>

        {/* 우측 시나리오 패널 */}
        {selectedMenu === "수요 예측 및 최적대응" && <ScenarioPanel onExecute={handleExecuteOption} />}
      </div>

      <Toaster />
    </div>
  )
}
