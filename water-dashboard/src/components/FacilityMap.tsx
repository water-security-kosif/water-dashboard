import { useEffect, useMemo, useRef, useState } from 'react';
import sitesData from '../data/m9_sites.json';

/* ------------------------------------------------------------------
 *  Google Maps API 키
 *  교체 시 이 한 줄만 바꾸면 됩니다.
 *  Cloud Console 제한 권장: HTTP 리퍼러 https://water-security-kosif.github.io/*
 *                          API 제한 → Maps JavaScript API 만
 * ------------------------------------------------------------------ */
const GMAPS_KEY = 'AIzaSyAunS_vixwMvudJM5xMTWQoG2oqOVyPiNg';

/* dataviz 검증 팔레트 (light/dark all-pairs 통과) */
const C_OTHER = '#2a78d6'; // blue  — 그 외 유역
const C_SW = '#eb6834'; // orange — 서남권(영산강·섬진강)
const C_ERR = '#d03b3b'; // critical — 데이터 오류 동반

type Site = {
  o: string; f: string; b: string;
  la: number; lo: number;
  wd: number | null; di: number | null; co: number | null;
  st: number; sw: number; fl: string[]; raw: string;
};

type Payload = {
  sites: Site[];
  errors: Site[];
  basins: { b: string; n: number; wd: number; di: number; co: number; stress: number }[];
  meta: { total_rows: number; domestic: number; sw: number; err: number };
};

const data = sitesData as unknown as Payload;

/* 서남권 초기 뷰 (광주–여수 사이) */
const SW_VIEW = { center: { lat: 34.98, lng: 126.95 }, zoom: 9 };
const KR_VIEW = { center: { lat: 36.3, lng: 127.8 }, zoom: 7 };

const fmt = (v: number | null | undefined) =>
  v == null ? '미공시' : v.toLocaleString('ko-KR', { maximumFractionDigits: 1 }) + ' ML';

