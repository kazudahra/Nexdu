import { useState, useEffect, createContext, useContext } from 'react';
import {
  Users, Plus, X, Check, Trash2, Upload,
  Eye, EyeOff, Bell, Loader2, Sparkles, Home,
  LogOut, LogIn, Building2, GraduationCap, PartyPopper, Wallet,
  Settings, TrendingUp, TrendingDown, CheckCircle2, XCircle,
  ArrowRightLeft, ClipboardList, Star, BookOpen, Timer, ShieldCheck,
  Pencil, Sun, Moon, Palette, CreditCard, Banknote, AlertTriangle, Percent,
} from 'lucide-react';
import { loadSession, loadSharedState, saveSession, saveSharedState } from './lib/app-storage';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend } from 'recharts';

/* ============================== CONSTANTS ============================== */

const WEEK_DAYS = ['Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba', 'Yakshanba'];
const MONTHS_UZ = ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr'];
const JS_DAY_NAMES = ['Yakshanba', 'Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba'];

const TEACHER_APP_KEY = 'school-app-data-v3';
const DIRECTOR_DATA_KEY = 'director-data-v2';
const DIRECTOR_SESSION_KEY = 'director-session-v2';

const DEMO_DIRECTOR_HASH = 'c837bd58a08f8ada06fb65e588af776b332e580dec1d042d75f32a6c89367297';
const DEMO_MANAGER_HASH = '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4'; // "1234"

const DIRECTOR_ONLY_NAV = [
  { id: 'home', label: 'Bosh sahifa', icon: Home },
  { id: 'branches', label: 'Filiallar', icon: Building2 },
  { id: 'managers', label: 'Menejerlar', icon: Users },
];

const MANAGER_NAV_ALL = [
  { id: 'home', label: 'Bosh sahifa', icon: Home },
  { id: 'payments', label: "To'lovlar", icon: CreditCard },
  { id: 'teachers', label: "O'qituvchilar", icon: GraduationCap },
  { id: 'courses', label: 'Kurslar', icon: BookOpen },
  { id: 'groups', label: 'Guruhlar', icon: ClipboardList },
  { id: 'finance', label: 'Moliya', icon: Wallet },
  { id: 'holidays', label: 'Bayramlar', icon: PartyPopper },
];

const DIRECTOR_NAV = [
  ...DIRECTOR_ONLY_NAV,
  ...MANAGER_NAV_ALL.filter(p => p.id !== 'home'),
  { id: 'settings', label: 'Sozlamalar', icon: Settings },
];

const EXPENSE_CATEGORIES = ['Ijara', 'Ish haqi', 'Kommunal', 'Reklama', 'Jihoz', "O'quv materiali", 'Boshqa'];
const PAYMENT_METHODS = [{ id: 'cash', label: 'Naqd', icon: Banknote }, { id: 'card', label: 'Plastik', icon: CreditCard }];

/* ============================== THEME ============================== */

const THEMES = {
  violet: { id: 'violet', name: 'Binafsha', bg: 'linear-gradient(160deg, #1e1b4b 0%, #4c1d95 35%, #7e22ce 55%, #831843 75%, #1e1b4b 100%)', accent1: '#c026d3', accent2: '#8b5cf6', blob1: '#8b5cf6', blob2: '#ec4899', blob3: '#0ea5e9' },
  ocean: { id: 'ocean', name: 'Okean', bg: 'linear-gradient(160deg, #082f49 0%, #075985 35%, #0e7490 55%, #164e63 75%, #082f49 100%)', accent1: '#22d3ee', accent2: '#10b981', blob1: '#22d3ee', blob2: '#10b981', blob3: '#0ea5e9' },
  sunset: { id: 'sunset', name: "Quyosh botishi", bg: 'linear-gradient(160deg, #431407 0%, #9a3412 35%, #c2410c 55%, #7c2d12 75%, #431407 100%)', accent1: '#fb923c', accent2: '#f43f5e', blob1: '#fb923c', blob2: '#f43f5e', blob3: '#f59e0b' },
  day: { id: 'day', name: 'Kunduzgi (och ko\'k)', bg: 'linear-gradient(160deg, #3b5faa 0%, #5b7fc7 45%, #7fa0d8 100%)', accent1: '#1e3a8a', accent2: '#1d4ed8', blob1: '#93c5fd', blob2: '#bfdbfe', blob3: '#60a5fa' },
  night: { id: 'night', name: "Tungi (to'q ko'k)", bg: 'linear-gradient(160deg, #020617 0%, #0b1120 45%, #0f172a 100%)', accent1: '#1e40af', accent2: '#1e3a8a', blob1: '#1e3a8a', blob2: '#172554', blob3: '#1e3a8a' },
};

function clamp255(n) { return Math.max(0, Math.min(255, Math.round(n))); }
function toHex(r, g, b) { return '#' + [r, g, b].map(x => clamp255(x).toString(16).padStart(2, '0')).join(''); }
function toRgbStr(r, g, b, amt) { return `rgb(${clamp255(r * amt)}, ${clamp255(g * amt)}, ${clamp255(b * amt)})`; }

function buildCustomTheme(r, g, b) {
  return {
    id: 'custom', name: 'Brend ranglar',
    bg: `linear-gradient(160deg, ${toRgbStr(r, g, b, 0.22)} 0%, ${toRgbStr(r, g, b, 0.5)} 35%, ${toRgbStr(r, g, b, 0.72)} 55%, ${toRgbStr(r, g, b, 0.42)} 75%, ${toRgbStr(r, g, b, 0.22)} 100%)`,
    accent1: toHex(r, g, b), accent2: toHex(r * 0.8 + 40, g * 0.8 + 15, b * 0.8 + 60),
    blob1: toHex(r, g, b), blob2: toHex(r * 0.7 + 60, g * 0.9, b * 1.1), blob3: toHex(r * 1.1, g * 0.9 + 20, b * 0.7),
  };
}

function extractAverageColor(dataUrl) {
  return new Promise(resolve => {
    try {
      const img = new window.Image();
      img.onload = () => {
        const size = 32;
        const canvas = document.createElement('canvas');
        canvas.width = size; canvas.height = size;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, size, size);
        const data = ctx.getImageData(0, 0, size, size).data;
        let r = 0, g = 0, b = 0, count = 0;
        for (let i = 0; i < data.length; i += 4) { if (data[i + 3] < 80) continue; r += data[i]; g += data[i + 1]; b += data[i + 2]; count++; }
        if (!count) { resolve(null); return; }
        resolve({ r: r / count, g: g / count, b: b / count });
      };
      img.onerror = () => resolve(null);
      img.src = dataUrl;
    } catch (e) { resolve(null); }
  });
}

const ThemeContext = createContext(THEMES.violet);
function useTheme() { return useContext(ThemeContext); }

/* ============================== STYLE TOKENS ============================== */

const GLASS = "bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl shadow-black/10";
const GLASS_SOFT = "bg-white/5 backdrop-blur-lg border border-white/10";
const INPUT_CLS = "w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-4 py-2.5 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/40 focus:bg-white/15 transition-all text-sm";
const LABEL_CLS = "block text-xs font-medium text-white/60 mb-1.5 uppercase tracking-wide";
const BTN_PRIMARY_BASE = "backdrop-blur-md border border-white/30 text-white font-medium rounded-xl px-4 py-2.5 transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 text-sm disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100 hover:brightness-110";
const BTN_GHOST = "bg-white/5 hover:bg-white/15 backdrop-blur-md border border-white/10 text-white/80 hover:text-white rounded-xl px-4 py-2 transition-all text-sm flex items-center justify-center gap-2";
const BTN_ICON = "w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center transition-all text-white/70 hover:text-white shrink-0";

function PrimaryButton({ children, className = '', ...props }) {
  const theme = useTheme();
  return <button {...props} className={`${BTN_PRIMARY_BASE} ${className}`} style={{ background: `linear-gradient(to right, ${theme.accent1}cc, ${theme.accent2}cc)` }}>{children}</button>;
}

/* ============================== UTILITIES ============================== */

function generateId(prefix) { return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`; }
function todayISO() { return new Date().toISOString().slice(0, 10); }
function thisMonthKey() { return new Date().toISOString().slice(0, 7); }
function prevMonthKey(month) { const [y, m] = month.split('-').map(Number); return new Date(y, m - 2, 1).toISOString().slice(0, 7); }
function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  if (isNaN(d.getTime())) return dateStr;
  return `${d.getDate()}-${MONTHS_UZ[d.getMonth()]}, ${d.getFullYear()}`;
}
function initials(name) { return (name || '?').trim().split(/\s+/).map(p => p[0]).slice(0, 2).join('').toUpperCase(); }
function normalizePhone(p) { return (p || '').replace(/\D/g, ''); }
function displayPhone(local) { return local ? '+998 ' + local : 'kiritilmagan'; }
function money(n) { return (n || 0).toLocaleString('uz-UZ'); }
function generateDemoCode() { return String(Math.floor(10000 + Math.random() * 90000)); }
function timeAgo(ts) {
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 60) return 'hozir';
  if (diff < 3600) return `${Math.floor(diff / 60)} daq oldin`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} soat oldin`;
  return `${Math.floor(diff / 86400)} kun oldin`;
}

function getPaymentTotal(payments, studentId, courseId, month) {
  return payments.filter(p => p.studentId === studentId && p.courseId === courseId && p.month === month).reduce((s, p) => s + p.amount, 0);
}
function getPaymentStatus(payments, studentId, courseId, month, price) {
  const total = getPaymentTotal(payments, studentId, courseId, month);
  if (total <= 0) return 'unpaid';
  if (total < price) return 'partial';
  return 'paid';
}

async function hashPassword(pw) {
  try {
    if (window.crypto && window.crypto.subtle) {
      const enc = new TextEncoder().encode(pw);
      const buf = await window.crypto.subtle.digest('SHA-256', enc);
      return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
    }
  } catch (e) { /* fall through */ }
  let hash = 0;
  for (let i = 0; i < pw.length; i++) { hash = ((hash << 5) - hash + pw.charCodeAt(i)) | 0; }
  return 'fallback-' + Math.abs(hash).toString(16);
}

function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function compressImageDataUrl(dataUrl, maxWidth) {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => {
      const scale = Math.min(1, maxWidth / img.width);
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(img.width * scale));
      canvas.height = Math.max(1, Math.round(img.height * scale));
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = reject;
    img.src = dataUrl;
  });
}

/* ============================== SEED DATA ============================== */

function seedDirectorData() {
  const now = Date.now();
  return {
    directors: [
      { id: 'dir-1', name: 'Direktor Aliyev', phone: '901234000', passwordHash: DEMO_DIRECTOR_HASH, centerName: "Najot Ta'lim - Demo", logo: null, address: 'Toshkent sh., Chilonzor', themeId: 'violet', customTheme: null, twoFactorEnabled: false },
    ],
    branches: [
      { id: 'br-1', directorId: 'dir-1', name: 'Markaziy filial', address: 'Toshkent sh., Chilonzor', color: '#8b5cf6' },
    ],
    managers: [
      { id: 'mgr-1', branchIds: ['br-1'], name: 'Kamola Rahimova', phone: '901234100', birthDate: '1996-04-12', address: 'Toshkent sh.', passwordHash: DEMO_MANAGER_HASH, monthlySalary: 3000000, rating: 4, allowedPages: MANAGER_NAV_ALL.map(p => p.id) },
    ],
    teachersHR: [
      { id: 'thr-1', branchId: 'br-1', name: 'Ustoz', phone: '901234500', revenueSharePercent: 40, rating: 4, note: '', canCreateGroups: true, canReceivePayments: true },
    ],
    holidays: [
      { id: 'hol-1', directorId: 'dir-1', name: "Mustaqillik kuni", date: '2026-09-01', note: '' },
    ],
    finance: [
      { id: 'fin-2', branchId: 'br-1', type: 'expense', amount: 1500000, category: 'Ijara', note: 'Iyul oyi ijarasi', date: todayISO(), status: 'approved', approvalMode: 'director', createdAt: now - 80000000 },
      { id: 'fin-3', branchId: 'br-1', type: 'expense', amount: 350000, category: 'Jihoz', note: 'Proyektor lampasi', date: todayISO(), status: 'pending', approvalMode: 'director', createdAt: now - 3600000 },
    ],
    courses: [
      { id: 'crs-1', branchId: 'br-1', name: 'Matematika', days: ['Dushanba', 'Chorshanba', 'Juma'], time: '15:00', price: 450000, durationMonths: 6, capacity: 12 },
      { id: 'crs-2', branchId: 'br-1', name: 'Ingliz tili', days: ['Seshanba', 'Payshanba'], time: '17:00', price: 500000, durationMonths: 9, capacity: null },
    ],
    payments: [
      { id: 'pay-1', studentId: 'st-1', courseId: 'crs-1', amount: 450000, method: 'cash', date: todayISO(), month: thisMonthKey(), createdAt: now - 80000000 },
      { id: 'pay-2', studentId: 'st-2', courseId: 'crs-1', amount: 200000, method: 'card', date: todayISO(), month: thisMonthKey(), createdAt: now - 40000000 },
    ],
    groupFees: {},
  };
}

/* ============================== SMALL REUSABLE COMPONENTS ============================== */

