"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { 
  Play, Calculator, TrendingUp, AlertCircle, CheckCircle2, Settings2, Database,
  Link2, Plus, Sparkles, ChevronRight, Info, Layers, ArrowRight, BookOpen,
  FileText, Workflow, Target, X, ExternalLink, Loader2
} from "lucide-react"
import { AIPLogic } from "@/lib/aip-logic"
import { useToast } from "@/hooks/use-toast"

// ════════════════════════════════════════════════════════════════════════════════
// 국제 검증 가치평가 방법론 (IPEV Guidelines, IVS, IFRS 13 기반)
// ════════════════════════════════════════════════════════════════════════════════

interface ValuationMethodology {
  id: string
  name: string
  nameEn: string
  standard: string // 적용 기준 (IPEV, IVS, IFRS 등)
  description: string
  applicableAssets: string[]
  requiredParams: MethodologyParam[]
  optionalParams: MethodologyParam[]
  formula: string
  formulaDescription: string
  constraints: string[]
  references: { name: string; url?: string }[]
  riskFactors: string[]
}

interface MethodologyParam {
  id: string
  name: string
  nameKr: string
  type: "number" | "percentage" | "currency" | "array" | "rating"
  unit?: string
  description: string
  ontologyMapping?: { object: string; property: string }
  defaultValue?: number
  min?: number
  max?: number
}

