import React, { useState, useEffect } from 'react';
import { Shell } from '../components/Shell';
import { Stars, MatchBar, StatCard, Badge, PrimaryBtn, SecondaryBtn, VerifiedBadge, SectionHeading, FormField, inputStyle } from '../components/ui';
import { Icon } from '../lib/icons';
import { C, KABADIWALAS } from '../lib/constants';
import { useStore } from '../context/store';
import { useAuth } from '../context/AuthContext';
import { requirementService, RequirementItem } from '../services/requirement.service';
import { transactionService, RankedKabadiwala } from '../services/transaction.service';
import { authService } from '../services/auth.service';

type CompanyView = 'dashboard' | 'post-request' | 'requests' | 'matches' | 'kabadiwala-profile' | 'company-profile' | 'payment' | 'tracking';
type SidebarKey = 'dashboard' | 'requests' | 'matches' | 'payments' | 'profile';

const NAV = [
  { key: 'dashboard' as SidebarKey, label: 'Dashboard', Icon: Icon.dashboard },
  { key: 'requests' as SidebarKey, label: 'Requests', Icon: Icon.requests },
  { key: 'matches' as SidebarKey, label: 'Matches', Icon: Icon.matches },
  { key: 'payments' as SidebarKey, label: 'Payments', Icon: Icon.payments },
  { key: 'profile' as SidebarKey, label: 'Profile', Icon: Icon.profile },
];

// ─── Company Dashboard ─────────────────────────────────────────────────────
function CompanyDashboard({ onNavigate, requirements }: {
  onNavigate: (v: CompanyView) => void; requirements: RequirementItem[];
}) {
  const { user } = useAuth();
  const recentRequest = requirements[0];
  const activeCount = requirements.filter(request => request.status !== 'COMPLETED' && request.status !== 'CANCELLED').length;
  const displayName = user?.company_name || user?.email?.split('@')[0] || 'Company';
  const formatDate = (date: string) => new Date(date).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div className="view-transition" style={{ padding: '32px 32px' }}>
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 12, fontWeight: 500, color: C.muted, marginBottom: 4 }}>{new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</div>
        <h1 style={{ fontSize: 30, fontWeight: 800, color: C.darkText, margin: 0 }}>Good morning, {displayName} 👋</h1>
        <p style={{ fontSize: 15, color: C.muted, margin: '6px 0 0' }}>Here's what's happening with your waste requests today.</p>
      </div>

      <div className="stat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
        <StatCard label="Active Requests" value={String(activeCount)} sub="From your request history" />
        <StatCard label="Total Requests" value={String(requirements.length)} sub="All company requests" />
        <StatCard label="Completed Deals" value={String(requirements.filter(request => request.status === 'COMPLETED').length)} sub="Completed requests" />
      </div>

      <div style={{ marginBottom: 32 }}>
        <PrimaryBtn onClick={() => onNavigate('post-request')} style={{ fontSize: 15, padding: '13px 28px' }}>
          + Create New Request
        </PrimaryBtn>
      </div>

      <div className="two-col-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div style={{ background: C.softGreen, border: `1px solid ${C.border}`, borderRadius: 14, padding: 24, boxShadow: C.cardShadow }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>Recent Request</h3>
            {recentRequest && <Badge variant={recentRequest.status === 'COMPLETED' ? 'success' : recentRequest.status === 'NEGOTIATING' ? 'gold' : 'muted'}>{recentRequest.status}</Badge>}
          </div>
          {recentRequest ? <>
          <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
            <div style={{ width: 60, height: 60, background: C.softGreen, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.primary, flexShrink: 0 }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            </div>
            <div>
              <div style={{ fontSize: 17, fontWeight: 700, color: C.darkText }}>{recentRequest.material}</div>
              <div style={{ fontSize: 13, color: C.muted, marginTop: 3 }}>≈ {recentRequest.quantity_required} kg · {recentRequest.company_name || displayName}</div>
              <div style={{ fontSize: 12, color: C.muted, marginTop: 2, display: 'flex', gap: 4, alignItems: 'center' }}><Icon.pin /> {recentRequest.location}</div>
            </div>
          </div>
          <div style={{ fontSize: 12, color: C.muted, marginBottom: 12 }}>Created {formatDate(recentRequest.created_at)}</div>
          <button onClick={() => onNavigate('requests')} style={{ marginTop: 4, fontSize: 13, color: C.primary, fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: 4 }}>
            View request logs <Icon.arrowRight />
          </button>
          </> : <div style={{ color: C.muted, fontSize: 14, padding: '24px 0' }}>No requests created yet.</div>}
        </div>

        <div style={{ background: C.softGreen, border: `1.5px solid ${C.gold}`, borderRadius: 14, padding: 24, boxShadow: C.cardShadow, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 12, right: 12 }}><Badge variant="gold">Recommended</Badge></div>
          <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700 }}>Top Match for Your Request</h3>
          <div style={{ display: 'flex', gap: 14, marginBottom: 16 }}>
            <div style={{ width: 52, height: 52, background: C.softGreen, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 800, color: C.primary, flexShrink: 0 }}>GC</div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 16, fontWeight: 700, color: C.darkText }}>GreenCycle Kabadiwala</span>
                <VerifiedBadge />
              </div>
              <Stars rating={4.8} />
              <div style={{ fontSize: 12, color: C.muted, marginTop: 4, display: 'flex', gap: 12 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Icon.pin /> 1.2 km</span>
                <span style={{ color: C.success }}>● Available today</span>
              </div>
            </div>
          </div>
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 12, color: C.muted, marginBottom: 4 }}>Match Score</div>
            <MatchBar score={94} />
          </div>
          <div style={{ fontSize: 13, color: C.muted, marginBottom: 16, fontStyle: 'italic' }}>"Closest verified PET specialist available today."</div>
          <PrimaryBtn onClick={() => onNavigate('matches')} style={{ width: '100%' }}>View All Matches</PrimaryBtn>
        </div>
      </div>
    </div>
  );
}

