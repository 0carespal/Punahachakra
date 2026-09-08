import React, { useState, useEffect } from 'react';
import { Shell } from '../components/Shell';
import { Stars, StatCard, Badge, PrimaryBtn, SectionHeading, FormField, inputStyle } from '../components/ui';
import { Icon } from '../lib/icons';
import { C } from '../lib/constants';
import { useStore } from '../context/store';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/auth.service';
import { negotiationService, NegotiationItem } from '../services/negotiation.service';
import { inventoryService } from '../services/inventory.service';
import { ratingService } from '../services/rating.service';

type KabadiwalaView = 'dashboard' | 'inventory' | 'negotiations' | 'ratings' | 'profile' | 'request-detail' | 'offers-sent' | 'earnings';
type SidebarKey = 'dashboard' | 'inventory' | 'negotiations' | 'ratings' | 'profile';

const NAV = [
  { key: 'dashboard' as SidebarKey, label: 'Dashboard', Icon: Icon.dashboard },
  { key: 'inventory' as SidebarKey, label: 'Inventory', Icon: Icon.recycle },
  { key: 'negotiations' as SidebarKey, label: 'Negotiations', Icon: Icon.requests },
  { key: 'ratings' as SidebarKey, label: 'Ratings', Icon: Icon.star },
  { key: 'profile' as SidebarKey, label: 'My Profile', Icon: Icon.profile },
];

// ─── Kabadiwala Profile Page ───────────────────────────────────────────────
function KabadiwalaProfilePage() {
  const { user, refreshUser } = useAuth();
  const { addToast } = useStore();
  const [fullName, setFullName] = useState(user?.full_name || user?.kabadiwala_profile?.full_name || '');
  const [location, setLocation] = useState(user?.location || user?.kabadiwala_profile?.location || '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(user.full_name || user.kabadiwala_profile?.full_name || '');
      setLocation(user.location || user.kabadiwala_profile?.location || '');
    }
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await authService.updateKabadiwalaProfile({ full_name: fullName, location });
      await refreshUser();
      addToast('Profile saved to backend successfully!', 'success');
    } catch (err: any) {
      addToast(err.message || 'Failed to save profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  const displayName = user?.full_name || user?.kabadiwala_profile?.full_name || user?.email?.split('@')[0] || 'Kabadiwala Profile';
  const initials = displayName.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2) || 'KP';
  const rating = user?.kabadiwala_profile?.average_rating || 5.0;

  return (
    <div className="view-transition" style={{ padding: '32px 32px', maxWidth: 700 }}>
      <SectionHeading sub="Your verified profile on Punahachakra.">My Profile</SectionHeading>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 14, padding: 28, boxShadow: C.cardShadow }}>
          <div style={{ display: 'flex', gap: 20, alignItems: 'center', marginBottom: 24 }}>
            <div style={{ width: 72, height: 72, background: C.softGreen, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 800, color: C.primary }}>{initials}</div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 800, color: C.darkText }}>{displayName}</div>
              <div style={{ fontSize: 14, color: C.muted }}>{user?.email}</div>
              <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: C.softGreen, color: C.primary, padding: '2px 8px', borderRadius: 5, fontSize: 11, fontWeight: 700 }}>
                  {Icon.shield()}<span>VERIFIED</span>
                </span>
                <Stars rating={rating} />
              </div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <FormField label="Full / Business Name"><input style={inputStyle} value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Enter full name" /></FormField>
            <FormField label="Email"><input style={inputStyle} value={user?.email || ''} readOnly /></FormField>
            <FormField label="Role"><input style={inputStyle} value={user?.role || 'KABADIWALA'} readOnly /></FormField>
            <FormField label="Location"><input style={inputStyle} value={location} onChange={e => setLocation(e.target.value)} placeholder="Enter location" /></FormField>
          </div>
          <div style={{ marginTop: 20 }}>
            <PrimaryBtn onClick={handleSave} loading={saving}>Save Changes</PrimaryBtn>
          </div>
        </div>

        <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 14, padding: 24, boxShadow: C.cardShadow }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700 }}>Verification Status</h3>
          {['Identity Verified', 'Bank Account Verified', 'Secure Payments Enabled'].map(item => (
            <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: `1px solid ${C.border}` }}>
              <span style={{ color: C.success }}>{Icon.checkCircle(16)}</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: C.darkText }}>{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Assigned Requests ─────────────────────────────────────────────────────
function AssignedRequests({ offerSent, onViewDetail }: { offerSent: boolean; onViewDetail: () => void }) {
  const { user } = useAuth();
  const displayName = user?.full_name || 'GreenCycle';

  return (
    <div className="view-transition" style={{ padding: '32px 32px' }}>
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 12, color: C.muted, marginBottom: 4 }}>Tuesday, 8 September 2026</div>
        <h1 style={{ fontSize: 30, fontWeight: 800, color: C.darkText, margin: 0 }}>Welcome, {displayName}</h1>
        <p style={{ fontSize: 15, color: C.muted, margin: '6px 0 0' }}>You have active requests. Check offers and earnings below.</p>
      </div>

      <div className="stat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32 }}>
        <StatCard label="Assigned Requests" value="1" sub="ABC Office Solutions" bg={C.white} />
        <StatCard label="Pending Offers" value={offerSent ? '0' : '1'} sub={offerSent ? 'Offer sent' : 'Needs your response'} bg={C.white} />
        <StatCard label="Avg. Rating" value="4.8" sub="127 reviews" bg={C.white} />
      </div>

      <div className="two-col-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 14, padding: 24, boxShadow: C.cardShadow }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700 }}>Verification Status</h3>
          {['Identity Verified', 'Bank Account Verified', 'Secure Payments Enabled'].map(item => (
            <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: `1px solid ${C.border}` }}>
              <span style={{ color: C.success }}>{Icon.checkCircle(16)}</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: C.darkText }}>{item}</span>
            </div>
          ))}
        </div>

        <div style={{ background: C.white, border: `1.5px solid ${C.gold}`, borderRadius: 14, padding: 24, boxShadow: C.cardShadow }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>Assigned Request</h3>
            <Badge variant={offerSent ? 'gold' : 'muted'}>{offerSent ? 'Offer Sent' : 'New'}</Badge>
          </div>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.darkText }}>PET Plastic · ~20 kg</div>
          <div style={{ fontSize: 13, color: C.muted, margin: '4px 0 8px' }}>ABC Office Solutions · Malviya Nagar, Jaipur</div>
          <div style={{ fontSize: 13, color: C.muted, marginBottom: 16 }}>Contact: Aryan Dahiwal · +91 98765 43210</div>
          <PrimaryBtn onClick={onViewDetail} style={{ width: '100%' }}>
            {offerSent ? 'View Offer Status' : 'Review Request'}
          </PrimaryBtn>
        </div>
      </div>
    </div>
  );
}

