import { useState, useEffect } from "react";
import {
  Trophy,
  ClipboardList,
  Calendar,
  User,
  Star,
  X,
  Check,
  Clock,
  ChevronRight,
  Upload,
  Eye,
  EyeOff,
  Bell,
  Loader2,
  Camera,
  Lock,
  CalendarClock,
  Home,
  LogOut,
  Phone,
  LogIn,
} from "lucide-react";
import {
  loadStudentData,
  persistStudentAppData,
  persistStudentSession,
} from "./student_backend";

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
const JS_DAY_NAMES = [
  "Yakshanba",
  "Dushanba",
  "Seshanba",
  "Chorshanba",
  "Payshanba",
  "Juma",
  "Shanba",
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
const MAX_STORE_CHARS = 900000;
const BG_GRADIENT = "#0A1454";

const STUDENT_NAV_ITEMS = [
  { id: "home", label: "Bosh sahifa", icon: Home },
  { id: "tasks", label: "Vazifalarim", icon: ClipboardList },
  { id: "rating", label: "Reyting", icon: Trophy },
  { id: "schedule", label: "Dars jadvali", icon: Calendar },
  { id: "profile", label: "Profil", icon: User },
];

/* ============================== STYLE TOKENS ============================== */

const GLASS =
  "bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl shadow-black/10";
const GLASS_SOFT = "bg-white/5 backdrop-blur-lg border border-white/10";
const INPUT_CLS =
  "w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-4 py-2.5 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-fuchsia-300/50 focus:bg-white/15 transition-all text-sm";
const LABEL_CLS =
  "block text-xs font-medium text-white/60 mb-1.5 uppercase tracking-wide";
const BTN_PRIMARY =
  "bg-[#1B3BFF] hover:bg-[#4F73FF] backdrop-blur-md border border-white/30 text-white font-medium rounded-xl px-4 py-2.5 transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 text-sm disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100";
const BTN_GHOST =
  "bg-white/5 hover:bg-white/15 backdrop-blur-md border border-white/10 text-white/80 hover:text-white rounded-xl px-4 py-2 transition-all text-sm flex items-center justify-center gap-2";
const BTN_ICON =
  "w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center transition-all text-white/70 hover:text-white shrink-0";

/* ============================== UTILITIES ============================== */

function generateId(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T00:00:00");
  if (isNaN(d.getTime())) return dateStr;
  return `${d.getDate()}-${MONTHS_UZ[d.getMonth()]}, ${d.getFullYear()}`;
}

function formatDateTime(ts) {
  if (!ts) return "";
  const d = new Date(ts);
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${d.getDate()}-${MONTHS_UZ[d.getMonth()]}, ${hh}:${mm}`;
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
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

function nextGroupColor(groups) {
  return GROUP_COLORS[groups.length % GROUP_COLORS.length];
}

function withGroupId(students, groupId) {
  return students.map((s) => ({ ...s, groupId }));
}

function normalizePhone(p) {
  return (p || "").replace(/\D/g, "");
}

function displayPhone(local) {
  if (!local) return "kiritilmagan";
  return "+998 " + local;
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

function getGroupStudents(appData, groupId) {
  return appData.students.filter((s) => s.groupIds.includes(groupId));
}

function getStudentGroups(appData, studentId) {
  const student = appData.students.find((s) => s.id === studentId);
  if (!student) return [];
  return appData.groups.filter((g) => student.groupIds.includes(g.id));
}

function getStudentStats(tasks, studentId, groupId) {
  let sum = 0,
    count = 0,
    done = 0,
    total = 0;
  tasks.forEach((t) => {
    if (t.groupId !== groupId) return;
    total += 1;
    const sub = t.submissions[studentId];
    if (sub && (sub.status === "submitted" || sub.status === "graded"))
      done += 1;
    if (sub && sub.status === "graded" && sub.rating) {
      sum += sub.rating;
      count += 1;
    }
  });
  return { avg: count ? sum / count : 0, count, done, total };
}

function getStudentStatsAllGroups(appData, studentId) {
  const student = appData.students.find((s) => s.id === studentId);
  const groupIds = student ? student.groupIds : [];
  let sum = 0,
    count = 0,
    done = 0,
    total = 0;
  appData.tasks.forEach((t) => {
    if (!groupIds.includes(t.groupId)) return;
    total += 1;
    const sub = t.submissions[studentId];
    if (sub && (sub.status === "submitted" || sub.status === "graded"))
      done += 1;
    if (sub && sub.status === "graded" && sub.rating) {
      sum += sub.rating;
      count += 1;
    }
  });
  return { avg: count ? sum / count : 0, count, done, total };
}

function attendanceStatus(record, studentId) {
  const entry = record?.records?.[studentId];
  if (entry == null) return null;
  return typeof entry === "string" ? entry : entry.status;
}

function getAttendanceStats(attendance, studentId, groupIds) {
  let present = 0,
    total = 0;
  attendance.forEach((a) => {
    if (!groupIds.includes(a.groupId)) return;
    const status = attendanceStatus(a, studentId);
    if (status != null) {
      total += 1;
      if (status === "present" || status === "late") present += 1;
    }
  });
  return { present, total };
}

function rankStudents(students, tasks) {
  return students
    .map((s) => ({ ...s, stats: getStudentStats(tasks, s.id, s.groupId) }))
    .sort((a, b) => {
      if (b.stats.avg !== a.stats.avg) return b.stats.avg - a.stats.avg;
      if (b.stats.count !== a.stats.count) return b.stats.count - a.stats.count;
      return a.name.localeCompare(b.name);
    });
}

function allStudentsFlat(appData) {
  const list = [];
  appData.groups.forEach((g) => {
    getGroupStudents(appData, g.id).forEach((s) =>
      list.push({
        ...s,
        groupId: g.id,
        groupName: g.name,
        groupColor: g.color,
      }),
    );
  });
  return list;
}

// Returns ISO date strings (recent-first) that fall on this group's scheduled weekdays
function getClassDates(group, back = 21, forward = 7) {
  if (!group || !group.days || !group.days.length) return [];
  const dates = [];
  const today = new Date();
  for (let offset = forward; offset >= -back; offset--) {
    const d = new Date(today);
    d.setDate(d.getDate() + offset);
    const dayName = WEEK_DAYS[(d.getDay() + 6) % 7];
    if (group.days.includes(dayName)) dates.push(d.toISOString().slice(0, 10));
  }
  return dates;
}

// Counts how many of a group's scheduled weekdays fall between startDate and today (inclusive)
function countClassDaysSince(days, startDate) {
  if (!days || !days.length || !startDate) return 0;
  const start = new Date(startDate + "T00:00:00");
  const today = new Date();
  if (isNaN(start.getTime()) || start > today) return 0;
  let count = 0;
  const cursor = new Date(start);
  while (cursor <= today) {
    const dayName = WEEK_DAYS[(cursor.getDay() + 6) % 7];
    if (days.includes(dayName)) count += 1;
    cursor.setDate(cursor.getDate() + 1);
  }
  return count;
}

// Day-of-month numbers for Mon..Sun of the current calendar week
function getCurrentWeekDates() {
  const today = new Date();
  const dow = (today.getDay() + 6) % 7;
  const monday = new Date(today);
  monday.setDate(today.getDate() - dow);
  return WEEK_DAYS.map((_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d.getDate();
  });
}

/* ============================== MEDIA HANDLING ============================== */

function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function compressImageDataUrl(dataUrl, maxWidth, quality) {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => {
      const scale = Math.min(1, maxWidth / img.width);
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(img.width * scale));
      canvas.height = Math.max(1, Math.round(img.height * scale));
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.onerror = reject;
    img.src = dataUrl;
  });
}

async function processMediaFile(file) {
  const isVideo = file.type.startsWith("video/");
  const rawDataUrl = await readFileAsDataURL(file);
  if (isVideo) {
    return {
      dataUrl: rawDataUrl,
      type: "video",
      name: file.name,
      tooLargeToStore: rawDataUrl.length > MAX_STORE_CHARS,
    };
  }
  let finalUrl = rawDataUrl;
  if (finalUrl.length > MAX_STORE_CHARS) {
    try {
      finalUrl = await compressImageDataUrl(rawDataUrl, 700, 0.6);
    } catch (e) {
      /* keep raw */
    }
  }
  if (finalUrl.length > MAX_STORE_CHARS) {
    try {
      finalUrl = await compressImageDataUrl(rawDataUrl, 450, 0.45);
    } catch (e) {
      /* keep raw */
    }
  }
  return {
    dataUrl: finalUrl,
    type: "image",
    name: file.name,
    tooLargeToStore: finalUrl.length > MAX_STORE_CHARS,
  };
}

/* ============================== SEED / PERSISTENCE ============================== */

function seedData() {
  return {
    teacher: null,
    students: [],
    groups: [],
    tasks: [],
    attendance: [],
    coinSettings: { 5: 2, 4: 1, 3: 0, 2: 0, 1: 0 },
    postponed: [],
  };
}

function sanitizeForStorage(appData) {
  const clone = JSON.parse(JSON.stringify(appData));
  (clone.tasks || []).forEach((t) => {
    if (t.attachment && t.attachment.tooLargeToStore)
      t.attachment.dataUrl = null;
    Object.values(t.submissions || {}).forEach((s) => {
      if (s.attachment && s.attachment.tooLargeToStore)
        s.attachment.dataUrl = null;
    });
  });
  return clone;
}

/* ============================== GLOBAL VISUALS ============================== */

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
      input[type="date"]::-webkit-calendar-picker-indicator, input[type="time"]::-webkit-calendar-picker-indicator { filter: invert(1); opacity: 0.6; }
    `}</style>
  );
}