// ─── Request Logs ─────────────────────────────────────────────────────────
function CompanyRequestLogs({ requirements, onCreate }: { requirements: RequirementItem[]; onCreate: () => void }) {
  const formatDate = (date: string) => new Date(date).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div className="view-transition" style={{ padding: '32px 32px' }}>
      <SectionHeading sub="All requests created by your company, newest first.">Request Logs</SectionHeading>
      <div style={{ marginBottom: 20 }}><PrimaryBtn onClick={onCreate}>+ Create New Request</PrimaryBtn></div>
      <div style={{ overflowX: 'auto', background: C.softGreen, border: `1px solid ${C.border}`, borderRadius: 14, boxShadow: C.cardShadow }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 720 }}>
          <thead><tr>{['Request ID', 'Material', 'Quantity', 'Budget Range', 'Status', 'Created Date'].map(label => (
            <th key={label} style={{ padding: '14px 16px', textAlign: 'left', fontSize: 12, color: C.muted, borderBottom: `1px solid ${C.border}`, whiteSpace: 'nowrap' }}>{label}</th>
          ))}</tr></thead>
          <tbody>
            {requirements.map(request => (
              <tr key={request.id}>
                <td style={{ padding: '14px 16px', fontSize: 12, color: C.muted, borderBottom: `1px solid ${C.border}` }}>{request.id}</td>
                <td style={{ padding: '14px 16px', fontSize: 14, fontWeight: 700, color: C.darkText, borderBottom: `1px solid ${C.border}` }}>{request.material}</td>
                <td style={{ padding: '14px 16px', fontSize: 13, color: C.darkText, borderBottom: `1px solid ${C.border}` }}>{request.quantity_required} kg</td>
                <td style={{ padding: '14px 16px', fontSize: 13, color: C.darkText, borderBottom: `1px solid ${C.border}` }}>₹{request.budget_min} - ₹{request.budget_max}</td>
                <td style={{ padding: '14px 16px', borderBottom: `1px solid ${C.border}` }}><Badge variant={request.status === 'COMPLETED' ? 'success' : request.status === 'NEGOTIATING' ? 'gold' : 'muted'}>{request.status}</Badge></td>
                <td style={{ padding: '14px 16px', fontSize: 13, color: C.muted, borderBottom: `1px solid ${C.border}`, whiteSpace: 'nowrap' }}>{formatDate(request.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {requirements.length === 0 && <div style={{ padding: 28, textAlign: 'center', color: C.muted, fontSize: 14 }}>No requests created yet.</div>}
      </div>
    </div>
  );
}

// ─── Post Request Form ─────────────────────────────────────────────────────
function PostRequestForm({ onSubmit }: { onSubmit: (request: RequirementItem) => void }) {
  const { user } = useAuth();
  const { addToast } = useStore();
  const [processing, setProcessing] = useState(false);
  const [companyName, setCompanyName] = useState(user?.company_name || '');
  const [materialType, setMaterialType] = useState('');
  const [minQty, setMinQty] = useState('');
  const [maxQty, setMaxQty] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState(user?.location || user?.company_profile?.location || '');

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setProcessing(true);
    try {
      const createdRequest = await requirementService.createRequirement({
        material_name: materialType,
        category: materialType.includes('Plastic') ? 'Plastic' : 'General',
        quantity_required: parseFloat(maxQty) || 20,
        budget_min: 250,
        budget_max: 350,
        description,
        location,
      });
      addToast('Material request posted to backend successfully!', 'success');
      onSubmit(createdRequest);
    } catch (err: any) {
      addToast(err.message || 'Failed to post requirement', 'error');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="view-transition" style={{ padding: '32px 32px', maxWidth: 780 }}>
      <SectionHeading sub="Tell us about the material and we'll find the best verified Kabadiwalas near you.">
        Post a Material Request
      </SectionHeading>
      {processing ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 340, gap: 24 }}>
          <div className="spinner" style={{ width: 52, height: 52, border: '4px solid rgba(33,100,74,0.15)', borderTopColor: C.primary, borderRadius: '50%' }} />
          <div style={{ fontSize: 17, fontWeight: 700, color: C.darkText }}>Finding Best Kabadiwalas…</div>
          <div style={{ fontSize: 14, color: C.muted }}>Analysing your request and matching with verified providers nearby.</div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
          <div style={{ background: C.softGreen, border: `1px solid ${C.border}`, borderRadius: 14, padding: 28, boxShadow: C.cardShadow }}>
            <h3 style={{ margin: '0 0 20px', fontSize: 15, fontWeight: 700, color: C.darkText, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: C.primary }}><Icon.building /></span> Company Information
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <FormField label="Company Name"><input style={inputStyle} value={companyName} onChange={e => setCompanyName(e.target.value)} /></FormField>
              <FormField label="Contact Person"><input style={inputStyle} defaultValue={user?.full_name || ''} /></FormField>
              <FormField label="Phone Number"><input style={inputStyle} /></FormField>
              <FormField label="Email Address"><input style={inputStyle} value={user?.email || ''} readOnly /></FormField>
              <FormField label="Location" hint="Full address helps match the nearest Kabadiwala">
                <input style={{ ...inputStyle, gridColumn: '1/-1' }} value={location} onChange={e => setLocation(e.target.value)} />
              </FormField>
            </div>
          </div>
          <div style={{ background: C.softGreen, border: `1px solid ${C.border}`, borderRadius: 14, padding: 28, boxShadow: C.cardShadow }}>
            <h3 style={{ margin: '0 0 20px', fontSize: 15, fontWeight: 700, color: C.darkText, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: C.primary }}><Icon.recycle /></span> Material Details
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <FormField label="Waste / Material Type">
                <select style={inputStyle} value={materialType} onChange={e => setMaterialType(e.target.value)}>
                  <option>PET Plastic</option><option>Cardboard</option><option>Aluminium</option>
                  <option>Glass</option><option>Paper</option><option>Metal</option><option>E-Waste</option>
                </select>
              </FormField>
              <FormField label="Approximate Quantity" hint="Enter weight in kg">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input style={{ ...inputStyle, flex: 1 }} placeholder="Min (kg)" value={minQty} onChange={e => setMinQty(e.target.value)} />
                  <span style={{ fontSize: 13, color: C.muted, flexShrink: 0 }}>to</span>
                  <input style={{ ...inputStyle, flex: 1 }} placeholder="Max (kg)" value={maxQty} onChange={e => setMaxQty(e.target.value)} />
                </div>
              </FormField>
              <FormField label="Description" hint="Optional: any details that help the Kabadiwala assess the material">
                <textarea style={{ ...inputStyle, minHeight: 80, resize: 'vertical', gridColumn: '1/-1' }} value={description} onChange={e => setDescription(e.target.value)} />
              </FormField>
            </div>
          </div>
          <PrimaryBtn loading={processing} style={{ fontSize: 15, padding: '14px 32px', alignSelf: 'flex-start' }}>
            Find Eligible Kabadiwalas →
          </PrimaryBtn>
        </form>
      )}
    </div>
  );
}

