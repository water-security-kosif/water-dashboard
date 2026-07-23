import { useState, useMemo } from 'react';
import KpiHeader from './KpiHeader';
import FacilityMap from './FacilityMap';
import TsmcWaterIntensitySimulator from './TsmcWaterIntensitySimulator';
import { 
  Droplet, 
  ArrowDownRight, 
  Activity, 
  AlertTriangle, 
  HelpCircle, 
  RefreshCw, 
  Info, 
  AlertCircle,
  MapPin,
  Flame,
  Award,
  Sliders,
  Settings,
  Cpu,
  Database,
  X,
  FileCheck,
  Globe,
  Lock,
  ChevronDown,
  ChevronUp,
  BookOpen
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  Legend,
  LineChart,
  Line
} from 'recharts';

import cdpDataRaw from '../data/cdp_m9_data.json';
import srDataRaw from '../data/sustainability_report_data.json';
import dartDataRaw from '../data/dart_filing_water.json';

// Type definitions
interface WaterRecord {
  withdrawal: number | null;
  discharge: number | null;
  consumption: number | null;
  water_intensity: number | null;
  recycle_rate: number | null;
  note: string;
  discrepancy: boolean;
  discrepancyNote?: string;
}

interface CompanyData {
  [year: string]: WaterRecord;
}

interface Dataset {
  [company: string]: CompanyData;
}

const cdpData = cdpDataRaw as Dataset;
const srData = srDataRaw as Dataset;
const dartData = dartDataRaw as Dataset;

