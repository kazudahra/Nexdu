import { useState, useEffect } from 'react';
import {
  Users, Trophy, ClipboardList, Calendar, User, Star, Plus, X, Check,
  Clock, ChevronRight, Pencil, Trash2, Upload, Eye, EyeOff, Bell,
  Loader2, Camera, Lock, UserPlus, Sparkles, CalendarClock, ArrowLeft,
  Home, LogOut, Phone, LogIn,
} from 'lucide-react';

/* ============================== CONSTANTS ============================== */

const WEEK_DAYS = ['Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba', 'Yakshanba'];
const JS_DAY_NAMES = ['Yakshanba', 'Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba'];
const MONTHS_UZ = ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr'];
const GROUP_COLORS = ['#f43f5e', '#f59e0b', '#10b981', '#0ea5e9', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#84cc16'];
const MAX_STORE_CHARS = 900000;
const APP_DATA_KEY = 'school-app-data-v3';
const SESSION_KEY = 'school-session-v3';
const DIRECTOR_DATA_KEY = 'director-data-v2'; // read-only: course catalog + HR permissions managed in the Director panel
const BG_GRADIENT = 'linear-gradient(160deg, #1e1b4b 0%, #4c1d95 35%, #7e22ce 55%, #831843 75%, #1e1b4b 100%)';

const DEMO_STUDENT_HASH = '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4';
const DEMO_TEACHER_HASH = 'a203ba4e9c565ec07ecedc94a54194aa0b237cf65203aca0e1bd420c93f2cc28';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Guruhlarim', icon: Users },
  { id: 'rating', label: 'Reyting', icon: Trophy },
  { id: 'tasks', label: 'Faoliyat', icon: ClipboardList },
  { id: 'schedule', label: 'Dars jadvali', icon: Calendar },
  { id: 'profile', label: 'Profil', icon: User },
];

const STUDENT_NAV_ITEMS = [
  { id: 'home', label: 'Bosh sahifa', icon: Home },
  { id: 'tasks', label: 'Vazifalarim', icon: ClipboardList },
  { id: 'rating', label: 'Reyting', icon: Trophy },
  { id: 'schedule', label: 'Dars jadvali', icon: Calendar },
  { id: 'profile', label: 'Profil', icon: User },
];

/* ============================== STYLE TOKENS ============================== */

const GLASS = "bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl shadow-black/10";
const GLASS_SOFT = "bg-white/5 backdrop-blur-lg border border-white/10";
const INPUT_CLS = "w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-4 py-2.5 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-fuchsia-300/50 focus:bg-white/15 transition-all text-sm";
const LABEL_CLS = "block text-xs font-medium text-white/60 mb-1.5 uppercase tracking-wide";
const BTN_PRIMARY = "bg-gradient-to-r from-fuchsia-500/80 to-violet-500/80 hover:from-fuchsia-500 hover:to-violet-500 backdrop-blur-md border border-white/30 text-white font-medium rounded-xl px-4 py-2.5 transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 text-sm disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100";
const BTN_GHOST = "bg-white/5 hover:bg-white/15 backdrop-blur-md border border-white/10 text-white/80 hover:text-white rounded-xl px-4 py-2 transition-all text-sm flex items-center justify-center gap-2";
const BTN_ICON = "w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center transition-all text-white/70 hover:text-white shrink-0";

/* ============================== UTILITIES ============================== */

function generateId(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  if (isNaN(d.getTime())) return dateStr;
  return `${d.getDate()}-${MONTHS_UZ[d.getMonth()]}, ${d.getFullYear()}`;
}