const VALIDATED_METHODOLOGIES: ValuationMethodology[] = [
  {
    id: "dcf_ipev",
    name: "DCF 할인현금흐름법",
    nameEn: "Discounted Cash Flow (DCF)",
    standard: "IPEV Guidelines 2025 / IVS 105",
    description: "미래 예상 현금흐름을 적정 할인율로 현재가치화하여 공정가치를 산정하는 소득접근법의 대표적 방법론입니다.",
    applicableAssets: ["PF_DEVELOPMENT", "REAL_ESTATE", "INFRASTRUCTURE", "RENEWABLE_ENERGY", "AIRCRAFT", "SHIP"],
    requiredParams: [
      { id: "projectedCashFlows", name: "Projected Cash Flows", nameKr: "예상 현금흐름", type: "array", description: "기간별 예상 현금 유입/유출", ontologyMapping: { object: "Project", property: "cashFlows" } },
      { id: "discountRate", name: "Discount Rate", nameKr: "할인율", type: "percentage", unit: "%", description: "WACC 또는 요구수익률 기반", min: 1, max: 30 },
      { id: "projectionPeriod", name: "Projection Period", nameKr: "현금흐름 예측기간", type: "number", unit: "년", description: "명시적 예측 기간", defaultValue: 5, min: 1, max: 20 }
    ],
    optionalParams: [
      { id: "terminalValue", name: "Terminal Value", nameKr: "잔존가치", type: "currency", unit: "억원", description: "예측기간 종료 후 가치" },
      { id: "terminalGrowthRate", name: "Terminal Growth Rate", nameKr: "영구성장률", type: "percentage", unit: "%", description: "Gordon Growth Model 적용 시", defaultValue: 2, min: 0, max: 5 }
    ],
    formula: "PV = Σ(CFₜ / (1+r)ᵗ) + TV/(1+r)ⁿ",
    formulaDescription: "PV: 현재가치, CFₜ: t기 현금흐름, r: 할인율, TV: 잔존가치, n: 예측기간",
    constraints: [
      "현금흐름 예측은 합리적이고 지지 가능한 가정에 근거해야 함 (IVS 105.40)",
      "할인율은 현금흐름의 리스크 프로파일을 반영해야 함 (IPEV 3.4)",
      "잔존가치는 전체 가치의 과도한 비중을 차지하지 않아야 함"
    ],
    references: [
      { name: "IPEV Valuation Guidelines 2025", url: "https://www.privateequityvaluation.com" },
      { name: "IVS 105 Valuation Approaches and Methods" },
      { name: "IFRS 13 Fair Value Measurement" }
    ],
    riskFactors: ["시장 금리 변동", "현금흐름 예측 불확실성", "할인율 산정 주관성"]
  },
  {
    id: "market_multiples",
    name: "시장배수법 (Market Multiples)",
    nameEn: "Comparable Company Analysis",
    standard: "IPEV Guidelines 2025 / IVS 105",
    description: "유사 기업/자산의 거래배수(EV/EBITDA, P/E 등)를 적용하여 상대적 가치를 산정하는 시장접근법입니다.",
    applicableAssets: ["PRIVATE_EQUITY", "REAL_ESTATE", "INFRASTRUCTURE"],
    requiredParams: [
      { id: "ebitda", name: "EBITDA", nameKr: "EBITDA", type: "currency", unit: "억원", description: "세전/이자/감가상각전 이익", ontologyMapping: { object: "Project", property: "ebitda" } },
      { id: "comparableMultiple", name: "Comparable Multiple", nameKr: "적용 배수", type: "number", description: "유사기업/거래 기준 배수", defaultValue: 8, min: 2, max: 20 }
    ],
    optionalParams: [
      { id: "controlPremium", name: "Control Premium", nameKr: "경영권 프리미엄", type: "percentage", unit: "%", description: "경영권 취득 시 할증", defaultValue: 20, min: 0, max: 50 },
      { id: "illiquidityDiscount", name: "Illiquidity Discount", nameKr: "비유동성 할인", type: "percentage", unit: "%", description: "비상장 유동성 할인", defaultValue: 15, min: 0, max: 40 }
    ],
    formula: "EV = EBITDA × Multiple × (1 + Control Premium) × (1 - Illiquidity Discount)",
    formulaDescription: "EV: 기업가치, EBITDA: 세전영업이익, Multiple: 시장 배수",
    constraints: [
      "유사기업 선정 시 사업모델, 규모, 성장성, 위험 프로파일 유사성 검토 필수 (IPEV 3.3)",
      "배수 적용 시 차이점에 대한 합리적 조정 필요",
      "단일 배수가 아닌 범위로 제시하여 불확실성 반영"
    ],
    references: [
      { name: "IPEV Valuation Guidelines 2025 Section 3.3" },
      { name: "Pratt's Stats Transaction Database" }
    ],
    riskFactors: ["유사기업 선정의 주관성", "시장 상황 변동", "조정 요소 산정 불확실성"]
  },
  {
    id: "income_capitalization",
    name: "직접환원법 (Direct Capitalization)",
    nameEn: "Income Capitalization Approach",
    standard: "IVS 105 / RICS Red Book",
    description: "안정화된 순영업이익(NOI)을 시장 자본환원율(Cap Rate)로 나누어 부동산 가치를 산정하는 소득접근법입니다.",
    applicableAssets: ["REAL_ESTATE", "INFRASTRUCTURE"],
    requiredParams: [
      { id: "noi", name: "Net Operating Income", nameKr: "순영업이익 (NOI)", type: "currency", unit: "억원", description: "임대수익 - 운영비용", ontologyMapping: { object: "Project", property: "noi" } },
      { id: "capRate", name: "Capitalization Rate", nameKr: "환원율 (Cap Rate)", type: "percentage", unit: "%", description: "시장 거래 기준 환원율", defaultValue: 5, min: 2, max: 15 }
    ],
    optionalParams: [
      { id: "vacancyRate", name: "Vacancy Rate", nameKr: "공실률", type: "percentage", unit: "%", description: "예상 공실 비율", defaultValue: 5, min: 0, max: 30 },
      { id: "opexRatio", name: "Operating Expense Ratio", nameKr: "운영비율", type: "percentage", unit: "%", description: "총수익 대비 운영비", defaultValue: 25, min: 10, max: 50 }
    ],
    formula: "Value = NOI / Cap Rate = (Gross Income × (1 - Vacancy) - OpEx) / Cap Rate",
    formulaDescription: "Value: 부동산 가치, NOI: 순영업이익, Cap Rate: 자본환원율",
    constraints: [
      "NOI는 안정화된(stabilized) 수준이어야 함",
      "Cap Rate는 유사 물건의 최근 거래 기준 적용 (IVS 105.60)",
      "물건 특성(위치, 등급, 임차인 질) 반영한 조정 필요"
    ],
    references: [
      { name: "IVS 105 Valuation Approaches and Methods" },
      { name: "RICS Valuation Global Standards (Red Book)" },
      { name: "Appraisal Institute - The Appraisal of Real Estate" }
    ],
    riskFactors: ["임대시장 변동", "공실률 예측 불확실성", "Cap Rate 선정 주관성"]
  },
  {
    id: "residual_method",
    name: "잔여법 (Residual Method)",
    nameEn: "Residual / Development Approach",
    standard: "IVS 410 / RICS Red Book",
    description: "개발 완료 후 예상 가치(GDV)에서 개발비용, 금융비용, 개발이익을 차감하여 현재 토지/사업 가치를 역산하는 방법입니다.",
    applicableAssets: ["PF_DEVELOPMENT"],
    requiredParams: [
      { id: "gdv", name: "Gross Development Value", nameKr: "총개발가치 (GDV)", type: "currency", unit: "억원", description: "완공 후 예상 매출/가치", ontologyMapping: { object: "Project", property: "gdv" } },
      { id: "constructionCost", name: "Construction Cost", nameKr: "공사비", type: "currency", unit: "억원", description: "직접 건설 비용", ontologyMapping: { object: "Project", property: "constructionCost" } },
      { id: "developerProfit", name: "Developer's Profit", nameKr: "개발이익", type: "percentage", unit: "%", description: "GDV 대비 요구 이익률", defaultValue: 15, min: 5, max: 30 },
      { id: "financeCost", name: "Finance Cost", nameKr: "금융비용", type: "currency", unit: "억원", description: "대출이자 등 조달비용" }
    ],
    optionalParams: [
      { id: "contingency", name: "Contingency", nameKr: "예비비", type: "percentage", unit: "%", description: "공사비 대비 예비비", defaultValue: 5, min: 0, max: 15 },
      { id: "professionalFees", name: "Professional Fees", nameKr: "전문가비용", type: "percentage", unit: "%", description: "설계/감리/인허가 비용", defaultValue: 8, min: 3, max: 15 }
    ],
    formula: "Site Value = GDV - Construction - Finance - Fees - Contingency - (GDV × Developer Profit)",
    formulaDescription: "Site Value: 토지/사업 잔여가치, GDV: 총개발가치",
    constraints: [
      "GDV는 시장 근거에 의해 지지 가능해야 함",
      "비용 항목은 현실적이고 검증 가능해야 함 (IVS 410.40)",
      "개발이익률은 시장 참여자 관점의 요구수익률 반영"
    ],
    references: [
      { name: "IVS 410 Development Property" },
      { name: "RICS Valuation of Development Property" }
    ],
    riskFactors: ["GDV 예측 불확실성", "공사비 변동", "개발기간 지연 리스크"]
  },
  {
    id: "replacement_cost",
    name: "감가상각 대체원가법",
    nameEn: "Depreciated Replacement Cost (DRC)",
    standard: "IVS 105 / IFRS 13",
    description: "동일 효용의 자산을 현재 시점에 취득하는 비용에서 물리적/기능적/경제적 감가를 차감하여 가치를 산정합니다.",
    applicableAssets: ["INFRASTRUCTURE", "AIRCRAFT", "SHIP"],
    requiredParams: [
      { id: "replacementCostNew", name: "Replacement Cost New", nameKr: "재조달원가", type: "currency", unit: "억원", description: "신규 취득 시 현재 비용", ontologyMapping: { object: "Project", property: "replacementCost" } },
      { id: "physicalDepreciation", name: "Physical Depreciation", nameKr: "물리적 감가", type: "percentage", unit: "%", description: "노후화에 따른 가치 감소", defaultValue: 20, min: 0, max: 80 },
      { id: "usefulLife", name: "Useful Life", nameKr: "내용연수", type: "number", unit: "년", description: "자산의 경제적 수명", defaultValue: 20 },
      { id: "remainingLife", name: "Remaining Life", nameKr: "잔존수명", type: "number", unit: "년", description: "잔여 사용가능 기간", defaultValue: 15 }
    ],
    optionalParams: [
      { id: "functionalObsolescence", name: "Functional Obsolescence", nameKr: "기능적 진부화", type: "percentage", unit: "%", description: "기술 진보에 따른 감가", defaultValue: 5, min: 0, max: 50 },
      { id: "economicObsolescence", name: "Economic Obsolescence", nameKr: "경제적 진부화", type: "percentage", unit: "%", description: "외부 요인에 의한 감가", defaultValue: 0, min: 0, max: 50 }
    ],
    formula: "DRC = RCN × (1 - Physical) × (1 - Functional) × (1 - Economic) × (Remaining/Useful)",
    formulaDescription: "DRC: 감가상각후 대체원가, RCN: 재조달원가",
    constraints: [
      "시장가치 도출이 어려운 특수목적 자산에 주로 적용 (IVS 105.90)",
      "각 감가상각 요소는 독립적으로 분석",
      "최고최선이용 검토 필수"
    ],
    references: [
      { name: "IVS 105 Valuation Approaches and Methods" },
      { name: "IFRS 13 Fair Value Hierarchy" }
    ],
    riskFactors: ["재조달원가 산정 어려움", "감가상각 추정 주관성", "경제적 진부화 예측"]
  },
  {
    id: "nav_adjusted",
    name: "조정순자산가치법 (Adjusted NAV)",
    nameEn: "Adjusted Net Asset Value",
    standard: "IPEV Guidelines 2025",
    description: "재무제표상 순자산을 공정가치로 조정하고, 경영권/비유동성 프리미엄/할인을 반영하여 지분가치를 산정합니다.",
    applicableAssets: ["PRIVATE_EQUITY", "INFRASTRUCTURE"],
    requiredParams: [
      { id: "bookNAV", name: "Book NAV", nameKr: "장부 순자산", type: "currency", unit: "억원", description: "재무제표상 순자산가치", ontologyMapping: { object: "Company", property: "bookValue" } },
      { id: "assetRevaluation", name: "Asset Revaluation", nameKr: "자산 재평가 조정", type: "currency", unit: "억원", description: "자산 공정가치 조정액", defaultValue: 0 }
    ],
    optionalParams: [
      { id: "intangibleAssets", name: "Unrecorded Intangibles", nameKr: "미인식 무형자산", type: "currency", unit: "억원", description: "장부 미반영 무형자산", defaultValue: 0 },
      { id: "contingentLiabilities", name: "Contingent Liabilities", nameKr: "우발부채", type: "currency", unit: "억원", description: "잠재적 부채 조정", defaultValue: 0 }
    ],
    formula: "Adjusted NAV = Book NAV + Asset Revaluation + Intangibles - Contingent Liabilities",
    formulaDescription: "Adjusted NAV: 조정순자산가치",
    constraints: [
      "자산별 적정 가치평가 방법 적용 필요 (IPEV 3.5)",
      "부채는 현재가치 또는 결제금액으로 조정",
      "순자산가치법 단독 적용 시 한계 인식 필요"
    ],
    references: [
      { name: "IPEV Valuation Guidelines 2025 Section 3.5" },
      { name: "IFRS 13 Fair Value Measurement" }
    ],
    riskFactors: ["자산별 평가 정확성", "무형자산 가치 추정", "부채 완전성"]
  }
]

