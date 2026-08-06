import { useState, useEffect, createContext, useContext } from "react";
import {
  Users,
  Wallet,
  CheckCircle2,
  TrendingDown,
  TrendingUp,
  GraduationCap,
  PartyPopper,
  AlertTriangle,
  CreditCard,
  BookOpen,
  ClipboardList,
  Building2,
  Armchair,
  Bell,
  Home,
  School,
  DoorOpen,
  Sparkles,
  Trophy,
  Loader2,
  X,
  Star,
  Moon,
  Sun,
  Palette,
  EyeOff,
  Eye,
  LogIn,
  LogOut,
  Plus,
  Pencil,
  Trash2,
  Percent,
  Check,
  XCircle,
  Banknote,
  Zap,
  Megaphone,
  Wrench,
  Library,
  Bookmark,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
  Legend,
} from "recharts";
import {
  loadInitialData,
  persistDirectorData,
  persistOpData,
  persistSession,
  persistNotifLog,
} from "./manager_backend";

/* ============================== CONSTANTS ============================== */

const WEEK_DAYS = [
  "Dushanba",
  "Seshanba",
  "Chorshanba",
  "Payshanba",
  "Juma",
  "Shanba",
  "Yakshanba",
];
const MONTHS_UZ = [
  "yanvar",
  "fevral",
  "mart",
  "aprel",
  "may",
  "iyun",
  "iyul",
  "avgust",
  "sentabr",
  "oktabr",
  "noyabr",
  "dekabr",
];
const JS_DAY_NAMES = [
  "Yakshanba",
  "Dushanba",
  "Seshanba",
  "Chorshanba",
  "Payshanba",
  "Juma",
  "Shanba",
];

const MANAGER_NAV_ALL = [
  { id: "home", label: "Bosh sahifa", icon: <Icon name="house" size={18} /> },
  {
    id: "payments",
    label: "To'lovlar",
    icon: <Icon name="credit-card" size={18} />,
  },
  {
    id: "teachers",
    label: "O'qituvchilar",
    icon: <Icon name="graduation-cap" size={18} />,
  },
  { id: "courses", label: "Kurslar", icon: <Icon name="book" size={18} /> },
  {
    id: "groups",
    label: "Guruhlar",
    icon: <Icon name="clipboard-list" size={18} />,
  },
  {
    id: "attendance",
    label: "Davomat",
    icon: <Icon name="check-circle" size={18} />,
  },
  { id: "rooms", label: "Xonalar", icon: <Icon name="school" size={18} /> },
  {
    id: "finance",
    label: "Moliya",
    icon: <Icon name="sack-dollar" size={18} />,
  },
  {
    id: "holidays",
    label: "Bayramlar",
    icon: <Icon name="party-horn" size={18} />,
  },
  {
    id: "notifications",
    label: "Bildirishnomalar",
    icon: <Icon name="bell" size={18} />,
  },
];

const EXPENSE_CATEGORIES = [
  "Ijara",
  "Ish haqi",
  "Kommunal",
  "Reklama",
  "Jihoz",
  "O'quv materiali",
  "Boshqa",
];
const EXPENSE_CATEGORY_ICONS = {
  Ijara: "house",
  "Ish haqi": "money-bill",
  Kommunal: "bolt",
  Reklama: "megaphone",
  Jihoz: "tools",
  "O'quv materiali": "books",
  Boshqa: "bookmark",
};
const EXPENSE_CATEGORY_COLORS = {
  Ijara: "#F97316",
  "Ish haqi": "#8B5CF6",
  Kommunal: "#F59E0B",
  Reklama: "#EC4899",
  Jihoz: "#14B8A6",
  "O'quv materiali": "#84CC16",
  Boshqa: "#64748B",
};
function categoryIcon(category) {
  return (
    <Icon
      name={EXPENSE_CATEGORY_ICONS[category] || "bookmark"}
      size={16}
      style={{ color: EXPENSE_CATEGORY_COLORS[category] || "#64748B" }}
    />
  );
}
function categoryColor(category) {
  return EXPENSE_CATEGORY_COLORS[category] || "#64748B";
}
const MONEY_COLORS = {
  income: "#16A34A",
  incomeSoft: "#F0FDF4",
  incomeBorder: "#BBF7D0",
  expense: "#DC2626",
  expenseSoft: "#FEF2F2",
  expenseBorder: "#FECACA",
  warning: "#D97706",
  warningSoft: "#FFFBEB",
  warningBorder: "#FDE68A",
};
const PAYMENT_METHODS = [
  { id: "cash", label: "Naqd", icon: "money-bill-wave" },
  { id: "card", label: "Plastik", icon: "credit-card" },
];
const GROUP_COLORS = [
  "#f43f5e",
  "#f59e0b",
  "#10b981",
  "#0ea5e9",
  "#8b5cf6",
  "#ec4899",
  "#14b8a6",
  "#f97316",
  "#6366f1",
  "#84cc16",
];
function nextGroupColor(groups) {
  return GROUP_COLORS[groups.length % GROUP_COLORS.length];
}

/* ============================== THEME ============================== */

const THEMES = {
  cosmos: {
    id: "cosmos",
    name: "Cosmos",
    bg: "#0A1454",
    accent1: "#1B3BFF",
    accent2: "#4F73FF",
    blob1: "#1B3BFF",
    blob2: "#4F73FF",
    blob3: "#0A1454",
  },
  violet: {
    id: "violet",
    name: "Binafsha",
    bg: "#2e1065",
    accent1: "#c026d3",
    accent2: "#8b5cf6",
    blob1: "#8b5cf6",
    blob2: "#ec4899",
    blob3: "#0ea5e9",
  },
  ocean: {
    id: "ocean",
    name: "Okean",
    bg: "#0c4a6e",
    accent1: "#22d3ee",
    accent2: "#10b981",
    blob1: "#22d3ee",
    blob2: "#10b981",
    blob3: "#0ea5e9",
  },
  sunset: {
    id: "sunset",
    name: "Quyosh botishi",
    bg: "#7c2d12",
    accent1: "#fb923c",
    accent2: "#f43f5e",
    blob1: "#fb923c",
    blob2: "#f43f5e",
    blob3: "#f59e0b",
  },
  day: {
    id: "day",
    name: "Kunduzgi (och ko'k)",
    bg: "#5b7fc7",
    accent1: "#1e3a8a",
    accent2: "#1d4ed8",
    blob1: "#93c5fd",
    blob2: "#bfdbfe",
    blob3: "#60a5fa",
  },
  night: {
    id: "night",
    name: "Tungi (to'q ko'k)",
    bg: "#0b1120",
    accent1: "#1e40af",
    accent2: "#1e3a8a",
    blob1: "#1e3a8a",
    blob2: "#172554",
    blob3: "#1e3a8a",
  },
};

function clamp255(n) {
  return Math.max(0, Math.min(255, Math.round(n)));
}
function toHex(r, g, b) {
  return (
    "#" +
    [r, g, b].map((x) => clamp255(x).toString(16).padStart(2, "0")).join("")
  );
}
function toRgbStr(r, g, b, amt) {
  return `rgb(${clamp255(r * amt)}, ${clamp255(g * amt)}, ${clamp255(b * amt)})`;
}

function buildCustomTheme(r, g, b) {
  return {
    id: "custom",
    name: "Brend ranglar",
    bg: toRgbStr(r * 0.32, g * 0.32, b * 0.32, 1),
    accent1: toHex(r, g, b),
    accent2: toHex(r * 0.8 + 40, g * 0.8 + 15, b * 0.8 + 60),
    blob1: toHex(r, g, b),
    blob2: toHex(r * 0.7 + 60, g * 0.9, b * 1.1),
    blob3: toHex(r * 1.1, g * 0.9 + 20, b * 0.7),
  };
}

function extractAverageColor(dataUrl) {
  return new Promise((resolve) => {
    try {
      const img = new window.Image();
      img.onload = () => {
        const size = 32;
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, size, size);
        const data = ctx.getImageData(0, 0, size, size).data;
        let r = 0,
          g = 0,
          b = 0,
          count = 0;
        for (let i = 0; i < data.length; i += 4) {
          if (data[i + 3] < 80) continue;
          r += data[i];
          g += data[i + 1];
          b += data[i + 2];
          count++;
        }
        if (!count) {
          resolve(null);
          return;
        }
        resolve({ r: r / count, g: g / count, b: b / count });
      };
      img.onerror = () => resolve(null);
      img.src = dataUrl;
    } catch (e) {
      resolve(null);
    }
  });
}

const ThemeContext = createContext(THEMES.cosmos);
function useTheme() {
  return useContext(ThemeContext);
}

/* ============================== ICON (lucide-react, rendered solid/filled) ============================== */

const ICON_COMPONENTS = {
  users: Users,
  "sack-dollar": Wallet,
  "check-circle": CheckCircle2,
  "chart-line-down": TrendingDown,
  "chart-line-up": TrendingUp,
  "graduation-cap": GraduationCap,
  "party-horn": PartyPopper,
  "triangle-warning": AlertTriangle,
  "credit-card": CreditCard,
  book: BookOpen,
  "clipboard-list": ClipboardList,
  building: Building2,
  chair: Armchair,
  bell: Bell,
  house: Home,
  school: School,
  "door-open": DoorOpen,
  sparkles: Sparkles,
  trophy: Trophy,
  spinner: Loader2,
  "cross-small": X,
  star: Star,
  moon: Moon,
  sun: Sun,
  palette: Palette,
  "eye-crossed": EyeOff,
  eye: Eye,
  "sign-in-alt": LogIn,
  "sign-out-alt": LogOut,
  plus: Plus,
  pen: Pencil,
  trash: Trash2,
  wallet: Wallet,
  percentage: Percent,
  check: Check,
  "cross-circle": XCircle,
  "money-bill": Banknote,
  "money-bill-wave": Banknote,
  bolt: Zap,
  megaphone: Megaphone,
  tools: Wrench,
  books: Library,
  bookmark: Bookmark,
};

function Icon({ name, size = 16, className = "", style }) {
  const Cmp = ICON_COMPONENTS[name] || Bookmark;
  return (
    <Cmp
      size={size}
      className={className}
      style={style}
      fill="currentColor"
      strokeWidth={1.25}
    />
  );
}

/* ============================== STYLE TOKENS ============================== */

const PAGE_BG_STYLE = {
  background: "linear-gradient(160deg, #f3f4f6 0%, #eceef1 45%, #f4f3f1 100%)",
};
const GLASS =
  "bg-white border border-slate-200/80 shadow-lg shadow-slate-900/5";
const GLASS_SOFT = "bg-white/85 border border-slate-200/70";
const INPUT_CLS =
  "w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:bg-white focus:border-slate-400 transition-all text-sm";
const LABEL_CLS =
  "block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wide";
const BTN_PRIMARY_BASE =
  "backdrop-blur-md border border-slate-200 text-white font-medium rounded-xl px-4 py-2.5 transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 text-sm disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100 hover:brightness-110";
const BTN_GHOST =
  "bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-700 rounded-xl px-4 py-2 transition-all text-sm flex items-center justify-center gap-2";
const BTN_ICON =
  "w-9 h-9 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center justify-center transition-all text-slate-600 hover:text-slate-700 shrink-0";

function PrimaryButton({ children, className = "", ...props }) {
  const theme = useTheme();
  return (
    <button
      {...props}
      className={`${BTN_PRIMARY_BASE} ${className}`}
      style={{ background: theme.accent1 }}
    >
      {children}
    </button>
  );
}

/* ============================== UTILITIES ============================== */

function generateId(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}
function todayISO() {
  return new Date().toISOString().slice(0, 10);
}
function thisMonthKey() {
  return new Date().toISOString().slice(0, 7);
}
function prevMonthKey(month) {
  const [y, m] = month.split("-").map(Number);
  return new Date(y, m - 2, 1).toISOString().slice(0, 7);
}
function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T00:00:00");
  if (isNaN(d.getTime())) return dateStr;
  return `${d.getDate()}-${MONTHS_UZ[d.getMonth()]}, ${d.getFullYear()}`;
}
function initials(name) {
  return (name || "?")
    .trim()
    .split(/\s+/)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}