function BackgroundBlobs() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      <div
        className="absolute -top-20 -left-20 w-96 h-96 rounded-full blur-3xl opacity-30"
        style={{
          background: "#8b5cf6",
          animation: "float1 18s ease-in-out infinite",
        }}
      />
      <div
        className="absolute top-1/3 -right-32 w-96 h-96 rounded-full blur-3xl opacity-30"
        style={{
          background: "#ec4899",
          animation: "float2 22s ease-in-out infinite",
        }}
      />
      <div
        className="absolute -bottom-32 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-25"
        style={{
          background: "#0ea5e9",
          animation: "float3 20s ease-in-out infinite",
        }}
      />
    </div>
  );
}

function LoadingScreen() {
  return (
    <div
      className="min-h-screen w-full flex items-center justify-center text-white"
      style={{ background: BG_GRADIENT }}
    >
      <div className="flex flex-col items-center gap-3">
        <Loader2 size={28} className="animate-spin" />
        <p className="text-white/70 text-sm">Yuklanmoqda...</p>
      </div>
    </div>
  );
}

/* ============================== SMALL REUSABLE COMPONENTS ============================== */

function StarRating({ value, onChange, size = 18, interactive = false }) {
  const stars = [1, 2, 3, 4, 5];
  return (
    <div className="flex gap-0.5">
      {stars.map((s) => (
        <button
          key={s}
          type="button"
          disabled={!interactive}
          onClick={() => interactive && onChange && onChange(s)}
          className={
            interactive
              ? "cursor-pointer transition-transform hover:scale-125"
              : "cursor-default"
          }
        >
          <Star
            size={size}
            className={
              s <= Math.round(value)
                ? "fill-amber-300 text-amber-300"
                : "fill-transparent text-white/25"
            }
          />
        </button>
      ))}
    </div>
  );
}

