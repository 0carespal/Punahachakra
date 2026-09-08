import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { C } from '../lib/constants';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/store';
import { tokenStorage } from '../services/tokenStorage';


// ─── Helpers ──────────────────────────────────────────────────────────────────

const inputBase: React.CSSProperties = {
  width: '100%', padding: '11px 14px', borderRadius: 8,
  border: `1.5px solid ${C.border}`, fontSize: 14, color: C.darkText,
  background: C.white, outline: 'none', boxSizing: 'border-box',
  fontFamily: "inherit", transition: 'border-color 0.15s, box-shadow 0.15s',
};

function validate(name: string, value: string): string {
  switch (name) {
    case 'phone':
      return /^\d{10}$/.test(value) ? '' : 'Enter a valid 10-digit phone number';
    case 'email':
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? '' : 'Enter a valid email address';
    case 'pan':
      return /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(value.toUpperCase()) ? '' : 'Format: ABCDE1234F';
    case 'aadhaar':
      return /^\d{12}$/.test(value) ? '' : 'Aadhaar must be exactly 12 digits';
    case 'gstin':
      return /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test(value.toUpperCase())
        ? '' : '15-character GST format (e.g. 08ABCDE1234F1Z5)';
    case 'ifsc':
      return /^[A-Z]{4}0[A-Z0-9]{6}$/.test(value.toUpperCase()) ? '' : 'Format: ABCD0123456';
    case 'bankAccount':
      return /^\d{9,18}$/.test(value) ? '' : 'Enter a valid account number';
    case 'password':
      return value.length >= 8 ? '' : 'Password must be at least 8 characters';
    case 'confirmPassword':
      return ''; // handled separately
    case 'fullName':
    case 'companyName':
    case 'accountHolderName':
      return value.trim().length >= 2 ? '' : 'This field is required';
    default:
      return '';
  }
}

function passwordStrength(pw: string): { score: number; label: string; color: string } {
  if (!pw) return { score: 0, label: '', color: C.border };
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 1) return { score: 1, label: 'Weak', color: C.error };
  if (score <= 3) return { score: 2, label: 'Medium', color: C.gold };
  return { score: 3, label: 'Strong', color: C.success };
}

function maskAadhaar(raw: string): string {
  if (raw.length <= 4) return raw;
  return 'XXXX XXXX ' + raw.slice(-4);
}

// ─── Field Component ──────────────────────────────────────────────────────────

interface FieldProps {
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}

function Field({ label, error, hint, children }: FieldProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 13, fontWeight: 600, color: C.darkText }}>{label}</label>
      {children}
      {error && <span style={{ fontSize: 12, color: C.error, fontWeight: 500 }}>{error}</span>}
      {!error && hint && <span style={{ fontSize: 12, color: C.muted }}>{hint}</span>}
    </div>
  );
}

// ─── Password Input ───────────────────────────────────────────────────────────

function PasswordInput({ value, onChange, onBlur, name, placeholder = 'Password', hasError }: {
  value: string; onChange: (v: string) => void; onBlur?: () => void;
  name: string; placeholder?: string; hasError?: boolean;
}) {
  const [show, setShow] = useState(false);
  return (
    <div style={{ position: 'relative' }}>
      <input
        type={show ? 'text' : 'password'}
        name={name}
        value={value}
        onChange={e => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        style={{ ...inputBase, paddingRight: 44, borderColor: hasError ? C.error : C.border }}
      />
      <button
        type="button"
        onClick={() => setShow(s => !s)}
        style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: C.muted, padding: 2, display: 'flex' }}
      >
        {show ? (
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/>
          </svg>
        ) : (
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
          </svg>
        )}
      </button>
    </div>
  );
}

// ─── Phone Input ──────────────────────────────────────────────────────────────