function GlobalStyleTag() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@500;600;700;800&family=Inter:wght@400;500;600&display=swap');
      .font-display { font-family: 'Outfit', ui-sans-serif, system-ui, sans-serif; }
      @keyframes float1 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(40px,-30px)} }
      @keyframes float2 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-50px,40px)} }
      @keyframes float3 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(30px,30px)} }
      @keyframes fadeIn { from{opacity:0; transform:translateY(-8px);} to{opacity:1; transform:translateY(0);} }
      ::-webkit-scrollbar { width: 6px; height: 6px; }
      ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 3px; }
      input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(1); opacity: 0.6; }
    `}</style>
  );
}

function BackgroundBlobs() {
  const theme = useTheme();
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      <div className="absolute -top-20 -left-20 w-96 h-96 rounded-full blur-3xl opacity-30" style={{ background: theme.blob1, animation: 'float1 18s ease-in-out infinite' }} />
      <div className="absolute top-1/3 -right-32 w-96 h-96 rounded-full blur-3xl opacity-30" style={{ background: theme.blob2, animation: 'float2 22s ease-in-out infinite' }} />
      <div className="absolute -bottom-32 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-25" style={{ background: theme.blob3, animation: 'float3 20s ease-in-out infinite' }} />
    </div>
  );
}

function LoadingScreen() {
  const theme = useTheme();
  return (
    <div className="min-h-screen w-full flex items-center justify-center text-white" style={{ background: theme.bg }}>
      <div className="flex flex-col items-center gap-3"><Loader2 size={28} className="animate-spin" /><p className="text-white/70 text-sm">Yuklanmoqda...</p></div>
    </div>
  );
}

function Avatar({ name, color = '#8b5cf6', size = 40, photo, onClick }) {
  const style = { width: size, height: size, minWidth: size };
  if (photo) return <img src={photo} alt={name} style={style} onClick={onClick} className={`rounded-full object-cover border-2 border-white/30 ${onClick ? 'cursor-pointer' : ''}`} />;
  return (
    <div style={{ ...style, background: `linear-gradient(135deg, ${color}, ${color}99)`, fontSize: size * 0.38 }} onClick={onClick} className={`font-display rounded-full flex items-center justify-center font-bold text-white border-2 border-white/30 shrink-0 ${onClick ? 'cursor-pointer' : ''}`}>
      {initials(name)}
    </div>
  );
}

function PhoneInput({ value, onChange, autoFocus, onKeyDown }) {
  function handleChange(e) {
    let digits = e.target.value.replace(/\D/g, '');
    if (digits.startsWith('998') && digits.length > 9) digits = digits.slice(3);
    onChange(digits.slice(0, 9));
  }
  return (
    <div className="flex items-center gap-2">
      <span className="bg-white/10 border border-white/20 rounded-xl px-3 py-2.5 text-white/70 text-sm shrink-0">+998</span>
      <input value={value} onChange={handleChange} placeholder="90 123 45 67" inputMode="numeric" autoFocus={autoFocus} onKeyDown={onKeyDown} className={INPUT_CLS} />
    </div>
  );
}

function Modal({ title, onClose, children, wide }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className={`${GLASS} rounded-3xl p-5 sm:p-6 w-full ${wide ? 'max-w-2xl' : 'max-w-md'} max-h-[85vh] overflow-y-auto`} style={{ background: 'linear-gradient(160deg, rgba(20,20,40,0.9), rgba(30,20,50,0.85))' }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-lg font-semibold text-white">{title}</h3>
          <button onClick={onClose} className={BTN_ICON}><X size={18} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

function ConfirmModal({ message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onCancel}>
      <div onClick={e => e.stopPropagation()} className={`${GLASS} rounded-3xl p-6 w-full max-w-sm`} style={{ background: 'linear-gradient(160deg, rgba(20,20,40,0.95), rgba(30,20,50,0.9))' }}>
        <p className="text-white mb-5">{message}</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className={`${BTN_GHOST} flex-1`}>Yo'q, bekor</button>
          <button onClick={onConfirm} className="flex-1 bg-rose-500/80 hover:bg-rose-500 border border-white/30 text-white rounded-xl px-4 py-2 text-sm transition-all">Ha, tasdiqlash</button>
        </div>
      </div>
    </div>
  );
}

function ToastStack({ toasts, onDismiss }) {
  const theme = useTheme();
  if (!toasts.length) return null;
  return (
    <div className="fixed top-4 right-4 left-4 sm:left-auto z-[70] flex flex-col gap-2 sm:w-96">
      {toasts.map(n => (
        <div key={n.id} className={`${GLASS} rounded-2xl p-3.5 flex items-start gap-3`} style={{ background: `linear-gradient(135deg, ${theme.accent1}e6, ${theme.accent2}cc)`, animation: 'fadeIn 0.3s ease' }}>
          <Bell size={18} className="text-white shrink-0 mt-0.5" />
          <p className="text-white text-sm flex-1">{n.message}</p>
          <button onClick={() => onDismiss(n.id)} className="text-white/70 hover:text-white shrink-0"><X size={16} /></button>
        </div>
      ))}
    </div>
  );
}

function EmptyState({ icon: Icon, title, subtitle, action }) {
  return (
    <div className={`${GLASS_SOFT} rounded-3xl p-10 flex flex-col items-center text-center gap-3`}>
      <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center"><Icon size={26} className="text-white/60" /></div>
      <p className="text-white font-medium">{title}</p>
      {subtitle && <p className="text-white/50 text-sm max-w-sm">{subtitle}</p>}
      {action}
    </div>
  );
}

function StatCard({ label, value, sub, icon: Icon }) {
  return (
    <div className={`${GLASS} rounded-2xl p-4`}>
      <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center mb-2">{Icon && <Icon size={16} className="text-white/70" />}</div>
      <p className="font-display text-white text-xl font-bold truncate">{value}</p>
      <p className="text-white/50 text-xs mt-0.5">{label}</p>
      {sub && <p className="text-white/35 text-[11px] mt-0.5">{sub}</p>}
    </div>
  );
}

function StarPicker({ value, onChange, size = 20 }) {
  return <div className="flex gap-1">{[1, 2, 3, 4, 5].map(s => <button key={s} type="button" onClick={() => onChange(s)}><Star size={size} className={s <= value ? "fill-amber-300 text-amber-300" : "text-white/25"} /></button>)}</div>;
}

function DayPicker({ value, onChange }) {
  function toggle(d) { onChange(value.includes(d) ? value.filter(x => x !== d) : [...value, d]); }
  return <div className="flex flex-wrap gap-1.5">{WEEK_DAYS.map(d => <button key={d} type="button" onClick={() => toggle(d)} className={`text-xs px-2.5 py-1.5 rounded-lg border transition-all ${value.includes(d) ? 'bg-white/25 border-white/40 text-white' : 'bg-white/5 border-white/10 text-white/50'}`}>{d}</button>)}</div>;
}

function BranchPicker({ branches, value, onChange }) {
  function toggle(id) { onChange(value.includes(id) ? value.filter(x => x !== id) : [...value, id]); }
  return <div className="flex flex-wrap gap-1.5">{branches.map(b => <button key={b.id} type="button" onClick={() => toggle(b.id)} className={`text-xs px-2.5 py-1.5 rounded-lg border transition-all ${value.includes(b.id) ? 'bg-white/25 border-white/40 text-white' : 'bg-white/5 border-white/10 text-white/50'}`}>{b.name}</button>)}</div>;
}

function ToggleSwitch({ checked, onChange, label, sub }) {
  const theme = useTheme();
  return (
    <div className="flex items-center justify-between gap-3">
      <div><p className="text-white text-sm">{label}</p>{sub && <p className="text-white/40 text-xs">{sub}</p>}</div>
      <button onClick={() => onChange(!checked)} className={`w-11 h-6 rounded-full transition-all relative shrink-0 ${checked ? '' : 'bg-white/10 border border-white/20'}`} style={checked ? { background: `linear-gradient(to right, ${theme.accent1}, ${theme.accent2})` } : {}}>
        <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${checked ? 'left-6' : 'left-1'}`} />
      </button>
    </div>
  );
}

/* ============================== THEME SWITCHER (quick, top bar) ============================== */

