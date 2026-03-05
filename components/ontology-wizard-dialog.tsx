"use client"

import { useState, useRef, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Bot, User, ChevronRight, CheckCircle2, Loader2, Sparkles,
  Database, LinkIcon, Tag
} from "lucide-react"
import { OntologyService } from "@/lib/ontology-service"
import { useToast } from "@/hooks/use-toast"

// ────────────────────────────────────────────────────────────────────────────
// 질문 흐름 데이터 정의 - 대체투자 도메인
// ────────────────────────────────────────────────────────────────────────────
type StepId = "asset_type" | "fund_name" | "company_roles" | "tranche_structure" | "risk_metrics" | "covenants" | "review"
type SelectType = "single" | "multi" | "text"

interface Option { value: string; label: string; desc?: string; icon?: string }
interface Step {
  id: StepId
  type: SelectType
  messages: string[]
  options?: Option[]
  placeholder?: string
  minSelect?: number
}

const STEPS: Step[] = [
  {
    id: "asset_type",
    type: "multi",
    messages: [
      "안녕하세요! 저는 대체투자 온톨로지 구성을 도와드릴 AI 위자드입니다.",
      "몇 가지 질문에 답하시면 최적화된 객체·관계·속성을 자동으로 만들어 드릴게요.",
      "먼저, 어떤 대체자산 유형을 관리하시겠어요? (복수 선택 가능)"
    ],
    minSelect: 1,
    options: [
      { value: "pf_development", label: "부동산 PF (개발형)", desc: "준공 전 개발 프로젝트", icon: "🏗️" },
      { value: "real_estate", label: "수익형 부동산", desc: "오피스/상업/물류/호텔 등", icon: "🏢" },
      { value: "infrastructure", label: "SOC 인프라", desc: "도로/항만/공항/에너지 등", icon: "🛣️" },
      { value: "aircraft_ship", label: "항공기/선박", desc: "리스 기반 운용자산", icon: "✈️" },
      { value: "renewable", label: "신재생에너지", desc: "태양광/풍력/ESS 등", icon: "🌱" },
    ]
  },
  {
    id: "fund_name",
    type: "text",
    messages: ["좋아요! 그럼 펀드 또는 포트폴리오 이름을 입력해 주세요. 객체 이름에 사용됩니다."],
    placeholder: "예: 이지대체투자1호, ABC인프라펀드"
  },
  {
    id: "company_roles",
    type: "multi",
    messages: ["투자 구조에 관여하는 회사 역할을 선택하세요. (복수 선택 가능)"],
    minSelect: 1,
    options: [
      { value: "constructor", label: "시공사", desc: "건설 공사 실행 및 책임준공 담당", icon: "🔨" },
      { value: "developer", label: "시행사", desc: "부동산 개발 사업 기획 및 추진", icon: "📐" },
      { value: "operator", label: "운영사/AM", desc: "자산 운영 및 관리 담당", icon: "🏛️" },
      { value: "trustee", label: "수탁사/신탁사", desc: "자금 관리 및 신탁 업무", icon: "🏦" },
      { value: "guarantor", label: "보증기관", desc: "신용보강 및 보증 제공", icon: "🛡️" },
      { value: "lender", label: "대주단/금융기관", desc: "대출 제공 금융기관", icon: "💳" },
    ]
  },
  {
    id: "tranche_structure",
    type: "multi",
    messages: [
      "투자 구조의 트랜치 구성을 선택하세요.",
      "선택하신 항목이 트랜치 객체로 생성됩니다."
    ],
    minSelect: 1,
    options: [
      { value: "senior", label: "선순위 (Senior)", desc: "우선 상환, 낮은 리스크", icon: "1️⃣" },
      { value: "mezzanine", label: "중순위 (Mezzanine)", desc: "중간 위험/수익", icon: "2️⃣" },
      { value: "junior", label: "후순위 (Junior)", desc: "높은 위험/수익", icon: "3️⃣" },
      { value: "equity", label: "지분 (Equity)", desc: "자본금/출자금", icon: "💎" },
    ]
  },
  {
    id: "risk_metrics",
    type: "multi",
    messages: [
      "어떤 리스크 지표를 주로 관리하시나요?",
      "선택하신 KPI가 속성(Property)으로 자동 생성됩니다."
    ],
    minSelect: 1,
    options: [
      { value: "ltv", label: "LTV (담보인정비율)", desc: "Loan-to-Value (%)", icon: "📊" },
      { value: "dscr", label: "DSCR (원리금상환비율)", desc: "Debt Service Coverage Ratio", icon: "💰" },
      { value: "icr", label: "ICR (이자보상비율)", desc: "Interest Coverage Ratio", icon: "📈" },
      { value: "irr", label: "IRR (내부수익률)", desc: "Internal Rate of Return", icon: "🎯" },
      { value: "npv", label: "NPV (순현재가치)", desc: "Net Present Value", icon: "💵" },
      { value: "cap_rate", label: "Cap Rate (자본환원율)", desc: "Capitalization Rate", icon: "🏠" },
      { value: "noi", label: "NOI (순영업이익)", desc: "Net Operating Income", icon: "📋" },
      { value: "pd", label: "PD (부도확률)", desc: "Probability of Default", icon: "⚠️" },
    ]
  },
  {
    id: "covenants",
    type: "multi",
    messages: ["관리할 재무 약정(Covenant) 유형을 선택하세요."],
    options: [
      { value: "ltv_covenant", label: "LTV 약정", desc: "담보인정비율 유지 의무", icon: "📏" },
      { value: "dscr_covenant", label: "DSCR 약정", desc: "원리금상환비율 유지 의무", icon: "💳" },
      { value: "completion", label: "공정률 약정", desc: "공사 진행률 달성 의무", icon: "🚧" },
      { value: "presale", label: "분양률 약정", desc: "분양 목표 달성 의무", icon: "🏘️" },
      { value: "occupancy", label: "임대율 약정", desc: "임대 목표 달성 의무", icon: "🔑" },
      { value: "cash_trap", label: "Cash Trap", desc: "현금 유보 조건", icon: "🔒" },
    ]
  },
  {
    id: "review",
    type: "single",
    messages: ["완벽해요! 아래 내용으로 대체투자 온톨로지를 구성할게요. 확인 후 '생성 시작'을 누르세요."],
    options: [
      { value: "confirm", label: "생성 시작", icon: "🚀" },
      { value: "restart", label: "처음부터 다시", icon: "🔄" },
    ]
  }
]