function PhoneInput({ value, onChange, onBlur, hasError }: {
  value: string; onChange: (v: string) => void; onBlur?: () => void; hasError?: boolean;
}) {
  return (
    <div style={{ display: 'flex' }}>
      <span style={{
        padding: '11px 12px', background: C.softGreen, border: `1.5px solid ${hasError ? C.error : C.border}`,
        borderRight: 'none', borderRadius: '8px 0 0 8px', fontSize: 14, color: C.primary, fontWeight: 700, whiteSpace: 'nowrap',
      }}>+91</span>
      <input
        type="tel" inputMode="numeric" maxLength={10}
        value={value}
        onChange={e => onChange(e.target.value.replace(/\D/g, '').slice(0, 10))}
        onBlur={onBlur}
        placeholder="98765 43210"
        style={{ ...inputBase, borderRadius: '0 8px 8px 0', flex: 1, borderColor: hasError ? C.error : C.border }}
      />
    </div>
  );
}

// ─── Kabadiwala Login ─────────────────────────────────────────────────────────

function KabadiwalaLogin({ onSwitch, onSuccess }: { onSwitch: () => void; onSuccess: () => void }) {
  const { login } = useAuth();
  const { addToast } = useStore();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const touch = (f: string) => setTouched(t => ({ ...t, [f]: true }));
  const err = (f: string, v: string) => touched[f] ? validate(f, v) : '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const e1 = validate('phone', phone);
    const e2 = validate('password', password);
    setErrors({ phone: e1, password: e2 });
    setTouched({ phone: true, password: true });
    setApiError(null);

    if (!e1 && !e2) {
      setLoading(true);
      try {
        const email = phone.includes('@') ? phone : `${phone}@kabadiwala.com`;
        await login({ email, password });
        addToast('Kabadiwala logged in successfully!', 'success');
        onSuccess();
      } catch (err: any) {
        const msg = err.message || 'Login failed. Please check credentials.';
        setApiError(msg);
        addToast(msg, 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {apiError && (
        <div style={{ padding: '10px 14px', background: '#FEF2F2', border: `1px solid ${C.error}`, borderRadius: 8, color: C.error, fontSize: 13 }}>
          {apiError}
        </div>
      )}
      <Field label="Phone Number / Email" error={touched.phone ? err('phone', phone) : ''}>
        <PhoneInput value={phone} onChange={setPhone} onBlur={() => touch('phone')} hasError={!!(touched.phone && err('phone', phone))} />
      </Field>
      <Field label="Password" error={touched.password ? err('password', password) : ''}>
        <PasswordInput name="kab-pass" value={password} onChange={setPassword} onBlur={() => touch('password')} hasError={!!(touched.password && err('password', password))} />
      </Field>
      <div style={{ textAlign: 'right', marginTop: -8 }}>
        <button type="button" style={{ background: 'none', border: 'none', color: C.gold, fontSize: 13, fontWeight: 600, cursor: 'pointer', padding: 0 }}>Forgot password?</button>
      </div>
      <PrimaryBtn loading={loading}>Log In</PrimaryBtn>
      <p style={{ textAlign: 'center', fontSize: 13, color: C.muted, margin: 0 }}>
        New here?{' '}
        <button type="button" onClick={onSwitch} style={{ background: 'none', border: 'none', color: C.gold, fontWeight: 700, fontSize: 13, cursor: 'pointer', padding: 0 }}>Sign up</button>
      </p>
    </form>
  );
}

// ─── Kabadiwala Signup ────────────────────────────────────────────────────────

function KabadiwalaSignup({ onSwitch, onSuccess }: { onSwitch: () => void; onSuccess: () => void }) {
  const { register, login } = useAuth();
  const { addToast } = useStore();
  const [f, setF] = useState({ fullName: '', phone: '', password: '', confirm: '', pan: '', aadhaar: '', bankAccount: '', ifsc: '', accountHolderName: '' });
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const update = (k: keyof typeof f) => (v: string) => setF(prev => ({ ...prev, [k]: v }));
  const touch = (k: string) => setTouched(t => ({ ...t, [k]: true }));
  const err = (k: string, v: string) => touched[k] ? validate(k, v) : '';
  const confirmErr = touched.confirm && f.confirm !== f.password ? "Passwords don't match" : '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const keys = ['fullName', 'phone', 'password', 'confirm', 'pan', 'aadhaar', 'bankAccount', 'ifsc', 'accountHolderName'] as const;
    const allTouched = Object.fromEntries(keys.map(k => [k, true]));
    setTouched(allTouched);
    setApiError(null);
    const hasErrors = keys.some(k => validate(k, f[k])) || f.confirm !== f.password || !authorized;

    if (!hasErrors) {
      setLoading(true);
      try {
        const email = `${f.phone}@kabadiwala.com`;
        await register({
          email,
          password: f.password,
          role: 'KABADIWALA',
          full_name: f.fullName,
          location: 'Jaipur, Rajasthan',
        });
        await login({ email, password: f.password });
        addToast('Kabadiwala account registered successfully!', 'success');
        onSuccess();
      } catch (err: any) {
        const msg = err.message || 'Registration failed. Please check your information.';
        setApiError(msg);
        addToast(msg, 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {apiError && (
        <div style={{ padding: '10px 14px', background: '#FEF2F2', border: `1px solid ${C.error}`, borderRadius: 8, color: C.error, fontSize: 13 }}>
          {apiError}
        </div>
      )}
      <Field label="Full Name" error={err('fullName', f.fullName)}>
        <input style={{ ...inputBase, borderColor: touched.fullName && err('fullName', f.fullName) ? C.error : C.border }}
          value={f.fullName} onChange={e => update('fullName')(e.target.value)} onBlur={() => touch('fullName')} placeholder="Ramesh Gupta" />
      </Field>
      <Field label="Phone Number" error={err('phone', f.phone)}>
        <PhoneInput value={f.phone} onChange={update('phone')} onBlur={() => touch('phone')} hasError={!!(touched.phone && err('phone', f.phone))} />
      </Field>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <Field label="Password" error={err('password', f.password)}>
          <PasswordInput name="kab-sp" value={f.password} onChange={update('password')} onBlur={() => touch('password')} hasError={!!(touched.password && err('password', f.password))} />
        </Field>
        <Field label="Confirm Password" error={touched.confirm ? confirmErr : ''}>
          <PasswordInput name="kab-sc" value={f.confirm} onChange={update('confirm')} onBlur={() => touch('confirm')} placeholder="Confirm password" hasError={!!(touched.confirm && confirmErr)} />
        </Field>
      </div>
      <Field label="PAN Number" error={err('pan', f.pan)} hint="Format: ABCDE1234F">
        <input style={{ ...inputBase, borderColor: touched.pan && err('pan', f.pan) ? C.error : C.border, textTransform: 'uppercase' }}
          value={f.pan} onChange={e => update('pan')(e.target.value.toUpperCase().slice(0, 10))} onBlur={() => touch('pan')} placeholder="ABCDE1234F" maxLength={10} />
      </Field>
      <Field label="Aadhaar Number" error={err('aadhaar', f.aadhaar)} hint={f.aadhaar.length === 12 ? `Saved as: ${maskAadhaar(f.aadhaar)}` : '12-digit Aadhaar number'}>
        <input style={{ ...inputBase, borderColor: touched.aadhaar && err('aadhaar', f.aadhaar) ? C.error : C.border }}
          type="password" value={f.aadhaar} onChange={e => update('aadhaar')(e.target.value.replace(/\D/g, '').slice(0, 12))} onBlur={() => touch('aadhaar')} placeholder="············ (12 digits)" inputMode="numeric" />
      </Field>
      <div style={{ padding: '14px 16px', background: C.softGreen, borderRadius: 10, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: C.primary }}>Bank Details</div>
        <Field label="Account Holder Name" error={err('accountHolderName', f.accountHolderName)}>
          <input style={{ ...inputBase, borderColor: touched.accountHolderName && err('accountHolderName', f.accountHolderName) ? C.error : C.border }}
            value={f.accountHolderName} onChange={e => update('accountHolderName')(e.target.value)} onBlur={() => touch('accountHolderName')} placeholder="Ramesh Gupta" />
        </Field>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <Field label="Bank Account Number" error={err('bankAccount', f.bankAccount)}>
            <input style={{ ...inputBase, borderColor: touched.bankAccount && err('bankAccount', f.bankAccount) ? C.error : C.border }}
              type="password" value={f.bankAccount} onChange={e => update('bankAccount')(e.target.value.replace(/\D/g, '').slice(0, 18))} onBlur={() => touch('bankAccount')} placeholder="Account number" inputMode="numeric" />
          </Field>
          <Field label="IFSC Code" error={err('ifsc', f.ifsc)}>
            <input style={{ ...inputBase, borderColor: touched.ifsc && err('ifsc', f.ifsc) ? C.error : C.border, textTransform: 'uppercase' }}
              value={f.ifsc} onChange={e => update('ifsc')(e.target.value.toUpperCase().slice(0, 11))} onBlur={() => touch('ifsc')} placeholder="SBIN0001234" maxLength={11} />
          </Field>
        </div>
      </div>
      <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer', padding: '12px 14px', background: authorized ? C.softGreen : C.white, border: `1.5px solid ${authorized ? C.primary : C.border}`, borderRadius: 8, transition: 'all 0.15s' }}>
        <input type="checkbox" checked={authorized} onChange={e => setAuthorized(e.target.checked)} style={{ marginTop: 2, accentColor: C.primary, width: 15, height: 15, flexShrink: 0 }} />
        <span style={{ fontSize: 13, color: C.darkText, lineHeight: 1.5 }}>
          I authorize verification of the above details by Punahachakra for KYC and payout purposes.
        </span>
      </label>
      {!authorized && touched.pan && <span style={{ fontSize: 12, color: C.error, marginTop: -8 }}>You must authorize verification to continue</span>}
      <PrimaryBtn loading={loading}>Create Kabadiwala Account</PrimaryBtn>
      <p style={{ textAlign: 'center', fontSize: 13, color: C.muted, margin: 0 }}>
        Already have an account?{' '}
        <button type="button" onClick={onSwitch} style={{ background: 'none', border: 'none', color: C.gold, fontWeight: 700, fontSize: 13, cursor: 'pointer', padding: 0 }}>Log in</button>
      </p>
    </form>
  );
}

// ─── Company Login ────────────────────────────────────────────────────────────

function CompanyLogin({ onSwitch, onSuccess }: { onSwitch: () => void; onSuccess: () => void }) {
  const { login } = useAuth();
  const { addToast } = useStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const touch = (f: string) => setTouched(t => ({ ...t, [f]: true }));
  const err = (f: string, v: string) => touched[f] ? validate(f, v) : '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const e1 = validate('email', email), e2 = validate('password', password);
    setTouched({ email: true, password: true });
    setApiError(null);

    if (!e1 && !e2) {
      setLoading(true);
      try {
        await login({ email, password });
        addToast('Company logged in successfully!', 'success');
        onSuccess();
      } catch (err: any) {
        const msg = err.message || 'Login failed. Please check credentials.';
        setApiError(msg);
        addToast(msg, 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {apiError && (
        <div style={{ padding: '10px 14px', background: '#FEF2F2', border: `1px solid ${C.error}`, borderRadius: 8, color: C.error, fontSize: 13 }}>
          {apiError}
        </div>
      )}
      <Field label="Company Email" error={err('email', email)}>
        <input style={{ ...inputBase, borderColor: touched.email && err('email', email) ? C.error : C.border }}
          type="email" value={email} onChange={e => setEmail(e.target.value)} onBlur={() => touch('email')} placeholder="accounts@yourcompany.com" />
      </Field>
      <Field label="Password" error={touched.password ? err('password', password) : ''}>
        <PasswordInput name="co-pass" value={password} onChange={setPassword} onBlur={() => touch('password')} hasError={!!(touched.password && err('password', password))} />
      </Field>
      <div style={{ textAlign: 'right', marginTop: -8 }}>
        <button type="button" style={{ background: 'none', border: 'none', color: C.gold, fontSize: 13, fontWeight: 600, cursor: 'pointer', padding: 0 }}>Forgot password?</button>
      </div>
      <PrimaryBtn loading={loading}>Log In</PrimaryBtn>
      <p style={{ textAlign: 'center', fontSize: 13, color: C.muted, margin: 0 }}>
        New here?{' '}
        <button type="button" onClick={onSwitch} style={{ background: 'none', border: 'none', color: C.gold, fontWeight: 700, fontSize: 13, cursor: 'pointer', padding: 0 }}>Register your company</button>
      </p>
    </form>
  );
}

// ─── Company Signup ───────────────────────────────────────────────────────────

function CompanySignup({ onSwitch, onSuccess }: { onSwitch: () => void; onSuccess: () => void }) {
  const { register, login } = useAuth();
  const { addToast } = useStore();
  const [f, setF] = useState({ companyName: '', email: '', password: '', confirm: '', gstin: '', phone: '' });
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const update = (k: keyof typeof f) => (v: string) => setF(prev => ({ ...prev, [k]: v }));
  const touch = (k: string) => setTouched(t => ({ ...t, [k]: true }));
  const err = (k: string, v: string) => touched[k] ? validate(k, v) : '';
  const confirmErr = touched.confirm && f.confirm !== f.password ? "Passwords don't match" : '';
  const strength = passwordStrength(f.password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const keys = ['companyName', 'email', 'password', 'confirm', 'gstin', 'phone'] as const;
    setTouched(Object.fromEntries(keys.map(k => [k, true])));
    setApiError(null);
    const hasErrors = keys.some(k => validate(k, f[k])) || f.confirm !== f.password;

    if (!hasErrors) {
      setLoading(true);
      try {
        await register({
          email: f.email,
          password: f.password,
          role: 'COMPANY',
          company_name: f.companyName,
          location: 'Jaipur, Rajasthan',
        });
        await login({ email: f.email, password: f.password });
        addToast('Company registered successfully!', 'success');
        onSuccess();
      } catch (err: any) {
        const msg = err.message || 'Registration failed. Please check information.';
        setApiError(msg);
        addToast(msg, 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {apiError && (
        <div style={{ padding: '10px 14px', background: '#FEF2F2', border: `1px solid ${C.error}`, borderRadius: 8, color: C.error, fontSize: 13 }}>
          {apiError}
        </div>
      )}
      <Field label="Company Name" error={err('companyName', f.companyName)}>
        <input style={{ ...inputBase, borderColor: touched.companyName && err('companyName', f.companyName) ? C.error : C.border }}
          value={f.companyName} onChange={e => update('companyName')(e.target.value)} onBlur={() => touch('companyName')} placeholder="ABC Office Solutions Pvt. Ltd." />
      </Field>
      <Field label="Company Email" error={err('email', f.email)}>
        <input style={{ ...inputBase, borderColor: touched.email && err('email', f.email) ? C.error : C.border }}
          type="email" value={f.email} onChange={e => update('email')(e.target.value)} onBlur={() => touch('email')} placeholder="accounts@company.com" />
      </Field>
      <Field label="Phone Number" error={err('phone', f.phone)}>
        <PhoneInput value={f.phone} onChange={update('phone')} onBlur={() => touch('phone')} hasError={!!(touched.phone && err('phone', f.phone))} />
      </Field>
      <Field label="GSTIN" error={err('gstin', f.gstin)} hint="15-character GST Identification Number">
        <input style={{ ...inputBase, borderColor: touched.gstin && err('gstin', f.gstin) ? C.error : C.border, textTransform: 'uppercase', letterSpacing: '0.04em' }}
          value={f.gstin} onChange={e => update('gstin')(e.target.value.toUpperCase().slice(0, 15))} onBlur={() => touch('gstin')} placeholder="08ABCDE1234F1Z5" maxLength={15} />
      </Field>
      <Field label="Set Password" error={err('password', f.password)}>
        <PasswordInput name="co-sp" value={f.password} onChange={v => { update('password')(v); touch('password'); }} onBlur={() => touch('password')} hasError={!!(touched.password && err('password', f.password))} />
        {f.password.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
            <div style={{ flex: 1, height: 4, background: C.border, borderRadius: 99, overflow: 'hidden' }}>
              <div style={{ height: '100%', borderRadius: 99, width: `${(strength.score / 3) * 100}%`, background: strength.color, transition: 'width 0.3s, background 0.3s' }} />
            </div>
            <span style={{ fontSize: 12, fontWeight: 600, color: strength.color, minWidth: 48 }}>{strength.label}</span>
          </div>
        )}
      </Field>
      <Field label="Confirm Password" error={touched.confirm ? confirmErr : ''}>
        <PasswordInput name="co-sc" value={f.confirm} onChange={update('confirm')} onBlur={() => touch('confirm')} placeholder="Confirm password" hasError={!!(touched.confirm && confirmErr)} />
      </Field>
      <PrimaryBtn loading={loading}>Register Company</PrimaryBtn>
      <p style={{ textAlign: 'center', fontSize: 13, color: C.muted, margin: 0 }}>
        Already registered?{' '}
        <button type="button" onClick={onSwitch} style={{ background: 'none', border: 'none', color: C.gold, fontWeight: 700, fontSize: 13, cursor: 'pointer', padding: 0 }}>Log in</button>
      </p>
    </form>
  );
}

// ─── Primary Button ───────────────────────────────────────────────────────────

function PrimaryBtn({ children, loading, onClick }: { children: React.ReactNode; loading?: boolean; onClick?: () => void }) {
  return (
    <button
      type={onClick ? 'button' : 'submit'}
      onClick={onClick}
      disabled={loading}
      style={{ width: '100%', padding: '13px 0', borderRadius: 10, border: 'none', background: loading ? C.primary + 'AA' : C.deepGreen, color: C.white, fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'opacity 0.15s, background 0.15s', letterSpacing: '0.01em' }}
      onMouseEnter={e => { if (!loading) e.currentTarget.style.opacity = '0.88'; }}
      onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
    >
      {loading ? (
        <>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ animation: 'spin 0.8s linear infinite' }}>
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
          </svg>
          Please wait…
        </>
      ) : children}
    </button>
  );
}

// ─── Role Badge Icons ─────────────────────────────────────────────────────────

function RecycleBadge() {
  return (
    <div style={{ width: 42, height: 42, background: C.gold, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.deepGreen, flexShrink: 0 }}>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="1 4 1 10 7 10"/><polyline points="23 20 23 14 17 14"/>
        <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/>
      </svg>
    </div>
  );
}

function BuildingBadge() {
  return (
    <div style={{ width: 42, height: 42, background: C.softGreen, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.primary, flexShrink: 0 }}>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="2" width="16" height="20" rx="1"/><path d="M9 22V12h6v10"/><path d="M9 7h1"/><path d="M9 11h1"/><path d="M14 7h1"/><path d="M14 11h1"/>
      </svg>
    </div>
  );
}

// ─── Auth Page ────────────────────────────────────────────────────────────────

export default function Auth() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get('role') === 'kabadiwala' ? 'kabadiwala' : 'company';

  const [role, setRole] = useState<'company' | 'kabadiwala'>(initialRole);
  const [mode, setMode] = useState<'login' | 'signup'>('login');

  useEffect(() => {
    setMode('login');
  }, [role]);

  const handleSuccess = () => {
    const currentUser = tokenStorage.getUser();
    const targetRole = currentUser?.role || (role === 'company' ? 'COMPANY' : 'KABADIWALA');
    const targetRoute = targetRole === 'KABADIWALA' ? '/kabadiwala' : '/company';
    navigate(targetRoute, { replace: true });
  };

  const cardTitle = role === 'company'
    ? (mode === 'login' ? 'Company Portal' : 'Register Your Company')
    : (mode === 'login' ? 'Kabadiwala Portal' : 'Kabadiwala Sign Up');

  return (
    <div style={{ minHeight: '100vh', background: C.canvas, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '32px 16px 64px', fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", position: 'relative' }}>

      {/* Spin animation */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Back to Home */}
      <div style={{ width: '100%', maxWidth: 500, marginBottom: 24 }}>
        <button onClick={() => navigate('/')} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'none', border: 'none', color: C.muted, fontSize: 13, fontWeight: 600, cursor: 'pointer', padding: '6px 0', borderRadius: 6, transition: 'color 0.15s' }}
          onMouseEnter={e => e.currentTarget.style.color = C.darkText}
          onMouseLeave={e => e.currentTarget.style.color = C.muted}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
          </svg>
          Back to Home
        </button>
      </div>

      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
        <div style={{ width: 40, height: 40, background: C.deepGreen, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.gold }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="1 4 1 10 7 10"/><polyline points="23 20 23 14 17 14"/>
            <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/>
          </svg>
        </div>
        <div style={{ fontSize: 20, fontWeight: 800, color: C.darkText }}>Punahachakra</div>
      </div>

      {/* Role Toggle */}
      <div style={{ width: '100%', maxWidth: 500, marginBottom: 24 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0, background: C.white, border: `1.5px solid ${C.border}`, borderRadius: 12, padding: 4, boxShadow: C.cardShadow }}>
          {(['company', 'kabadiwala'] as const).map(r => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                padding: '10px 16px', borderRadius: 9, border: 'none', cursor: 'pointer',
                fontSize: 14, fontWeight: 700, transition: 'all 0.18s',
                background: role === r ? (r === 'company' ? C.white : C.deepGreen) : 'transparent',
                color: role === r ? (r === 'company' ? C.primary : C.white) : C.muted,
                boxShadow: role === r ? C.cardShadow : 'none',
              }}
            >
              {r === 'company' ? (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="4" y="2" width="16" height="20" rx="1"/><path d="M9 22V12h6v10"/><path d="M9 7h1"/><path d="M9 11h1"/><path d="M14 7h1"/><path d="M14 11h1"/>
                </svg>
              ) : (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={role === 'kabadiwala' ? C.gold : 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="1 4 1 10 7 10"/><polyline points="23 20 23 14 17 14"/>
                  <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/>
                </svg>
              )}
              {r === 'company' ? 'Company' : 'Kabadiwala'}
            </button>
          ))}
        </div>
      </div>

      {/* Card */}
      <div style={{ width: '100%', maxWidth: 500, background: C.white, border: `1px solid ${C.border}`, borderRadius: 16, padding: '32px 32px', boxShadow: '0 2px 8px rgba(30,40,34,0.07), 0 8px 32px rgba(30,40,34,0.06)' }}>

        {/* Card Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28, paddingBottom: 24, borderBottom: `1px solid ${C.border}` }}>
          {role === 'kabadiwala' ? <RecycleBadge /> : <BuildingBadge />}
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, color: C.darkText, lineHeight: 1.2 }}>{cardTitle}</div>
            <div style={{ fontSize: 13, color: C.muted, marginTop: 2 }}>
              {role === 'company' ? 'Secure B2B waste management platform' : 'Verified kabadiwala network · Punahachakra'}
            </div>
          </div>
        </div>

        {/* Forms */}
        {role === 'kabadiwala' && mode === 'login' && (
          <KabadiwalaLogin onSwitch={() => setMode('signup')} onSuccess={handleSuccess} />
        )}
        {role === 'kabadiwala' && mode === 'signup' && (
          <KabadiwalaSignup onSwitch={() => setMode('login')} onSuccess={handleSuccess} />
        )}
        {role === 'company' && mode === 'login' && (
          <CompanyLogin onSwitch={() => setMode('signup')} onSuccess={handleSuccess} />
        )}
        {role === 'company' && mode === 'signup' && (
          <CompanySignup onSwitch={() => setMode('login')} onSuccess={handleSuccess} />
        )}
      </div>

      {/* Footer */}
      <p style={{ marginTop: 32, fontSize: 12, color: C.muted, textAlign: 'center' }}>
        Secure · Verified · Trusted — Punahachakra v1.0 Demo
      </p>
    </div>
  );
}