function normalizePhone(p) {
  return (p || "").replace(/\D/g, "");
}
function displayPhone(local) {
  return local ? "+998 " + local : "kiritilmagan";
}
function money(n) {
  return (n || 0).toLocaleString("uz-UZ");
}
function generateDemoCode() {
  return String(Math.floor(10000 + Math.random() * 90000));
}
function timeAgo(ts) {
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 60) return "hozir";
  if (diff < 3600) return `${Math.floor(diff / 60)} daq oldin`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} soat oldin`;
  return `${Math.floor(diff / 86400)} kun oldin`;
}

function getPaymentTotal(payments, studentId, groupId, month) {
  return payments
    .filter(
      (p) =>
        p.studentId === studentId && p.groupId === groupId && p.month === month,
    )
    .reduce((s, p) => s + p.amount, 0);
}
function getPaymentStatus(payments, studentId, groupId, month, price) {
  const total = getPaymentTotal(payments, studentId, groupId, month);
  if (total <= 0) return "unpaid";
  if (total < price) return "partial";
  return "paid";
}

async function hashPassword(pw) {
  try {
    if (window.crypto && window.crypto.subtle) {
      const enc = new TextEncoder().encode(pw);
      const buf = await window.crypto.subtle.digest("SHA-256", enc);
      return Array.from(new Uint8Array(buf))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
    }
  } catch (e) {
    /* fall through */
  }
  let hash = 0;
  for (let i = 0; i < pw.length; i++) {
    hash = ((hash << 5) - hash + pw.charCodeAt(i)) | 0;
  }
  return "fallback-" + Math.abs(hash).toString(16);
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
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(img.width * scale));
      canvas.height = Math.max(1, Math.round(img.height * scale));
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = reject;
    img.src = dataUrl;
  });
}

/* ============================== SEED DATA ============================== */

function seedDirectorData() {
  return {
    // TEST HISOB — faqat sinov uchun. Ishlab chiqarishga (real mijozga) topshirishdan oldin bu hisobni o'chirib tashlang.
    // Menejer kirish: +998 90 123 41 00 / menejer123
    directors: [
      {
        id: "dir-test",
        name: "Test Direktor",
        phone: "901234000",
        passwordHash:
          "c837bd58a08f8ada06fb65e588af776b332e580dec1d042d75f32a6c89367297",
        centerName: "Test Markaz",
        logo: null,
        address: "",
        themeId: "cosmos",
        customTheme: null,
        twoFactorEnabled: false,
      },
    ],
    branches: [
      {
        id: "br-test",
        directorId: "dir-test",
        name: "Test filial",
        address: "",
        color: "#8b5cf6",
      },
    ],
    managers: [
      {
        id: "mgr-test",
        branchIds: ["br-test"],
        name: "Test Menejer",
        phone: "901234100",
        birthDate: "",
        address: "",
        passwordHash:
          "59b752c833bfedb868c0f7f308d9503709883550de40a41ff22bf484257dbb9e",
        monthlySalary: 0,
        rating: 0,
        allowedPages: MANAGER_NAV_ALL.map((p) => p.id),
      },
    ],
    teachersHR: [],
    teacherPayments: [],
    holidays: [],
    finance: [],
    courses: [],
    payments: [],
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
  // Decorative colored glow removed — background stays a flat neutral tint per user preference.
  return null;
}

function LoadingScreen() {
  const theme = useTheme();
  return (
    <div
      className="min-h-screen w-full flex items-center justify-center text-slate-900"
      style={PAGE_BG_STYLE}
    >
      <div className="flex flex-col items-center gap-3">
        <Icon name="spinner" size={28} className="animate-spin" />
        <p className="text-slate-600 text-sm">Yuklanmoqda...</p>
      </div>
    </div>
  );
}

function Avatar({ name, color = "#8b5cf6", size = 40, photo, onClick }) {
  const style = { width: size, height: size, minWidth: size };
  if (photo)
    return (
      <img
        src={photo}
        alt={name}
        style={style}
        onClick={onClick}
        className={`rounded-full object-cover border-2 border-slate-200 ${onClick ? "cursor-pointer" : ""}`}
      />
    );
  return (
    <div
      style={{ ...style, background: color, fontSize: size * 0.38 }}
      onClick={onClick}
      className={`font-display rounded-full flex items-center justify-center font-bold text-white border-2 border-slate-200 shrink-0 ${onClick ? "cursor-pointer" : ""}`}
    >
      {initials(name)}
    </div>
  );
}

function PhoneInput({ value, onChange, autoFocus, onKeyDown }) {
  function handleChange(e) {
    let digits = e.target.value.replace(/\D/g, "");
    if (digits.startsWith("998") && digits.length > 9) digits = digits.slice(3);
    onChange(digits.slice(0, 9));
  }
  return (
    <div className="flex items-center gap-2">
      <span className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-600 text-sm shrink-0">
        +998
      </span>
      <input
        value={value}
        onChange={handleChange}
        placeholder="90 123 45 67"
        inputMode="numeric"
        autoFocus={autoFocus}
        onKeyDown={onKeyDown}
        className={INPUT_CLS}
      />
    </div>
  );
}

function Modal({ title, onClose, children, wide }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`${GLASS} rounded-3xl p-5 sm:p-6 w-full ${wide ? "max-w-2xl" : "max-w-md"} max-h-[85vh] overflow-y-auto`}
        style={{ background: "#ffffff" }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-lg font-semibold text-slate-900">
            {title}
          </h3>
          <button onClick={onClose} className={BTN_ICON}>
            <Icon name="cross-small" size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function ConfirmModal({ message, onConfirm, onCancel }) {
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`${GLASS} rounded-3xl p-6 w-full max-w-sm`}
        style={{ background: "#ffffff" }}
      >
        <p className="text-slate-900 mb-5">{message}</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className={`${BTN_GHOST} flex-1`}>
            Yo'q, bekor
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 bg-red-500 hover:bg-red-600 border border-red-500 text-white rounded-xl px-4 py-2 text-sm transition-all"
          >
            Ha, tasdiqlash
          </button>
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
      {toasts.map((n) => (
        <div
          key={n.id}
          className={`${GLASS} rounded-2xl p-3.5 flex items-start gap-3`}
          style={{
            background: `${theme.accent1}e6`,
            animation: "fadeIn 0.3s ease",
          }}
        >
          <Icon name="bell" size={18} className="text-white shrink-0 mt-0.5" />
          <p className="text-white text-sm flex-1">{n.message}</p>
          <button
            onClick={() => onDismiss(n.id)}
            className="text-white/70 hover:text-white shrink-0"
          >
            <Icon name="cross-small" size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}

function EmptyState({ icon, title, subtitle, action }) {
  return (
    <div
      className={`${GLASS_SOFT} rounded-3xl p-10 flex flex-col items-center text-center gap-3`}
    >
      <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-3xl leading-none">
        {icon}
      </div>
      <p className="text-slate-900 font-medium">{title}</p>
      {subtitle && (
        <p className="text-slate-500 text-sm max-w-sm">{subtitle}</p>
      )}
      {action}
    </div>
  );
}

function StatCard({ label, value, sub, icon, color }) {
  const chipStyle = color
    ? { background: `${color}14`, borderColor: `${color}40`, color }
    : {};
  return (
    <div className={`${GLASS} rounded-2xl p-4`}>
      <div
        className={`w-9 h-9 rounded-xl border flex items-center justify-center mb-2 text-lg leading-none ${color ? "" : "bg-slate-100 border-slate-200 text-slate-600"}`}
        style={chipStyle}
      >
        {icon}
      </div>
      <p className="font-display text-slate-900 text-xl font-bold truncate">
        {value}
      </p>
      <p className="text-slate-500 text-xs mt-0.5">{label}</p>
      {sub && <p className="text-slate-400 text-[11px] mt-0.5">{sub}</p>}
    </div>
  );
}

function StarPicker({ value, onChange, size = 20 }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <button key={s} type="button" onClick={() => onChange(s)}>
          <Icon
            name="star"
            size={size}
            className={
              s <= value ? "fill-amber-400 text-amber-400" : "text-slate-300"
            }
          />
        </button>
      ))}
    </div>
  );
}

function DayPicker({ value, onChange }) {
  function toggle(d) {
    onChange(value.includes(d) ? value.filter((x) => x !== d) : [...value, d]);
  }
  return (
    <div className="flex flex-wrap gap-1.5">
      {WEEK_DAYS.map((d) => (
        <button
          key={d}
          type="button"
          onClick={() => toggle(d)}
          className={`text-xs px-2.5 py-1.5 rounded-lg border transition-all ${value.includes(d) ? "bg-slate-100 border-slate-300 text-slate-700" : "bg-slate-50 border-slate-200 text-slate-500"}`}
        >
          {d}
        </button>
      ))}
    </div>
  );
}

function ToggleSwitch({ checked, onChange, label, sub }) {
  const theme = useTheme();
  return (
    <div className="flex items-center justify-between gap-3">
      <div>
        <p className="text-slate-900 text-sm">{label}</p>
        {sub && <p className="text-slate-400 text-xs">{sub}</p>}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`w-11 h-6 rounded-full transition-all relative shrink-0 ${checked ? "" : "bg-slate-100 border border-slate-200"}`}
        style={checked ? { background: theme.accent1 } : {}}
      >
        <span
          className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${checked ? "left-6" : "left-1"}`}
        />
      </button>
    </div>
  );
}

/* ============================== THEME SWITCHER (quick, top bar) ============================== */