// ────────────────────────────────────────────────────────────────────────────
// 온톨로지 생성 엔진 (answers → objects/links/props)
// ────────────────────────────────────────────────────────────────────────────
type Answers = Record<StepId, string | string[]>

function buildOntology(answers: Answers) {
  const assetTypes = (answers.asset_type as string[]) || []
  const fundName = ((answers.fund_name as string) || "MyFund").replace(/\s/g, "_")
  const companyRoles = (answers.company_roles as string[]) || []
  const tranches = (answers.tranche_structure as string[]) || []
  const riskMetrics = (answers.risk_metrics as string[]) || []
  const covenants = (answers.covenants as string[]) || []

  const objects: any[] = []
  const links: any[] = []
  const props: any[] = []

  // ── 1. 펀드 객체 ──────────────────────────────────────────────
  objects.push({
    name: fundName,
    description: `${fundName} - 대체투자 펀드/포트폴리오`,
    category: "fund",
    source: "ai-mapped",
    properties: [
      { id: "fund_aum", name: "AUM_B", type: "number", required: true },
      { id: "fund_target", name: "Target_Return", type: "number", required: false }
    ],
    metadata: { neo4j_label: "Fund" }
  })

  // ── 2. 회사 객체 ──────────────────────────────────────────────
  const companyMap: Record<string, any> = {
    constructor: { name: "Constructor", description: "시공사 - 건설 공사 실행 및 책임준공 담당", role: "시공사" },
    developer: { name: "Developer", description: "시행사 - 부동산 개발 사업 기획 및 추진", role: "시행사" },
    operator: { name: "Operator", description: "운영사 - 자산 운영 및 관리 담당", role: "운영사" },
    trustee: { name: "Trustee", description: "수탁사 - 자금 관리 및 신탁 업무", role: "수탁사" },
    guarantor: { name: "Guarantor", description: "보증기관 - 신용보강 및 보증 제공", role: "보증기관" },
    lender: { name: "Lender", description: "대주단 - 대출 제공 금융기관", role: "대주단" },
  }

  companyRoles.forEach(role => {
    const template = companyMap[role]
    if (!template) return
    objects.push({
      name: template.name,
      description: template.description,
      category: "company",
      source: "ai-mapped",
      properties: [
        { id: `${role}_name`, name: "Name", type: "string", required: true },
        { id: `${role}_rating`, name: "Credit_Rating", type: "string", required: true },
        { id: `${role}_pd`, name: "Default_Probability", type: "number", required: false }
      ],
      metadata: { neo4j_label: "Company", role: template.role }
    })
  })

  // ── 3. 프로젝트 객체 ──────────────────────────────────────────
  const projectMap: Record<string, any> = {
    pf_development: { name: "PF_Project", description: "부동산 PF 개발 사업", neo4j_label: "Project", asset_type: "PF_DEVELOPMENT" },
    real_estate: { name: "Real_Estate", description: "수익형 부동산 자산", neo4j_label: "Project", asset_type: "REAL_ESTATE" },
    infrastructure: { name: "Infrastructure", description: "SOC 인프라 자산", neo4j_label: "Project", asset_type: "INFRASTRUCTURE" },
    aircraft_ship: { name: "Aircraft_Ship", description: "항공기/선박 자산", neo4j_label: "Project", asset_type: "AIRCRAFT_SHIP" },
    renewable: { name: "Renewable_Energy", description: "신재생에너지 자산", neo4j_label: "Project", asset_type: "RENEWABLE_ENERGY" },
  }

  const projectNames: string[] = []
  assetTypes.forEach(type => {
    const template = projectMap[type]
    if (!template) return
    objects.push({
      name: template.name,
      description: template.description,
      category: "project",
      source: "ai-mapped",
      properties: [
        { id: `${type}_name`, name: "Name", type: "string", required: true },
        { id: `${type}_value`, name: "Current_Value_B", type: "number", required: true },
        { id: `${type}_status`, name: "Status", type: "string", required: true }
      ],
      metadata: { neo4j_label: template.neo4j_label, asset_type: template.asset_type }
    })
    projectNames.push(template.name)

    // 회사-프로젝트 관계
    if (companyRoles.includes("constructor") && type === "pf_development") {
      links.push({ name: "RESPONSIBLE_FOR", fromType: "Constructor", toType: template.name, bidirectional: false, neo4jType: "RESPONSIBLE_FOR", description: "시공사의 책임준공 담당" })
    }
    if (companyRoles.includes("developer") && type === "pf_development") {
      links.push({ name: "DEVELOPS", fromType: "Developer", toType: template.name, bidirectional: false, neo4jType: "DEVELOPS", description: "시행사의 개발 사업 추진" })
    }
    if (companyRoles.includes("operator")) {
      links.push({ name: "OPERATES", fromType: "Operator", toType: template.name, bidirectional: false, neo4jType: "OPERATES", description: "운영사의 자산 운영" })
    }
  })

  // ── 4. 트랜치 객체 ──────────────────────────────────────────
  const trancheMap: Record<string, any> = {
    senior: { name: "Senior_Tranche", description: "선순위 트랜치 - 우선 상환", seniority: "SENIOR" },
    mezzanine: { name: "Mezzanine_Tranche", description: "중순위 트랜치 - 중간 위험/수익", seniority: "MEZZANINE" },
    junior: { name: "Junior_Tranche", description: "후순위 트랜치 - 높은 위험/수익", seniority: "JUNIOR" },
    equity: { name: "Equity_Tranche", description: "지분 트랜치 - 자본금/출자금", seniority: "EQUITY" },
  }

  tranches.forEach(tr => {
    const template = trancheMap[tr]
    if (!template) return
    objects.push({
      name: template.name,
      description: template.description,
      category: "tranche",
      source: "ai-mapped",
      properties: [
        { id: `${tr}_amount`, name: "Amount_B", type: "number", required: true },
        { id: `${tr}_ratio`, name: "Ratio", type: "number", required: true },
        { id: `${tr}_rate`, name: "Interest_Rate", type: "number", required: true },
        { id: `${tr}_el`, name: "Expected_Loss", type: "number", required: false }
      ],
      metadata: { neo4j_label: "Tranche", seniority: template.seniority }
    })

    // 프로젝트-트랜치 관계
    projectNames.forEach(projName => {
      links.push({ name: "HAS_TRANCHE", fromType: projName, toType: template.name, bidirectional: false, neo4jType: "HAS_TRANCHE", description: `${projName}의 ${template.name}` })
    })

    // 트랜치-펀드 관계
    links.push({ name: "HELD_BY", fromType: template.name, toType: fundName, bidirectional: false, neo4jType: "HELD_BY", description: `펀드의 ${template.name} 보유` })
  })

  // ── 5. 약정 객체 ──────────────────────────────────────────
  if (covenants.length > 0) {
    objects.push({
      name: "Financial_Covenant",
      description: "재무 약정 - LTV/DSCR/ICR 등 기준",
      category: "covenant",
      source: "ai-mapped",
      properties: [
        { id: "cov_type", name: "Type", type: "string", required: true },
        { id: "cov_threshold", name: "Threshold", type: "number", required: true },
        { id: "cov_current", name: "Current_Value", type: "number", required: true },
        { id: "cov_status", name: "Status", type: "string", required: true }
      ],
      metadata: { neo4j_label: "Covenant" }
    })

    projectNames.forEach(projName => {
      links.push({ name: "HAS_COVENANT", fromType: projName, toType: "Financial_Covenant", bidirectional: false, neo4jType: "HAS_COVENANT", description: `${projName}의 재무 약정` })
    })
  }

  // ── 6. 담보 객체 ──────────────────────────────────────────
  objects.push({
    name: "Collateral_Asset",
    description: "담보 자산 - 토지/건물/채권/주식/보증 등",
    category: "collateral",
    source: "ai-mapped",
    properties: [
      { id: "col_type", name: "Type", type: "string", required: true },
      { id: "col_appr", name: "Appraised_Value_B", type: "number", required: true },
      { id: "col_liq", name: "Liquidation_Value_B", type: "number", required: true },
      { id: "col_haircut", name: "Haircut", type: "number", required: true }
    ],
    metadata: { neo4j_label: "Collateral" }
  })

  projectNames.forEach(projName => {
    links.push({ name: "SECURED_BY", fromType: projName, toType: "Collateral_Asset", bidirectional: false, neo4jType: "SECURED_BY", description: `${projName}의 담보 설정` })
  })

  // ── 7. 신용이벤트 객체 ──────────────────────────────────────
  objects.push({
    name: "Credit_Event",
    description: "신용 이벤트 - 부도/구조조정/등급하락 등",
    category: "credit_event",
    source: "ai-mapped",
    properties: [
      { id: "evt_type", name: "Type", type: "string", required: true },
      { id: "evt_date", name: "Occurred_Date", type: "date", required: true },
      { id: "evt_severity", name: "Severity", type: "string", required: true },
      { id: "evt_loss", name: "Estimated_Loss_B", type: "number", required: false }
    ],
    metadata: { neo4j_label: "CreditEvent" }
  })

  if (companyRoles.includes("constructor")) {
    links.push({ name: "TRIGGERS", fromType: "Constructor", toType: "Credit_Event", bidirectional: false, neo4jType: "TRIGGERS", description: "시공사 관련 신용 이벤트" })
  }
  projectNames.forEach(projName => {
    links.push({ name: "AFFECTS", fromType: "Credit_Event", toType: projName, bidirectional: false, neo4jType: "AFFECTS", description: "신용 이벤트가 프로젝트에 영향" })
  })

  // ── 8. KPI → 속성 생성 ────────────────────────────────────────
  const kpiMap: Record<string, any> = {
    ltv: { name: "LTV", dataType: "number", description: "담보인정비율 Loan-to-Value (%)", usedBy: projectNames },
    dscr: { name: "DSCR", dataType: "number", description: "원리금상환비율 Debt Service Coverage Ratio (배)", usedBy: projectNames },
    icr: { name: "ICR", dataType: "number", description: "이자보상비율 Interest Coverage Ratio (배)", usedBy: projectNames },
    irr: { name: "IRR", dataType: "number", description: "내부수익률 Internal Rate of Return (%)", usedBy: projectNames },
    npv: { name: "NPV_B", dataType: "number", description: "순현재가치 Net Present Value (억원)", usedBy: projectNames },
    cap_rate: { name: "Cap_Rate", dataType: "number", description: "자본환원율 Capitalization Rate (%)", usedBy: ["Real_Estate"] },
    noi: { name: "NOI_B", dataType: "number", description: "순영업이익 Net Operating Income (억원)", usedBy: ["Real_Estate"] },
    pd: { name: "Default_Probability", dataType: "number", description: "부도확률 PD (%)", usedBy: ["Constructor", "Developer", "Operator"] },
  }

  riskMetrics.forEach(metric => {
    const template = kpiMap[metric]
    if (!template) return
    props.push({
      name: template.name,
      dataType: template.dataType,
      description: template.description,
      usedBy: template.usedBy.filter((u: string) => objects.some(o => o.name === u)),
      source: "ai-mapped"
    })
  })

  // 기본 속성 추가
  props.push(
    { name: "Current_Value_B", dataType: "number", description: "현재 가치 (억원)", usedBy: projectNames, source: "ai-mapped" },
    { name: "Credit_Rating", dataType: "string", description: "신용등급 (AAA~D)", usedBy: companyRoles.map(r => companyMap[r]?.name).filter(Boolean), source: "ai-mapped" },
    { name: "Amount_B", dataType: "number", description: "투자 금액 (억원)", usedBy: tranches.map(t => trancheMap[t]?.name).filter(Boolean), source: "ai-mapped" },
    { name: "Interest_Rate", dataType: "number", description: "금리 (연 %)", usedBy: tranches.map(t => trancheMap[t]?.name).filter(Boolean), source: "ai-mapped" }
  )

  return { objects, links, props }
}