function Avatar({ name, color = "#8b5cf6", size = 40, photo, onClick }) {
  const style = { width: size, height: size, minWidth: size };
  if (photo) {
    return (
      <img
        src={photo}
        alt={name}
        style={style}
        onClick={onClick}
        className={`rounded-full object-cover border-2 border-white/30 ${onClick ? "cursor-pointer" : ""}`}
      />
    );
  }
  return (
    <div
      style={{ ...style, background: color, fontSize: size * 0.38 }}
      onClick={onClick}
      className={`font-display rounded-full flex items-center justify-center font-bold text-white border-2 border-white/30 shrink-0 ${onClick ? "cursor-pointer hover:scale-105 transition-transform" : ""}`}
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
      <span className="bg-white/10 border border-white/20 rounded-xl px-3 py-2.5 text-white/70 text-sm shrink-0">
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`${GLASS} rounded-3xl p-5 sm:p-6 w-full ${wide ? "max-w-2xl" : "max-w-md"} max-h-[85vh] overflow-y-auto`}
        style={{ background: "rgba(10,20,60,0.85)" }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-lg font-semibold text-white">
            {title}
          </h3>
          <button onClick={onClose} className={BTN_ICON}>
            <X size={18} />
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
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`${GLASS} rounded-3xl p-6 w-full max-w-sm`}
        style={{ background: "rgba(10,20,60,0.9)" }}
      >
        <p className="text-white mb-5">{message}</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className={`${BTN_GHOST} flex-1`}>
            Yo'q, bekor
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 bg-rose-500/80 hover:bg-rose-500 border border-white/30 text-white rounded-xl px-4 py-2 text-sm transition-all"
          >
            Ha, tasdiqlash
          </button>
        </div>
      </div>
    </div>
  );
}