// ─── Ranked Matches ────────────────────────────────────────────────────────
function RankedMatches({ onSelect, onViewProfile }: { onSelect: (id: string) => void; onViewProfile: () => void }) {
  const [filters, setFilters] = useState({ today: false, verified: false, within5: false, highRating: false });
  const [rankedItems, setRankedItems] = useState<RankedKabadiwala[]>([]);
  const toggleFilter = (k: keyof typeof filters) => setFilters(f => ({ ...f, [k]: !f[k] }));

  useEffect(() => {
    async function fetchRanked() {
      try {
        const res = await transactionService.searchKabadiwalas({ material: 'PET Plastic' });
        if (res?.items) {
          setRankedItems(res.items);
        }
      } catch {
        // use fallback display
      }
    }
    fetchRanked();
  }, []);

  const filtered = KABADIWALAS.filter(k => {
    if (filters.today && !k.availableToday) return false;
    if (filters.verified && !k.verified) return false;
    if (filters.within5 && k.distanceNum > 5) return false;
    if (filters.highRating && k.rating < 4.5) return false;
    return true;
  });

  const chip = (label: string, key: keyof typeof filters) => (
    <button onClick={() => toggleFilter(key)} style={{
      padding: '6px 14px', borderRadius: 7, fontSize: 13, fontWeight: 600, cursor: 'pointer',
      border: filters[key] ? `1.5px solid ${C.primary}` : `1.5px solid ${C.border}`,
      background: filters[key] ? C.softGreen : C.white,
      color: filters[key] ? C.primary : C.muted, transition: 'all 0.12s',
    }}>{label}</button>
  );

  return (
    <div className="view-transition" style={{ padding: '32px 32px' }}>
      <SectionHeading sub="Ranked by waste-type compatibility, distance, availability, and rating via Visibility Score Engine.">
        Best Kabadiwalas for Your Request
      </SectionHeading>

      <div style={{ background: C.softGreen, border: `1px solid ${C.border}`, borderRadius: 12, padding: '16px 20px', marginBottom: 24, display: 'flex', gap: 32, flexWrap: 'wrap' }}>
        <div style={{ fontSize: 12, color: C.muted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', alignSelf: 'center' }}>Ranking weights:</div>
        {[['Waste-type Match', '35%', C.primary], ['Distance', '35%', C.gold], ['Rating', '30%', C.muted]].map(([l, v, c]) => (
          <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: c as string }} />
            <span style={{ fontSize: 13, color: C.darkText }}>{l}</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: c as string }}>{v}</span>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 24 }}>
        <span style={{ fontSize: 13, color: C.muted, alignSelf: 'center' }}>Filter:</span>
        {chip('Available Today', 'today')}{chip('Verified Only', 'verified')}
        {chip('Within 5 km', 'within5')}{chip('4.5+ Rating', 'highRating')}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {filtered.map((k, idx) => {
          const isTop = k.id === 'greencycle';
          return (
            <div key={k.id} style={{
              background: C.softGreen, border: isTop ? `1.5px solid ${C.gold}` : `1px solid ${C.border}`,
              borderRadius: 14, padding: '20px 24px', boxShadow: C.cardShadow,
              display: 'grid', gridTemplateColumns: '52px 1fr auto', gap: 20, alignItems: 'start', position: 'relative',
            }}>
              {isTop && <div style={{ position: 'absolute', top: -1, left: 20, background: C.gold, color: C.deepGreen, fontSize: 11, fontWeight: 800, padding: '3px 10px', borderRadius: '0 0 8px 8px', letterSpacing: '0.04em' }}>TOP MATCH</div>}
              <div style={{ width: 52, height: 52, background: C.softGreen, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 800, color: C.primary, marginTop: isTop ? 12 : 0, flexShrink: 0 }}>{k.initials}</div>
              <div style={{ marginTop: isTop ? 12 : 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
                  <span style={{ fontSize: 16, fontWeight: 700, color: C.darkText }}>{k.name}</span>
                  {k.verified && <VerifiedBadge />}
                  <span style={{ fontSize: 12, color: C.muted }}>#{idx + 1} match</span>
                </div>
                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 10 }}>
                  <Stars rating={k.rating} />
                  <span style={{ fontSize: 12, color: C.muted, display: 'flex', alignItems: 'center', gap: 3 }}><Icon.pin /> {k.distance}</span>
                  <span style={{ fontSize: 12, color: k.availableToday ? C.success : C.gold }}>● {k.availability}</span>
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
                  {k.materials.map(m => <Badge key={m} variant={m === 'PET Plastic' ? 'success' : 'muted'}>{m}</Badge>)}
                </div>
                <div style={{ maxWidth: 460 }}>
                  <div style={{ fontSize: 12, color: C.muted, marginBottom: 4 }}>Match Score</div>
                  <MatchBar score={k.matchScore} />
                </div>
                <div style={{ fontSize: 13, color: C.muted, marginTop: 8, fontStyle: 'italic' }}>"{k.whyMatch}"</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10, minWidth: 150, marginTop: isTop ? 12 : 0 }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 11, color: C.muted }}>Est. offer</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: C.gold }}>{k.estimatedOffer}</div>
                </div>
                <>
                  <PrimaryBtn onClick={() => onSelect(k.id)} style={{ width: '100%' }}>Select</PrimaryBtn>
                  <SecondaryBtn onClick={onViewProfile} style={{ width: '100%' }}>View Profile</SecondaryBtn>
                </>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Kabadiwala Profile (Company view) ────────────────────────────────────
