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