// ─── Request Detail ────────────────────────────────────────────────────────
function RequestDetail({ offerSent }: { offerSent: boolean }) {
  const [decision, setDecision] = useState<'accepted' | 'denied' | null>(null);
  const { addToast } = useStore();

  const handleAccept = () => {
    setDecision('accepted');
    addToast('Request accepted!', 'success');
  };

  const handleDeny = () => {
    setDecision('denied');
    addToast('Request denied.', 'info');
  };

  return (
    <div className="view-transition" style={{ padding: '32px 32px', maxWidth: 700 }}>
      <SectionHeading sub="Review the full details of this material request.">
        Request from ABC Office Solutions
      </SectionHeading>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 14, padding: 24, boxShadow: C.cardShadow }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700 }}>Company Details</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {[['Company', 'ABC Office Solutions'], ['Phone', '+91 98765 43210'], ['Location', 'Malviya Nagar, Jaipur, Rajasthan'], ['Request Date', '8 Sep 2026, 10:15 AM']].map(([l, v]) => (
              <div key={l}>
                <div style={{ fontSize: 12, color: C.muted }}>{l}</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: C.darkText }}>{v}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 14, padding: 24, boxShadow: C.cardShadow }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700 }}>Material Information</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
            {[['Waste Type', 'PET Plastic'], ['Approx. Quantity', '20 kg'], ['Status', offerSent ? 'Offer Sent' : 'Awaiting Your Offer']].map(([l, v]) => (
              <div key={l}>
                <div style={{ fontSize: 12, color: C.muted }}>{l}</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: l === 'Status' && offerSent ? C.success : C.darkText }}>{v}</div>
              </div>
            ))}
          </div>
          <div>
            <div style={{ fontSize: 12, color: C.muted, marginBottom: 4 }}>Description</div>
            <div style={{ fontSize: 14, color: C.darkText, lineHeight: 1.6 }}>Mixed PET plastic bottles and containers from office pantry. Cleaned and bagged.</div>
          </div>
        </div>

        {/* Accept / Deny */}
        {!offerSent && (
          decision === null ? (
            <div style={{ background: C.white, border: `1.5px solid ${C.border}`, borderRadius: 14, padding: 24, boxShadow: C.cardShadow }}>
              <h3 style={{ margin: '0 0 6px', fontSize: 15, fontWeight: 700 }}>Respond to Request</h3>
              <p style={{ margin: '0 0 20px', fontSize: 13, color: C.muted }}>Do you want to accept this request and proceed with an offer, or decline it?</p>
              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  onClick={handleAccept}
                  style={{ flex: 1, padding: '13px 0', borderRadius: 10, border: 'none', background: C.primary, color: C.white, fontSize: 15, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'opacity 0.15s' }}
                >
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  Accept Request
                </button>
                <button
                  onClick={handleDeny}
                  style={{ flex: 1, padding: '13px 0', borderRadius: 10, border: `1.5px solid ${C.error ?? '#DC2626'}`, background: C.white, color: C.error ?? '#DC2626', fontSize: 15, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'background 0.15s' }}
                >
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  Deny Request
                </button>
              </div>
            </div>
          ) : decision === 'accepted' ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '16px 20px', background: C.softGreen, border: `1.5px solid #B8D9C8`, borderRadius: 12 }}>
              <span style={{ color: C.success }}>{Icon.checkCircle(20)}</span>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: C.success }}>Request Accepted</div>
                <div style={{ fontSize: 13, color: C.muted, marginTop: 2 }}>Head to "Offers Sent" to upload an asset image and send your price offer.</div>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '16px 20px', background: '#FEF2F2', border: `1.5px solid #FECACA`, borderRadius: 12 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#DC2626' }}>Request Denied</div>
                <div style={{ fontSize: 13, color: C.muted, marginTop: 2 }}>You have declined this request. ABC Office Solutions will be notified.</div>
              </div>
              <button onClick={() => setDecision(null)} style={{ marginLeft: 'auto', fontSize: 12, color: C.muted, background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontWeight: 600, flexShrink: 0 }}>Undo</button>
            </div>
          )
        )}

        {offerSent && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 18px', background: C.softGreen, border: `1px solid #B8D9C8`, borderRadius: 10 }}>
            <span style={{ color: C.success }}>{Icon.checkCircle(18)}</span>
            <span style={{ fontSize: 13, fontWeight: 500, color: C.success }}>
              Offer of ₹320 sent — waiting for ABC Office Solutions to accept and pay.
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Send Offer (Offers Sent) ──────────────────────────────────────────────
function OffersSent({ onOfferSent, offerSent }: { onOfferSent: () => void; offerSent: boolean }) {
  const [priceMin, setPriceMin] = useState('300');
  const [priceMax, setPriceMax] = useState('340');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(offerSent);
  const [imageUploaded, setImageUploaded] = useState(false);
  const { addToast } = useStore();

  const handleSend = async () => {
    setSending(true);
    try {
      setSent(true);
      onOfferSent();
    } catch (err: any) {
      addToast(err.message || 'Failed to send offer', 'error');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="view-transition" style={{ padding: '32px 32px', maxWidth: 640 }}>
      <SectionHeading sub="Upload an image of the material and send your price offer to the company.">
        Send Offer
      </SectionHeading>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 14, padding: 24, boxShadow: C.cardShadow }}>
          <h3 style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 700 }}>Asset Image</h3>
          {imageUploaded ? (
            <div style={{ position: 'relative', background: C.softGreen, borderRadius: 10, padding: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 64, height: 64, background: C.primary, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: C.darkText }}>asset_photo.jpg</div>
                <div style={{ fontSize: 12, color: C.muted }}>Uploaded successfully</div>
                <button onClick={() => setImageUploaded(false)} style={{ marginTop: 4, fontSize: 12, color: C.error, background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontWeight: 600 }}>Remove</button>
              </div>
              <span style={{ position: 'absolute', top: 14, right: 16, color: C.success }}>{Icon.checkCircle(20)}</span>
            </div>
          ) : (
            <div
              onClick={() => setImageUploaded(true)}
              style={{ border: `2px dashed ${C.border}`, borderRadius: 10, padding: '36px 20px', textAlign: 'center', cursor: 'pointer', transition: 'border-color 0.15s, background 0.15s' }}
            >
              <div style={{ color: C.muted, marginBottom: 10 }}>{Icon.upload()}</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: C.darkText, marginBottom: 4 }}>Click to upload asset image</div>
              <div style={{ fontSize: 12, color: C.muted }}>JPG, PNG up to 5 MB</div>
            </div>
          )}
        </div>

        {sent ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '22px 24px', background: C.softGreen, border: `1.5px solid ${C.success}`, borderRadius: 14 }}>
            <span style={{ color: C.success }}>{Icon.checkCircle(28)}</span>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: C.success }}>Offer of ₹{priceMin}–₹{priceMax} sent successfully</div>
              <div style={{ fontSize: 13, color: C.muted, marginTop: 2 }}>ABC Office Solutions has been notified and will review your offer.</div>
            </div>
          </div>
        ) : (
          <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 14, padding: 28, boxShadow: C.cardShadow }}>
            <h3 style={{ margin: '0 0 6px', fontSize: 15, fontWeight: 700 }}>Proposed Selling Price</h3>
            <p style={{ margin: '0 0 20px', fontSize: 13, color: C.muted }}>Set the price you're proposing to sell this material for.</p>
            <div style={{ display: 'flex', gap: 14, alignItems: 'flex-end', flexWrap: 'wrap' }}>
              <FormField label="Offer Amount Range (₹)">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span style={{ padding: '10px 14px', background: C.softGreen, border: `1.5px solid ${C.border}`, borderRight: 'none', borderRadius: '8px 0 0 8px', fontSize: 16, fontWeight: 700, color: C.primary }}>₹</span>
                    <input value={priceMin} onChange={e => setPriceMin(e.target.value)} style={{ ...inputStyle, borderRadius: '0 8px 8px 0', width: 110, fontSize: 18, fontWeight: 800 }} placeholder="Min" />
                  </div>
                  <span style={{ fontSize: 13, color: C.muted, flexShrink: 0 }}>to</span>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span style={{ padding: '10px 14px', background: C.softGreen, border: `1.5px solid ${C.border}`, borderRight: 'none', borderRadius: '8px 0 0 8px', fontSize: 16, fontWeight: 700, color: C.primary }}>₹</span>
                    <input value={priceMax} onChange={e => setPriceMax(e.target.value)} style={{ ...inputStyle, borderRadius: '0 8px 8px 0', width: 110, fontSize: 18, fontWeight: 800 }} placeholder="Max" />
                  </div>
                </div>
              </FormField>
              <PrimaryBtn onClick={handleSend} loading={sending} style={{ fontSize: 15, padding: '12px 28px' }}>
                {sending ? 'Sending…' : 'Send Offer'}
              </PrimaryBtn>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Earnings / Completion ─────────────────────────────────────────────────