function KabadiwalaProfileView({ onChoose }: { onChoose: () => void }) {
  const k = KABADIWALAS[0];
  return (
    <div className="view-transition" style={{ padding: '32px 32px', maxWidth: 820 }}>
      <SectionHeading>GreenCycle Kabadiwala – Profile</SectionHeading>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ background: C.softGreen, border: `1px solid ${C.border}`, borderRadius: 14, padding: 28, boxShadow: C.cardShadow }}>
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
            <div style={{ width: 80, height: 80, background: C.softGreen, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, fontWeight: 800, color: C.primary, flexShrink: 0 }}>GC</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
                <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>GreenCycle Kabadiwala</h2>
                <VerifiedBadge />
              </div>
              <div style={{ display: 'flex', gap: 20, marginTop: 10, flexWrap: 'wrap' }}>
                {[['342', 'Completed Deals'], ['127', 'Reviews'], ['2019', 'Member Since']].map(([v, l]) => (
                  <div key={l} style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 22, fontWeight: 800, color: C.darkText }}>{v}</div>
                    <div style={{ fontSize: 11, color: C.muted }}>{l}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 20 }}>
                <PrimaryBtn onClick={onChoose}>Select This Kabadiwala →</PrimaryBtn>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Payment Screen ────────────────────────────────────────────────────────
