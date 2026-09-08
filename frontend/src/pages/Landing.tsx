import { useNavigate } from 'react-router';
import { C } from '../lib/constants';
import { Icon } from '../lib/icons';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: '100vh', background: C.canvas,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '40px 20px',
      fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 48 }}>
        <img src="/logo.png" alt="Punahachakra Logo" style={{ width: 52, height: 52, borderRadius: 14, objectFit: 'cover' }} />
        <div>
          <div style={{ fontSize: 26, fontWeight: 800, color: C.darkText, lineHeight: 1.1 }}>Punahachakra</div>
          <div style={{ fontSize: 14, color: C.muted, fontWeight: 500 }}>Trusted Digital Marketplace for Verified Kabadiwalas</div>
        </div>
      </div>

      {/* Headline */}
      <div style={{ textAlign: 'center', marginBottom: 56 }}>
        <h1 style={{ fontSize: 36, fontWeight: 800, color: C.darkText, margin: '0 0 12px', lineHeight: 1.2 }}>
          Who are you?
        </h1>
        <p style={{ fontSize: 16, color: C.muted, margin: 0, maxWidth: 460 }}>
          Select your role to enter the platform. Both portals share live deal state across the session.
        </p>
      </div>

      {/* Role cards */}
      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', justifyContent: 'center', maxWidth: 760 }}>
        {/* Company card */}
        <div
          onClick={() => navigate('/login?role=company')}
          style={{
            width: 340, background: C.white, border: `1.5px solid ${C.border}`,
            borderRadius: 20, padding: '36px 32px', cursor: 'pointer',
            boxShadow: C.cardShadow, transition: 'border-color 0.2s, transform 0.15s, box-shadow 0.2s',
          }}
          onMouseEnter={e => {
            const el = e.currentTarget;
            el.style.borderColor = C.primary;
            el.style.transform = 'translateY(-4px)';
            el.style.boxShadow = '0 8px 32px rgba(33,100,74,0.14)';
          }}
          onMouseLeave={e => {
            const el = e.currentTarget;
            el.style.borderColor = C.border;
            el.style.transform = 'translateY(0)';
            el.style.boxShadow = C.cardShadow;
          }}
        >
          <div style={{ width: 56, height: 56, background: C.softGreen, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.primary, marginBottom: 20 }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="4" y="2" width="16" height="20" rx="1"/><path d="M9 22V12h6v10"/><path d="M9 7h1"/><path d="M9 11h1"/><path d="M14 7h1"/><path d="M14 11h1"/>
            </svg>
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: C.darkText, margin: '0 0 10px' }}>Company</h2>
          <p style={{ fontSize: 14, color: C.muted, margin: '0 0 24px', lineHeight: 1.6 }}>
            Post material requests, browse verified Kabadiwalas, review offers, and pay securely through the platform.
          </p>
          <ul style={{ margin: '0 0 28px', padding: '0 0 0 0', listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {['Post waste material requests', 'Browse ranked Kabadiwala matches', 'Pay securely via escrow', 'Track deal completion'].map(item => (
              <li key={item} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: C.darkText }}>
                <span style={{ color: C.success, flexShrink: 0 }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                </span>
                {item}
              </li>
            ))}
          </ul>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 700, color: C.primary }}>
            Enter as Company <Icon.arrowRight />
          </div>
        </div>

        {/* Kabadiwala card */}
        <div
          onClick={() => navigate('/login?role=kabadiwala')}
          style={{
            width: 340, background: C.deepGreen, border: `1.5px solid ${C.deepGreen}`,
            borderRadius: 20, padding: '36px 32px', cursor: 'pointer',
            boxShadow: C.cardShadow, transition: 'border-color 0.2s, transform 0.15s, box-shadow 0.2s',
          }}
          onMouseEnter={e => {
            const el = e.currentTarget;
            el.style.transform = 'translateY(-4px)';
            el.style.boxShadow = '0 8px 32px rgba(22,69,52,0.3)';
          }}
          onMouseLeave={e => {
            const el = e.currentTarget;
            el.style.transform = 'translateY(0)';
            el.style.boxShadow = C.cardShadow;
          }}
        >
          <div style={{ width: 56, height: 56, background: C.gold, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.deepGreen, marginBottom: 20 }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="1 4 1 10 7 10"/><polyline points="23 20 23 14 17 14"/>
              <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/>
            </svg>
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: C.white, margin: '0 0 10px' }}>Kabadiwala</h2>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.65)', margin: '0 0 24px', lineHeight: 1.6 }}>
            Receive assigned requests, upload asset images, propose your selling price, and receive secure payouts.
          </p>
          <ul style={{ margin: '0 0 28px', padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {['View assigned material requests', 'Upload asset images', 'Send price offers', 'Receive payout after completion'].map(item => (
              <li key={item} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'rgba(255,255,255,0.8)' }}>
                <span style={{ color: C.gold, flexShrink: 0 }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                </span>
                {item}
              </li>
            ))}
          </ul>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 700, color: C.gold }}>
            Enter as Kabadiwala <Icon.arrowRight />
          </div>
        </div>
      </div>

      {/* Footer note */}
      <p style={{ marginTop: 48, fontSize: 12, color: C.muted, textAlign: 'center' }}>
        Secure · Verified · Trusted — Punahachakra v1.0 Demo
      </p>
    </div>
  );
}