function formatDateTime(ts) {
  if (!ts) return '';
  const d = new Date(ts);
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${d.getDate()}-${MONTHS_UZ[d.getMonth()]}, ${hh}:${mm}`;
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function initials(name) {
  return (name || '?').trim().split(/\s+/).map(p => p[0]).slice(0, 2).join('').toUpperCase();
}

function nextGroupColor(groups) {
  return GROUP_COLORS[groups.length % GROUP_COLORS.length];
}

function withGroupId(students, groupId) {
  return students.map(s => ({ ...s, groupId }));
}

function normalizePhone(p) {
  return (p || '').replace(/\D/g, '');
}

function displayPhone(local) {
  if (!local) return 'kiritilmagan';
  return '+998 ' + local;
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

function getGroupStudents(appData, groupId) {
  return appData.students.filter(s => s.groupIds.includes(groupId));
}

function getStudentGroups(appData, studentId) {
  const student = appData.students.find(s => s.id === studentId);
  if (!student) return [];
  return appData.groups.filter(g => student.groupIds.includes(g.id));
}

function getStudentStats(tasks, studentId, groupId) {
  let sum = 0, count = 0, done = 0, total = 0;
  tasks.forEach(t => {
    if (t.groupId !== groupId) return;
    total += 1;
    const sub = t.submissions[studentId];
    if (sub && (sub.status === 'submitted' || sub.status === 'graded')) done += 1;
    if (sub && sub.status === 'graded' && sub.rating) { sum += sub.rating; count += 1; }
  });
  return { avg: count ? sum / count : 0, count, done, total };
}

function getStudentStatsAllGroups(appData, studentId) {
  const student = appData.students.find(s => s.id === studentId);
  const groupIds = student ? student.groupIds : [];
  let sum = 0, count = 0, done = 0, total = 0;
  appData.tasks.forEach(t => {
    if (!groupIds.includes(t.groupId)) return;
    total += 1;
    const sub = t.submissions[studentId];
    if (sub && (sub.status === 'submitted' || sub.status === 'graded')) done += 1;
    if (sub && sub.status === 'graded' && sub.rating) { sum += sub.rating; count += 1; }
  });
  return { avg: count ? sum / count : 0, count, done, total };
}

function getAttendanceStats(attendance, studentId, groupIds) {
  let present = 0, total = 0;
  attendance.forEach(a => {
    if (!groupIds.includes(a.groupId)) return;
    if (a.records[studentId] !== undefined) {
      total += 1;
      if (a.records[studentId] === 'present') present += 1;
    }
  });
  return { present, total };
}

function rankStudents(students, tasks) {
  return students
    .map(s => ({ ...s, stats: getStudentStats(tasks, s.id, s.groupId) }))
    .sort((a, b) => {
      if (b.stats.avg !== a.stats.avg) return b.stats.avg - a.stats.avg;
      if (b.stats.count !== a.stats.count) return b.stats.count - a.stats.count;
      return a.name.localeCompare(b.name);
    });
}

function allStudentsFlat(appData) {
  const list = [];
  appData.groups.forEach(g => {
    getGroupStudents(appData, g.id).forEach(s => list.push({ ...s, groupId: g.id, groupName: g.name, groupColor: g.color }));
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
  const start = new Date(startDate + 'T00:00:00');
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
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(img.width * scale));
      canvas.height = Math.max(1, Math.round(img.height * scale));
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = reject;
    img.src = dataUrl;
  });
}

async function processMediaFile(file) {
  const isVideo = file.type.startsWith('video/');
  const rawDataUrl = await readFileAsDataURL(file);
  if (isVideo) {
    return { dataUrl: rawDataUrl, type: 'video', name: file.name, tooLargeToStore: rawDataUrl.length > MAX_STORE_CHARS };
  }
  let finalUrl = rawDataUrl;
  if (finalUrl.length > MAX_STORE_CHARS) {
    try { finalUrl = await compressImageDataUrl(rawDataUrl, 700, 0.6); } catch (e) { /* keep raw */ }
  }
  if (finalUrl.length > MAX_STORE_CHARS) {
    try { finalUrl = await compressImageDataUrl(rawDataUrl, 450, 0.45); } catch (e) { /* keep raw */ }
  }
  return { dataUrl: finalUrl, type: 'image', name: file.name, tooLargeToStore: finalUrl.length > MAX_STORE_CHARS };
}

/* ============================== SEED / PERSISTENCE ============================== */

function seedData() {
  const now = Date.now();
  return {
    teacher: { name: 'Ustoz', subject: 'Matematika', phone: '901234500', passwordHash: DEMO_TEACHER_HASH, color: '#8b5cf6', photo: null },
    students: [
      { id: 'st-1', name: 'Sardor Aliyev', phone: '901234501', birthDate: '2012-03-14', parentName: 'Botir Aliyev', parentPhone: '901234511', passwordHash: DEMO_STUDENT_HASH, groupIds: ['g-demo-1'], coins: 2 },
      { id: 'st-2', name: 'Malika Yusupova', phone: '901234502', parentPhone: '901234512', passwordHash: DEMO_STUDENT_HASH, groupIds: ['g-demo-1'], coins: 0 },
      { id: 'st-3', name: 'Jasur Tursunov', phone: '901234503', parentPhone: '901234513', passwordHash: DEMO_STUDENT_HASH, groupIds: ['g-demo-1', 'g-demo-2'], coins: 0 },
      { id: 'st-4', name: 'Dilnoza Rashidova', phone: '901234504', parentPhone: '901234514', passwordHash: DEMO_STUDENT_HASH, groupIds: ['g-demo-1'], coins: 0 },
      { id: 'st-5', name: 'Aziz Karimov', phone: '901234505', parentPhone: '901234515', passwordHash: DEMO_STUDENT_HASH, groupIds: ['g-demo-2'], coins: 0 },
      { id: 'st-6', name: 'Nilufar Egamova', phone: '901234506', parentPhone: '901234516', passwordHash: DEMO_STUDENT_HASH, groupIds: ['g-demo-2'], coins: 0 },
      { id: 'st-7', name: 'Bekzod Nazarov', phone: '901234507', parentPhone: '901234517', passwordHash: DEMO_STUDENT_HASH, groupIds: ['g-demo-2'], coins: 0 },
    ],
    groups: [
      { id: 'g-demo-1', name: 'Matematika - A guruh', color: '#f43f5e', days: ['Dushanba', 'Chorshanba', 'Juma'], time: '15:00', courseId: null, startDate: '2026-05-04' },
      { id: 'g-demo-2', name: "Ingliz tili - B guruh", color: '#0ea5e9', days: ['Seshanba', 'Payshanba'], time: '17:00', courseId: null, startDate: '2026-05-05' },
    ],
    tasks: [
      {
        id: 't-demo-1', groupId: 'g-demo-1', title: "5-bob: Tenglamalar",
        description: "Darslikning 45-betidagi barcha misollarni yeching.",
        attachment: null, dueDate: todayISO(), createdAt: now - 86400000 * 2,
        submissions: {
          'st-1': { status: 'graded', description: 'Bajardim, barchasi tayyor.', attachment: null, rating: 5, coinsAwarded: 2, submittedAt: now - 80000000 },
          'st-2': { status: 'submitted', description: 'Hammasini yechdim.', attachment: null, rating: null, submittedAt: now - 40000000 },
        },
      },
      {
        id: 't-demo-2', groupId: 'g-demo-1', title: "7-bob: Kasrlar",
        description: "Daftaringizga 10 ta misol yeching va rasmga tushirib yuboring.",
        attachment: null, dueDate: todayISO(), createdAt: now - 3600000,
        submissions: {},
      },
    ],
    attendance: [],
    coinSettings: { '5': 2, '4': 1, '3': 0, '2': 0, '1': 0 },
    postponed: [],
  };
}

function sanitizeForStorage(appData) {
  const clone = JSON.parse(JSON.stringify(appData));
  (clone.tasks || []).forEach(t => {
    if (t.attachment && t.attachment.tooLargeToStore) t.attachment.dataUrl = null;
    Object.values(t.submissions || {}).forEach(s => {
      if (s.attachment && s.attachment.tooLargeToStore) s.attachment.dataUrl = null;
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
      <div className="absolute -top-20 -left-20 w-96 h-96 rounded-full blur-3xl opacity-30" style={{ background: '#8b5cf6', animation: 'float1 18s ease-in-out infinite' }} />
      <div className="absolute top-1/3 -right-32 w-96 h-96 rounded-full blur-3xl opacity-30" style={{ background: '#ec4899', animation: 'float2 22s ease-in-out infinite' }} />
      <div className="absolute -bottom-32 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-25" style={{ background: '#0ea5e9', animation: 'float3 20s ease-in-out infinite' }} />
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center text-white" style={{ background: BG_GRADIENT }}>
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
      {stars.map(s => (
        <button
          key={s}
          type="button"
          disabled={!interactive}
          onClick={() => interactive && onChange && onChange(s)}
          className={interactive ? "cursor-pointer transition-transform hover:scale-125" : "cursor-default"}
        >
          <Star size={size} className={s <= Math.round(value) ? "fill-amber-300 text-amber-300" : "fill-transparent text-white/25"} />
        </button>
      ))}
    </div>
  );
}

function Avatar({ name, color = '#8b5cf6', size = 40, photo, onClick }) {
  const style = { width: size, height: size, minWidth: size };
  if (photo) {
    return <img src={photo} alt={name} style={style} onClick={onClick} className={`rounded-full object-cover border-2 border-white/30 ${onClick ? 'cursor-pointer' : ''}`} />;
  }
  return (
    <div
      style={{ ...style, background: `linear-gradient(135deg, ${color}, ${color}99)`, fontSize: size * 0.38 }}
      onClick={onClick}
      className={`font-display rounded-full flex items-center justify-center font-bold text-white border-2 border-white/30 shrink-0 ${onClick ? 'cursor-pointer hover:scale-105 transition-transform' : ''}`}
    >
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
      <div
        onClick={e => e.stopPropagation()}
        className={`${GLASS} rounded-3xl p-5 sm:p-6 w-full ${wide ? 'max-w-2xl' : 'max-w-md'} max-h-[85vh] overflow-y-auto`}
        style={{ background: 'linear-gradient(160deg, rgba(76,29,149,0.75), rgba(131,24,67,0.7))' }}
      >
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
      <div onClick={e => e.stopPropagation()} className={`${GLASS} rounded-3xl p-6 w-full max-w-sm`} style={{ background: 'linear-gradient(160deg, rgba(76,29,149,0.85), rgba(131,24,67,0.8))' }}>
        <p className="text-white mb-5">{message}</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className={`${BTN_GHOST} flex-1`}>Yo'q, bekor</button>
          <button onClick={onConfirm} className="flex-1 bg-rose-500/80 hover:bg-rose-500 border border-white/30 text-white rounded-xl px-4 py-2 text-sm transition-all">Ha, tasdiqlash</button>
        </div>
      </div>
    </div>
  );
}

function NotificationStack({ notifications, onDismiss }) {
  if (!notifications.length) return null;
  return (
    <div className="fixed top-4 right-4 left-4 sm:left-auto z-[70] flex flex-col gap-2 sm:w-96">
      {notifications.map(n => (
        <div key={n.id} className={`${GLASS} rounded-2xl p-3.5 flex items-start gap-3`} style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.9), rgba(236,72,153,0.8))', animation: 'fadeIn 0.3s ease' }}>
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
      <button onClick={() => setOpen(o => !o)} className="w-full flex items-center justify-between p-4 text-left">
        <span className="text-white font-medium text-sm flex items-center gap-2">{Icon && <Icon size={16} />} {title}</span>
        <ChevronRight size={16} className={`text-white/50 transition-transform shrink-0 ${open ? 'rotate-90' : ''}`} />
      </button>
      {open && <div className="px-4 pb-4 space-y-4 border-t border-white/10 pt-4">{children}</div>}
    </div>
  );
}

/* ============================== LOGIN SCREEN ============================== */

function LoginScreen({ appData, onLoginTeacher, onLoginStudent }) {
  const [roleTab, setRoleTab] = useState('teacher');
  const [teacherPhone, setTeacherPhone] = useState('');
  const [password, setPassword] = useState('');
  const [studentPhone, setStudentPhone] = useState('');
  const [studentPw, setStudentPw] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submitTeacher() {
    setError(''); setBusy(true);
    const hash = await hashPassword(password);
    setBusy(false);
    if (normalizePhone(teacherPhone) === normalizePhone(appData.teacher.phone) && hash === appData.teacher.passwordHash) onLoginTeacher();
    else setError("Telefon raqam yoki parol noto'g'ri.");
  }

  async function submitStudent() {
    setError(''); setBusy(true);
    const normalized = normalizePhone(studentPhone);
    const hash = await hashPassword(studentPw);
    const found = appData.students.find(s => s.phone && normalizePhone(s.phone) === normalized && s.passwordHash === hash);
    setBusy(false);
    if (found) onLoginStudent(found.id);
    else setError("Telefon raqam yoki parol noto'g'ri.");
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center text-white p-4 relative" style={{ background: BG_GRADIENT, fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif" }}>
      <GlobalStyleTag />
      <BackgroundBlobs />
      <div className={`${GLASS} rounded-3xl p-6 sm:p-8 w-full max-w-sm relative z-10`} style={{ background: 'linear-gradient(160deg, rgba(76,29,149,0.7), rgba(131,24,67,0.65))' }}>
        <div className="text-center mb-6">
          <p className="text-3xl mb-2">📚</p>
          <h1 className="font-display text-xl font-bold text-white">Ustoz Panel</h1>
          <p className="text-white/50 text-xs mt-1">Kirish uchun ma'lumotlaringizni kiriting</p>
        </div>

        <div className="flex gap-2 mb-5 bg-white/5 border border-white/10 rounded-2xl p-1">
          <button onClick={() => { setRoleTab('teacher'); setError(''); }} className={`flex-1 text-sm py-2 rounded-xl transition-all ${roleTab === 'teacher' ? 'bg-white/20 text-white' : 'text-white/50'}`}>O'qituvchi</button>
          <button onClick={() => { setRoleTab('student'); setError(''); }} className={`flex-1 text-sm py-2 rounded-xl transition-all ${roleTab === 'student' ? 'bg-white/20 text-white' : 'text-white/50'}`}>O'quvchi</button>
        </div>

        {roleTab === 'teacher' ? (
          <div className="space-y-3">
            <div>
              <label className={LABEL_CLS}>Telefon raqam</label>
              <PhoneInput value={teacherPhone} onChange={setTeacherPhone} autoFocus />
            </div>
            <div className="relative">
              <label className={LABEL_CLS}>Parol</label>
              <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} className={INPUT_CLS} onKeyDown={e => e.key === 'Enter' && submitTeacher()} />
              <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-3 top-[34px] text-white/50 hover:text-white">{showPw ? <EyeOff size={16} /> : <Eye size={16} />}</button>
            </div>
            {error && <p className="text-rose-300 text-xs">{error}</p>}
            <button onClick={submitTeacher} disabled={busy} className={`${BTN_PRIMARY} w-full`}>{busy ? <Loader2 size={16} className="animate-spin" /> : <LogIn size={16} />} Kirish</button>
            <p className="text-white/30 text-[11px] text-center pt-1">Namuna: +998 90 123 45 00 / parol123</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <label className={LABEL_CLS}>Telefon raqam</label>
              <PhoneInput value={studentPhone} onChange={setStudentPhone} autoFocus />
            </div>
            <div className="relative">
              <label className={LABEL_CLS}>Parol</label>
              <input type={showPw ? 'text' : 'password'} value={studentPw} onChange={e => setStudentPw(e.target.value)} className={INPUT_CLS} onKeyDown={e => e.key === 'Enter' && submitStudent()} />
              <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-3 top-[34px] text-white/50 hover:text-white">{showPw ? <EyeOff size={16} /> : <Eye size={16} />}</button>
            </div>
            {error && <p className="text-rose-300 text-xs">{error}</p>}
            <button onClick={submitStudent} disabled={busy} className={`${BTN_PRIMARY} w-full`}>{busy ? <Loader2 size={16} className="animate-spin" /> : <LogIn size={16} />} Kirish</button>
            <p className="text-white/30 text-[11px] text-center pt-1">Namuna: +998 90 123 45 01 / 1234</p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================== DASHBOARD (GROUPS) — TEACHER ============================== */

function DashboardView({ appData, openModal, setSelectedGroupId, selectedGroupId, courses, canCreateGroups }) {
  const { groups, tasks } = appData;
  const group = selectedGroupId ? groups.find(g => g.id === selectedGroupId) : null;

  if (group) {
    return <GroupDetail appData={appData} group={group} openModal={openModal} onBack={() => setSelectedGroupId(null)} courses={courses} />;
  }

  const flatStudents = allStudentsFlat(appData);
  const overallTop = rankStudents(flatStudents, tasks).slice(0, 3);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold text-white">Guruhlarim</h2>
          <p className="text-white/50 text-sm mt-0.5">{groups.length} ta guruh, jami {appData.students.length} o'quvchi</p>
        </div>
        {canCreateGroups && <button onClick={() => openModal({ type: 'addGroup' })} className={BTN_PRIMARY}><Plus size={16} /> Yangi guruh</button>}
      </div>

      {!canCreateGroups && (
        <div className={`${GLASS_SOFT} rounded-2xl p-3.5`}>
          <p className="text-white/50 text-xs">Yangi guruh yaratish uchun direktor/menejerdan ruxsat so'rang.</p>
        </div>
      )}

      {overallTop.length > 0 && (
        <div className={`${GLASS} rounded-3xl p-5`}>
          <div className="flex items-center gap-2 mb-4">
            <Sparkles size={18} className="text-amber-300" />
            <h3 className="font-display text-white font-semibold">Eng yaxshi o'quvchilar — barcha guruhlar bo'yicha</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {overallTop.map((s, i) => (
              <div key={s.id + s.groupId} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-3">
                <span className="text-2xl">{['🥇', '🥈', '🥉'][i]}</span>
                <Avatar name={s.name} color={s.groupColor} size={40} onClick={() => openModal({ type: 'studentDetail', studentId: s.id, groupId: s.groupId })} />
                <div className="min-w-0 flex-1">
                  <p className="text-white text-sm font-medium truncate">{s.name}</p>
                  <p className="text-white/50 text-xs truncate">{s.groupName}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-amber-300 font-bold text-sm">{s.stats.count ? s.stats.avg.toFixed(1) : '—'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {groups.length === 0 ? (
        <EmptyState icon={Users} title="Hali guruh yo'q" subtitle="Birinchi guruhingizni yarating va o'quvchilarni qo'shing." action={canCreateGroups ? <button onClick={() => openModal({ type: 'addGroup' })} className={BTN_PRIMARY}><Plus size={16} /> Guruh yaratish</button> : null} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {groups.map(g => (
            <GroupCard
              key={g.id}
              appData={appData}
              group={g}
              onOpen={() => setSelectedGroupId(g.id)}
              onAddStudent={() => openModal({ type: 'addStudent', groupId: g.id })}
              onStudentClick={sid => openModal({ type: 'studentDetail', studentId: sid, groupId: g.id })}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function GroupCard({ appData, group, onOpen, onAddStudent, onStudentClick }) {
  const students = getGroupStudents(appData, group.id);
  const top3 = rankStudents(withGroupId(students, group.id), appData.tasks).slice(0, 3);
  return (
    <div className={`${GLASS} rounded-3xl p-5 flex flex-col gap-4`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-3 h-3 rounded-full shrink-0" style={{ background: group.color }} />
          <div className="min-w-0">
            <h3 className="font-display text-white font-semibold truncate cursor-pointer hover:underline" onClick={onOpen}>{group.name}</h3>
            <p className="text-white/45 text-xs truncate">{group.days.length ? group.days.join(', ') : 'Kunlar belgilanmagan'} {group.time && `· ${group.time}`}</p>
          </div>
        </div>
        <span className="bg-white/10 border border-white/20 rounded-full px-2.5 py-1 text-xs text-white/70 shrink-0">{students.length} o'quvchi</span>
      </div>

      {top3.length === 0 ? (
        <p className="text-white/40 text-sm py-2">O'quvchi yo'q</p>
      ) : (
        <div className="space-y-2">
          {top3.map((s, i) => (
            <div key={s.id} className="flex items-center gap-2.5 cursor-pointer hover:bg-white/5 rounded-xl p-1.5 -m-1.5 transition-colors" onClick={() => onStudentClick(s.id)}>
              <span className="text-sm w-5 text-center shrink-0">{['🥇', '🥈', '🥉'][i]}</span>
              <Avatar name={s.name} color={group.color} size={30} />
              <p className="text-white/90 text-sm truncate flex-1">{s.name}</p>
              <span className="text-amber-300 text-xs font-semibold shrink-0">{s.stats.count ? s.stats.avg.toFixed(1) : '—'}</span>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2 pt-1">
        <button onClick={onAddStudent} className={`${BTN_GHOST} flex-1`}><UserPlus size={15} /> O'quvchi qo'shish</button>
        <button onClick={onOpen} className={`${BTN_GHOST} flex-1`}>Barchasi <ChevronRight size={15} /></button>
      </div>
    </div>
  );
}

function GroupDetail({ appData, group, openModal, onBack, courses }) {
  const students = getGroupStudents(appData, group.id);
  const ranked = rankStudents(withGroupId(students, group.id), appData.tasks);
  const course = (courses || []).find(c => c.id === group.courseId);
  const lessonsSoFar = group.startDate ? countClassDaysSince(group.days, group.startDate) : null;
  const expectedTotal = course && course.durationMonths ? Math.round(course.durationMonths * 4.33 * (group.days.length || 0)) : null;
  return (
    <div className="space-y-5">
      <button onClick={onBack} className={BTN_GHOST}><ArrowLeft size={15} /> Orqaga</button>
      <div className={`${GLASS} rounded-3xl p-5`}>
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-full" style={{ background: group.color }} />
            <div>
              <h2 className="font-display text-xl font-bold text-white">{group.name}</h2>
              <p className="text-white/50 text-sm">{group.days.length ? group.days.join(', ') : 'Kunlar belgilanmagan'} {group.time && `· soat ${group.time}`}</p>
              {course && <p className="text-white/40 text-xs mt-1">📚 Kurs: {course.name}</p>}
              {lessonsSoFar !== null && (
                <p className="text-white/40 text-xs mt-0.5">
                  {formatDate(group.startDate)}dan buyon <span className="text-white/70 font-medium">{lessonsSoFar}</span> ta dars o'tildi{expectedTotal ? ` (taxminan ${expectedTotal} tadan)` : ''}
                </p>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => openModal({ type: 'addStudent', groupId: group.id })} className={BTN_PRIMARY}><UserPlus size={15} /> O'quvchi qo'shish</button>
            <button onClick={() => openModal({ type: 'confirm', message: `"${group.name}" guruhini o'chirasizmi? Bog'liq barcha vazifalar ham o'chib ketadi.`, action: { kind: 'deleteGroup', groupId: group.id } })} className={BTN_ICON}><Trash2 size={16} /></button>
          </div>
        </div>
      </div>

      <div className={`${GLASS} rounded-3xl p-5`}>
        <h3 className="font-display text-white font-semibold mb-4">O'quvchilar reytingi</h3>
        {ranked.length === 0 ? (
          <p className="text-white/40 text-sm">Bu guruhda hali o'quvchi yo'q.</p>
        ) : (
          <div className="space-y-2">
            {ranked.map((s, i) => (
              <div key={s.id} className="flex items-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl p-3 cursor-pointer transition-colors" onClick={() => openModal({ type: 'studentDetail', studentId: s.id, groupId: group.id })}>
                <span className="text-white/40 text-sm w-5 text-center shrink-0">{i + 1}</span>
                <Avatar name={s.name} color={group.color} size={36} />
                <div className="min-w-0 flex-1">
                  <p className="text-white text-sm font-medium truncate">{s.name}</p>
                  <p className="text-white/40 text-xs">{s.stats.done}/{s.stats.total} vazifa bajarilgan{s.groupIds.length > 1 ? ` · ${s.groupIds.length} guruhda` : ''}</p>
                </div>
                <div className="text-right shrink-0">
                  <StarRating value={s.stats.avg} size={13} />
                  <p className="text-amber-300 text-xs font-semibold mt-0.5">{s.stats.count ? s.stats.avg.toFixed(1) : 'baholanmagan'}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================== RATING VIEW — TEACHER ============================== */

function RatingView({ appData, openModal }) {
  const { groups, tasks } = appData;
  const [metric, setMetric] = useState('star');
  const [tab, setTab] = useState('all');
  const activeGroup = tab !== 'all' ? groups.find(g => g.id === tab) : null;

  const starList = tab === 'all'
    ? rankStudents(allStudentsFlat(appData), tasks)
    : rankStudents(withGroupId(getGroupStudents(appData, activeGroup?.id), activeGroup?.id), tasks).map(s => ({ ...s, groupColor: activeGroup?.color, groupName: activeGroup?.name }));

  const coinList = appData.students.slice().sort((a, b) => (b.coins || 0) - (a.coins || 0));

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-2xl font-bold text-white">Reyting</h2>
        <p className="text-white/50 text-sm mt-0.5">O'quvchilarning umumiy natijalari</p>
      </div>

      <div className="flex gap-2">
        <button onClick={() => setMetric('star')} className={metric === 'star' ? BTN_PRIMARY : BTN_GHOST}>⭐ Yulduz reytingi</button>
        <button onClick={() => setMetric('coin')} className={metric === 'coin' ? BTN_PRIMARY : BTN_GHOST}>🪙 Coin reytingi</button>
      </div>

      {metric === 'star' && (
        <select value={tab} onChange={e => setTab(e.target.value)} className={`${INPUT_CLS} sm:w-72`}>
          <option value="all" className="bg-violet-950">Barcha guruhlar</option>
          {groups.map(g => <option key={g.id} value={g.id} className="bg-violet-950">{g.name}</option>)}
        </select>
      )}

      <div className={`${GLASS} rounded-3xl p-5`}>
        {metric === 'star' ? (
          starList.length === 0 ? (
            <EmptyState icon={Trophy} title="Hozircha reyting yo'q" subtitle="Guruhga o'quvchi qo'shing va vazifalarni baholang." />
          ) : (
            <div className="space-y-2">
              {starList.map((s, i) => (
                <div key={s.id + (s.groupId || '')} className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl p-3">
                  <span className="text-lg w-7 text-center shrink-0">{i < 3 ? ['🥇', '🥈', '🥉'][i] : <span className="text-white/40 text-sm">{i + 1}</span>}</span>
                  <Avatar name={s.name} color={s.groupColor} size={36} onClick={() => openModal({ type: 'studentDetail', studentId: s.id, groupId: s.groupId })} />
                  <div className="min-w-0 flex-1">
                    <p className="text-white text-sm font-medium truncate">{s.name}</p>
                    {tab === 'all' && <p className="text-white/40 text-xs truncate">{s.groupName}</p>}
                  </div>
                  <div className="text-right shrink-0">
                    <StarRating value={s.stats.avg} size={13} />
                    <p className="text-amber-300 text-xs font-semibold mt-0.5">{s.stats.count ? `${s.stats.avg.toFixed(1)} (${s.stats.count} baho)` : 'baholanmagan'}</p>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          coinList.length === 0 ? (
            <EmptyState icon={Trophy} title="Hozircha o'quvchi yo'q" subtitle="Guruhga o'quvchi qo'shing." />
          ) : (
            <div className="space-y-2">
              {coinList.map((s, i) => {
                const sg = getStudentGroups(appData, s.id);
                return (
                  <div key={s.id} className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl p-3">
                    <span className="text-lg w-7 text-center shrink-0">{i < 3 ? ['🥇', '🥈', '🥉'][i] : <span className="text-white/40 text-sm">{i + 1}</span>}</span>
                    <Avatar name={s.name} color={sg[0]?.color} size={36} onClick={() => sg[0] && openModal({ type: 'studentDetail', studentId: s.id, groupId: sg[0].id })} />
                    <div className="min-w-0 flex-1">
                      <p className="text-white text-sm font-medium truncate">{s.name}</p>
                      <p className="text-white/40 text-xs truncate">{sg.map(g => g.name).join(', ') || 'Guruhsiz'}</p>
                    </div>
                    <p className="text-amber-300 font-bold text-sm shrink-0">{s.coins || 0} 🪙</p>
                  </div>
                );
              })}
            </div>
          )
        )}
      </div>
    </div>
  );
}

/* ============================== TASKS + ATTENDANCE VIEW — TEACHER ============================== */

function TasksView({ appData, openModal, markSubmission, markAttendance, selectedTaskId, setSelectedTaskId }) {
  const [section, setSection] = useState('tasks');
  const { groups, tasks } = appData;
  const task = selectedTaskId ? tasks.find(t => t.id === selectedTaskId) : null;

  if (task) {
    const group = groups.find(g => g.id === task.groupId);
    return <TaskDetail task={task} group={group} appData={appData} openModal={openModal} markSubmission={markSubmission} onBack={() => setSelectedTaskId(null)} />;
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold text-white">{section === 'tasks' ? 'Vazifalar' : 'Davomat'}</h2>
          <p className="text-white/50 text-sm mt-0.5">{section === 'tasks' ? 'Uyga vazifalar va topshiriqlar' : "Kelgan-kelmaganini belgilang"}</p>
        </div>
        {section === 'tasks' && <button onClick={() => openModal({ type: 'createTask' })} disabled={groups.length === 0} className={BTN_PRIMARY}><Plus size={16} /> Yangi vazifa</button>}
      </div>

      <div className="flex gap-2 bg-white/5 border border-white/10 rounded-2xl p-1 w-fit">
        <button onClick={() => setSection('tasks')} className={`text-sm px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${section === 'tasks' ? 'bg-white/20 text-white' : 'text-white/50'}`}><ClipboardList size={14} /> Vazifalar</button>
        <button onClick={() => setSection('attendance')} className={`text-sm px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${section === 'attendance' ? 'bg-white/20 text-white' : 'text-white/50'}`}><Calendar size={14} /> Davomat</button>
      </div>

      {section === 'tasks' ? (
        groups.length === 0 ? (
          <EmptyState icon={ClipboardList} title="Avval guruh yarating" subtitle="Vazifa berish uchun kamida bitta guruh kerak." />
        ) : tasks.length === 0 ? (
          <EmptyState icon={ClipboardList} title="Hali vazifa yo'q" subtitle="Birinchi vazifangizni yarating." action={<button onClick={() => openModal({ type: 'createTask' })} className={BTN_PRIMARY}><Plus size={16} /> Vazifa yaratish</button>} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {tasks.slice().sort((a, b) => b.createdAt - a.createdAt).map(t => {
              const group = groups.find(g => g.id === t.groupId);
              return <TaskCard key={t.id} task={t} group={group} appData={appData} onOpen={() => setSelectedTaskId(t.id)} />;
            })}
          </div>
        )
      ) : (
        <AttendanceSection appData={appData} markAttendance={markAttendance} />
      )}
    </div>
  );
}

function AttendanceSection({ appData, markAttendance }) {
  const [groupId, setGroupId] = useState(appData.groups[0]?.id || '');
  const group = appData.groups.find(g => g.id === groupId);
  const classDates = group ? getClassDates(group) : [];
  const [date, setDate] = useState(classDates.includes(todayISO()) ? todayISO() : (classDates[0] || ''));

  useEffect(() => {
    const g = appData.groups.find(x => x.id === groupId);
    const dates = g ? getClassDates(g) : [];
    setDate(dates.includes(todayISO()) ? todayISO() : (dates[0] || ''));
    // eslint-disable-next-line
  }, [groupId]);

  const students = group ? getGroupStudents(appData, group.id) : [];
  const record = appData.attendance.find(a => a.groupId === groupId && a.date === date);
  const presentCount = students.filter(s => record?.records[s.id] === 'present').length;

  if (appData.groups.length === 0) {
    return <EmptyState icon={Calendar} title="Avval guruh yarating" subtitle="Davomat olish uchun kamida bitta guruh kerak." />;
  }

  return (
    <div className="space-y-5">
      <div className={`${GLASS} rounded-3xl p-5 space-y-3`}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className={LABEL_CLS}>Guruh</label>
            <select value={groupId} onChange={e => setGroupId(e.target.value)} className={INPUT_CLS}>
              {appData.groups.map(g => <option key={g.id} value={g.id} className="bg-violet-950">{g.name}</option>)}
            </select>
          </div>
          <div>
            <label className={LABEL_CLS}>Dars kuni</label>
            {classDates.length === 0 ? (
              <p className="text-white/40 text-xs py-2.5">Bu guruhga hali kunlar belgilanmagan — Dars jadvali bo'limidan sozlang.</p>
            ) : (
              <select value={date} onChange={e => setDate(e.target.value)} className={INPUT_CLS}>
                {classDates.map(d => {
                  const isToday = d === todayISO();
                  const dow = WEEK_DAYS[(new Date(d + 'T00:00:00').getDay() + 6) % 7];
                  return <option key={d} value={d} className="bg-violet-950">{isToday ? 'Bugun — ' : ''}{dow}, {formatDate(d)}</option>;
                })}
              </select>
            )}
          </div>
        </div>
        {students.length > 0 && date && <p className="text-white/50 text-xs">{presentCount}/{students.length} keldi</p>}
      </div>

      {students.length === 0 ? (
        <EmptyState icon={Users} title="Bu guruhda o'quvchi yo'q" subtitle="Avval o'quvchi qo'shing." />
      ) : !date ? null : (
        <div className="space-y-2">
          {students.map(s => {
            const status = record?.records[s.id] || null;
            return (
              <div key={s.id} className={`${GLASS_SOFT} rounded-2xl p-3.5 flex items-center gap-3`}>
                <Avatar name={s.name} color={group.color} size={36} />
                <p className="text-white text-sm font-medium flex-1 truncate">{s.name}</p>
                <div className="flex gap-1.5">
                  <button onClick={() => markAttendance(groupId, date, s.id, 'present')} className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${status === 'present' ? 'bg-emerald-400/30 border-emerald-300/50 text-emerald-100' : 'bg-white/5 border-white/10 text-white/40'}`}>Keldi</button>
                  <button onClick={() => markAttendance(groupId, date, s.id, 'absent')} className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${status === 'absent' ? 'bg-rose-400/30 border-rose-300/50 text-rose-100' : 'bg-white/5 border-white/10 text-white/40'}`}>Kelmadi</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function TaskCard({ task, group, appData, onOpen }) {
  const students = group ? getGroupStudents(appData, group.id) : [];
  const total = students.length;
  const done = students.filter(s => { const sub = task.submissions[s.id]; return sub && (sub.status === 'submitted' || sub.status === 'graded'); }).length;
  const graded = students.filter(s => task.submissions[s.id]?.status === 'graded').length;
  const complete = total > 0 && done === total;
  const pct = total ? Math.round((done / total) * 100) : 0;

  return (
    <div onClick={onOpen} className={`${GLASS} rounded-3xl p-5 cursor-pointer hover:bg-white/15 transition-colors space-y-3`}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="font-display text-white font-semibold truncate">{task.title}</h3>
          <p className="text-white/45 text-xs mt-0.5 truncate">{group?.name || "Guruh o'chirilgan"}</p>
        </div>
        {complete && <span className="bg-emerald-400/20 border border-emerald-300/40 text-emerald-200 text-xs px-2.5 py-1 rounded-full shrink-0">Tekshirish vaqti</span>}
      </div>
      {task.description && <p className="text-white/60 text-sm line-clamp-2">{task.description}</p>}
      <div>
        <div className="flex items-center justify-between text-xs text-white/50 mb-1.5">
          <span>{done}/{total} topshirdi · {graded} baholandi</span>
          {task.dueDate && <span className="flex items-center gap-1"><Clock size={12} /> {formatDate(task.dueDate)}</span>}
        </div>
        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-fuchsia-400 to-violet-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
        </div>
      </div>
    </div>
  );
}

function TaskDetail({ task, group, appData, openModal, markSubmission, onBack }) {
  if (!group) {
    return (
      <div className="space-y-5">
        <button onClick={onBack} className={BTN_GHOST}><ArrowLeft size={15} /> Orqaga</button>
        <EmptyState icon={ClipboardList} title="Guruh topilmadi" subtitle="Bu vazifaning guruhi o'chirilgan bo'lishi mumkin." />
      </div>
    );
  }
  const students = getGroupStudents(appData, group.id);
  const done = students.filter(s => { const sub = task.submissions[s.id]; return sub && (sub.status === 'submitted' || sub.status === 'graded'); }).length;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className={BTN_GHOST}><ArrowLeft size={15} /> Orqaga</button>
        <button onClick={() => openModal({ type: 'confirm', message: `"${task.title}" vazifasini o'chirasizmi?`, action: { kind: 'deleteTask', taskId: task.id } })} className={BTN_ICON}><Trash2 size={16} /></button>
      </div>

      <div className={`${GLASS} rounded-3xl p-5`}>
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: group.color }} />
          <span className="text-white/60 text-sm">{group.name}</span>
        </div>
        <h2 className="font-display text-xl font-bold text-white">{task.title}</h2>
        {task.description && <p className="text-white/70 text-sm mt-2">{task.description}</p>}
        {task.attachment && task.attachment.dataUrl && (
          task.attachment.type === 'video'
            ? <video src={task.attachment.dataUrl} controls className="mt-3 rounded-2xl max-h-64 w-full bg-black/30" />
            : <img src={task.attachment.dataUrl} alt="" className="mt-3 rounded-2xl max-h-64 object-cover" />
        )}
        <div className="flex items-center gap-4 mt-3 text-xs text-white/50">
          {task.dueDate && <span className="flex items-center gap-1"><Clock size={12} /> Muddat: {formatDate(task.dueDate)}</span>}
          <span>{done}/{students.length} topshirdi</span>
        </div>
      </div>

      <div className="space-y-3">
        {students.map(s => (
          <SubmissionRow key={s.id} student={s} group={group} taskId={task.id} submission={task.submissions[s.id]} markSubmission={markSubmission} />
        ))}
      </div>
    </div>
  );
}

function SubmissionRow({ student, group, taskId, submission, markSubmission }) {
  const status = submission?.status || 'pending';
  return (
    <div className={`${GLASS_SOFT} rounded-2xl p-4`}>
      <div className="flex items-center gap-3">
        <Avatar name={student.name} color={group.color} size={36} />
        <p className="text-white text-sm font-medium flex-1 truncate">{student.name}</p>
        {status === 'pending' && <span className="text-white/40 text-xs bg-white/5 border border-white/10 rounded-full px-2.5 py-1">Kutilmoqda</span>}
        {status === 'submitted' && <span className="text-sky-200 text-xs bg-sky-400/10 border border-sky-300/30 rounded-full px-2.5 py-1">Baholash kerak</span>}
        {status === 'graded' && <span className="text-emerald-200 text-xs bg-emerald-400/10 border border-emerald-300/30 rounded-full px-2.5 py-1">Baholandi</span>}
      </div>

      {status === 'pending' && <p className="text-white/40 text-xs mt-2">O'quvchi hali topshirmagan.</p>}

      {(status === 'submitted' || status === 'graded') && (
        <div className="mt-3 space-y-2.5">
          {submission.description && <p className="text-white/70 text-sm">{submission.description}</p>}
          {submission.attachment && (
            submission.attachment.dataUrl
              ? (submission.attachment.type === 'video'
                  ? <video src={submission.attachment.dataUrl} controls className="rounded-xl max-h-56 w-full bg-black/30" />
                  : <img src={submission.attachment.dataUrl} alt="" className="rounded-xl max-h-56 object-cover" />)
              : <p className="text-white/40 text-xs italic">Fayl juda katta edi, saqlanmadi.</p>
          )}
          <div className="flex items-center justify-between pt-1 flex-wrap gap-2">
            <span className="text-white/40 text-xs">{formatDateTime(submission.submittedAt)}{submission.coinsAwarded ? ` · +${submission.coinsAwarded} 🪙` : ''}</span>
            <StarRating value={submission.rating || 0} interactive size={22} onChange={r => markSubmission(taskId, student.id, { rating: r, status: 'graded' })} />
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================== SCHEDULE VIEW — TEACHER ============================== */

function ScheduleView({ appData, updateGroupSchedule, openModal, removePostponed }) {
  const { groups, postponed } = appData;
  const [editingId, setEditingId] = useState(null);
  const weekDates = getCurrentWeekDates();

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold text-white">Dars jadvali</h2>
          <p className="text-white/50 text-sm mt-0.5">Haftalik dars kunlari va ko'chirilgan darslar</p>
        </div>
        <button onClick={() => openModal({ type: 'postponeLesson' })} disabled={groups.length === 0} className={BTN_PRIMARY}><CalendarClock size={16} /> Darsni ko'chirish</button>
      </div>

      {groups.length === 0 ? (
        <EmptyState icon={Calendar} title="Avval guruh yarating" subtitle="Jadval yaratish uchun kamida bitta guruh kerak." />
      ) : (
        <div className={`${GLASS} rounded-3xl p-5 overflow-x-auto`}>
          <div className="min-w-[560px]">
            <div className="grid grid-cols-8 gap-1.5 mb-2">
              <div />
              {WEEK_DAYS.map((d, i) => (
                <div key={d} className="text-white/50 text-xs text-center font-medium leading-tight">
                  {d.slice(0, 3)}<br /><span className="text-white/30">{weekDates[i]}</span>
                </div>
              ))}
            </div>
            {groups.map(g => (
              <div key={g.id} className="grid grid-cols-8 gap-1.5 mb-1.5 items-center">
                <div className="text-white text-xs truncate pr-1 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ background: g.color }} />{g.name}
                </div>
                {WEEK_DAYS.map(d => (
                  <div key={d} className="h-8 rounded-lg flex items-center justify-center text-[10px] font-medium" style={g.days.includes(d) ? { background: g.color + '33', border: `1px solid ${g.color}66`, color: 'white' } : { background: 'rgba(255,255,255,0.04)' }}>
                    {g.days.includes(d) ? g.time : ''}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-3">
        {groups.map(g => (
          <div key={g.id} className={`${GLASS_SOFT} rounded-2xl p-4`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: g.color }} />
                <p className="text-white text-sm font-medium">{g.name}</p>
              </div>
              <button onClick={() => setEditingId(editingId === g.id ? null : g.id)} className={BTN_ICON}><Pencil size={14} /></button>
            </div>
            {editingId === g.id && (
              <GroupScheduleEditor group={g} onSave={(days, time) => { updateGroupSchedule(g.id, days, time); setEditingId(null); }} onCancel={() => setEditingId(null)} />
            )}
          </div>
        ))}
      </div>

      {postponed.length > 0 && (
        <div className={`${GLASS} rounded-3xl p-5`}>
          <h3 className="font-display text-white font-semibold mb-3 flex items-center gap-2"><CalendarClock size={18} /> Ko'chirilgan darslar</h3>
          <div className="space-y-2">
            {postponed.slice().sort((a, b) => new Date(b.newDate) - new Date(a.newDate)).map(p => {
              const g = groups.find(x => x.id === p.groupId);
              return (
                <div key={p.id} className="flex items-center justify-between gap-2 bg-white/5 border border-white/10 rounded-xl p-3">
                  <div className="min-w-0">
                    <p className="text-white text-sm truncate">{g?.name || "Guruh o'chirilgan"}</p>
                    <p className="text-white/50 text-xs"><span className="line-through">{formatDate(p.originalDate)}</span> → <span className="text-emerald-200">{formatDate(p.newDate)}</span></p>
                    {p.note && <p className="text-white/40 text-xs mt-0.5 italic truncate">{p.note}</p>}
                  </div>
                  <button onClick={() => removePostponed(p.id)} className={BTN_ICON}><X size={14} /></button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function GroupScheduleEditor({ group, onSave, onCancel }) {
  const [days, setDays] = useState(group.days);
  const [time, setTime] = useState(group.time || '15:00');
  function toggleDay(d) { setDays(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]); }
  return (
    <div className="mt-3 pt-3 border-t border-white/10 space-y-3">
      <div className="flex flex-wrap gap-1.5">
        {WEEK_DAYS.map(d => (
          <button key={d} onClick={() => toggleDay(d)} className={`text-xs px-2.5 py-1.5 rounded-lg border transition-all ${days.includes(d) ? 'bg-white/25 border-white/40 text-white' : 'bg-white/5 border-white/10 text-white/50'}`}>{d}</button>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <label className="text-white/60 text-xs">Vaqt:</label>
        <input type="time" value={time} onChange={e => setTime(e.target.value)} className={`${INPUT_CLS} w-auto`} />
      </div>
      <div className="flex gap-2">
        <button onClick={onCancel} className={`${BTN_GHOST} flex-1`}>Bekor qilish</button>
        <button onClick={() => onSave(days, time)} className={`${BTN_PRIMARY} flex-1`}>Saqlash</button>
      </div>
    </div>
  );
}

function PostponeModal({ groups, onAdd, onClose }) {
  const [groupId, setGroupId] = useState(groups[0]?.id || '');
  const [originalDate, setOriginalDate] = useState(todayISO());
  const [newDate, setNewDate] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  function submit() {
    if (!groupId || !originalDate || !newDate) { setError("Guruh va ikkala sanani ham to'ldiring."); return; }
    onAdd({ groupId, originalDate, newDate, note });
    onClose();
  }

  return (
    <Modal title="Darsni ko'chirish" onClose={onClose}>
      <div className="space-y-4">
        <div>
          <label className={LABEL_CLS}>Guruh</label>
          <select value={groupId} onChange={e => setGroupId(e.target.value)} className={INPUT_CLS}>
            {groups.map(g => <option key={g.id} value={g.id} className="bg-violet-950">{g.name}</option>)}
          </select>
        </div>
        <div>
          <label className={LABEL_CLS}>Eski sana</label>
          <input type="date" value={originalDate} onChange={e => setOriginalDate(e.target.value)} className={INPUT_CLS} />
        </div>
        <div>
          <label className={LABEL_CLS}>Yangi sana</label>
          <input type="date" value={newDate} onChange={e => setNewDate(e.target.value)} className={INPUT_CLS} />
        </div>
        <div>
          <label className={LABEL_CLS}>Izoh (ixtiyoriy)</label>
          <input type="text" value={note} onChange={e => setNote(e.target.value)} placeholder="Masalan: bayram sababli" className={INPUT_CLS} />
        </div>
        {error && <p className="text-rose-300 text-xs">{error}</p>}
        <button onClick={submit} className={`${BTN_PRIMARY} w-full`}><CalendarClock size={15} /> Ko'chirish</button>
      </div>
    </Modal>
  );
}

/* ============================== PROFILE VIEW — TEACHER ============================== */

function ProfileView({ teacher, updateTeacher, openModal }) {
  const [form, setForm] = useState({ name: teacher.name, subject: teacher.subject, color: teacher.color, photo: teacher.photo, phone: teacher.phone });
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [saved, setSaved] = useState(false);
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState('');

  useEffect(() => { setForm({ name: teacher.name, subject: teacher.subject, color: teacher.color, photo: teacher.photo, phone: teacher.phone }); }, [teacher]);

  async function handlePhoto(e) {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const raw = await readFileAsDataURL(file);
      const compressed = await compressImageDataUrl(raw, 300, 0.75);
      setForm(f => ({ ...f, photo: compressed }));
    } catch (err) { console.error(err); }
  }

  function saveProfile() {
    updateTeacher({ ...teacher, ...form });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function changePassword() {
    setPwError(''); setPwSuccess('');
    if (!currentPw || !newPw || !confirmPw) { setPwError("Barcha maydonlarni to'ldiring."); return; }
    const hash = await hashPassword(currentPw);
    if (hash !== teacher.passwordHash) { setPwError("Joriy parol noto'g'ri."); return; }
    if (newPw !== confirmPw) { setPwError("Yangi parollar mos emas."); return; }
    if (newPw.length < 4) { setPwError("Parol kamida 4 belgidan iborat bo'lsin."); return; }
    const newHash = await hashPassword(newPw);
    updateTeacher({ ...teacher, passwordHash: newHash });
    setPwSuccess('Parol yangilandi.');
    setCurrentPw(''); setNewPw(''); setConfirmPw('');
  }

  return (
    <div className="space-y-5 max-w-xl">
      <div>
        <h2 className="font-display text-2xl font-bold text-white">Profil</h2>
      </div>

      <div className={`${GLASS} rounded-3xl p-6 flex items-center gap-4`}>
        <Avatar name={teacher.name} color={teacher.color} photo={teacher.photo} size={72} />
        <div className="min-w-0">
          <p className="font-display text-white text-lg font-bold truncate">{teacher.name}</p>
          <p className="text-white/60 text-sm truncate">{teacher.subject}</p>
          <p className="text-white/40 text-xs mt-1 flex items-center gap-1"><Phone size={11} /> {displayPhone(teacher.phone)}</p>
        </div>
      </div>

      <div className="space-y-3">
        <ProfileCategory icon={Pencil} title="Profilni tahrirlash">
          <div className="flex items-center gap-4">
            <Avatar name={form.name} color={form.color} photo={form.photo} size={56} />
            <label className={`${BTN_GHOST} cursor-pointer inline-flex`}>
              <input type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
              <Camera size={14} /> Rasm yuklash
            </label>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={LABEL_CLS}>Ism</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className={INPUT_CLS} />
            </div>
            <div>
              <label className={LABEL_CLS}>Fan</label>
              <input value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} className={INPUT_CLS} />
            </div>
          </div>
          <div>
            <label className={LABEL_CLS}>Telefon raqam</label>
            <PhoneInput value={form.phone} onChange={p => setForm(f => ({ ...f, phone: p }))} />
          </div>
          <div>
            <label className={LABEL_CLS}>Rang</label>
            <div className="flex gap-2 flex-wrap">
              {GROUP_COLORS.map(c => (
                <button key={c} onClick={() => setForm(f => ({ ...f, color: c }))} className={`w-8 h-8 rounded-full border-2 transition-all ${form.color === c ? 'border-white scale-110' : 'border-white/20'}`} style={{ background: c }} />
              ))}
            </div>
          </div>
          <button onClick={saveProfile} className={BTN_PRIMARY}>{saved ? <><Check size={15} /> Saqlandi</> : "Saqlash"}</button>
        </ProfileCategory>

        <ProfileCategory icon={Lock} title="Parolni o'zgartirish">
          <div>
            <label className={LABEL_CLS}>Joriy parol</label>
            <input type={showPw ? 'text' : 'password'} value={currentPw} onChange={e => setCurrentPw(e.target.value)} className={INPUT_CLS} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={LABEL_CLS}>Yangi parol</label>
              <input type={showPw ? 'text' : 'password'} value={newPw} onChange={e => setNewPw(e.target.value)} className={INPUT_CLS} />
            </div>
            <div>
              <label className={LABEL_CLS}>Yangi parolni takrorlang</label>
              <input type={showPw ? 'text' : 'password'} value={confirmPw} onChange={e => setConfirmPw(e.target.value)} className={INPUT_CLS} />
            </div>
          </div>
          <button type="button" onClick={() => setShowPw(v => !v)} className={BTN_GHOST}>{showPw ? <EyeOff size={14} /> : <Eye size={14} />} Parolni {showPw ? 'yashirish' : "ko'rsatish"}</button>
          {pwError && <p className="text-rose-300 text-xs">{pwError}</p>}
          {pwSuccess && <p className="text-emerald-300 text-xs">{pwSuccess}</p>}
          <button onClick={changePassword} className={BTN_PRIMARY}>Parolni saqlash</button>
        </ProfileCategory>

        <ProfileCategory title="🪙 Coin tizimi sozlamalari">
          <p className="text-white/50 text-xs">Har bir yulduz bahoga nechta coin berilishini belgilang.</p>
          <button onClick={() => openModal({ type: 'coinSettings' })} className={BTN_PRIMARY}>Sozlamalarni ochish</button>
        </ProfileCategory>
      </div>
    </div>
  );
}

/* ============================== COIN SETTINGS MODAL ============================== */

function CoinSettingsModal({ coinSettings, onSave, onClose }) {
  const [values, setValues] = useState(coinSettings);
  function submit() { onSave(values); onClose(); }
  return (
    <Modal title="🪙 Coin sozlamalari" onClose={onClose}>
      <div className="space-y-4">
        <p className="text-white/50 text-xs">Har bir yulduz bahoga nechta coin berilishini belgilang. O'zgartirish faqat keyingi baholarga ta'sir qiladi.</p>
        {[5, 4, 3, 2, 1].map(star => (
          <div key={star} className="flex items-center gap-3">
            <div className="w-24 shrink-0"><StarRating value={star} size={15} /></div>
            <span className="text-white/40 text-xs">=</span>
            <input
              type="number" min="0" value={values[String(star)] ?? 0}
              onChange={e => setValues(v => ({ ...v, [String(star)]: Math.max(0, parseInt(e.target.value) || 0) }))}
              className={`${INPUT_CLS} w-20`}
            />
            <span className="text-white/50 text-sm">🪙</span>
          </div>
        ))}
        <button onClick={submit} className={`${BTN_PRIMARY} w-full`}>Saqlash</button>
      </div>
    </Modal>
  );
}

/* ============================== STUDENT DETAIL MODAL — TEACHER SIDE ============================== */

function StudentDetailModal({ studentId, groupId, appData, openModal, onClose, updateStudent }) {
  const student = appData.students.find(s => s.id === studentId);
  const group = appData.groups.find(g => g.id === groupId);
  const [resetMode, setResetMode] = useState(false);
  const [newPw, setNewPw] = useState('');
  const [resetBusy, setResetBusy] = useState(false);
  const [resetDone, setResetDone] = useState(false);

  if (!student || !group) {
    return <Modal title="O'quvchi" onClose={onClose}><p className="text-white/60 text-sm">O'quvchi topilmadi.</p></Modal>;
  }
  const stats = getStudentStats(appData.tasks, studentId, groupId);
  const attStats = getAttendanceStats(appData.attendance, studentId, student.groupIds);
  const myGroups = getStudentGroups(appData, studentId);
  const history = appData.tasks
    .filter(t => t.groupId === groupId && t.submissions[studentId] && t.submissions[studentId].status !== 'pending')
    .sort((a, b) => (b.submissions[studentId].submittedAt || 0) - (a.submissions[studentId].submittedAt || 0));

  async function doReset() {
    if (newPw.length < 4) return;
    setResetBusy(true);
    const hash = await hashPassword(newPw);
    updateStudent(studentId, { passwordHash: hash });
    setResetBusy(false);
    setResetDone(true);
    setNewPw('');
    setTimeout(() => { setResetMode(false); setResetDone(false); }, 1200);
  }

  return (
    <Modal title="O'quvchi profili" onClose={onClose} wide>
      <div className="flex items-center gap-4 mb-5">
        <Avatar name={student.name} color={group.color} size={56} />
        <div className="flex-1 min-w-0">
          <p className="text-white font-semibold truncate">{student.name}</p>
          <p className="text-white/50 text-sm truncate">{myGroups.map(g => g.name).join(', ')}</p>
          <p className="text-white/40 text-xs mt-0.5 flex items-center gap-1"><Phone size={11} /> {displayPhone(student.phone)}</p>
          {student.birthDate && <p className="text-white/40 text-xs mt-0.5">🎂 {formatDate(student.birthDate)}</p>}
          {(student.parentName || student.parentPhone) && <p className="text-white/40 text-xs mt-0.5 flex items-center gap-1"><Phone size={11} /> Ota-ona: {student.parentName || ''} {student.parentPhone ? displayPhone(student.parentPhone) : ''}</p>}
        </div>
        <div className="text-right shrink-0">
          <p className="text-amber-300 font-bold text-lg">{stats.count ? stats.avg.toFixed(1) : '—'}</p>
          <StarRating value={stats.avg} size={14} />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-5">
        <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
          <p className="text-white text-lg font-bold">{stats.done}/{stats.total}</p>
          <p className="text-white/50 text-xs">Vazifa</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
          <p className="text-white text-lg font-bold">{attStats.total ? `${attStats.present}/${attStats.total}` : '—'}</p>
          <p className="text-white/50 text-xs">Davomat</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
          <p className="text-amber-300 text-lg font-bold">{student.coins || 0} 🪙</p>
          <p className="text-white/50 text-xs">Coin</p>
        </div>
      </div>

      <p className="text-white/70 text-sm font-medium mb-2">Tarix ({group.name})</p>
      {history.length === 0 ? (
        <p className="text-white/40 text-sm">Hali topshirilgan vazifa yo'q.</p>
      ) : (
        <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
          {history.map(t => {
            const sub = t.submissions[studentId];
            return (
              <div key={t.id} className="bg-white/5 border border-white/10 rounded-xl p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-white text-sm truncate">{t.title}</p>
                  {sub.rating ? <StarRating value={sub.rating} size={13} /> : <span className="text-white/40 text-xs">baholanmagan</span>}
                </div>
                <p className="text-white/40 text-xs mt-1">{formatDateTime(sub.submittedAt)}</p>
              </div>
            );
          })}
        </div>
      )}

      <div className="border-t border-white/10 mt-5 pt-4 space-y-2">
        {!resetMode ? (
          <button onClick={() => setResetMode(true)} className={`${BTN_GHOST} w-full`}><Lock size={14} /> Parolni tiklash</button>
        ) : (
          <div className="space-y-2">
            <input value={newPw} onChange={e => setNewPw(e.target.value)} placeholder="Yangi parol (kamida 4 belgi)" className={INPUT_CLS} />
            <div className="flex gap-2">
              <button onClick={() => setResetMode(false)} className={`${BTN_GHOST} flex-1`}>Bekor qilish</button>
              <button onClick={doReset} disabled={resetBusy || newPw.length < 4} className={`${BTN_PRIMARY} flex-1`}>{resetDone ? <Check size={14} /> : 'Saqlash'}</button>
            </div>
          </div>
        )}
        <button onClick={() => openModal({ type: 'confirm', message: `${student.name}ni "${group.name}" guruhidan chiqarasizmi?`, action: { kind: 'removeFromGroup', groupId, studentId } })} className={`${BTN_GHOST} w-full text-rose-200 hover:text-rose-100`}>
          <Trash2 size={14} /> Guruhdan chiqarish
        </button>
      </div>
    </Modal>
  );
}

/* ============================== ADD/CREATE MODALS ============================== */

function AddGroupModal({ groups, courses, onAdd, onClose }) {
  const [name, setName] = useState('');
  const [color, setColor] = useState(nextGroupColor(groups));
  const [courseId, setCourseId] = useState('');
  const [days, setDays] = useState([]);
  const [time, setTime] = useState('15:00');
  const [startDate, setStartDate] = useState(todayISO());
  const [error, setError] = useState('');

  function toggleDay(d) { setDays(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]); }

  function selectCourse(id) {
    setCourseId(id);
    const course = (courses || []).find(c => c.id === id);
    if (course) {
      setDays(course.days || []);
      setTime(course.time || '15:00');
      if (!name.trim()) setName(course.name);
    }
  }

  function submit() {
    if (!name.trim()) { setError("Guruh nomini kiriting."); return; }
    onAdd({ id: generateId('g'), name: name.trim(), color, days, time, courseId: courseId || null, startDate });
    onClose();
  }

  return (
    <Modal title="Yangi guruh" onClose={onClose}>
      <div className="space-y-4">
        {courses && courses.length > 0 && (
          <div>
            <label className={LABEL_CLS}>Kurs (tanlasangiz kun/soat avtomat to'ldiriladi)</label>
            <select value={courseId} onChange={e => selectCourse(e.target.value)} className={INPUT_CLS}>
              <option value="" className="bg-violet-950">— Kursiz (qo'lda sozlayman) —</option>
              {courses.map(c => <option key={c.id} value={c.id} className="bg-violet-950">{c.name}</option>)}
            </select>
          </div>
        )}
        <div>
          <label className={LABEL_CLS}>Guruh nomi</label>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Masalan: Matematika - A guruh" className={INPUT_CLS} autoFocus />
        </div>
        <div>
          <label className={LABEL_CLS}>Rang</label>
          <div className="flex gap-2 flex-wrap">
            {GROUP_COLORS.map(c => <button key={c} onClick={() => setColor(c)} className={`w-7 h-7 rounded-full border-2 ${color === c ? 'border-white scale-110' : 'border-white/20'}`} style={{ background: c }} />)}
          </div>
        </div>
        <div>
          <label className={LABEL_CLS}>Dars kunlari</label>
          <div className="flex flex-wrap gap-1.5">
            {WEEK_DAYS.map(d => <button key={d} onClick={() => toggleDay(d)} className={`text-xs px-2.5 py-1.5 rounded-lg border ${days.includes(d) ? 'bg-white/25 border-white/40 text-white' : 'bg-white/5 border-white/10 text-white/50'}`}>{d}</button>)}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={LABEL_CLS}>Vaqt</label>
            <input type="time" value={time} onChange={e => setTime(e.target.value)} className={INPUT_CLS} />
          </div>
          <div>
            <label className={LABEL_CLS}>Boshlanish sanasi</label>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className={INPUT_CLS} />
          </div>
        </div>
        {error && <p className="text-rose-300 text-xs">{error}</p>}
        <button onClick={submit} className={`${BTN_PRIMARY} w-full`}><Plus size={16} /> Guruh yaratish</button>
      </div>
    </Modal>
  );
}

function AddStudentModal({ groupId, appData, onAddNew, onLinkExisting, onClose }) {
  const group = appData.groups.find(g => g.id === groupId);
  const [mode, setMode] = useState('new');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [parentName, setParentName] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [search, setSearch] = useState('');

  const candidates = appData.students.filter(s => !s.groupIds.includes(groupId) && s.name.toLowerCase().includes(search.toLowerCase()));

  async function submitNew() {
    if (!name.trim()) { setError("O'quvchi ismini kiriting."); return; }
    if (!phone.trim()) { setError("Telefon raqamini kiriting."); return; }
    if (!password || password.length < 4) { setError("Parol kamida 4 belgidan iborat bo'lsin."); return; }
    const normalized = normalizePhone(phone);
    if (appData.students.some(s => normalizePhone(s.phone) === normalized)) {
      setError("Bu telefon raqamli o'quvchi allaqachon mavjud — 'Mavjudlardan' bo'limidan foydalaning.");
      return;
    }
    setBusy(true);
    const passwordHash = await hashPassword(password);
    setBusy(false);
    onAddNew({ id: generateId('st'), name: name.trim(), phone, birthDate, parentName: parentName.trim(), parentPhone, passwordHash, groupIds: [groupId], coins: 0 });
    onClose();
  }

  return (
    <Modal title={`O'quvchi qo'shish${group ? ' — ' + group.name : ''}`} onClose={onClose}>
      <div className="flex gap-2 mb-4 bg-white/5 border border-white/10 rounded-2xl p-1">
        <button onClick={() => setMode('new')} className={`flex-1 text-sm py-2 rounded-xl transition-all ${mode === 'new' ? 'bg-white/20 text-white' : 'text-white/50'}`}>Yangi o'quvchi</button>
        <button onClick={() => setMode('existing')} className={`flex-1 text-sm py-2 rounded-xl transition-all ${mode === 'existing' ? 'bg-white/20 text-white' : 'text-white/50'}`}>Mavjudlardan</button>
      </div>

      {mode === 'new' ? (
        <div className="space-y-4">
          <div>
            <label className={LABEL_CLS}>O'quvchi to'liq ismi</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Masalan: Aziz Karimov" className={INPUT_CLS} autoFocus />
          </div>
          <div>
            <label className={LABEL_CLS}>Telefon raqam</label>
            <PhoneInput value={phone} onChange={setPhone} />
          </div>
          <div>
            <label className={LABEL_CLS}>Tug'ilgan sana</label>
            <input type="date" value={birthDate} onChange={e => setBirthDate(e.target.value)} className={INPUT_CLS} />
          </div>
          <div>
            <label className={LABEL_CLS}>Parol (o'quvchi shu bilan tizimga kiradi)</label>
            <input type="text" value={password} onChange={e => setPassword(e.target.value)} placeholder="Kamida 4 belgi" className={INPUT_CLS} />
          </div>
          <div>
            <label className={LABEL_CLS}>Ota-onaning ismi</label>
            <input value={parentName} onChange={e => setParentName(e.target.value)} placeholder="Masalan: Karim Karimov" className={INPUT_CLS} />
          </div>
          <div>
            <label className={LABEL_CLS}>Ota-ona telefon raqami</label>
            <PhoneInput value={parentPhone} onChange={setParentPhone} />
          </div>
          {error && <p className="text-rose-300 text-xs">{error}</p>}
          <button onClick={submitNew} disabled={busy} className={`${BTN_PRIMARY} w-full`}>{busy ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />} Qo'shish</button>
        </div>
      ) : (
        <div className="space-y-3">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Ism bo'yicha qidirish..." className={INPUT_CLS} autoFocus />
          {candidates.length === 0 ? (
            <p className="text-white/40 text-sm text-center py-4">{appData.students.length === 0 ? "Hali boshqa o'quvchi yo'q." : "Mos o'quvchi topilmadi."}</p>
          ) : (
            <div className="space-y-1.5 max-h-64 overflow-y-auto">
              {candidates.map(s => (
                <button key={s.id} onClick={() => { onLinkExisting(s.id, groupId); onClose(); }} className="w-full flex items-center gap-3 bg-white/5 hover:bg-white/15 border border-white/10 rounded-xl p-2.5 transition-colors text-left">
                  <Avatar name={s.name} size={32} />
                  <div className="min-w-0 flex-1">
                    <p className="text-white text-sm truncate">{s.name}</p>
                    <p className="text-white/40 text-xs truncate">{getStudentGroups(appData, s.id).map(g => g.name).join(', ') || 'Guruhsiz'}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}

function CreateTaskModal({ groups, onAdd, onClose }) {
  const [groupId, setGroupId] = useState(groups[0]?.id || '');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState(todayISO());
  const [attachment, setAttachment] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  async function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try { setAttachment(await processMediaFile(file)); } catch (err) { console.error(err); }
    setUploading(false);
  }

  function submit() {
    if (!groupId) { setError("Guruhni tanlang."); return; }
    if (!title.trim()) { setError("Vazifa nomini kiriting."); return; }
    onAdd({ id: generateId('t'), groupId, title: title.trim(), description: description.trim(), attachment, dueDate, createdAt: Date.now(), submissions: {} });
    onClose();
  }

  return (
    <Modal title="Yangi vazifa" onClose={onClose}>
      <div className="space-y-4">
        <div>
          <label className={LABEL_CLS}>Guruh</label>
          <select value={groupId} onChange={e => setGroupId(e.target.value)} className={INPUT_CLS}>
            {groups.map(g => <option key={g.id} value={g.id} className="bg-violet-950">{g.name}</option>)}
          </select>
        </div>
        <div>
          <label className={LABEL_CLS}>Vazifa nomi</label>
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Masalan: 5-bob, mashqlar" className={INPUT_CLS} />
        </div>
        <div>
          <label className={LABEL_CLS}>Tavsif</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} placeholder="Vazifa haqida qisqacha..." className={INPUT_CLS} />
        </div>
        <div>
          <label className={LABEL_CLS}>Fayl (rasm yoki video, ixtiyoriy)</label>
          <label className={`${BTN_GHOST} cursor-pointer inline-flex`}>
            <input type="file" accept="image/*,video/*" className="hidden" onChange={handleFile} />
            {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />} {attachment ? attachment.name : 'Fayl tanlash'}
          </label>
        </div>
        <div>
          <label className={LABEL_CLS}>Muddat</label>
          <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className={INPUT_CLS} />
        </div>
        {error && <p className="text-rose-300 text-xs">{error}</p>}
        <button onClick={submit} className={`${BTN_PRIMARY} w-full`}><Plus size={16} /> Vazifa yaratish</button>
      </div>
    </Modal>
  );
}

/* ============================== TEACHER LAYOUT ============================== */

function AppSidebar({ view, goTo, items, title }) {
  return (
    <aside className="hidden md:flex flex-col w-60 shrink-0 p-5 gap-1">
      <div className={`${GLASS} rounded-3xl p-4 mb-4`}>
        <p className="font-display text-white font-bold text-lg tracking-tight">{title}</p>
      </div>
      <div className={`${GLASS} rounded-3xl p-2 flex flex-col gap-1 flex-1`}>
        {items.map(item => (
          <button key={item.id} onClick={() => goTo(item.id)} className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all ${view === item.id ? 'bg-white/20 text-white shadow-lg' : 'text-white/60 hover:bg-white/10 hover:text-white'}`}>
            <item.icon size={18} /> {item.label}
          </button>
        ))}
      </div>
    </aside>
  );
}

function AppBottomNav({ view, goTo, items }) {
  return (
    <nav className={`md:hidden fixed bottom-3 left-3 right-3 ${GLASS} rounded-3xl p-1.5 flex justify-around z-40`}>
      {items.map(item => (
        <button key={item.id} onClick={() => goTo(item.id)} className={`flex flex-col items-center gap-0.5 px-2 py-2 rounded-2xl transition-all flex-1 ${view === item.id ? 'bg-white/20 text-white' : 'text-white/50'}`}>
          <item.icon size={18} />
          <span className="text-[9px] font-medium">{item.label}</span>
        </button>
      ))}
    </nav>
  );
}

function TopBar({ teacher, goTo, now, onLogout }) {
  const dayName = JS_DAY_NAMES[now.getDay()];
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <p className="text-white/50 text-xs">{dayName}, {now.getDate()}-{MONTHS_UZ[now.getMonth()]}, {now.getFullYear()}</p>
        <p className="text-white font-medium mt-0.5">Xush kelibsiz, {teacher.name}! 👋</p>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={onLogout} className={BTN_ICON} title="Chiqish"><LogOut size={16} /></button>
        <button onClick={() => goTo('profile')} className="shrink-0">
          <Avatar name={teacher.name} color={teacher.color} photo={teacher.photo} size={42} />
        </button>
      </div>
    </div>
  );
}

/* ============================== STUDENT VIEWS ============================== */

function StudentTopBar({ student, appData, goTo, now, onLogout }) {
  const dayName = JS_DAY_NAMES[now.getDay()];
  const groups = getStudentGroups(appData, student.id);
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <p className="text-white/50 text-xs">{dayName}, {now.getDate()}-{MONTHS_UZ[now.getMonth()]}, {now.getFullYear()}</p>
        <p className="text-white font-medium mt-0.5">Salom, {student.name}! 👋</p>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={onLogout} className={BTN_ICON} title="Chiqish"><LogOut size={16} /></button>
        <button onClick={() => goTo('profile')} className="shrink-0">
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
  const myTasks = appData.tasks.filter(t => myGroupIds.includes(t.groupId));
  const pendingCount = myTasks.filter(t => { const s = t.submissions[student.id]; return !s || s.status === 'pending'; }).length;
  const recentGraded = myTasks
    .filter(t => t.submissions[student.id]?.status === 'graded')
    .sort((a, b) => (b.submissions[student.id].submittedAt || 0) - (a.submissions[student.id].submittedAt || 0))
    .slice(0, 3);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-white">Bosh sahifa</h2>
        <p className="text-white/50 text-sm mt-0.5">{myGroups.map(g => g.name).join(', ') || "Guruhingiz yo'q"}</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className={`${GLASS} rounded-2xl p-4 text-center`}>
          <p className="text-amber-300 text-2xl font-bold">{stats.count ? stats.avg.toFixed(1) : '—'}</p>
          <StarRating value={stats.avg} size={13} />
          <p className="text-white/50 text-xs mt-1">O'rtacha baho</p>
        </div>
        <div className={`${GLASS} rounded-2xl p-4 text-center`}>
          <p className="text-white text-2xl font-bold">{stats.done}/{stats.total}</p>
          <p className="text-white/50 text-xs mt-1">Bajarilgan</p>
        </div>
        <div className={`${GLASS} rounded-2xl p-4 text-center`}>
          <p className="text-white text-2xl font-bold">{pendingCount}</p>
          <p className="text-white/50 text-xs mt-1">Kutilmoqda</p>
        </div>
        <div className={`${GLASS} rounded-2xl p-4 text-center`}>
          <p className="text-amber-300 text-2xl font-bold">{student.coins || 0}</p>
          <p className="text-white/50 text-xs mt-1">🪙 Coin</p>
        </div>
      </div>

      {pendingCount > 0 && (
        <button onClick={() => goTo('tasks')} className={BTN_PRIMARY}><ClipboardList size={16} /> Vazifalarni ko'rish</button>
      )}

      {recentGraded.length > 0 && (
        <div className={`${GLASS} rounded-3xl p-5`}>
          <h3 className="font-display text-white font-semibold mb-3">So'nggi baholar</h3>
          <div className="space-y-2">
            {recentGraded.map(t => (
              <div key={t.id} className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl p-3">
                <p className="text-white text-sm truncate">{t.title}</p>
                <StarRating value={t.submissions[student.id].rating} size={14} />
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
  const myTasks = appData.tasks.filter(t => myGroupIds.includes(t.groupId)).slice().sort((a, b) => b.createdAt - a.createdAt);
  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-2xl font-bold text-white">Vazifalarim</h2>
      </div>
      {myTasks.length === 0 ? (
        <EmptyState icon={ClipboardList} title="Hozircha vazifa yo'q" subtitle="Ustoz vazifa berganda shu yerda ko'rinadi." />
      ) : (
        <div className="space-y-3">
          {myTasks.map(t => {
            const group = appData.groups.find(g => g.id === t.groupId);
            return <StudentTaskCard key={t.id} task={t} group={group} student={student} markSubmission={markSubmission} />;
          })}
        </div>
      )}
    </div>
  );
}

function StudentTaskCard({ task, group, student, markSubmission }) {
  const submission = task.submissions[student.id];
  const status = submission?.status || 'pending';
  const [mode, setMode] = useState(null);
  const [desc, setDesc] = useState('');
  const [attachment, setAttachment] = useState(null);
  const [uploading, setUploading] = useState(false);

  async function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try { setAttachment(await processMediaFile(file)); } catch (err) { console.error(err); }
    setUploading(false);
  }

  function handleSubmit() {
    markSubmission(task.id, student.id, { status: 'submitted', description: desc, attachment, submittedAt: Date.now() });
    setMode(null); setDesc(''); setAttachment(null);
  }

  return (
    <div className={`${GLASS} rounded-3xl p-5 space-y-3`}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          {group && <p className="text-white/40 text-xs flex items-center gap-1.5 mb-1"><span className="w-2 h-2 rounded-full" style={{ background: group.color }} />{group.name}</p>}
          <h3 className="font-display text-white font-semibold truncate">{task.title}</h3>
          {task.dueDate && <p className="text-white/45 text-xs mt-0.5 flex items-center gap-1"><Clock size={12} /> Muddat: {formatDate(task.dueDate)}</p>}
        </div>
        {status === 'pending' && <span className="text-white/40 text-xs bg-white/5 border border-white/10 rounded-full px-2.5 py-1 shrink-0">Kutilmoqda</span>}
        {status === 'submitted' && <span className="text-sky-200 text-xs bg-sky-400/10 border border-sky-300/30 rounded-full px-2.5 py-1 shrink-0">Tekshirilmoqda</span>}
        {status === 'graded' && <span className="text-emerald-200 text-xs bg-emerald-400/10 border border-emerald-300/30 rounded-full px-2.5 py-1 shrink-0">Baholandi</span>}
      </div>

      {task.description && <p className="text-white/60 text-sm">{task.description}</p>}
      {task.attachment && task.attachment.dataUrl && (
        task.attachment.type === 'video'
          ? <video src={task.attachment.dataUrl} controls className="rounded-2xl max-h-56 w-full bg-black/30" />
          : <img src={task.attachment.dataUrl} alt="" className="rounded-2xl max-h-56 object-cover" />
      )}

      {status === 'pending' && mode !== 'upload' && (
        <button onClick={() => setMode('upload')} className={`${BTN_PRIMARY} w-full`}><Upload size={15} /> Ishimni topshirish</button>
      )}

      {status === 'pending' && mode === 'upload' && (
        <div className="space-y-2.5 pt-2 border-t border-white/10">
          <textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder="Izoh yozing (ixtiyoriy)..." rows={2} className={INPUT_CLS} />
          <div className="flex items-center gap-2 flex-wrap">
            <label className={`${BTN_GHOST} cursor-pointer`}>
              <input type="file" accept="image/*,video/*" className="hidden" onChange={handleFile} />
              {uploading ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} />} {attachment ? 'Fayl tanlandi' : 'Rasm/video biriktirish'}
            </label>
            {attachment && <span className="text-white/40 text-xs truncate">{attachment.name}</span>}
          </div>
          <div className="flex gap-2">
            <button onClick={() => { setMode(null); setAttachment(null); }} className={`${BTN_GHOST} flex-1`}>Bekor qilish</button>
            <button onClick={handleSubmit} className={`${BTN_PRIMARY} flex-1`}><Check size={14} /> Topshirish</button>
          </div>
        </div>
      )}

      {(status === 'submitted' || status === 'graded') && (
        <div className="pt-2 border-t border-white/10 space-y-2">
          {submission.description && <p className="text-white/70 text-sm italic">"{submission.description}"</p>}
          {submission.attachment && submission.attachment.dataUrl && (
            submission.attachment.type === 'video'
              ? <video src={submission.attachment.dataUrl} controls className="rounded-xl max-h-48 w-full bg-black/30" />
              : <img src={submission.attachment.dataUrl} alt="" className="rounded-xl max-h-48 object-cover" />
          )}
          <div className="flex items-center justify-between">
            <span className="text-white/40 text-xs">{formatDateTime(submission.submittedAt)}{submission.coinsAwarded ? ` · +${submission.coinsAwarded} 🪙` : ''}</span>
            {status === 'graded' && <StarRating value={submission.rating} size={18} />}
          </div>
        </div>
      )}
    </div>
  );
}

function StudentRating({ appData, student }) {
  const [metric, setMetric] = useState('star');
  const myGroups = getStudentGroups(appData, student.id);
  const [tab, setTab] = useState(myGroups[0]?.id || '');
  const activeGroup = appData.groups.find(g => g.id === tab);

  const starList = activeGroup
    ? rankStudents(withGroupId(getGroupStudents(appData, activeGroup.id), activeGroup.id), appData.tasks).map(s => ({ ...s, groupColor: activeGroup.color }))
    : [];

  const coinList = appData.students.slice().sort((a, b) => (b.coins || 0) - (a.coins || 0));

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-2xl font-bold text-white">Reyting</h2>
        <p className="text-white/50 text-sm mt-0.5">Sizning o'rningiz</p>
      </div>
      <div className="flex gap-2">
        <button onClick={() => setMetric('star')} className={metric === 'star' ? BTN_PRIMARY : BTN_GHOST}>⭐ Yulduz</button>
        <button onClick={() => setMetric('coin')} className={metric === 'coin' ? BTN_PRIMARY : BTN_GHOST}>🪙 Coin</button>
      </div>

      {metric === 'star' && myGroups.length > 0 && (
        <select value={tab} onChange={e => setTab(e.target.value)} className={`${INPUT_CLS} sm:w-72`}>
          {myGroups.map(g => <option key={g.id} value={g.id} className="bg-violet-950">{g.name}</option>)}
        </select>
      )}

      <div className={`${GLASS} rounded-3xl p-5`}>
        {metric === 'star' ? (
          starList.length === 0 ? (
            <EmptyState icon={Trophy} title="Guruhingiz yo'q" />
          ) : (
            <div className="space-y-2">
              {starList.map((s, i) => (
                <div key={s.id} className={`flex items-center gap-3 border rounded-2xl p-3 ${s.id === student.id ? 'bg-white/20 border-white/40' : 'bg-white/5 border-white/10'}`}>
                  <span className="text-lg w-7 text-center shrink-0">{i < 3 ? ['🥇', '🥈', '🥉'][i] : <span className="text-white/40 text-sm">{i + 1}</span>}</span>
                  <Avatar name={s.name} color={s.groupColor} size={34} />
                  <p className="text-white text-sm font-medium flex-1 truncate">{s.name}{s.id === student.id ? ' (siz)' : ''}</p>
                  <StarRating value={s.stats.avg} size={13} />
                </div>
              ))}
            </div>
          )
        ) : (
          <div className="space-y-2">
            {coinList.map((s, i) => (
              <div key={s.id} className={`flex items-center gap-3 border rounded-2xl p-3 ${s.id === student.id ? 'bg-white/20 border-white/40' : 'bg-white/5 border-white/10'}`}>
                <span className="text-lg w-7 text-center shrink-0">{i < 3 ? ['🥇', '🥈', '🥉'][i] : <span className="text-white/40 text-sm">{i + 1}</span>}</span>
                <Avatar name={s.name} color={myGroups[0]?.color} size={34} />
                <p className="text-white text-sm font-medium flex-1 truncate">{s.name}{s.id === student.id ? ' (siz)' : ''}</p>
                <p className="text-amber-300 font-bold text-sm">{s.coins || 0} 🪙</p>
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
  const myPostponed = appData.postponed.filter(p => student.groupIds.includes(p.groupId));
  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-2xl font-bold text-white">Dars jadvali</h2>
      </div>
      {myGroups.length === 0 ? (
        <EmptyState icon={Calendar} title="Guruhingiz yo'q" />
      ) : myGroups.map(group => (
        <div key={group.id} className={`${GLASS} rounded-3xl p-5`}>
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: group.color }} />
            <h3 className="font-display text-white font-semibold">{group.name}</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {WEEK_DAYS.map(d => (
              <div key={d} className={`text-xs px-3 py-2 rounded-xl border ${group.days.includes(d) ? 'text-white' : 'text-white/30 border-white/5'}`} style={group.days.includes(d) ? { background: group.color + '33', borderColor: group.color + '66' } : {}}>
                {d}{group.days.includes(d) && ` · ${group.time}`}
              </div>
            ))}
          </div>
        </div>
      ))}
      {myPostponed.length > 0 && (
        <div className={`${GLASS} rounded-3xl p-5`}>
          <h3 className="font-display text-white font-semibold mb-3 flex items-center gap-2"><CalendarClock size={18} /> Ko'chirilgan darslar</h3>
          <div className="space-y-2">
            {myPostponed.map(p => (
              <div key={p.id} className="bg-white/5 border border-white/10 rounded-xl p-3">
                <p className="text-white/70 text-xs"><span className="line-through">{formatDate(p.originalDate)}</span> → <span className="text-emerald-200">{formatDate(p.newDate)}</span></p>
                {p.note && <p className="text-white/40 text-xs italic mt-0.5">{p.note}</p>}
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
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState(false);

  async function changePassword() {
    setError(''); setSuccess('');
    if (!currentPw || !newPw || !confirmPw) { setError("Barcha maydonlarni to'ldiring."); return; }
    setBusy(true);
    const hash = await hashPassword(currentPw);
    if (hash !== student.passwordHash) { setBusy(false); setError("Joriy parol noto'g'ri."); return; }
    if (newPw !== confirmPw) { setBusy(false); setError("Yangi parollar mos emas."); return; }
    if (newPw.length < 4) { setBusy(false); setError("Parol kamida 4 belgidan iborat bo'lsin."); return; }
    const newHash = await hashPassword(newPw);
    updateStudent(student.id, { passwordHash: newHash });
    setBusy(false);
    setSuccess('Parol yangilandi.');
    setCurrentPw(''); setNewPw(''); setConfirmPw('');
  }

  return (
    <div className="space-y-5 max-w-xl">
      <div>
        <h2 className="font-display text-2xl font-bold text-white">Profil</h2>
      </div>

      <div className={`${GLASS} rounded-3xl p-6 flex items-center gap-4`}>
        <Avatar name={student.name} color={myGroups[0]?.color} size={72} />
        <div className="min-w-0">
          <p className="font-display text-white text-lg font-bold truncate">{student.name}</p>
          <p className="text-white/60 text-sm truncate">{myGroups.map(g => g.name).join(', ')}</p>
          <p className="text-white/40 text-xs mt-1 flex items-center gap-1"><Phone size={11} /> {displayPhone(student.phone)}</p>
          <p className="text-amber-300 text-sm mt-1">{student.coins || 0} 🪙</p>
        </div>
      </div>

      <div className="space-y-3">
        <ProfileCategory icon={Lock} title="Parolni o'zgartirish">
          <div>
            <label className={LABEL_CLS}>Joriy parol</label>
            <input type={showPw ? 'text' : 'password'} value={currentPw} onChange={e => setCurrentPw(e.target.value)} className={INPUT_CLS} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={LABEL_CLS}>Yangi parol</label>
              <input type={showPw ? 'text' : 'password'} value={newPw} onChange={e => setNewPw(e.target.value)} className={INPUT_CLS} />
            </div>
            <div>
              <label className={LABEL_CLS}>Yangi parolni takrorlang</label>
              <input type={showPw ? 'text' : 'password'} value={confirmPw} onChange={e => setConfirmPw(e.target.value)} className={INPUT_CLS} />
            </div>
          </div>
          <button type="button" onClick={() => setShowPw(v => !v)} className={BTN_GHOST}>{showPw ? <EyeOff size={14} /> : <Eye size={14} />} Parolni {showPw ? 'yashirish' : "ko'rsatish"}</button>
          {error && <p className="text-rose-300 text-xs">{error}</p>}
          {success && <p className="text-emerald-300 text-xs">{success}</p>}
          <button onClick={changePassword} disabled={busy} className={BTN_PRIMARY}>Parolni saqlash</button>
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
  const [view, setView] = useState('dashboard');
  const [modal, setModal] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [courses, setCourses] = useState([]); // read-only course catalog from the Director panel, if any
  const [canCreateGroups, setCanCreateGroups] = useState(true); // permission set by Director/Manager, if linked

  const hasStorage = typeof window !== 'undefined' && !!window.storage;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (hasStorage) {
        let myPhone = '';
        try {
          const dataRes = await window.storage.get(APP_DATA_KEY, true).catch(() => null);
          const parsed = dataRes && dataRes.value ? JSON.parse(dataRes.value) : seedData();
          myPhone = normalizePhone(parsed?.teacher?.phone);
          if (!cancelled) setAppData(parsed);
        } catch (e) { if (!cancelled) setAppData(seedData()); }
        try {
          const sessRes = await window.storage.get(SESSION_KEY, false).catch(() => null);
          if (!cancelled) setSession(sessRes && sessRes.value ? JSON.parse(sessRes.value) : null);
        } catch (e) { if (!cancelled) setSession(null); }
        try {
          const dirRes = await window.storage.get(DIRECTOR_DATA_KEY, true).catch(() => null);
          const dirParsed = dirRes && dirRes.value ? JSON.parse(dirRes.value) : null;
          if (!cancelled) setCourses(dirParsed?.courses || []);
          if (!cancelled && dirParsed?.teachersHR?.length && myPhone) {
            const hrMatch = dirParsed.teachersHR.find(t => normalizePhone(t.phone) === myPhone);
            if (hrMatch && hrMatch.canCreateGroups === false) setCanCreateGroups(false);
          }
        } catch (e) { if (!cancelled) setCourses([]); }
      } else if (!cancelled) {
        setAppData(seedData());
        setSession(null);
      }
      if (!cancelled) setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (loading || !appData) return;
    const t = setTimeout(async () => {
      if (!hasStorage) return;
      try { await window.storage.set(APP_DATA_KEY, JSON.stringify(sanitizeForStorage(appData)), true); }
      catch (e) { console.error('Saqlashda xatolik:', e); }
    }, 700);
    return () => clearTimeout(t);
  }, [appData, loading]);

  useEffect(() => {
    if (loading) return;
    (async () => {
      if (!hasStorage) return;
      try {
        if (session) await window.storage.set(SESSION_KEY, JSON.stringify(session), false);
        else await window.storage.delete(SESSION_KEY, false);
      } catch (e) { /* ignore */ }
    })();
  }, [session, loading]);

  function addNotification(message) {
    const id = generateId('n');
    setNotifications(prev => [...prev, { id, message }]);
    setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== id)), 5000);
  }

  function goTo(v) { setSelectedGroupId(null); setSelectedTaskId(null); setView(v); }
  function openModal(m) { setModal(m); }
  function closeModal() { setModal(null); }

  function loginAsTeacher() { setSession({ role: 'teacher' }); setView('dashboard'); }
  function loginAsStudent(studentId) { setSession({ role: 'student', studentId }); setView('home'); }
  function logout() { setSession(null); setView('dashboard'); setSelectedGroupId(null); setSelectedTaskId(null); setModal(null); }

  function addGroup(group) {
    setAppData(prev => ({ ...prev, groups: [...prev.groups, group] }));
    addNotification(`"${group.name}" guruhi yaratildi.`);
  }

  function addStudent(student) {
    setAppData(prev => ({ ...prev, students: [...prev.students, student] }));
    addNotification(`${student.name} qo'shildi.`);
  }

  function linkExistingStudent(studentId, groupId) {
    const student = appData.students.find(s => s.id === studentId);
    setAppData(prev => ({ ...prev, students: prev.students.map(s => s.id === studentId ? { ...s, groupIds: [...new Set([...s.groupIds, groupId])] } : s) }));
    addNotification(`${student?.name || "O'quvchi"} guruhga qo'shildi.`);
  }

  function addTask(task) {
    setAppData(prev => ({ ...prev, tasks: [...prev.tasks, task] }));
    addNotification(`"${task.title}" vazifasi yaratildi.`);
  }

  function markSubmission(taskId, studentId, data) {
    const task = appData.tasks.find(t => t.id === taskId);
    if (!task) return;
    const group = appData.groups.find(g => g.id === task.groupId);
    const students = group ? getGroupStudents(appData, group.id) : [];
    const prevSub = task.submissions[studentId] || {};
    const wasAllDone = students.length > 0 && students.every(st => { const s = task.submissions[st.id]; return s && s.status !== 'pending'; });

    const newSub = { ...prevSub, ...data };
    let coinDelta = 0;
    if (data.rating !== undefined && data.rating !== null) {
      const oldCoins = prevSub.coinsAwarded || 0;
      const newCoins = appData.coinSettings[String(data.rating)] ?? 0;
      newSub.coinsAwarded = newCoins;
      coinDelta = newCoins - oldCoins;
    }
    const newSubmissions = { ...task.submissions, [studentId]: newSub };
    const isAllDone = students.length > 0 && students.every(st => { const s = newSubmissions[st.id]; return s && s.status !== 'pending'; });

    setAppData(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => t.id === taskId ? { ...t, submissions: newSubmissions } : t),
      students: coinDelta !== 0 ? prev.students.map(s => s.id === studentId ? { ...s, coins: (s.coins || 0) + coinDelta } : s) : prev.students,
    }));

    if (!wasAllDone && isAllDone) {
      addNotification(`🎉 Barcha o'quvchilar "${task.title}" vazifasini topshirdi. Tekshirish vaqti keldi!`);
    } else if (data.status === 'graded') {
      addNotification(coinDelta > 0 ? `Baho qo'yildi (+${coinDelta} 🪙).` : "Baho qo'yildi.");
    } else if (data.status === 'submitted') {
      addNotification(`"${task.title}" topshirildi.`);
    }
  }

  function markAttendance(groupId, date, studentId, status) {
    setAppData(prev => {
      const existing = prev.attendance.find(a => a.groupId === groupId && a.date === date);
      if (existing) {
        return { ...prev, attendance: prev.attendance.map(a => a.id === existing.id ? { ...a, records: { ...a.records, [studentId]: status } } : a) };
      }
      return { ...prev, attendance: [...prev.attendance, { id: generateId('att'), groupId, date, records: { [studentId]: status } }] };
    });
  }

  function updateGroupSchedule(groupId, days, time) {
    setAppData(prev => ({ ...prev, groups: prev.groups.map(g => g.id === groupId ? { ...g, days, time } : g) }));
    addNotification('Jadval yangilandi.');
  }

  function addPostponed(entry) {
    setAppData(prev => ({ ...prev, postponed: [...prev.postponed, { id: generateId('p'), ...entry }] }));
    addNotification("Dars ko'chirildi.");
  }

  function removePostponed(id) {
    setAppData(prev => ({ ...prev, postponed: prev.postponed.filter(p => p.id !== id) }));
  }

  function updateTeacher(teacher) {
    setAppData(prev => ({ ...prev, teacher }));
    addNotification('Profil saqlandi.');
  }

  function updateStudent(studentId, patch) {
    setAppData(prev => ({ ...prev, students: prev.students.map(s => s.id === studentId ? { ...s, ...patch } : s) }));
  }

  function updateCoinSettings(newSettings) {
    setAppData(prev => ({ ...prev, coinSettings: newSettings }));
    addNotification('Coin sozlamalari yangilandi.');
  }

  function deleteGroup(groupId) {
    setAppData(prev => ({
      ...prev,
      groups: prev.groups.filter(g => g.id !== groupId),
      students: prev.students.map(s => ({ ...s, groupIds: s.groupIds.filter(id => id !== groupId) })),
      tasks: prev.tasks.filter(t => t.groupId !== groupId),
      postponed: prev.postponed.filter(p => p.groupId !== groupId),
      attendance: prev.attendance.filter(a => a.groupId !== groupId),
    }));
    setSelectedGroupId(null);
    addNotification("Guruh o'chirildi.");
  }

  function deleteTask(taskId) {
    setAppData(prev => ({ ...prev, tasks: prev.tasks.filter(t => t.id !== taskId) }));
    setSelectedTaskId(null);
    addNotification("Vazifa o'chirildi.");
  }

  function removeStudentFromGroup(studentId, groupId) {
    setAppData(prev => ({ ...prev, students: prev.students.map(s => s.id === studentId ? { ...s, groupIds: s.groupIds.filter(id => id !== groupId) } : s) }));
    addNotification("O'quvchi guruhdan chiqarildi.");
  }

  function handleConfirm() {
    if (!modal || modal.type !== 'confirm') return;
    const { action } = modal;
    if (action.kind === 'deleteGroup') deleteGroup(action.groupId);
    if (action.kind === 'deleteTask') deleteTask(action.taskId);
    if (action.kind === 'removeFromGroup') removeStudentFromGroup(action.studentId, action.groupId);
    setModal(null);
  }

  if (loading || !appData) return <LoadingScreen />;
  if (!session) return <LoginScreen appData={appData} onLoginTeacher={loginAsTeacher} onLoginStudent={loginAsStudent} />;

  const now = new Date();

  /* ---------- STUDENT SESSION ---------- */
  if (session.role === 'student') {
    const student = appData.students.find(s => s.id === session.studentId);

    if (!student) {
      return (
        <div className="min-h-screen w-full flex items-center justify-center text-white p-6 text-center relative" style={{ background: BG_GRADIENT }}>
          <GlobalStyleTag />
          <div className={`${GLASS} rounded-3xl p-8 max-w-sm relative z-10`}>
            <p className="mb-4">Hisobingiz topilmadi. Ustoz sizni o'chirgan bo'lishi mumkin.</p>
            <button onClick={logout} className={BTN_PRIMARY}>Chiqish</button>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen w-full text-white relative" style={{ background: BG_GRADIENT, fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif" }}>
        <GlobalStyleTag />
        <BackgroundBlobs />
        <div className="relative z-10 flex min-h-screen">
          <AppSidebar view={view} goTo={setView} items={STUDENT_NAV_ITEMS} title="🎓 O'quvchi paneli" />
          <main className="flex-1 p-4 md:p-8 pb-28 md:pb-8 max-w-5xl mx-auto w-full">
            <StudentTopBar student={student} appData={appData} goTo={setView} now={now} onLogout={logout} />
            {view === 'home' && <StudentHome appData={appData} student={student} goTo={setView} />}
            {view === 'tasks' && <StudentTasks appData={appData} student={student} markSubmission={markSubmission} />}
            {view === 'rating' && <StudentRating appData={appData} student={student} />}
            {view === 'schedule' && <StudentSchedule appData={appData} student={student} />}
            {view === 'profile' && <StudentProfile appData={appData} student={student} updateStudent={updateStudent} />}
          </main>
          <AppBottomNav view={view} goTo={setView} items={STUDENT_NAV_ITEMS} />
        </div>
        <NotificationStack notifications={notifications} onDismiss={id => setNotifications(prev => prev.filter(n => n.id !== id))} />
      </div>
    );
  }

  /* ---------- TEACHER SESSION ---------- */
  return (
    <div className="min-h-screen w-full text-white relative" style={{ background: BG_GRADIENT, fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif" }}>
      <GlobalStyleTag />
      <BackgroundBlobs />

      <div className="relative z-10 flex min-h-screen">
        <AppSidebar view={view} goTo={goTo} items={NAV_ITEMS} title="📚 Ustoz Panel" />
        <main className="flex-1 p-4 md:p-8 pb-28 md:pb-8 max-w-5xl mx-auto w-full">
          <TopBar teacher={appData.teacher} goTo={goTo} now={now} onLogout={logout} />

          {view === 'dashboard' && <DashboardView appData={appData} openModal={openModal} setSelectedGroupId={setSelectedGroupId} selectedGroupId={selectedGroupId} courses={courses} canCreateGroups={canCreateGroups} />}
          {view === 'rating' && <RatingView appData={appData} openModal={openModal} />}
          {view === 'tasks' && <TasksView appData={appData} openModal={openModal} markSubmission={markSubmission} markAttendance={markAttendance} selectedTaskId={selectedTaskId} setSelectedTaskId={setSelectedTaskId} />}
          {view === 'schedule' && <ScheduleView appData={appData} updateGroupSchedule={updateGroupSchedule} openModal={openModal} removePostponed={removePostponed} />}
          {view === 'profile' && <ProfileView teacher={appData.teacher} updateTeacher={updateTeacher} openModal={openModal} />}
        </main>
        <AppBottomNav view={view} goTo={goTo} items={NAV_ITEMS} />
      </div>

      <NotificationStack notifications={notifications} onDismiss={id => setNotifications(prev => prev.filter(n => n.id !== id))} />

      {modal?.type === 'addGroup' && <AddGroupModal groups={appData.groups} courses={courses} onAdd={addGroup} onClose={closeModal} />}
      {modal?.type === 'addStudent' && <AddStudentModal groupId={modal.groupId} appData={appData} onAddNew={addStudent} onLinkExisting={linkExistingStudent} onClose={closeModal} />}
      {modal?.type === 'createTask' && <CreateTaskModal groups={appData.groups} onAdd={addTask} onClose={closeModal} />}
      {modal?.type === 'studentDetail' && <StudentDetailModal studentId={modal.studentId} groupId={modal.groupId} appData={appData} openModal={openModal} onClose={closeModal} updateStudent={updateStudent} />}
      {modal?.type === 'coinSettings' && <CoinSettingsModal coinSettings={appData.coinSettings} onSave={updateCoinSettings} onClose={closeModal} />}
      {modal?.type === 'postponeLesson' && <PostponeModal groups={appData.groups} onAdd={addPostponed} onClose={closeModal} />}
      {modal?.type === 'confirm' && <ConfirmModal message={modal.message} onConfirm={handleConfirm} onCancel={closeModal} />}
    </div>
  );
}