function PaymentScreen({ offerSent, onPaid }: { offerSent: boolean; onPaid: () => void }) {
  const [method, setMethod] = useState<'upi' | 'card' | 'bank'>('upi');
  const [processing, setProcessing] = useState(false);
  const [receipt, setReceipt] = useState(false);
  const [upiId, setUpiId] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');

  const handlePay = () => {
    setProcessing(true);
    setTimeout(() => { setProcessing(false); setReceipt(true); onPaid(); }, 2400);
  };

  if (receipt) {
    return (
      <div className="view-transition" style={{ padding: '32px 32px', maxWidth: 620 }}>
        <div style={{ textAlign: 'center', padding: '40px 32px', background: C.softGreen, border: `1px solid ${C.border}`, borderRadius: 20, boxShadow: C.cardShadow }}>
          <div style={{ width: 64, height: 64, background: C.softGreen, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: C.success }}>
            {Icon.checkCircle(32)}
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: C.darkText, margin: '0 0 8px' }}>Payment Successful</h2>
          <div style={{ fontSize: 36, fontWeight: 800, color: C.gold, margin: '16px 0' }}>₹320</div>
          <div style={{ fontSize: 14, color: C.muted, marginBottom: 24 }}>Paid securely via {method.toUpperCase()}</div>
          <div style={{ background: C.canvas, borderRadius: 12, padding: '20px 24px', textAlign: 'left', marginBottom: 24 }}>
            <h4 style={{ margin: '0 0 14px', fontSize: 13, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Transaction Receipt</h4>
            {[['Transaction ID', 'KC-TXN-20260908-8421'], ['Timestamp', '8 Sep 2026 · 11:37 AM IST'], ['Paid To', 'Punahachakra (Escrow)'], ['Kabadiwala', 'GreenCycle Kabadiwala'], ['Kabadiwala Payout', '₹304 (pending completion)'], ['Platform Commission', '₹16 (5%)']].map(([l, v]) => (
              <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: `1px solid ${C.border}` }}>
                <span style={{ fontSize: 13, color: C.muted }}>{l}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: C.darkText }}>{v}</span>
              </div>
            ))}
          </div>
          <div style={{ background: C.softGreen, borderRadius: 10, padding: '12px 16px', fontSize: 13, color: C.primary, fontWeight: 500, marginBottom: 24 }}>
            Your payment is held securely in escrow. GreenCycle Kabadiwala will receive ₹304 after marking material as Sold/Dropped.
          </div>
          <PrimaryBtn onClick={() => {}} style={{ width: '100%' }}>Track Request →</PrimaryBtn>
        </div>
      </div>
    );
  }

  return (
    <div className="view-transition" style={{ padding: '32px 32px', maxWidth: 640 }}>
      <SectionHeading sub="Review the offer and complete your payment securely.">Review Offer & Pay</SectionHeading>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ background: C.softGreen, border: `1px solid ${C.border}`, borderRadius: 14, padding: 24, boxShadow: C.cardShadow, display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 52, height: 52, background: C.softGreen, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 800, color: C.primary }}>GC</div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 16, fontWeight: 700 }}>GreenCycle Kabadiwala</span>
              <VerifiedBadge />
            </div>
            <Stars rating={4.8} />
          </div>
          <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
            <div style={{ fontSize: 12, color: C.muted }}>Offer Amount</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: C.gold }}>₹320</div>
          </div>
        </div>

        <div style={{ background: C.softGreen, border: `1px solid ${C.border}`, borderRadius: 14, padding: 24, boxShadow: C.cardShadow }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700 }}>Payment Breakdown</h3>
          {[['Material Value', '₹320', false], ['Platform Commission (5%)', '−₹16', false], ['Kabadiwala Payout', '₹304', true]].map(([l, v, bold]) => (
            <div key={l as string} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: `1px solid ${C.border}` }}>
              <span style={{ fontSize: 14, color: bold ? C.darkText : C.muted, fontWeight: bold ? 700 : 400 }}>{l}</span>
              <span style={{ fontSize: 14, fontWeight: bold ? 800 : 600, color: bold ? C.success : C.darkText }}>{v}</span>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 0 0', marginTop: 4 }}>
            <span style={{ fontSize: 16, fontWeight: 800, color: C.darkText }}>You Pay</span>
            <span style={{ fontSize: 24, fontWeight: 800, color: C.gold }}>₹320</span>
          </div>
        </div>

        <div style={{ background: C.softGreen, border: `1px solid ${C.border}`, borderRadius: 14, padding: 24, boxShadow: C.cardShadow }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700 }}>Payment Method</h3>
          <div style={{ display: 'flex', gap: 12, marginBottom: method === 'upi' ? 16 : 0 }}>
            {(['upi', 'card', 'bank'] as const).map(m => (
              <button key={m} onClick={() => setMethod(m)} style={{ flex: 1, padding: '12px', borderRadius: 10, border: method === m ? `2px solid ${C.primary}` : `1.5px solid ${C.border}`, background: method === m ? C.softGreen : C.white, cursor: 'pointer', fontSize: 13, fontWeight: 700, color: method === m ? C.primary : C.muted, transition: 'all 0.12s' }}>
                {m === 'upi' ? 'UPI' : m === 'card' ? 'Debit / Credit Card' : 'Bank Transfer'}
              </button>
            ))}
          </div>
          {method === 'upi' && (
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <span style={{ fontSize: 13, color: C.muted, flexShrink: 0 }}>UPI ID:</span>
              <input value={upiId} onChange={e => setUpiId(e.target.value)} placeholder="username@upi" style={{ ...inputStyle, flex: 1, fontFamily: 'monospace' }} />
            </div>
          )}
          {method === 'card' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <FormField label="Card Number"><input value={cardNumber} onChange={e => setCardNumber(e.target.value)} placeholder="•••• •••• •••• ••••" style={{ ...inputStyle, gridColumn: '1/-1', fontFamily: 'monospace' }} /></FormField>
              <FormField label="Expiry"><input value={expiry} onChange={e => setExpiry(e.target.value)} placeholder="MM/YY" style={inputStyle} /></FormField>
              <FormField label="CVV"><input type="password" inputMode="numeric" maxLength={4} value={cvv} onChange={e => setCvv(e.target.value)} style={inputStyle} placeholder="•••" /></FormField>
            </div>
          )}
          {method === 'bank' && (
            <div style={{ padding: '12px 14px', background: C.softGreen, borderRadius: 8, fontSize: 13, color: C.primary }}>
              Transfer to: <strong>Punahachakra Escrow A/C — IFSC: KCPL0001001</strong><br />
              Use reference: <strong>KC-REQ-20260908</strong>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: C.softGreen, borderRadius: 10 }}>
          <span style={{ color: C.primary }}>{Icon.shield()}</span>
          <span style={{ fontSize: 13, color: C.primary, fontWeight: 500 }}>Your payment is secured by Punahachakra's escrow. Funds are released only after completion.</span>
        </div>

        <PrimaryBtn onClick={handlePay} loading={processing} style={{ fontSize: 16, padding: '15px 32px' }}>
          {processing ? 'Processing…' : 'Pay ₹320 Securely'}
        </PrimaryBtn>
      </div>
    </div>
  );
}