// ════════════════════════════════════════════════════════════════════════════════
// 온톨로지 기반 파라미터 정의 (확장)
// ════════════════════════════════════════════════════════════════════════════════

interface OntologyParameter {
  id: string
  name: string
  nameKr: string
  type: "number" | "percentage" | "currency" | "rating" | "date" | "array"
  category: "project" | "company" | "tranche" | "market" | "risk" | "covenant"
  source: "ontology" | "manual" | "calculated"
  linkedObject?: string
  linkedProperty?: string
  defaultValue?: number
  unit?: string
  description: string
  impactDescription?: string  // 평가에 미치는 영향 설명
}

const ONTOLOGY_PARAMETERS: OntologyParameter[] = [
  // 프로젝트 관련
  { id: "totalAmount", name: "Total Investment", nameKr: "총 사업비", type: "currency", category: "project", source: "ontology", linkedObject: "Project", linkedProperty: "totalAmount", unit: "억원", description: "프로젝트 총 투자 금액", impactDescription: "전체 사업 규모로서 할인율 산정 시 규모 프리미엄에 영향" },
  { id: "currentValue", name: "Current Value", nameKr: "현재 가치", type: "currency", category: "project", source: "ontology", linkedObject: "Project", linkedProperty: "currentValue", unit: "억원", description: "현재 평가 가치", impactDescription: "LTV 계산 및 담보가치 산정의 기준" },
  { id: "completionRate", name: "Completion Rate", nameKr: "공정률", type: "percentage", category: "project", source: "ontology", linkedObject: "Project", linkedProperty: "completionRate", description: "공사 진행률", impactDescription: "준공 리스크 프리미엄 산정에 직접 반영 (높을수록 리스크 감소)" },
  { id: "presaleRate", name: "Presale Rate", nameKr: "분양률", type: "percentage", category: "project", source: "ontology", linkedObject: "Project", linkedProperty: "presaleRate", description: "분양 진행률", impactDescription: "분양 리스크 프리미엄 산정 (높을수록 현금흐름 확실성 증가)" },
  { id: "occupancyRate", name: "Occupancy Rate", nameKr: "임대율", type: "percentage", category: "project", source: "ontology", linkedObject: "Project", linkedProperty: "occupancyRate", description: "임대 가동률", impactDescription: "NOI 계산 및 수익 안정성 평가에 반영" },
  { id: "noi", name: "Net Operating Income", nameKr: "순영업이익", type: "currency", category: "project", source: "ontology", linkedObject: "Project", linkedProperty: "noi", unit: "억원", description: "연간 순영업이익", impactDescription: "직접환원법 분자, DSCR 계산 핵심 변수" },
  { id: "gdv", name: "Gross Dev Value", nameKr: "총개발가치", type: "currency", category: "project", source: "ontology", linkedObject: "Project", linkedProperty: "gdv", unit: "억원", description: "완공 후 예상 가치", impactDescription: "잔여법 기준가치, 전체 사업성 판단의 기초" },
  
  // 회사 관련
  { id: "companyRating", name: "Credit Rating", nameKr: "신용등급", type: "rating", category: "company", source: "ontology", linkedObject: "Company", linkedProperty: "creditRating", description: "시공사/시행사 신용등급", impactDescription: "신용 스프레드 산정, 부도확률(PD) 매핑에 직접 사용" },
  { id: "companyPD", name: "Default Probability", nameKr: "부도확률", type: "percentage", category: "company", source: "calculated", linkedObject: "Company", linkedProperty: "defaultProbability", description: "회사 부도 확률", impactDescription: "연쇄부도 시뮬레이션 및 EL(기대손실) 계산에 사용" },
  { id: "companyExperience", name: "Track Record", nameKr: "시공 실적", type: "number", category: "company", source: "ontology", linkedObject: "Company", linkedProperty: "trackRecord", unit: "건", description: "유사 프로젝트 수행 실적", impactDescription: "정성적 리스크 평가 시 참조" },
  
  // 트랜치 관련
  { id: "seniorRatio", name: "Senior Ratio", nameKr: "선순위 비율", type: "percentage", category: "tranche", source: "ontology", linkedObject: "Tranche", linkedProperty: "ratio", description: "선순위 트랜치 비율", impactDescription: "우선순위별 LTV 산정, 트랜치 스프레드 결정" },
  { id: "interestRate", name: "Interest Rate", nameKr: "대출금리", type: "percentage", category: "tranche", source: "ontology", linkedObject: "Tranche", linkedProperty: "interestRate", description: "적용 금리", impactDescription: "DSCR/ICR 계산의 분모, 금융비용 산정" },
  { id: "loanAmount", name: "Loan Amount", nameKr: "대출금액", type: "currency", category: "tranche", source: "ontology", linkedObject: "Tranche", linkedProperty: "amount", unit: "억원", description: "트랜치별 대출금액", impactDescription: "LTV 계산 분자, 원리금 상환액 산정 기초" },
  { id: "maturityDate", name: "Maturity Date", nameKr: "만기일", type: "date", category: "tranche", source: "ontology", linkedObject: "Tranche", linkedProperty: "maturityDate", description: "대출 만기일", impactDescription: "현금흐름 예측 기간 및 리파이낸싱 리스크 평가" },
  
  // 시장/거시 관련
  { id: "riskFreeRate", name: "Risk-Free Rate", nameKr: "무위험이자율", type: "percentage", category: "market", source: "manual", defaultValue: 3.5, description: "국고채 금리 기준", impactDescription: "CAPM 할인율 산정의 기초, 모든 스프레드의 기준점" },
  { id: "marketPremium", name: "Market Premium", nameKr: "시장 프리미엄", type: "percentage", category: "market", source: "manual", defaultValue: 5.0, description: "주식시장 위험 프리미엄", impactDescription: "CAPM Beta 조정 할인율 산정에 사용" },
  { id: "inflationRate", name: "Inflation Rate", nameKr: "물가상승률", type: "percentage", category: "market", source: "manual", defaultValue: 2.5, description: "연간 물가상승률", impactDescription: "실질수익률 계산, 장기 현금흐름 조정" },
  { id: "capRate", name: "Cap Rate", nameKr: "환원율", type: "percentage", category: "market", source: "manual", defaultValue: 5.0, description: "시장 자본환원율", impactDescription: "직접환원법 분모, 잔존가치 산정에 사용" },
  
  // 리스크 관련
  { id: "ltv", name: "LTV", nameKr: "담보인정비율", type: "percentage", category: "risk", source: "calculated", description: "Loan-to-Value Ratio", impactDescription: "약정(Covenant) 준수 여부 판단, 추가 담보 필요성 평가" },
  { id: "dscr", name: "DSCR", nameKr: "원리금상환비율", type: "number", category: "risk", source: "calculated", description: "Debt Service Coverage Ratio", impactDescription: "현금흐름 충분성 평가, 약정 위반 리스크 모니터링" },
  { id: "icr", name: "ICR", nameKr: "이자보상비율", type: "number", category: "risk", source: "calculated", description: "Interest Coverage Ratio", impactDescription: "이자 지급 능력 평가, 신용 리스크 지표" },
  { id: "constructionRisk", name: "Construction Risk", nameKr: "공사 리스크", type: "percentage", category: "risk", source: "manual", defaultValue: 15, description: "공사 지연/비용 초과 위험", impactDescription: "리스크 프리미엄으로 할인율에 직접 가산" },
  { id: "marketRisk", name: "Market Risk", nameKr: "시장 리스크", type: "percentage", category: "risk", source: "manual", defaultValue: 10, description: "분양/임대 시장 위험", impactDescription: "현금흐름 확률 조정 또는 리스크 프리미엄으로 반영" },
  
  // 약정 관련
  { id: "ltvCovenant", name: "LTV Covenant", nameKr: "LTV 약정", type: "percentage", category: "covenant", source: "ontology", linkedObject: "Covenant", linkedProperty: "threshold", defaultValue: 70, description: "LTV 준수 기준", impactDescription: "약정 위반 시 조기상환/이자율 상향 트리거" },
  { id: "dscrCovenant", name: "DSCR Covenant", nameKr: "DSCR 약정", type: "number", category: "covenant", source: "ontology", linkedObject: "Covenant", linkedProperty: "threshold", defaultValue: 1.2, description: "DSCR 준수 기준", impactDescription: "약정 위반 시 추가 담보/현금 적립 요구 트리거" }
]