function ThemeSwitcher({ director, updateDirector }) {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const allThemes = [...Object.values(THEMES), ...(director.customTheme ? [director.customTheme] : [])];
  return (
    <div className="relative">
      <button onClick={() => setOpen(o => !o)} className={BTN_ICON} title="Mavzuni tezkor almashtirish">
        {theme.id === 'night' ? <Moon size={16} /> : theme.id === 'day' ? <Sun size={16} /> : <Palette size={16} />}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className={`${GLASS} rounded-2xl p-2 absolute left-0 top-11 z-50 w-48`} style={{ background: 'linear-gradient(160deg, rgba(20,20,40,0.97), rgba(30,20,50,0.95))' }}>
            {allThemes.map(t => (
              <button key={t.id} onClick={() => { updateDirector({ ...director, themeId: t.id }); setOpen(false); }} className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all ${theme.id === t.id ? 'bg-white/20 text-white' : 'text-white/70 hover:bg-white/10'}`}>
                <span className="w-4 h-4 rounded-full shrink-0" style={{ background: t.bg }} />{t.name}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ============================== NOTIFICATION HISTORY PANEL ============================== */

function NotificationBell({ log, onClear }) {
  const [open, setOpen] = useState(false);
  const unread = log.filter(n => !n.read).length;
  return (
    <div className="relative">
      <button onClick={() => setOpen(o => !o)} className={`${BTN_ICON} relative`}>
        <Bell size={16} />
        {unread > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] flex items-center justify-center font-bold">{unread > 9 ? '9+' : unread}</span>}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className={`${GLASS} rounded-2xl p-2 absolute right-0 top-11 z-50 w-72 max-h-80 overflow-y-auto`} style={{ background: 'linear-gradient(160deg, rgba(20,20,40,0.97), rgba(30,20,50,0.95))' }}>
            <div className="flex items-center justify-between px-2 py-1.5">
              <p className="text-white text-xs font-medium">Bildirishnomalar</p>
              {log.length > 0 && <button onClick={onClear} className="text-white/40 hover:text-white text-[11px]">Tozalash</button>}
            </div>
            {log.length === 0 ? <p className="text-white/40 text-xs px-2 py-4 text-center">Hozircha bildirishnoma yo'q.</p> : log.map(n => (
              <div key={n.id} className="px-3 py-2 rounded-xl hover:bg-white/5">
                <p className="text-white/90 text-xs">{n.message}</p>
                <p className="text-white/35 text-[10px] mt-0.5">{timeAgo(n.createdAt)}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ============================== TEACHER-APP DATA HELPERS (read-only) ============================== */

function opActiveStudents(opData) { return (opData?.students || []).filter(s => (s.groupIds || []).length > 0).length; }
function opFrozenStudents(opData) { return (opData?.students || []).filter(s => (s.groupIds || []).length === 0).length; }
function opGroups(opData) { return opData?.groups || []; }
function opGroupStudentCount(opData, groupId) { return (opData?.students || []).filter(s => (s.groupIds || []).includes(groupId)).length; }
function opStudentsInGroups(opData, groupIds) { return (opData?.students || []).filter(s => (s.groupIds || []).some(id => groupIds.includes(id))); }

function computeBranchStats(branch, directorData, opData) {
  const courses = directorData.courses.filter(c => c.branchId === branch.id);
  const courseIds = courses.map(c => c.id);
  const groups = opGroups(opData).filter(g => courseIds.includes(g.courseId));
  const groupIds = groups.map(g => g.id);
  const activeStudents = opStudentsInGroups(opData, groupIds).length;
  const teacherCount = directorData.teachersHR.filter(t => t.branchId === branch.id).length;
  const now = new Date(); const thisMonth = now.getMonth(), thisYear = now.getFullYear();
  const branchFinance = directorData.finance.filter(f => f.branchId === branch.id);
  const inThisMonth = f => new Date(f.date).getMonth() === thisMonth && new Date(f.date).getFullYear() === thisYear;
  const collected = branchFinance.filter(f => f.type === 'income' && f.status === 'approved' && inThisMonth(f)).reduce((s, f) => s + f.amount, 0);
  const expenses = branchFinance.filter(f => f.type === 'expense' && f.status === 'approved' && inThisMonth(f)).reduce((s, f) => s + f.amount, 0);
  const expectedRevenue = courses.reduce((sum, c) => {
    const cGroups = opGroups(opData).filter(g => g.courseId === c.id);
    const ids = new Set(); cGroups.forEach(g => opStudentsInGroups(opData, [g.id]).forEach(s => ids.add(s.id)));
    return sum + c.price * ids.size;
  }, 0);
  return { collected, expenses, netProfit: collected - expenses, expectedRevenue, activeStudents, teacherCount, courseCount: courses.length, groupCount: groups.length };
}

/* ============================== AUTH ============================== */

function TwoFactorStep({ demoCode, onVerify, onBack, onResend }) {
  const [code, setCode] = useState('');
  const [seconds, setSeconds] = useState(60);
  const [error, setError] = useState('');
  useEffect(() => { if (seconds <= 0) return; const t = setInterval(() => setSeconds(s => Math.max(0, s - 1)), 1000); return () => clearInterval(t); }, [seconds]);
  function verify() { if (code === demoCode) onVerify(); else setError("Kod noto'g'ri."); }
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-white/70 text-sm mb-1"><ShieldCheck size={16} /> Ikki bosqichli tekshiruv</div>
      <p className="text-white/50 text-xs">Telefoningizga yuborilgan 5 xonali kodni kiriting.</p>
      <div className={`${GLASS_SOFT} rounded-xl px-3 py-2 text-center text-white/60 text-xs`}>Demo kod: <span className="text-white font-semibold tracking-widest">{demoCode}</span></div>
      <input value={code} onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 5))} placeholder="00000" inputMode="numeric" className={`${INPUT_CLS} text-center tracking-[0.5em] text-lg`} autoFocus onKeyDown={e => e.key === 'Enter' && verify()} />
      <div className="flex items-center justify-between text-xs">
        {seconds > 0 ? <span className="text-white/40 flex items-center gap-1"><Timer size={13} /> {seconds}s</span> : <button onClick={() => { onResend(); setSeconds(60); }} className="text-white/80 hover:text-white">Kodni qayta yuborish</button>}
        <button onClick={onBack} className="text-white/50 hover:text-white">Orqaga</button>
      </div>
      {error && <p className="text-rose-300 text-xs">{error}</p>}
      <PrimaryButton onClick={verify} className="w-full"><ShieldCheck size={16} /> Tasdiqlash</PrimaryButton>
    </div>
  );
}

function DirectorAuth({ directorData, onLoginDirector, onLoginManager, onRegister }) {
  const [mode, setMode] = useState('login');
  const [roleTab, setRoleTab] = useState('director');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [twoFAStep, setTwoFAStep] = useState(null);

  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regCenter, setRegCenter] = useState('');
  const [regAddress, setRegAddress] = useState('');
  const [regLogo, setRegLogo] = useState(null);

  async function handleLogin() {
    setError(''); setBusy(true);
    const hash = await hashPassword(password);
    const normalized = normalizePhone(phone);
    if (roleTab === 'director') {
      const dir = directorData.directors.find(d => normalizePhone(d.phone) === normalized && d.passwordHash === hash);
      setBusy(false);
      if (!dir) { setError("Telefon raqam yoki parol noto'g'ri."); return; }
      if (dir.twoFactorEnabled) { setTwoFAStep({ directorId: dir.id, demoCode: generateDemoCode() }); return; }
      onLoginDirector(dir.id);
    } else {
      const mgr = directorData.managers.find(m => normalizePhone(m.phone) === normalized && m.passwordHash === hash);
      setBusy(false);
      if (mgr) onLoginManager(mgr.id); else setError("Telefon raqam yoki parol noto'g'ri.");
    }
  }

  async function handleRegister() {
    setError('');
    if (!regName.trim() || !regPhone.trim() || !regPassword || !regCenter.trim()) { setError("Barcha majburiy maydonlarni to'ldiring."); return; }
    if (regPassword.length < 4) { setError("Parol kamida 4 belgidan iborat bo'lsin."); return; }
    const normalized = normalizePhone(regPhone);
    if (directorData.directors.some(d => normalizePhone(d.phone) === normalized)) { setError("Bu telefon raqam bilan direktor allaqachon ro'yxatdan o'tgan."); return; }
    setBusy(true);
    const passwordHash = await hashPassword(regPassword);
    setBusy(false);
    onRegister({ name: regName.trim(), phone: regPhone, passwordHash, centerName: regCenter.trim(), address: regAddress.trim(), logo: regLogo });
  }

  async function handleLogoUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    try { const raw = await readFileAsDataURL(file); setRegLogo(await compressImageDataUrl(raw, 240)); } catch (err) { console.error(err); }
  }

  const theme = useTheme();

  return (
    <div className="min-h-screen w-full text-white relative flex" style={{ background: theme.bg, fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif" }}>
      <GlobalStyleTag />
      <BackgroundBlobs />
      <div className="hidden lg:flex flex-1 flex-col justify-center px-16 relative z-10">
        <p className="text-5xl mb-4">🏫</p>
        <h1 className="font-display text-4xl font-bold mb-3 leading-tight">O'quv markazingizni<br />bir joydan boshqaring</h1>
        <p className="text-white/60 text-base max-w-md">Filiallar, menejerlar, o'qituvchilar, kurslar, to'lovlar va moliya — barchasi bitta direktor panelida.</p>
      </div>
      <div className="flex-1 flex items-center justify-center p-4 relative z-10">
        <div className={`${GLASS} rounded-3xl p-6 sm:p-8 w-full max-w-sm`} style={{ background: 'linear-gradient(160deg, rgba(15,15,35,0.8), rgba(25,15,40,0.75))' }}>
          <div className="text-center mb-6 lg:hidden"><p className="text-3xl mb-2">🏫</p><h1 className="font-display text-xl font-bold">Direktor Panel</h1></div>
          {twoFAStep ? (
            <TwoFactorStep demoCode={twoFAStep.demoCode} onVerify={() => onLoginDirector(twoFAStep.directorId)} onBack={() => setTwoFAStep(null)} onResend={() => setTwoFAStep(s => ({ ...s, demoCode: generateDemoCode() }))} />
          ) : (
            <>
              <div className="flex gap-2 mb-5 bg-white/5 border border-white/10 rounded-2xl p-1">
                <button onClick={() => { setMode('login'); setError(''); }} className={`flex-1 text-sm py-2 rounded-xl transition-all ${mode === 'login' ? 'bg-white/20 text-white' : 'text-white/50'}`}>Kirish</button>
                <button onClick={() => { setMode('register'); setError(''); }} className={`flex-1 text-sm py-2 rounded-xl transition-all ${mode === 'register' ? 'bg-white/20 text-white' : 'text-white/50'}`}>Ro'yxatdan o'tish</button>
              </div>
              {mode === 'login' ? (
                <div className="space-y-3">
                  <div className="flex gap-2 mb-1 bg-white/5 border border-white/10 rounded-xl p-1">
                    <button onClick={() => setRoleTab('director')} className={`flex-1 text-xs py-1.5 rounded-lg transition-all ${roleTab === 'director' ? 'bg-white/20 text-white' : 'text-white/50'}`}>Direktor</button>
                    <button onClick={() => setRoleTab('manager')} className={`flex-1 text-xs py-1.5 rounded-lg transition-all ${roleTab === 'manager' ? 'bg-white/20 text-white' : 'text-white/50'}`}>Menejer</button>
                  </div>
                  <div><label className={LABEL_CLS}>Telefon raqam</label><PhoneInput value={phone} onChange={setPhone} autoFocus /></div>
                  <div className="relative">
                    <label className={LABEL_CLS}>Parol</label>
                    <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} className={INPUT_CLS} onKeyDown={e => e.key === 'Enter' && handleLogin()} />
                    <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-3 top-[34px] text-white/50 hover:text-white">{showPw ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                  </div>
                  {error && <p className="text-rose-300 text-xs">{error}</p>}
                  <PrimaryButton onClick={handleLogin} disabled={busy} className="w-full">{busy ? <Loader2 size={16} className="animate-spin" /> : <LogIn size={16} />} Kirish</PrimaryButton>
                  <p className="text-white/30 text-[11px] text-center pt-1">Namuna direktor: +998 90 123 40 00 / direktor123</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div><label className={LABEL_CLS}>To'liq ism</label><input value={regName} onChange={e => setRegName(e.target.value)} placeholder="Ism Familiya" className={INPUT_CLS} autoFocus /></div>
                  <div><label className={LABEL_CLS}>Telefon raqam</label><PhoneInput value={regPhone} onChange={setRegPhone} /></div>
                  <div><label className={LABEL_CLS}>Parol</label><input type={showPw ? 'text' : 'password'} value={regPassword} onChange={e => setRegPassword(e.target.value)} className={INPUT_CLS} /></div>
                  <div><label className={LABEL_CLS}>O'quv markazi nomi</label><input value={regCenter} onChange={e => setRegCenter(e.target.value)} placeholder="Masalan: Iqbol Ta'lim" className={INPUT_CLS} /></div>
                  <div><label className={LABEL_CLS}>Yashash / manzil</label><input value={regAddress} onChange={e => setRegAddress(e.target.value)} placeholder="Shahar, tuman" className={INPUT_CLS} /></div>
                  <div>
                    <label className={LABEL_CLS}>Logotip (ixtiyoriy)</label>
                    <div className="flex items-center gap-3">
                      {regLogo && <img src={regLogo} alt="" className="w-12 h-12 rounded-xl object-cover border border-white/20" />}
                      <label className={`${BTN_GHOST} cursor-pointer`}><input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} /><Upload size={14} /> Yuklash</label>
                    </div>
                  </div>
                  {error && <p className="text-rose-300 text-xs">{error}</p>}
                  <PrimaryButton onClick={handleRegister} disabled={busy} className="w-full">{busy ? <Loader2 size={16} className="animate-spin" /> : <Building2 size={16} />} Ro'yxatdan o'tish</PrimaryButton>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ============================== DASHBOARD ============================== */

function DashboardHome({ scopeBranches, directorData, opData, centerLabel, allBranches }) {
  const theme = useTheme();
  const [branchId, setBranchId] = useState('all');
  const effectiveBranches = branchId === 'all' ? scopeBranches : scopeBranches.filter(b => b.id === branchId);
  const branchIds = effectiveBranches.map(b => b.id);
  const finance = directorData.finance.filter(f => branchIds.includes(f.branchId));

  const now = new Date();
  const thisMonth = now.getMonth(), thisYear = now.getFullYear();
  const month = thisMonthKey();
  const inThisMonth = f => { const d = new Date(f.date); return d.getMonth() === thisMonth && d.getFullYear() === thisYear; };

  const collected = finance.filter(f => f.type === 'income' && f.status === 'approved' && inThisMonth(f)).reduce((s, f) => s + f.amount, 0);
  const expenses = finance.filter(f => f.type === 'expense' && f.status === 'approved' && inThisMonth(f)).reduce((s, f) => s + f.amount, 0);
  const pendingCount = finance.filter(f => f.status === 'pending').length;

  const courses = directorData.courses.filter(c => branchIds.includes(c.branchId));
  const expectedRevenue = courses.reduce((sum, c) => {
    const cGroups = opGroups(opData).filter(g => g.courseId === c.id);
    const studentIds = new Set(); cGroups.forEach(g => opStudentsInGroups(opData, [g.id]).forEach(s => studentIds.add(s.id)));
    return sum + c.price * studentIds.size;
  }, 0);
  const activeStudents = opActiveStudents(opData);
  const frozenStudents = opFrozenStudents(opData);

  const monthlyTrend = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(thisYear, thisMonth - i, 1);
    const mIncome = finance.filter(f => f.type === 'income' && f.status === 'approved' && new Date(f.date).getMonth() === d.getMonth() && new Date(f.date).getFullYear() === d.getFullYear()).reduce((s, f) => s + f.amount, 0);
    const mExpense = finance.filter(f => f.type === 'expense' && f.status === 'approved' && new Date(f.date).getMonth() === d.getMonth() && new Date(f.date).getFullYear() === d.getFullYear()).reduce((s, f) => s + f.amount, 0);
    monthlyTrend.push({ name: MONTHS_UZ[d.getMonth()].slice(0, 3), Kirim: mIncome, Chiqim: mExpense });
  }

  const expenseByCategory = {};
  finance.filter(f => f.type === 'expense' && f.status === 'approved').forEach(f => { expenseByCategory[f.category] = (expenseByCategory[f.category] || 0) + f.amount; });
  const pieData = Object.entries(expenseByCategory).map(([name, value]) => ({ name, value }));
  const pieColors = [theme.accent1, theme.accent2, '#f59e0b', '#10b981', '#0ea5e9', '#f43f5e', '#84cc16'];

  const courseRevenue = courses.map(c => {
    const cGroups = opGroups(opData).filter(g => g.courseId === c.id);
    const studentIds = new Set(); cGroups.forEach(g => opStudentsInGroups(opData, [g.id]).forEach(s => studentIds.add(s.id)));
    return { name: c.name.length > 14 ? c.name.slice(0, 14) + '…' : c.name, Daromad: c.price * studentIds.size, Talaba: studentIds.size };
  }).sort((a, b) => b.Daromad - a.Daromad).slice(0, 6);

  // Payment method breakdown (this month)
  const monthPayments = directorData.payments.filter(p => p.month === month && courses.some(c => c.id === p.courseId));
  const cashTotal = monthPayments.filter(p => p.method === 'cash').reduce((s, p) => s + p.amount, 0);
  const cardTotal = monthPayments.filter(p => p.method === 'card').reduce((s, p) => s + p.amount, 0);
  const paymentMethodData = [{ name: 'Naqd', value: cashTotal }, { name: 'Plastik', value: cardTotal }].filter(d => d.value > 0);

  // Teacher rating comparison
  const teacherRatingData = directorData.teachersHR.filter(t => branchIds.includes(t.branchId)).map(t => ({ name: t.name.length > 10 ? t.name.slice(0, 10) + '…' : t.name, Baho: t.rating || 0 }));

  // Branch comparison (only meaningful with >1 branch)
  const branchCompareData = scopeBranches.length > 1 ? scopeBranches.map(b => {
    const st = computeBranchStats(b, directorData, opData);
    return { name: b.name.length > 12 ? b.name.slice(0, 12) + '…' : b.name, Foyda: st.netProfit };
  }) : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div><h2 className="font-display text-2xl font-bold text-white">Bosh sahifa</h2><p className="text-white/50 text-sm mt-0.5">{centerLabel} — {MONTHS_UZ[thisMonth]} {thisYear}</p></div>
        {allBranches && scopeBranches.length > 1 && (
          <select value={branchId} onChange={e => setBranchId(e.target.value)} className={`${INPUT_CLS} w-auto`}>
            <option value="all" className="bg-violet-950">Barcha filiallar</option>
            {scopeBranches.map(b => <option key={b.id} value={b.id} className="bg-violet-950">{b.name}</option>)}
          </select>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={Users} label="Faol o'quvchilar" value={activeStudents} sub={frozenStudents ? `${frozenStudents} nofaol` : undefined} />
        <StatCard icon={Wallet} label="Kutilayotgan oylik daromad" value={money(expectedRevenue) + " so'm"} />
        <StatCard icon={CheckCircle2} label="Bu oy yig'ilgan" value={money(collected) + " so'm"} />
        <StatCard icon={TrendingDown} label="Bu oy xarajat" value={money(expenses) + " so'm"} />
      </div>

      {pendingCount > 0 && (
        <div className={`${GLASS} rounded-2xl p-4 flex items-center gap-3`}><Bell size={18} style={{ color: theme.accent1 }} /><p className="text-white text-sm flex-1">{pendingCount} ta xarajat tasdiqlashni kutmoqda.</p></div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className={`${GLASS} rounded-3xl p-5`}>
          <h3 className="font-display text-white font-semibold mb-4">Oylik kirim / chiqim (so'nggi 6 oy)</h3>
          <div style={{ width: '100%', height: 220 }}>
            <ResponsiveContainer>
              <LineChart data={monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" fontSize={11} />
                <YAxis stroke="rgba(255,255,255,0.4)" fontSize={11} tickFormatter={v => (v / 1000000).toFixed(1) + 'M'} />
                <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 12, color: 'white' }} formatter={v => money(v) + " so'm"} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="Kirim" stroke="#34d399" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="Chiqim" stroke="#fb7185" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={`${GLASS} rounded-3xl p-5`}>
          <h3 className="font-display text-white font-semibold mb-4">Xarajatlar turlari bo'yicha</h3>
          {pieData.length === 0 ? <p className="text-white/40 text-sm py-10 text-center">Hali xarajat kiritilmagan.</p> : (
            <div style={{ width: '100%', height: 220 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name }) => name}>
                    {pieData.map((entry, i) => <Cell key={entry.name} fill={pieColors[i % pieColors.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 12, color: 'white' }} formatter={v => money(v) + " so'm"} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className={`${GLASS} rounded-3xl p-5`}>
          <h3 className="font-display text-white font-semibold mb-4 flex items-center gap-2"><CreditCard size={16} /> To'lov turlari (bu oy)</h3>
          {paymentMethodData.length === 0 ? <p className="text-white/40 text-sm py-10 text-center">Bu oy hali to'lov qabul qilinmagan.</p> : (
            <div style={{ width: '100%', height: 200 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={paymentMethodData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75} label={({ name, value }) => `${name}: ${(value / 1000).toFixed(0)}k`}>
                    <Cell fill="#10b981" /><Cell fill="#0ea5e9" />
                  </Pie>
                  <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 12, color: 'white' }} formatter={v => money(v) + " so'm"} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className={`${GLASS} rounded-3xl p-5`}>
          <h3 className="font-display text-white font-semibold mb-4 flex items-center gap-2"><GraduationCap size={16} /> O'qituvchilar bahosi</h3>
          {teacherRatingData.length === 0 ? <p className="text-white/40 text-sm py-10 text-center">Hali o'qituvchi yo'q.</p> : (
            <div style={{ width: '100%', height: 200 }}>
              <ResponsiveContainer>
                <BarChart data={teacherRatingData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                  <XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" fontSize={10} />
                  <YAxis stroke="rgba(255,255,255,0.4)" fontSize={11} domain={[0, 5]} />
                  <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 12, color: 'white' }} />
                  <Bar dataKey="Baho" fill="#fbbf24" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      <div className={`${GLASS} rounded-3xl p-5`}>
        <h3 className="font-display text-white font-semibold mb-4 flex items-center gap-2"><Sparkles size={16} className="text-amber-300" /> Kurslar bo'yicha o'quvchilar soni va daromad</h3>
        {courseRevenue.length === 0 ? <p className="text-white/40 text-sm py-6 text-center">Hali kurs yo'q — "Kurslar" bo'limidan qo'shing.</p> : (
          <div style={{ width: '100%', height: 220 }}>
            <ResponsiveContainer>
              <BarChart data={courseRevenue} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" horizontal={false} />
                <XAxis type="number" stroke="rgba(255,255,255,0.4)" fontSize={11} tickFormatter={v => (v / 1000000).toFixed(1) + 'M'} />
                <YAxis type="category" dataKey="name" stroke="rgba(255,255,255,0.6)" fontSize={11} width={100} />
                <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 12, color: 'white' }} formatter={v => money(v) + " so'm"} />
                <Bar dataKey="Daromad" fill={theme.accent1} radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {branchCompareData.length > 0 && (
        <div className={`${GLASS} rounded-3xl p-5`}>
          <h3 className="font-display text-white font-semibold mb-4 flex items-center gap-2"><Building2 size={16} /> Filiallar bo'yicha sof foyda (bu oy)</h3>
          <div style={{ width: '100%', height: 220 }}>
            <ResponsiveContainer>
              <BarChart data={branchCompareData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" fontSize={11} />
                <YAxis stroke="rgba(255,255,255,0.4)" fontSize={11} tickFormatter={v => (v / 1000000).toFixed(1) + 'M'} />
                <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 12, color: 'white' }} formatter={v => money(v) + " so'm"} />
                <Bar dataKey="Foyda" fill={theme.accent2} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================== BRANCHES PAGE ============================== */

function BranchesPage({ director, directorData, opData, openModal }) {
  const myBranches = directorData.branches.filter(b => b.directorId === director.id);
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div><h2 className="font-display text-2xl font-bold text-white">Filiallar</h2><p className="text-white/50 text-sm mt-0.5">{myBranches.length} ta filial</p></div>
        <PrimaryButton onClick={() => openModal({ type: 'branchForm' })}><Plus size={16} /> Yangi filial</PrimaryButton>
      </div>
      {myBranches.length === 0 ? (
        <EmptyState icon={Building2} title="Hali filial yo'q" subtitle="Birinchi filialingizni qo'shing." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {myBranches.map(b => {
            const stats = computeBranchStats(b, directorData, opData);
            return (
              <div key={b.id} className={`${GLASS} rounded-3xl p-5 cursor-pointer hover:bg-white/15 transition-colors`} onClick={() => openModal({ type: 'branchDetail', branchId: b.id })}>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-3 h-3 rounded-full shrink-0" style={{ background: b.color }} />
                    <div className="min-w-0"><p className="font-display text-white font-semibold truncate">{b.name}</p><p className="text-white/40 text-xs truncate">{b.address || 'Manzil kiritilmagan'}</p></div>
                  </div>
                  <button onClick={e => { e.stopPropagation(); openModal({ type: 'branchForm', editing: b }); }} className={BTN_ICON}><Pencil size={14} /></button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div><p className="text-white text-base font-bold">{money(stats.collected)}</p><p className="text-white/40 text-[10px]">Yig'ilgan</p></div>
                  <div><p className="text-rose-300 text-base font-bold">{money(stats.expenses)}</p><p className="text-white/40 text-[10px]">Xarajat</p></div>
                  <div><p className="text-emerald-300 text-base font-bold">{money(stats.netProfit)}</p><p className="text-white/40 text-[10px]">Sof foyda</p></div>
                </div>
                <p className="text-white/35 text-[11px] mt-2">{stats.activeStudents} o'quvchi · {stats.teacherCount} o'qituvchi · {stats.courseCount} kurs — to'liq hisobot uchun bosing</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function BranchDetailModal({ branch, directorData, opData, onClose }) {
  const stats = computeBranchStats(branch, directorData, opData);
  return (
    <Modal title={branch.name} onClose={onClose} wide>
      <p className="text-white/50 text-xs mb-4">{branch.address}</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <StatCard icon={CheckCircle2} label="Yig'ilgan (bu oy)" value={money(stats.collected) + " so'm"} />
        <StatCard icon={TrendingDown} label="Xarajat (bu oy)" value={money(stats.expenses) + " so'm"} />
        <StatCard icon={TrendingUp} label="Sof foyda (bu oy)" value={money(stats.netProfit) + " so'm"} />
        <StatCard icon={Wallet} label="Kutilayotgan oylik" value={money(stats.expectedRevenue) + " so'm"} />
        <StatCard icon={Users} label="Faol o'quvchi" value={stats.activeStudents} />
        <StatCard icon={GraduationCap} label="O'qituvchilar" value={stats.teacherCount} />
        <StatCard icon={BookOpen} label="Kurslar" value={stats.courseCount} />
        <StatCard icon={ClipboardList} label="Guruhlar" value={stats.groupCount} />
      </div>
    </Modal>
  );
}

/* ============================== MANAGERS PAGE ============================== */

function ManagersPage({ director, directorData, onImpersonate, openModal }) {
  const myBranches = directorData.branches.filter(b => b.directorId === director.id);
  const myBranchIds = myBranches.map(b => b.id);
  const managers = directorData.managers.filter(m => (m.branchIds || []).some(id => myBranchIds.includes(id))).sort((a, b) => (b.rating || 0) - (a.rating || 0));
  const best = managers[0];
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div><h2 className="font-display text-2xl font-bold text-white">Menejerlar</h2><p className="text-white/50 text-sm mt-0.5">{managers.length} ta menejer</p></div>
        <PrimaryButton onClick={() => openModal({ type: 'managerForm' })} disabled={myBranches.length === 0}><Plus size={16} /> Menejer qo'shish</PrimaryButton>
      </div>
      {best && best.rating >= 4 && (
        <div className={`${GLASS} rounded-3xl p-5 flex items-center gap-3`}><span className="text-2xl">🏆</span><div><p className="text-white/50 text-xs">Eng yaxshi ishlayotgan</p><p className="font-display text-white font-semibold">{best.name} — {best.rating}/5</p></div></div>
      )}
      {managers.length === 0 ? (
        <EmptyState icon={Users} title="Hali menejer yo'q" subtitle="Avval filial yarating, keyin menejer qo'shing." />
      ) : (
        <div className="space-y-2">
          {managers.map(m => {
            const branches = myBranches.filter(b => (m.branchIds || []).includes(b.id));
            return (
              <div key={m.id} className={`${GLASS} rounded-2xl p-4 flex items-center gap-3 flex-wrap`}>
                <Avatar name={m.name} size={42} />
                <div className="min-w-0 flex-1">
                  <p className="text-white text-sm font-medium truncate">{m.name}</p>
                  <p className="text-white/40 text-xs truncate">{displayPhone(m.phone)} · {branches.map(b => b.name).join(', ') || 'Filialsiz'}</p>
                  <div className="flex items-center gap-0.5 mt-0.5">{[1, 2, 3, 4, 5].map(s => <Star key={s} size={11} className={s <= (m.rating || 0) ? "fill-amber-300 text-amber-300" : "text-white/20"} />)}</div>
                </div>
                <p className="text-white text-sm font-semibold shrink-0">{money(m.monthlySalary)} so'm</p>
                <button onClick={() => openModal({ type: 'managerForm', editing: m })} className={BTN_ICON} title="Tahrirlash"><Pencil size={14} /></button>
                <button onClick={() => openModal({ type: 'managerPermissions', managerId: m.id })} className={BTN_ICON} title="Ruxsatlar"><Settings size={14} /></button>
                <button onClick={() => onImpersonate(m.id)} className={BTN_GHOST} title="Menejer sifatida kirish"><ArrowRightLeft size={14} /> Kirish</button>
                <button onClick={() => openModal({ type: 'confirm', message: `${m.name}ni o'chirasizmi?`, action: { kind: 'deleteManager', managerId: m.id } })} className={BTN_ICON}><Trash2 size={14} /></button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ManagerPermissionsModal({ manager, onSave, onClose }) {
  const [allowed, setAllowed] = useState(manager.allowedPages || MANAGER_NAV_ALL.map(p => p.id));
  function toggle(id) { setAllowed(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]); }
  return (
    <Modal title={`${manager.name} — ruxsatlar`} onClose={onClose}>
      <div className="space-y-2">
        <p className="text-white/50 text-xs mb-2">Bu menejer qaysi sahifalarga kira olishini belgilang.</p>
        {MANAGER_NAV_ALL.map(p => (
          <label key={p.id} className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl p-3 cursor-pointer">
            <input type="checkbox" checked={allowed.includes(p.id)} onChange={() => toggle(p.id)} className="w-4 h-4 accent-blue-500" />
            <p.icon size={16} className="text-white/60" /><span className="text-white text-sm flex-1">{p.label}</span>
          </label>
        ))}
        <PrimaryButton onClick={() => { onSave(allowed); onClose(); }} className="w-full mt-2"><Check size={15} /> Saqlash</PrimaryButton>
      </div>
    </Modal>
  );
}

/* ============================== TEACHERS HR ============================== */

function TeachersHR({ scopeBranches, directorData, opData, openModal, canEdit }) {
  const scopeIds = scopeBranches.map(b => b.id);
  const teachers = directorData.teachersHR.filter(t => scopeIds.includes(t.branchId)).sort((a, b) => (b.rating || 0) - (a.rating || 0));
  const best = teachers[0];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div><h2 className="font-display text-2xl font-bold text-white">O'qituvchilar</h2><p className="text-white/50 text-sm mt-0.5">Ulush foizi, faol o'quvchilar va samaradorlik</p></div>
        {canEdit && <PrimaryButton onClick={() => openModal({ type: 'teacherHRForm' })}><Plus size={16} /> O'qituvchi qo'shish</PrimaryButton>}
      </div>

      {best && (
        <div className={`${GLASS} rounded-3xl p-5 flex items-center gap-3`}><span className="text-2xl">🏆</span><div><p className="text-white/50 text-xs">Eng yuqori baholangan</p><p className="font-display text-white font-semibold">{best.name} — {best.rating}/5</p></div></div>
      )}

      {teachers.length === 0 ? (
        <EmptyState icon={GraduationCap} title="Hali o'qituvchi yo'q" />
      ) : (
        <div className="space-y-2">
          {teachers.map(t => {
            const branch = directorData.branches.find(b => b.id === t.branchId);
            const branchStats = branch ? computeBranchStats(branch, directorData, opData) : null;
            const computedPay = branchStats ? Math.round(branchStats.expectedRevenue * (t.revenueSharePercent || 0) / 100) : 0;
            const activeStudents = opActiveStudents(opData);
            return (
              <div key={t.id} className={`${GLASS} rounded-2xl p-4 space-y-3`}>
                <div className="flex items-center gap-3 flex-wrap">
                  <Avatar name={t.name} color={branch?.color} size={42} />
                  <div className="min-w-0 flex-1">
                    <p className="text-white text-sm font-medium truncate">{t.name}</p>
                    <p className="text-white/40 text-xs truncate">{branch?.name} · {displayPhone(t.phone)}</p>
                  </div>
                  <div className="flex items-center gap-0.5">{[1, 2, 3, 4, 5].map(s => <Star key={s} size={11} className={s <= (t.rating || 0) ? "fill-amber-300 text-amber-300" : "text-white/20"} />)}</div>
                  {canEdit && <button onClick={() => openModal({ type: 'teacherHRForm', editing: t })} className={BTN_ICON}><Pencil size={14} /></button>}
                  {canEdit && <button onClick={() => openModal({ type: 'confirm', message: `${t.name}ni ro'yxatdan o'chirasizmi?`, action: { kind: 'deleteTeacherHR', teacherHRId: t.id } })} className={BTN_ICON}><Trash2 size={14} /></button>}
                </div>
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/10">
                  <div><p className="text-white text-sm font-bold flex items-center gap-1"><Percent size={12} />{t.revenueSharePercent || 0}%</p><p className="text-white/40 text-[10px]">Ulush foizi</p></div>
                  <div><p className="text-white text-sm font-bold">{activeStudents}</p><p className="text-white/40 text-[10px]">Faol o'quvchi</p></div>
                  <div><p className="text-emerald-300 text-sm font-bold">{money(computedPay)}</p><p className="text-white/40 text-[10px]">Hisoblangan maosh/oy</p></div>
                </div>
                <div className="flex gap-2 text-[10px] text-white/35">
                  {t.canCreateGroups === false && <span className="bg-white/5 px-2 py-0.5 rounded-full">Guruh ochish taqiqlangan</span>}
                  {t.canReceivePayments === false && <span className="bg-white/5 px-2 py-0.5 rounded-full">To'lov qabul qila olmaydi</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ============================== HOLIDAYS ============================== */

function HolidaysPage({ directorId, directorData, addHoliday, removeHoliday, canEdit }) {
  const [name, setName] = useState('');
  const [date, setDate] = useState(todayISO());
  const [note, setNote] = useState('');
  const holidays = directorData.holidays.filter(h => h.directorId === directorId).sort((a, b) => new Date(a.date) - new Date(b.date));
  function submit() { if (!name.trim() || !date) return; addHoliday({ name: name.trim(), date, note: note.trim() }); setName(''); setNote(''); }
  return (
    <div className="space-y-5">
      <div><h2 className="font-display text-2xl font-bold text-white">Bayram va ta'til kunlari</h2><p className="text-white/50 text-sm mt-0.5">Butun markaz uchun umumiy e'lon</p></div>
      {canEdit && (
        <div className={`${GLASS} rounded-3xl p-5 space-y-3`}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div><label className={LABEL_CLS}>Nomi</label><input value={name} onChange={e => setName(e.target.value)} placeholder="Masalan: Mustaqillik kuni" className={INPUT_CLS} /></div>
            <div><label className={LABEL_CLS}>Sana</label><input type="date" value={date} onChange={e => setDate(e.target.value)} className={INPUT_CLS} /></div>
          </div>
          <div><label className={LABEL_CLS}>Izoh (ixtiyoriy)</label><input value={note} onChange={e => setNote(e.target.value)} className={INPUT_CLS} /></div>
          <PrimaryButton onClick={submit}><Plus size={15} /> Qo'shish</PrimaryButton>
        </div>
      )}
      {holidays.length === 0 ? <EmptyState icon={PartyPopper} title="Hali bayram kuni yo'q" /> : (
        <div className="space-y-2">
          {holidays.map(h => (
            <div key={h.id} className={`${GLASS_SOFT} rounded-2xl p-4 flex items-center justify-between gap-3`}>
              <div className="flex items-center gap-3"><PartyPopper size={18} className="text-amber-300 shrink-0" /><div><p className="text-white text-sm font-medium">{h.name}</p><p className="text-white/40 text-xs">{formatDate(h.date)}{h.note ? ` · ${h.note}` : ''}</p></div></div>
              {canEdit && <button onClick={() => removeHoliday(h.id)} className={BTN_ICON}><X size={14} /></button>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ============================== FINANCE ============================== */

function FinancePage({ role, scopeBranchIds, directorData, allBranches, addFinance, approveFinance, rejectFinance }) {
  const scopedBranches = allBranches.filter(b => scopeBranchIds.includes(b.id));
  const [showForm, setShowForm] = useState(false);
  const [type, setType] = useState('expense');
  const [branchId, setBranchId] = useState(scopedBranches[0]?.id || '');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0]);
  const [note, setNote] = useState('');
  const [date, setDate] = useState(todayISO());
  const [approvalMode, setApprovalMode] = useState('manager');
  const [error, setError] = useState('');

  const relevant = directorData.finance.filter(f => scopeBranchIds.includes(f.branchId));
  const pending = relevant.filter(f => f.status === 'pending').sort((a, b) => b.createdAt - a.createdAt);
  const history = relevant.filter(f => f.status === 'approved').sort((a, b) => b.createdAt - a.createdAt).slice(0, 30);
  const totalIncome = relevant.filter(f => f.type === 'income' && f.status === 'approved').reduce((s, f) => s + f.amount, 0);
  const totalExpense = relevant.filter(f => f.type === 'expense' && f.status === 'approved').reduce((s, f) => s + f.amount, 0);

  function submit() {
    setError('');
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) { setError("To'g'ri summa kiriting."); return; }
    if (!branchId) { setError('Filialni tanlang.'); return; }
    addFinance({ branchId, type, amount: amt, category, note: note.trim(), date, status: approvalMode === 'manager' ? 'approved' : 'pending', approvalMode });
    setAmount(''); setNote(''); setShowForm(false);
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div><h2 className="font-display text-2xl font-bold text-white">Moliya</h2><p className="text-white/50 text-sm mt-0.5">Xarajatlar va tasdiqlashlar (to'lovlar avtomatik kirim sifatida hisoblanadi)</p></div>
        <PrimaryButton onClick={() => setShowForm(v => !v)}><Plus size={16} /> Xarajat qo'shish</PrimaryButton>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <StatCard icon={TrendingUp} label="Jami kirim" value={money(totalIncome) + " so'm"} />
        <StatCard icon={TrendingDown} label="Jami xarajat" value={money(totalExpense) + " so'm"} />
      </div>

      {showForm && (
        <div className={`${GLASS} rounded-3xl p-5 space-y-3`}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {scopedBranches.length > 1 && (<div><label className={LABEL_CLS}>Filial</label><select value={branchId} onChange={e => setBranchId(e.target.value)} className={INPUT_CLS}>{scopedBranches.map(b => <option key={b.id} value={b.id} className="bg-violet-950">{b.name}</option>)}</select></div>)}
            <div><label className={LABEL_CLS}>Summa (so'm)</label><input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0" className={INPUT_CLS} /></div>
            <div><label className={LABEL_CLS}>Kategoriya</label><select value={category} onChange={e => setCategory(e.target.value)} className={INPUT_CLS}>{EXPENSE_CATEGORIES.map(c => <option key={c} value={c} className="bg-violet-950">{c}</option>)}</select></div>
            <div><label className={LABEL_CLS}>Sana</label><input type="date" value={date} onChange={e => setDate(e.target.value)} className={INPUT_CLS} /></div>
            <div className="sm:col-span-2"><label className={LABEL_CLS}>Izoh</label><input value={note} onChange={e => setNote(e.target.value)} className={INPUT_CLS} /></div>
          </div>
          <div>
            <label className={LABEL_CLS}>Tasdiqlash turi</label>
            <div className="flex gap-2">
              <button onClick={() => setApprovalMode('manager')} className={`flex-1 text-xs py-2 rounded-xl border transition-all ${approvalMode === 'manager' ? 'bg-white/20 border-white/40 text-white' : 'bg-white/5 border-white/10 text-white/50'}`}>Menejer ruhsati (darhol)</button>
              <button onClick={() => setApprovalMode('director')} className={`flex-1 text-xs py-2 rounded-xl border transition-all ${approvalMode === 'director' ? 'bg-white/20 border-white/40 text-white' : 'bg-white/5 border-white/10 text-white/50'}`}>Direktor tasdiqlashi kerak</button>
            </div>
          </div>
          {error && <p className="text-rose-300 text-xs">{error}</p>}
          <PrimaryButton onClick={submit} className="w-full"><Check size={15} /> Saqlash</PrimaryButton>
        </div>
      )}

      {role === 'director' && pending.length > 0 && (
        <div className={`${GLASS} rounded-3xl p-5`}>
          <h3 className="font-display text-white font-semibold mb-3 flex items-center gap-2"><Bell size={16} /> Tasdiqlash kutilmoqda ({pending.length})</h3>
          <div className="space-y-2">
            {pending.map(f => {
              const b = directorData.branches.find(x => x.id === f.branchId);
              return (
                <div key={f.id} className="flex items-center justify-between gap-3 bg-white/5 border border-white/10 rounded-2xl p-3.5">
                  <div className="min-w-0"><p className="text-white text-sm font-medium">{f.category} — {money(f.amount)} so'm</p><p className="text-white/40 text-xs truncate">{b?.name} · {formatDate(f.date)}{f.note ? ` · ${f.note}` : ''}</p></div>
                  <div className="flex gap-1.5 shrink-0">
                    <button onClick={() => approveFinance(f.id)} className="w-9 h-9 rounded-xl bg-emerald-400/20 hover:bg-emerald-400/30 border border-emerald-300/40 flex items-center justify-center text-emerald-200"><CheckCircle2 size={16} /></button>
                    <button onClick={() => rejectFinance(f.id)} className="w-9 h-9 rounded-xl bg-rose-400/20 hover:bg-rose-400/30 border border-rose-300/40 flex items-center justify-center text-rose-200"><XCircle size={16} /></button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className={`${GLASS} rounded-3xl p-5`}>
        <h3 className="font-display text-white font-semibold mb-3">So'nggi yozuvlar</h3>
        {history.length === 0 ? <p className="text-white/40 text-sm">Hali yozuv yo'q.</p> : (
          <div className="space-y-2">
            {history.map(f => (
              <div key={f.id} className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl p-3">
                <div className="min-w-0"><p className="text-white text-sm truncate">{f.category}{f.note ? ` · ${f.note}` : ''}</p><p className="text-white/40 text-xs">{formatDate(f.date)}</p></div>
                <p className={`text-sm font-semibold shrink-0 ${f.type === 'income' ? 'text-emerald-300' : 'text-rose-300'}`}>{f.type === 'income' ? '+' : '-'}{money(f.amount)}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================== PAYMENTS PAGE ============================== */

function PaymentsPage({ scopeBranches, directorData, opData, openModal }) {
  const [groupFilter, setGroupFilter] = useState('all');
  const [search, setSearch] = useState('');
  const month = thisMonthKey();
  const prevMonth = prevMonthKey(month);
  const scopeIds = scopeBranches.map(b => b.id);
  const courses = directorData.courses.filter(c => scopeIds.includes(c.branchId));
  const courseIds = courses.map(c => c.id);
  const groups = opGroups(opData).filter(g => courseIds.includes(g.courseId));

  const rows = [];
  groups.forEach(g => {
    const course = courses.find(c => c.id === g.courseId);
    if (!course) return;
    opStudentsInGroups(opData, [g.id]).forEach(s => rows.push({ student: s, group: g, course }));
  });

  const filtered = rows.filter(r => {
    if (groupFilter !== 'all' && r.group.id !== groupFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      const matchesName = r.student.name.toLowerCase().includes(q);
      const matchesPhone = normalizePhone(r.student.phone).includes(normalizePhone(search));
      if (!matchesName && !matchesPhone) return false;
    }
    return true;
  });

  const totalPending = filtered.filter(r => getPaymentStatus(directorData.payments, r.student.id, r.course.id, month, r.course.price) !== 'paid')
    .reduce((sum, r) => sum + (r.course.price - getPaymentTotal(directorData.payments, r.student.id, r.course.id, month)), 0);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div><h2 className="font-display text-2xl font-bold text-white">To'lovlar</h2><p className="text-white/50 text-sm mt-0.5">O'quvchilar to'lov holati va qarzdorlik</p></div>
        <PrimaryButton onClick={() => openModal({ type: 'recordPayment' })}><Plus size={16} /> To'lov qabul qilish</PrimaryButton>
      </div>

      <StatCard icon={AlertTriangle} label="Bu oy kutilayotgan to'lovlar" value={money(totalPending) + " so'm"} />

      <div className="flex gap-2 flex-wrap">
        <select value={groupFilter} onChange={e => setGroupFilter(e.target.value)} className={`${INPUT_CLS} w-auto`}>
          <option value="all" className="bg-violet-950">Barcha guruhlar</option>
          {groups.map(g => <option key={g.id} value={g.id} className="bg-violet-950">{g.name}</option>)}
        </select>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Ism yoki telefon bo'yicha qidirish..." className={`${INPUT_CLS} flex-1 min-w-[200px]`} />
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={CreditCard} title="O'quvchi topilmadi" subtitle="Kurslarga bog'langan guruh va o'quvchi bo'lishi kerak." />
      ) : (
        <div className="space-y-2">
          {filtered.map(({ student, group, course }) => {
            const paidThis = getPaymentTotal(directorData.payments, student.id, course.id, month);
            const status = getPaymentStatus(directorData.payments, student.id, course.id, month, course.price);
            const paidPrev = getPaymentTotal(directorData.payments, student.id, course.id, prevMonth);
            const hasDebt = paidPrev < course.price;
            const overdue = new Date().getDate() > 20 && status !== 'paid';
            return (
              <div key={student.id + course.id} className={`${GLASS} rounded-2xl p-4 flex items-center gap-3 flex-wrap`}>
                <Avatar name={student.name} color={group.color} size={40} />
                <div className="min-w-0 flex-1">
                  <p className="text-white text-sm font-medium truncate">{student.name}</p>
                  <p className="text-white/40 text-xs truncate">{group.name} · {course.name}</p>
                  <div className="flex gap-1.5 mt-1 flex-wrap">
                    {status === 'paid' && <span className="text-[10px] bg-emerald-400/20 border border-emerald-300/40 text-emerald-200 px-2 py-0.5 rounded-full">To'landi</span>}
                    {status === 'partial' && <span className="text-[10px] bg-amber-400/20 border border-amber-300/40 text-amber-200 px-2 py-0.5 rounded-full">Qisman: {money(paidThis)}/{money(course.price)}</span>}
                    {status === 'unpaid' && <span className="text-[10px] bg-rose-400/20 border border-rose-300/40 text-rose-200 px-2 py-0.5 rounded-full">To'lanmagan</span>}
                    {hasDebt && <span className="text-[10px] bg-rose-500/30 border border-rose-400/50 text-rose-100 px-2 py-0.5 rounded-full">O'tgan oydan qarz</span>}
                    {overdue && <span className="text-[10px] bg-red-500/40 border border-red-400/60 text-white px-2 py-0.5 rounded-full flex items-center gap-1"><AlertTriangle size={10} /> Muddati o'tgan</span>}
                  </div>
                </div>
                {status !== 'paid' && <p className="text-white/50 text-xs shrink-0">Kutilmoqda: {money(course.price - paidThis)} so'm</p>}
                <button onClick={() => openModal({ type: 'recordPayment', studentId: student.id, courseId: course.id })} className={BTN_GHOST}><Plus size={14} /> To'lov</button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function RecordPaymentModal({ initialStudentId, initialCourseId, scopeBranches, directorData, opData, onSubmit, onClose }) {
  const [search, setSearch] = useState('');
  const [studentId, setStudentId] = useState(initialStudentId || '');
  const [courseId, setCourseId] = useState(initialCourseId || '');
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('cash');
  const [error, setError] = useState('');

  const scopeIds = scopeBranches.map(b => b.id);
  const courses = directorData.courses.filter(c => scopeIds.includes(c.branchId));
  const courseIds = courses.map(c => c.id);
  const groups = opGroups(opData).filter(g => courseIds.includes(g.courseId));
  const allStudents = opStudentsInGroups(opData, groups.map(g => g.id));

  const matches = search.length > 0 && !studentId ? allStudents.filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || normalizePhone(s.phone).includes(normalizePhone(search))).slice(0, 6) : [];
  const selectedStudent = allStudents.find(s => s.id === studentId);
  const studentCourseOptions = selectedStudent
    ? groups.filter(g => (selectedStudent.groupIds || []).includes(g.id)).map(g => ({ group: g, course: courses.find(c => c.id === g.courseId) })).filter(x => x.course)
    : [];

  function selectStudent(s) {
    setStudentId(s.id); setSearch(s.name);
    const opts = groups.filter(g => (s.groupIds || []).includes(g.id)).map(g => courses.find(c => c.id === g.courseId)).filter(Boolean);
    if (opts.length === 1) setCourseId(opts[0].id);
  }

  function submit() {
    setError('');
    if (!studentId || !courseId) { setError("O'quvchi va kurs/guruhni tanlang."); return; }
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) { setError("To'g'ri summa kiriting."); return; }
    onSubmit({ studentId, courseId, amount: amt, method, date: todayISO(), month: thisMonthKey() });
    onClose();
  }

  return (
    <Modal title="To'lov qabul qilish" onClose={onClose}>
      <div className="space-y-4">
        <div>
          <label className={LABEL_CLS}>O'quvchi (ism yoki telefon)</label>
          <input value={search} onChange={e => { setSearch(e.target.value); setStudentId(''); setCourseId(''); }} placeholder="Ism familiya yozing..." className={INPUT_CLS} autoFocus />
          {matches.length > 0 && (
            <div className="mt-1.5 space-y-1 max-h-40 overflow-y-auto">
              {matches.map(s => (
                <button key={s.id} onClick={() => selectStudent(s)} className="w-full flex items-center gap-2 bg-white/5 hover:bg-white/15 border border-white/10 rounded-xl p-2 text-left transition-colors">
                  <Avatar name={s.name} size={28} /><p className="text-white text-sm truncate">{s.name}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        {selectedStudent && studentCourseOptions.length > 0 && (
          <div>
            <label className={LABEL_CLS}>Guruh / kurs</label>
            <select value={courseId} onChange={e => setCourseId(e.target.value)} className={INPUT_CLS}>
              <option value="" className="bg-violet-950">— Tanlang —</option>
              {studentCourseOptions.map(({ group, course }) => <option key={group.id} value={course.id} className="bg-violet-950">{group.name} — {course.name} ({money(course.price)} so'm)</option>)}
            </select>
          </div>
        )}

        <div><label className={LABEL_CLS}>To'lov miqdori (so'm)</label><input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0" className={INPUT_CLS} /></div>

        <div>
          <label className={LABEL_CLS}>To'lov turi</label>
          <div className="flex gap-2">
            {PAYMENT_METHODS.map(m => (
              <button key={m.id} onClick={() => setMethod(m.id)} className={`flex-1 flex items-center justify-center gap-2 text-sm py-2.5 rounded-xl border transition-all ${method === m.id ? 'bg-white/20 border-white/40 text-white' : 'bg-white/5 border-white/10 text-white/50'}`}>
                <m.icon size={15} /> {m.label}
              </button>
            ))}
          </div>
        </div>

        {error && <p className="text-rose-300 text-xs">{error}</p>}
        <PrimaryButton onClick={submit} className="w-full"><Check size={16} /> To'lovni saqlash</PrimaryButton>
      </div>
    </Modal>
  );
}

/* ============================== COURSES ============================== */

function CoursesPage({ scopeBranches, directorData, opData, openModal, canEdit }) {
  const [expandedId, setExpandedId] = useState(null);
  const scopeIds = scopeBranches.map(b => b.id);
  const courses = directorData.courses.filter(c => scopeIds.includes(c.branchId));
  const month = thisMonthKey();

  function courseGroups(courseId) { return opGroups(opData).filter(g => g.courseId === courseId); }
  function courseStudents(courseId) { return opStudentsInGroups(opData, courseGroups(courseId).map(g => g.id)); }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div><h2 className="font-display text-2xl font-bold text-white">Kurslar</h2><p className="text-white/50 text-sm mt-0.5">Kurs katalogi va daromad (to'lovlarni "To'lovlar" bo'limidan qabul qiling)</p></div>
        {canEdit && <PrimaryButton onClick={() => openModal({ type: 'courseForm' })}><Plus size={16} /> Yangi kurs</PrimaryButton>}
      </div>

      {courses.length === 0 ? (
        <EmptyState icon={BookOpen} title="Hali kurs yo'q" subtitle="Kurs yarating — keyin ustoz ilovasida guruh yaratilganda shu kursni tanlash mumkin bo'ladi." />
      ) : (
        <div className="space-y-3">
          {courses.map(c => {
            const groups = courseGroups(c.id);
            const studs = courseStudents(c.id);
            const revenue = c.price * studs.length;
            const paidCount = studs.filter(s => getPaymentStatus(directorData.payments, s.id, c.id, month, c.price) === 'paid').length;
            const full = c.capacity && studs.length >= c.capacity;
            const open = expandedId === c.id;
            return (
              <div key={c.id} className={`${GLASS} rounded-3xl overflow-hidden`}>
                <div className="w-full flex items-center justify-between p-5 flex-wrap gap-2">
                  <button onClick={() => setExpandedId(open ? null : c.id)} className="flex-1 text-left min-w-[200px]">
                    <p className="font-display text-white font-semibold flex items-center gap-2 flex-wrap">{c.name}{full && <span className="text-[10px] bg-amber-400/20 border border-amber-300/40 text-amber-200 px-2 py-0.5 rounded-full">To'lgan</span>}</p>
                    <p className="text-white/45 text-xs mt-0.5">{(c.days || []).join(', ') || 'Kunsiz'} · {c.time} · {groups.length} guruh · {studs.length} o'quvchi</p>
                  </button>
                  <div className="flex items-center gap-2">
                    <div className="text-right"><p className="text-white font-semibold text-sm">{money(revenue)} so'm/oy</p><p className="text-white/40 text-xs">{paidCount}/{studs.length} to'liq to'lagan</p></div>
                    {canEdit && <button onClick={() => openModal({ type: 'courseForm', editing: c })} className={BTN_ICON}><Pencil size={14} /></button>}
                  </div>
                </div>
                {open && (
                  <div className="px-5 pb-5 border-t border-white/10 pt-4 space-y-2">
                    {studs.length === 0 ? <p className="text-white/40 text-sm">Hali bu kursda o'quvchi yo'q.</p> : studs.map(s => {
                      const status = getPaymentStatus(directorData.payments, s.id, c.id, month, c.price);
                      return (
                        <div key={s.id} className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl p-3">
                          <Avatar name={s.name} size={32} /><p className="text-white text-sm flex-1 truncate">{s.name}</p>
                          {status === 'paid' && <span className="text-[10px] bg-emerald-400/20 text-emerald-200 px-2 py-0.5 rounded-full">To'landi</span>}
                          {status === 'partial' && <span className="text-[10px] bg-amber-400/20 text-amber-200 px-2 py-0.5 rounded-full">Qisman</span>}
                          {status === 'unpaid' && <span className="text-[10px] bg-rose-400/20 text-rose-200 px-2 py-0.5 rounded-full">To'lanmagan</span>}
                        </div>
                      );
                    })}
                    {canEdit && <button onClick={() => openModal({ type: 'confirm', message: `"${c.name}" kursini o'chirasizmi?`, action: { kind: 'deleteCourse', courseId: c.id } })} className={`${BTN_GHOST} w-full mt-2 text-rose-200 hover:text-rose-100`}><Trash2 size={14} /> Kursni o'chirish</button>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ============================== GROUPS PROFITABILITY ============================== */

function GroupsProfitability({ directorData, opData, setGroupFee, scopeBranchIds }) {
  const allGroups = opGroups(opData);
  const groups = scopeBranchIds ? allGroups.filter(g => g.courseId && directorData.courses.some(c => c.id === g.courseId && scopeBranchIds.includes(c.branchId))) : allGroups;
  const rows = groups.map(g => { const count = opGroupStudentCount(opData, g.id); const fee = directorData.groupFees[g.id] || 0; return { ...g, count, fee, revenue: fee * count }; }).sort((a, b) => b.revenue - a.revenue);
  return (
    <div className="space-y-5">
      <div><h2 className="font-display text-2xl font-bold text-white">Guruhlar bo'yicha foyda</h2><p className="text-white/50 text-sm mt-0.5">Har bir guruhga oylik to'lov belgilang — daromad avtomatik hisoblanadi</p></div>
      {rows.length === 0 ? (
        <EmptyState icon={ClipboardList} title="Hali guruh yo'q" subtitle="O'qituvchi ilovasida guruh yarating, ular shu yerda ko'rinadi." />
      ) : (
        <div className="space-y-2">
          {rows.map((g, i) => (
            <div key={g.id} className={`${GLASS} rounded-2xl p-4 flex items-center gap-3 flex-wrap`}>
              <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: g.color }} />
              <div className="min-w-0 flex-1"><p className="text-white text-sm font-medium truncate">{g.name}</p><p className="text-white/40 text-xs">{g.count} o'quvchi</p></div>
              <div className="flex items-center gap-1.5"><input type="number" defaultValue={g.fee || ''} placeholder="Oylik to'lov" onBlur={e => setGroupFee(g.id, parseFloat(e.target.value) || 0)} className={`${INPUT_CLS} w-32`} /><span className="text-white/40 text-xs">so'm</span></div>
              <div className="text-right shrink-0 min-w-[110px]">
                <p className="text-white text-sm font-semibold">{money(g.revenue)} so'm</p>
                {g.count < 3 && <p className="text-amber-300 text-[11px]">Kam sonli — yopish mumkin</p>}
                {i === 0 && g.revenue > 0 && <p className="text-emerald-300 text-[11px]">Asosiy foyda manbai</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ============================== SETTINGS ============================== */

function SettingsPage({ director, updateDirector }) {
  const theme = useTheme();
  const [uploading, setUploading] = useState(false);
  async function handleLogoUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const raw = await readFileAsDataURL(file);
      const compressed = await compressImageDataUrl(raw, 240);
      const avg = await extractAverageColor(compressed);
      if (avg) updateDirector({ ...director, logo: compressed, themeId: 'custom', customTheme: buildCustomTheme(avg.r, avg.g, avg.b) });
      else updateDirector({ ...director, logo: compressed });
    } catch (err) { console.error(err); }
    setUploading(false);
  }
  return (
    <div className="space-y-5 max-w-2xl">
      <div><h2 className="font-display text-2xl font-bold text-white">Sozlamalar</h2><p className="text-white/50 text-sm mt-0.5">Ko'rinish, brend ranglari va xavfsizlik</p></div>
      <div className={`${GLASS} rounded-3xl p-6 space-y-5`}>
        <div>
          <label className={LABEL_CLS}>Logotip</label>
          <div className="flex items-center gap-3">
            {director.logo && <img src={director.logo} alt="" className="w-14 h-14 rounded-xl object-cover border border-white/20" />}
            <label className={`${BTN_GHOST} cursor-pointer`}><input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />{uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />} Yuklash</label>
          </div>
        </div>
        <div>
          <label className={LABEL_CLS}>Mavzu (tema)</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[...Object.values(THEMES), ...(director.customTheme ? [director.customTheme] : [])].map(t => (
              <button key={t.id} onClick={() => updateDirector({ ...director, themeId: t.id })} className={`rounded-2xl overflow-hidden border-2 transition-all ${theme.id === t.id ? 'border-white scale-105' : 'border-white/10'}`}>
                <div className="h-14 w-full" style={{ background: t.bg }} /><p className="text-[11px] text-white/70 p-1.5 text-center truncate">{t.name}</p>
              </button>
            ))}
          </div>
          <p className="text-white/40 text-[11px] mt-2">Har qanday sahifada, yuqori panelda ham mavzuni tezkor almashtirish tugmasi bor.</p>
        </div>
      </div>
      <div className={`${GLASS} rounded-3xl p-6 space-y-3`}>
        <ToggleSwitch checked={director.twoFactorEnabled} onChange={v => updateDirector({ ...director, twoFactorEnabled: v })} label="Ikki bosqichli tekshiruv (2FA)" sub="Kirishda qo'shimcha 5 xonali kod so'raladi" />
        <p className="text-white/35 text-[11px]">Hozircha faqat dizayn/interfeys — SMS yuborish uchun keyinchalik backend ulanishi kerak bo'ladi.</p>
      </div>
    </div>
  );
}

/* ============================== LAYOUT ============================== */

function AppSidebar({ view, goTo, items, title }) {
  return (
    <aside className="hidden md:flex flex-col w-60 shrink-0 p-5 gap-1">
      <div className={`${GLASS} rounded-3xl p-4 mb-4`}><p className="font-display text-white font-bold text-lg tracking-tight truncate">{title}</p></div>
      <div className={`${GLASS} rounded-3xl p-2 flex flex-col gap-1 flex-1 overflow-y-auto`}>
        {items.map(item => <button key={item.id} onClick={() => goTo(item.id)} className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all ${view === item.id ? 'bg-white/20 text-white shadow-lg' : 'text-white/60 hover:bg-white/10 hover:text-white'}`}><item.icon size={18} /> {item.label}</button>)}
      </div>
    </aside>
  );
}

function AppBottomNav({ view, goTo, items }) {
  return (
    <nav className={`md:hidden fixed bottom-3 left-3 right-3 ${GLASS} rounded-3xl p-1.5 flex gap-1 overflow-x-auto z-40`}>
      {items.map(item => <button key={item.id} onClick={() => goTo(item.id)} className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-2xl transition-all shrink-0 ${view === item.id ? 'bg-white/20 text-white' : 'text-white/50'}`}><item.icon size={17} /><span className="text-[8px] font-medium whitespace-nowrap">{item.label}</span></button>)}
    </nav>
  );
}

function TopBar({ name, photo, color, goTo, now, onLogout, onReturn, impersonating, director, updateDirector, notifLog, onClearNotifs }) {
  const dayName = JS_DAY_NAMES[now.getDay()];
  return (
    <div className="space-y-3 mb-6">
      {impersonating && (
        <div className={`${GLASS} rounded-2xl p-3 flex items-center justify-between flex-wrap gap-2`}>
          <p className="text-white/70 text-xs flex items-center gap-2"><ArrowRightLeft size={14} /> Siz {name} sifatida ko'ryapsiz</p>
          <button onClick={onReturn} className={BTN_GHOST}>Direktorga qaytish</button>
        </div>
      )}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {director && <ThemeSwitcher director={director} updateDirector={updateDirector} />}
          <div><p className="text-white/50 text-xs">{dayName}, {now.getDate()}-{MONTHS_UZ[now.getMonth()]}, {now.getFullYear()}</p><p className="text-white font-medium mt-0.5">Xush kelibsiz, {name}! 👋</p></div>
        </div>
        <div className="flex items-center gap-2">
          <NotificationBell log={notifLog} onClear={onClearNotifs} />
          {!impersonating && <button onClick={onLogout} className={BTN_ICON}><LogOut size={16} /></button>}
          <button onClick={() => goTo && goTo('settings')} className="shrink-0" disabled={!goTo}><Avatar name={name} photo={photo} color={color} size={42} /></button>
        </div>
      </div>
    </div>
  );
}

/* ============================== ADD/EDIT MODALS ============================== */

function BranchFormModal({ editing, onSubmit, onClose }) {
  const [name, setName] = useState(editing?.name || '');
  const [address, setAddress] = useState(editing?.address || '');
  const [error, setError] = useState('');
  function submit() { if (!name.trim()) { setError('Filial nomini kiriting.'); return; } onSubmit({ name: name.trim(), address: address.trim() }); onClose(); }
  return (
    <Modal title={editing ? 'Filialni tahrirlash' : 'Yangi filial'} onClose={onClose}>
      <div className="space-y-4">
        <div><label className={LABEL_CLS}>Filial nomi</label><input value={name} onChange={e => setName(e.target.value)} className={INPUT_CLS} autoFocus /></div>
        <div><label className={LABEL_CLS}>Manzil</label><input value={address} onChange={e => setAddress(e.target.value)} className={INPUT_CLS} /></div>
        {error && <p className="text-rose-300 text-xs">{error}</p>}
        <PrimaryButton onClick={submit} className="w-full">{editing ? <><Check size={16} /> Saqlash</> : <><Plus size={16} /> Qo'shish</>}</PrimaryButton>
      </div>
    </Modal>
  );
}

function ManagerFormModal({ editing, branches, onSubmit, onClose }) {
  const [name, setName] = useState(editing?.name || '');
  const [phone, setPhone] = useState(editing?.phone || '');
  const [birthDate, setBirthDate] = useState(editing?.birthDate || '');
  const [address, setAddress] = useState(editing?.address || '');
  const [password, setPassword] = useState('');
  const [salary, setSalary] = useState(editing?.monthlySalary || '');
  const [rating, setRating] = useState(editing?.rating || 3);
  const [branchIds, setBranchIds] = useState(editing?.branchIds || []);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (!name.trim() || !phone.trim() || branchIds.length === 0) { setError('Ism, telefon va kamida bitta filial majburiy.'); return; }
    if (!editing && (!password || password.length < 4)) { setError("Yangi menejer uchun parol (kamida 4 belgi) kerak."); return; }
    setBusy(true);
    const payload = { name: name.trim(), phone, birthDate, address: address.trim(), monthlySalary: parseFloat(salary) || 0, rating, branchIds };
    if (password) payload.passwordHash = await hashPassword(password);
    setBusy(false);
    onSubmit(payload); onClose();
  }

  return (
    <Modal title={editing ? 'Menejerni tahrirlash' : "Menejer qo'shish"} onClose={onClose}>
      <div className="space-y-4">
        <div><label className={LABEL_CLS}>Ism familiya</label><input value={name} onChange={e => setName(e.target.value)} className={INPUT_CLS} autoFocus /></div>
        <div><label className={LABEL_CLS}>Telefon raqam</label><PhoneInput value={phone} onChange={setPhone} /></div>
        <div><label className={LABEL_CLS}>Tug'ilgan sana</label><input type="date" value={birthDate} onChange={e => setBirthDate(e.target.value)} className={INPUT_CLS} /></div>
        <div><label className={LABEL_CLS}>Yashash joyi</label><input value={address} onChange={e => setAddress(e.target.value)} className={INPUT_CLS} /></div>
        <div><label className={LABEL_CLS}>Oylik maosh (so'm)</label><input type="number" value={salary} onChange={e => setSalary(e.target.value)} className={INPUT_CLS} /></div>
        <div><label className={LABEL_CLS}>Ishlaydigan filiallari</label><BranchPicker branches={branches} value={branchIds} onChange={setBranchIds} /></div>
        <div><label className={LABEL_CLS}>Ish samaradorligi</label><StarPicker value={rating} onChange={setRating} /></div>
        <div><label className={LABEL_CLS}>{editing ? "Yangi parol (bo'sh qoldirsa o'zgarmaydi)" : 'Parol'}</label><input type="text" value={password} onChange={e => setPassword(e.target.value)} placeholder="Kamida 4 belgi" className={INPUT_CLS} /></div>
        {error && <p className="text-rose-300 text-xs">{error}</p>}
        <PrimaryButton onClick={submit} disabled={busy} className="w-full">{busy ? <Loader2 size={16} className="animate-spin" /> : editing ? <Check size={16} /> : <Plus size={16} />} {editing ? 'Saqlash' : "Qo'shish"}</PrimaryButton>
      </div>
    </Modal>
  );
}

function TeacherHRFormModal({ editing, branches, onSubmit, onClose }) {
  const [branchId, setBranchId] = useState(editing?.branchId || branches[0]?.id || '');
  const [name, setName] = useState(editing?.name || '');
  const [phone, setPhone] = useState(editing?.phone || '');
  const [sharePercent, setSharePercent] = useState(editing?.revenueSharePercent ?? 40);
  const [rating, setRating] = useState(editing?.rating || 3);
  const [canCreateGroups, setCanCreateGroups] = useState(editing?.canCreateGroups !== false);
  const [canReceivePayments, setCanReceivePayments] = useState(editing?.canReceivePayments !== false);
  const [error, setError] = useState('');

  function submit() {
    if (!name.trim() || !branchId) { setError('Ism va filialni kiriting.'); return; }
    onSubmit({ branchId, name: name.trim(), phone, revenueSharePercent: parseFloat(sharePercent) || 0, rating, note: '', canCreateGroups, canReceivePayments });
    onClose();
  }

  return (
    <Modal title={editing ? "O'qituvchini tahrirlash" : "O'qituvchi qo'shish"} onClose={onClose}>
      <div className="space-y-4">
        <div><label className={LABEL_CLS}>Filial</label><select value={branchId} onChange={e => setBranchId(e.target.value)} className={INPUT_CLS}>{branches.map(b => <option key={b.id} value={b.id} className="bg-violet-950">{b.name}</option>)}</select></div>
        <div><label className={LABEL_CLS}>Ism familiya</label><input value={name} onChange={e => setName(e.target.value)} className={INPUT_CLS} autoFocus /></div>
        <div><label className={LABEL_CLS}>Telefon raqam</label><PhoneInput value={phone} onChange={setPhone} /></div>
        <div><label className={LABEL_CLS}>Daromaddan ulush foizi (%)</label><input type="number" min="0" max="100" value={sharePercent} onChange={e => setSharePercent(e.target.value)} className={INPUT_CLS} /><p className="text-white/35 text-[11px] mt-1">Oylik maosh filial daromadidan shu foiz asosida avtomatik hisoblanadi.</p></div>
        <div><label className={LABEL_CLS}>Baho</label><StarPicker value={rating} onChange={setRating} size={22} /></div>
        <div className="border-t border-white/10 pt-4 space-y-3">
          <ToggleSwitch checked={canCreateGroups} onChange={setCanCreateGroups} label="Guruh ochishga ruxsat" sub="O'chirilsa, ustoz ilovasida 'Yangi guruh' tugmasi yashiriladi" />
          <ToggleSwitch checked={canReceivePayments} onChange={setCanReceivePayments} label="To'lov qabul qilishga ruxsat" sub="O'quvchilardan to'lov olish huquqi" />
        </div>
        {error && <p className="text-rose-300 text-xs">{error}</p>}
        <PrimaryButton onClick={submit} className="w-full">{editing ? <Check size={16} /> : <Plus size={16} />} {editing ? 'Saqlash' : "Qo'shish"}</PrimaryButton>
      </div>
    </Modal>
  );
}

function CourseFormModal({ editing, branches, onSubmit, onClose }) {
  const [branchId, setBranchId] = useState(editing?.branchId || branches[0]?.id || '');
  const [name, setName] = useState(editing?.name || '');
  const [days, setDays] = useState(editing?.days || []);
  const [time, setTime] = useState(editing?.time || '15:00');
  const [price, setPrice] = useState(editing?.price || '');
  const [duration, setDuration] = useState(editing?.durationMonths || '3');
  const [capacity, setCapacity] = useState(editing?.capacity || '');
  const [error, setError] = useState('');
  function submit() {
    if (!name.trim() || !branchId) { setError('Kurs nomi va filialni kiriting.'); return; }
    onSubmit({ branchId, name: name.trim(), days, time, price: parseFloat(price) || 0, durationMonths: parseFloat(duration) || 0, capacity: capacity ? parseInt(capacity) : null });
    onClose();
  }
  return (
    <Modal title={editing ? 'Kursni tahrirlash' : 'Yangi kurs'} onClose={onClose}>
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {branches.length > 1 && (<div><label className={LABEL_CLS}>Filial</label><select value={branchId} onChange={e => setBranchId(e.target.value)} className={INPUT_CLS}>{branches.map(b => <option key={b.id} value={b.id} className="bg-violet-950">{b.name}</option>)}</select></div>)}
          <div><label className={LABEL_CLS}>Kurs nomi</label><input value={name} onChange={e => setName(e.target.value)} className={INPUT_CLS} placeholder="Masalan: Matematika" /></div>
          <div><label className={LABEL_CLS}>Narxi (oylik, so'm)</label><input type="number" value={price} onChange={e => setPrice(e.target.value)} className={INPUT_CLS} /></div>
          <div><label className={LABEL_CLS}>Vaqt</label><input type="time" value={time} onChange={e => setTime(e.target.value)} className={INPUT_CLS} /></div>
          <div><label className={LABEL_CLS}>Davomiyligi (oy)</label><input type="number" value={duration} onChange={e => setDuration(e.target.value)} className={INPUT_CLS} /></div>
          <div><label className={LABEL_CLS}>Sig'imi (ixtiyoriy)</label><input type="number" value={capacity} onChange={e => setCapacity(e.target.value)} placeholder="Cheksiz" className={INPUT_CLS} /></div>
        </div>
        <div><label className={LABEL_CLS}>Dars kunlari</label><DayPicker value={days} onChange={setDays} /></div>
        {error && <p className="text-rose-300 text-xs">{error}</p>}
        <PrimaryButton onClick={submit} className="w-full">{editing ? <Check size={16} /> : <Plus size={16} />} {editing ? 'Saqlash' : "Qo'shish"}</PrimaryButton>
      </div>
    </Modal>
  );
}

/* ============================== ROOT APP ============================== */

export default function App() {
  const [directorData, setDirectorData] = useState(null);
  const [opData, setOpData] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('home');
  const [modal, setModal] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [notifLog, setNotifLog] = useState([]);
  const [overdueChecked, setOverdueChecked] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const savedDirectorData = await loadSharedState(DIRECTOR_DATA_KEY);
      const savedTeacherData = await loadSharedState(TEACHER_APP_KEY);
      if (!cancelled) {
        setDirectorData(savedDirectorData || seedDirectorData());
        setOpData(savedTeacherData || { groups: [], students: [], tasks: [] });
        setSession(loadSession(DIRECTOR_SESSION_KEY));
      }
      if (!cancelled) setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (loading || !directorData) return;
    const t = setTimeout(async () => {
      try { await saveSharedState(DIRECTOR_DATA_KEY, directorData); }
      catch (e) { console.error('Saqlashda xatolik:', e); }
    }, 700);
    return () => clearTimeout(t);
  }, [directorData, loading]);

  useEffect(() => {
    if (loading) return;
    saveSession(DIRECTOR_SESSION_KEY, session);
  }, [session, loading]);

  useEffect(() => {
    if (loading) return;
    let cancelled = false;

    async function refreshTeacherData() {
      const savedTeacherData = await loadSharedState(TEACHER_APP_KEY);
      if (!cancelled && savedTeacherData) setOpData(savedTeacherData);
    }

    const intervalId = window.setInterval(refreshTeacherData, 5000);
    window.addEventListener('focus', refreshTeacherData);
    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
      window.removeEventListener('focus', refreshTeacherData);
    };
  }, [loading]);

  function addNotification(message) {
    const id = generateId('n');
    setToasts(prev => [...prev, { id, message }]);
    setTimeout(() => setToasts(prev => prev.filter(n => n.id !== id)), 5000);
    setNotifLog(prev => [{ id, message, createdAt: Date.now(), read: false }, ...prev].slice(0, 30));
  }
  function clearNotifLog() { setNotifLog([]); }

  // Overdue payment check (after 20th of month), once per session, director/manager only
  useEffect(() => {
    if (loading || !directorData || !opData || !session || overdueChecked) return;
    if (session.role !== 'director' && session.role !== 'manager') return;
    if (new Date().getDate() <= 20) { setOverdueChecked(true); return; }
    const month = thisMonthKey();
    let unpaidCount = 0;
    directorData.courses.forEach(c => {
      const groups = opGroups(opData).filter(g => g.courseId === c.id);
      const studs = opStudentsInGroups(opData, groups.map(g => g.id));
      studs.forEach(s => { if (getPaymentStatus(directorData.payments, s.id, c.id, month, c.price) !== 'paid') unpaidCount++; });
    });
    if (unpaidCount > 0) addNotification(`⚠️ ${unpaidCount} ta o'quvchi bu oy uchun hali to'liq to'lov qilmagan (20-sanadan o'tdi).`);
    setOverdueChecked(true);
    // eslint-disable-next-line
  }, [loading, directorData, opData, session, overdueChecked]);

  function goTo(v) { setView(v); }
  function openModal(m) { setModal(m); }
  function closeModal() { setModal(null); }

  function loginAsDirector(directorId) { setSession({ role: 'director', directorId }); setView('home'); }
  function loginAsManager(managerId) { setSession({ role: 'manager', managerId }); setView('home'); }
  function impersonateManager(managerId) { setSession(prev => ({ role: 'manager', managerId, impersonatedBy: prev.directorId })); setView('home'); }
  function returnToDirector() { setSession(prev => ({ role: 'director', directorId: prev.impersonatedBy })); setView('managers'); }
  function logout() { setSession(null); setView('home'); setModal(null); }

  async function registerDirector(payload) {
    const director = { id: generateId('dir'), ...payload, themeId: 'violet', customTheme: null, twoFactorEnabled: false };
    const branch = { id: generateId('br'), directorId: director.id, name: payload.centerName, address: payload.address, color: '#8b5cf6' };
    setDirectorData(prev => ({ ...prev, directors: [...prev.directors, director], branches: [...prev.branches, branch] }));
    setSession({ role: 'director', directorId: director.id });
    setView('home');
    addNotification("Ro'yxatdan muvaffaqiyatli o'tdingiz!");
  }

  function updateDirector(updated) { setDirectorData(prev => ({ ...prev, directors: prev.directors.map(d => d.id === updated.id ? updated : d) })); }
  function addBranch(payload) { if (session.role !== 'director') return; setDirectorData(prev => ({ ...prev, branches: [...prev.branches, { id: generateId('br'), directorId: session.directorId, color: '#0ea5e9', ...payload }] })); addNotification(`"${payload.name}" filiali qo'shildi.`); }
  function updateBranch(id, payload) { setDirectorData(prev => ({ ...prev, branches: prev.branches.map(b => b.id === id ? { ...b, ...payload } : b) })); addNotification('Filial yangilandi.'); }
  function addManager(payload) { setDirectorData(prev => ({ ...prev, managers: [...prev.managers, { id: generateId('mgr'), allowedPages: MANAGER_NAV_ALL.map(p => p.id), ...payload }] })); addNotification("Menejer qo'shildi."); }
  function updateManager(id, payload) { setDirectorData(prev => ({ ...prev, managers: prev.managers.map(m => m.id === id ? { ...m, ...payload } : m) })); addNotification('Menejer yangilandi.'); }
  function deleteManager(managerId) { setDirectorData(prev => ({ ...prev, managers: prev.managers.filter(m => m.id !== managerId) })); addNotification("Menejer o'chirildi."); }
  function updateManagerPermissions(managerId, allowedPages) { setDirectorData(prev => ({ ...prev, managers: prev.managers.map(m => m.id === managerId ? { ...m, allowedPages } : m) })); addNotification('Ruxsatlar yangilandi.'); }
  function addTeacherHR(payload) { setDirectorData(prev => ({ ...prev, teachersHR: [...prev.teachersHR, { id: generateId('thr'), ...payload }] })); addNotification("O'qituvchi qo'shildi."); }
  function updateTeacherHR(id, payload) { setDirectorData(prev => ({ ...prev, teachersHR: prev.teachersHR.map(t => t.id === id ? { ...t, ...payload } : t) })); addNotification('Yangilandi.'); }
  function deleteTeacherHR(id) { setDirectorData(prev => ({ ...prev, teachersHR: prev.teachersHR.filter(t => t.id !== id) })); }
  function addHoliday(payload) { setDirectorData(prev => ({ ...prev, holidays: [...prev.holidays, { id: generateId('hol'), directorId: currentDirectorId(), ...payload }] })); addNotification("Bayram kuni qo'shildi."); }
  function removeHoliday(id) { setDirectorData(prev => ({ ...prev, holidays: prev.holidays.filter(h => h.id !== id) })); }
  function addFinance(entry) { setDirectorData(prev => ({ ...prev, finance: [...prev.finance, { id: generateId('fin'), status: entry.status, createdAt: Date.now(), ...entry }] })); addNotification(entry.status === 'pending' ? "Xarajat direktor tasdig'ini kutmoqda." : 'Yozuv saqlandi.'); }
  function approveFinance(id) { setDirectorData(prev => ({ ...prev, finance: prev.finance.map(f => f.id === id ? { ...f, status: 'approved' } : f) })); addNotification('Xarajat tasdiqlandi.'); }
  function rejectFinance(id) { setDirectorData(prev => ({ ...prev, finance: prev.finance.filter(f => f.id !== id) })); addNotification('Xarajat rad etildi.'); }
  function addCourse(payload) { setDirectorData(prev => ({ ...prev, courses: [...prev.courses, { id: generateId('crs'), ...payload }] })); addNotification("Kurs qo'shildi."); }
  function updateCourse(id, payload) { setDirectorData(prev => ({ ...prev, courses: prev.courses.map(c => c.id === id ? { ...c, ...payload } : c) })); addNotification('Kurs yangilandi.'); }
  function deleteCourse(id) { setDirectorData(prev => ({ ...prev, courses: prev.courses.filter(c => c.id !== id) })); addNotification("Kurs o'chirildi."); }
  function setGroupFee(groupId, fee) { setDirectorData(prev => ({ ...prev, groupFees: { ...prev.groupFees, [groupId]: fee } })); }

  // Recording a payment also books it as approved finance income for that branch
  function recordPayment(payload) {
    const course = directorData.courses.find(c => c.id === payload.courseId);
    const branchId = course?.branchId;
    setDirectorData(prev => ({
      ...prev,
      payments: [...prev.payments, { id: generateId('pay'), createdAt: Date.now(), ...payload }],
      finance: branchId ? [...prev.finance, { id: generateId('fin'), branchId, type: 'income', amount: payload.amount, category: "O'quv to'lovi", note: course?.name || '', date: payload.date, status: 'approved', createdAt: Date.now() }] : prev.finance,
    }));
    addNotification(`To'lov qabul qilindi: ${money(payload.amount)} so'm.`);
  }

  function currentDirectorId() {
    if (session?.role === 'director') return session.directorId;
    if (session?.role === 'manager' && session.impersonatedBy) return session.impersonatedBy;
    const manager = directorData?.managers.find(m => m.id === session?.managerId);
    const branch = directorData?.branches.find(b => (manager?.branchIds || []).includes(b.id));
    return branch?.directorId;
  }

  function handleConfirm() {
    if (!modal || modal.type !== 'confirm') return;
    const { action } = modal;
    if (action.kind === 'deleteManager') deleteManager(action.managerId);
    if (action.kind === 'deleteTeacherHR') deleteTeacherHR(action.teacherHRId);
    if (action.kind === 'deleteCourse') deleteCourse(action.courseId);
    setModal(null);
  }

  if (loading || !directorData || !opData) return <ThemeContext.Provider value={THEMES.violet}><LoadingScreen /></ThemeContext.Provider>;

  const currentDirector = session?.role === 'director'
    ? directorData.directors.find(d => d.id === session.directorId)
    : (session?.role === 'manager' && session.impersonatedBy ? directorData.directors.find(d => d.id === session.impersonatedBy) : null);
  const activeTheme = currentDirector ? (currentDirector.themeId === 'custom' && currentDirector.customTheme ? currentDirector.customTheme : (THEMES[currentDirector.themeId] || THEMES.violet)) : THEMES.violet;

  if (!session) {
    return <ThemeContext.Provider value={activeTheme}><DirectorAuth directorData={directorData} onLoginDirector={loginAsDirector} onLoginManager={loginAsManager} onRegister={registerDirector} /></ThemeContext.Provider>;
  }

  const now = new Date();

  /* ---------- MANAGER SESSION ---------- */
  if (session.role === 'manager') {
    const manager = directorData.managers.find(m => m.id === session.managerId);
    const myBranches = manager ? directorData.branches.filter(b => (manager.branchIds || []).includes(b.id)) : [];
    if (!manager || myBranches.length === 0) return <ThemeContext.Provider value={THEMES.violet}><LoadingScreen /></ThemeContext.Provider>;
    const allowedPages = manager.allowedPages || MANAGER_NAV_ALL.map(p => p.id);
    const visibleNav = MANAGER_NAV_ALL.filter(p => allowedPages.includes(p.id));
    const effectiveView = allowedPages.includes(view) ? view : (visibleNav[0]?.id || 'home');
    const branchIds = myBranches.map(b => b.id);
    const directorForOrg = directorData.directors.find(d => d.id === myBranches[0].directorId);

    return (
      <ThemeContext.Provider value={activeTheme}>
        <div className="min-h-screen w-full text-white relative" style={{ background: activeTheme.bg, fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif" }}>
          <GlobalStyleTag />
          <BackgroundBlobs />
          <div className="relative z-10 flex min-h-screen">
            <AppSidebar view={effectiveView} goTo={goTo} items={visibleNav} title={`🏢 ${myBranches.map(b => b.name).join(', ')}`} />
            <main className="flex-1 p-4 md:p-8 pb-28 md:pb-8 max-w-6xl mx-auto w-full">
              <TopBar name={manager.name} color={myBranches[0].color} goTo={null} now={now} onLogout={logout} onReturn={returnToDirector} impersonating={!!session.impersonatedBy} director={directorForOrg} updateDirector={updateDirector} notifLog={notifLog} onClearNotifs={clearNotifLog} />
              {effectiveView === 'home' && <DashboardHome scopeBranches={myBranches} directorData={directorData} opData={opData} centerLabel={myBranches.map(b => b.name).join(', ')} allBranches={true} />}
              {effectiveView === 'payments' && <PaymentsPage scopeBranches={myBranches} directorData={directorData} opData={opData} openModal={openModal} />}
              {effectiveView === 'teachers' && <TeachersHR scopeBranches={myBranches} directorData={directorData} opData={opData} openModal={openModal} canEdit={true} />}
              {effectiveView === 'courses' && <CoursesPage scopeBranches={myBranches} directorData={directorData} opData={opData} openModal={openModal} canEdit={true} />}
              {effectiveView === 'groups' && <GroupsProfitability directorData={directorData} opData={opData} setGroupFee={setGroupFee} scopeBranchIds={branchIds} />}
              {effectiveView === 'finance' && <FinancePage role="manager" scopeBranchIds={branchIds} directorData={directorData} allBranches={myBranches} addFinance={addFinance} approveFinance={approveFinance} rejectFinance={rejectFinance} />}
              {effectiveView === 'holidays' && <HolidaysPage directorId={myBranches[0].directorId} directorData={directorData} addHoliday={addHoliday} removeHoliday={removeHoliday} canEdit={false} />}
            </main>
          </div>
          <AppBottomNav view={effectiveView} goTo={goTo} items={visibleNav} />
          <ToastStack toasts={toasts} onDismiss={id => setToasts(prev => prev.filter(n => n.id !== id))} />

          {modal?.type === 'teacherHRForm' && <TeacherHRFormModal editing={modal.editing} branches={myBranches} onSubmit={p => modal.editing ? updateTeacherHR(modal.editing.id, p) : addTeacherHR(p)} onClose={closeModal} />}
          {modal?.type === 'courseForm' && <CourseFormModal editing={modal.editing} branches={myBranches} onSubmit={p => modal.editing ? updateCourse(modal.editing.id, p) : addCourse(p)} onClose={closeModal} />}
          {modal?.type === 'recordPayment' && <RecordPaymentModal initialStudentId={modal.studentId} initialCourseId={modal.courseId} scopeBranches={myBranches} directorData={directorData} opData={opData} onSubmit={recordPayment} onClose={closeModal} />}
          {modal?.type === 'confirm' && <ConfirmModal message={modal.message} onConfirm={handleConfirm} onCancel={closeModal} />}
        </div>
      </ThemeContext.Provider>
    );
  }

  /* ---------- DIRECTOR SESSION ---------- */
  const director = currentDirector;
  if (!director) return <ThemeContext.Provider value={THEMES.violet}><LoadingScreen /></ThemeContext.Provider>;
  const myBranches = directorData.branches.filter(b => b.directorId === director.id);

  return (
    <ThemeContext.Provider value={activeTheme}>
      <div className="min-h-screen w-full text-white relative" style={{ background: activeTheme.bg, fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif" }}>
        <GlobalStyleTag />
        <BackgroundBlobs />
        <div className="relative z-10 flex min-h-screen">
          <AppSidebar view={view} goTo={goTo} items={DIRECTOR_NAV} title={`🏫 ${director.centerName}`} />
          <main className="flex-1 p-4 md:p-8 pb-28 md:pb-8 max-w-6xl mx-auto w-full">
            <TopBar name={director.name} photo={director.logo} goTo={goTo} now={now} onLogout={logout} impersonating={false} director={director} updateDirector={updateDirector} notifLog={notifLog} onClearNotifs={clearNotifLog} />

            {view === 'home' && <DashboardHome scopeBranches={myBranches} directorData={directorData} opData={opData} centerLabel={director.centerName} allBranches={true} />}
            {view === 'branches' && <BranchesPage director={director} directorData={directorData} opData={opData} openModal={openModal} />}
            {view === 'managers' && <ManagersPage director={director} directorData={directorData} onImpersonate={impersonateManager} openModal={openModal} />}
            {view === 'payments' && <PaymentsPage scopeBranches={myBranches} directorData={directorData} opData={opData} openModal={openModal} />}
            {view === 'teachers' && <TeachersHR scopeBranches={myBranches} directorData={directorData} opData={opData} openModal={openModal} canEdit={true} />}
            {view === 'courses' && <CoursesPage scopeBranches={myBranches} directorData={directorData} opData={opData} openModal={openModal} canEdit={true} />}
            {view === 'holidays' && <HolidaysPage directorId={director.id} directorData={directorData} addHoliday={addHoliday} removeHoliday={removeHoliday} canEdit={true} />}
            {view === 'finance' && <FinancePage role="director" scopeBranchIds={myBranches.map(b => b.id)} directorData={directorData} allBranches={myBranches} addFinance={addFinance} approveFinance={approveFinance} rejectFinance={rejectFinance} />}
            {view === 'groups' && <GroupsProfitability directorData={directorData} opData={opData} setGroupFee={setGroupFee} scopeBranchIds={null} />}
            {view === 'settings' && <SettingsPage director={director} updateDirector={updateDirector} />}
          </main>
        </div>
        <AppBottomNav view={view} goTo={goTo} items={DIRECTOR_NAV} />
        <ToastStack toasts={toasts} onDismiss={id => setToasts(prev => prev.filter(n => n.id !== id))} />

        {modal?.type === 'branchForm' && <BranchFormModal editing={modal.editing} onSubmit={p => modal.editing ? updateBranch(modal.editing.id, p) : addBranch(p)} onClose={closeModal} />}
        {modal?.type === 'branchDetail' && (() => { const b = directorData.branches.find(x => x.id === modal.branchId); return b ? <BranchDetailModal branch={b} directorData={directorData} opData={opData} onClose={closeModal} /> : null; })()}
        {modal?.type === 'managerForm' && <ManagerFormModal editing={modal.editing} branches={myBranches} onSubmit={p => modal.editing ? updateManager(modal.editing.id, p) : addManager(p)} onClose={closeModal} />}
        {modal?.type === 'managerPermissions' && (() => { const mgr = directorData.managers.find(m => m.id === modal.managerId); return mgr ? <ManagerPermissionsModal manager={mgr} onSave={allowed => updateManagerPermissions(mgr.id, allowed)} onClose={closeModal} /> : null; })()}
        {modal?.type === 'teacherHRForm' && <TeacherHRFormModal editing={modal.editing} branches={myBranches} onSubmit={p => modal.editing ? updateTeacherHR(modal.editing.id, p) : addTeacherHR(p)} onClose={closeModal} />}
        {modal?.type === 'courseForm' && <CourseFormModal editing={modal.editing} branches={myBranches} onSubmit={p => modal.editing ? updateCourse(modal.editing.id, p) : addCourse(p)} onClose={closeModal} />}
        {modal?.type === 'recordPayment' && <RecordPaymentModal initialStudentId={modal.studentId} initialCourseId={modal.courseId} scopeBranches={myBranches} directorData={directorData} opData={opData} onSubmit={recordPayment} onClose={closeModal} />}
        {modal?.type === 'confirm' && <ConfirmModal message={modal.message} onConfirm={handleConfirm} onCancel={closeModal} />}
      </div>
    </ThemeContext.Provider>
  );
}