function ThemeSwitcher({ director, updateDirector }) {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const allThemes = [
    ...Object.values(THEMES),
    ...(director.customTheme ? [director.customTheme] : []),
  ];
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className={BTN_ICON}
        title="Mavzuni tezkor almashtirish"
      >
        {theme.id === "night" ? (
          <Icon name="moon" size={16} />
        ) : theme.id === "day" ? (
          <Icon name="sun" size={16} />
        ) : (
          <Icon name="palette" size={16} />
        )}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            className={`${GLASS} rounded-2xl p-2 absolute left-0 top-11 z-50 w-48`}
            style={{ background: "#ffffff" }}
          >
            {allThemes.map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  updateDirector({ ...director, themeId: t.id });
                  setOpen(false);
                }}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all ${theme.id === t.id ? "bg-slate-100 text-slate-700" : "text-slate-600 hover:bg-slate-50"}`}
              >
                <span
                  className="w-4 h-4 rounded-full shrink-0"
                  style={{ background: t.accent1 }}
                />
                {t.name}
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
  const unread = log.filter((n) => !n.read).length;
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className={`${BTN_ICON} relative`}
      >
        <Icon name="bell" size={16} />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] flex items-center justify-center font-bold">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            className={`${GLASS} rounded-2xl p-2 absolute right-0 top-11 z-50 w-72 max-h-80 overflow-y-auto`}
            style={{ background: "#ffffff" }}
          >
            <div className="flex items-center justify-between px-2 py-1.5">
              <p className="text-slate-900 text-xs font-medium">
                Bildirishnomalar
              </p>
              {log.length > 0 && (
                <button
                  onClick={onClear}
                  className="text-slate-400 hover:text-slate-900 text-[11px]"
                >
                  Tozalash
                </button>
              )}
            </div>
            {log.length === 0 ? (
              <p className="text-slate-400 text-xs px-2 py-4 text-center">
                Hozircha bildirishnoma yo'q.
              </p>
            ) : (
              log.map((n) => (
                <div
                  key={n.id}
                  className="px-3 py-2 rounded-xl hover:bg-slate-50"
                >
                  <p className="text-slate-700 text-xs">{n.message}</p>
                  <p className="text-slate-400 text-[10px] mt-0.5">
                    {timeAgo(n.createdAt)}
                  </p>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}

/* ============================== TEACHER-APP DATA HELPERS (read-only) ============================== */

function opActiveStudents(opData) {
  return (opData?.students || []).filter((s) => (s.groupIds || []).length > 0)
    .length;
}
function opFrozenStudents(opData) {
  return (opData?.students || []).filter((s) => (s.groupIds || []).length === 0)
    .length;
}
function opGroups(opData) {
  return opData?.groups || [];
}
function opGroupStudentCount(opData, groupId) {
  return (opData?.students || []).filter((s) =>
    (s.groupIds || []).includes(groupId),
  ).length;
}
function opStudentsInGroups(opData, groupIds) {
  return (opData?.students || []).filter((s) =>
    (s.groupIds || []).some((id) => groupIds.includes(id)),
  );
}
function opRooms(opData) {
  return opData?.rooms || [];
}
function opAttendance(opData) {
  return opData?.attendance || [];
}
function attendanceStatus(record, studentId) {
  const entry = record?.records?.[studentId];
  if (entry == null) return null;
  return typeof entry === "string" ? entry : entry.status;
}

function computeBranchStats(branch, directorData, opData) {
  const courses = directorData.courses.filter((c) => c.branchId === branch.id);
  const courseIds = courses.map((c) => c.id);
  const groups = opGroups(opData).filter((g) => courseIds.includes(g.courseId));
  const groupIds = groups.map((g) => g.id);
  const activeStudents = opStudentsInGroups(opData, groupIds).length;
  const teacherCount = directorData.teachersHR.filter(
    (t) => t.branchId === branch.id,
  ).length;
  const now = new Date();
  const thisMonth = now.getMonth(),
    thisYear = now.getFullYear();
  const branchFinance = directorData.finance.filter(
    (f) => f.branchId === branch.id,
  );
  const inThisMonth = (f) =>
    new Date(f.date).getMonth() === thisMonth &&
    new Date(f.date).getFullYear() === thisYear;
  const collected = branchFinance
    .filter(
      (f) => f.type === "income" && f.status === "approved" && inThisMonth(f),
    )
    .reduce((s, f) => s + f.amount, 0);
  const expenses = branchFinance
    .filter(
      (f) => f.type === "expense" && f.status === "approved" && inThisMonth(f),
    )
    .reduce((s, f) => s + f.amount, 0);
  const expectedRevenue = groups.reduce(
    (sum, g) => sum + (g.price || 0) * opGroupStudentCount(opData, g.id),
    0,
  );
  return {
    collected,
    expenses,
    netProfit: collected - expenses,
    expectedRevenue,
    activeStudents,
    teacherCount,
    courseCount: courses.length,
    groupCount: groups.length,
  };
}

function getTeacherPayStats(directorData, opData, teacher, branch, month) {
  const branchStats = branch
    ? computeBranchStats(branch, directorData, opData)
    : null;
  const expectedPay =
    teacher.salaryType === "fixed"
      ? teacher.fixedSalary || 0
      : Math.round(
          ((branchStats?.expectedRevenue || 0) *
            (teacher.revenueSharePercent || 0)) /
            100,
        );
  const payments = (directorData.teacherPayments || []).filter(
    (p) => p.teacherHRId === teacher.id && p.month === month,
  );
  const advances = payments
    .filter((p) => p.type === "advance")
    .reduce((s, p) => s + p.amount, 0);
  const salaryPaid = payments
    .filter((p) => p.type === "salary")
    .reduce((s, p) => s + p.amount, 0);
  const totalPaid = advances + salaryPaid;
  return {
    expectedPay,
    advances,
    salaryPaid,
    totalPaid,
    remaining: Math.max(0, expectedPay - totalPaid),
    payments,
  };
}

/* ============================== AUTH ============================== */

function ManagerAuth({ directorData, onLoginManager }) {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleLogin() {
    setError("");
    setBusy(true);
    const hash = await hashPassword(password);
    const normalized = normalizePhone(phone);
    const mgr = directorData.managers.find(
      (m) => normalizePhone(m.phone) === normalized && m.passwordHash === hash,
    );
    setBusy(false);
    if (mgr) onLoginManager(mgr.id);
    else setError("Telefon raqam yoki parol noto'g'ri.");
  }

  const theme = useTheme();

  return (
    <div
      className="min-h-screen w-full text-slate-900 relative flex"
      style={{
        ...PAGE_BG_STYLE,
        fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
      }}
    >
      <GlobalStyleTag />
      <BackgroundBlobs />
      <div className="hidden lg:flex flex-1 flex-col justify-center px-16 relative z-10">
        <p className="text-5xl mb-4">
          <Icon name="building" size={18} />
        </p>
        <h1 className="font-display text-4xl font-bold mb-3 leading-tight">
          Kunlik ishni
          <br />
          bir joydan yuriting
        </h1>
        <p className="text-slate-500 text-base max-w-md">
          O'quvchi qabuli, guruhlar, to'lovlar va moliya so'rovlari — direktor
          sizga biriktirgan filial(lar) doirasida.
        </p>
      </div>
      <div className="flex-1 flex items-center justify-center p-4 relative z-10">
        <div
          className={`${GLASS} rounded-3xl p-6 sm:p-8 w-full max-w-sm`}
          style={{ background: "#ffffff" }}
        >
          <div className="text-center mb-6">
            <p className="text-3xl mb-2">
              <Icon name="building" size={18} />
            </p>
            <h1 className="font-display text-xl font-bold">Menejer Panel</h1>
          </div>
          <div className="space-y-3">
            <div>
              <label className={LABEL_CLS}>Telefon raqam</label>
              <PhoneInput value={phone} onChange={setPhone} autoFocus />
            </div>
            <div className="relative">
              <label className={LABEL_CLS}>Parol</label>
              <input
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={INPUT_CLS}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="absolute right-3 top-[34px] text-slate-500 hover:text-slate-900"
              >
                {showPw ? (
                  <Icon name="eye-crossed" size={16} />
                ) : (
                  <Icon name="eye" size={16} />
                )}
              </button>
            </div>
            {error && <p className="text-red-500 text-xs">{error}</p>}
            <PrimaryButton
              onClick={handleLogin}
              disabled={busy}
              className="w-full"
            >
              {busy ? (
                <Icon name="spinner" size={16} className="animate-spin" />
              ) : (
                <Icon name="sign-in-alt" size={16} />
              )}{" "}
              Kirish
            </PrimaryButton>
            <p className="text-slate-400 text-[11px] text-center pt-1">
              Hisobingiz yo'qmi? Direktoringizdan menejer sifatida
              qo'shilishingizni so'rang.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================== DASHBOARD ============================== */

function DashboardHome({
  scopeBranches,
  directorData,
  opData,
  centerLabel,
  allBranches,
}) {
  const theme = useTheme();
  const [branchId, setBranchId] = useState("all");
  const effectiveBranches =
    branchId === "all"
      ? scopeBranches
      : scopeBranches.filter((b) => b.id === branchId);
  const branchIds = effectiveBranches.map((b) => b.id);
  const finance = directorData.finance.filter((f) =>
    branchIds.includes(f.branchId),
  );

  const now = new Date();
  const thisMonth = now.getMonth(),
    thisYear = now.getFullYear();
  const month = thisMonthKey();
  const inThisMonth = (f) => {
    const d = new Date(f.date);
    return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
  };

  const collected = finance
    .filter(
      (f) => f.type === "income" && f.status === "approved" && inThisMonth(f),
    )
    .reduce((s, f) => s + f.amount, 0);
  const expenses = finance
    .filter(
      (f) => f.type === "expense" && f.status === "approved" && inThisMonth(f),
    )
    .reduce((s, f) => s + f.amount, 0);
  const pendingCount = finance.filter((f) => f.status === "pending").length;

  const courses = directorData.courses.filter((c) =>
    branchIds.includes(c.branchId),
  );
  const courseIds = courses.map((c) => c.id);
  const branchGroups = opGroups(opData).filter((g) =>
    courseIds.includes(g.courseId),
  );
  const expectedRevenue = branchGroups.reduce(
    (sum, g) => sum + (g.price || 0) * opGroupStudentCount(opData, g.id),
    0,
  );
  const activeStudents = opActiveStudents(opData);
  const frozenStudents = opFrozenStudents(opData);

  const monthlyTrend = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(thisYear, thisMonth - i, 1);
    const mIncome = finance
      .filter(
        (f) =>
          f.type === "income" &&
          f.status === "approved" &&
          new Date(f.date).getMonth() === d.getMonth() &&
          new Date(f.date).getFullYear() === d.getFullYear(),
      )
      .reduce((s, f) => s + f.amount, 0);
    const mExpense = finance
      .filter(
        (f) =>
          f.type === "expense" &&
          f.status === "approved" &&
          new Date(f.date).getMonth() === d.getMonth() &&
          new Date(f.date).getFullYear() === d.getFullYear(),
      )
      .reduce((s, f) => s + f.amount, 0);
    monthlyTrend.push({
      name: MONTHS_UZ[d.getMonth()].slice(0, 3),
      Kirim: mIncome,
      Chiqim: mExpense,
    });
  }

  const expenseByCategory = {};
  finance
    .filter((f) => f.type === "expense" && f.status === "approved")
    .forEach((f) => {
      expenseByCategory[f.category] =
        (expenseByCategory[f.category] || 0) + f.amount;
    });
  const pieData = Object.entries(expenseByCategory).map(([name, value]) => ({
    name,
    value,
  }));

  const courseRevenue = courses
    .map((c) => {
      const cGroups = opGroups(opData).filter((g) => g.courseId === c.id);
      const revenue = cGroups.reduce(
        (sum, g) => sum + (g.price || 0) * opGroupStudentCount(opData, g.id),
        0,
      );
      const studentIds = new Set();
      cGroups.forEach((g) =>
        opStudentsInGroups(opData, [g.id]).forEach((s) => studentIds.add(s.id)),
      );
      return {
        name: c.name.length > 14 ? c.name.slice(0, 14) + "…" : c.name,
        Daromad: revenue,
        Talaba: studentIds.size,
      };
    })
    .sort((a, b) => b.Daromad - a.Daromad)
    .slice(0, 6);

  // Payment method breakdown (this month)
  const monthPayments = directorData.payments.filter(
    (p) => p.month === month && branchGroups.some((g) => g.id === p.groupId),
  );
  const cashTotal = monthPayments
    .filter((p) => p.method === "cash")
    .reduce((s, p) => s + p.amount, 0);
  const cardTotal = monthPayments
    .filter((p) => p.method === "card")
    .reduce((s, p) => s + p.amount, 0);
  const paymentMethodData = [
    { name: "Naqd", value: cashTotal },
    { name: "Plastik", value: cardTotal },
  ].filter((d) => d.value > 0);

  // Teacher rating comparison
  const teacherRatingData = directorData.teachersHR
    .filter((t) => branchIds.includes(t.branchId))
    .map((t) => ({
      name: t.name.length > 10 ? t.name.slice(0, 10) + "…" : t.name,
      Baho: t.rating || 0,
    }));

  // Branch comparison (only meaningful with >1 branch)
  const branchCompareData =
    scopeBranches.length > 1
      ? scopeBranches.map((b) => {
          const st = computeBranchStats(b, directorData, opData);
          return {
            name: b.name.length > 12 ? b.name.slice(0, 12) + "…" : b.name,
            Foyda: st.netProfit,
          };
        })
      : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold text-slate-900">
            Bosh sahifa
          </h2>
          <p className="text-slate-500 text-sm mt-0.5">
            {centerLabel} — {MONTHS_UZ[thisMonth]} {thisYear}
          </p>
        </div>
        {allBranches && scopeBranches.length > 1 && (
          <select
            value={branchId}
            onChange={(e) => setBranchId(e.target.value)}
            className={`${INPUT_CLS} w-auto`}
          >
            <option value="all">Barcha filiallar</option>
            {scopeBranches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          icon={<Icon name="users" size={18} />}
          color="#8B5CF6"
          label="Faol o'quvchilar"
          value={activeStudents}
          sub={frozenStudents ? `${frozenStudents} nofaol` : undefined}
        />
        <StatCard
          icon={<Icon name="sack-dollar" size={18} />}
          color="#8B5CF6"
          label="Kutilayotgan oylik daromad"
          value={money(expectedRevenue) + " so'm"}
        />
        <StatCard
          icon={<Icon name="check-circle" size={18} />}
          color={MONEY_COLORS.income}
          label="Bu oy yig'ilgan"
          value={money(collected) + " so'm"}
        />
        <StatCard
          icon={<Icon name="chart-line-down" size={18} />}
          color={MONEY_COLORS.expense}
          label="Bu oy xarajat"
          value={money(expenses) + " so'm"}
        />
      </div>

      {pendingCount > 0 && (
        <div className={`${GLASS} rounded-2xl p-4 flex items-center gap-3`}>
          <Icon name="bell" size={18} style={{ color: theme.accent1 }} />
          <p className="text-slate-900 text-sm flex-1">
            {pendingCount} ta xarajat tasdiqlashni kutmoqda.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className={`${GLASS} rounded-3xl p-5`}>
          <h3 className="font-display text-slate-900 font-semibold mb-4">
            Oylik kirim / chiqim (so'nggi 6 oy)
          </h3>
          <div style={{ width: "100%", height: 220 }}>
            <ResponsiveContainer>
              <LineChart data={monthlyTrend}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(15,23,42,0.08)"
                />
                <XAxis
                  dataKey="name"
                  stroke="rgba(15,23,42,0.4)"
                  fontSize={11}
                />
                <YAxis
                  stroke="rgba(15,23,42,0.4)"
                  fontSize={11}
                  tickFormatter={(v) => (v / 1000000).toFixed(1) + "M"}
                />
                <Tooltip
                  contentStyle={{
                    background: "#ffffff",
                    border: "1px solid #e2e8f0",
                    borderRadius: 12,
                    color: "#0f172a",
                  }}
                  formatter={(v) => money(v) + " so'm"}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line
                  type="monotone"
                  dataKey="Kirim"
                  stroke={MONEY_COLORS.income}
                  strokeWidth={2.5}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="Chiqim"
                  stroke={MONEY_COLORS.expense}
                  strokeWidth={2.5}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={`${GLASS} rounded-3xl p-5`}>
          <h3 className="font-display text-slate-900 font-semibold mb-4">
            Xarajatlar turlari bo'yicha
          </h3>
          {pieData.length === 0 ? (
            <p className="text-slate-400 text-sm py-10 text-center">
              Hali xarajat kiritilmagan.
            </p>
          ) : (
            <div style={{ width: "100%", height: 220 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name }) => name}
                  >
                    {pieData.map((entry) => (
                      <Cell key={entry.name} fill={categoryColor(entry.name)} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "#ffffff",
                      border: "1px solid #e2e8f0",
                      borderRadius: 12,
                      color: "#0f172a",
                    }}
                    formatter={(v) => money(v) + " so'm"}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className={`${GLASS} rounded-3xl p-5`}>
          <h3 className="font-display text-slate-900 font-semibold mb-4 flex items-center gap-2">
            <span className="text-base leading-none">
              <Icon name="credit-card" size={18} />
            </span>{" "}
            To'lov turlari (bu oy)
          </h3>
          {paymentMethodData.length === 0 ? (
            <p className="text-slate-400 text-sm py-10 text-center">
              Bu oy hali to'lov qabul qilinmagan.
            </p>
          ) : (
            <div style={{ width: "100%", height: 200 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={paymentMethodData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={75}
                    label={({ name, value }) =>
                      `${name}: ${(value / 1000).toFixed(0)}k`
                    }
                  >
                    <Cell fill="#10b981" />
                    <Cell fill="#0ea5e9" />
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "#ffffff",
                      border: "1px solid #e2e8f0",
                      borderRadius: 12,
                      color: "#0f172a",
                    }}
                    formatter={(v) => money(v) + " so'm"}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className={`${GLASS} rounded-3xl p-5`}>
          <h3 className="font-display text-slate-900 font-semibold mb-4 flex items-center gap-2">
            <span className="text-base leading-none">
              <Icon name="graduation-cap" size={18} />
            </span>{" "}
            O'qituvchilar bahosi
          </h3>
          {teacherRatingData.length === 0 ? (
            <p className="text-slate-400 text-sm py-10 text-center">
              Hali o'qituvchi yo'q.
            </p>
          ) : (
            <div style={{ width: "100%", height: 200 }}>
              <ResponsiveContainer>
                <BarChart data={teacherRatingData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(15,23,42,0.08)"
                  />
                  <XAxis
                    dataKey="name"
                    stroke="rgba(15,23,42,0.4)"
                    fontSize={10}
                  />
                  <YAxis
                    stroke="rgba(15,23,42,0.4)"
                    fontSize={11}
                    domain={[0, 5]}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "#ffffff",
                      border: "1px solid #e2e8f0",
                      borderRadius: 12,
                      color: "#0f172a",
                    }}
                  />
                  <Bar dataKey="Baho" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      <div className={`${GLASS} rounded-3xl p-5`}>
        <h3 className="font-display text-slate-900 font-semibold mb-4 flex items-center gap-2">
          <span className="text-base leading-none">
            <Icon name="sparkles" size={18} />
          </span>{" "}
          Kurslar bo'yicha o'quvchilar soni va daromad
        </h3>
        {courseRevenue.length === 0 ? (
          <p className="text-slate-400 text-sm py-6 text-center">
            Hali kurs yo'q — "Kurslar" bo'limidan qo'shing.
          </p>
        ) : (
          <div style={{ width: "100%", height: 220 }}>
            <ResponsiveContainer>
              <BarChart
                data={courseRevenue}
                layout="vertical"
                margin={{ left: 20 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(15,23,42,0.08)"
                  horizontal={false}
                />
                <XAxis
                  type="number"
                  stroke="rgba(15,23,42,0.4)"
                  fontSize={11}
                  tickFormatter={(v) => (v / 1000000).toFixed(1) + "M"}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  stroke="rgba(15,23,42,0.6)"
                  fontSize={11}
                  width={100}
                />
                <Tooltip
                  contentStyle={{
                    background: "#ffffff",
                    border: "1px solid #e2e8f0",
                    borderRadius: 12,
                    color: "#0f172a",
                  }}
                  formatter={(v) => money(v) + " so'm"}
                />
                <Bar
                  dataKey="Daromad"
                  fill={theme.accent1}
                  radius={[0, 6, 6, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {branchCompareData.length > 0 && (
        <div className={`${GLASS} rounded-3xl p-5`}>
          <h3 className="font-display text-slate-900 font-semibold mb-4 flex items-center gap-2">
            <span className="text-base leading-none">
              <Icon name="building" size={18} />
            </span>{" "}
            Filiallar bo'yicha sof foyda (bu oy)
          </h3>
          <div style={{ width: "100%", height: 220 }}>
            <ResponsiveContainer>
              <BarChart data={branchCompareData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(15,23,42,0.08)"
                />
                <XAxis
                  dataKey="name"
                  stroke="rgba(15,23,42,0.4)"
                  fontSize={11}
                />
                <YAxis
                  stroke="rgba(15,23,42,0.4)"
                  fontSize={11}
                  tickFormatter={(v) => (v / 1000000).toFixed(1) + "M"}
                />
                <Tooltip
                  contentStyle={{
                    background: "#ffffff",
                    border: "1px solid #e2e8f0",
                    borderRadius: 12,
                    color: "#0f172a",
                  }}
                  formatter={(v) => money(v) + " so'm"}
                />
                <Bar
                  dataKey="Foyda"
                  fill={theme.accent2}
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================== TEACHERS HR ============================== */

function TeachersHR({
  scopeBranches,
  directorData,
  opData,
  openModal,
  canEdit,
}) {
  const scopeIds = scopeBranches.map((b) => b.id);
  const teachers = directorData.teachersHR
    .filter((t) => scopeIds.includes(t.branchId))
    .sort((a, b) => (b.rating || 0) - (a.rating || 0));
  const best = teachers[0];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold text-slate-900">
            O'qituvchilar
          </h2>
          <p className="text-slate-500 text-sm mt-0.5">
            Ulush foizi, faol o'quvchilar va samaradorlik
          </p>
        </div>
        {canEdit && (
          <PrimaryButton onClick={() => openModal({ type: "teacherHRForm" })}>
            <Icon name="plus" size={16} /> O'qituvchi qo'shish
          </PrimaryButton>
        )}
      </div>

      {best && (
        <div className={`${GLASS} rounded-3xl p-5 flex items-center gap-3`}>
          <span className="text-2xl">
            <Icon name="trophy" size={18} />
          </span>
          <div>
            <p className="text-slate-500 text-xs">Eng yuqori baholangan</p>
            <p className="font-display text-slate-900 font-semibold">
              {best.name} — {best.rating}/5
            </p>
          </div>
        </div>
      )}

      {teachers.length === 0 ? (
        <EmptyState
          icon={<Icon name="graduation-cap" size={18} />}
          title="Hali o'qituvchi yo'q"
        />
      ) : (
        <div className="space-y-2">
          {teachers.map((t) => {
            const branch = directorData.branches.find(
              (b) => b.id === t.branchId,
            );
            const stats = getTeacherPayStats(
              directorData,
              opData,
              t,
              branch,
              thisMonthKey(),
            );
            const activeStudents = opActiveStudents(opData);
            return (
              <div key={t.id} className={`${GLASS} rounded-2xl p-4 space-y-3`}>
                <div className="flex items-center gap-3 flex-wrap">
                  <Avatar name={t.name} color={branch?.color} size={42} />
                  <div className="min-w-0 flex-1">
                    <p className="text-slate-900 text-sm font-medium truncate">
                      {t.name}
                    </p>
                    <p className="text-slate-400 text-xs truncate">
                      {branch?.name} · {displayPhone(t.phone)}
                    </p>
                  </div>
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Icon
                        name="star"
                        key={s}
                        size={11}
                        className={
                          s <= (t.rating || 0)
                            ? "fill-amber-400 text-amber-400"
                            : "text-slate-300"
                        }
                      />
                    ))}
                  </div>
                  <button
                    onClick={() =>
                      openModal({ type: "teacherPayroll", teacherId: t.id })
                    }
                    className={BTN_GHOST}
                  >
                    <span className="text-sm leading-none">
                      <Icon name="sack-dollar" size={18} />
                    </span>{" "}
                    Maosh
                  </button>
                  {canEdit && (
                    <button
                      onClick={() =>
                        openModal({ type: "teacherHRForm", editing: t })
                      }
                      className={BTN_ICON}
                    >
                      <Icon name="pen" size={14} />
                    </button>
                  )}
                  {canEdit && (
                    <button
                      onClick={() =>
                        openModal({
                          type: "confirm",
                          message: `${t.name}ni ro'yxatdan o'chirasizmi?`,
                          action: {
                            kind: "deleteTeacherHR",
                            teacherHRId: t.id,
                          },
                        })
                      }
                      className={BTN_ICON}
                    >
                      <Icon name="trash" size={14} />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-200">
                  <div>
                    <p className="text-slate-900 text-sm font-bold flex items-center gap-1">
                      {t.salaryType === "fixed" ? (
                        <Icon name="wallet" size={12} />
                      ) : (
                        <Icon name="percentage" size={12} />
                      )}
                      {t.salaryType === "fixed"
                        ? "Belgilangan"
                        : `${t.revenueSharePercent || 0}%`}
                    </p>
                    <p className="text-slate-400 text-[10px]">Kelishuv</p>
                  </div>
                  <div>
                    <p className="text-slate-900 text-sm font-bold">
                      {activeStudents}
                    </p>
                    <p className="text-slate-400 text-[10px]">Faol o'quvchi</p>
                  </div>
                  <div>
                    <p className="text-green-600 text-sm font-bold">
                      {money(stats.expectedPay)}
                    </p>
                    <p className="text-slate-400 text-[10px]">Oylik haqi</p>
                  </div>
                  <div>
                    <p className="text-amber-600 text-sm font-bold">
                      {money(stats.remaining)}
                    </p>
                    <p className="text-slate-400 text-[10px]">Qolgan haq</p>
                  </div>
                </div>
                <div className="flex gap-2 text-[10px] text-slate-400">
                  {t.canCreateGroups === false && (
                    <span className="bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-full">
                      Guruh ochish taqiqlangan
                    </span>
                  )}
                  {t.canReceivePayments === false && (
                    <span className="bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-full">
                      To'lov qabul qila olmaydi
                    </span>
                  )}
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

function HolidaysPage({
  directorId,
  directorData,
  addHoliday,
  removeHoliday,
  canEdit,
}) {
  const [name, setName] = useState("");
  const [date, setDate] = useState(todayISO());
  const [note, setNote] = useState("");
  const holidays = directorData.holidays
    .filter((h) => h.directorId === directorId)
    .sort((a, b) => new Date(a.date) - new Date(b.date));
  function submit() {
    if (!name.trim() || !date) return;
    addHoliday({ name: name.trim(), date, note: note.trim() });
    setName("");
    setNote("");
  }
  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-2xl font-bold text-slate-900">
          Bayram va ta'til kunlari
        </h2>
        <p className="text-slate-500 text-sm mt-0.5">
          Butun markaz uchun umumiy e'lon
        </p>
      </div>
      {canEdit && (
        <div className={`${GLASS} rounded-3xl p-5 space-y-3`}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={LABEL_CLS}>Nomi</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Masalan: Mustaqillik kuni"
                className={INPUT_CLS}
              />
            </div>
            <div>
              <label className={LABEL_CLS}>Sana</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={INPUT_CLS}
              />
            </div>
          </div>
          <div>
            <label className={LABEL_CLS}>Izoh (ixtiyoriy)</label>
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className={INPUT_CLS}
            />
          </div>
          <PrimaryButton onClick={submit}>
            <Icon name="plus" size={15} /> Qo'shish
          </PrimaryButton>
        </div>
      )}
      {holidays.length === 0 ? (
        <EmptyState
          icon={<Icon name="party-horn" size={18} />}
          title="Hali bayram kuni yo'q"
        />
      ) : (
        <div className="space-y-2">
          {holidays.map((h) => (
            <div
              key={h.id}
              className={`${GLASS_SOFT} rounded-2xl p-4 flex items-center justify-between gap-3`}
            >
              <div className="flex items-center gap-3">
                <span className="text-lg leading-none shrink-0">
                  <Icon name="party-horn" size={18} />
                </span>
                <div>
                  <p className="text-slate-900 text-sm font-medium">{h.name}</p>
                  <p className="text-slate-400 text-xs">
                    {formatDate(h.date)}
                    {h.note ? ` · ${h.note}` : ""}
                  </p>
                </div>
              </div>
              {canEdit && (
                <button
                  onClick={() => removeHoliday(h.id)}
                  className={BTN_ICON}
                >
                  <Icon name="cross-small" size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ============================== FINANCE ============================== */

function FinancePage({
  role,
  scopeBranchIds,
  directorData,
  allBranches,
  addFinance,
  approveFinance,
  rejectFinance,
}) {
  const scopedBranches = allBranches.filter((b) =>
    scopeBranchIds.includes(b.id),
  );
  const [showForm, setShowForm] = useState(false);
  const [type, setType] = useState("expense");
  const [branchId, setBranchId] = useState(scopedBranches[0]?.id || "");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0]);
  const [note, setNote] = useState("");
  const [date, setDate] = useState(todayISO());
  const [approvalMode, setApprovalMode] = useState("manager");
  const [error, setError] = useState("");

  const relevant = directorData.finance.filter((f) =>
    scopeBranchIds.includes(f.branchId),
  );
  const pending = relevant
    .filter((f) => f.status === "pending")
    .sort((a, b) => b.createdAt - a.createdAt);
  const history = relevant
    .filter((f) => f.status === "approved")
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 30);
  const totalIncome = relevant
    .filter((f) => f.type === "income" && f.status === "approved")
    .reduce((s, f) => s + f.amount, 0);
  const totalExpense = relevant
    .filter((f) => f.type === "expense" && f.status === "approved")
    .reduce((s, f) => s + f.amount, 0);

  // Per-category breakdown for icon-labelled group summary
  const categoryTotals = EXPENSE_CATEGORIES.map((cat) => ({
    category: cat,
    total: relevant
      .filter(
        (f) =>
          f.type === "expense" && f.status === "approved" && f.category === cat,
      )
      .reduce((s, f) => s + f.amount, 0),
  }))
    .filter((c) => c.total > 0)
    .sort((a, b) => b.total - a.total);

  function submit() {
    setError("");
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) {
      setError("To'g'ri summa kiriting.");
      return;
    }
    if (!branchId) {
      setError("Filialni tanlang.");
      return;
    }
    addFinance({
      branchId,
      type,
      amount: amt,
      category,
      note: note.trim(),
      date,
      status: approvalMode === "manager" ? "approved" : "pending",
      approvalMode,
    });
    setAmount("");
    setNote("");
    setShowForm(false);
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold text-slate-900">
            Moliya
          </h2>
          <p className="text-slate-500 text-sm mt-0.5">
            Xarajatlar va tasdiqlashlar (to'lovlar avtomatik kirim sifatida
            hisoblanadi)
          </p>
        </div>
        <PrimaryButton onClick={() => setShowForm((v) => !v)}>
          <Icon name="plus" size={16} /> Xarajat qo'shish
        </PrimaryButton>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <StatCard
          icon={<Icon name="chart-line-up" size={18} />}
          color={MONEY_COLORS.income}
          label="Jami kirim"
          value={money(totalIncome) + " so'm"}
        />
        <StatCard
          icon={<Icon name="chart-line-down" size={18} />}
          color={MONEY_COLORS.expense}
          label="Jami xarajat"
          value={money(totalExpense) + " so'm"}
        />
      </div>

      {categoryTotals.length > 0 && (
        <div className={`${GLASS} rounded-3xl p-5`}>
          <h3 className="font-display text-slate-900 font-semibold mb-3">
            Xarajat turlari bo'yicha (guruhlar)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {categoryTotals.map(({ category: cat, total }) => {
              const emoji = categoryIcon(cat);
              const color = categoryColor(cat);
              const pct =
                totalExpense > 0 ? Math.round((total / totalExpense) * 100) : 0;
              return (
                <div
                  key={cat}
                  className="flex items-center gap-3 border rounded-2xl p-3.5"
                  style={{
                    background: `${color}0f`,
                    borderColor: `${color}33`,
                  }}
                >
                  <span
                    className="w-10 h-10 rounded-xl bg-white border flex items-center justify-center shrink-0 text-lg leading-none"
                    style={{ borderColor: `${color}55` }}
                  >
                    {emoji}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-slate-900 text-sm font-medium truncate">
                      {cat}
                    </p>
                    <p className="text-slate-500 text-xs">
                      {pct}% jami xarajatdan
                    </p>
                  </div>
                  <p
                    className="text-sm font-semibold shrink-0"
                    style={{ color }}
                  >
                    {money(total)} so'm
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {showForm && (
        <div className={`${GLASS} rounded-3xl p-5 space-y-3`}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {scopedBranches.length > 1 && (
              <div>
                <label className={LABEL_CLS}>Filial</label>
                <select
                  value={branchId}
                  onChange={(e) => setBranchId(e.target.value)}
                  className={INPUT_CLS}
                >
                  {scopedBranches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div>
              <label className={LABEL_CLS}>Summa (so'm)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                className={INPUT_CLS}
              />
            </div>
            <div>
              <label className={LABEL_CLS}>Kategoriya</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={INPUT_CLS}
              >
                {EXPENSE_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={LABEL_CLS}>Sana</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={INPUT_CLS}
              />
            </div>
            <div className="sm:col-span-2">
              <label className={LABEL_CLS}>Izoh</label>
              <input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className={INPUT_CLS}
              />
            </div>
          </div>
          <div>
            <label className={LABEL_CLS}>Tasdiqlash turi</label>
            <div className="flex gap-2">
              <button
                onClick={() => setApprovalMode("manager")}
                className={`flex-1 text-xs py-2 rounded-xl border transition-all ${approvalMode === "manager" ? "bg-slate-100 border-slate-300 text-slate-700" : "bg-slate-50 border-slate-200 text-slate-500"}`}
              >
                Menejer ruhsati (darhol)
              </button>
              <button
                onClick={() => setApprovalMode("director")}
                className={`flex-1 text-xs py-2 rounded-xl border transition-all ${approvalMode === "director" ? "bg-slate-100 border-slate-300 text-slate-700" : "bg-slate-50 border-slate-200 text-slate-500"}`}
              >
                Direktor tasdiqlashi kerak
              </button>
            </div>
          </div>
          {error && <p className="text-red-500 text-xs">{error}</p>}
          <PrimaryButton onClick={submit} className="w-full">
            <Icon name="check" size={15} /> Saqlash
          </PrimaryButton>
        </div>
      )}

      {role === "director" && pending.length > 0 && (
        <div className={`${GLASS} rounded-3xl p-5`}>
          <h3 className="font-display text-slate-900 font-semibold mb-3 flex items-center gap-2">
            <span className="text-base leading-none">
              <Icon name="bell" size={18} />
            </span>{" "}
            Tasdiqlash kutilmoqda ({pending.length})
          </h3>
          <div className="space-y-2">
            {pending.map((f) => {
              const b = directorData.branches.find((x) => x.id === f.branchId);
              const emoji = categoryIcon(f.category);
              const color = categoryColor(f.category);
              return (
                <div
                  key={f.id}
                  className="flex items-center justify-between gap-3 bg-slate-50 border border-slate-200 rounded-2xl p-3.5"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className="w-9 h-9 rounded-xl bg-white border flex items-center justify-center shrink-0 text-base leading-none"
                      style={{ borderColor: `${color}55` }}
                    >
                      {emoji}
                    </span>
                    <div className="min-w-0">
                      <p className="text-slate-900 text-sm font-medium">
                        {f.category} — {money(f.amount)} so'm
                      </p>
                      <p className="text-slate-400 text-xs truncate">
                        {b?.name} · {formatDate(f.date)}
                        {f.note ? ` · ${f.note}` : ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    <button
                      onClick={() => approveFinance(f.id)}
                      className="w-9 h-9 rounded-xl bg-green-50 hover:bg-green-100 border border-green-200 flex items-center justify-center text-green-700"
                    >
                      <Icon name="check-circle" size={16} />
                    </button>
                    <button
                      onClick={() => rejectFinance(f.id)}
                      className="w-9 h-9 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 flex items-center justify-center text-red-700"
                    >
                      <Icon name="cross-circle" size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className={`${GLASS} rounded-3xl p-5`}>
        <h3 className="font-display text-slate-900 font-semibold mb-3">
          So'nggi yozuvlar
        </h3>
        {history.length === 0 ? (
          <p className="text-slate-400 text-sm">Hali yozuv yo'q.</p>
        ) : (
          <div className="space-y-2">
            {history.map((f) => {
              const emoji =
                f.type === "expense" ? (
                  categoryIcon(f.category)
                ) : (
                  <Icon
                    name="chart-line-up"
                    size={14}
                    style={{ color: MONEY_COLORS.income }}
                  />
                );
              const chipStyle =
                f.type === "income"
                  ? {
                      background: MONEY_COLORS.incomeSoft,
                      borderColor: MONEY_COLORS.incomeBorder,
                    }
                  : {
                      background: "#ffffff",
                      borderColor: `${categoryColor(f.category)}55`,
                    };
              return (
                <div
                  key={f.id}
                  className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl p-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border text-sm leading-none"
                      style={chipStyle}
                    >
                      {emoji}
                    </span>
                    <div className="min-w-0">
                      <p className="text-slate-900 text-sm truncate">
                        {f.category}
                        {f.note ? ` · ${f.note}` : ""}
                      </p>
                      <p className="text-slate-400 text-xs">
                        {formatDate(f.date)}
                      </p>
                    </div>
                  </div>
                  <p
                    className="text-sm font-semibold shrink-0"
                    style={{
                      color:
                        f.type === "income"
                          ? MONEY_COLORS.income
                          : MONEY_COLORS.expense,
                    }}
                  >
                    {f.type === "income" ? "+" : "-"}
                    {money(f.amount)}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================== PAYMENTS PAGE ============================== */

function PaymentsPage({ scopeBranches, directorData, opData, openModal }) {
  const [groupFilter, setGroupFilter] = useState("all");
  const [search, setSearch] = useState("");
  const month = thisMonthKey();
  const prevMonth = prevMonthKey(month);
  const scopeIds = scopeBranches.map((b) => b.id);
  const courses = directorData.courses.filter((c) =>
    scopeIds.includes(c.branchId),
  );
  const courseIds = courses.map((c) => c.id);
  const groups = opGroups(opData).filter((g) => courseIds.includes(g.courseId));

  const rows = [];
  groups.forEach((g) => {
    const course = courses.find((c) => c.id === g.courseId);
    opStudentsInGroups(opData, [g.id]).forEach((s) =>
      rows.push({ student: s, group: g, course }),
    );
  });

  const filtered = rows.filter((r) => {
    if (groupFilter !== "all" && r.group.id !== groupFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      const matchesName = r.student.name.toLowerCase().includes(q);
      const matchesPhone = normalizePhone(r.student.phone).includes(
        normalizePhone(search),
      );
      if (!matchesName && !matchesPhone) return false;
    }
    return true;
  });

  const totalPending = filtered
    .filter(
      (r) =>
        getPaymentStatus(
          directorData.payments,
          r.student.id,
          r.group.id,
          month,
          r.group.price,
        ) !== "paid",
    )
    .reduce(
      (sum, r) =>
        sum +
        ((r.group.price || 0) -
          getPaymentTotal(
            directorData.payments,
            r.student.id,
            r.group.id,
            month,
          )),
      0,
    );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold text-slate-900">
            To'lovlar
          </h2>
          <p className="text-slate-500 text-sm mt-0.5">
            O'quvchilar to'lov holati va qarzdorlik
          </p>
        </div>
        <PrimaryButton onClick={() => openModal({ type: "recordPayment" })}>
          <Icon name="plus" size={16} /> To'lov qabul qilish
        </PrimaryButton>
      </div>

      <StatCard
        icon={<Icon name="triangle-warning" size={18} />}
        color={MONEY_COLORS.warning}
        label="Bu oy kutilayotgan to'lovlar"
        value={money(totalPending) + " so'm"}
      />

      <div className="flex gap-2 flex-wrap">
        <select
          value={groupFilter}
          onChange={(e) => setGroupFilter(e.target.value)}
          className={`${INPUT_CLS} w-auto`}
        >
          <option value="all">Barcha guruhlar</option>
          {groups.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </select>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Ism yoki telefon bo'yicha qidirish..."
          className={`${INPUT_CLS} flex-1 min-w-[200px]`}
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Icon name="credit-card" size={18} />}
          title="O'quvchi topilmadi"
          subtitle="Kurslarga bog'langan guruh va o'quvchi bo'lishi kerak."
        />
      ) : (
        <div className="space-y-2">
          {filtered.map(({ student, group, course }) => {
            const price = group.price || 0;
            const paidThis = getPaymentTotal(
              directorData.payments,
              student.id,
              group.id,
              month,
            );
            const status = getPaymentStatus(
              directorData.payments,
              student.id,
              group.id,
              month,
              price,
            );
            const paidPrev = getPaymentTotal(
              directorData.payments,
              student.id,
              group.id,
              prevMonth,
            );
            const hasDebt = paidPrev < price;
            const overdue = new Date().getDate() > 20 && status !== "paid";
            return (
              <div
                key={student.id + group.id}
                className={`${GLASS} rounded-2xl p-4 flex items-center gap-3 flex-wrap`}
              >
                <Avatar name={student.name} color={group.color} size={40} />
                <div className="min-w-0 flex-1">
                  <p className="text-slate-900 text-sm font-medium truncate">
                    {student.name}
                  </p>
                  <p className="text-slate-400 text-xs truncate">
                    {group.name}
                    {course ? ` · ${course.name}` : ""}
                  </p>
                  <div className="flex gap-1.5 mt-1 flex-wrap">
                    {status === "paid" && (
                      <span className="text-[10px] bg-green-50 border border-green-200 text-green-700 px-2 py-0.5 rounded-full">
                        To'landi
                      </span>
                    )}
                    {status === "partial" && (
                      <span className="text-[10px] bg-amber-50 border border-amber-200 text-amber-700 px-2 py-0.5 rounded-full">
                        Qisman: {money(paidThis)}/{money(price)}
                      </span>
                    )}
                    {status === "unpaid" && (
                      <span className="text-[10px] bg-red-50 border border-red-200 text-red-700 px-2 py-0.5 rounded-full">
                        To'lanmagan
                      </span>
                    )}
                    {hasDebt && (
                      <span className="text-[10px] bg-red-100 border border-red-300 text-red-700 px-2 py-0.5 rounded-full">
                        O'tgan oydan qarz
                      </span>
                    )}
                    {overdue && (
                      <span className="text-[10px] bg-red-500 border border-red-500 text-white px-2 py-0.5 rounded-full flex items-center gap-1">
                        <span className="leading-none">
                          <Icon name="triangle-warning" size={18} />
                        </span>{" "}
                        Muddati o'tgan
                      </span>
                    )}
                  </div>
                </div>
                {status !== "paid" && (
                  <p className="text-slate-500 text-xs shrink-0">
                    Kutilmoqda: {money(price - paidThis)} so'm
                  </p>
                )}
                <button
                  onClick={() =>
                    openModal({
                      type: "recordPayment",
                      studentId: student.id,
                      groupId: group.id,
                    })
                  }
                  className={BTN_GHOST}
                >
                  <Icon name="plus" size={14} /> To'lov
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function RecordPaymentModal({
  initialStudentId,
  initialGroupId,
  scopeBranches,
  directorData,
  opData,
  onSubmit,
  onClose,
}) {
  const [search, setSearch] = useState("");
  const [studentId, setStudentId] = useState(initialStudentId || "");
  const [groupId, setGroupId] = useState(initialGroupId || "");
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("cash");
  const [error, setError] = useState("");

  const scopeIds = scopeBranches.map((b) => b.id);
  const courses = directorData.courses.filter((c) =>
    scopeIds.includes(c.branchId),
  );
  const courseIds = courses.map((c) => c.id);
  const groups = opGroups(opData).filter((g) => courseIds.includes(g.courseId));
  const allStudents = opStudentsInGroups(
    opData,
    groups.map((g) => g.id),
  );

  const matches =
    search.length > 0 && !studentId
      ? allStudents
          .filter(
            (s) =>
              s.name.toLowerCase().includes(search.toLowerCase()) ||
              normalizePhone(s.phone).includes(normalizePhone(search)),
          )
          .slice(0, 6)
      : [];
  const selectedStudent = allStudents.find((s) => s.id === studentId);
  const studentGroupOptions = selectedStudent
    ? groups
        .filter((g) => (selectedStudent.groupIds || []).includes(g.id))
        .map((g) => ({
          group: g,
          course: courses.find((c) => c.id === g.courseId),
        }))
    : [];

  function selectStudent(s) {
    setStudentId(s.id);
    setSearch(s.name);
    const opts = groups.filter((g) => (s.groupIds || []).includes(g.id));
    if (opts.length === 1) setGroupId(opts[0].id);
  }

  function submit() {
    setError("");
    if (!studentId || !groupId) {
      setError("O'quvchi va guruhni tanlang.");
      return;
    }
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) {
      setError("To'g'ri summa kiriting.");
      return;
    }
    onSubmit({
      studentId,
      groupId,
      amount: amt,
      method,
      date: todayISO(),
      month: thisMonthKey(),
    });
    onClose();
  }

  return (
    <Modal title="To'lov qabul qilish" onClose={onClose}>
      <div className="space-y-4">
        <div>
          <label className={LABEL_CLS}>O'quvchi (ism yoki telefon)</label>
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setStudentId("");
              setGroupId("");
            }}
            placeholder="Ism familiya yozing..."
            className={INPUT_CLS}
            autoFocus
          />
          {matches.length > 0 && (
            <div className="mt-1.5 space-y-1 max-h-40 overflow-y-auto">
              {matches.map((s) => (
                <button
                  key={s.id}
                  onClick={() => selectStudent(s)}
                  className="w-full flex items-center gap-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl p-2 text-left transition-colors"
                >
                  <Avatar name={s.name} size={28} />
                  <p className="text-slate-900 text-sm truncate">{s.name}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        {selectedStudent && studentGroupOptions.length > 0 && (
          <div>
            <label className={LABEL_CLS}>Guruh / kurs</label>
            <select
              value={groupId}
              onChange={(e) => setGroupId(e.target.value)}
              className={INPUT_CLS}
            >
              <option value="">— Tanlang —</option>
              {studentGroupOptions.map(({ group, course }) => (
                <option key={group.id} value={group.id}>
                  {group.name}
                  {course ? ` — ${course.name}` : ""} ({money(group.price || 0)}{" "}
                  so'm)
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className={LABEL_CLS}>To'lov miqdori (so'm)</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0"
            className={INPUT_CLS}
          />
        </div>

        <div>
          <label className={LABEL_CLS}>To'lov turi</label>
          <div className="flex gap-2">
            {PAYMENT_METHODS.map((m) => (
              <button
                key={m.id}
                onClick={() => setMethod(m.id)}
                className={`flex-1 flex items-center justify-center gap-2 text-sm py-2.5 rounded-xl border transition-all ${method === m.id ? "bg-slate-100 border-slate-300 text-slate-700" : "bg-slate-50 border-slate-200 text-slate-500"}`}
              >
                <Icon name={m.icon} size={15} /> {m.label}
              </button>
            ))}
          </div>
        </div>

        {error && <p className="text-red-500 text-xs">{error}</p>}
        <PrimaryButton onClick={submit} className="w-full">
          <Icon name="check" size={16} /> To'lovni saqlash
        </PrimaryButton>
      </div>
    </Modal>
  );
}

/* ============================== COURSES ============================== */

function CoursesPage({
  scopeBranches,
  directorData,
  opData,
  openModal,
  canEdit,
}) {
  const [expandedId, setExpandedId] = useState(null);
  const scopeIds = scopeBranches.map((b) => b.id);
  const courses = directorData.courses.filter((c) =>
    scopeIds.includes(c.branchId),
  );
  const month = thisMonthKey();

  function courseGroups(courseId) {
    return opGroups(opData).filter((g) => g.courseId === courseId);
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold text-slate-900">
            Kurslar
          </h2>
          <p className="text-slate-500 text-sm mt-0.5">
            Kurs katalogi — har bir kurs ichida bir nechta guruh bo'lishi mumkin
          </p>
        </div>
        {canEdit && (
          <PrimaryButton onClick={() => openModal({ type: "courseForm" })}>
            <Icon name="plus" size={16} /> Yangi kurs
          </PrimaryButton>
        )}
      </div>

      {courses.length === 0 ? (
        <EmptyState
          icon={<Icon name="book" size={18} />}
          title="Hali kurs yo'q"
          subtitle="Avval kurs nomini yarating, keyin unga guruh(lar) ochasiz."
        />
      ) : (
        <div className="space-y-3">
          {courses.map((c) => {
            const groups = courseGroups(c.id);
            const studs = opStudentsInGroups(
              opData,
              groups.map((g) => g.id),
            );
            const revenue = groups.reduce(
              (sum, g) =>
                sum + (g.price || 0) * opGroupStudentCount(opData, g.id),
              0,
            );
            const open = expandedId === c.id;
            return (
              <div
                key={c.id}
                className={`${GLASS} rounded-3xl overflow-hidden`}
              >
                <div className="w-full flex items-center justify-between p-5 flex-wrap gap-2">
                  <button
                    onClick={() => setExpandedId(open ? null : c.id)}
                    className="flex-1 text-left min-w-[200px]"
                  >
                    <p className="font-display text-slate-900 font-semibold">
                      {c.name}
                    </p>
                    <p className="text-slate-400 text-xs mt-0.5">
                      {groups.length} guruh · {studs.length} o'quvchi
                    </p>
                  </button>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <p className="text-slate-900 font-semibold text-sm">
                        {money(revenue)} so'm/oy
                      </p>
                    </div>
                    {canEdit && (
                      <button
                        onClick={() =>
                          openModal({ type: "groupForm", courseId: c.id })
                        }
                        className={BTN_GHOST}
                      >
                        <Icon name="plus" size={14} /> Guruh
                      </button>
                    )}
                    {canEdit && (
                      <button
                        onClick={() =>
                          openModal({ type: "courseForm", editing: c })
                        }
                        className={BTN_ICON}
                      >
                        <Icon name="pen" size={14} />
                      </button>
                    )}
                  </div>
                </div>
                {open && (
                  <div className="px-5 pb-5 border-t border-slate-200 pt-4 space-y-2">
                    {groups.length === 0 ? (
                      <p className="text-slate-400 text-sm">
                        Bu kursda hali guruh yo'q.
                      </p>
                    ) : (
                      groups.map((g) => {
                        const gStuds = opStudentsInGroups(opData, [g.id]);
                        const paidCount = gStuds.filter(
                          (s) =>
                            getPaymentStatus(
                              directorData.payments,
                              s.id,
                              g.id,
                              month,
                              g.price,
                            ) === "paid",
                        ).length;
                        return (
                          <div
                            key={g.id}
                            className="bg-slate-50 border border-slate-200 rounded-xl p-3"
                          >
                            <div className="flex items-center gap-3 flex-wrap">
                              <div
                                className="w-2.5 h-2.5 rounded-full shrink-0"
                                style={{ background: g.color }}
                              />
                              <div className="min-w-0 flex-1">
                                <p className="text-slate-900 text-sm font-medium truncate">
                                  {g.name}
                                </p>
                                <p className="text-slate-400 text-xs">
                                  {(g.days || []).join(", ") || "Kunsiz"} ·{" "}
                                  {g.time} ·{" "}
                                  {g.durationMonths
                                    ? `${g.durationMonths} oy`
                                    : ""}{" "}
                                  · {gStuds.length} o'quvchi
                                </p>
                              </div>
                              <div className="text-right shrink-0">
                                <p className="text-slate-900 text-sm font-semibold">
                                  {money(g.price || 0)} so'm/oy
                                </p>
                                <p className="text-slate-400 text-[11px]">
                                  {paidCount}/{gStuds.length} to'liq to'lagan
                                </p>
                              </div>
                              {canEdit && (
                                <button
                                  onClick={() =>
                                    openModal({
                                      type: "groupForm",
                                      courseId: c.id,
                                      editing: g,
                                    })
                                  }
                                  className={BTN_ICON}
                                >
                                  <Icon name="pen" size={14} />
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                    {canEdit && (
                      <button
                        onClick={() =>
                          openModal({
                            type: "confirm",
                            message: `"${c.name}" kursini o'chirasizmi?`,
                            action: { kind: "deleteCourse", courseId: c.id },
                          })
                        }
                        className={`${BTN_GHOST} w-full mt-2 text-red-600 hover:text-red-700`}
                      >
                        <Icon name="trash" size={14} /> Kursni o'chirish
                      </button>
                    )}
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

