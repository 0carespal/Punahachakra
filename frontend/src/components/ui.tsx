import React from 'react';
import { C } from '../lib/constants';
import type { Toast } from '../context/store';

import { Icon } from '../lib/icons';
export { Icon };

// ─── Stars ─────────────────────────────────────────────────────────────────
function StarSvg({ filled }: { filled: boolean }) {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill={filled ? '#D79A32' : 'none'} stroke="#D79A32" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  );
}
export function Stars({ rating }: { rating: number }) {
  const rounded = Math.round(rating);
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      {[1,2,3,4,5].map(i => <StarSvg key={i} filled={i <= rounded} />)}
      <span style={{ fontSize: 12, color: C.muted, marginLeft: 4 }}>{rating}</span>
    </span>
  );
}

// ─── Match bar ─────────────────────────────────────────────────────────────
export function MatchBar({ score }: { score: number }) {
  const color = score >= 85 ? C.success : score >= 65 ? C.gold : C.muted;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ flex: 1, height: 6, background: C.border, borderRadius: 4, overflow: 'hidden' }}>
        <div style={{ width: `${score}%`, height: '100%', background: color, borderRadius: 4, transition: 'width 0.6s ease' }} />
      </div>
      <span style={{ fontSize: 13, fontWeight: 700, color, minWidth: 36, textAlign: 'right' }}>{score}%</span>
    </div>
  );
}

// ─── Stat card ─────────────────────────────────────────────────────────────
export function StatCard({ label, value, sub, accent, bg }: { label: string; value: string; sub?: string; accent?: boolean; bg?: string }) {
  return (
    <div style={{ background: bg ?? C.softGreen, border: `1px solid ${C.border}`, borderRadius: 12, padding: '20px 24px', boxShadow: C.cardShadow, display: 'flex', flexDirection: 'column', gap: 4 }}>
      <span style={{ fontSize: 12, fontWeight: 500, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</span>
      <span style={{ fontSize: 28, fontWeight: 800, color: accent ? C.gold : C.darkText, lineHeight: 1.1 }}>{value}</span>
      {sub && <span style={{ fontSize: 12, color: C.muted }}>{sub}</span>}
    </div>
  );
}

// ─── Badge ─────────────────────────────────────────────────────────────────
export function Badge({ children, variant = 'default' }: { children: React.ReactNode; variant?: 'default' | 'success' | 'gold' | 'muted' | 'error' }) {
  const styles: Record<string, React.CSSProperties> = {
    default: { background: C.softGreen, color: C.primary },
    success: { background: '#E6F4EC', color: C.success },
    gold: { background: '#FDF3E3', color: C.gold },
    muted: { background: '#F0EDE8', color: C.muted },
    error: { background: '#FAE8E8', color: C.error },
  };
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 10px', borderRadius: 6, fontSize: 12, fontWeight: 600, ...styles[variant] }}>{children}</span>
  );
}

// ─── Primary button ─────────────────────────────────────────────────────────
export function PrimaryBtn({ children, onClick, disabled, loading, style, type = 'submit' }: {
  children: React.ReactNode; onClick?: () => void; disabled?: boolean; loading?: boolean; style?: React.CSSProperties; type?: 'button' | 'submit' | 'reset';
}) {
  return (
    <button type={type} onClick={onClick} disabled={disabled || loading} style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      background: disabled ? C.border : C.primary, color: C.white,
      padding: '11px 24px', borderRadius: 9, fontWeight: 700, fontSize: 14,
      border: 'none', cursor: disabled || loading ? 'not-allowed' : 'pointer',
      transition: 'background 0.15s', opacity: disabled ? 0.6 : 1, ...style,
    }}
    onMouseEnter={e => { if (!disabled && !loading) (e.target as HTMLElement).style.background = C.deepGreen; }}
    onMouseLeave={e => { if (!disabled && !loading) (e.target as HTMLElement).style.background = C.primary; }}
    >
      {loading && <span className="spinner" style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block' }} />}
      {children}
    </button>
  );
}

// ─── Secondary button ──────────────────────────────────────────────────────
export function SecondaryBtn({ children, onClick, style }: { children: React.ReactNode; onClick?: () => void; style?: React.CSSProperties }) {
  return (
    <button onClick={onClick} style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      background: C.white, color: C.primary, padding: '10px 20px', borderRadius: 9, fontWeight: 600, fontSize: 13,
      border: `1.5px solid ${C.primary}`, cursor: 'pointer', transition: 'background 0.15s', ...style,
    }}
    onMouseEnter={e => (e.currentTarget.style.background = C.softGreen)}
    onMouseLeave={e => (e.currentTarget.style.background = C.white)}
    >{children}</button>
  );
}

// ─── Verified badge ─────────────────────────────────────────────────────────
export function VerifiedBadge() {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: C.softGreen, color: C.primary, padding: '2px 8px', borderRadius: 5, fontSize: 11, fontWeight: 700, letterSpacing: '0.03em' }}>
      {Icon.shield()}<span>VERIFIED</span>
    </span>
  );
}

// ─── Toasts ─────────────────────────────────────────────────────────────────
export function Toasts({ toasts, onRemove }: { toasts: Toast[]; onRemove: (id: number) => void }) {
  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1000, display: 'flex', flexDirection: 'column', gap: 10 }}>
      {toasts.map(t => (
        <div key={t.id} className={t.exiting ? 'toast-exit' : 'toast-enter'} style={{
          background: t.type === 'success' ? C.success : t.type === 'error' ? C.error : C.deepGreen,
          color: C.white, padding: '12px 18px', borderRadius: 10,
          display: 'flex', alignItems: 'center', gap: 10,
          fontSize: 14, fontWeight: 500, maxWidth: 340,
          boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
        }}>
          {t.type === 'success' && <span style={{ color: '#fff' }}>{Icon.checkCircle(16)}</span>}
          <span style={{ flex: 1 }}>{t.message}</span>
          <button onClick={() => onRemove(t.id)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', padding: 2 }}>{Icon.close()}</button>
        </div>
      ))}
    </div>
  );
}

// ─── Section heading ───────────────────────────────────────────────────────
export function SectionHeading({ children, sub }: { children: React.ReactNode; sub?: string }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <h2 style={{ fontSize: 22, fontWeight: 800, color: C.darkText, margin: 0 }}>{children}</h2>
      {sub && <p style={{ fontSize: 14, color: C.muted, margin: '4px 0 0' }}>{sub}</p>}
    </div>
  );
}

// ─── Form field ─────────────────────────────────────────────────────────────
export function FormField({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 13, fontWeight: 600, color: C.darkText }}>{label}</label>
      {children}
      {hint && <span style={{ fontSize: 11, color: C.muted }}>{hint}</span>}
    </div>
  );
}

export const inputStyle: React.CSSProperties = {
  padding: '10px 14px', borderRadius: 8, border: `1.5px solid ${C.border}`,
  fontSize: 14, color: C.darkText, background: C.white,
  transition: 'border-color 0.15s, box-shadow 0.15s',
};