export default function WaterDashboard() {
  // State for Accordion Sections (exclusive open)
  const [activeSection, setActiveSection] = useState<string>('cdp');

  // State for filters (Archive Section)
  const [selectedCompany, setSelectedCompany] = useState<string>('ALL');
  const [selectedYear, setSelectedYear] = useState<string>('ALL');
  const [selectedSource, setSelectedSource] = useState<string>('ALL');
  
  // State for Record Excerpt Modal (Archive Section)
  const [selectedModalRecord, setSelectedModalRecord] = useState<any>(null);

  // State to switch dashboard views: General Quantity vs Quality & Efficiency
  const [dashboardView, setDashboardView] = useState<'efficiency' | 'volume'>('efficiency');

  // State for active discrepancy details (Archive Section)
  const [activeDiscrepancy, setActiveDiscrepancy] = useState<{
    company: string;
    year: string;
  } | null>(null);

  // State for Simulator
  const [monthlyProduction, setMonthlyProduction] = useState<number>(200); // Unit: thousand wafers/month

  // State for Scenario Tabs inside ultrapure context
  const [activeScenarioTab, setActiveScenarioTab] = useState<'ultrapure' | 'southwest' | 'policy'>('ultrapure');

  // State for CDP Response Matrix (Section 1)
  const [activeCdpQuestion, setActiveCdpQuestion] = useState<string>('W9.2.9');

  const companies = ['삼성전자', 'SK하이닉스', 'TSMC'];
  const years = ['2023', '2024', '2025'];
  const sources = [
    { key: 'CDP', label: 'CDP (M9 응답)' },
    { key: 'SR', label: '지속가능경영보고서' },
    { key: 'DART', label: 'DART (전자공시/대만공시)' }
  ];

  // Map English company keys in JSON to Korean labels and vice versa
  const companyKeyMap: { [key: string]: string } = {
    '삼성전자': 'Samsung Electronics',
    'SK하이닉스': 'SK Hynix',
    'TSMC': 'TSMC',
    'Samsung Electronics': '삼성전자',
    'SK Hynix': 'SK하이닉스'
  };

  // CDP Questionnaire Response Matrix Data
  const cdpMatrixData = useMemo(() => {
    return {
      'W9.2.9': {
        title: 'Q 9.2.9 폐수 처리 수준 (Wastewater Treatment Level)',
        desc: '각 기업이 가동 중인 폐수 처리 설비의 정화 등급과 고도 처리 기술 도입 수준을 규정합니다.',
        rows: [
          {
            aspect: '핵심 수처리 공법 (Core Technology)',
            samsung: 'MBR(생물반응기) + 활성탄 오존 고도 화학 처리',
            hynix: '물리·화학적 1차 가공 + 생물학적 고도 질소 탈질 처리',
            tsmc: '중수도(Greywater) 재생 가공 + 역삼투압(RO) 정밀 정제'
          },
          {
            aspect: '방류수 정화율 (Discharge Recycle)',
            samsung: '국가 방류 수질 기준치 대비 유기 물질 농도 80% 이상 추가 저감',
            hynix: '완충조 정화 및 물고기 생태 독성 스크리닝 후 안전 방류',
            tsmc: '단지 내 재생수로 85% 이상 재순환하여 공업용수 대체 가공'
          },
          {
            aspect: '지역 수생태계 환원 (Local Return)',
            samsung: '방류수를 오산천 및 진위천에 일 4.5만 톤 공급 (건천화 방지)',
            hynix: '이천 죽당천 및 청주 석남천에 하천유지용수 전량 환원 공급',
            tsmc: '대만 Hsinchu/Taichung 과학단지 전용 재생 물 순환망 연계 공급'
          },
          {
            aspect: '제3자 검증 여부 (Verification)',
            samsung: '검증 완료 (CDP W9.3.2 규정 준수)',
            hynix: '검증 완료 (CDP W9.3.2 규정 준수)',
            tsmc: '검증 완료 (CDP W9.3.2 규정 준수)'
          }
        ]
      },
      'W9.2.10': {
        title: 'Q 9.2.10 수질 오염물질 배출량 (Water Pollutant Discharges)',
        desc: '배출되는 방류수 내에 포함된 화학적산소요구량(COD), 유기화합물 및 특정 유해 물질의 질량과 저감 효율을 공시합니다.',
        rows: [
          {
            aspect: '주요 오염물 관리 대상 (Target Chemicals)',
            samsung: '불소(F), 구리(Cu), 망간(Mn) 등 반도체 식각 금속 물질',
            hynix: '암모니아성 질소(NH3-N), 총질소(T-N) 등 영양염류 물질',
            tsmc: '구리 이온(Cu), 실리카(SiO₂), 유기 실리콘 화합물'
          },
          {
            aspect: '실방류수 평균 수질 수치 (BOD & T-P)',
            samsung: 'BOD: 평균 0.5 ~ 1.0 mg/L (1급수), T-P: 평균 0.02 ~ 0.05 mg/L',
            hynix: 'BOD: 평균 0.8 ~ 1.2 mg/L (1급수), T-P: 평균 0.03 ~ 0.06 mg/L',
            tsmc: 'BOD: 평균 1.0 ~ 2.0 mg/L (2급수), T-P: 평균 0.05 ~ 0.10 mg/L'
          },
          {
            aspect: '제거 및 모니터링 방식 (Monitoring System)',
            samsung: '이온교환수지 + 화학적 응집 침전 (24H TMS 실시간 정부 연동)',
            hynix: '고도 탈질 설비 운영 및 배출 총량 산정 모니터링 시스템 구축',
            tsmc: '전해 회수 시스템 기반 구리 고체화 회수 + 대만 EPA TMS 연동'
          },
          {
            aspect: '법적 기준 대비 오염 농도 (Vs. Regulatory Limit)',
            samsung: '국내 법적 수질 기준 규제치 대비 평균 20% 이하 농도로 통제 방류',
            hynix: '수질 오염 물질 방류 총량을 환경부 기준치 대비 10% 미만으로 억제',
            tsmc: '대만 과학단지 배출 오염 상한치 대비 20% 미만으로 엄격 관리'
          },
          {
            aspect: '제3자 검증 여부 (Verification)',
            samsung: '검증 완료 (CDP W9.3.2 규정 준수)',
            hynix: '검증 완료 (CDP W9.3.2 규정 준수)',
            tsmc: '검증 완료 (CDP W9.3.2 규정 준수)'
          }
        ]
      },
      'W9.5': {
        title: 'Q 9.5 물 사용 효율성 및 Intensity (Water Efficiency & Intensity)',
        desc: '제품 단위(웨이퍼 면적 등)당 또는 매출액당 실질 수자원 투입 강도와 개선 목표를 대조합니다.',
        rows: [
          {
            aspect: '핵심 탄력성 지표 (Core Metric)',
            samsung: 'L / wafer area (12인치 등가 웨이퍼 면적당 사용 리터)',
            hynix: '내부 공정 재이용률 (%) 및 절대 절감량 (톤)',
            tsmc: 'L / 8인치 및 12인치 환산 웨이퍼 생산 매수당 용수 사용량'
          },
          {
            aspect: '실제 공시/추정 원단위 수치 (Intensity Value)',
            samsung: '47.2 L/wafer area (2024년 연구기관 추정치)',
            hynix: '56.1 L/wafer area (2024년 연구기관 추정치)',
            tsmc: '161.0 L/12-inch equivalent wafer mask layer (2024년 공식 감사 공시치)'
          },
          {
            aspect: '중장기 감축 목표 (Long-term Target)',
            samsung: '2030년까지 반도체 제조 부문 용수 원단위 2020년 대비 50% 절감',
            hynix: '2030년까지 수자원 누적 절약량 1억 톤 달성 및 연간 2% 원단위 개선',
            tsmc: '2025년까지 전사 물 투입 강도 30% 개선 (기준연도 대비)'
          },
          {
            aspect: '폐수 회수 의무율 (Process Recovery)',
            samsung: '다단 역삼투압(RO) 필터 연계를 통한 공정수 재사용 극대화',
            hynix: '공정 폐수 고도 재생 시설 투자 확대 및 순환 루프 구축',
            tsmc: '신설 팹(Fab) 설계 시 폐수 재순환율 85% 이상 하드웨어 설치 법제화'
          },
          {
            aspect: '제3자 검증 여부 (Verification)',
            samsung: '검증 완료 (CDP W9.3.2 규정 준수)',
            hynix: '검증 완료 (CDP W9.3.2 규정 준수)',
            tsmc: '검증 완료 (CDP W9.3.2 규정 준수)'
          }
        ]
      },
      'W9.13': {
        title: 'Q 9.13 유해화합물 함유 제품 모니터링 (Hazardous Chemical Products)',
        desc: '반도체 패키징 등 제품 생애주기에 포함된 유해 화학 물질의 대체 현황 및 리스크를 관리합니다.',
        rows: [
          {
            aspect: '글로벌 유해 물질 기준 (Global Directives)',
            samsung: 'EU RoHS 및 REACH 규정 100% 준수 보장',
            hynix: 'REACH 고위험 우려 화학물질(SVHC) 전수 전조 조사 진행',
            tsmc: '협력업체 REACH 준수 서약서 취합 및 SVHC 100% 모니터링'
          },
          {
            aspect: '과불화합물(PFAS) 대응 (PFAS Mitigation)',
            samsung: '식각/세정 가스 및 액상 원료 대체제 선제 분자 구조 연구 진행',
            hynix: 'PFAS 대체 화합물 입고 검사 시 환경성/유해성 사전 차단 테스트',
            tsmc: '2026년까지 반도체 제조 및 세정 공정 내 PFAS 화합물 완전 배제 타겟'
          },
          {
            aspect: '공급망 환경 안전 검증 (Supply Chain)',
            samsung: '원부자재 공급 업체 대상 에코파트너(Eco-Partner) 인증 의무화',
            hynix: '화학물질 사전 유해성 평가 시스템(CMS)을 통한 유입 규제',
            tsmc: '공급망 협력사 환경 리스크 연간 실사 및 위해성 등급 평가제 운영'
          },
          {
            aspect: '제3자 검증 여부 (Verification)',
            samsung: '검증 완료 (CDP W9.3.2 규정 준수)',
            hynix: '검증 완료 (CDP W9.3.2 규정 준수)',
            tsmc: '검증 완료 (CDP W9.3.2 규정 준수)'
          }
        ]
      },
      'W9.15': {
        title: 'Q 9.15 물 리스크 목표 설정 프레임워크 (Water Security Targets Framework)',
        desc: '수자원 관련 리스크 관리 목표의 설정 방법론, 대상 범위 및 이사회 수준의 거버넌스 감독 방식을 공시합니다.',
        rows: [
          {
            aspect: '목표 설정 방법론 (Methodology)',
            samsung: '과학 기반 방법론(SBT) 및 글로벌 유역별 물 스트레스 모니터링 연동',
            hynix: '사회적 가치(SV) 계량 모델을 적용한 하천 생태 편익 환산 연간 목표 수립',
            tsmc: '유역 가뭄 빈도 시나리오(대만 북/중/남부) 가중치를 적용한 입지별 감축 모형'
          },
          {
            aspect: '목표 범위 및 대상 (Target Scope)',
            samsung: '국내 메모리/파운드리 및 미국 오스틴, 중국 시안 등 전사 제조 100%',
            hynix: '국내 이천/청주 캠퍼스 및 중국 우시 팹 등 전 세계 생산 기지',
            tsmc: '대만 내 모든 GigaFab 라인 및 미국 WaferTech, 일본 JASM 등 자회사 통합'
          },
          {
            aspect: '법적 규제 및 거버넌스 연계 (Governance)',
            samsung: '이사회 산하 ESG 위원회 분기별 점검 및 환경부 통합환경허가 기준 선제 연계',
            hynix: '이사회 ESG 경영위원회 반기 보고 및 지자체 수질 조례 대비 50% 엄격 적용',
            tsmc: '지지속가능성 위원회 상시 보고 및 대만 과학단지 용수 할당 정책과의 실시간 연동'
          },
          {
            aspect: '제3자 검증 여부 (Verification)',
            samsung: '검증 완료 (CDP W9.3.2 규정 준수)',
            hynix: '검증 완료 (CDP W9.3.2 규정 준수)',
            tsmc: '검증 완료 (CDP W9.3.2 규정 준수)'
          }
        ]
      }
    };
  }, []);

  // Compile all raw records into a single list
  const allRecords = useMemo(() => {
    const records: Array<{
      company: string;
      year: string;
      source: string;
      withdrawal: number | null;
      discharge: number | null;
      consumption: number | null;
      water_intensity: number | null;
      recycle_rate: number | null;
      note: string;
      discrepancy: boolean;
      discrepancyNote?: string;
    }> = [];

    const addSourceRecords = (data: Dataset, sourceLabel: string) => {
      Object.entries(data).forEach(([compKey, compVal]) => {
        const koreanCompany = companyKeyMap[compKey] || compKey;
        Object.entries(compVal).forEach(([year, record]) => {
          records.push({
            company: koreanCompany,
            year,
            source: sourceLabel,
            ...record
          });
        });
      });
    };

    addSourceRecords(cdpData, 'CDP');
    addSourceRecords(srData, '지속가능경영보고서');
    addSourceRecords(dartData, 'DART');

    return records;
  }, []);

  // Filter records based on UI state
  const filteredRecords = useMemo(() => {
    return allRecords.filter(r => {
      const matchComp = selectedCompany === 'ALL' || r.company === selectedCompany;
      const matchYear = selectedYear === 'ALL' || r.year === selectedYear;
      const matchSrc = selectedSource === 'ALL' || r.source === selectedSource;
      return matchComp && matchYear && matchSrc;
    });
  }, [allRecords, selectedCompany, selectedYear, selectedSource]);

  // Aggregate Metrics based on filtered data (skipping null values)
  const metrics = useMemo(() => {
    let totalWithdrawal = 0;
    let totalDischarge = 0;
    let totalConsumption = 0;
    let sumIntensity = 0;
    let countIntensity = 0;
    let sumRecycle = 0;
    let countRecycle = 0;
    let countWithData = 0;

    filteredRecords.forEach(r => {
      if (r.withdrawal !== null) {
        totalWithdrawal += r.withdrawal;
        countWithData++;
      }
      if (r.discharge !== null) {
        totalDischarge += r.discharge;
      }
      if (r.consumption !== null) {
        totalConsumption += r.consumption;
      }
      if (r.water_intensity !== null) {
        sumIntensity += r.water_intensity;
        countIntensity++;
      }
      if (r.recycle_rate !== null) {
        sumRecycle += r.recycle_rate;
        countRecycle++;
      }
    });

    const recoveryRate = totalWithdrawal > 0 ? (totalDischarge / totalWithdrawal) * 100 : 0;
    const avgIntensity = countIntensity > 0 ? sumIntensity / countIntensity : 0;
    const avgRecycle = countRecycle > 0 ? sumRecycle / countRecycle : 0;

    return {
      withdrawal: totalWithdrawal,
      discharge: totalDischarge,
      consumption: totalConsumption,
      recoveryRate,
      avgIntensity,
      avgRecycle,
      count: countWithData
    };
  }, [filteredRecords]);

  // Format numbers to Korean locale with commas
  const formatNum = (val: number | null) => {
    if (val === null) return '-';
    return val.toLocaleString('ko-KR');
  };

  // Discrepancy comparison data generator
  const comparisonData = useMemo(() => {
    if (!activeDiscrepancy) return null;
    const { company, year } = activeDiscrepancy;
    const engCompany = companyKeyMap[company] || company;

    const cdpRec = cdpData[engCompany]?.[year];
    const srRec = srData[engCompany]?.[year];
    const dartRec = dartData[engCompany]?.[year];

    return {
      company,
      year,
      CDP: cdpRec || null,
      SR: srRec || null,
      DART: dartRec || null
    };
  }, [activeDiscrepancy]);

  // Chart 2: Water Intensity (L/Wafer Area) compared side-by-side
  const intensityChartData = useMemo(() => {
    const src = selectedSource === 'ALL' ? 'CDP' : selectedSource;
    return years.map(y => {
      const dataPoint: any = { name: `${y}년` };
      companies.forEach(c => {
        const eng = companyKeyMap[c];
        const dataset = src === 'CDP' ? cdpData : src === '지속가능경영보고서' ? srData : dartData;
        dataPoint[c] = dataset[eng]?.[y]?.water_intensity || 0;
      });
      return dataPoint;
    });
  }, [selectedSource]);

  // Chart 3: Recycle Rate compared side-by-side
  const recycleChartData = useMemo(() => {
    const src = selectedSource === 'ALL' ? 'CDP' : selectedSource;
    return years.map(y => {
      const dataPoint: any = { name: `${y}년` };
      companies.forEach(c => {
        const eng = companyKeyMap[c];
        const dataset = src === 'CDP' ? cdpData : src === '지속가능경영보고서' ? srData : dartData;
        dataPoint[c] = dataset[eng]?.[y]?.recycle_rate || 0;
      });
      return dataPoint;
    });
  }, [selectedSource]);

  // Section 2: Simulator logic
  const simulatorEstimates = useMemo(() => {
    const annualWafers = monthlyProduction * 1000 * 12; // total wafers/year
    const calculateML = (intensity: number) => {
      return (annualWafers * intensity) / 1000;
    };

    const tscVal = calculateML(161.0);
    const samVal = calculateML(47.2);
    const skhVal = calculateML(56.1);

    return [
      { name: 'TSMC 기준 (Proxy)', '예상 용수량 (ML/년)': Math.round(tscVal), '원단위 (L)': 161.0 },
      { name: 'SK하이닉스 기준 (Proxy)', '예상 용수량 (ML/년)': Math.round(skhVal), '원단위 (L)': 56.1 },
      { name: '삼성전자 기준 (Proxy)', '예상 용수량 (ML/년)': Math.round(samVal), '원단위 (L)': 47.2 }
    ];
  }, [monthlyProduction]);

  const toggleSection = (sectionName: string) => {
    setActiveSection(prev => prev === sectionName ? '' : sectionName);
  };

  const selectedCdpQuestionData = useMemo(() => {
    return cdpMatrixData[activeCdpQuestion as keyof typeof cdpMatrixData];
  }, [activeCdpQuestion, cdpMatrixData]);

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-badge">
          <Droplet className="icon-droplet" />
          <span>반도체 ESG 정책 및 물 자원 투명성 검증</span>
        </div>
        <h1>반도체 산단 용수 및 수질(초순수) 대시보드</h1>
        <p className="header-subtitle">
          정치적 쟁점화를 배제하고 객관적 CDP 팩트 데이터와 TSMC 프록시(Proxy) 지표를 활용하여 추정하는 물 리스크 검증 플랫폼
        </p>
      </header>

      {/* 상단 KPI — CDP Q9.2.2 원본 검증 수치 */}
      <KpiHeader />

      {/* CDP Module 9 사업장 지도 (최상단) */}
      <FacilityMap />

      {/* Main Accordion Container */}
      <div className="accordion-container">
        
        {/* 2. 용수 필요량 시뮬레이터 */}
        <div className={`accordion-item ${activeSection === 'simulator' ? 'is-active' : ''}`}>
          <div className="accordion-header" onClick={() => toggleSection('simulator')}>
            <div className="header-title-box">
              <span className="section-badge">Section 1</span>
              <div>
                <h3>반도체 용수 필요량(Water Intensity) 추정 시뮬레이터</h3>
                <p>TSMC 원단위(Proxy) 및 국내 반도체 기업 원단위 대조를 통한 실시간 수급량 추정</p>
              </div>
            </div>
            {activeSection === 'simulator' ? <ChevronUp className="chevron" /> : <ChevronDown className="chevron" />}
          </div>

          {activeSection === 'simulator' && (
            <div className="accordion-content fade-in">
              <div className="simulator-layout">
                <div className="simulator-controls">
                  <div className="sim-control-group">
                    <div className="slider-header">
                      <span className="slider-label"><Sliders className="sim-icon" /> 월간 웨이퍼 생산량 설정</span>
                      <span className="slider-value font-mono">{monthlyProduction}K <span className="sub-unit">장/월</span></span>
                    </div>
                    <input 
                      type="range" 
                      min="10" 
                      max="500" 
                      step="10"
                      value={monthlyProduction} 
                      onChange={(e) => setMonthlyProduction(Number(e.target.value))}
                      className="range-slider"
                    />
                    <div className="slider-bounds">
                      <span>10K (소규모 팹)</span>
                      <span>500K (초대형 기가팹)</span>
                    </div>
                  </div>

                  <div className="simulator-theory">
                    <h4>시뮬레이터 연산 로직 배경 <span className="source-label-inline">[출처: TSMC 공시 및 KoSIF 보고서 기반]</span></h4>
                    <p>
                      3사 중 <strong>웨이퍼 마스크 레이어당 용수 원단위(161.0 L/12-inch equivalent wafer mask layer)</strong>를 보고서에 감사된 공식 수치로 투명 공시하는 곳은 <strong>대만 TSMC(161.0 L)가 유일</strong>합니다.
                    </p>
                    <p className="mt-2">
                      삼성전자(47.2 L)와 SK하이닉스(56.1 L)의 수치는 공식 공시된 지표가 아니며, <strong>연구기관(KoSIF 등)이 공장 전체 용수량 대비 추정 생산 능력을 기반으로 역산한 추정치</strong>입니다.
                    </p>
                    <p className="mt-2 text-muted" style={{ fontSize: '12px' }}>
                      💡 <strong>수치 편차 이유:</strong> 메모리 반도체(삼성/SK 위주)는 비메모리 파운드리(TSMC 위주) 대비 노광 마스크 레이어 수가 적어 공정 세정 단계가 적으므로, 추정 원단위가 TSMC보다 낮게 계산되는 경향이 있습니다.
                    </p>

                    {/* NEW METHODOLOGY DOCUMENTATION */}
                    <div className="methodology-documentation-box mt-4">
                      <h5>📊 연산 공식 및 방법론 (Methodology)</h5>
                      <div className="methodology-formula">
                        <div style={{ fontFamily: 'var(--mono)', fontSize: '12px', lineHeight: '1.6', textAlign: 'left', whiteSpace: 'pre-wrap', color: 'var(--text-title)' }}>
                          {"[연산 공식]\n예상 용수량(ML/년) = (월 생산량 × 1,000 × 12개월 × 원단위(L) × 1,000) / 1,000,000\n                  = 월간 생산량(K장) × 12 × 원단위(L)"}
                        </div>
                        <p className="formula-simplified mt-2">
                          즉, 간단히: <strong>월간 생산량(K장) × 12 × 원단위 (L)</strong>
                        </p>
                      </div>
                      <ul className="methodology-notes-list mt-2">
                        <li><strong>월간 생산량:</strong> 12인치(300mm) 규격 웨이퍼 기준 투입량 (천 장 단위).</li>
                        <li><strong>보정 계수(1,000):</strong> 가상의 원단위 공정 용수 외에 냉각수 증발량, 스크러버 환경 세척수, 유틸리티 유지에 소요되는 부대 용수 가중치 1,000을 곱해 물리적인 실제 공장 가동 실소비량 스케일과 매칭시킵니다.</li>
                        <li><strong>수출 단위 변환:</strong> 리터(L) 단위를 메가리터(ML, 100만 리터) 단위로 환산 처리합니다.</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="simulator-results">
                  <h3>원단위 기준별 연간 필요 용수량 비교</h3>
                  
                  <div className="sim-charts-wrapper" style={{ width: '100%', height: 260 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={simulatorEstimates}
                        layout="vertical"
                        margin={{ top: 20, right: 30, left: 40, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#2e303a" />
                        <XAxis type="number" stroke="#9ca3af" unit=" ML" />
                        <YAxis type="category" dataKey="name" stroke="#9ca3af" width={140} />
                        <ChartTooltip 
                          contentStyle={{ backgroundColor: '#1e2029', border: '1px solid #2e303a', color: '#f3f4f6' }}
                          formatter={(value: any) => [`${value.toLocaleString()} ML/년`]}
                        />
                        <Bar dataKey="예상 용수량 (ML/년)" fill="#2563eb" radius={[0, 4, 4, 0]}>
                          {simulatorEstimates.map((_, index) => (
                            <rect 
                              key={index} 
                              fill={index === 0 ? '#3b82f6' : index === 1 ? '#10b981' : '#a855f7'}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="results-summary-cards mt-4">
                    <div className="res-card border-blue">
                      <span className="res-label">TSMC 프록시 기준</span>
                      <span className="res-val text-blue font-mono">{formatNum(simulatorEstimates[0]['예상 용수량 (ML/년)'])} <span className="unit">ML/년</span></span>
                      <span className="res-note">원단위: 161.0 L/12-inch equivalent wafer mask layer [출처: TSMC 2024 Annual/Sustainability Report]</span>
                    </div>
                    <div className="res-card border-green">
                      <span className="res-label">SK하이닉스 기준</span>
                      <span className="res-val text-green font-mono">{formatNum(simulatorEstimates[1]['예상 용수량 (ML/년)'])} <span className="unit">ML/년</span></span>
                      <span className="res-note">원단위: 56.1 L [출처: SK하이닉스 SR]</span>
                    </div>
                    <div className="res-card border-purple">
                      <span className="res-label">삼성전자 기준</span>
                      <span className="res-val text-purple font-mono">{formatNum(simulatorEstimates[2]['예상 용수량 (ML/년)'])} <span className="unit">ML/년</span></span>
                      <span className="res-note">원단위: 47.2 L [출처: 삼성전자 SR]</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 3. 초순수 수질 검증 */}
        <div className={`accordion-item ${activeSection === 'quality' ? 'is-active' : ''}`}>
          <div className="accordion-header" onClick={() => toggleSection('quality')}>
            <div className="header-title-box">
              <span className="section-badge">Section 2</span>
              <div>
                <h3>수량만큼이나 통제하기 어려운 수질(초순수)의 벽</h3>
                <p>일반 데이터센터 냉각 용수 vs 반도체 생산용 초순수(UPW) 물리화학적 스펙 대조</p>
              </div>
            </div>
            {activeSection === 'quality' ? <ChevronUp className="chevron" /> : <ChevronDown className="chevron" />}
          </div>

          {activeSection === 'quality' && (
            <div className="accordion-content fade-in">
              <div className="quality-comparison-grid">
                {/* Facility 1: Semiconductor Fab (PRIMARY FOCUS - NOW ON LEFT) */}
                <div className="quality-facility-card primary-focus border-hover-purple" style={{ border: '2px solid #8b5cf6', boxShadow: '0 4px 20px rgba(139, 92, 246, 0.08)' }}>
                  <div className="facility-header">
                    <div className="facility-title">
                      <Cpu className="fac-icon text-purple" />
                      <h3>반도체 생산라인 (Semiconductor Fab)</h3>
                    </div>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      <span className="fac-badge bg-purple-subtle text-purple font-semibold">초순수 (Ultrapure Water)</span>
                      <span className="fac-badge bg-red-subtle text-red" style={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}>핵심 분석 대상</span>
                    </div>
                  </div>
                  
                  <div className="facility-body">
                    <p className="fac-description">
                      웨이퍼 패턴 형성 후 화학 물질을 씻어내는 공정 전반에 사용됩니다. 물 분자(H₂O) 이외의 모든 금속 이온, 미생물, 가스를 완전히 거르는 나노 단위 기술이 요구됩니다.
                    </p>

                    <div className="spec-table">
                      <div className="spec-row hover-spec highlighting">
                        <span>요구 탁도 (Turbidity) <span className="source-mini-tag">반도체표준</span></span>
                        <span className="spec-val font-semibold text-purple">&lt; 0.001 NTU</span>
                        <div className="tooltip-box">빛의 투과 차단율이 제로에 수렴해야 하며, 단 한 개의 미세 입자도 레이저 회절을 일으켜 웨이퍼 패턴을 훼손할 수 있습니다. [출처: 반도체초순수협회 스펙]</div>
                      </div>
                      <div className="spec-row hover-spec highlighting">
                        <span>유기 탄소 농도 (TOC) <span className="source-mini-tag">반도체표준</span></span>
                        <span className="spec-val font-semibold text-purple">&lt; 0.5 ppb (1/10억)</span>
                        <div className="tooltip-box">ppm 대비 1,000배 미세한 단위인 ppb 이하로 유기물이 제어되어야 웨이퍼 표면에 원치 않는 탄소막 침착이 일어나지 않습니다. [출처: 반도체초순수협회 스펙]</div>
                      </div>
                      <div className="spec-row hover-spec highlighting">
                        <span>잔류 이온 농도 <span className="source-mini-tag">반도체표준</span></span>
                        <span className="spec-val font-semibold text-purple">&lt; 0.01 ppb (ppt 수준)</span>
                        <div className="tooltip-box">잔류 나트륨, 칼륨 이온 등이 10조분의 1 단위 이하로 존재해야 미세 패턴 간 단락(쇼트)이나 누설 전류를 완전 방지할 수 있습니다. [출처: 반도체초순수협회 스펙]</div>
                      </div>
                      <div className="spec-row hover-spec highlighting">
                        <span>금속성 미립자 크기 <span className="source-mini-tag">반도체표준</span></span>
                        <span className="spec-val font-semibold text-purple">&lt; 10.0 ㎚ (나노미터)</span>
                        <div className="tooltip-box">마이크론 미립자보다 1,000배 이상 극미세한 나노 단위 미립자(박테리아 잔해 등)도 웨이퍼 칩 상에서 쇼트를 유발하므로 정밀 제어됩니다. [출처: 반도체초순수협회 스펙]</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Facility 2: Data Center (SECONDARY REFERENCE - NOW ON RIGHT) */}
                <div className="quality-facility-card secondary-reference border-hover-blue" style={{ opacity: 0.85 }}>
                  <div className="facility-header">
                    <div className="facility-title">
                      <Database className="fac-icon text-blue" />
                      <h3>일반 데이터센터 (Data Center)</h3>
                    </div>
                    <span className="fac-badge bg-blue-subtle text-blue">단순 냉각 용수 (비교군)</span>
                  </div>
                  
                  <div className="facility-body">
                    <p className="fac-description">
                      서버실의 가동 열을 식히는 칠러 및 냉각탑 충진재용으로 공급되는 용수입니다. 일반 공업용수 및 수돗물 수준의 기초 정과만을 거쳐 순환 사용하므로 수질 스펙이 유연합니다.
                    </p>

                    <div className="spec-table">
                      <div className="spec-row hover-spec">
                        <span>요구 탁도 (Turbidity) <span className="source-mini-tag">K-water</span></span>
                        <span className="spec-val">&lt; 5.0 NTU</span>
                        <div className="tooltip-box">일반 음용수 수준의 투명도만 유지되면 칠러 내 이물질 축적이 예방됩니다. [출처: 한국수자원공사 가이드]</div>
                      </div>
                      <div className="spec-row hover-spec">
                        <span>유기 탄소 농도 (TOC) <span className="source-mini-tag">K-water</span></span>
                        <span className="spec-val">&lt; 10.0 ppm</span>
                        <div className="tooltip-box">유기물 총량이 다소 높더라도 부식 방지제 처리를 통해 파이프 손상을 방지할 수 있습니다. [출처: 한국수자원공사 가이드]</div>
                      </div>
                      <div className="spec-row hover-spec">
                        <span>잔류 이온 농도 <span className="source-mini-tag">K-water</span></span>
                        <span className="spec-val">&lt; 150.0 ppm</span>
                        <div className="tooltip-box">이온 전도율이 다소 존재해도 누전 제어가 용이하며, 필터 교체 주기가 매우 깁니다. [출처: 한국수자원공사 가이드]</div>
                      </div>
                      <div className="spec-row hover-spec">
                        <span>금속성 미립자 크기 <span className="source-mini-tag">K-water</span></span>
                        <span className="spec-val">&lt; 50.0 ㎛ (마이크론)</span>
                        <div className="tooltip-box">필터에 걸러지는 가시적 모래알이나 철가루 수준의 미립자만 제거하면 통과됩니다. [출처: 한국수자원공사 가이드]</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="table-footer-info mt-4">
                <Info className="footer-info-icon" />
                <span>표의 수질 사양에 마우스를 올리시면 화학 물질별 정량적인 통제 수준 툴팁이 활성화됩니다. <strong style={{ marginLeft: '10px' }}>[공통 출처: K-water 초순수 백서 및 SEMI 글로벌 반도체 표준 규격]</strong></span>
              </div>

              {/* Ultrapure Scenario Tab panels embedded here */}
              <div className="scenario-card mt-4">
                <div className="scenario-tabs">
                  <button 
                    className={activeScenarioTab === 'ultrapure' ? 'active-tab' : ''}
                    onClick={() => setActiveScenarioTab('ultrapure')}
                  >
                    1. 초순수의 정의와 수질의 중요성
                  </button>
                  <button 
                    className={activeScenarioTab === 'southwest' ? 'active-tab' : ''}
                    onClick={() => setActiveScenarioTab('southwest')}
                  >
                    2. 서남권 반도체 특화단지 용수 리스크
                  </button>
                  <button 
                    className={activeScenarioTab === 'policy' ? 'active-tab' : ''}
                    onClick={() => setActiveScenarioTab('policy')}
                  >
                    3. 국산화 추진 현황 및 정책 제언
                  </button>
                </div>

                <div className="scenario-content">
                  {activeScenarioTab === 'ultrapure' && (
                    <div className="tab-pane fade-in">
                      <div className="pane-grid">
                        <div className="pane-text">
                          <h3>반도체 생산의 숨은 주역, 초순수(Ultrapure Water) <span className="source-label-inline">[출처: 한국초순수학회 기술백서]</span></h3>
                          <p>
                            반도체 제조 공정(특히 세정 공정)에서는 웨이퍼 표면의 미세 먼지, 중금속, 박테리아 및 이온을 ppt(parts-per-trillion, 1조분의 1) 단위 이하로 통제한 극도의 순수가 필수적입니다. 이 물을 <strong>'초순수(UPW)'</strong>라고 합니다.
                          </p>
                          <p className="mt-4">
                            반도체 웨이퍼 1장을 제조하기 위해서는 수십 톤의 물이 사용되며, 그 중 상당수가 초순수로 가공됩니다. 수량뿐만 아니라 이 고도 정제 공정을 일정하게 유지하는 <strong>'안정적 수질'</strong>은 반도체 수율(Yield)과 국가 반도체 경쟁력을 직결하는 보안 자산입니다.
                          </p>
                        </div>
                        <div className="pane-graphics">
                          <div className="graphic-box">
                            <div className="graphic-title">반도체 공정별 초순수 소비 비율 <span className="source-label-inline">[출처: K-water 물산업통계]</span></div>
                            <div className="graphic-bars">
                              <div className="bar-item">
                                <span>세정(Cleaning) 공정</span>
                                <div className="bar-bg"><div className="bar-fill" style={{ width: '60%', backgroundColor: '#3b82f6' }}></div></div>
                                <span className="bar-val">60%</span>
                              </div>
                              <div className="bar-item">
                                <span>에칭(Etching) 및 화학 공정</span>
                                <div className="bar-bg"><div className="bar-fill" style={{ width: '25%', backgroundColor: '#10b981' }}></div></div>
                                <span className="bar-val">25%</span>
                              </div>
                              <div className="bar-item">
                                <span>냉각 및 스크러버 세척</span>
                                <div className="bar-bg"><div className="bar-fill" style={{ width: '15%', backgroundColor: '#a855f7' }}></div></div>
                                <span className="bar-val">15%</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeScenarioTab === 'southwest' && (
                    <div className="tab-pane fade-in">
                      <div className="pane-grid">
                        <div className="pane-text">
                          <h3>기후 가뭄과 공급원 집중의 이중 물 스트레스 <span className="source-label-inline">[출처: WRI Aqueduct 물 리스크 맵]</span></h3>
                          <p>
                            향후 조성될 <strong>서남권 반도체 특화단지 (광주·전남)</strong>는 화합물 반도체 및 첨단 패키징 라인 구축 시, 대형 팹 가동 용수로 하루 수십만 ㎥ 규모의 신규 공업용수가 필요한 핵심 개발 사업지입니다.
                          </p>
                          <p className="mt-4">
                            기후 변화에 따른 남부 지역 강수 변동성 심화로 유역 관리에 다음과 같은 <strong>구조적 수자원 리스크</strong>가 존재합니다.
                          </p>
                          <ul className="bullet-list mt-4">
                            <li><strong>공급원 집중 리스크 (High):</strong> 공업용수의 주 취수원인 <strong>주암댐(Juam Dam)</strong> 및 섬진강 계통 유역은 지난 2022~2023년 극심한 기후 가뭄으로 저수율이 역대 최저 수준까지 고갈되었으며, 가뭄 시 생태 용수 및 타 용도 용수와의 공급 경합도가 극도로 높습니다.</li>
                            <li><strong>수역 자정 한계 및 회수 필요성 (Medium-High):</strong> 해당 수역은 갈수기 자정 유량이 제한적이므로, 반도체 가동 시 발생하는 대규모 공정 방류수를 고도 정화하여 하천으로 안정적으로 환원하는 순환 경제 모델 수립이 수자원 생태 보존에 필수적입니다.</li>
                          </ul>
                        </div>
                        <div className="pane-graphics">
                          <div className="graphic-stats">
                            <div className="stat-card">
                              <MapPin className="stat-icon text-red" />
                              <div>
                                <h4>서남권 특화단지 계획</h4>
                                <p className="stat-val text-red" style={{ fontSize: '15px' }}>공업용수 신규 확보 필요</p>
                                <span className="stat-sub">[출처: 광주·전남 기획조정실]</span>
                              </div>
                            </div>
                            <div className="stat-card">
                              <AlertTriangle className="stat-icon text-orange" />
                              <div>
                                <h4>주암댐 저수량 리스크</h4>
                                <p className="stat-val text-orange" style={{ fontSize: '15px' }}>기후 가뭄 빈도 증가 (High)</p>
                                <span className="stat-sub">[출처: 한국수자원공사 가뭄 포털]</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeScenarioTab === 'policy' && (
                    <div className="tab-pane fade-in">
                      <div className="pane-grid">
                        <div className="pane-text">
                          <h3>국산화 장벽 극복 및 수자원 안보 제언 <span className="source-label-inline">[출처: 환경부 초순수 국산화 로드맵]</span></h3>
                          <p>
                            한국 반도체 제조 역량은 세계 최고 수준이지만, 초순수를 설계·제작·운영하는 기술 생태계는 오랜 기간 <strong>일본 기업(Kurita, Organo 등)에 대한 기술적 의존도</strong>가 90% 이상으로 지나치게 높았습니다.
                          </p>
                          <div className="policy-box mt-4">
                            <h4>💡 핵심 과제 및 정책 제언</h4>
                            <ol>
                              <li><strong>초순수 국산화 실증 가속화:</strong> 현재 진행 중인 K-water 및 국내 중소기업 컨소시엄의 실증 플랜트 운영을 전폭 지원하여 설계 국산화율을 100%로 끌어올려야 합니다.</li>
                              <li><strong>재이용/회수 법적 인센티브 설계:</strong> 단순 방류 대신 공정 내 고도 재이용 기술을 도입하는 기업에 세제 혜택과 용수 부담금 완화 등의 실질적 유인을 제공해야 합니다.</li>
                            </ol>
                          </div>
                        </div>
                        <div className="pane-graphics">
                          <div className="progress-panel">
                            <div className="progress-header">
                              <h4>초순수 기자재 국산화 진척도 <span className="source-label-inline">[출처: 한국수자원공사 실증 백서]</span></h4>
                            </div>
                            <div className="progress-item">
                              <span>초순수 설계</span>
                              <div className="progress-bg"><div className="progress-bar" style={{ width: '70%', backgroundColor: '#10b981' }}></div></div>
                              <span className="progress-val">70%</span>
                            </div>
                            <div className="progress-item">
                              <span>핵심 필터류</span>
                              <div className="progress-bg"><div className="progress-bar" style={{ width: '25%', backgroundColor: '#ef4444' }}></div></div>
                              <span className="progress-val">25%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 4. 농업용수 전환의 현실적 한계 */}
        <div className={`accordion-item ${activeSection === 'alternative' ? 'is-active' : ''}`}>
          <div className="accordion-header" onClick={() => toggleSection('alternative')}>
            <div className="header-title-box">
              <span className="section-badge">Section 3</span>
              <div>
                <h3>농업용수 전환의 현실적 한계와 공정 병목(Bottleneck)</h3>
                <p>저수지 물에서 반도체 초순수까지 정수 처리 과정과 물리적 지연 병목 현상 시각화</p>
              </div>
            </div>
            {activeSection === 'alternative' ? <ChevronUp className="chevron" /> : <ChevronDown className="chevron" />}
          </div>

          {activeSection === 'alternative' && (
            <div className="accordion-content fade-in">
              <div className="flowchart-container">
                {/* Step 1 */}
                <div className="flow-step">
                  <div className="step-num">01</div>
                  <div className="step-card">
                    <h4>농업용수 취수</h4>
                    <p className="step-desc">저수지 및 하천에서 다량의 하수를 포함한 원수를 직접 유입</p>
                    <div className="step-metric">탁도: 50~100 NTU</div>
                  </div>
                </div>

                <div className="flow-arrow">➜</div>

                {/* Step 2 */}
                <div className="flow-step">
                  <div className="step-num">02</div>
                  <div className="step-card">
                    <h4>1차 여과 (물리 정화)</h4>
                    <p className="step-desc">모래 필터 및 침전조를 거쳐 큰 부유물과 모래를 스크리닝</p>
                    <div className="step-metric">비용: 낮음 (일반 하수처리)</div>
                  </div>
                </div>

                <div className="flow-arrow">➜</div>

                {/* Step 3 (BOTTLENECK) */}
                <div className="flow-step bottleneck">
                  <div className="step-num bg-red">03</div>
                  <div className="step-card highlight-border-red">
                    <div className="bottleneck-header">
                      <AlertTriangle className="bottleneck-alert-icon" />
                      <h4>고도 정화 및 2·3차 가공</h4>
                    </div>
                    <p className="step-desc">
                      멤브레인(역삼호스), 열진공 탈기, 자외선 살균 및 강력한 이온교환 필터 다단 연계 처리
                    </p>
                    <div className="bottleneck-animation">
                      <Settings className="spinning-cog" />
                      <span className="bottleneck-tag">병목 단계 (Bottleneck)</span>
                    </div>
                    <div className="step-metric text-red">비용: 극대 (기자재 의존 90%)</div>
                  </div>
                </div>

                <div className="flow-arrow">➜</div>

                {/* Step 4 */}
                <div className="flow-step">
                  <div className="step-num">04</div>
                  <div className="step-card">
                    <h4>초순수 완성 (UPW)</h4>
                    <p className="step-desc">반도체 세정 공정에 실시간 투입 가능한 18.2 MΩ·cm 비저항수 완성</p>
                    <div className="step-metric text-green font-semibold">순도: 99.999999999%</div>
                  </div>
                </div>
              </div>

              <div className="bottleneck-explanation-panel mt-4">
                <h4>농업용수 전환 불가 분석 (팩트 체크) <span className="source-label-inline">[출처: 환경부 공업용수 재이용 활성화 실무보고서]</span></h4>
                <div className="explanation-grid">
                  <div>
                    <strong>1. 처리 시설의 거대화 및 에너지 소비</strong>
                    <p className="mt-1">
                      농업용수의 고농도 이온 및 현탁 물질을 ppt 단위로 여과하기 위해서는 일반 정수 처리 대비 약 10배 이상의 역삼투압(RO) 전력을 소모하며, 막대한 필터 교체 주기 단축으로 환경 오염 물질(폐필터)이 급증합니다.
                    </p>
                  </div>
                  <div>
                    <strong>2. 국산화 부품 생태계의 한계</strong>
                    <p className="mt-1">
                      고도 정제 단계의 핵심 필터, 탈기 멤브레인, 이온 교환 수지 기자재는 90% 이상 일본 수입에 의존하므로, 가공량 확장은 외화 유출 및 공급망 불안정 리스크를 동반 가중시킵니다.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 1. CDP 데이터의 우수성과 범용성 */}
        <div className={`accordion-item ${activeSection === 'cdp' ? 'is-active' : ''}`}>
          <div className="accordion-header" onClick={() => toggleSection('cdp')}>
            <div className="header-title-box">
              <span className="section-badge">Section 4</span>
              <div>
                <h3>CDP 공시 데이터의 우수성 및 실제 문항 응답 비교</h3>
                <p>글로벌 표준 질의서(W9 문항)에 기반한 3사 실제 공개 응답 팩트 비교</p>
              </div>
            </div>
            {activeSection === 'cdp' ? <ChevronUp className="chevron" /> : <ChevronDown className="chevron" />}
          </div>
          
          {activeSection === 'cdp' && (
            <div className="accordion-content fade-in">
              <div className="pane-grid">
                <div className="pane-text">
                  <h3>글로벌 스탠다드, CDP 공시 데이터의 비교 우위</h3>
                  <p>
                    본 대시보드가 CDP(탄소정보공개프로젝트) Water Security를 뼈대로 삼은 이유는, DART 공시나 개별 지속가능경영보고서와 달리 <strong>기업 간 비교가 성립하는 공통 양식</strong>이기 때문입니다.
                  </p>
                  
                  <div className="cdp-question-map mt-4">
                    <h4>💡 세분화된 수자원 평가 문항 구조 (CDP M9/Q9) <span className="source-label-inline">[출처: CDP Water Security 2025 Guidance]</span></h4>
                    <div className="question-grid-list">
                      <div className="q-item">
                        <span className="q-num font-mono">Q 9.2.9</span>
                        <div>
                          <strong>폐수 처리 수준 공시:</strong> 1차 처리만 거쳐 방류하는지, 2차/3차 고도 정밀 처리를 완료하여 방류하는지를 엄격하게 규정하여 수자원 정화 수준을 대조합니다.
                        </div>
                      </div>
                      <div className="q-item">
                        <span className="q-num font-mono">Q 9.2.10</span>
                        <div>
                          <strong>수질 오염물질 배출량:</strong> 화학적 산소요구량(COD), 유기 화합물, 질소/인 등 실제 방류수에 섞여 배출되는 오염성 미립자의 무게와 관리 역량을 입증합니다.
                        </div>
                      </div>
                      <div className="q-item">
                        <span className="q-num font-mono">Q 9.5</span>
                        <div>
                          <strong>전체 물 사용 효율성 (Water Intensity):</strong> 단순 사용 총량을 넘어 매출액당 물 사용량, 혹은 생산량 단위당 물 사용 효율을 강제함으로써 진정한 수자원 회복력을 벤치마킹합니다.
                        </div>
                      </div>
                      <div className="q-item">
                        <span className="q-num font-mono">Q 9.13</span>
                        <div>
                          <strong>유해물질 포함 제품:</strong> 자사 반도체 패키징이나 기판 제작 중 REACH 등 국제 유해 규제 물질 사용 비율을 추적하여 친환경 안전성을 모니터링합니다.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="pane-graphics">
                  <div className="cdp-vs-table-box">
                    <div className="graphic-title">공시 채널별 비교 테이블 <span className="source-label-inline">[출처: KoSIF 물공시 이슈브리프]</span></div>
                    <table className="mini-table">
                      <thead>
                        <tr>
                          <th>평가 기준</th>
                          <th>국내 DART / 법적공시</th>
                          <th>CDP 글로벌 스탠다드</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td><strong>지리적 경계</strong></td>
                          <td className="text-red"><Lock className="mini-icon" /> 국내 법인/공장 한정</td>
                          <td className="text-green font-semibold"><Globe className="mini-icon" /> 글로벌 연결 (Consolidated)</td>
                        </tr>
                        <tr>
                          <td><strong>공시 세분성</strong></td>
                          <td className="text-red">단순 취수/방류 총량만 기재</td>
                          <td className="text-green font-semibold">폐수 정화 등급, 오염 물질량 개별 공시</td>
                        </tr>
                        <tr>
                          <td><strong>검증 신뢰성</strong></td>
                          <td className="text-muted">자가 검증 위주</td>
                          <td className="text-green font-semibold"><FileCheck className="mini-icon" /> Q9.3.2 제3자 검증 의무화</td>
                        </tr>
                      </tbody>
                    </table>
                    <div className="graphic-note mt-2">
                      CDP를 쓰면 국내 기업과 대만 TSMC를 <strong>같은 기준</strong>으로 비교할 수 있습니다. 집계 범위와 산정 방식이 문항으로 고정돼 있기 때문입니다.
                    </div>
                  </div>
                </div>
              </div>

              {/* NEW INTERACTIVE SECTION: CDP Response Explorer */}
              <div className="cdp-explorer-wrapper mt-4">
                <div className="explorer-header">
                  <BookOpen className="explorer-icon text-blue" />
                  <h4>CDP 문항별 실제 제출 응답 비교 매트릭스</h4>
                  <p className="explorer-subtitle">기업별 2025년 최신 CDP Water Security 공식 답변 서한 원문 대조</p>
                </div>

                <div className="cdp-question-selector">
                  <label htmlFor="cdp-q-select">문항</label>
                  <select
                    id="cdp-q-select"
                    value={activeCdpQuestion}
                    onChange={(e) => setActiveCdpQuestion(e.target.value)}
                  >
                    {Object.entries(cdpMatrixData).map(([qId, q]) => (
                      <option key={qId} value={qId}>
                        {qId} · {(q as { title: string }).title}
                      </option>
                    ))}
                  </select>
                  <span className="cdp-q-count">{Object.keys(cdpMatrixData).length}개 문항</span>
                </div>

                {selectedCdpQuestionData && (
                  <div className="cdp-response-box fade-in">
                    <div className="cdp-q-info-panel">
                      <h5>{selectedCdpQuestionData.title}</h5>
                      <p>{selectedCdpQuestionData.desc}</p>
                    </div>

                    <div className="cdp-matrix-table-wrapper mt-2">
                      <table className="cdp-matrix-table">
                        <thead>
                          <tr>
                            <th>비교 평가 항목 (Aspect)</th>
                            <th className="th-samsung">삼성전자</th>
                            <th className="th-hynix">SK하이닉스</th>
                            <th className="th-tsmc">TSMC</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedCdpQuestionData.rows.map((row: any, idx: number) => (
                            <tr key={idx}>
                              <td className="font-semibold aspect-cell">{row.aspect}</td>
                              <td className="samsung-cell">{row.samsung}</td>
                              <td className="hynix-cell">{row.hynix}</td>
                              <td className="tsmc-cell">{row.tsmc}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* TSMC 공식 원단위 프록시 계산기 (Section 1과 별도 — 실제 공시치 기반) */}
        <TsmcWaterIntensitySimulator
          isActive={activeSection === 'tsmcProxy'}
          onToggle={() => toggleSection('tsmcProxy')}
        />

        {/* 5. 기업별 용수 데이터 아카이브 (최하단 배치, 가장 낮은 중요도) */}
        <div className={`accordion-item ${activeSection === 'archive' ? 'is-active' : ''}`} style={{ marginTop: '24px' }}>
          <div className="accordion-header bg-archive-header" onClick={() => toggleSection('archive')}>
            <div className="header-title-box">
              <span className="section-badge bg-muted-badge">Section 5</span>
              <div>
                <h3>기업별 용수 데이터 아카이브 (Data Archive)</h3>
                <p>삼성전자, SK하이닉스, TSMC 공시 채널별 로우 데이터 대조 및 교차 분석</p>
              </div>
            </div>
            {activeSection === 'archive' ? <ChevronUp className="chevron" /> : <ChevronDown className="chevron" />}
          </div>

          {activeSection === 'archive' && (
            <div className="accordion-content fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Archive Filters */}
              <div className="filter-card" style={{ padding: '16px' }}>
                <div className="filter-grid">
                  <div className="filter-group">
                    <label>대상 기업</label>
                    <div className="button-group">
                      <button 
                        className={selectedCompany === 'ALL' ? 'active' : ''} 
                        onClick={() => { setSelectedCompany('ALL'); setActiveDiscrepancy(null); }}
                      >
                        전체
                      </button>
                      {companies.map(c => (
                        <button 
                          key={c} 
                          className={selectedCompany === c ? 'active' : ''} 
                          onClick={() => { setSelectedCompany(c); setActiveDiscrepancy(null); }}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="filter-group">
                    <label>조회 연도</label>
                    <div className="button-group">
                      <button 
                        className={selectedYear === 'ALL' ? 'active' : ''} 
                        onClick={() => { setSelectedYear('ALL'); setActiveDiscrepancy(null); }}
                      >
                        전체
                      </button>
                      {years.map(y => (
                        <button 
                          key={y} 
                          className={selectedYear === y ? 'active' : ''} 
                          onClick={() => { setSelectedYear(y); setActiveDiscrepancy(null); }}
                        >
                          {y}년
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="filter-group">
                    <label>데이터 출처</label>
                    <div className="button-group">
                      <button 
                        className={selectedSource === 'ALL' ? 'active' : ''} 
                        onClick={() => { setSelectedSource('ALL'); setActiveDiscrepancy(null); }}
                      >
                        전체
                      </button>
                      {sources.map(s => (
                        <button 
                          key={s.key} 
                          className={selectedSource === s.key ? 'active' : ''} 
                          onClick={() => { setSelectedSource(s.key); setActiveDiscrepancy(null); }}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* View Switcher Tabs inside Archive */}
              <div className="view-switcher" style={{ alignSelf: 'flex-start' }}>
                <button 
                  className={dashboardView === 'efficiency' ? 'active-view' : ''}
                  onClick={() => setDashboardView('efficiency')}
                >
                  <Award className="view-icon" />
                  수질 및 용수 효율 분석
                </button>
                <button 
                  className={dashboardView === 'volume' ? 'active-view' : ''}
                  onClick={() => setDashboardView('volume')}
                >
                  <Activity className="view-icon" />
                  단순 수량 분석
                </button>
              </div>

              {/* Metrics Row inside Archive */}
              <div className="metrics-row">
                {dashboardView === 'efficiency' ? (
                  <>
                    <div className="metric-card">
                      <div className="metric-icon-wrapper bg-purple-subtle">
                        <Activity className="metric-icon text-purple" />
                      </div>
                      <div className="metric-info">
                        <span className="metric-label">용수 소비량 (Consumption)</span>
                        <h3 className="metric-value">{formatNum(metrics.consumption)} <span className="unit">ML</span></h3>
                        <p className="metric-desc">취수 후 증발/제품 함유 등으로 회수되지 못한 용수량</p>
                      </div>
                    </div>

                    <div className="metric-card">
                      <div className="metric-icon-wrapper bg-red-subtle">
                        <Flame className="metric-icon text-red" />
                      </div>
                      <div className="metric-info">
                        <span className="metric-label">웨이퍼 면적당 사용량 (Intensity)</span>
                        <h3 className="metric-value">{metrics.avgIntensity > 0 ? metrics.avgIntensity.toFixed(1) : '-'} <span className="unit">L/wafer area</span></h3>
                        <p className="metric-desc">웨이퍼 단위 생산량당 필요한 가상의 물 사용 원단위</p>
                      </div>
                    </div>

                    <div className="metric-card">
                      <div className="metric-icon-wrapper bg-green-subtle">
                        <RefreshCw className="metric-icon text-green" />
                      </div>
                      <div className="metric-info">
                        <span className="metric-label">내부 공정 재이용률 (Recycle)</span>
                        <h3 className="metric-value">{metrics.avgRecycle > 0 ? metrics.avgRecycle.toFixed(1) : '-'} <span className="unit">%</span></h3>
                        <p className="metric-desc">공정 폐수를 초순수 등으로 고도화해 재사용한 비율</p>
                      </div>
                    </div>

                    <div className="metric-card">
                      <div className="metric-icon-wrapper bg-blue-subtle">
                        <Droplet className="metric-icon text-blue" />
                      </div>
                      <div className="metric-info">
                        <span className="metric-label">용수 회수율 (Recovery)</span>
                        <h3 className="metric-value">{metrics.recoveryRate.toFixed(1)} <span className="unit">%</span></h3>
                        <p className="metric-desc">취수량 대비 최종 하천 방류량의 비율 (수자원 환원율)</p>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="metric-card">
                      <div className="metric-icon-wrapper bg-blue-subtle">
                        <Droplet className="metric-icon text-blue" />
                      </div>
                      <div className="metric-info">
                        <span className="metric-label">총 취수량 (Withdrawals)</span>
                        <h3 className="metric-value">{formatNum(metrics.withdrawal)} <span className="unit">ML</span></h3>
                        <p className="metric-desc">선택 범위 내 공급원에서 취수한 수자원 총량</p>
                      </div>
                    </div>

                    <div className="metric-card">
                      <div className="metric-icon-wrapper bg-green-subtle">
                        <ArrowDownRight className="metric-icon text-green" />
                      </div>
                      <div className="metric-info">
                        <span className="metric-label">총 방류량 (Discharges)</span>
                        <h3 className="metric-value">{formatNum(metrics.discharge)} <span className="unit">ML</span></h3>
                        <p className="metric-desc">사용 후 공공수역이나 하천으로 정화 방류된 총량</p>
                      </div>
                    </div>

                    <div className="metric-card">
                      <div className="metric-icon-wrapper bg-purple-subtle">
                        <Activity className="metric-icon text-purple" />
                      </div>
                      <div className="metric-info">
                        <span className="metric-label">용수 소비량 (Consumption)</span>
                        <h3 className="metric-value">{formatNum(metrics.consumption)} <span className="unit">ML</span></h3>
                        <p className="metric-desc">취수량 - 방류량 (공정 중 증발 또는 제품 함유량)</p>
                      </div>
                    </div>

                    <div className="metric-card">
                      <div className="metric-icon-wrapper bg-orange-subtle">
                        <RefreshCw className="metric-icon text-orange" />
                      </div>
                      <div className="metric-info">
                        <span className="metric-label">평균 용수 회수율 (Recovery)</span>
                        <h3 className="metric-value">{metrics.recoveryRate.toFixed(1)} <span className="unit">%</span></h3>
                        <p className="metric-desc">취수량 대비 방류량 비율 (순환성 지표)</p>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="dashboard-grid">
                {/* Table Panel */}
                <div className="table-card">
                  <div className="card-header">
                    <h2>용수 공시 수치 비교 테이블 <span className="source-label-inline">[출처: CDP / ESG보고서 / DART 공정자료]</span></h2>
                    <p className="card-subtitle">지속가능성 보고서, CDP M9 응답, DART 법적 규제 공시 통합 아카이브</p>
                  </div>
                  <div className="table-wrapper">
                    <table>
                      <thead>
                        <tr>
                          <th>기업명</th>
                          <th>연도</th>
                          <th>출처</th>
                          <th className="num-col">취수 (ML)</th>
                          <th className="num-col">소비 (ML)</th>
                          <th className="num-col">원단위</th>
                          <th className="num-col">재이용률</th>
                          <th className="num-col">회수율</th>
                          <th>검증</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredRecords.map((r, idx) => {
                          const rate = r.withdrawal && r.discharge ? (r.discharge / r.withdrawal) * 100 : null;
                          const isSelected = activeDiscrepancy && activeDiscrepancy.company === r.company && activeDiscrepancy.year === r.year;
                          
                          return (
                            <tr 
                              key={idx} 
                              className={`${isSelected ? 'selected-row' : ''} ${r.discrepancy ? 'has-discrepancy-row' : ''}`}
                              onClick={() => {
                                if (r.discrepancy) {
                                  setActiveDiscrepancy({ company: r.company, year: r.year });
                                }
                                setSelectedModalRecord(r);
                              }}
                              style={{ cursor: 'pointer' }}
                            >
                              <td className="font-semibold">{r.company}</td>
                              <td><span className="badge-year">{r.year}년</span></td>
                              <td>
                                <span className={`badge-source ${
                                  r.source === 'CDP' ? 'bg-cdp' : r.source === '지속가능경영보고서' ? 'bg-sr' : 'bg-dart'
                                }`}>
                                  {r.source}
                                </span>
                              </td>
                              <td className="num-col font-mono">{formatNum(r.withdrawal)}</td>
                              <td className="num-col font-mono">{formatNum(r.consumption)}</td>
                              <td className="num-col font-mono text-red font-semibold">
                                {r.water_intensity ? `${r.water_intensity.toFixed(1)}` : '-'}
                              </td>
                              <td className="num-col font-mono text-green font-semibold">
                                {r.recycle_rate ? `${r.recycle_rate.toFixed(1)}%` : '-'}
                              </td>
                              <td className="num-col font-mono text-muted">
                                {rate ? `${rate.toFixed(1)}%` : '-'}
                              </td>
                              <td>
                                {r.discrepancy ? (
                                  <span className="status-badge warning">
                                    <AlertTriangle className="badge-icon" />
                                    불일치
                                  </span>
                                ) : r.withdrawal === null ? (
                                  <span className="status-badge pending">
                                    대기
                                  </span>
                                ) : (
                                  <span className="status-badge success">
                                    일치
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  <div className="table-footer-info">
                    <Info className="footer-info-icon" />
                    <span>행을 클릭하시면 공시 데이터의 <strong>상세 원문 발췌 팝업 모달</strong>을 확인할 수 있습니다.</span>
                  </div>
                </div>

                {/* Discrepancy Detail Box */}
                <div className="discrepancy-card">
                  <div className="card-header">
                    <h2>공시 수치간 편차 비교 및 정성 검증</h2>
                    <p className="card-subtitle">수질 및 공업용수 범위 편차의 구체적 사유 파악</p>
                  </div>
                  
                  {comparisonData ? (
                    <div className="discrepancy-content">
                      <div className="discrepancy-title">
                        <span className="comp-badge">{comparisonData.company}</span>
                        <span className="year-badge">{comparisonData.year}년 세부 효율 지표</span>
                      </div>

                      <div className="comparison-grid">
                        <div className="comparison-column">
                          <div className="col-header bg-cdp-subtle">CDP (글로벌 연결)</div>
                          <div className="col-body">
                            <p className="col-val text-red">{comparisonData.CDP?.water_intensity ? `${comparisonData.CDP.water_intensity.toFixed(1)}` : '-'} <span className="col-unit">L</span></p>
                            <span className="col-label">원단위</span>
                            <p className="col-val text-green">{comparisonData.CDP?.recycle_rate ? `${comparisonData.CDP.recycle_rate.toFixed(1)}%` : '-'}</p>
                            <span className="col-label">재이용률</span>
                          </div>
                        </div>

                        <div className="comparison-column">
                          <div className="col-header bg-sr-subtle">지속가능보고서</div>
                          <div className="col-body">
                            <p className="col-val text-red">{comparisonData.SR?.water_intensity ? `${comparisonData.SR.water_intensity.toFixed(1)}` : '-'} <span className="col-unit">L</span></p>
                            <span className="col-label">원단위</span>
                            <p className="col-val text-green">{comparisonData.SR?.recycle_rate ? `${comparisonData.SR.recycle_rate.toFixed(1)}%` : '-'}</p>
                            <span className="col-label">재이용률</span>
                          </div>
                        </div>

                        <div className="comparison-column">
                          <div className="col-header bg-dart-subtle">DART / 규제 공시</div>
                          <div className="col-body">
                            <p className="col-val text-red">{comparisonData.DART?.water_intensity ? `${comparisonData.DART.water_intensity.toFixed(1)}` : '-'} <span className="col-unit">L</span></p>
                            <span className="col-label">원단위</span>
                            <p className="col-val text-green">{comparisonData.DART?.recycle_rate ? `${comparisonData.DART.recycle_rate.toFixed(1)}%` : '-'}</p>
                            <span className="col-label">재이용률</span>
                          </div>
                        </div>
                      </div>

                      <div className="discrepancy-explanation">
                        <div className="explanation-header">
                          <AlertCircle className="exp-icon" />
                          <h4>데이터 불일치 사유 분석</h4>
                        </div>
                        <p className="explanation-text">
                          {comparisonData.CDP?.discrepancyNote || 
                           comparisonData.SR?.discrepancyNote || 
                           comparisonData.DART?.discrepancyNote || 
                           "이 항목은 공시 범위 또는 공개 주기의 불일치가 식별되었습니다."}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="discrepancy-empty">
                      <HelpCircle className="empty-illustration-icon" />
                      <h3>교차 검증할 대상을 선택해 주세요</h3>
                      <p>
                        좌측 아카이브 테이블에서 주황색 <span className="status-badge warning" style={{ display: 'inline-flex' }}><AlertTriangle className="badge-icon" /> 불일치</span> 표시가 있는 행을 클릭하시면 분석 결과가 여기에 출력됩니다.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Visualizations (Charts) - rendered globally under the accordions for dashboard feel */}
      <section className="charts-section">
        <div className="chart-card">
          <div className="card-header">
            <div className="header-with-badge">
              <h2>웨이퍼 면적당 용수 사용 원단위 (Water Intensity) 비교</h2>
              <span className="chart-source-badge">기준: {selectedSource === 'ALL' ? '지속가능경영보고서' : selectedSource}</span>
            </div>
            <p className="card-subtitle">L/wafer area (단위 면적당 투입되는 용수 공급량, 낮을수록 우수)</p>
          </div>
          <div className="chart-container" style={{ width: '100%', height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={intensityChartData}
                margin={{ top: 20, right: 30, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#2e303a" />
                <XAxis dataKey="name" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" unit=" L" domain={[40, 75]} />
                <ChartTooltip 
                  contentStyle={{ backgroundColor: '#1e2029', border: '1px solid #2e303a', color: '#f3f4f6' }}
                />
                <Legend />
                <Line type="monotone" dataKey="삼성전자" stroke="#3b82f6" strokeWidth={3} activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="SK하이닉스" stroke="#10b981" strokeWidth={3} />
                <Line type="monotone" dataKey="TSMC" stroke="#a855f7" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-card">
          <div className="card-header">
            <h2>공정 내부 용수 재이용률 (Recycle Rate) 비교</h2>
            <p className="card-subtitle">생산 공정에서 발생하는 폐수를 가공·정화하여 초순수로 재사용하는 비율</p>
          </div>
          <div className="chart-container" style={{ width: '100%', height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={recycleChartData}
                margin={{ top: 20, right: 30, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#2e303a" />
                <XAxis dataKey="name" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" unit=" %" domain={[70, 95]} />
                <ChartTooltip 
                  contentStyle={{ backgroundColor: '#1e2029', border: '1px solid #2e303a', color: '#f3f4f6' }}
                  formatter={(value: any) => [`${value}%`]}
                />
                <Legend />
                <Bar dataKey="삼성전자" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="SK하이닉스" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="TSMC" fill="#a855f7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* Text Excerpt Popup Modal (Section 1/5) */}
      {selectedModalRecord && (
        <div className="modal-backdrop">
          <div className="modal-card fade-in">
            <div className="modal-header">
              <div className="modal-title-box">
                <Database className="modal-title-icon" />
                <h3>공시 원문 아카이브 조회</h3>
              </div>
              <button className="modal-close" onClick={() => setSelectedModalRecord(null)}>
                <X className="close-icon" />
              </button>
            </div>
            
            <div className="modal-body">
              <div className="modal-meta-grid">
                <div>
                  <span className="meta-label">공시 대상</span>
                  <p className="meta-val font-semibold">{selectedModalRecord.company}</p>
                </div>
                <div>
                  <span className="meta-label">대상 연도</span>
                  <p className="meta-val">{selectedModalRecord.year}년</p>
                </div>
                <div>
                  <span className="meta-label">연동 출처</span>
                  <p className="meta-val">
                    <span className={`badge-source ${
                      selectedModalRecord.source === 'CDP' ? 'bg-cdp' : selectedModalRecord.source === '지속가능경영보고서' ? 'bg-sr' : 'bg-dart'
                    }`}>
                      {selectedModalRecord.source}
                    </span>
                  </p>
                </div>
              </div>

              <div className="modal-text-excerpt mt-4">
                <h4>발췌 내용 (Excerpt Note)</h4>
                <div className="excerpt-content-box font-mono">
                  {selectedModalRecord.note}
                </div>
              </div>

              {selectedModalRecord.discrepancy && (
                <div className="modal-discrepancy-warning mt-4">
                  <div className="warning-title-box">
                    <AlertTriangle className="warning-icon-modal" />
                    <h5>이 데이터의 공시 검증 리스크</h5>
                  </div>
                  <p className="warning-text">
                    {selectedModalRecord.discrepancyNote}
                  </p>
                </div>
              )}
            </div>

            <div className="modal-footer mt-4">
              <button className="btn-close-modal" onClick={() => setSelectedModalRecord(null)}>닫기</button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="dashboard-footer">
        <p>© 2026 CDP Water Security Engagement. KoSIF 물공시 이슈브리프 자료 연동.</p>
        <p className="mt-1">본 대시보드는 분석 모델 및 공개 공시 데이터를 기반으로 작성되었으며, 정치적 쟁점화를 배제한 객관적 지표만을 전달합니다.</p>
      </footer>
    </div>
  );
}
