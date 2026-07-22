import { useMemo, useState } from 'react';
import { ChevronDown, ChevronUp, Sliders } from 'lucide-react';

/* TSMC가 2024 지속가능경영보고서(p.129)에서 직접 공시한 수치.
 * "Water consumption per wafer-layer (Liter/12-inch equivalent wafer mask layer)".
 * Section 1의 3사 비교(47.2/56.1/64.5L)는 KoSIF 역산 추정치이며,
 * 이 계산기는 TSMC가 실제로 공시한 마스크 레이어 원단위를 그대로 사용한다. */
const TSMC_L_PER_LAYER = 161.0;
const TSMC_YEAR = 2024;
const ASSUMED_LAYERS = 100; // 3nm 이하 로직 공정 평균 마스크 레이어 수 (가정값)

const fmt = (v: number) => Math.round(v).toLocaleString('ko-KR');

interface Props {
  isActive: boolean;
  onToggle: () => void;
}

export default function TsmcWaterIntensitySimulator({ isActive, onToggle }: Props) {
  const [monthlyProduction, setMonthlyProduction] = useState<number>(200); // K장/월 (12인치 환산)

  const result = useMemo(() => {
    const waterPerWaferL = ASSUMED_LAYERS * TSMC_L_PER_LAYER; // L/웨이퍼
    const annualWafers = monthlyProduction * 1000 * 12;
    const annualLiters = annualWafers * waterPerWaferL;
    const annualML = annualLiters / 1_000_000; // 1 ML = 1,000,000 L
    const dailyManTon = annualML * 1000 / 365 / 10000; // ML→톤(×1,000)→일평균→만톤
    return { waterPerWaferL, annualML, dailyManTon };
  }, [monthlyProduction]);

  return (
    <div className={`accordion-item ${isActive ? 'is-active' : ''}`}>
      <div className="accordion-header" onClick={onToggle}>
        <div className="header-title-box">
          <span className="section-badge">Section 5</span>
          <div>
            <h3>TSMC 공식 원단위 프록시 계산기</h3>
            <p>TSMC가 유일하게 공시하는 마스크 레이어 원단위({TSMC_YEAR}년 {TSMC_L_PER_LAYER.toFixed(1)}L)로 웨이퍼 생산량 대비 취수량을 역산</p>
          </div>
        </div>
        {isActive ? <ChevronUp className="chevron" /> : <ChevronDown className="chevron" />}
      </div>

      {isActive && (
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
                <h4>Section 1과 무엇이 다른가 <span className="source-label-inline">[출처: TSMC 2024 지속가능경영보고서 p.129]</span></h4>
                <p>
                  위 Section 1의 3사 비교치(TSMC 64.5L 등)는 KoSIF가 공장 전체 취수량과 추정 생산능력을 바탕으로 역산한 <strong>연구 추정치</strong>입니다.
                  이 계산기는 TSMC가 매년 보고서에 직접 발표하는 <strong>"마스크 레이어당 취수량"</strong> 공식 수치({TSMC_YEAR}년 {TSMC_L_PER_LAYER.toFixed(1)}L, 2023년 대비 8.7% 감소)를 그대로 사용합니다.
                </p>
                <p className="mt-2 text-muted" style={{ fontSize: '12px' }}>
                  💡 <strong>레이어 수를 곱하는 이유:</strong> TSMC의 공시 단위는 "웨이퍼 1장"이 아니라 "마스크 레이어 1개 통과분"입니다. 실제 완성 웨이퍼 1장은 공정에서 수십~100여 개의 마스크 레이어를 거치므로, 레이어당 원단위에 평균 레이어 수를 곱해야 웨이퍼 1장 기준 물량이 됩니다.
                </p>

                <div className="methodology-documentation-box mt-4">
                  <h5>📊 연산 공식 및 방법론 (Methodology)</h5>
                  <div className="methodology-formula">
                    <div style={{ fontFamily: 'var(--mono)', fontSize: '12px', lineHeight: '1.6', textAlign: 'left', whiteSpace: 'pre-wrap', color: 'var(--text-title)' }}>
                      {`[연산 공식]\n웨이퍼 1장당 취수량(L) = 평균 마스크 레이어 수(${ASSUMED_LAYERS}, 가정값) × TSMC 원단위(${TSMC_L_PER_LAYER.toFixed(1)} L/레이어)\n연간 취수량(ML) = 월간 생산량(K장) × 1,000 × 12개월 × 웨이퍼당 취수량(L) ÷ 1,000,000`}
                    </div>
                    <p className="formula-simplified mt-2">
                      웨이퍼 1장당 환산 취수량: <strong>{fmt(result.waterPerWaferL)} L/장</strong>
                    </p>
                  </div>
                  <ul className="methodology-notes-list mt-2">
                    <li><strong>마스크 레이어 수(100층):</strong> 3nm 이하 로직 공정에서 통상 거론되는 평균값이며 <strong>가정값</strong>입니다. 국내 기업이 실제 레이어 수·원단위를 공시하면 즉시 교체해야 합니다.</li>
                    <li><strong>TSMC 원단위(161.0 L/레이어):</strong> 대만·중국·미국 등 TSMC 전 사업장(Taiwan, TSMC(China), TSMC(Nanjing), TSMC Washington, TSMC Arizona, JASM, VisEra) 합산 기준입니다.</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="simulator-results">
              <h3>TSMC 원단위 기준 예상 취수량</h3>

              <div className="results-summary-cards" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
                <div className="res-card border-purple">
                  <span className="res-label">연간 총 예상 취수량</span>
                  <span className="res-val text-purple font-mono">{fmt(result.annualML)} <span className="unit">ML/년</span></span>
                  <span className="res-note">원단위: {TSMC_L_PER_LAYER.toFixed(1)} L/레이어 × {ASSUMED_LAYERS}층 [출처: TSMC {TSMC_YEAR} SR p.129]</span>
                </div>
                <div className="res-card border-blue">
                  <span className="res-label">일평균 환산 취수량</span>
                  <span className="res-val text-blue font-mono">{result.dailyManTon.toFixed(2)} <span className="unit">만 톤/일</span></span>
                  <span className="res-note">연간값 ÷ 365일 단순 평균 (계절 변동 미반영)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