/* ============================== GROUPS PAGE ============================== */

function GroupsPage({
  directorData,
  opData,
  openModal,
  scopeBranchIds,
  canEdit,
}) {
  const allGroups = opGroups(opData);
  const courses = scopeBranchIds
    ? directorData.courses.filter((c) => scopeBranchIds.includes(c.branchId))
    : directorData.courses;
  const courseIds = courses.map((c) => c.id);
  const groups = allGroups.filter(
    (g) => g.courseId && courseIds.includes(g.courseId),
  );
  const rows = groups
    .map((g) => {
      const count = opGroupStudentCount(opData, g.id);
      const course = courses.find((c) => c.id === g.courseId);
      return { ...g, course, count, revenue: (g.price || 0) * count };
    })
    .sort((a, b) => b.revenue - a.revenue);
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold text-slate-900">
            Guruhlar
          </h2>
          <p className="text-slate-500 text-sm mt-0.5">
            Barcha guruhlar va ularning oylik daromadi
          </p>
        </div>
        {canEdit && courses.length > 0 && (
          <PrimaryButton onClick={() => openModal({ type: "groupForm" })}>
            <Icon name="plus" size={16} /> Yangi guruh
          </PrimaryButton>
        )}
      </div>
      {courses.length === 0 ? (
        <EmptyState
          icon={<Icon name="book" size={18} />}
          title="Avval kurs yarating"
          subtitle={
            'Guruh ochish uchun avval "Kurslar" bo\'limida kurs nomini kiriting.'
          }
        />
      ) : rows.length === 0 ? (
        <EmptyState
          icon={<Icon name="clipboard-list" size={18} />}
          title="Hali guruh yo'q"
          subtitle="Yuqoridagi tugma orqali birinchi guruhingizni oching."
          action={
            canEdit ? (
              <PrimaryButton onClick={() => openModal({ type: "groupForm" })}>
                <Icon name="plus" size={16} /> Guruh ochish
              </PrimaryButton>
            ) : null
          }
        />
      ) : (
        <div className="space-y-2">
          {rows.map((g, i) => (
            <div
              key={g.id}
              className={`${GLASS} rounded-2xl p-4 flex items-center gap-3 flex-wrap`}
            >
              <div
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ background: g.color }}
              />
              <div className="min-w-0 flex-1">
                <p className="text-slate-900 text-sm font-medium truncate">
                  {g.name}
                </p>
                <p className="text-slate-400 text-xs truncate">
                  {g.course?.name || "Kurssiz"} ·{" "}
                  {(g.days || []).join(", ") || "Kunsiz"} · {g.time} · {g.count}{" "}
                  o'quvchi
                </p>
              </div>
              <div className="text-right shrink-0 min-w-[110px]">
                <p className="text-slate-900 text-sm font-semibold">
                  {money(g.revenue)} so'm
                </p>
                {g.count < 3 && (
                  <p className="text-amber-600 text-[11px]">
                    Kam sonli — yopish mumkin
                  </p>
                )}
                {i === 0 && g.revenue > 0 && (
                  <p className="text-green-600 text-[11px]">
                    Asosiy foyda manbai
                  </p>
                )}
              </div>
              {canEdit && (
                <button
                  onClick={() =>
                    openModal({
                      type: "groupForm",
                      courseId: g.courseId,
                      editing: g,
                    })
                  }
                  className={BTN_ICON}
                >
                  <Icon name="pen" size={14} />
                </button>
              )}
              {canEdit && (
                <button
                  onClick={() =>
                    openModal({
                      type: "confirm",
                      message: `"${g.name}" guruhini o'chirasizmi?`,
                      action: { kind: "deleteGroup", groupId: g.id },
                    })
                  }
                  className={BTN_ICON}
                >
                  <Icon name="trash" size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ============================== LAYOUT ============================== */

function AppSidebar({ view, goTo, items, title }) {
  const theme = useTheme();
  return (
    <aside className="hidden md:flex flex-col w-60 shrink-0 p-5 gap-1">
      <div className={`${GLASS} rounded-3xl p-4 mb-4`}>
        <p className="font-display text-slate-900 font-bold text-lg tracking-tight truncate">
          {title}
        </p>
      </div>
      <div
        className={`${GLASS} rounded-3xl p-2 flex flex-col gap-1 flex-1 overflow-y-auto`}
      >
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => goTo(item.id)}
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all ${view === item.id ? "shadow-sm" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"}`}
            style={
              view === item.id
                ? { background: `${theme.accent1}17`, color: theme.accent1 }
                : {}
            }
          >
            <span className="text-lg leading-none">{item.icon}</span>{" "}
            {item.label}
          </button>
        ))}
      </div>
    </aside>
  );
}

function AppBottomNav({ view, goTo, items }) {
  const theme = useTheme();
  return (
    <nav
      className={`md:hidden fixed bottom-3 left-3 right-3 ${GLASS} rounded-3xl p-1.5 flex gap-1 overflow-x-auto z-40`}
      style={{ background: "#ffffff" }}
    >
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => goTo(item.id)}
          className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-2xl transition-all shrink-0 ${view === item.id ? "" : "text-slate-500"}`}
          style={
            view === item.id
              ? { background: `${theme.accent1}17`, color: theme.accent1 }
              : {}
          }
        >
          <span className="text-base leading-none">{item.icon}</span>
          <span className="text-[8px] font-medium whitespace-nowrap">
            {item.label}
          </span>
        </button>
      ))}
    </nav>
  );
}

function TopBar({
  name,
  photo,
  color,
  now,
  onLogout,
  director,
  updateDirector,
  notifLog,
  onClearNotifs,
}) {
  const dayName = JS_DAY_NAMES[now.getDay()];
  return (
    <div className="space-y-3 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {director && (
            <ThemeSwitcher
              director={director}
              updateDirector={updateDirector}
            />
          )}
          <div>
            <p className="text-slate-500 text-xs">
              {dayName}, {now.getDate()}-{MONTHS_UZ[now.getMonth()]},{" "}
              {now.getFullYear()}
            </p>
            <p className="text-slate-900 font-medium mt-0.5">
              Xush kelibsiz, {name}! 👋
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <NotificationBell log={notifLog} onClear={onClearNotifs} />
          <button onClick={onLogout} className={BTN_ICON}>
            <Icon name="sign-out-alt" size={16} />
          </button>
          <Avatar name={name} photo={photo} color={color} size={42} />
        </div>
      </div>
    </div>
  );
}

/* ============================== ROOMS ============================== */

function RoomsPage({ opData, openModal, canEdit }) {
  const rooms = opRooms(opData);
  const bigRooms = rooms.filter((r) => (r.capacity || 0) >= 25).length;
  const totalCapacity = rooms.reduce((sum, r) => sum + (r.capacity || 0), 0);
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold text-slate-900">
            Xonalar
          </h2>
          <p className="text-slate-500 text-sm mt-0.5">
            O'quv xonalarini boshqarish
          </p>
        </div>
        {canEdit && (
          <PrimaryButton onClick={() => openModal({ type: "roomForm" })}>
            <Icon name="plus" size={16} /> Yangi xona qo'shish
          </PrimaryButton>
        )}
      </div>
      <div className="grid grid-cols-3 gap-3">
        <StatCard
          icon={<Icon name="building" size={18} />}
          color="#F97316"
          label="Jami xonalar"
          value={rooms.length}
        />
        <StatCard
          icon={<Icon name="users" size={18} />}
          color="#8B5CF6"
          label="Katta xonalar (25+)"
          value={bigRooms}
        />
        <StatCard
          icon={<Icon name="chair" size={18} />}
          color="#14B8A6"
          label="Umumiy sig'im"
          value={totalCapacity}
        />
      </div>
      {rooms.length === 0 ? (
        <EmptyState
          icon={<Icon name="building" size={18} />}
          title="Xonalar yo'q"
          subtitle="Birinchi xonani qo'shing"
          action={
            canEdit ? (
              <PrimaryButton onClick={() => openModal({ type: "roomForm" })}>
                <Icon name="plus" size={16} /> Xona qo'shish
              </PrimaryButton>
            ) : null
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {rooms.map((r) => {
            const usedByGroups = opGroups(opData).filter(
              (g) => g.roomId === r.id,
            );
            return (
              <div key={r.id} className={`${GLASS} rounded-2xl p-4 space-y-3`}>
                <div className="flex items-start gap-3">
                  <span className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 grid place-items-center shrink-0 text-lg leading-none">
                    <Icon name="door-open" size={18} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-slate-900 font-medium truncate">
                      {r.name}
                    </p>
                    <p className="text-slate-400 text-xs">O'quv xonasi</p>
                  </div>
                </div>
                <span className="inline-block text-xs bg-green-50 border border-green-200 text-green-700 px-2.5 py-1 rounded-full">
                  <Icon
                    name="users"
                    size={11}
                    className="inline -mt-0.5 mr-1"
                  />
                  {r.capacity || 0} ta sig'im
                </span>
                {usedByGroups.length > 0 && (
                  <p className="text-slate-400 text-[11px]">
                    {usedByGroups.length} ta guruhda band
                  </p>
                )}
                {canEdit && (
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() =>
                        openModal({ type: "roomForm", editing: r })
                      }
                      className={`${BTN_GHOST} flex-1 justify-center`}
                    >
                      <Icon name="pen" size={13} /> Tahrirlash
                    </button>
                    <button
                      onClick={() =>
                        openModal({
                          type: "confirm",
                          message: `"${r.name}" xonasini o'chirasizmi?`,
                          action: { kind: "deleteRoom", roomId: r.id },
                        })
                      }
                      className={BTN_ICON}
                    >
                      <Icon name="trash" size={14} />
                    </button>
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

function RoomFormModal({ editing, onSubmit, onClose }) {
  const [name, setName] = useState(editing?.name || "");
  const [capacity, setCapacity] = useState(editing?.capacity ?? "");
  const [error, setError] = useState("");
  function submit() {
    if (!name.trim()) {
      setError("Xona nomini kiriting.");
      return;
    }
    onSubmit({ name: name.trim(), capacity: parseInt(capacity) || 0 });
    onClose();
  }
  return (
    <Modal
      title={editing ? "Xonani tahrirlash" : "Yangi xona qo'shish"}
      onClose={onClose}
    >
      <div className="space-y-4">
        <div>
          <label className={LABEL_CLS}>Xona nomi</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={INPUT_CLS}
            placeholder="Masalan: 7-xona"
            autoFocus
          />
        </div>
        <div>
          <label className={LABEL_CLS}>Sig'imi (o'rin soni)</label>
          <input
            type="number"
            min="0"
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
            className={INPUT_CLS}
            placeholder="25"
          />
        </div>
        {error && <p className="text-red-500 text-xs">{error}</p>}
        <PrimaryButton onClick={submit} className="w-full">
          {editing ? (
            <Icon name="check" size={16} />
          ) : (
            <Icon name="plus" size={16} />
          )}{" "}
          {editing ? "Saqlash" : "Qo'shish"}
        </PrimaryButton>
      </div>
    </Modal>
  );
}

