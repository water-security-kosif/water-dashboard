/* 상단 KPI — CDP Module 9 원본(Q9.2.2 총량)에서 검증한 수치만 표시.
 * 값의 출처를 못 대는 숫자는 여기 올리지 않는다. */

type Kpi = {
  name: string;
  ml: number;
  eok: string;      // 억/만 톤 표기
  sub: string;
  source: string;
  accent?: boolean;
};

/* 1 ML = 1,000 m³ = 1,000 톤 */
const KPIS: Kpi[] = [
  {
    name: '삼성전자',
    ml: 188541,
    eok: '1억 8,854만',
    sub: '전 사업장 연간 취수량',
    source: 'CDP 2025 제출 · Q9.2.2',
  },
  {
    name: 'TSMC',
    ml: 128778,
    eok: '1억 2,878만',
    sub: '전 사업장 연간 취수량',
    source: 'CDP 2025 제출 · Q9.2.2',
  },
  {
    name: 'SK하이닉스',
    ml: 112981,
    eok: '1억 1,298만',
    sub: '전 사업장 연간 취수량',
    source: 'CDP 2025 · SK 2026 SR p.105',
  },
];

/* 서남권 정부안 — 별도 성격이라 대비 카드로 분리 */
const SW = {
  value: '65만',
  unit: '톤/일',
  label: '호남 반도체 클러스터 필요 용수',
  detail: '동복댐 30 · 주암+장흥 15 · 보성강 10 · 나주호 10',
  source: '기후에너지환경부 공급방안(2026)',
};

export default function KpiHeader() {
  return (
    <section className="kpi-band">
      <div className="kpi-row">
        {KPIS.map((k) => (
          <div className="kpi-card" key={k.name}>
            <div className="kpi-name">{k.name}</div>
            <div className="kpi-value">
              {k.eok}
              <span className="kpi-unit">톤</span>
            </div>
            <div className="kpi-sub">{k.sub}</div>
            <div className="kpi-meta">
              {k.ml.toLocaleString('ko-KR')} ML · {k.source}
            </div>
          </div>
        ))}

        <div className="kpi-card kpi-card-accent">
          <div className="kpi-name">서남권 클러스터</div>
          <div className="kpi-value">
            {SW.value}
            <span className="kpi-unit">{SW.unit}</span>
          </div>
          <div className="kpi-sub">{SW.label}</div>
          <div className="kpi-meta">{SW.detail}</div>
        </div>
      </div>
      <p className="kpi-footnote">
        3사 수치는 CDP Water Security 2025 제출분(2024 회계연도) 총 취수량입니다. 해외 사업장을 포함한 글로벌 연결
        기준이며, DART·지속가능경영보고서의 국내 범위 수치와는 집계 범위가 달라 직접 비교되지 않습니다. 서남권
        65만 톤/일은 {SW.source} 기준입니다.
      </p>
    </section>
  );
}