// ─── Tracking Screen ───────────────────────────────────────────────────────
function TrackingScreen({ request }: { request?: RequirementItem }) {
  const statusOrder = ['ACTIVE', 'MATCHED', 'NEGOTIATING', 'COMPLETED', 'CANCELLED'];
  const statusIndex = request ? statusOrder.indexOf(request.status) : -1;
  const steps = statusOrder.map((status, index) => ({
    label: status,
    sub: index === 0 && request ? `${request.material} · ${request.quantity_required} kg · ${request.created_at}` : index <= statusIndex ? 'Recorded in the backend' : 'Pending',
    done: index <= statusIndex,
  }));

  return (
    <div className="view-transition" style={{ padding: '32px 32px', maxWidth: 680 }}>
      <SectionHeading sub="Real-time status of your material request.">Request Tracking</SectionHeading>
      {!request && <div style={{ color: C.muted, fontSize: 14, marginBottom: 20 }}>No request is available for tracking.</div>}
      {request && <div style={{ color: C.muted, fontSize: 13, marginBottom: 20 }}>Request ID: {request.id}</div>}
      <div style={{ background: C.softGreen, border: `1px solid ${C.border}`, borderRadius: 14, padding: '32px 32px', boxShadow: C.cardShadow, marginBottom: 20 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {steps.map((step, i) => (
            <div key={step.label} style={{ display: 'flex', gap: 20, position: 'relative' }}>
              {i < steps.length - 1 && <div style={{ position: 'absolute', left: 19, top: 38, width: 2, height: 'calc(100% - 18px)', background: step.done ? C.success : C.border }} />}
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: step.done ? C.success : C.white, border: `2px solid ${step.done ? C.success : C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, zIndex: 1 }}>
                {step.done ? <span style={{ color: C.white, fontSize: 14 }}>✓</span> : <span style={{ width: 10, height: 10, borderRadius: '50%', background: C.border, display: 'block' }} />}
              </div>
              <div style={{ paddingBottom: i < steps.length - 1 ? 32 : 0 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: step.done ? C.darkText : C.muted }}>{step.label}</div>
                <div style={{ fontSize: 13, color: C.muted, marginTop: 3 }}>{step.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ padding: '14px 18px', background: C.softGreen, borderRadius: 10, fontSize: 13, color: C.primary, display: 'flex', alignItems: 'center', gap: 8 }}>
        <span>{Icon.shield()}</span>
        All transactions on Punahachakra are permanently recorded and fully auditable.
      </div>
    </div>
  );
}

// ─── Company Profile page ──────────────────────────────────────────────────
function CompanyProfilePage() {
  const { user, refreshUser } = useAuth();
  const { addToast } = useStore();
  const [companyName, setCompanyName] = useState(user?.company_name || user?.company_profile?.company_name || '');
  const [location, setLocation] = useState(user?.location || user?.company_profile?.location || '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setCompanyName(user.company_name || user.company_profile?.company_name || '');
      setLocation(user.location || user.company_profile?.location || '');
    }
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await authService.updateCompanyProfile({ company_name: companyName, location });
      await refreshUser();
      addToast('Company profile saved to backend!', 'success');
    } catch (err: any) {
      addToast(err.message || 'Failed to update company profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  const displayName = user?.company_name || user?.company_profile?.company_name || user?.email?.split('@')[0] || 'Company Profile';
  const initials = displayName.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2) || 'CP';

  return (
    <div className="view-transition" style={{ padding: '32px 32px', maxWidth: 680 }}>
      <SectionHeading sub="Manage your company details and preferences.">Company Profile</SectionHeading>
      <div style={{ background: C.softGreen, border: `1px solid ${C.border}`, borderRadius: 14, padding: 28, boxShadow: C.cardShadow }}>
        <div style={{ display: 'flex', gap: 20, alignItems: 'center', marginBottom: 28 }}>
          <div style={{ width: 68, height: 68, background: C.primary, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 800, color: C.white }}>{initials}</div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, color: C.darkText }}>{displayName}</div>
            <div style={{ fontSize: 14, color: C.muted }}>{user?.email}</div>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <FormField label="Company Name"><input style={inputStyle} value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="Enter company name" /></FormField>
          <FormField label="Contact Email"><input style={inputStyle} value={user?.email || ''} readOnly /></FormField>
          <FormField label="Role"><input style={inputStyle} value={user?.role || 'COMPANY'} readOnly /></FormField>
          <FormField label="Location">
            <input style={inputStyle} value={location} onChange={e => setLocation(e.target.value)} placeholder="Enter location" />
          </FormField>
        </div>
        <div style={{ marginTop: 20 }}>
          <PrimaryBtn onClick={handleSave} loading={saving}>Save Changes</PrimaryBtn>
        </div>
      </div>
    </div>
  );
}

// ─── Company Portal ────────────────────────────────────────────────────────
export default function CompanyPortal() {
  const { user } = useAuth();
  const { offerSent, paymentComplete, addToast, setPaymentComplete } = useStore();
  const [view, setView] = useState<CompanyView>('dashboard');
  const [sidebarKey, setSidebarKey] = useState<SidebarKey>('dashboard');
  const [requirements, setRequirements] = useState<RequirementItem[]>([]);

  const loadRequirements = async () => {
    try {
      const response = await requirementService.getMyRequirements({ page: 1, page_size: 100 });
      setRequirements(response?.items || []);
    } catch (err: any) {
      addToast(err.message || 'Failed to load requests', 'error');
    }
  };

  useEffect(() => {
    loadRequirements();
  }, []);

  const avatarName = user?.company_name || user?.email?.split('@')[0] || 'Company';
  const avatarInitials = avatarName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'CP';

  const navigateTo = (v: CompanyView) => {
    setView(v);
    const map: Record<CompanyView, SidebarKey> = {
      dashboard: 'dashboard',
      'post-request': 'requests',
      requests: 'requests',
      matches: 'matches',
      'kabadiwala-profile': 'matches',
      'company-profile': 'profile',
      payment: 'payments',
      tracking: 'payments',
    };
    setSidebarKey(map[v]);
  };

  const handleSidebarNav = (key: string) => {
    const k = key as SidebarKey;
    setSidebarKey(k);
    const map: Record<SidebarKey, CompanyView> = {
      dashboard: 'dashboard',
      requests: 'post-request',
      matches: 'matches',
      payments: 'payment',
      profile: 'company-profile',
    };
    setView(map[k]);
  };

  const handleFormSubmit = async (_request: RequirementItem) => {
    await loadRequirements();
    navigateTo('requests');
    addToast('Request posted and added to your request logs.', 'success');
  };

  const handleSelectKabadiwala = (_id: string) => {
    navigateTo('kabadiwala-profile');
    addToast('GreenCycle Kabadiwala selected.', 'success');
  };

  const handleChoose = () => {
    navigateTo('payment');
    addToast('GreenCycle Kabadiwala chosen. Proceed to payment.', 'success');
  };

  const handlePaid = () => {
    setPaymentComplete(true);
    addToast('Payment of ₹320 completed successfully!', 'success');
  };

  return (
    <Shell
      role="company"
      navItems={NAV}
      activeKey={sidebarKey}
      onNav={handleSidebarNav}
      avatarInitials={avatarInitials}
      avatarName={avatarName}
    >
      {view === 'dashboard' && <CompanyDashboard onNavigate={navigateTo} requirements={requirements} />}
      {view === 'post-request' && <PostRequestForm onSubmit={handleFormSubmit} />}
      {view === 'requests' && <CompanyRequestLogs requirements={requirements} onCreate={() => navigateTo('post-request')} />}
      {view === 'matches' && <RankedMatches onSelect={handleSelectKabadiwala} onViewProfile={() => navigateTo('kabadiwala-profile')} />}
      {view === 'kabadiwala-profile' && <KabadiwalaProfileView onChoose={handleChoose} />}
      {view === 'company-profile' && <CompanyProfilePage />}
      {view === 'payment' && <PaymentScreen offerSent={offerSent} onPaid={handlePaid} />}
      {view === 'tracking' && <TrackingScreen request={requirements[0]} />}
    </Shell>
  );
}