/* ============================== ATTENDANCE (DAVOMAT) ============================== */

const ATTENDANCE_STATUSES = [
  { id: "present", label: "Bor", dot: "bg-green-500" },
  { id: "late", label: "Kech", dot: "bg-amber-500" },
  { id: "excused", label: "Sababli", dot: "bg-sky-500" },
  { id: "absent", label: "Yo'q", dot: "bg-red-500" },
];

function AttendancePage({ directorData, opData, scopeBranchIds, openModal }) {
  const [groupFilter, setGroupFilter] = useState("all");
  const courseIds = directorData.courses
    .filter((c) => scopeBranchIds.includes(c.branchId))
    .map((c) => c.id);
  const groups = opGroups(opData).filter((g) => courseIds.includes(g.courseId));
  const records = opAttendance(opData)
    .filter((a) => groups.some((g) => g.id === a.groupId))
    .filter((a) => groupFilter === "all" || a.groupId === groupFilter)
    .sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-2xl font-bold text-slate-900">
          Davomat
        </h2>
        <p className="text-slate-500 text-sm mt-0.5">
          Barcha guruhlar bo'yicha davomat yozuvlari
        </p>
      </div>

      <select
        value={groupFilter}
        onChange={(e) => setGroupFilter(e.target.value)}
        className={`${INPUT_CLS} w-auto`}
      >
        <option value="all">Barcha guruhlar</option>
        {groups.map((g) => (
          <option key={g.id} value={g.id}>
            {g.name}
          </option>
        ))}
      </select>

      {records.length === 0 ? (
        <EmptyState
          icon={<Icon name="clipboard-list" size={18} />}
          title="Davomat yozuvlari yo'q"
          subtitle="O'qituvchi davomat olganda shu yerda ko'rinadi."
        />
      ) : (
        <div className="space-y-3">
          {records.map((rec) => {
            const group = groups.find((g) => g.id === rec.groupId);
            if (!group) return null;
            const students = opStudentsInGroups(opData, [group.id]);
            const counts = { present: 0, late: 0, excused: 0, absent: 0 };
            students.forEach((s) => {
              const st = attendanceStatus(rec, s.id);
              if (st && counts[st] !== undefined) counts[st]++;
            });
            const marked =
              counts.present + counts.late + counts.excused + counts.absent;
            const pct = students.length
              ? Math.round(
                  ((counts.present + counts.late) / students.length) * 100,
                )
              : 0;
            return (
              <div
                key={rec.id}
                className={`${GLASS} rounded-2xl p-4 space-y-3`}
              >
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <p className="text-slate-900 font-medium text-sm">
                      {group.name}
                    </p>
                    <p className="text-slate-400 text-xs">
                      {formatDate(rec.date)}{" "}
                      {rec.locked && (
                        <span className="ml-1.5 text-green-600">
                          · qulflangan
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-full text-slate-700">
                      {pct}% davomat
                    </span>
                    <button
                      onClick={() =>
                        openModal({
                          type: "editAttendance",
                          recordId: rec.id,
                          groupId: group.id,
                        })
                      }
                      className={BTN_ICON}
                    >
                      <Icon name="pen" size={14} />
                    </button>
                    <button
                      onClick={() =>
                        openModal({
                          type: "confirm",
                          message: `${formatDate(rec.date)} sanasidagi "${group.name}" davomatini o'chirasizmi?`,
                          action: {
                            kind: "deleteAttendance",
                            recordId: rec.id,
                          },
                        })
                      }
                      className={BTN_ICON}
                    >
                      <Icon name="trash" size={14} />
                    </button>
                  </div>
                </div>
                <div className="flex gap-3 flex-wrap text-xs text-slate-500">
                  {ATTENDANCE_STATUSES.map((st) => (
                    <span key={st.id} className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${st.dot}`} />
                      {st.label}: {counts[st.id]}
                    </span>
                  ))}
                  {students.length - marked > 0 && (
                    <span className="text-slate-400">
                      Belgilanmagan: {students.length - marked}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function EditAttendanceModal({ record, group, opData, onSave, onClose }) {
  const students = opStudentsInGroups(opData, [group.id]);
  const [entries, setEntries] = useState(() => {
    const init = {};
    students.forEach((s) => {
      const e = record?.records?.[s.id];
      init[s.id] =
        typeof e === "object" ? e : { status: e || null, reason: "" };
    });
    return init;
  });

  function setStatus(studentId, status) {
    setEntries((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], status },
    }));
  }
  function setReason(studentId, reason) {
    setEntries((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], reason },
    }));
  }

  return (
    <Modal
      title={`Davomatni tahrirlash — ${formatDate(record.date)}`}
      onClose={onClose}
    >
      <div className="space-y-3 max-h-[60vh] overflow-y-auto">
        {students.map((s) => (
          <div key={s.id} className="space-y-2">
            <div className="flex items-center gap-3">
              <Avatar name={s.name} size={32} />
              <p className="text-slate-900 text-sm flex-1 truncate">{s.name}</p>
              <div className="flex gap-1.5 flex-wrap">
                {ATTENDANCE_STATUSES.map((st) => (
                  <button
                    key={st.id}
                    onClick={() => setStatus(s.id, st.id)}
                    className={`text-xs px-2.5 py-1.5 rounded-lg border transition-all ${entries[s.id]?.status === st.id ? "bg-slate-100 border-slate-300 text-slate-700" : "bg-slate-50 border-slate-200 text-slate-400"}`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>
            {(entries[s.id]?.status === "excused" ||
              entries[s.id]?.status === "late") && (
              <input
                value={entries[s.id]?.reason || ""}
                onChange={(e) => setReason(s.id, e.target.value)}
                placeholder="Sababi (ixtiyoriy)..."
                className={`${INPUT_CLS} text-xs py-2`}
              />
            )}
          </div>
        ))}
      </div>
      <PrimaryButton
        onClick={() => {
          onSave(entries);
          onClose();
        }}
        className="w-full mt-4"
      >
        <Icon name="check" size={16} /> Saqlash
      </PrimaryButton>
    </Modal>
  );
}

/* ============================== NOTIFICATIONS ============================== */

function NotificationsPage({ notifLog, onMarkRead, onMarkAllRead, onClear }) {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const unreadCount = notifLog.filter((n) => !n.read).length;
  const readCount = notifLog.length - unreadCount;

  const filtered = notifLog.filter((n) => {
    if (filter === "unread" && n.read) return false;
    if (filter === "read" && !n.read) return false;
    if (search && !n.message.toLowerCase().includes(search.toLowerCase()))
      return false;
    return true;
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold text-slate-900">
            Bildirishnomalar
          </h2>
          <p className="text-slate-500 text-sm mt-0.5">
            Tizim xabarlari va e'lonlarni kuzating
          </p>
        </div>
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <button onClick={onMarkAllRead} className={BTN_GHOST}>
              <Icon name="check" size={14} /> Barchasini o'qish
            </button>
          )}
          {notifLog.length > 0 && (
            <button onClick={onClear} className={BTN_GHOST}>
              <Icon name="trash" size={14} /> Tozalash
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <StatCard
          icon={<Icon name="bell" size={18} />}
          color="#8B5CF6"
          label="Jami bildirishnomalar"
          value={notifLog.length}
        />
        <StatCard
          icon={<Icon name="bell" size={18} />}
          color={MONEY_COLORS.warning}
          label="O'qilmagan"
          value={unreadCount}
        />
        <StatCard
          icon={<Icon name="check-circle" size={18} />}
          color={MONEY_COLORS.income}
          label="O'qilgan"
          value={readCount}
        />
      </div>

      <div className="flex gap-2 flex-wrap items-center">
        <div className="flex gap-1.5 bg-slate-50 border border-slate-200 rounded-xl p-1">
          {[
            ["all", "Barchasi"],
            ["unread", "O'qilmagan"],
            ["read", "O'qilgan"],
          ].map(([id, label]) => (
            <button
              key={id}
              onClick={() => setFilter(id)}
              className={`text-xs px-3 py-1.5 rounded-lg transition-all ${filter === id ? "bg-white text-slate-700 shadow-sm" : "text-slate-500"}`}
            >
              {label}
            </button>
          ))}
        </div>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Bildirishnomalarni qidirish..."
          className={`${INPUT_CLS} flex-1 min-w-[200px]`}
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Icon name="bell" size={18} />}
          title="Bildirishnoma yo'q"
          subtitle={
            notifLog.length === 0
              ? "Hozircha hech qanday bildirishnoma kelmagan."
              : "Bu filtrga mos bildirishnoma topilmadi."
          }
        />
      ) : (
        <div className="space-y-2">
          {filtered.map((n) => (
            <button
              key={n.id}
              onClick={() => !n.read && onMarkRead(n.id)}
              className={`${GLASS} w-full text-left rounded-2xl p-4 flex items-start gap-3 transition-all ${n.read ? "opacity-60" : "hover:bg-slate-100/50"}`}
            >
              <span
                className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${n.read ? "bg-slate-200" : "bg-sky-500"}`}
              />
              <div className="flex-1 min-w-0">
                <p className="text-slate-700 text-sm">{n.message}</p>
                <p className="text-slate-400 text-xs mt-1">
                  {timeAgo(n.createdAt)}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ============================== ADD/EDIT MODALS ============================== */

function TeacherHRFormModal({ editing, branches, onSubmit, onClose }) {
  const [branchId, setBranchId] = useState(
    editing?.branchId || branches[0]?.id || "",
  );
  const [name, setName] = useState(editing?.name || "");
  const [phone, setPhone] = useState(editing?.phone || "");
  const [salaryType, setSalaryType] = useState(
    editing?.salaryType || "percent",
  );
  const [sharePercent, setSharePercent] = useState(
    editing?.revenueSharePercent ?? 40,
  );
  const [fixedSalary, setFixedSalary] = useState(editing?.fixedSalary ?? "");
  const [rating, setRating] = useState(editing?.rating || 3);
  const [canCreateGroups, setCanCreateGroups] = useState(
    editing?.canCreateGroups !== false,
  );
  const [canReceivePayments, setCanReceivePayments] = useState(
    editing?.canReceivePayments !== false,
  );
  const [error, setError] = useState("");

  function submit() {
    if (!name.trim() || !branchId) {
      setError("Ism va filialni kiriting.");
      return;
    }
    onSubmit({
      branchId,
      name: name.trim(),
      phone,
      salaryType,
      revenueSharePercent: parseFloat(sharePercent) || 0,
      fixedSalary: parseFloat(fixedSalary) || 0,
      rating,
      note: "",
      canCreateGroups,
      canReceivePayments,
    });
    onClose();
  }

  return (
    <Modal
      title={editing ? "O'qituvchini tahrirlash" : "O'qituvchi qo'shish"}
      onClose={onClose}
    >
      <div className="space-y-4">
        <div>
          <label className={LABEL_CLS}>Filial</label>
          <select
            value={branchId}
            onChange={(e) => setBranchId(e.target.value)}
            className={INPUT_CLS}
          >
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={LABEL_CLS}>Ism familiya</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={INPUT_CLS}
            autoFocus
          />
        </div>
        <div>
          <label className={LABEL_CLS}>Telefon raqam</label>
          <PhoneInput value={phone} onChange={setPhone} />
        </div>
        <div>
          <label className={LABEL_CLS}>Kelishuv turi</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setSalaryType("percent")}
              className={`text-left rounded-xl border p-3 transition-all ${salaryType === "percent" ? "bg-slate-100 border-slate-300" : "bg-slate-50 border-slate-200"}`}
            >
              <p className="text-slate-900 text-sm font-medium">
                To'lovdan foiz
              </p>
              <p className="text-slate-400 text-[11px] mt-0.5">
                o'quvchi to'lovidan ulush
              </p>
            </button>
            <button
              type="button"
              onClick={() => setSalaryType("fixed")}
              className={`text-left rounded-xl border p-3 transition-all ${salaryType === "fixed" ? "bg-slate-100 border-slate-300" : "bg-slate-50 border-slate-200"}`}
            >
              <p className="text-slate-900 text-sm font-medium">
                Belgilangan oylik
              </p>
              <p className="text-slate-400 text-[11px] mt-0.5">
                to'lovga bog'liq emas
              </p>
            </button>
          </div>
        </div>
        {salaryType === "percent" ? (
          <div>
            <label className={LABEL_CLS}>Daromaddan ulush foizi (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              value={sharePercent}
              onChange={(e) => setSharePercent(e.target.value)}
              className={INPUT_CLS}
            />
            <p className="text-slate-400 text-[11px] mt-1">
              Oylik maosh filial daromadidan shu foiz asosida avtomatik
              hisoblanadi.
            </p>
          </div>
        ) : (
          <div>
            <label className={LABEL_CLS}>Oylik maosh (so'm)</label>
            <input
              type="number"
              min="0"
              value={fixedSalary}
              onChange={(e) => setFixedSalary(e.target.value)}
              className={INPUT_CLS}
            />
            <p className="text-slate-400 text-[11px] mt-1">
              Har oy to'lovlar hajmidan qat'i nazar belgilangan summa.
            </p>
          </div>
        )}
        <div>
          <label className={LABEL_CLS}>Baho</label>
          <StarPicker value={rating} onChange={setRating} size={22} />
        </div>
        <div className="border-t border-slate-200 pt-4 space-y-3">
          <ToggleSwitch
            checked={canCreateGroups}
            onChange={setCanCreateGroups}
            label="Guruh ochishga ruxsat"
            sub="O'chirilsa, ustoz ilovasida 'Yangi guruh' tugmasi yashiriladi"
          />
          <ToggleSwitch
            checked={canReceivePayments}
            onChange={setCanReceivePayments}
            label="To'lov qabul qilishga ruxsat"
            sub="O'quvchilardan to'lov olish huquqi"
          />
        </div>
        {error && <p className="text-red-500 text-xs">{error}</p>}
        <PrimaryButton onClick={submit} className="w-full">
          {editing ? (
            <Icon name="check" size={16} />
          ) : (
            <Icon name="plus" size={16} />
          )}{" "}
          {editing ? "Saqlash" : "Qo'shish"}
        </PrimaryButton>
      </div>
    </Modal>
  );
}

function TeacherPayrollModal({
  teacher,
  branch,
  directorData,
  opData,
  onAddPayment,
  onClose,
}) {
  const [month, setMonth] = useState(thisMonthKey());
  const [tab, setTab] = useState("advance");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  const stats = getTeacherPayStats(
    directorData,
    opData,
    teacher,
    branch,
    month,
  );
  const allHistory = (directorData.teacherPayments || [])
    .filter((p) => p.teacherHRId === teacher.id)
    .sort((a, b) => b.createdAt - a.createdAt);

  function submitPayment() {
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) {
      setError("To'g'ri summa kiriting.");
      return;
    }
    onAddPayment({
      teacherHRId: teacher.id,
      type: tab,
      amount: amt,
      month,
      date: todayISO(),
      note: note.trim(),
    });
    setAmount("");
    setNote("");
    setError("");
  }

  return (
    <Modal title={`${teacher.name} — maosh hisob-kitobi`} onClose={onClose}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-full text-slate-700">
            {teacher.salaryType === "fixed"
              ? "Belgilangan oylik"
              : `Foizli ${teacher.revenueSharePercent || 0}%`}
          </span>
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className={`${INPUT_CLS} w-auto py-1.5 text-xs`}
          />
        </div>

        <div
          className={`${GLASS_SOFT} rounded-2xl p-4 grid grid-cols-2 gap-3 text-sm`}
        >
          <div>
            <p className="text-slate-400 text-[11px]">Oylik haqi</p>
            <p className="text-slate-900 font-semibold">
              {money(stats.expectedPay)} so'm
            </p>
          </div>
          <div>
            <p className="text-slate-400 text-[11px]">Avans olgan</p>
            <p className="text-amber-600 font-semibold">
              {money(stats.advances)} so'm
            </p>
          </div>
          <div>
            <p className="text-slate-400 text-[11px]">Maosh olgan</p>
            <p className="text-sky-600 font-semibold">
              {money(stats.salaryPaid)} so'm
            </p>
          </div>
          <div>
            <p className="text-slate-400 text-[11px]">Qolgan haqi</p>
            <p className="text-green-600 font-semibold">
              {money(stats.remaining)} so'm
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex gap-1.5 bg-slate-50 border border-slate-200 rounded-xl p-1">
            <button
              onClick={() => setTab("advance")}
              className={`flex-1 text-xs py-2 rounded-lg transition-all ${tab === "advance" ? "bg-amber-100 text-amber-700" : "text-slate-500"}`}
            >
              Avans berish
            </button>
            <button
              onClick={() => setTab("salary")}
              className={`flex-1 text-xs py-2 rounded-lg transition-all ${tab === "salary" ? "bg-sky-100 text-sky-700" : "text-slate-500"}`}
            >
              Maosh to'lash
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Summa"
              className={INPUT_CLS}
            />
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Izoh (ixtiyoriy)"
              className={INPUT_CLS}
            />
          </div>
          {error && <p className="text-red-500 text-xs">{error}</p>}
          <PrimaryButton onClick={submitPayment} className="w-full">
            <Icon name="plus" size={16} />{" "}
            {tab === "advance" ? "Avans berish" : "Maosh to'lash"}
          </PrimaryButton>
        </div>

        {allHistory.length > 0 && (
          <div className="border-t border-slate-200 pt-3 space-y-1.5 max-h-48 overflow-y-auto">
            <p className="text-slate-400 text-[11px] mb-1">To'lovlar tarixi</p>
            {allHistory.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between text-xs bg-slate-50 rounded-lg px-3 py-2"
              >
                <div>
                  <span
                    className={
                      p.type === "advance" ? "text-amber-600" : "text-sky-600"
                    }
                  >
                    {p.type === "advance" ? "Avans" : "Maosh"}
                  </span>
                  <span className="text-slate-400 ml-2">
                    {formatDate(p.date)}
                    {p.note ? ` · ${p.note}` : ""}
                  </span>
                </div>
                <span className="text-slate-900 font-medium">
                  {money(p.amount)} so'm
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}

function CourseFormModal({ editing, branches, onSubmit, onClose }) {
  const [branchId, setBranchId] = useState(
    editing?.branchId || branches[0]?.id || "",
  );
  const [name, setName] = useState(editing?.name || "");
  const [error, setError] = useState("");
  function submit() {
    if (!name.trim() || !branchId) {
      setError("Kurs nomi va filialni kiriting.");
      return;
    }
    onSubmit({ branchId, name: name.trim() });
    onClose();
  }
  return (
    <Modal
      title={editing ? "Kursni tahrirlash" : "Yangi kurs"}
      onClose={onClose}
    >
      <div className="space-y-4">
        {branches.length > 1 && (
          <div>
            <label className={LABEL_CLS}>Filial</label>
            <select
              value={branchId}
              onChange={(e) => setBranchId(e.target.value)}
              className={INPUT_CLS}
            >
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
        )}
        <div>
          <label className={LABEL_CLS}>Kurs nomi</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={INPUT_CLS}
            placeholder="Masalan: Matematika"
            autoFocus
          />
        </div>
        {error && <p className="text-red-500 text-xs">{error}</p>}
        <PrimaryButton onClick={submit} className="w-full">
          {editing ? (
            <Icon name="check" size={16} />
          ) : (
            <Icon name="plus" size={16} />
          )}{" "}
          {editing ? "Saqlash" : "Qo'shish"}
        </PrimaryButton>
      </div>
    </Modal>
  );
}

function GroupFormModal({
  editing,
  initialCourseId,
  courses,
  groups,
  rooms,
  onSubmit,
  onClose,
}) {
  const [courseId, setCourseId] = useState(
    editing?.courseId || initialCourseId || courses[0]?.id || "",
  );
  const [name, setName] = useState(editing?.name || "");
  const [price, setPrice] = useState(editing?.price ?? "");
  const [days, setDays] = useState(editing?.days || []);
  const [time, setTime] = useState(editing?.time || "15:00");
  const [duration, setDuration] = useState(editing?.durationMonths ?? "3");
  const [roomId, setRoomId] = useState(editing?.roomId || "");
  const [startDate, setStartDate] = useState(editing?.startDate || todayISO());
  const [color, setColor] = useState(editing?.color || nextGroupColor(groups));
  const [error, setError] = useState("");

  function submit() {
    if (!courseId) {
      setError("Avval kursni tanlang.");
      return;
    }
    if (!name.trim()) {
      setError("Guruh nomini kiriting.");
      return;
    }
    onSubmit({
      courseId,
      name: name.trim(),
      price: parseFloat(price) || 0,
      days,
      time,
      durationMonths: parseFloat(duration) || 0,
      roomId: roomId || null,
      startDate,
      color,
    });
    onClose();
  }

  return (
    <Modal
      title={editing ? "Guruhni tahrirlash" : "Yangi guruh"}
      onClose={onClose}
    >
      <div className="space-y-4">
        <div>
          <label className={LABEL_CLS}>Kurs</label>
          <select
            value={courseId}
            onChange={(e) => setCourseId(e.target.value)}
            className={INPUT_CLS}
            disabled={!!editing}
          >
            {courses.length === 0 && (
              <option value="">— Avval kurs yarating —</option>
            )}
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={LABEL_CLS}>Guruh nomi</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Masalan: Matematika - A guruh"
            className={INPUT_CLS}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={LABEL_CLS}>Narxi (oylik, so'm)</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className={INPUT_CLS}
            />
          </div>
          <div>
            <label className={LABEL_CLS}>Davomiyligi (oy)</label>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className={INPUT_CLS}
            />
          </div>
        </div>
        {rooms && rooms.length > 0 && (
          <div>
            <label className={LABEL_CLS}>Xona (ixtiyoriy)</label>
            <select
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              className={INPUT_CLS}
            >
              <option value="">— Tanlanmagan —</option>
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} ({r.capacity} o'rin)
                </option>
              ))}
            </select>
          </div>
        )}
        <div>
          <label className={LABEL_CLS}>Dars kunlari</label>
          <DayPicker value={days} onChange={setDays} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={LABEL_CLS}>Vaqt</label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className={INPUT_CLS}
            />
          </div>
          <div>
            <label className={LABEL_CLS}>Boshlanish sanasi</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className={INPUT_CLS}
            />
          </div>
        </div>
        <div>
          <label className={LABEL_CLS}>Rang</label>
          <div className="flex gap-2 flex-wrap">
            {GROUP_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`w-7 h-7 rounded-full border-2 ${color === c ? "border-slate-900 scale-110" : "border-slate-200"}`}
                style={{ background: c }}
              />
            ))}
          </div>
        </div>
        {error && <p className="text-red-500 text-xs">{error}</p>}
        <PrimaryButton onClick={submit} className="w-full" disabled={!courseId}>
          {editing ? (
            <Icon name="check" size={16} />
          ) : (
            <Icon name="plus" size={16} />
          )}{" "}
          {editing ? "Saqlash" : "Guruh yaratish"}
        </PrimaryButton>
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
  const [view, setView] = useState("home");
  const [modal, setModal] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [notifLog, setNotifLog] = useState([]);
  const [overdueChecked, setOverdueChecked] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await loadInitialData();
        if (!cancelled) {
          setDirectorData(data.directorData || seedDirectorData());
          setOpData(
            data.opData || {
              groups: [],
              students: [],
              tasks: [],
              attendance: [],
              rooms: [],
            },
          );
          setSession(data.session || null);
          setNotifLog(data.notifLog || []);
        }
      } catch (e) {
        if (!cancelled) {
          setDirectorData(seedDirectorData());
          setOpData({
            groups: [],
            students: [],
            tasks: [],
            attendance: [],
            rooms: [],
          });
          setSession(null);
          setNotifLog([]);
        }
      }
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (loading || !directorData) return;
    const t = setTimeout(async () => {
      try {
        await persistDirectorData(directorData);
      } catch (e) {
        console.error("Saqlashda xatolik:", e);
      }
    }, 700);
    return () => clearTimeout(t);
  }, [directorData, loading]);

  useEffect(() => {
    if (loading || !opData) return;
    const t = setTimeout(async () => {
      try {
        await persistOpData(opData);
      } catch (e) {
        console.error("Saqlashda xatolik:", e);
      }
    }, 700);
    return () => clearTimeout(t);
  }, [opData, loading]);

  useEffect(() => {
    if (loading) return;
    (async () => {
      try {
        await persistSession(session);
      } catch (e) {
        console.error("Saqlashda xatolik:", e);
      }
    })();
  }, [session, loading]);

  useEffect(() => {
    if (loading) return;
    const t = setTimeout(async () => {
      try {
        await persistNotifLog(notifLog);
      } catch (e) {
        console.error("Saqlashda xatolik:", e);
      }
    }, 700);
    return () => clearTimeout(t);
  }, [notifLog, loading]);

  function addNotification(message) {
    const id = generateId("n");
    setToasts((prev) => [...prev, { id, message }]);
    setTimeout(
      () => setToasts((prev) => prev.filter((n) => n.id !== id)),
      5000,
    );
    setNotifLog((prev) =>
      [{ id, message, createdAt: Date.now(), read: false }, ...prev].slice(
        0,
        100,
      ),
    );
  }
  function clearNotifLog() {
    setNotifLog([]);
  }
  function markNotifRead(id) {
    setNotifLog((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  }
  function markAllNotifsRead() {
    setNotifLog((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  // Overdue payment check (after 20th of month), once per session
  useEffect(() => {
    if (loading || !directorData || !opData || !session || overdueChecked)
      return;
    if (new Date().getDate() <= 20) {
      setOverdueChecked(true);
      return;
    }
    const month = thisMonthKey();
    let unpaidCount = 0;
    opGroups(opData).forEach((g) => {
      const studs = opStudentsInGroups(opData, [g.id]);
      studs.forEach((s) => {
        if (
          getPaymentStatus(
            directorData.payments,
            s.id,
            g.id,
            month,
            g.price,
          ) !== "paid"
        )
          unpaidCount++;
      });
    });
    if (unpaidCount > 0)
      addNotification(
        `⚠️ ${unpaidCount} ta o'quvchi bu oy uchun hali to'liq to'lov qilmagan (20-sanadan o'tdi).`,
      );
    setOverdueChecked(true);
    // eslint-disable-next-line
  }, [loading, directorData, opData, session, overdueChecked]);

  function goTo(v) {
    setView(v);
  }
  function openModal(m) {
    setModal(m);
  }
  function closeModal() {
    setModal(null);
  }

  function loginAsManager(managerId) {
    setSession({ managerId });
    setView("home");
  }
  function logout() {
    setSession(null);
    setView("home");
    setModal(null);
  }

  function updateDirector(updated) {
    setDirectorData((prev) => ({
      ...prev,
      directors: prev.directors.map((d) => (d.id === updated.id ? updated : d)),
    }));
  }
  function addTeacherHR(payload) {
    setDirectorData((prev) => ({
      ...prev,
      teachersHR: [...prev.teachersHR, { id: generateId("thr"), ...payload }],
    }));
    addNotification("O'qituvchi qo'shildi.");
  }
  function updateTeacherHR(id, payload) {
    setDirectorData((prev) => ({
      ...prev,
      teachersHR: prev.teachersHR.map((t) =>
        t.id === id ? { ...t, ...payload } : t,
      ),
    }));
    addNotification("Yangilandi.");
  }
  function deleteTeacherHR(id) {
    setDirectorData((prev) => ({
      ...prev,
      teachersHR: prev.teachersHR.filter((t) => t.id !== id),
    }));
  }
  function addTeacherPayment(payload) {
    setDirectorData((prev) => ({
      ...prev,
      teacherPayments: [
        ...(prev.teacherPayments || []),
        { id: generateId("tpay"), createdAt: Date.now(), ...payload },
      ],
    }));
    addNotification(
      payload.type === "advance"
        ? `Avans berildi: ${money(payload.amount)} so'm.`
        : `Maosh to'landi: ${money(payload.amount)} so'm.`,
    );
  }
  function addHoliday(payload) {
    setDirectorData((prev) => ({
      ...prev,
      holidays: [
        ...prev.holidays,
        { id: generateId("hol"), directorId: currentDirectorId(), ...payload },
      ],
    }));
    addNotification("Bayram kuni qo'shildi.");
  }
  function removeHoliday(id) {
    setDirectorData((prev) => ({
      ...prev,
      holidays: prev.holidays.filter((h) => h.id !== id),
    }));
  }
  function addFinance(entry) {
    setDirectorData((prev) => ({
      ...prev,
      finance: [
        ...prev.finance,
        {
          id: generateId("fin"),
          status: entry.status,
          createdAt: Date.now(),
          ...entry,
        },
      ],
    }));
    addNotification(
      entry.status === "pending"
        ? "Xarajat direktor tasdig'ini kutmoqda."
        : "Yozuv saqlandi.",
    );
  }
  function approveFinance(id) {
    setDirectorData((prev) => ({
      ...prev,
      finance: prev.finance.map((f) =>
        f.id === id ? { ...f, status: "approved" } : f,
      ),
    }));
    addNotification("Xarajat tasdiqlandi.");
  }
  function rejectFinance(id) {
    setDirectorData((prev) => ({
      ...prev,
      finance: prev.finance.filter((f) => f.id !== id),
    }));
    addNotification("Xarajat rad etildi.");
  }
  function addCourse(payload) {
    setDirectorData((prev) => ({
      ...prev,
      courses: [...prev.courses, { id: generateId("crs"), ...payload }],
    }));
    addNotification("Kurs qo'shildi.");
  }
  function updateCourse(id, payload) {
    setDirectorData((prev) => ({
      ...prev,
      courses: prev.courses.map((c) =>
        c.id === id ? { ...c, ...payload } : c,
      ),
    }));
    addNotification("Kurs yangilandi.");
  }
  function deleteCourse(id) {
    setDirectorData((prev) => ({
      ...prev,
      courses: prev.courses.filter((c) => c.id !== id),
    }));
    setOpData((prev) => ({
      ...prev,
      groups: (prev.groups || []).filter((g) => g.courseId !== id),
    }));
    addNotification("Kurs va unga tegishli guruhlar o'chirildi.");
  }
  function addGroup(payload) {
    setOpData((prev) => ({
      ...prev,
      groups: [...(prev.groups || []), { id: generateId("g"), ...payload }],
    }));
    addNotification("Guruh ochildi.");
  }
  function updateGroup(id, payload) {
    setOpData((prev) => ({
      ...prev,
      groups: (prev.groups || []).map((g) =>
        g.id === id ? { ...g, ...payload } : g,
      ),
    }));
    addNotification("Guruh yangilandi.");
  }
  function deleteGroup(id) {
    setOpData((prev) => ({
      ...prev,
      groups: (prev.groups || [])
        .map((g) => (g.id === id ? null : g))
        .filter(Boolean),
      students: (prev.students || []).map((s) => ({
        ...s,
        groupIds: (s.groupIds || []).filter((gid) => gid !== id),
      })),
    }));
    addNotification("Guruh o'chirildi.");
  }

  function addRoom(payload) {
    setOpData((prev) => ({
      ...prev,
      rooms: [...(prev.rooms || []), { id: generateId("room"), ...payload }],
    }));
    addNotification("Xona qo'shildi.");
  }
  function updateRoom(id, payload) {
    setOpData((prev) => ({
      ...prev,
      rooms: (prev.rooms || []).map((r) =>
        r.id === id ? { ...r, ...payload } : r,
      ),
    }));
    addNotification("Xona yangilandi.");
  }
  function deleteRoom(id) {
    setOpData((prev) => ({
      ...prev,
      rooms: (prev.rooms || []).filter((r) => r.id !== id),
      groups: (prev.groups || []).map((g) =>
        g.roomId === id ? { ...g, roomId: null } : g,
      ),
    }));
    addNotification("Xona o'chirildi.");
  }

  function updateAttendanceRecord(recordId, entries) {
    setOpData((prev) => ({
      ...prev,
      attendance: (prev.attendance || []).map((a) =>
        a.id === recordId ? { ...a, records: entries, locked: true } : a,
      ),
    }));
    addNotification("Davomat yangilandi.");
  }
  function deleteAttendanceRecord(recordId) {
    setOpData((prev) => ({
      ...prev,
      attendance: (prev.attendance || []).filter((a) => a.id !== recordId),
    }));
    addNotification("Davomat yozuvi o'chirildi.");
  }

  // Recording a payment also books it as approved finance income for that branch
  function recordPayment(payload) {
    const group = opGroups(opData).find((g) => g.id === payload.groupId);
    const course = group
      ? directorData.courses.find((c) => c.id === group.courseId)
      : null;
    const branchId = course?.branchId;
    setDirectorData((prev) => ({
      ...prev,
      payments: [
        ...prev.payments,
        { id: generateId("pay"), createdAt: Date.now(), ...payload },
      ],
      finance: branchId
        ? [
            ...prev.finance,
            {
              id: generateId("fin"),
              branchId,
              type: "income",
              amount: payload.amount,
              category: "O'quv to'lovi",
              note: group?.name || "",
              date: payload.date,
              status: "approved",
              createdAt: Date.now(),
            },
          ]
        : prev.finance,
    }));
    addNotification(`To'lov qabul qilindi: ${money(payload.amount)} so'm.`);
  }

  function currentDirectorId() {
    const manager = directorData?.managers.find(
      (m) => m.id === session?.managerId,
    );
    const branch = directorData?.branches.find((b) =>
      (manager?.branchIds || []).includes(b.id),
    );
    return branch?.directorId;
  }

  function handleConfirm() {
    if (!modal || modal.type !== "confirm") return;
    const { action } = modal;
    if (action.kind === "deleteTeacherHR") deleteTeacherHR(action.teacherHRId);
    if (action.kind === "deleteCourse") deleteCourse(action.courseId);
    if (action.kind === "deleteGroup") deleteGroup(action.groupId);
    if (action.kind === "deleteRoom") deleteRoom(action.roomId);
    if (action.kind === "deleteAttendance")
      deleteAttendanceRecord(action.recordId);
    setModal(null);
  }

  if (loading || !directorData || !opData)
    return (
      <ThemeContext.Provider value={THEMES.cosmos}>
        <LoadingScreen />
      </ThemeContext.Provider>
    );

  const currentManager = session
    ? directorData.managers.find((m) => m.id === session.managerId)
    : null;
  const orgDirectorId = currentManager
    ? directorData.branches.find((b) =>
        (currentManager.branchIds || []).includes(b.id),
      )?.directorId
    : null;
  const orgDirector = orgDirectorId
    ? directorData.directors.find((d) => d.id === orgDirectorId)
    : null;
  const activeTheme = orgDirector
    ? orgDirector.themeId === "custom" && orgDirector.customTheme
      ? orgDirector.customTheme
      : THEMES[orgDirector.themeId] || THEMES.cosmos
    : THEMES.cosmos;

  if (!session) {
    return (
      <ThemeContext.Provider value={THEMES.cosmos}>
        <ManagerAuth
          directorData={directorData}
          onLoginManager={loginAsManager}
        />
      </ThemeContext.Provider>
    );
  }

  const now = new Date();

  const manager = currentManager;
  const myBranches = manager
    ? directorData.branches.filter((b) =>
        (manager.branchIds || []).includes(b.id),
      )
    : [];
  if (!manager || myBranches.length === 0)
    return (
      <ThemeContext.Provider value={THEMES.cosmos}>
        <LoadingScreen />
      </ThemeContext.Provider>
    );
  const allowedPages = manager.allowedPages || MANAGER_NAV_ALL.map((p) => p.id);
  const visibleNav = MANAGER_NAV_ALL.filter((p) => allowedPages.includes(p.id));
  const effectiveView = allowedPages.includes(view)
    ? view
    : visibleNav[0]?.id || "home";
  const branchIds = myBranches.map((b) => b.id);

  return (
    <ThemeContext.Provider value={activeTheme}>
      <div
        className="min-h-screen w-full text-slate-900 relative"
        style={{
          ...PAGE_BG_STYLE,
          fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
        }}
      >
        <GlobalStyleTag />
        <BackgroundBlobs />
        <div className="relative z-10 flex min-h-screen">
          <AppSidebar
            view={effectiveView}
            goTo={goTo}
            items={visibleNav}
            title={`🏢 ${myBranches.map((b) => b.name).join(", ")}`}
          />
          <main className="flex-1 p-4 md:p-8 pb-28 md:pb-8 max-w-6xl mx-auto w-full">
            <TopBar
              name={manager.name}
              color={myBranches[0].color}
              now={now}
              onLogout={logout}
              director={orgDirector}
              updateDirector={updateDirector}
              notifLog={notifLog}
              onClearNotifs={clearNotifLog}
            />
            {effectiveView === "home" && (
              <DashboardHome
                scopeBranches={myBranches}
                directorData={directorData}
                opData={opData}
                centerLabel={myBranches.map((b) => b.name).join(", ")}
                allBranches={true}
              />
            )}
            {effectiveView === "payments" && (
              <PaymentsPage
                scopeBranches={myBranches}
                directorData={directorData}
                opData={opData}
                openModal={openModal}
              />
            )}
            {effectiveView === "teachers" && (
              <TeachersHR
                scopeBranches={myBranches}
                directorData={directorData}
                opData={opData}
                openModal={openModal}
                canEdit={true}
              />
            )}
            {effectiveView === "courses" && (
              <CoursesPage
                scopeBranches={myBranches}
                directorData={directorData}
                opData={opData}
                openModal={openModal}
                canEdit={true}
              />
            )}
            {effectiveView === "groups" && (
              <GroupsPage
                directorData={directorData}
                opData={opData}
                openModal={openModal}
                scopeBranchIds={branchIds}
                canEdit={true}
              />
            )}
            {effectiveView === "attendance" && (
              <AttendancePage
                directorData={directorData}
                opData={opData}
                scopeBranchIds={branchIds}
                openModal={openModal}
              />
            )}
            {effectiveView === "rooms" && (
              <RoomsPage opData={opData} openModal={openModal} canEdit={true} />
            )}
            {effectiveView === "finance" && (
              <FinancePage
                role="manager"
                scopeBranchIds={branchIds}
                directorData={directorData}
                allBranches={myBranches}
                addFinance={addFinance}
                approveFinance={approveFinance}
                rejectFinance={rejectFinance}
              />
            )}
            {effectiveView === "holidays" && (
              <HolidaysPage
                directorId={orgDirectorId}
                directorData={directorData}
                addHoliday={addHoliday}
                removeHoliday={removeHoliday}
                canEdit={false}
              />
            )}
            {effectiveView === "notifications" && (
              <NotificationsPage
                notifLog={notifLog}
                onMarkRead={markNotifRead}
                onMarkAllRead={markAllNotifsRead}
                onClear={clearNotifLog}
              />
            )}
          </main>
        </div>
        <AppBottomNav view={effectiveView} goTo={goTo} items={visibleNav} />
        <ToastStack
          toasts={toasts}
          onDismiss={(id) =>
            setToasts((prev) => prev.filter((n) => n.id !== id))
          }
        />

        {modal?.type === "teacherHRForm" && (
          <TeacherHRFormModal
            editing={modal.editing}
            branches={myBranches}
            onSubmit={(p) =>
              modal.editing
                ? updateTeacherHR(modal.editing.id, p)
                : addTeacherHR(p)
            }
            onClose={closeModal}
          />
        )}
        {modal?.type === "teacherPayroll" &&
          (() => {
            const t = directorData.teachersHR.find(
              (x) => x.id === modal.teacherId,
            );
            const b = t
              ? directorData.branches.find((x) => x.id === t.branchId)
              : null;
            return t ? (
              <TeacherPayrollModal
                teacher={t}
                branch={b}
                directorData={directorData}
                opData={opData}
                onAddPayment={addTeacherPayment}
                onClose={closeModal}
              />
            ) : null;
          })()}
        {modal?.type === "courseForm" && (
          <CourseFormModal
            editing={modal.editing}
            branches={myBranches}
            onSubmit={(p) =>
              modal.editing ? updateCourse(modal.editing.id, p) : addCourse(p)
            }
            onClose={closeModal}
          />
        )}
        {modal?.type === "groupForm" && (
          <GroupFormModal
            editing={modal.editing}
            initialCourseId={modal.courseId}
            courses={directorData.courses.filter((c) =>
              myBranches.some((b) => b.id === c.branchId),
            )}
            groups={opGroups(opData)}
            rooms={opRooms(opData)}
            onSubmit={(p) =>
              modal.editing ? updateGroup(modal.editing.id, p) : addGroup(p)
            }
            onClose={closeModal}
          />
        )}
        {modal?.type === "roomForm" && (
          <RoomFormModal
            editing={modal.editing}
            onSubmit={(p) =>
              modal.editing ? updateRoom(modal.editing.id, p) : addRoom(p)
            }
            onClose={closeModal}
          />
        )}
        {modal?.type === "editAttendance" &&
          (() => {
            const rec = opAttendance(opData).find(
              (a) => a.id === modal.recordId,
            );
            const grp = opGroups(opData).find((g) => g.id === modal.groupId);
            return rec && grp ? (
              <EditAttendanceModal
                record={rec}
                group={grp}
                opData={opData}
                onSave={(entries) => updateAttendanceRecord(rec.id, entries)}
                onClose={closeModal}
              />
            ) : null;
          })()}
        {modal?.type === "recordPayment" && (
          <RecordPaymentModal
            initialStudentId={modal.studentId}
            initialGroupId={modal.groupId}
            scopeBranches={myBranches}
            directorData={directorData}
            opData={opData}
            onSubmit={recordPayment}
            onClose={closeModal}
          />
        )}
        {modal?.type === "confirm" && (
          <ConfirmModal
            message={modal.message}
            onConfirm={handleConfirm}
            onCancel={closeModal}
          />
        )}
      </div>
    </ThemeContext.Provider>
  );
}
