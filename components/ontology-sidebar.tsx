"use client"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { LayoutDashboard, Network, Database, TrendingUp, Shield, Truck, Activity, Briefcase } from "lucide-react"

interface OntologySidebarProps {
  selectedMenu: string
  onMenuSelect: (menu: string) => void
}

const menuItems = [
  { id: "기업 Operation Dashboard", icon: LayoutDashboard, label: "기업 Operation Dashboard" },
  { id: "온톨로지 뷰", icon: Network, label: "온톨로지 뷰" },
  { id: "데이터 정제 기준정보 관리", icon: Database, label: "데이터 정제 기준정보 관리 (MDM)" },
  { id: "수요 예측 및 최적대응", icon: TrendingUp, label: "수요 예측 및 최적대응 시나리오" },
  { id: "품질관리 및 수율 최적화", icon: Shield, label: "품질관리 및 수율 최적화 조치" },
  { id: "물류 최적화", icon: Truck, label: "대외변수 대응 물류 최적화" },
  { id: "Write-Back 대시보드", icon: Activity, label: "Write-Back 변동 추적" },
]

export function OntologySidebar({ selectedMenu, onMenuSelect }: OntologySidebarProps) {
  return (
    <div className="w-full lg:w-64 bg-zinc-900 border-b lg:border-b-0 lg:border-r border-zinc-800 flex flex-col">
      {/* 헤더 */}
      <div className="p-4 border-b border-zinc-800">
        <div className="flex items-center gap-2 mb-2">
          <Briefcase className="w-5 h-5 text-blue-400" />
          <h2 className="font-semibold text-sm lg:text-base">프로젝트 컨텍스트</h2>
        </div>
        <p className="text-xs lg:text-sm text-zinc-400 bg-zinc-800/50 rounded px-2 py-1">SEC 플래그십 출시</p>
      </div>

      {/* 메뉴 항목 */}
      <ScrollArea className="flex-1">
        <nav className="p-2 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isSelected = selectedMenu === item.id

            return (
              <Button
                key={item.id}
                variant={isSelected ? "secondary" : "ghost"}
                className={`w-full justify-start text-left ${
                  isSelected ? "bg-blue-500/20 text-blue-300 hover:bg-blue-500/30" : "text-zinc-300 hover:bg-zinc-800"
                }`}
                onClick={() => onMenuSelect(item.id)}
              >
                <Icon className="w-4 h-4 mr-2" />
                <span className="text-sm">{item.label}</span>
              </Button>
            )
          })}
        </nav>
      </ScrollArea>
    </div>
  )
}