function EarningsScreen({ paymentComplete, materialDropped, onDropped }: { paymentComplete: boolean; materialDropped: boolean; onDropped: () => void }) {
  const [dropping, setDropping] = useState(false);
  const { addToast } = useStore();

  const handleDrop = async () => {
    setDropping(true);
    try {
      onDropped();
    } catch (err: any) {
      addToast(err.message || 'Failed to complete deal', 'error');
    } finally {
      setDropping(false);
    }
  };

  if (!paymentComplete) {
    return (
      <div className="view-transition" style={{ padding: '32px 32px', maxWidth: 600 }}>
        <SectionHeading>Earnings & Completion</SectionHeading>
        <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 14, padding: 40, boxShadow: C.cardShadow, textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⏳</div>
          <h3 style={{ margin: '0 0 8px' }}>Waiting for Payment</h3>
          <p style={{ color: C.muted, fontSize: 14 }}>This screen will update once ABC Office Solutions completes payment. Switch to the Company portal to make the payment.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="view-transition" style={{ padding: '32px 32px', maxWidth: 640 }}>
      <SectionHeading sub="Payment received. Mark the material as sold/dropped to complete the deal.">
        Earnings & Completion
      </SectionHeading>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ background: C.white, border: `1.5px solid ${C.success}`, borderRadius: 14, padding: 24, boxShadow: C.cardShadow }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <span style={{ color: C.success }}>{Icon.checkCircle(28)}</span>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: C.success }}>Payment Confirmed</div>
              <div style={{ fontSize: 13, color: C.muted }}>Received 8 Sep 2026 · 11:37 AM IST</div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {[['Agreed Material Value', '₹320'], ['Platform Commission (5%)', '−₹16']].map(([l, v]) => (
              <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: `1px solid ${C.border}` }}>
                <span style={{ fontSize: 14, color: C.muted }}>{l}</span>
                <span style={{ fontSize: 14, fontWeight: 600, color: C.darkText }}>{v}</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 0 0' }}>
              <span style={{ fontSize: 16, fontWeight: 700 }}>Your Payout</span>
              <span style={{ fontSize: 28, fontWeight: 800, color: C.gold }}>₹304</span>
            </div>
          </div>
          <div style={{ marginTop: 16, padding: '12px 16px', background: C.softGreen, borderRadius: 8, fontSize: 13, color: C.primary }}>
            Payout of ₹304 will be credited to your verified bank account within 24 hours of marking completion.
          </div>
        </div>

        {!materialDropped ? (
          <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 14, padding: 24, boxShadow: C.cardShadow }}>
            <h3 style={{ margin: '0 0 8px', fontSize: 15, fontWeight: 700 }}>Complete the Deal</h3>
            <p style={{ fontSize: 14, color: C.muted, margin: '0 0 20px' }}>Once you have sold or dropped the PET plastic material, mark it as complete below. This releases the payout to your bank account.</p>
            <PrimaryBtn onClick={handleDrop} loading={dropping} style={{ fontSize: 15, padding: '14px 32px' }}>
              {dropping ? 'Updating…' : 'Mark Material as Sold/Dropped'}
            </PrimaryBtn>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '20px 24px', background: C.softGreen, border: `1.5px solid ${C.success}`, borderRadius: 14 }}>
              <span style={{ color: C.success }}>{Icon.checkCircle(28)}</span>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: C.success }}>Material marked as Sold/Dropped</div>
                <div style={{ fontSize: 13, color: C.muted }}>Deal complete · ₹304 payout initiated to your bank account.</div>
              </div>
            </div>
            <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 14, padding: 24, boxShadow: C.cardShadow }}>
              <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700 }}>Earnings History</h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0' }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>PET Plastic · ABC Office Solutions</div>
                  <div style={{ fontSize: 12, color: C.muted }}>8 Sep 2026 · Sold/Dropped · TXN: KC-TXN-20260908-8421</div>
                  <Badge variant="success">Completed</Badge>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: C.gold }}>₹304</div>
                  <div style={{ fontSize: 11, color: C.muted }}>Credited to bank</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Kabadiwala Inventory Component ──────────────────────────────────────────
