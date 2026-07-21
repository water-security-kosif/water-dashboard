/* 상단 KPI — CDP Module 9 원본(Q9.2.2 총량)에서 검증한 수치만 표시.
 * 메인 숫자는 '일일 환산'으로 통일해 서남권 클러스터 필요량(65만 톤/일)과
 * 같은 축에서 비교되게 한다. 연간 원문 응답값은 아래에 작게 병기.
 * 값의 출처를 못 대는 숫자는 여기 올리지 않는다. */

type Kpi = {
  name: string;
  wd: number; // 연간 취수량 (ML)
  di: number; // 연간 방류량 (ML)
  co: number; // 연간 소비량 (ML)
  source: string;
};

/* 1 ML = 1,000 m³ = 1,000 톤 */
const KPIS: Kpi[] = [
  { name: '삼성전자', wd: 188541, di: 152109, co: 36432, source: 'CDP 2025 제출 · Q9.2.2' },
  { name: 'TSMC', wd: 128778, di: 86048, co: 42730, source: 'CDP 2025 제출 · Q9.2.2' },
  { name: 'SK하이닉스', wd: 112981, di: 93358, co: 19623, source: 'CDP 2025 · SK 2026 SR p.105' },
];

/* 서남권 정부안 */
const SW = {
  perDay: 650000, // 톤/일
  label: '호남 반도체 클러스터 필요 용수',
  detail: '동복댐 30 · 주암+장흥 15 · 보성강 10 · 나주호 10 (만 톤/일)',
  source: '기후에너지환경부 공급방안(2026)',
};

/* 연간 ML → 일일 만 톤 */
const perDayManTon = (ml: number) => (ml * 1000) / 365 / 10000;
const f1 = (v: number) => v.toLocaleString('ko-KR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const fInt = (v: number) => v.toLocaleString('ko-KR');

export default function KpiHeader() {
  const swMan = SW.perDay / 10000;
  const samsungPerDay = perDayManTon(KPIS[0].wd);

  return (
    <section className="kpi-band">
      <div className="kpi-row">
        {KPIS.map((k) => (
          <div className="kpi-card" key={k.name}>
            <div className="kpi-name">{k.name}</div>
            <div className="kpi-value">
              {f1(perDayManTon(k.wd))}
              <span className="kpi-unit">만 톤/일</span>
            </div>
            <div className="kpi-sub">일일 환산 취수량</div>
            <dl className="kpi-detail">
              <div>
                <dt>연간 취수</dt>
                <dd>{fInt(k.wd)} ML</dd>
              </div>
              <div>
                <dt>연간 방류</dt>
                <dd>{fInt(k.di)} ML</dd>
              </div>
              <div>
                <dt>연간 소비</dt>
                <dd>{fInt(k.co)} ML</dd>
              </div>
            </dl>
            <div className="kpi-meta">{k.source}</div>
          </div>
        ))}

        <div className="kpi-card kpi-card-accent">
          <div className="kpi-name">서남권 클러스터</div>
          <div className="kpi-value">
            {fInt(swMan)}
            <span className="kpi-unit">만 톤/일</span>
          </div>
          <div className="kpi-sub">{SW.label}</div>
          <dl className="kpi-detail">
            <div>
              <dt>연간 환산</dt>
              <dd>{fInt(Math.round((SW.perDay * 365) / 1000))} ML</dd>
            </div>
            <div>
              <dt>공급 구성</dt>
              <dd className="kpi-detail-wide">{SW.detail}</dd>
            </div>
          </dl>
          <div className="kpi-meta">{SW.source}</div>
        </div>
      </div>

      <p className="kpi-headline">
        서남권 반도체 클러스터 한 곳에 필요한 용수 <strong>{fInt(swMan)}만 톤/일</strong>은, 삼성전자가 전 세계
        사업장에서 실제로 취수하는 양(<strong>{f1(samsungPerDay)}만 톤/일</strong>)보다 많습니다.
      </p>

      <p className="kpi-footnote">
        3사 수치는 CDP Water Security 2025 제출분(2024 회계연도) 총 취수·방류·소비량이며, 해외 사업장을 포함한
        글로벌 연결 기준입니다. 일일 환산은 연간값을 365일로 나눈 단순 평균이라 계절 변동은 반영되지 않습니다.
        DART·지속가능경영보고서의 국내 범위 수치와는 집계 범위가 달라 직접 비교되지 않습니다.
      </p>
    </section>
  );
}