function NotificationStack({ notifications, onDismiss }) {
  if (!notifications.length) return null;
  return (
    <div className="fixed top-4 right-4 left-4 sm:left-auto z-[70] flex flex-col gap-2 sm:w-96">
      {notifications.map((n) => (
        <div
          key={n.id}
          className={`${GLASS} rounded-2xl p-3.5 flex items-start gap-3`}
          style={{
            background: "rgba(27,59,255,0.88)",
            animation: "fadeIn 0.3s ease",
          }}
        >
          <Bell size={18} className="text-white shrink-0 mt-0.5" />
          <p className="text-white text-sm flex-1">{n.message}</p>
          <button
            onClick={() => onDismiss(n.id)}
            className="text-white/70 hover:text-white shrink-0"
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}

function EmptyState({ icon: Icon, title, subtitle, action }) {
  return (
    <div
      className={`${GLASS_SOFT} rounded-3xl p-10 flex flex-col items-center text-center gap-3`}
    >
      <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center">
        <Icon size={26} className="text-white/60" />
      </div>
      <p className="text-white font-medium">{title}</p>
      {subtitle && <p className="text-white/50 text-sm max-w-sm">{subtitle}</p>}
      {action}
    </div>
  );
}

function ProfileCategory({ icon: Icon, title, children }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`${GLASS_SOFT} rounded-2xl overflow-hidden`}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between p-4 text-left"
      >
        <span className="text-white font-medium text-sm flex items-center gap-2">
          {Icon && <Icon size={16} />} {title}
        </span>
        <ChevronRight
          size={16}
          className={`text-white/50 transition-transform shrink-0 ${open ? "rotate-90" : ""}`}
        />
      </button>
      {open && (
        <div className="px-4 pb-4 space-y-4 border-t border-white/10 pt-4">
          {children}
        </div>
      )}
    </div>
  );
}

/* ============================== AUTH ============================== */

function NotSetUpScreen() {
  return (
    <div
      className="min-h-screen w-full flex items-center justify-center text-white p-6 text-center relative"
      style={{
        background: BG_GRADIENT,
        fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
      }}
    >
      <GlobalStyleTag />
      <BackgroundBlobs />
      <div className={`${GLASS} rounded-3xl p-8 max-w-sm relative z-10`}>
        <p className="text-3xl mb-3">🎓</p>
        <p className="text-white font-medium mb-2">Tizim hali sozlanmagan</p>
        <p className="text-white/50 text-sm">
          O'qituvchingiz hali hisobini yaratmagan. Birozdan so'ng qayta urinib
          ko'ring yoki o'qituvchingizga murojaat qiling.
        </p>
      </div>
    </div>
  );
}

function StudentLoginScreen({ appData, onLoginStudent }) {
  const [studentPhone, setStudentPhone] = useState("");
  const [studentPw, setStudentPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submitStudent() {
    setError("");
    setBusy(true);
    const normalized = normalizePhone(studentPhone);
    const hash = await hashPassword(studentPw);
    const found = appData.students.find(
      (s) =>
        s.phone &&
        normalizePhone(s.phone) === normalized &&
        s.passwordHash === hash,
    );
    setBusy(false);
    if (found) onLoginStudent(found.id);
    else setError("Telefon raqam yoki parol noto'g'ri.");
  }

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center text-white p-4 relative"
      style={{
        background: BG_GRADIENT,
        fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
      }}
    >
      <GlobalStyleTag />
      <BackgroundBlobs />
      <div
        className={`${GLASS} rounded-3xl p-6 sm:p-8 w-full max-w-sm relative z-10`}
        style={{ background: "rgba(10,20,60,0.8)" }}
      >
        <div className="text-center mb-6">
          <p className="text-3xl mb-2">🎓</p>
          <h1 className="font-display text-xl font-bold text-white">
            O'quvchi Panel
          </h1>
          <p className="text-white/50 text-xs mt-1">
            Kirish uchun ma'lumotlaringizni kiriting
          </p>
        </div>
        <div className="space-y-3">
          <div>
            <label className={LABEL_CLS}>Telefon raqam</label>
            <PhoneInput
              value={studentPhone}
              onChange={setStudentPhone}
              autoFocus
            />
          </div>
          <div className="relative">
            <label className={LABEL_CLS}>Parol</label>
            <input
              type={showPw ? "text" : "password"}
              value={studentPw}
              onChange={(e) => setStudentPw(e.target.value)}
              className={INPUT_CLS}
              onKeyDown={(e) => e.key === "Enter" && submitStudent()}
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              className="absolute right-3 top-[34px] text-white/50 hover:text-white"
            >
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {error && <p className="text-rose-300 text-xs">{error}</p>}
          <button
            onClick={submitStudent}
            disabled={busy}
            className={`${BTN_PRIMARY} w-full`}
          >
            {busy ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <LogIn size={16} />
            )}{" "}
            Kirish
          </button>
          <p className="text-white/30 text-[11px] text-center pt-1">
            Hisobingiz yo'qmi? O'qituvchingizdan so'rang.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ============================== DASHBOARD (GROUPS) — TEACHER ============================== */

/* ============================== LAYOUT ============================== */

function AppSidebar({ view, goTo, items, title }) {
  return (
    <aside className="hidden md:flex flex-col w-60 shrink-0 p-5 gap-1">
      <div className={`${GLASS} rounded-3xl p-4 mb-4`}>
        <p className="font-display text-white font-bold text-lg tracking-tight">
          {title}
        </p>
      </div>
      <div className={`${GLASS} rounded-3xl p-2 flex flex-col gap-1 flex-1`}>
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => goTo(item.id)}
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all ${view === item.id ? "bg-white/20 text-white shadow-lg" : "text-white/60 hover:bg-white/10 hover:text-white"}`}
          >
            <item.icon size={18} /> {item.label}
          </button>
        ))}
      </div>
    </aside>
  );
}

function AppBottomNav({ view, goTo, items }) {
  return (
    <nav
      className={`md:hidden fixed bottom-3 left-3 right-3 ${GLASS} rounded-3xl p-1.5 flex justify-around z-40`}
    >
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => goTo(item.id)}
          className={`flex flex-col items-center gap-0.5 px-2 py-2 rounded-2xl transition-all flex-1 ${view === item.id ? "bg-white/20 text-white" : "text-white/50"}`}
        >
          <item.icon size={18} />
          <span className="text-[9px] font-medium">{item.label}</span>
        </button>
      ))}
    </nav>
  );
}

/* ============================== STUDENT VIEWS ============================== */

function StudentTopBar({ student, appData, goTo, now, onLogout }) {
  const dayName = JS_DAY_NAMES[now.getDay()];
  const groups = getStudentGroups(appData, student.id);
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <p className="text-white/50 text-xs">
          {dayName}, {now.getDate()}-{MONTHS_UZ[now.getMonth()]},{" "}
          {now.getFullYear()}
        </p>
        <p className="text-white font-medium mt-0.5">
          Salom, {student.name}! 👋
        </p>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={onLogout} className={BTN_ICON} title="Chiqish">
          <LogOut size={16} />
        </button>
        <button onClick={() => goTo("profile")} className="shrink-0">
          <Avatar name={student.name} color={groups[0]?.color} size={42} />
        </button>
      </div>
    </div>
  );
}

function StudentHome({ appData, student, goTo }) {
  const stats = getStudentStatsAllGroups(appData, student.id);
  const myGroups = getStudentGroups(appData, student.id);
  const myGroupIds = student.groupIds;
  const myTasks = appData.tasks.filter((t) => myGroupIds.includes(t.groupId));
  const pendingCount = myTasks.filter((t) => {
    const s = t.submissions[student.id];
    return !s || s.status === "pending";
  }).length;
  const recentGraded = myTasks
    .filter((t) => t.submissions[student.id]?.status === "graded")
    .sort(
      (a, b) =>
        (b.submissions[student.id].submittedAt || 0) -
        (a.submissions[student.id].submittedAt || 0),
    )
    .slice(0, 3);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-white">
          Bosh sahifa
        </h2>
        <p className="text-white/50 text-sm mt-0.5">
          {myGroups.map((g) => g.name).join(", ") || "Guruhingiz yo'q"}
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className={`${GLASS} rounded-2xl p-4 text-center`}>
          <p className="text-amber-300 text-2xl font-bold">
            {stats.count ? stats.avg.toFixed(1) : "—"}
          </p>
          <StarRating value={stats.avg} size={13} />
          <p className="text-white/50 text-xs mt-1">O'rtacha baho</p>
        </div>
        <div className={`${GLASS} rounded-2xl p-4 text-center`}>
          <p className="text-white text-2xl font-bold">
            {stats.done}/{stats.total}
          </p>
          <p className="text-white/50 text-xs mt-1">Bajarilgan</p>
        </div>
        <div className={`${GLASS} rounded-2xl p-4 text-center`}>
          <p className="text-white text-2xl font-bold">{pendingCount}</p>
          <p className="text-white/50 text-xs mt-1">Kutilmoqda</p>
        </div>
        <div className={`${GLASS} rounded-2xl p-4 text-center`}>
          <p className="text-amber-300 text-2xl font-bold">
            {student.coins || 0}
          </p>
          <p className="text-white/50 text-xs mt-1">🪙 Coin</p>
        </div>
      </div>

      {pendingCount > 0 && (
        <button onClick={() => goTo("tasks")} className={BTN_PRIMARY}>
          <ClipboardList size={16} /> Vazifalarni ko'rish
        </button>
      )}

      {recentGraded.length > 0 && (
        <div className={`${GLASS} rounded-3xl p-5`}>
          <h3 className="font-display text-white font-semibold mb-3">
            So'nggi baholar
          </h3>
          <div className="space-y-2">
            {recentGraded.map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl p-3"
              >
                <p className="text-white text-sm truncate">{t.title}</p>
                <StarRating
                  value={t.submissions[student.id].rating}
                  size={14}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StudentTasks({ appData, student, markSubmission }) {
  const myGroupIds = student.groupIds;
  const myTasks = appData.tasks
    .filter((t) => myGroupIds.includes(t.groupId))
    .slice()
    .sort((a, b) => b.createdAt - a.createdAt);
  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-2xl font-bold text-white">
          Vazifalarim
        </h2>
      </div>
      {myTasks.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="Hozircha vazifa yo'q"
          subtitle="Ustoz vazifa berganda shu yerda ko'rinadi."
        />
      ) : (
        <div className="space-y-3">
          {myTasks.map((t) => {
            const group = appData.groups.find((g) => g.id === t.groupId);
            return (
              <StudentTaskCard
                key={t.id}
                task={t}
                group={group}
                student={student}
                markSubmission={markSubmission}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

function StudentTaskCard({ task, group, student, markSubmission }) {
  const submission = task.submissions[student.id];
  const status = submission?.status || "pending";
  const [mode, setMode] = useState(null);
  const [desc, setDesc] = useState("");
  const [attachment, setAttachment] = useState(null);
  const [uploading, setUploading] = useState(false);

  async function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      setAttachment(await processMediaFile(file));
    } catch (err) {
      console.error(err);
    }
    setUploading(false);
  }

  function handleSubmit() {
    markSubmission(task.id, student.id, {
      status: "submitted",
      description: desc,
      attachment,
      submittedAt: Date.now(),
    });
    setMode(null);
    setDesc("");
    setAttachment(null);
  }

  return (
    <div className={`${GLASS} rounded-3xl p-5 space-y-3`}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          {group && (
            <p className="text-white/40 text-xs flex items-center gap-1.5 mb-1">
              <span
                className="w-2 h-2 rounded-full"
                style={{ background: group.color }}
              />
              {group.name}
            </p>
          )}
          <h3 className="font-display text-white font-semibold truncate">
            {task.title}
          </h3>
          {task.dueDate && (
            <p className="text-white/45 text-xs mt-0.5 flex items-center gap-1">
              <Clock size={12} /> Muddat: {formatDate(task.dueDate)}
            </p>
          )}
        </div>
        {status === "pending" && (
          <span className="text-white/40 text-xs bg-white/5 border border-white/10 rounded-full px-2.5 py-1 shrink-0">
            Kutilmoqda
          </span>
        )}
        {status === "submitted" && (
          <span className="text-sky-200 text-xs bg-sky-400/10 border border-sky-300/30 rounded-full px-2.5 py-1 shrink-0">
            Tekshirilmoqda
          </span>
        )}
        {status === "graded" && (
          <span className="text-emerald-200 text-xs bg-emerald-400/10 border border-emerald-300/30 rounded-full px-2.5 py-1 shrink-0">
            Baholandi
          </span>
        )}
      </div>

      {task.description && (
        <p className="text-white/60 text-sm">{task.description}</p>
      )}
      {task.attachment &&
        task.attachment.dataUrl &&
        (task.attachment.type === "video" ? (
          <video
            src={task.attachment.dataUrl}
            controls
            className="rounded-2xl max-h-56 w-full bg-black/30"
          />
        ) : (
          <img
            src={task.attachment.dataUrl}
            alt=""
            className="rounded-2xl max-h-56 object-cover"
          />
        ))}

      {status === "pending" && mode !== "upload" && (
        <button
          onClick={() => setMode("upload")}
          className={`${BTN_PRIMARY} w-full`}
        >
          <Upload size={15} /> Ishimni topshirish
        </button>
      )}

      {status === "pending" && mode === "upload" && (
        <div className="space-y-2.5 pt-2 border-t border-white/10">
          <textarea
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="Izoh yozing (ixtiyoriy)..."
            rows={2}
            className={INPUT_CLS}
          />
          <div className="flex items-center gap-2 flex-wrap">
            <label className={`${BTN_GHOST} cursor-pointer`}>
              <input
                type="file"
                accept="image/*,video/*"
                className="hidden"
                onChange={handleFile}
              />
              {uploading ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Camera size={14} />
              )}{" "}
              {attachment ? "Fayl tanlandi" : "Rasm/video biriktirish"}
            </label>
            {attachment && (
              <span className="text-white/40 text-xs truncate">
                {attachment.name}
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setMode(null);
                setAttachment(null);
              }}
              className={`${BTN_GHOST} flex-1`}
            >
              Bekor qilish
            </button>
            <button onClick={handleSubmit} className={`${BTN_PRIMARY} flex-1`}>
              <Check size={14} /> Topshirish
            </button>
          </div>
        </div>
      )}

      {(status === "submitted" || status === "graded") && (
        <div className="pt-2 border-t border-white/10 space-y-2">
          {submission.description && (
            <p className="text-white/70 text-sm italic">
              "{submission.description}"
            </p>
          )}
          {submission.attachment &&
            submission.attachment.dataUrl &&
            (submission.attachment.type === "video" ? (
              <video
                src={submission.attachment.dataUrl}
                controls
                className="rounded-xl max-h-48 w-full bg-black/30"
              />
            ) : (
              <img
                src={submission.attachment.dataUrl}
                alt=""
                className="rounded-xl max-h-48 object-cover"
              />
            ))}
          <div className="flex items-center justify-between">
            <span className="text-white/40 text-xs">
              {formatDateTime(submission.submittedAt)}
              {submission.coinsAwarded
                ? ` · +${submission.coinsAwarded} 🪙`
                : ""}
            </span>
            {status === "graded" && (
              <StarRating value={submission.rating} size={18} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function StudentRating({ appData, student }) {
  const [metric, setMetric] = useState("star");
  const myGroups = getStudentGroups(appData, student.id);
  const [tab, setTab] = useState(myGroups[0]?.id || "");
  const activeGroup = appData.groups.find((g) => g.id === tab);

  const starList = activeGroup
    ? rankStudents(
        withGroupId(getGroupStudents(appData, activeGroup.id), activeGroup.id),
        appData.tasks,
      ).map((s) => ({ ...s, groupColor: activeGroup.color }))
    : [];

  const coinList = appData.students
    .slice()
    .sort((a, b) => (b.coins || 0) - (a.coins || 0));

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-2xl font-bold text-white">Reyting</h2>
        <p className="text-white/50 text-sm mt-0.5">Sizning o'rningiz</p>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => setMetric("star")}
          className={metric === "star" ? BTN_PRIMARY : BTN_GHOST}
        >
          ⭐ Yulduz
        </button>
        <button
          onClick={() => setMetric("coin")}
          className={metric === "coin" ? BTN_PRIMARY : BTN_GHOST}
        >
          🪙 Coin
        </button>
      </div>

      {metric === "star" && myGroups.length > 0 && (
        <select
          value={tab}
          onChange={(e) => setTab(e.target.value)}
          className={`${INPUT_CLS} sm:w-72`}
        >
          {myGroups.map((g) => (
            <option key={g.id} value={g.id} className="bg-violet-950">
              {g.name}
            </option>
          ))}
        </select>
      )}

      <div className={`${GLASS} rounded-3xl p-5`}>
        {metric === "star" ? (
          starList.length === 0 ? (
            <EmptyState icon={Trophy} title="Guruhingiz yo'q" />
          ) : (
            <div className="space-y-2">
              {starList.map((s, i) => (
                <div
                  key={s.id}
                  className={`flex items-center gap-3 border rounded-2xl p-3 ${s.id === student.id ? "bg-white/20 border-white/40" : "bg-white/5 border-white/10"}`}
                >
                  <span className="text-lg w-7 text-center shrink-0">
                    {i < 3 ? (
                      ["🥇", "🥈", "🥉"][i]
                    ) : (
                      <span className="text-white/40 text-sm">{i + 1}</span>
                    )}
                  </span>
                  <Avatar name={s.name} color={s.groupColor} size={34} />
                  <p className="text-white text-sm font-medium flex-1 truncate">
                    {s.name}
                    {s.id === student.id ? " (siz)" : ""}
                  </p>
                  <StarRating value={s.stats.avg} size={13} />
                </div>
              ))}
            </div>
          )
        ) : (
          <div className="space-y-2">
            {coinList.map((s, i) => (
              <div
                key={s.id}
                className={`flex items-center gap-3 border rounded-2xl p-3 ${s.id === student.id ? "bg-white/20 border-white/40" : "bg-white/5 border-white/10"}`}
              >
                <span className="text-lg w-7 text-center shrink-0">
                  {i < 3 ? (
                    ["🥇", "🥈", "🥉"][i]
                  ) : (
                    <span className="text-white/40 text-sm">{i + 1}</span>
                  )}
                </span>
                <Avatar name={s.name} color={myGroups[0]?.color} size={34} />
                <p className="text-white text-sm font-medium flex-1 truncate">
                  {s.name}
                  {s.id === student.id ? " (siz)" : ""}
                </p>
                <p className="text-amber-300 font-bold text-sm">
                  {s.coins || 0} 🪙
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StudentSchedule({ appData, student }) {
  const myGroups = getStudentGroups(appData, student.id);
  const myPostponed = appData.postponed.filter((p) =>
    student.groupIds.includes(p.groupId),
  );
  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-2xl font-bold text-white">
          Dars jadvali
        </h2>
      </div>
      {myGroups.length === 0 ? (
        <EmptyState icon={Calendar} title="Guruhingiz yo'q" />
      ) : (
        myGroups.map((group) => (
          <div key={group.id} className={`${GLASS} rounded-3xl p-5`}>
            <div className="flex items-center gap-2 mb-3">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ background: group.color }}
              />
              <h3 className="font-display text-white font-semibold">
                {group.name}
              </h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {WEEK_DAYS.map((d) => (
                <div
                  key={d}
                  className={`text-xs px-3 py-2 rounded-xl border ${group.days.includes(d) ? "text-white" : "text-white/30 border-white/5"}`}
                  style={
                    group.days.includes(d)
                      ? {
                          background: group.color + "33",
                          borderColor: group.color + "66",
                        }
                      : {}
                  }
                >
                  {d}
                  {group.days.includes(d) && ` · ${group.time}`}
                </div>
              ))}
            </div>
          </div>
        ))
      )}
      {myPostponed.length > 0 && (
        <div className={`${GLASS} rounded-3xl p-5`}>
          <h3 className="font-display text-white font-semibold mb-3 flex items-center gap-2">
            <CalendarClock size={18} /> Ko'chirilgan darslar
          </h3>
          <div className="space-y-2">
            {myPostponed.map((p) => (
              <div
                key={p.id}
                className="bg-white/5 border border-white/10 rounded-xl p-3"
              >
                <p className="text-white/70 text-xs">
                  <span className="line-through">
                    {formatDate(p.originalDate)}
                  </span>{" "}
                  →{" "}
                  <span className="text-emerald-200">
                    {formatDate(p.newDate)}
                  </span>
                </p>
                {p.note && (
                  <p className="text-white/40 text-xs italic mt-0.5">
                    {p.note}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StudentProfile({ appData, student, updateStudent }) {
  const myGroups = getStudentGroups(appData, student.id);
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState(false);

  async function changePassword() {
    setError("");
    setSuccess("");
    if (!currentPw || !newPw || !confirmPw) {
      setError("Barcha maydonlarni to'ldiring.");
      return;
    }
    setBusy(true);
    const hash = await hashPassword(currentPw);
    if (hash !== student.passwordHash) {
      setBusy(false);
      setError("Joriy parol noto'g'ri.");
      return;
    }
    if (newPw !== confirmPw) {
      setBusy(false);
      setError("Yangi parollar mos emas.");
      return;
    }
    if (newPw.length < 4) {
      setBusy(false);
      setError("Parol kamida 4 belgidan iborat bo'lsin.");
      return;
    }
    const newHash = await hashPassword(newPw);
    updateStudent(student.id, { passwordHash: newHash });
    setBusy(false);
    setSuccess("Parol yangilandi.");
    setCurrentPw("");
    setNewPw("");
    setConfirmPw("");
  }

  return (
    <div className="space-y-5 max-w-xl">
      <div>
        <h2 className="font-display text-2xl font-bold text-white">Profil</h2>
      </div>

      <div className={`${GLASS} rounded-3xl p-6 flex items-center gap-4`}>
        <Avatar name={student.name} color={myGroups[0]?.color} size={72} />
        <div className="min-w-0">
          <p className="font-display text-white text-lg font-bold truncate">
            {student.name}
          </p>
          <p className="text-white/60 text-sm truncate">
            {myGroups.map((g) => g.name).join(", ")}
          </p>
          <p className="text-white/40 text-xs mt-1 flex items-center gap-1">
            <Phone size={11} /> {displayPhone(student.phone)}
          </p>
          <p className="text-amber-300 text-sm mt-1">{student.coins || 0} 🪙</p>
        </div>
      </div>

      <div className="space-y-3">
        <ProfileCategory icon={Lock} title="Parolni o'zgartirish">
          <div>
            <label className={LABEL_CLS}>Joriy parol</label>
            <input
              type={showPw ? "text" : "password"}
              value={currentPw}
              onChange={(e) => setCurrentPw(e.target.value)}
              className={INPUT_CLS}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={LABEL_CLS}>Yangi parol</label>
              <input
                type={showPw ? "text" : "password"}
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
                className={INPUT_CLS}
              />
            </div>
            <div>
              <label className={LABEL_CLS}>Yangi parolni takrorlang</label>
              <input
                type={showPw ? "text" : "password"}
                value={confirmPw}
                onChange={(e) => setConfirmPw(e.target.value)}
                className={INPUT_CLS}
              />
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowPw((v) => !v)}
            className={BTN_GHOST}
          >
            {showPw ? <EyeOff size={14} /> : <Eye size={14} />} Parolni{" "}
            {showPw ? "yashirish" : "ko'rsatish"}
          </button>
          {error && <p className="text-rose-300 text-xs">{error}</p>}
          {success && <p className="text-emerald-300 text-xs">{success}</p>}
          <button
            onClick={changePassword}
            disabled={busy}
            className={BTN_PRIMARY}
          >
            Parolni saqlash
          </button>
        </ProfileCategory>
      </div>
    </div>
  );
}

/* ============================== ROOT APP ============================== */

export default function App() {
  const [appData, setAppData] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("home");
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await loadStudentData();
        if (!cancelled) setAppData(data.appData || seedData());
        if (!cancelled) setSession(data.session || null);
      } catch (e) {
        if (!cancelled) {
          setAppData(seedData());
          setSession(null);
        }
      }
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (loading || !appData) return;
    const t = setTimeout(async () => {
      try {
        await persistStudentAppData(appData);
      } catch (e) {
        console.error("Saqlashda xatolik:", e);
      }
    }, 700);
    return () => clearTimeout(t);
  }, [appData, loading]);

  useEffect(() => {
    if (loading) return;
    (async () => {
      try {
        await persistStudentSession(session);
      } catch (e) {
        console.error("Saqlashda xatolik:", e);
      }
    })();
  }, [session, loading]);

  function addNotification(message) {
    const id = generateId("n");
    setNotifications((prev) => [...prev, { id, message }]);
    setTimeout(
      () => setNotifications((prev) => prev.filter((n) => n.id !== id)),
      5000,
    );
  }

  function loginAsStudent(studentId) {
    setSession({ studentId });
    setView("home");
  }
  function logout() {
    setSession(null);
    setView("home");
  }

  function markSubmission(taskId, studentId, data) {
    const task = appData.tasks.find((t) => t.id === taskId);
    if (!task) return;
    const group = appData.groups.find((g) => g.id === task.groupId);
    const students = group ? getGroupStudents(appData, group.id) : [];
    const prevSub = task.submissions[studentId] || {};

    const newSub = { ...prevSub, ...data };
    let coinDelta = 0;
    if (data.rating !== undefined && data.rating !== null) {
      const oldCoins = prevSub.coinsAwarded || 0;
      const newCoins = appData.coinSettings[String(data.rating)] ?? 0;
      newSub.coinsAwarded = newCoins;
      coinDelta = newCoins - oldCoins;
    }
    const newSubmissions = { ...task.submissions, [studentId]: newSub };

    setAppData((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) =>
        t.id === taskId ? { ...t, submissions: newSubmissions } : t,
      ),
      students:
        coinDelta !== 0
          ? prev.students.map((s) =>
              s.id === studentId
                ? { ...s, coins: (s.coins || 0) + coinDelta }
                : s,
            )
          : prev.students,
    }));

    if (data.status === "submitted")
      addNotification(`"${task.title}" topshirildi.`);
  }

  function updateStudent(studentId, patch) {
    setAppData((prev) => ({
      ...prev,
      students: prev.students.map((s) =>
        s.id === studentId ? { ...s, ...patch } : s,
      ),
    }));
  }

  if (loading || !appData) return <LoadingScreen />;
  if (!appData.teacher) return <NotSetUpScreen />;
  if (!session)
    return (
      <StudentLoginScreen appData={appData} onLoginStudent={loginAsStudent} />
    );

  const now = new Date();
  const student = appData.students.find((s) => s.id === session.studentId);

  if (!student) {
    return (
      <div
        className="min-h-screen w-full flex items-center justify-center text-white p-6 text-center relative"
        style={{ background: BG_GRADIENT }}
      >
        <GlobalStyleTag />
        <div className={`${GLASS} rounded-3xl p-8 max-w-sm relative z-10`}>
          <p className="mb-4">
            Hisobingiz topilmadi. Ustoz sizni o'chirgan bo'lishi mumkin.
          </p>
          <button onClick={logout} className={BTN_PRIMARY}>
            Chiqish
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen w-full text-white relative"
      style={{
        background: BG_GRADIENT,
        fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
      }}
    >
      <GlobalStyleTag />
      <BackgroundBlobs />
      <div className="relative z-10 flex min-h-screen">
        <AppSidebar
          view={view}
          goTo={setView}
          items={STUDENT_NAV_ITEMS}
          title="🎓 O'quvchi paneli"
        />
        <main className="flex-1 p-4 md:p-8 pb-28 md:pb-8 max-w-5xl mx-auto w-full">
          <StudentTopBar
            student={student}
            appData={appData}
            goTo={setView}
            now={now}
            onLogout={logout}
          />
          {view === "home" && (
            <StudentHome appData={appData} student={student} goTo={setView} />
          )}
          {view === "tasks" && (
            <StudentTasks
              appData={appData}
              student={student}
              markSubmission={markSubmission}
            />
          )}
          {view === "rating" && (
            <StudentRating appData={appData} student={student} />
          )}
          {view === "schedule" && (
            <StudentSchedule appData={appData} student={student} />
          )}
          {view === "profile" && (
            <StudentProfile
              appData={appData}
              student={student}
              updateStudent={updateStudent}
            />
          )}
        </main>
        <AppBottomNav view={view} goTo={setView} items={STUDENT_NAV_ITEMS} />
      </div>
      <NotificationStack
        notifications={notifications}
        onDismiss={(id) =>
          setNotifications((prev) => prev.filter((n) => n.id !== id))
        }
      />
    </div>
  );
}