function KabadiwalaInventory() {
  const { addToast } = useStore();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [matName, setMatName] = useState('PET Plastic');
  const [category, setCategory] = useState('Plastic');
  const [qty, setQty] = useState('50');
  const [priceMin, setPriceMin] = useState('15');
  const [priceMax, setPriceMax] = useState('20');
  const [saving, setSaving] = useState(false);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const data = await inventoryService.getMyInventory();
      setItems(data?.items || []);
    } catch {
      // Fallback display
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await inventoryService.createInventory({
        material_name: matName,
        category,
        quantity: parseFloat(qty) || 50,
        price_range_min: parseFloat(priceMin) || 15,
        price_range_max: parseFloat(priceMax) || 20,
      });
      addToast('Inventory item added successfully!', 'success');
      setShowAdd(false);
      fetchItems();
    } catch (err: any) {
      addToast(err.message || 'Failed to add inventory item', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="view-transition" style={{ padding: '32px 32px' }}>
      <SectionHeading sub="Manage your waste stock inventory and available materials.">
        Waste Inventory Management
      </SectionHeading>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Your Material Stock</h3>
        <PrimaryBtn onClick={() => setShowAdd(!showAdd)}>
          {showAdd ? 'Cancel' : '+ Add Stock Item'}
        </PrimaryBtn>
      </div>

      {showAdd && (
        <form onSubmit={handleAdd} style={{ background: C.white, border: `1.5px solid ${C.primary}`, borderRadius: 14, padding: 24, marginBottom: 24, boxShadow: C.cardShadow }}>
          <h4 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 700 }}>Add New Inventory Stock</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <FormField label="Material Name"><input style={inputStyle} value={matName} onChange={e => setMatName(e.target.value)} placeholder="e.g. PET Plastic" /></FormField>
            <FormField label="Category"><input style={inputStyle} value={category} onChange={e => setCategory(e.target.value)} placeholder="e.g. Plastic, Paper, Metal" /></FormField>
            <FormField label="Quantity (kg)"><input style={inputStyle} type="number" value={qty} onChange={e => setQty(e.target.value)} /></FormField>
            <FormField label="Price Range (₹/kg)">
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input style={{ ...inputStyle, flex: 1 }} type="number" value={priceMin} onChange={e => setPriceMin(e.target.value)} placeholder="Min" />
                <span>-</span>
                <input style={{ ...inputStyle, flex: 1 }} type="number" value={priceMax} onChange={e => setPriceMax(e.target.value)} placeholder="Max" />
              </div>
            </FormField>
          </div>
          <PrimaryBtn loading={saving} style={{ padding: '10px 24px' }}>Save Inventory</PrimaryBtn>
        </form>
      )}

      {loading ? (
        <div style={{ padding: 40, textAlign: 'center', color: C.muted }}>Loading inventory…</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {[
            { id: '1', material: 'PET Plastic', category: 'Plastic', quantity: 50, min: 15, max: 20 },
            { id: '2', material: 'Corrugated Cardboard', category: 'Paper', quantity: 120, min: 8, max: 12 },
            { id: '3', material: 'Aluminum Cans', category: 'Metal', quantity: 35, min: 95, max: 110 },
            ...items,
          ].map((item, idx) => (
            <div key={item.id || idx} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20, boxShadow: C.cardShadow }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <Badge variant="gold">{item.category}</Badge>
                <span style={{ fontSize: 12, color: C.muted }}>In Stock</span>
              </div>
              <div style={{ fontSize: 16, fontWeight: 700, color: C.darkText, marginBottom: 4 }}>{item.material}</div>
              <div style={{ fontSize: 14, color: C.primary, fontWeight: 600, marginBottom: 8 }}>{item.quantity} kg</div>
              <div style={{ fontSize: 13, color: C.muted }}>Rate: ₹{item.min || item.price_range_min} - ₹{item.max || item.price_range_max} / kg</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Kabadiwala Negotiations Component ───────────────────────────────────────
function KabadiwalaNegotiations({ offerSent, onViewDetail }: { offerSent: boolean; onViewDetail: () => void }) {
  return (
    <div className="view-transition" style={{ padding: '32px 32px' }}>
      <SectionHeading sub="Review ongoing negotiations and price proposals with corporate clients.">
        Active Negotiations
      </SectionHeading>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 720 }}>
        <div style={{ background: C.white, border: `1.5px solid ${C.gold}`, borderRadius: 14, padding: 24, boxShadow: C.cardShadow }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Badge variant={offerSent ? 'gold' : 'muted'}>{offerSent ? 'Offer Sent' : 'Action Required'}</Badge>
            <span style={{ fontSize: 12, color: C.muted }}>Updated today</span>
          </div>
          <h4 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 700 }}>PET Plastic Waste (20 kg)</h4>
          <div style={{ fontSize: 13, color: C.muted, marginBottom: 12 }}>Client: Corporate Partner · Malviya Nagar</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTop: `1px solid ${C.border}` }}>
            <div>
              <div style={{ fontSize: 12, color: C.muted }}>Proposed Rate</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: C.primary }}>₹300 – ₹340 total</div>
            </div>
            <PrimaryBtn onClick={onViewDetail}>Review Negotiation</PrimaryBtn>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Kabadiwala Ratings Component ──────────────────────────────────────────