export default function FacilityMap() {
  const mapEl = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const infoRef = useRef<any>(null);

  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [basin, setBasin] = useState<string>('서남권');
  const [onlyStress, setOnlyStress] = useState(false);
  const [onlyErr, setOnlyErr] = useState(false);

  /* 유역 필터 목록 — 국내좌표 사업장 수 기준 내림차순 */
  const basinList = useMemo(() => {
    const order = data.basins.filter((x) => x.n > 0).map((x) => x.b);
    return ['서남권', '전체', ...order.filter((b) => b !== '영산강' && b !== '섬진강')];
  }, []);

  const visible = useMemo(() => {
    return data.sites.filter((s) => {
      if (basin === '서남권' && !s.sw) return false;
      if (basin !== '서남권' && basin !== '전체' && s.b !== basin) return false;
      if (onlyStress && !s.st) return false;
      if (onlyErr && s.fl.length === 0) return false;
      return true;
    });
  }, [basin, onlyStress, onlyErr]);

  /* 취수량 → 마커 반지름 (로그 스케일). 미공시는 최소 크기 */
  const scale = useMemo(() => {
    const max = Math.max(...data.sites.map((s) => s.wd || 0), 1);
    const denom = Math.log10(max + 1);
    return (wd: number | null) => (wd ? 5 + 13 * (Math.log10(wd + 1) / denom) : 4);
  }, []);

  /* --- Google Maps 스크립트 로드 --- */
  useEffect(() => {
    const w = window as any;
    if (w.google?.maps) { setStatus('ready'); return; }
    const existing = document.getElementById('gmaps-sdk');
    if (existing) {
      existing.addEventListener('load', () => setStatus('ready'));
      existing.addEventListener('error', () => setStatus('error'));
      return;
    }
    const s = document.createElement('script');
    s.id = 'gmaps-sdk';
    s.src = `https://maps.googleapis.com/maps/api/js?key=${GMAPS_KEY}&language=ko&region=KR`;
    s.async = true;
    s.onload = () => setStatus('ready');
    s.onerror = () => setStatus('error');
    document.head.appendChild(s);
  }, []);

  /* --- 지도 초기화 --- */
  useEffect(() => {
    if (status !== 'ready' || !mapEl.current || mapRef.current) return;
    const g = (window as any).google;
    mapRef.current = new g.maps.Map(mapEl.current, {
      ...SW_VIEW,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: true,
      gestureHandling: 'greedy',
    });
    infoRef.current = new g.maps.InfoWindow();
  }, [status]);

  /* --- 마커 갱신 --- */
  useEffect(() => {
    if (status !== 'ready' || !mapRef.current) return;
    const g = (window as any).google;
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    visible.forEach((s) => {
      const hasErr = s.fl.length > 0;
      const color = hasErr ? C_ERR : s.sw ? C_SW : C_OTHER;
      const marker = new g.maps.Marker({
        position: { lat: s.la, lng: s.lo },
        map: mapRef.current,
        title: `${s.o} · ${s.f}`,
        icon: {
          path: g.maps.SymbolPath.CIRCLE,
          scale: scale(s.wd),
          fillColor: color,
          fillOpacity: 0.72,
          strokeColor: '#ffffff',
          strokeWeight: 2, // 겹치는 마크 분리용 2px 링
        },
        zIndex: Math.round(s.wd || 0),
      });
      marker.addListener('click', () => {
        const flagHtml = hasErr
          ? `<div style="margin-top:8px;padding:8px;background:#fdecec;border-left:3px solid ${C_ERR};font-size:12px;color:#0b0b0b">
               <strong>공시 데이터 이상 ${s.fl.length}건</strong><br/>${s.fl.join(' · ')}
               ${s.raw ? `<br/><span style="color:#52514e">원문 유역: ${s.raw}</span>` : ''}
             </div>`
          : '';
        infoRef.current.setContent(
          `<div style="font-family:system-ui,-apple-system,'Segoe UI',sans-serif;max-width:290px;color:#0b0b0b">
             <div style="font-weight:700;font-size:14px;margin-bottom:2px">${s.o}</div>
             <div style="color:#52514e;font-size:12px;margin-bottom:8px">${s.f || '사업장명 미기재'}</div>
             <table style="font-size:12px;border-collapse:collapse;width:100%">
               <tr><td style="color:#52514e;padding:2px 8px 2px 0">유역</td><td><strong>${s.b}</strong>${s.sw ? ' <span style="color:' + C_SW + '">(서남권)</span>' : ''}</td></tr>
               <tr><td style="color:#52514e;padding:2px 8px 2px 0">물스트레스</td><td>${s.st ? '해당 지역' : '해당 없음'}</td></tr>
               <tr><td style="color:#52514e;padding:2px 8px 2px 0">취수량</td><td><strong>${fmt(s.wd)}</strong></td></tr>
               <tr><td style="color:#52514e;padding:2px 8px 2px 0">방류량</td><td>${fmt(s.di)}</td></tr>
               <tr><td style="color:#52514e;padding:2px 8px 2px 0">소비량</td><td>${fmt(s.co)}</td></tr>
             </table>
             ${flagHtml}
             <div style="margin-top:8px;font-size:11px;color:#898781">CDP 2025 Module 9 · Q9.3.1 사업장별 물 데이터</div>
           </div>`
        );
        infoRef.current.open({ anchor: marker, map: mapRef.current });
      });
      markersRef.current.push(marker);
    });
  }, [visible, status, scale]);

  /* --- 필터 변경 시 뷰 이동 --- */
  useEffect(() => {
    if (status !== 'ready' || !mapRef.current) return;
    if (basin === '서남권') mapRef.current.setOptions(SW_VIEW);
    else if (basin === '전체') mapRef.current.setOptions(KR_VIEW);
    else {
      const pts = visible.filter((s) => s.la && s.lo);
      if (!pts.length) return;
      const g = (window as any).google;
      const b = new g.maps.LatLngBounds();
      pts.forEach((s) => b.extend({ lat: s.la, lng: s.lo }));
      mapRef.current.fitBounds(b, 48);
    }
  }, [basin, status]); // eslint-disable-line react-hooks/exhaustive-deps

  /* 표시 중 집계 */
  const sum = useMemo(() => {
    const wd = visible.reduce((a, s) => a + (s.wd || 0), 0);
    const err = visible.filter((s) => s.fl.length > 0).length;
    const stress = visible.filter((s) => s.st).length;
    return { n: visible.length, wd, err, stress };
  }, [visible]);

  return (
    <section className="m9-map-section">
      <div className="m9-map-head">
        <div>
          <span className="section-badge">CDP Module 9</span>
          <h3>사업장별 취수·방류 지도 (Q9.3.1)</h3>
          <p>
            한국 기업이 CDP에 보고한 사업장 <strong>{data.meta.total_rows}건</strong> 중 국내 좌표가 확인된{' '}
            <strong>{data.meta.domestic}개소</strong>. 원 크기는 연간 취수량(로그 스케일), 색은 유역 구분입니다.
          </p>
        </div>
      </div>

      {/* 필터 — 한 줄 배치 */}
      <div className="m9-filters">
        <div className="m9-filter-group">
          {basinList.map((b) => (
            <button
              key={b}
              className={`m9-chip ${basin === b ? 'is-on' : ''}`}
              onClick={() => setBasin(b)}
            >
              {b}
              {b === '서남권' && <span className="m9-chip-count">{data.meta.sw}</span>}
              {b === '전체' && <span className="m9-chip-count">{data.meta.domestic}</span>}
            </button>
          ))}
        </div>
        <div className="m9-filter-group">
          <label className="m9-toggle">
            <input type="checkbox" checked={onlyStress} onChange={(e) => setOnlyStress(e.target.checked)} />
            <span>물스트레스 지역만</span>
          </label>
          <label className="m9-toggle">
            <input type="checkbox" checked={onlyErr} onChange={(e) => setOnlyErr(e.target.checked)} />
            <span>공시 이상만</span>
          </label>
        </div>
      </div>

      {/* 지도 */}
      <div className="m9-map-wrap">
        {status === 'error' && (
          <div className="m9-map-fallback">
            <strong>지도를 불러오지 못했습니다.</strong>
            <p>
              Google Maps API 키가 유효하지 않거나 도메인 제한에 막혔을 수 있습니다. Cloud Console에서 이 사이트
              도메인(<code>water-security-kosif.github.io</code>)이 HTTP 리퍼러 허용 목록에 있는지, Maps JavaScript
              API가 사용 설정돼 있는지 확인해 주세요. 아래 표의 데이터는 지도와 무관하게 그대로 유효합니다.
            </p>
          </div>
        )}
        {status === 'loading' && <div className="m9-map-fallback">지도를 불러오는 중…</div>}
        <div ref={mapEl} className="m9-map" style={{ display: status === 'ready' ? 'block' : 'none' }} />
      </div>

      {/* 범례 — 색만으로 식별되지 않도록 라벨 동반 */}
      <div className="m9-legend">
        <span className="m9-legend-item">
          <i className="m9-dot" style={{ background: C_SW }} /> 서남권(영산강·섬진강)
        </span>
        <span className="m9-legend-item">
          <i className="m9-dot" style={{ background: C_OTHER }} /> 그 외 유역
        </span>
        <span className="m9-legend-item">
          <i className="m9-dot" style={{ background: C_ERR }} /> 공시 데이터 이상 동반
        </span>
        <span className="m9-legend-item m9-legend-note">원 크기 = 연간 취수량(로그)</span>
      </div>

      {/* 표시 중 집계 */}
      <div className="m9-stats">
        <div className="m9-stat">
          <span className="m9-stat-label">표시 사업장</span>
          <strong>{sum.n.toLocaleString('ko-KR')}개소</strong>
        </div>
        <div className="m9-stat">
          <span className="m9-stat-label">합계 취수량</span>
          <strong>{Math.round(sum.wd).toLocaleString('ko-KR')} ML</strong>
        </div>
        <div className="m9-stat">
          <span className="m9-stat-label">물스트레스 지역</span>
          <strong>{sum.stress}개소</strong>
        </div>
        <div className="m9-stat m9-stat-warn">
          <span className="m9-stat-label">공시 이상</span>
          <strong>{sum.err}개소</strong>
        </div>
      </div>

      <p className="m9-source">
        출처: CDP 2025 Water Security Module 9 · Q9.3.1 사업장별 물 데이터 (한국 기업 응답 {data.meta.total_rows}행).
        좌표·유역·취수/방류/소비량은 기업이 CDP에 제출한 원문 값을 그대로 표시하며, 임의 보정하지 않았습니다.
        물질수지 불일치·좌표 오기 등은 <strong>공시 이상</strong>으로 표시했습니다.
      </p>
    </section>
  );
}