// ────────────────────────────────────────────────────────────────────────────
// 메인 컴포넌트
// ────────────────────────────────────────────────────────────────────────────
interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function OntologyWizardDialog({ open, onOpenChange }: Props) {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Answers>({} as Answers)
  const [messages, setMessages] = useState<{ role: "bot" | "user"; text: string }[]>([])
  const [textInput, setTextInput] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedOntology, setGeneratedOntology] = useState<ReturnType<typeof buildOntology> | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  const currentStep = STEPS[step]
  const progress = ((step + 1) / STEPS.length) * 100

  useEffect(() => {
    if (open && step === 0 && messages.length === 0) {
      pushBotMessages(STEPS[0].messages)
    }
  }, [open])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" })
  }, [messages])

  function pushBotMessages(texts: string[]) {
    texts.forEach((text, i) => {
      setTimeout(() => {
        setMessages(prev => [...prev, { role: "bot", text }])
      }, i * 400)
    })
  }

  function handleOptionSelect(value: string) {
    if (currentStep.type === "single") {
      if (currentStep.id === "review") {
        if (value === "confirm") {
          handleGenerate()
        } else {
          resetWizard()
        }
        return
      }
      setAnswers(prev => ({ ...prev, [currentStep.id]: value }))
      const label = currentStep.options?.find(o => o.value === value)?.label || value
      setMessages(prev => [...prev, { role: "user", text: label }])
      goNext()
    } else if (currentStep.type === "multi") {
      const current = (answers[currentStep.id] as string[]) || []
      const updated = current.includes(value) ? current.filter(v => v !== value) : [...current, value]
      setAnswers(prev => ({ ...prev, [currentStep.id]: updated }))
    }
  }

  function handleMultiConfirm() {
    const selected = (answers[currentStep.id] as string[]) || []
    if (currentStep.minSelect && selected.length < currentStep.minSelect) {
      toast({ title: "선택 필요", description: `최소 ${currentStep.minSelect}개를 선택해 주세요.`, variant: "destructive" })
      return
    }
    const labels = selected.map(v => currentStep.options?.find(o => o.value === v)?.label || v)
    setMessages(prev => [...prev, { role: "user", text: labels.join(", ") }])
    goNext()
  }

  function handleTextSubmit() {
    if (!textInput.trim()) return
    setAnswers(prev => ({ ...prev, [currentStep.id]: textInput.trim() }))
    setMessages(prev => [...prev, { role: "user", text: textInput.trim() }])
    setTextInput("")
    goNext()
  }

  function goNext() {
    const nextStep = step + 1
    if (nextStep < STEPS.length) {
      setStep(nextStep)
      setTimeout(() => {
        if (STEPS[nextStep].id === "review") {
          const ontology = buildOntology(answers)
          setGeneratedOntology(ontology)
        }
        pushBotMessages(STEPS[nextStep].messages)
      }, 500)
    }
  }

  function resetWizard() {
    setStep(0)
    setAnswers({} as Answers)
    setMessages([])
    setGeneratedOntology(null)
    setTimeout(() => pushBotMessages(STEPS[0].messages), 200)
  }

  async function handleGenerate() {
    if (!generatedOntology) return
    setIsGenerating(true)
    try {
      await OntologyService.seedCustomData(
        generatedOntology.objects,
        generatedOntology.links,
        generatedOntology.props
      )
      toast({ title: "온톨로지 생성 완료", description: `${generatedOntology.objects.length}개 객체, ${generatedOntology.links.length}개 관계가 생성되었습니다.` })
      onOpenChange(false)
      resetWizard()
    } catch (e: any) {
      toast({ title: "생성 실패", description: e.message, variant: "destructive" })
    } finally {
      setIsGenerating(false)
    }
  }

  const selectedMulti = (answers[currentStep?.id] as string[]) || []

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-900 border-zinc-800 max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            대체투자 온톨로지 위자드
          </DialogTitle>
          <DialogDescription>
            대화형 인터페이스로 대체투자 온톨로지를 구성합니다
          </DialogDescription>
        </DialogHeader>

        <Progress value={progress} className="h-1.5 bg-zinc-800" />

        <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-3 py-4 min-h-[300px] max-h-[400px]">
          {messages.map((msg, i) => (
            <div key={i} className={`flex items-start gap-2 ${msg.role === "user" ? "justify-end" : ""}`}>
              {msg.role === "bot" && (
                <div className="w-7 h-7 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-purple-400" />
                </div>
              )}
              <div className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                msg.role === "bot" ? "bg-zinc-800 text-zinc-200" : "bg-blue-600 text-white"
              }`}>
                {msg.text}
              </div>
              {msg.role === "user" && (
                <div className="w-7 h-7 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-blue-400" />
                </div>
              )}
            </div>
          ))}

          {currentStep?.id === "review" && generatedOntology && (
            <Card className="bg-zinc-800/50 border-zinc-700 p-4 mt-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <Database className="w-6 h-6 mx-auto mb-1 text-purple-400" />
                  <div className="text-xl font-bold">{generatedOntology.objects.length}</div>
                  <div className="text-xs text-zinc-500">Objects</div>
                </div>
                <div>
                  <LinkIcon className="w-6 h-6 mx-auto mb-1 text-green-400" />
                  <div className="text-xl font-bold">{generatedOntology.links.length}</div>
                  <div className="text-xs text-zinc-500">Links</div>
                </div>
                <div>
                  <Tag className="w-6 h-6 mx-auto mb-1 text-orange-400" />
                  <div className="text-xl font-bold">{generatedOntology.props.length}</div>
                  <div className="text-xs text-zinc-500">Properties</div>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <div className="text-xs text-zinc-400">생성될 객체:</div>
                <div className="flex flex-wrap gap-1">
                  {generatedOntology.objects.slice(0, 8).map((obj, i) => (
                    <Badge key={i} className="bg-zinc-900 border-zinc-700 text-zinc-400 text-[10px]">
                      {obj.name}
                    </Badge>
                  ))}
                  {generatedOntology.objects.length > 8 && (
                    <Badge className="bg-zinc-900 border-zinc-700 text-zinc-500 text-[10px]">
                      +{generatedOntology.objects.length - 8}
                    </Badge>
                  )}
                </div>
              </div>
            </Card>
          )}
        </div>

        <div className="border-t border-zinc-800 pt-4 space-y-3">
          {currentStep?.type === "text" && (
            <div className="flex gap-2">
              <Input
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleTextSubmit()}
                placeholder={currentStep.placeholder}
                className="bg-zinc-800 border-zinc-700"
              />
              <Button onClick={handleTextSubmit} className="bg-blue-600 hover:bg-blue-700">
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}

          {currentStep?.type === "single" && currentStep.options && (
            <div className="grid grid-cols-2 gap-2">
              {currentStep.options.map((opt) => (
                <Button
                  key={opt.value}
                  variant="outline"
                  onClick={() => handleOptionSelect(opt.value)}
                  disabled={isGenerating}
                  className="h-auto py-3 px-4 border-zinc-700 hover:bg-zinc-800 hover:border-purple-500/50 justify-start text-left"
                >
                  {isGenerating && opt.value === "confirm" ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <span className="mr-2 text-lg">{opt.icon}</span>
                  )}
                  <div>
                    <div className="font-medium text-sm">{opt.label}</div>
                    {opt.desc && <div className="text-[10px] text-zinc-500">{opt.desc}</div>}
                  </div>
                </Button>
              ))}
            </div>
          )}

          {currentStep?.type === "multi" && currentStep.options && (
            <>
              <div className="grid grid-cols-2 gap-2 max-h-[200px] overflow-y-auto">
                {currentStep.options.map((opt) => {
                  const isSelected = selectedMulti.includes(opt.value)
                  return (
                    <Button
                      key={opt.value}
                      variant="outline"
                      onClick={() => handleOptionSelect(opt.value)}
                      className={`h-auto py-2 px-3 border-zinc-700 justify-start text-left transition-colors ${
                        isSelected ? "bg-purple-500/20 border-purple-500/50" : "hover:bg-zinc-800"
                      }`}
                    >
                      <div className={`w-4 h-4 rounded border mr-2 flex items-center justify-center flex-shrink-0 ${
                        isSelected ? "bg-purple-500 border-purple-500" : "border-zinc-600"
                      }`}>
                        {isSelected && <CheckCircle2 className="w-3 h-3 text-white" />}
                      </div>
                      <span className="mr-2 text-base">{opt.icon}</span>
                      <div className="min-w-0">
                        <div className="font-medium text-xs truncate">{opt.label}</div>
                        {opt.desc && <div className="text-[9px] text-zinc-500 truncate">{opt.desc}</div>}
                      </div>
                    </Button>
                  )
                })}
              </div>
              <Button
                onClick={handleMultiConfirm}
                disabled={currentStep.minSelect ? selectedMulti.length < currentStep.minSelect : false}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                선택 완료 ({selectedMulti.length}개)
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