function KabadiwalaRatings() {
  const { user } = useAuth();
  const rating = user?.kabadiwala_profile?.average_rating || 4.8;
  return (
    <div className="view-transition" style={{ padding: '32px 32px', maxWidth: 720 }}>
      <SectionHeading sub="Ratings and reviews given by corporate partners after completed pickups.">
        Ratings & Feedback
      </SectionHeading>

      <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 14, padding: 24, boxShadow: C.cardShadow, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 24 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 40, fontWeight: 800, color: C.gold }}>{rating.toFixed(1)}</div>
          <Stars rating={rating} />
          <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>127 ratings</div>
        </div>
        <div style={{ borderLeft: `1px solid ${C.border}`, paddingLeft: 24, flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.darkText, marginBottom: 4 }}>Visibility Ranking Score: Top 5%</div>
          <p style={{ fontSize: 13, color: C.muted, margin: 0 }}>High rating boosts your ranking position when companies search for nearby waste buyers.</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {[
          { company: 'ABC Office Solutions', stars: 5, review: 'Prompt pickup, very courteous and weighed the PET bottles accurately.', date: '8 Sep 2026' },
          { company: 'Jaipur Eco Tech', stars: 5, review: 'Reliable service and instant payment confirmation.', date: '2 Sep 2026' },
          { company: 'Urban Spaces Ltd', stars: 4, review: 'Good service, on time arrival.', date: '24 Aug 2026' },
        ].map((r, i) => (
          <div key={i} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: 18, boxShadow: C.cardShadow }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: C.darkText }}>{r.company}</span>
              <span style={{ fontSize: 12, color: C.muted }}>{r.date}</span>
            </div>
            <Stars rating={r.stars} />
            <p style={{ fontSize: 13, color: C.muted, margin: '8px 0 0', lineHeight: 1.4 }}>"{r.review}"</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Kabadiwala Portal ─────────────────────────────────────────────────────
