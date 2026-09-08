import React from 'react';
import { useNavigate } from 'react-router';
import { C } from '../lib/constants';
import { Toasts } from './ui';
import { Icon } from '../lib/icons';
import { useStore } from '../context/store';

import { useAuth } from '../context/AuthContext';

export type SidebarKey = string;

export interface NavItem { key: SidebarKey; label: string; Icon: () => React.ReactElement; }

interface ShellProps {
  role: 'company' | 'kabadiwala';
  navItems: NavItem[];
  activeKey: SidebarKey;
  onNav: (key: SidebarKey) => void;
  avatarInitials: string;
  avatarName: string;
  children: React.ReactNode;
}

export function Shell({ role, navItems, activeKey, onNav, avatarInitials, avatarName, children }: ShellProps) {
  const { notifications, toasts, removeToast } = useStore();
  const { logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: C.canvas, fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>

      {/* Mobile overlay */}
      {sidebarOpen && <div onClick={() => setSidebarOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(30,40,34,0.4)', zIndex: 39 }} />}

      {/* Sidebar */}
      <aside
        style={{ width: 240, minHeight: '100vh', background: C.deepGreen, display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 40, transition: 'transform 0.25s ease', flexShrink: 0 }}
        className={sidebarOpen ? 'sidebar sidebar-open' : 'sidebar'}
      >
        {/* Logo */}
        <div style={{ padding: '24px 20px 20px', borderBottom: `1px solid rgba(255,255,255,0.1)` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 34, height: 34, background: C.gold, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.deepGreen }}>
              <Icon.recycle />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 800, color: C.white, lineHeight: 1.1 }}>Punahachakra</div>
              <div style={{ fontSize: 11, color: C.gold, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                {role === 'company' ? 'Company Portal' : 'Kabadiwala Portal'}
              </div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 12px' }}>
          {navItems.map(item => {
            const active = activeKey === item.key;
            return (
              <button key={item.key} onClick={() => { onNav(item.key); setSidebarOpen(false); }} style={{
                display: 'flex', alignItems: 'center', gap: 12, width: '100%',
                padding: '10px 12px', borderRadius: 8, border: 'none', cursor: 'pointer',
                background: active ? 'rgba(255,255,255,0.12)' : 'transparent',
                color: active ? C.white : 'rgba(255,255,255,0.6)',
                fontSize: 14, fontWeight: active ? 700 : 500, textAlign: 'left',
                marginBottom: 2, transition: 'all 0.12s',
              }}>
                <item.Icon />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Bottom */}
        <div style={{ padding: '16px 20px', borderTop: `1px solid rgba(255,255,255,0.1)`, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button
            onClick={() => navigate('/')}
            style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'background 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
            </svg>
            Back to Home
          </button>
          <button
            onClick={handleLogout}
            style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid rgba(239, 68, 68, 0.3)', background: 'rgba(239, 68, 68, 0.1)', color: '#fca5a5', fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'background 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'; }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Logout
          </button>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', lineHeight: 1.6, marginTop: 4 }}>
            Punahachakra<br />Secure · Verified · Trusted<br />v1.0 Demo
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="main-content" style={{ marginLeft: 240, flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        {/* TopBar */}
        <div style={{ height: 60, background: C.white, borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', padding: '0 20px', gap: 12, position: 'sticky', top: 0, zIndex: 20 }}>
          <button onClick={() => setSidebarOpen(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted, display: 'none', padding: 4 }} className="mobile-menu-btn">
            <Icon.menu />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: C.canvas, border: `1px solid ${C.border}`, borderRadius: 8, padding: '7px 12px', flex: 1, maxWidth: 360 }}>
            <span style={{ color: C.muted }}><Icon.search /></span>
            <input placeholder="Search requests, kabadiwalas…" style={{ background: 'none', border: 'none', outline: 'none', fontSize: 13, color: C.darkText, flex: 1, fontFamily: 'inherit' }} />
          </div>
          <div style={{ flex: 1 }} />
          <button style={{ position: 'relative', background: 'none', border: 'none', cursor: 'pointer', color: C.muted, padding: 6, borderRadius: 8 }}>
            <Icon.bell />
            {notifications > 0 && (
              <span style={{ position: 'absolute', top: 2, right: 2, width: 16, height: 16, background: C.error, color: C.white, borderRadius: '50%', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{notifications}</span>
            )}
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 10px', borderRadius: 9, border: `1px solid ${C.border}` }}>
            <div style={{ width: 30, height: 30, background: C.softGreen, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: C.primary }}>{avatarInitials}</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.darkText, lineHeight: 1.2 }}>{avatarName}</div>
              <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.2 }}>{role === 'company' ? 'Company' : 'Kabadiwala'}</div>
            </div>
            <button onClick={handleLogout} title="Logout" style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted, marginLeft: 6, display: 'flex', alignItems: 'center' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            </button>
          </div>
        </div>

        <main style={{ flex: 1, overflowY: 'auto' }}>{children}</main>
      </div>

      <Toasts toasts={toasts} onRemove={removeToast} />

      <style>{`
        .sidebar { transform: translateX(0); }
        @media (max-width: 768px) {
          .sidebar { transform: translateX(-100%); }
          .sidebar-open { transform: translateX(0) !important; }
          .mobile-menu-btn { display: flex !important; }
          .main-content { margin-left: 0 !important; }
        }
        @media (max-width: 900px) {
          .stat-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .two-col-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
