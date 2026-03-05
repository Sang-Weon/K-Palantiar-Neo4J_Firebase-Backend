import { db } from "./firebase";
import { collection, addDoc, serverTimestamp, getDocs, query, orderBy, limit } from "firebase/firestore";

export interface SimulationScenario {
    id?: string;
    name: string;
    variables: Record<string, any>;
    prediction: {
        efficiencyGain: number;
        costReduction: number;
        riskScore: number;
    };
    recommendation: string;
    affectedSystems: string[];
    executionPlan?: ExecutionStep[];
    createdAt: any;
}

export interface ExecutionStep {
    system: string;
    action: string;
    parameters: Record<string, any>;
    estimatedDuration: number; // seconds
}

export const AIPLogic = {
    // 시뮬레이션 시나리오 분석 및 결과 생성 (드림텍 특화)
    async simulateScenario(name: string, variables: Record<string, any>): Promise<SimulationScenario> {
        let efficiencyGain = 0;
        let costReduction = 0;
        let riskScore = 0;
        let recommendation = "";
        let affectedSystems: string[] = [];
        let executionPlan: ExecutionStep[] = [];

        // 수요 예측 및 최적대응 시나리오
        if (name.includes("옵션 1") || name.includes("긴급 생산") || name.includes("생산 증대")) {
            efficiencyGain = 12.5;
            costReduction = 185;
            riskScore = 18;
            recommendation = "SEC Galaxy S25 수요 +2,000대 증가에 대응하여 천안 공장 야간 라인을 가동합니다. 예상 추가 비용은 8.2% 증가하나, 매출 12.5% 상승으로 순이익 개선이 기대됩니다. SMT 라인 가동률을 94%로 상향 조정하고, 베트남 Vina2 공장과의 협력 생산 체제를 권장합니다.";
            affectedSystems = ["SAP ERP (PP)", "MES", "SCM", "QMS"];
            executionPlan = [
                { system: "SAP ERP", action: "생산 계획 수정 (PP Module)", parameters: { additionalQty: 2000, targetDate: "2026-03-15" }, estimatedDuration: 30 },
                { system: "MES", action: "천안 공장 야간 라인 스케줄 등록", parameters: { lineId: "CHN-SMT-01", shift: "night" }, estimatedDuration: 45 },
                { system: "SCM", action: "자재 긴급 발주 요청", parameters: { materials: ["IC_Chip", "FPCB_Board"], urgency: "high" }, estimatedDuration: 60 },
                { system: "QMS", action: "품질 검사 기준 적용", parameters: { standard: "SEC-QC-S25-001" }, estimatedDuration: 15 },
            ];
        } else if (name.includes("옵션 2") || name.includes("재고 활용") || name.includes("재고")) {
            efficiencyGain = 8.3;
            costReduction = 95;
            riskScore = 12;
            recommendation = "베트남 Vina2 공장의 기존 재고를 활용하여 SEC 긴급 수요에 대응합니다. 비용 증가는 3.5%로 최소화되나, 매출은 소폭 감소(-1.7%)할 수 있습니다. 물류 허브 간 재고 재배치를 통해 납기 준수율을 98% 이상으로 유지할 것을 권장합니다.";
            affectedSystems = ["SAP ERP (MM)", "WMS", "Logistics"];
            executionPlan = [
                { system: "SAP ERP", action: "재고 이전 전표 생성 (MM Module)", parameters: { fromPlant: "V200", toPlant: "CHN", qty: 2000 }, estimatedDuration: 25 },
                { system: "WMS", action: "출고 지시서 생성", parameters: { warehouse: "VN-WH-01", priority: "urgent" }, estimatedDuration: 20 },
                { system: "Logistics", action: "긴급 배송 스케줄 등록", parameters: { route: "VN-KR-Express", eta: "72h" }, estimatedDuration: 40 },
            ];
        } else if (name.includes("S24") || name.includes("수율")) {
            efficiencyGain = 15.8;
            costReduction = 180;
            riskScore = 12;
            recommendation = "갤럭시 S24용 지문인식 센서 모듈의 수율(Yield) 최적화를 위해 베트남 Vina 2 공장의 검사 공정 파라미터를 조정합니다. 예상 원가 절감액은 월 1.8억 원입니다.";
            affectedSystems = ["MES", "QMS", "SAP ERP (QM)"];
            executionPlan = [
                { system: "MES", action: "검사 파라미터 업데이트", parameters: { line: "TST-01", threshold: 0.95 }, estimatedDuration: 30 },
                { system: "QMS", action: "수율 목표 상향", parameters: { target: 98.5 }, estimatedDuration: 15 },
            ];
        } else if (name.includes("리드타임") || name.includes("공급망")) {
            efficiencyGain = 9.5;
            costReduction = 120;
            riskScore = 8;
            recommendation = "핵심 IC 소자의 리드타임이 4주에서 6주로 지연됨에 따라, 천안 거점의 안전 재고를 20% 늘리고 생산 사이클을 2일 단축하는 시나리오를 권장합니다.";
            affectedSystems = ["SAP ERP (MM)", "SCM", "MES"];
            executionPlan = [
                { system: "SAP ERP", action: "안전재고 수준 조정", parameters: { material: "IC_Chip", safetyStock: "+20%" }, estimatedDuration: 20 },
                { system: "SCM", action: "공급업체 리드타임 업데이트", parameters: { supplier: "IC_Supplier", leadTime: 42 }, estimatedDuration: 15 },
            ];
        } else if (name.includes("가동율") || name.includes("가동률")) {
            efficiencyGain = 22.1;
            costReduction = 250;
            riskScore = 20;
            recommendation = "드림텍 Vina 1 공장의 SMT 라인 가동율을 88%에서 94%로 상향 평준화하기 위해 예방 정비 스케줄을 재구성할 것을 제안합니다.";
            affectedSystems = ["MES", "EAM", "SAP ERP (PM)"];
            executionPlan = [
                { system: "MES", action: "라인 가동 스케줄 최적화", parameters: { targetOEE: 94 }, estimatedDuration: 45 },
                { system: "EAM", action: "예방정비 일정 재구성", parameters: { frequency: "weekly" }, estimatedDuration: 30 },
            ];
        // 품질관리 및 수율 최적화 시나리오
        } else if (name.includes("검사 파라미터") || name.includes("AOI")) {
            efficiencyGain = 2.8;
            costReduction = 120;
            riskScore = 8;
            recommendation = "AOI(자동광학검사) 시스템의 검사 임계값을 최적화하여 False Positive 비율을 15% 감소시킵니다. 현재 수율 94.2%에서 97%로 상향 예상되며, 월 1.2억원의 재작업 비용 절감이 기대됩니다.";
            affectedSystems = ["QMS", "MES", "AOI"];
            executionPlan = [
                { system: "QMS", action: "검사 기준 업데이트", parameters: { threshold: 0.95, tolerance: "±0.02mm" }, estimatedDuration: 20 },
                { system: "AOI", action: "임계값 파라미터 조정", parameters: { sensitivity: "medium-high" }, estimatedDuration: 15 },
                { system: "MES", action: "품질 데이터 수집 재설정", parameters: { interval: "realtime" }, estimatedDuration: 10 },
            ];
        } else if (name.includes("공정 조건") || name.includes("리플로우")) {
            efficiencyGain = 3.5;
            costReduction = 180;
            riskScore = 22;
            recommendation = "리플로우 오븐의 온도 프로파일을 최적화하고 솔더 페이스트 두께를 조정합니다. 솔더 불량률 40% 감소 예상되나, 초기 안정화 기간(3일) 동안 생산성 5% 감소가 예상됩니다.";
            affectedSystems = ["MES", "PLC", "SCADA"];
            executionPlan = [
                { system: "MES", action: "온도 프로파일 업데이트", parameters: { peakTemp: 245, preHeat: 180 }, estimatedDuration: 30 },
                { system: "PLC", action: "컨베이어 속도 조정", parameters: { speed: "-5%" }, estimatedDuration: 15 },
                { system: "SCADA", action: "실시간 모니터링 설정", parameters: { alertThreshold: "±3°C" }, estimatedDuration: 10 },
            ];
        } else if (name.includes("설비 예방정비") || name.includes("노즐")) {
            efficiencyGain = 1.5;
            costReduction = 85;
            riskScore = 5;
            recommendation = "SMT 마운터의 노즐 교체 및 피더 캘리브레이션을 실시합니다. 픽업 불량률 25% 감소 및 설비 안정성 향상이 기대됩니다. 정비 소요 시간은 4시간입니다.";
            affectedSystems = ["EAM", "MES", "CMMS"];
            executionPlan = [
                { system: "EAM", action: "예방정비 작업 지시서 생성", parameters: { workOrder: "PM-2024-0312" }, estimatedDuration: 10 },
                { system: "MES", action: "라인 일시 중단 스케줄 등록", parameters: { duration: "4h", shift: "night" }, estimatedDuration: 5 },
                { system: "CMMS", action: "부품 교체 이력 등록", parameters: { parts: ["Nozzle_501", "Feeder_CAL"] }, estimatedDuration: 15 },
            ];
        // 물류 최적화 시나리오
        } else if (name.includes("항공 긴급") || name.includes("전세기")) {
            efficiencyGain = 0;
            costReduction = -85;
            riskScore = 5;
            recommendation = "하노이-인천 전세기 긴급 항공 운송을 통해 3일 내 핵심 부품 도착이 가능합니다. 운송 비용 142% 증가($85,000)하나, 생산 라인 중단으로 인한 손실($250,000/일) 대비 경제적입니다. 납기 준수율 99% 보장됩니다.";
            affectedSystems = ["TMS", "WMS", "Customs"];
            executionPlan = [
                { system: "TMS", action: "항공 긴급 배송 등록", parameters: { carrier: "Korean Air Cargo", route: "HAN-ICN" }, estimatedDuration: 20 },
                { system: "Customs", action: "사전 통관 신청", parameters: { clearanceType: "express", hsCode: "8542.31" }, estimatedDuration: 30 },
                { system: "WMS", action: "입고 예정 등록", parameters: { eta: "72h", dock: "A-03" }, estimatedDuration: 10 },
            ];
        } else if (name.includes("해상 특송") || name.includes("희망봉")) {
            efficiencyGain = 0;
            costReduction = 50;
            riskScore = 35;
            recommendation = "희망봉 우회 해상 특송(Express)을 통해 비용을 절감합니다. 단, 12일 소요로 현재 납기(10일)를 초과하여 지연 패널티($15,000) 발생 가능성이 있습니다. 고객사 협의를 권장합니다.";
            affectedSystems = ["TMS", "Port System", "WMS"];
            executionPlan = [
                { system: "TMS", action: "해상 특송 예약", parameters: { vessel: "Maersk Express", route: "HPH-PUS" }, estimatedDuration: 15 },
                { system: "Port System", action: "부산항 선석 예약", parameters: { berth: "CT-7", eta: "12d" }, estimatedDuration: 20 },
                { system: "WMS", action: "입고 예정 등록", parameters: { eta: "288h", dock: "B-01" }, estimatedDuration: 10 },
            ];
        } else if (name.includes("복합 운송") || name.includes("항공+") || name.includes("권장")) {
            efficiencyGain = 5;
            costReduction = 33;
            riskScore = 12;
            recommendation = "복합 운송(항공: 하노이-홍콩, 해상: 홍콩-인천)을 통해 비용과 시간의 최적 균형을 달성합니다. 7일 소요로 납기 내 도착 가능하며, 순수 항공 대비 39% 비용 절감됩니다. AIP 엔진 권장 옵션입니다.";
            affectedSystems = ["TMS", "WMS", "Cross-docking"];
            executionPlan = [
                { system: "TMS", action: "복합 운송 경로 등록", parameters: { leg1: "Air HAN-HKG", leg2: "Sea HKG-ICN" }, estimatedDuration: 25 },
                { system: "Cross-docking", action: "홍콩 환적 예약", parameters: { hub: "HK-Hub-01", handlingTime: "6h" }, estimatedDuration: 15 },
                { system: "WMS", action: "입고 예정 등록", parameters: { eta: "168h", dock: "A-02" }, estimatedDuration: 10 },
            ];
        } else {
            efficiencyGain = 10.0;
            costReduction = 100;
            riskScore = 15;
            recommendation = "현재 드림텍 온톨로지 모델 분석 결과, 센서 모듈 조립 공정의 원가 비중을 5% 절감할 수 있는 최적화 포인트가 발견되었습니다.";
            affectedSystems = ["MES", "SAP ERP"];
            executionPlan = [
                { system: "MES", action: "공정 파라미터 최적화", parameters: { target: "cost_reduction" }, estimatedDuration: 30 },
            ];
        }

        const scenario: SimulationScenario = {
            name,
            variables,
            prediction: { efficiencyGain, costReduction, riskScore },
            recommendation,
            affectedSystems,
            executionPlan,
            createdAt: serverTimestamp()
        };

        const docRef = await addDoc(collection(db, "simulationScenarios"), scenario);
        scenario.id = docRef.id;

        return scenario;
    },

    // 최근 시뮬레이션 결과 조회
    async getRecentSimulations(limitCount: number = 10): Promise<SimulationScenario[]> {
        const q = query(
            collection(db, "simulationScenarios"),
            orderBy("createdAt", "desc"),
            limit(limitCount)
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SimulationScenario));
    },

    async processFeedback(actionId: string, actualResult: any) {
        console.log(`Processing feedback for action ${actionId}:`, actualResult);
        // 실제 피드백 처리 로직 구현
        await addDoc(collection(db, "feedbackLogs"), {
            actionId,
            actualResult,
            processedAt: serverTimestamp()
        });
    }
};