export default function KabadiwalaPortal() {
  const { user } = useAuth();
  const { offerSent, paymentComplete, materialDropped, addToast, setOfferSent, setMaterialDropped, setNotifications } = useStore();
  const [view, setView] = useState<KabadiwalaView>('dashboard');
  const [sidebarKey, setSidebarKey] = useState<SidebarKey>('dashboard');

  const avatarName = user?.full_name || user?.email?.split('@')[0] || 'Kabadiwala';
  const avatarInitials = avatarName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'GC';

  const navigateTo = (v: KabadiwalaView) => {
    setView(v);
    const map: Record<KabadiwalaView, SidebarKey> = {
      dashboard: 'dashboard',
      inventory: 'inventory',
      negotiations: 'negotiations',
      ratings: 'ratings',
      profile: 'profile',
      'request-detail': 'dashboard',
      'offers-sent': 'negotiations',
      earnings: 'dashboard',
    };
    setSidebarKey(map[v]);
  };

  const handleSidebarNav = (key: string) => {
    const k = key as SidebarKey;
    setSidebarKey(k);
    const map: Record<SidebarKey, KabadiwalaView> = {
      dashboard: 'dashboard',
      inventory: 'inventory',
      negotiations: 'negotiations',
      ratings: 'ratings',
      profile: 'profile',
    };
    setView(map[k]);
  };

  const handleOfferSent = () => {
    setOfferSent(true);
    setNotifications(n => n + 1);
    addToast('Offer of ₹320 sent to ABC Office Solutions.', 'success');
  };

  const handleDropped = () => {
    setMaterialDropped(true);
    addToast('Material marked as Sold/Dropped. Payout initiated!', 'success');
  };

  return (
    <Shell
      role="kabadiwala"
      navItems={NAV}
      activeKey={sidebarKey}
      onNav={handleSidebarNav}
      avatarInitials={avatarInitials}
      avatarName={avatarName}
    >
      {view === 'dashboard' && <AssignedRequests offerSent={offerSent} onViewDetail={() => navigateTo('request-detail')} />}
      {view === 'inventory' && <KabadiwalaInventory />}
      {view === 'negotiations' && <KabadiwalaNegotiations offerSent={offerSent} onViewDetail={() => navigateTo('request-detail')} />}
      {view === 'ratings' && <KabadiwalaRatings />}
      {view === 'profile' && <KabadiwalaProfilePage />}
      {view === 'request-detail' && <RequestDetail offerSent={offerSent} />}
      {view === 'offers-sent' && <OffersSent onOfferSent={handleOfferSent} offerSent={offerSent} />}
      {view === 'earnings' && <EarningsScreen paymentComplete={paymentComplete} materialDropped={materialDropped} onDropped={handleDropped} />}
    </Shell>
  );
}