// ════════════════════════════════════════════════════════════════════════════════
// 시뮬레이션 워크플로 스텝
// ════════════════════════════════════════════════════════════════════════════════

interface WorkflowStep {
  id: string
  name: string
  description: string
  inputs: string[]
  outputs: string[]
  formula?: string
  status: "pending" | "running" | "completed" | "error"
  result?: any
}

// ════════════════════════════════════════════════════════════════════════════════
// 메인 컴포넌트
// ════════════════════════════════════════════════════════════════════════════════

interface ValuationConfig {
  projectName: string
  assetType: string
  totalAmount: number
  currentValue: number
  completionRate: number
  presaleRate: number
  riskFreeRate: number
  discountPremium: number
  companyRating: string
  noi?: number
  capRate?: number
  gdv?: number
  constructionCost?: number
  [key: string]: any
}

export function ValuationSimulator() {
  const { toast } = useToast()
  const [isSimulating, setIsSimulating] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [selectedMethodology, setSelectedMethodology] = useState<string>("dcf_ipev")
  const [showParamWizard, setShowParamWizard] = useState(false)
  const [showMethodologyDetail, setShowMethodologyDetail] = useState(false)
  const [showWorkflowDialog, setShowWorkflowDialog] = useState(false)
  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>([])
  const [currentWorkflowStep, setCurrentWorkflowStep] = useState(0)
  
  const [activeParams, setActiveParams] = useState<string[]>([
    "totalAmount", "currentValue", "completionRate", "presaleRate", 
    "riskFreeRate", "discountPremium", "companyRating", "noi", "capRate"
  ])
  
  const [config, setConfig] = useState<ValuationConfig>({
    projectName: "강남 복합개발 PF",
    assetType: "PF_DEVELOPMENT",
    totalAmount: 2000,
    currentValue: 1800,
    completionRate: 45,
    presaleRate: 65,
    riskFreeRate: 3.5,
    discountPremium: 2.5,
    companyRating: "BBB",
    noi: 120,
    capRate: 5.0,
    gdv: 3000,
    constructionCost: 1500
  })

  // 자산유형 변경 시 적합한 방법론 자동 선택
  useEffect(() => {
    const applicableMethodologies = VALIDATED_METHODOLOGIES.filter(m => 
      m.applicableAssets.includes(config.assetType)
    )
    if (applicableMethodologies.length > 0 && !applicableMethodologies.find(m => m.id === selectedMethodology)) {
      setSelectedMethodology(applicableMethodologies[0].id)
    }
  }, [config.assetType, selectedMethodology])

  const currentMethodology = VALIDATED_METHODOLOGIES.find(m => m.id === selectedMethodology)
  const applicableMethodologies = VALIDATED_METHODOLOGIES.filter(m => m.applicableAssets.includes(config.assetType))

  // 워크플로 생성 및 실행
  const generateWorkflow = (): WorkflowStep[] => {
    const methodology = currentMethodology
    if (!methodology) return []

    const steps: WorkflowStep[] = [
      {
        id: "param_load",
        name: "1. 파라미터 로딩",
        description: "온톨로지에서 매핑된 파라미터를 로드합니다.",
        inputs: ["Project", "Company", "Tranche", "Covenant"],
        outputs: activeParams,
        status: "pending"
      },
      {
        id: "discount_rate",
        name: "2. 할인율 산정",
        description: "CAPM 기반 할인율을 산정합니다.",
        inputs: ["riskFreeRate", "marketPremium", "assetType", "creditRating"],
        outputs: ["discountRate"],
        formula: "r = Rf + β × (Rm - Rf) + Illiquidity Premium + Credit Spread",
        status: "pending"
      }
    ]

    // 방법론별 추가 스텝
    if (methodology.id === "dcf_ipev") {
      steps.push(
        {
          id: "cashflow_projection",
          name: "3. 현금흐름 예측",
          description: "기간별 현금흐름을 예측합니다.",
          inputs: ["totalAmount", "presaleRate", "completionRate"],
          outputs: ["projectedCashFlows"],
          status: "pending"
        },
        {
          id: "dcf_calc",
          name: "4. DCF 계산",
          description: "할인현금흐름을 계산합니다.",
          inputs: ["projectedCashFlows", "discountRate"],
          outputs: ["npv", "irr"],
          formula: methodology.formula,
          status: "pending"
        }
      )
    } else if (methodology.id === "income_capitalization") {
      steps.push(
        {
          id: "noi_calc",
          name: "3. NOI 계산",
          description: "순영업이익을 계산합니다.",
          inputs: ["grossIncome", "vacancyRate", "opexRatio"],
          outputs: ["noi"],
          formula: "NOI = Gross Income × (1 - Vacancy) - OpEx",
          status: "pending"
        },
        {
          id: "cap_calc",
          name: "4. 직접환원 계산",
          description: "자본환원율로 가치를 산정합니다.",
          inputs: ["noi", "capRate"],
          outputs: ["fairValue"],
          formula: methodology.formula,
          status: "pending"
        }
      )
    } else if (methodology.id === "residual_method") {
      steps.push(
        {
          id: "cost_calc",
          name: "3. 개발비용 집계",
          description: "총 개발비용을 집계합니다.",
          inputs: ["constructionCost", "financeCost", "fees", "contingency"],
          outputs: ["totalCost"],
          status: "pending"
        },
        {
          id: "residual_calc",
          name: "4. 잔여가치 계산",
          description: "GDV에서 비용을 차감합니다.",
          inputs: ["gdv", "totalCost", "developerProfit"],
          outputs: ["residualValue"],
          formula: methodology.formula,
          status: "pending"
        }
      )
    }

    // 공통 마무리 스텝
    steps.push(
      {
        id: "risk_adjustment",
        name: `${steps.length + 1}. 리스크 조정`,
        description: "각종 리스크 요소를 반영합니다.",
        inputs: ["constructionRisk", "marketRisk", "completionRate"],
        outputs: ["adjustedValue", "riskAdjustments"],
        status: "pending"
      },
      {
        id: "final_valuation",
        name: `${steps.length + 2}. 최종 가치 산정`,
        description: "공정가치를 확정합니다.",
        inputs: ["adjustedValue", "comparables"],
        outputs: ["fairValue", "valuationRange"],
        status: "pending"
      }
    )

    return steps
  }

  const runWorkflow = async () => {
    setShowWorkflowDialog(true)
    setIsSimulating(true)
    const steps = generateWorkflow()
    setWorkflowSteps(steps)
    setCurrentWorkflowStep(0)

    // 스텝별 시뮬레이션
    for (let i = 0; i < steps.length; i++) {
      setCurrentWorkflowStep(i)
      setWorkflowSteps(prev => prev.map((s, idx) => 
        idx === i ? { ...s, status: "running" } : s
      ))
      
      await new Promise(resolve => setTimeout(resolve, 800)) // 시뮬레이션 딜레이

      // 결과 생성 (실제로는 ValuationEngine 호출)
      const stepResult = {
        step: steps[i].id,
        outputs: steps[i].outputs.reduce((acc, out) => {
          if (out === "discountRate") acc[out] = (config.riskFreeRate + config.discountPremium + 3) / 100
          else if (out === "npv") acc[out] = config.currentValue * 1.05
          else if (out === "irr") acc[out] = 0.125
          else if (out === "fairValue") acc[out] = config.currentValue * 1.08
          else acc[out] = config[out] || "calculated"
          return acc
        }, {} as any)
      }

      setWorkflowSteps(prev => prev.map((s, idx) => 
        idx === i ? { ...s, status: "completed", result: stepResult } : s
      ))
    }

    // 최종 결과
    try {
      const scenarioResult = await AIPLogic.simulateScenario(
        `${config.projectName} 가치평가`,
        {
          projectName: config.projectName,
          assetType: config.assetType,
          totalAmount: config.totalAmount,
          currentValue: config.currentValue,
          completionRate: config.completionRate / 100,
          presaleRate: config.presaleRate / 100,
          riskFreeRate: config.riskFreeRate / 100,
          marketPremium: config.discountPremium / 100,
          companyRating: config.companyRating,
          valuationModel: selectedMethodology,
          noi: config.noi,
          capRate: config.capRate ? config.capRate / 100 : undefined
        }
      )
      setResult(scenarioResult)
      toast({
        title: "가치평가 완료",
        description: `${currentMethodology?.name} 방법론 적용 완료`,
      })
    } catch (error) {
      toast({
        title: "시뮬레이션 오류",
        description: error instanceof Error ? error.message : "가치평가 시뮬레이션 중 오류가 발생했습니다.",
        variant: "destructive"
      })
    } finally {
      setIsSimulating(false)
    }
  }

  const handleAddParameter = (paramId: string) => {
    if (!activeParams.includes(paramId)) {
      setActiveParams([...activeParams, paramId])
      const param = ONTOLOGY_PARAMETERS.find(p => p.id === paramId)
      if (param?.defaultValue !== undefined) {
        setConfig(prev => ({ ...prev, [paramId]: param.defaultValue }))
      }
      toast({
        title: "파라미터 추가됨",
        description: `${param?.nameKr || paramId}가 평가 모델에 추가되었습니다.`,
      })
    }
  }

  const handleRemoveParameter = (paramId: string) => {
    setActiveParams(activeParams.filter(p => p !== paramId))
    toast({
      title: "파라미터 제거됨",
      description: "파라미터가 평가 모델에서 제거되었습니다.",
    })
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl lg:text-2xl font-bold flex items-center gap-2">
            <Calculator className="w-6 h-6 text-emerald-400" />
            대체자산 가치평가 시뮬레이터
          </h2>
          <p className="text-sm text-zinc-400 mt-1">IPEV / IVS / IFRS 13 기반 검증 방법론 적용</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowParamWizard(true)}>
            <Plus className="w-4 h-4 mr-2" />
            파라미터 추가
          </Button>
          <Button 
            className="bg-emerald-600 hover:bg-emerald-700" 
            onClick={runWorkflow}
            disabled={isSimulating}
          >
            <Play className="w-4 h-4 mr-2" />
            {isSimulating ? "분석 중..." : "가치평가 실행"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 좌측: 방법론 및 파라미터 설정 */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* 평가 방법론 선택 */}
          <Card className="bg-zinc-900/50 border-zinc-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-purple-400" />
                검증 평가 방법론 선택
              </h3>
              <Badge variant="outline" className="text-purple-400 border-purple-400/50">
                {applicableMethodologies.length}개 적용 가능
              </Badge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {applicableMethodologies.map((method) => (
                <button
                  key={method.id}
                  onClick={() => setSelectedMethodology(method.id)}
                  className={`p-4 rounded-lg border text-left transition-all group ${
                    selectedMethodology === method.id
                      ? "bg-purple-500/20 border-purple-500/50"
                      : "bg-zinc-800/50 border-zinc-700 hover:border-zinc-600"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">{method.name}</div>
                      <div className="text-[10px] text-zinc-500 mt-0.5">{method.nameEn}</div>
                    </div>
                    {selectedMethodology === method.id && (
                      <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                    )}
                  </div>
                  <Badge variant="outline" className="text-[10px] mt-2 text-zinc-400">
                    {method.standard}
                  </Badge>
                  <p className="text-xs text-zinc-400 mt-2 line-clamp-2">{method.description}</p>
                </button>
              ))}
            </div>

            {/* 선택된 방법론 상세 */}
            {currentMethodology && (
              <div className="mt-4 p-4 bg-zinc-800/30 rounded-lg border border-zinc-700 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Info className="w-4 h-4 text-blue-400" />
                    <span className="text-sm font-medium text-blue-400">적용 수식</span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setShowMethodologyDetail(true)}>
                    상세 보기 <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
                <code className="block text-sm text-zinc-300 font-mono bg-zinc-900/50 p-3 rounded">
                  {currentMethodology.formula}
                </code>
                <p className="text-xs text-zinc-400">{currentMethodology.formulaDescription}</p>
                
                {/* 제약조건 */}
                <div className="pt-3 border-t border-zinc-700">
                  <div className="text-xs font-medium text-amber-400 mb-2 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    적용 제약조건
                  </div>
                  <ul className="text-xs text-zinc-400 space-y-1">
                    {currentMethodology.constraints.slice(0, 2).map((c, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-zinc-600">•</span>
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </Card>

          {/* 온톨로지 연결 파라미터 */}
          <Card className="bg-zinc-900/50 border-zinc-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Database className="w-5 h-5 text-blue-400" />
                온톨로지 연결 파라미터
              </h3>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-emerald-400 border-emerald-400/50">
                  <Link2 className="w-3 h-3 mr-1" />
                  {activeParams.filter(p => ONTOLOGY_PARAMETERS.find(op => op.id === p)?.source === "ontology").length}개 연결됨
                </Badge>
              </div>
            </div>
            
            <Tabs defaultValue="project" className="w-full">
              <TabsList className="grid w-full grid-cols-5 bg-zinc-800/50">
                <TabsTrigger value="project">프로젝트</TabsTrigger>
                <TabsTrigger value="company">회사</TabsTrigger>
                <TabsTrigger value="market">시장</TabsTrigger>
                <TabsTrigger value="risk">리스크</TabsTrigger>
                <TabsTrigger value="all">전체</TabsTrigger>
              </TabsList>
              
              {["project", "company", "market", "risk", "all"].map(category => (
                <TabsContent key={category} value={category} className="mt-4 space-y-4">
                  {ONTOLOGY_PARAMETERS
                    .filter(p => activeParams.includes(p.id))
                    .filter(p => category === "all" || p.category === category)
                    .map(param => (
                      <div key={param.id} className="p-3 bg-zinc-800/50 rounded-lg border border-zinc-700">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Label className="font-medium text-sm">{param.nameKr}</Label>
                            {param.source === "ontology" && param.linkedObject && (
                              <Badge variant="outline" className="text-[10px] text-emerald-400 border-emerald-400/30">
                                <Link2 className="w-2 h-2 mr-1" />
                                {param.linkedObject}.{param.linkedProperty}
                              </Badge>
                            )}
                            {param.source === "calculated" && (
                              <Badge variant="outline" className="text-[10px] text-amber-400 border-amber-400/30">
                                자동계산
                              </Badge>
                            )}
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-6 w-6 p-0 text-zinc-500 hover:text-red-400"
                            onClick={() => handleRemoveParameter(param.id)}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                        
                        {param.type === "percentage" ? (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-zinc-500">{param.description}</span>
                              <Badge variant="outline">{config[param.id] || param.defaultValue || 0}%</Badge>
                            </div>
                            <Slider
                              value={[config[param.id] || param.defaultValue || 0]}
                              onValueChange={(value) => setConfig({ ...config, [param.id]: value[0] })}
                              min={param.min || 0}
                              max={param.max || 100}
                              step={param.id.includes("Rate") ? 0.25 : 5}
                            />
                          </div>
                        ) : param.type === "rating" ? (
                          <Select
                            value={config[param.id] || "BBB"}
                            onValueChange={(value) => setConfig({ ...config, [param.id]: value })}
                          >
                            <SelectTrigger className="bg-zinc-900 border-zinc-700">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-zinc-900 border-zinc-700">
                              {["AAA", "AA", "A", "BBB", "BB", "B", "CCC"].map(r => (
                                <SelectItem key={r} value={r}>{r}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <Input
                            type="number"
                            value={config[param.id] || param.defaultValue || ""}
                            onChange={(e) => setConfig({ ...config, [param.id]: Number(e.target.value) })}
                            className="bg-zinc-900 border-zinc-700"
                            placeholder={param.description}
                          />
                        )}
                        
                        {param.impactDescription && (
                          <p className="text-[10px] text-zinc-500 mt-2 flex items-start gap-1">
                            <Target className="w-3 h-3 shrink-0 mt-0.5 text-blue-400" />
                            <span><strong className="text-zinc-400">영향:</strong> {param.impactDescription}</span>
                          </p>
                        )}
                      </div>
                    ))}
                </TabsContent>
              ))}
            </Tabs>
          </Card>
        </div>

        {/* 우측: 결과 패널 */}
        <div className="space-y-6">
          {result ? (
            <>
              <Card className="bg-zinc-900/50 border-zinc-800 p-6">
                <h3 className="text-lg font-semibold mb-4">가치평가 결과</h3>
                <div className="space-y-4">
                  <div className="bg-zinc-800/50 border border-zinc-700 rounded p-4">
                    <div className="text-xs text-zinc-400 mb-1">공정가치 (Fair Value)</div>
                    <div className="text-3xl font-bold text-emerald-400">
                      {result?.result?.summary?.fairValue?.toFixed(0) || config.currentValue.toFixed(0)}억
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-zinc-800/50 border border-zinc-700 rounded p-3">
                      <div className="text-xs text-zinc-400 mb-1">IRR</div>
                      <div className="text-xl font-bold text-blue-400">
                        {result?.result?.summary?.irr ? (result.result.summary.irr * 100).toFixed(1) : "12.5"}%
                      </div>
                    </div>
                    <div className="bg-zinc-800/50 border border-zinc-700 rounded p-3">
                      <div className="text-xs text-zinc-400 mb-1">NPV</div>
                      <div className="text-xl font-bold text-purple-400">
                        {result?.result?.summary?.npv?.toFixed(0) || (config.currentValue * 0.08).toFixed(0)}억
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className={`p-4 ${
                (result?.result?.summary?.irr ?? 0.125) >= 0.10 
                  ? "bg-emerald-500/10 border-emerald-500/30" 
                  : "bg-amber-500/10 border-amber-500/30"
              }`}>
                <div className="flex items-start gap-3">
                  {(result?.result?.summary?.irr ?? 0.125) >= 0.10 ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-amber-400 mt-0.5" />
                  )}
                  <div className="text-sm">
                    <div className={`font-semibold mb-1 ${
                      (result?.result?.summary?.irr ?? 0.125) >= 0.10 ? "text-emerald-400" : "text-amber-400"
                    }`}>
                      AI 투자 의견
                    </div>
                    <p className="text-zinc-300">{result?.recommendation || "투자 적정성 분석 결과를 확인하세요."}</p>
                  </div>
                </div>
              </Card>
            </>
          ) : (
            <Card className="bg-zinc-900/50 border-zinc-800 p-6">
              <div className="text-center py-8">
                <TrendingUp className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-zinc-400 mb-2">가치평가 대기 중</h3>
                <p className="text-sm text-zinc-500">
                  방법론을 선택하고 파라미터를 입력한 후<br />가치평가를 실행하세요.
                </p>
              </div>
            </Card>
          )}

          {/* 적용 방법론 정보 */}
          <Card className="bg-purple-500/10 border-purple-500/30 p-4">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-purple-400 mt-0.5" />
              <div className="text-sm">
                <div className="font-semibold text-purple-400 mb-1">적용 방법론</div>
                <p className="text-zinc-300 text-xs">{currentMethodology?.name}</p>
                <p className="text-zinc-500 text-[10px] mt-1">{currentMethodology?.standard}</p>
              </div>
            </div>
          </Card>

          {/* 적용된 파라미터 요약 */}
          <Card className="bg-zinc-900/50 border-zinc-800 p-4">
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Database className="w-4 h-4 text-blue-400" />
              적용된 파라미터 ({activeParams.length}개)
            </h4>
            <ScrollArea className="h-[200px]">
              <div className="space-y-2 pr-2">
                {activeParams.map(paramId => {
                  const param = ONTOLOGY_PARAMETERS.find(p => p.id === paramId)
                  if (!param) return null
                  return (
                    <div key={paramId} className="flex items-center justify-between text-xs p-2 bg-zinc-800/30 rounded">
                      <div className="flex items-center gap-2">
                        <span className="text-zinc-400">{param.nameKr}</span>
                        <Badge variant="outline" className="text-[8px] py-0 px-1">
                          {param.source === "ontology" ? "Graph" : param.source === "calculated" ? "계산" : "수동"}
                        </Badge>
                      </div>
                      <span className="font-mono text-zinc-300">
                        {config[paramId]}{param.type === "percentage" ? "%" : param.unit || ""}
                      </span>
                    </div>
                  )
                })}
              </div>
            </ScrollArea>
          </Card>
        </div>
      </div>

      {/* 파라미터 추가 위자드 */}
      <ParameterWizardDialog
        open={showParamWizard}
        onOpenChange={setShowParamWizard}
        activeParams={activeParams}
        onAddParameter={handleAddParameter}
        assetType={config.assetType}
      />

      {/* 방법론 상세 다이얼로그 */}
      <MethodologyDetailDialog
        open={showMethodologyDetail}
        onOpenChange={setShowMethodologyDetail}
        methodology={currentMethodology}
      />

      {/* 워크플로 실행 다이얼로그 */}
      <WorkflowExecutionDialog
        open={showWorkflowDialog}
        onOpenChange={setShowWorkflowDialog}
        steps={workflowSteps}
        currentStep={currentWorkflowStep}
        methodology={currentMethodology}
        config={config}
        isRunning={isSimulating}
      />
    </div>
  )
}

// ════════════════════════════════════════════════════════════════════════════════
// 파라미터 추가 위자드 다이얼로그
// ════════════════════════════════════════════════════════════════════════════════

interface ParameterWizardDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  activeParams: string[]
  onAddParameter: (paramId: string) => void
  assetType: string
}

function ParameterWizardDialog({ open, onOpenChange, activeParams, onAddParameter, assetType }: ParameterWizardDialogProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  
  const categories = [
    { id: "all", name: "전체", icon: Database },
    { id: "project", name: "프로젝트", icon: Layers },
    { id: "company", name: "회사", icon: Database },
    { id: "tranche", name: "트랜치", icon: Layers },
    { id: "market", name: "시장", icon: TrendingUp },
    { id: "risk", name: "리스크", icon: AlertCircle },
    { id: "covenant", name: "약정", icon: FileText },
  ]

  const filteredParams = ONTOLOGY_PARAMETERS.filter(p => {
    if (activeParams.includes(p.id)) return false
    if (selectedCategory !== "all" && p.category !== selectedCategory) return false
    return true
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-900 border-zinc-800 max-w-3xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-emerald-400" />
            온톨로지 파라미터 추가
          </DialogTitle>
          <DialogDescription>
            그래프 DB에서 매핑된 객체/속성을 선택하여 가치평가 모델에 반영합니다.
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-2 flex-wrap py-2">
          {categories.map((cat) => {
            const Icon = cat.icon
            const count = ONTOLOGY_PARAMETERS.filter(p => 
              !activeParams.includes(p.id) && (cat.id === "all" || p.category === cat.id)
            ).length
            return (
              <Button
                key={cat.id}
                variant={selectedCategory === cat.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(cat.id)}
                className={selectedCategory === cat.id ? "bg-emerald-600" : ""}
              >
                <Icon className="w-4 h-4 mr-1" />
                {cat.name}
                <Badge variant="secondary" className="ml-2 text-[10px] px-1">{count}</Badge>
              </Button>
            )
          })}
        </div>

        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-2">
            {filteredParams.map((param) => (
              <div
                key={param.id}
                className="flex items-start justify-between p-4 bg-zinc-800/50 rounded-lg border border-zinc-700 hover:border-emerald-500/30 transition-colors"
              >
                <div className="flex-1 min-w-0 pr-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm">{param.nameKr}</span>
                    <span className="text-xs text-zinc-500">({param.name})</span>
                    {param.linkedObject && (
                      <Badge variant="outline" className="text-[10px] text-emerald-400 border-emerald-400/30">
                        <Link2 className="w-2 h-2 mr-1" />
                        {param.linkedObject}.{param.linkedProperty}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-zinc-400 mt-1">{param.description}</p>
                  {param.impactDescription && (
                    <p className="text-[10px] text-blue-400 mt-2 flex items-start gap-1">
                      <Target className="w-3 h-3 shrink-0 mt-0.5" />
                      <span>{param.impactDescription}</span>
                    </p>
                  )}
                </div>
                <Button
                  size="sm"
                  onClick={() => {
                    onAddParameter(param.id)
                    onOpenChange(false)
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 shrink-0"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  추가
                </Button>
              </div>
            ))}
            {filteredParams.length === 0 && (
              <div className="text-center py-12 text-zinc-500">
                <Database className="w-10 h-10 mx-auto mb-3 opacity-50" />
                <p>추가 가능한 파라미터가 없습니다.</p>
                <p className="text-xs mt-1">다른 카테고리를 선택해 보세요.</p>
              </div>
            )}
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            닫기
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ════════════════════════════════════════════════════════════════════════════════
// 방법론 상세 다이얼로그
// ════════════════════════════════════════════════════════════════════════════════

interface MethodologyDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  methodology: ValuationMethodology | undefined
}

function MethodologyDetailDialog({ open, onOpenChange, methodology }: MethodologyDetailDialogProps) {
  if (!methodology) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-900 border-zinc-800 max-w-3xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-purple-400" />
            {methodology.name}
          </DialogTitle>
          <DialogDescription className="flex items-center gap-2">
            {methodology.nameEn}
            <Badge variant="outline" className="text-xs">{methodology.standard}</Badge>
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-6">
            {/* 설명 */}
            <div>
              <h4 className="text-sm font-semibold mb-2 text-zinc-300">개요</h4>
              <p className="text-sm text-zinc-400">{methodology.description}</p>
            </div>

            {/* 수식 */}
            <div className="p-4 bg-zinc-800/50 rounded-lg border border-zinc-700">
              <h4 className="text-sm font-semibold mb-2 text-blue-400">평가 수식</h4>
              <code className="block text-lg text-zinc-200 font-mono mb-2">{methodology.formula}</code>
              <p className="text-xs text-zinc-500">{methodology.formulaDescription}</p>
            </div>

            {/* 필수 파라미터 */}
            <div>
              <h4 className="text-sm font-semibold mb-3 text-emerald-400">필수 파라미터</h4>
              <div className="grid grid-cols-2 gap-2">
                {methodology.requiredParams.map(param => (
                  <div key={param.id} className="p-3 bg-zinc-800/30 rounded border border-zinc-700">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{param.nameKr}</span>
                      {param.ontologyMapping && (
                        <Badge variant="outline" className="text-[10px] text-emerald-400">
                          {param.ontologyMapping.object}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-zinc-500 mt-1">{param.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 선택 파라미터 */}
            {methodology.optionalParams.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-3 text-zinc-400">선택 파라미터</h4>
                <div className="grid grid-cols-2 gap-2">
                  {methodology.optionalParams.map(param => (
                    <div key={param.id} className="p-3 bg-zinc-800/20 rounded border border-zinc-800">
                      <span className="font-medium text-sm text-zinc-400">{param.nameKr}</span>
                      <p className="text-xs text-zinc-600 mt-1">{param.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 제약조건 */}
            <div>
              <h4 className="text-sm font-semibold mb-3 text-amber-400 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                적용 제약조건
              </h4>
              <ul className="space-y-2">
                {methodology.constraints.map((c, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-zinc-400">
                    <span className="text-amber-400 shrink-0">•</span>
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 리스크 요인 */}
            <div>
              <h4 className="text-sm font-semibold mb-3 text-rose-400">주요 리스크 요인</h4>
              <div className="flex flex-wrap gap-2">
                {methodology.riskFactors.map((r, i) => (
                  <Badge key={i} variant="outline" className="text-rose-400 border-rose-400/30">
                    {r}
                  </Badge>
                ))}
              </div>
            </div>

            {/* 참고문헌 */}
            <div>
              <h4 className="text-sm font-semibold mb-3 text-zinc-400">참고문헌</h4>
              <ul className="space-y-1">
                {methodology.references.map((ref, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-zinc-500">
                    <FileText className="w-3 h-3" />
                    <span>{ref.name}</span>
                    {ref.url && (
                      <a href={ref.url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            닫기
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ════════════════════════════════════════════════════════════════════════════════
// 워크플로 실행 다이얼로그
// ════════════════════════════════════════════════════════════════════════════════

interface WorkflowExecutionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  steps: WorkflowStep[]
  currentStep: number
  methodology: ValuationMethodology | undefined
  config: ValuationConfig
  isRunning: boolean
}

function WorkflowExecutionDialog({ open, onOpenChange, steps, currentStep, methodology, config, isRunning }: WorkflowExecutionDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-900 border-zinc-800 max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Workflow className="w-5 h-5 text-emerald-400" />
            가치평가 워크플로 실행
          </DialogTitle>
          <DialogDescription>
            {methodology?.name} 방법론 기반 단계별 계산 과정
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <div className="grid grid-cols-2 gap-6 h-full">
            {/* 왼쪽: 워크플로 스텝 */}
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-3">
                {steps.map((step, idx) => (
                  <div
                    key={step.id}
                    className={`p-4 rounded-lg border transition-all ${
                      step.status === "completed" ? "bg-emerald-500/10 border-emerald-500/30" :
                      step.status === "running" ? "bg-blue-500/10 border-blue-500/50 animate-pulse" :
                      step.status === "error" ? "bg-red-500/10 border-red-500/30" :
                      "bg-zinc-800/50 border-zinc-700"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {step.status === "completed" ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        ) : step.status === "running" ? (
                          <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
                        ) : (
                          <div className="w-5 h-5 rounded-full border-2 border-zinc-600" />
                        )}
                        <span className="font-medium text-sm">{step.name}</span>
                      </div>
                      <Badge variant="outline" className={`text-[10px] ${
                        step.status === "completed" ? "text-emerald-400 border-emerald-400/30" :
                        step.status === "running" ? "text-blue-400 border-blue-400/30" :
                        "text-zinc-500"
                      }`}>
                        {step.status === "completed" ? "완료" :
                         step.status === "running" ? "실행 중" : "대기"}
                      </Badge>
                    </div>
                    <p className="text-xs text-zinc-400 mb-2">{step.description}</p>
                    
                    {step.formula && (
                      <code className="block text-xs text-zinc-300 font-mono bg-zinc-900/50 p-2 rounded mb-2">
                        {step.formula}
                      </code>
                    )}
                    
                    <div className="flex flex-wrap gap-1">
                      {step.inputs.map(input => (
                        <Badge key={input} variant="outline" className="text-[10px] text-zinc-500">
                          {input}
                        </Badge>
                      ))}
                      {step.inputs.length > 0 && step.outputs.length > 0 && (
                        <ArrowRight className="w-3 h-3 text-zinc-600" />
                      )}
                      {step.outputs.map(output => (
                        <Badge key={output} variant="outline" className="text-[10px] text-emerald-400 border-emerald-400/30">
                          {output}
                        </Badge>
                      ))}
                    </div>

                    {step.result && (
                      <div className="mt-2 pt-2 border-t border-zinc-700">
                        <div className="text-[10px] text-zinc-500 mb-1">계산 결과:</div>
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(step.result.outputs).map(([key, value]) => (
                            <div key={key} className="text-xs">
                              <span className="text-zinc-400">{key}:</span>
                              <span className="text-emerald-400 font-mono ml-1">
                                {typeof value === "number" ? value.toFixed(4) : String(value)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* 오른쪽: 입력 파라미터 및 결과 요약 */}
            <div className="space-y-4">
              <Card className="bg-zinc-800/50 border-zinc-700 p-4">
                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Database className="w-4 h-4 text-blue-400" />
                  입력 파라미터
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 bg-zinc-900/50 rounded">
                    <span className="text-zinc-500">프로젝트명</span>
                    <div className="font-medium">{config.projectName}</div>
                  </div>
                  <div className="p-2 bg-zinc-900/50 rounded">
                    <span className="text-zinc-500">총 사업비</span>
                    <div className="font-medium">{config.totalAmount}억원</div>
                  </div>
                  <div className="p-2 bg-zinc-900/50 rounded">
                    <span className="text-zinc-500">공정률</span>
                    <div className="font-medium">{config.completionRate}%</div>
                  </div>
                  <div className="p-2 bg-zinc-900/50 rounded">
                    <span className="text-zinc-500">분양률</span>
                    <div className="font-medium">{config.presaleRate}%</div>
                  </div>
                  <div className="p-2 bg-zinc-900/50 rounded">
                    <span className="text-zinc-500">무위험이자율</span>
                    <div className="font-medium">{config.riskFreeRate}%</div>
                  </div>
                  <div className="p-2 bg-zinc-900/50 rounded">
                    <span className="text-zinc-500">신용등급</span>
                    <div className="font-medium">{config.companyRating}</div>
                  </div>
                </div>
              </Card>

              <Card className="bg-zinc-800/50 border-zinc-700 p-4">
                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-purple-400" />
                  적용 방법론
                </h4>
                <div className="text-sm">
                  <div className="font-medium text-purple-400">{methodology?.name}</div>
                  <div className="text-xs text-zinc-500 mt-1">{methodology?.standard}</div>
                  <code className="block text-xs font-mono text-zinc-400 mt-2 p-2 bg-zinc-900/50 rounded">
                    {methodology?.formula}
                  </code>
                </div>
              </Card>

              <Card className="bg-emerald-500/10 border-emerald-500/30 p-4">
                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Target className="w-4 h-4 text-emerald-400" />
                  진행 상황
                </h4>
                <Progress value={(currentStep + 1) / steps.length * 100} className="h-2 mb-2" />
                <div className="text-xs text-zinc-400">
                  {currentStep + 1} / {steps.length} 단계 {isRunning ? "진행 중..." : "완료"}
                </div>
              </Card>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isRunning}>
            {isRunning ? "실행 중..." : "닫기"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
