import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.REACT_APP_SUPABASE_URL ||
  (typeof window !== "undefined" ? window?.SUPABASE_URL : "");
const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.REACT_APP_SUPABASE_ANON_KEY ||
  (typeof window !== "undefined" ? window?.SUPABASE_ANON_KEY : "");

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const APP_STATE_TABLE = "app_state";

async function fetchAppState(key) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY)
    return {
      data: null,
      error: new Error("Supabase configuration is missing"),
    };
  const { data, error } = await supabase
    .from(APP_STATE_TABLE)
    .select("value")
    .eq("key", key)
    .single();
  if (error && error.code !== "PGRST116") return { data: null, error };
  return { data: data?.value ?? null, error: null };
}

async function saveAppState(key, value) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY)
    return { error: new Error("Supabase configuration is missing") };
  const { error } = await supabase
    .from(APP_STATE_TABLE)
    .upsert({ key, value }, { onConflict: "key" });
  return { error };
}

export async function loadInitialData() {
  const [
    { data: directorData, error: directorError },
    { data: opData, error: opError },
    { data: session, error: sessionError },
    { data: notifLog, error: notifError },
  ] = await Promise.all([
    fetchAppState("directorData"),
    fetchAppState("opData"),
    fetchAppState("managerSession"),
    fetchAppState("managerNotifLog"),
  ]);

  return {
    directorData: directorData || seedDirectorData(),
    opData: opData || {
      groups: [],
      students: [],
      tasks: [],
      attendance: [],
      rooms: [],
    },
    session: session || null,
    notifLog: notifLog || [],
    errors: { directorError, opError, sessionError, notifError },
  };
}

export async function persistDirectorData(directorData) {
  return saveAppState("directorData", directorData);
}

export async function persistOpData(opData) {
  return saveAppState("opData", opData);
}

export async function persistSession(session) {
  return saveAppState("managerSession", session);
}

export async function persistNotifLog(notifLog) {
  return saveAppState("managerNotifLog", notifLog);
}

export function generateId(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}
export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}
export function thisMonthKey() {
  return new Date().toISOString().slice(0, 7);
}
export function prevMonthKey(month) {
  const [y, m] = month.split("-").map(Number);
  return new Date(y, m - 2, 1).toISOString().slice(0, 7);
}
export function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T00:00:00");
  if (isNaN(d.getTime())) return dateStr;
  return `${d.getDate()}-${MONTHS_UZ[d.getMonth()]}, ${d.getFullYear()}`;
}
export function initials(name) {
  return (name || "?")
    .trim()
    .split(/\s+/)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}
export function normalizePhone(p) {
  return (p || "").replace(/\D/g, "");
}
export function displayPhone(local) {
  return local ? "+998 " + local : "kiritilmagan";
}
export function money(n) {
  return (n || 0).toLocaleString("uz-UZ");
}
export function generateDemoCode() {
  return String(Math.floor(10000 + Math.random() * 90000));
}
export function timeAgo(ts) {
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 60) return "hozir";
  if (diff < 3600) return `${Math.floor(diff / 60)} daq oldin`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} soat oldin`;
  return `${Math.floor(diff / 86400)} kun oldin`;
}
export function getPaymentTotal(payments, studentId, groupId, month) {
  return (payments || [])
    .filter(
      (p) =>
        p.studentId === studentId && p.groupId === groupId && p.month === month,
    )
    .reduce((s, p) => s + p.amount, 0);
}
export function getPaymentStatus(payments, studentId, groupId, month, price) {
  const total = getPaymentTotal(payments, studentId, groupId, month);
  if (total <= 0) return "unpaid";
  if (total < price) return "partial";
  return "paid";
}
export async function hashPassword(pw) {
  try {
    if (
      typeof window !== "undefined" &&
      window.crypto &&
      window.crypto.subtle
    ) {
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

export function opActiveStudents(opData) {
  return (opData?.students || []).filter((s) => (s.groupIds || []).length > 0)
    .length;
}
export function opFrozenStudents(opData) {
  return (opData?.students || []).filter((s) => (s.groupIds || []).length === 0)
    .length;
}
export function opGroups(opData) {
  return opData?.groups || [];
}
export function opGroupStudentCount(opData, groupId) {
  return (opData?.students || []).filter((s) =>
    (s.groupIds || []).includes(groupId),
  ).length;
}
export function opStudentsInGroups(opData, groupIds) {
  return (opData?.students || []).filter((s) =>
    (s.groupIds || []).some((id) => groupIds.includes(id)),
  );
}
export function opRooms(opData) {
  return opData?.rooms || [];
}
export function opAttendance(opData) {
  return opData?.attendance || [];
}
export function attendanceStatus(record, studentId) {
  if (!record || !record.records) return null;
  const entry = record.records[studentId];
  if (!entry) return null;
  return typeof entry === "object" ? entry.status : entry;
}

export function computeBranchStats(branch, directorData, opData) {
  const courseIds = directorData.courses
    .filter((c) => c.branchId === branch.id)
    .map((c) => c.id);
  const groups = opGroups(opData).filter((g) => courseIds.includes(g.courseId));
  const activeStudents = opStudentsInGroups(
    opData,
    groups.map((g) => g.id),
  ).length;
  const totalPayments = directorData.payments
    .filter((p) => groups.some((g) => g.id === p.groupId))
    .reduce((sum, p) => sum + p.amount, 0);
  return { groupCount: groups.length, activeStudents, totalPayments };
}

export function getTeacherPayStats(
  directorData,
  opData,
  teacher,
  branch,
  month,
) {
  const branchStats = branch
    ? computeBranchStats(branch, directorData, opData)
    : null;
  const payments = (directorData.teacherPayments || []).filter(
    (p) => p.teacherHRId === teacher.id && p.month === month,
  );
  const advances = payments
    .filter((p) => p.type === "advance")
    .reduce((sum, p) => sum + p.amount, 0);
  const salaryPaid = payments
    .filter((p) => p.type === "salary")
    .reduce((sum, p) => sum + p.amount, 0);
  const expectedPay =
    teacher.salaryType === "fixed"
      ? teacher.fixedSalary || 0
      : Math.round(
          (branchStats?.totalPayments || 0) *
            ((teacher.revenueSharePercent || 0) / 100),
        );
  return {
    expectedPay,
    advances,
    salaryPaid,
    remaining: Math.max(0, expectedPay - salaryPaid),
  };
}

export function seedDirectorData() {
  return {
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
        allowedPages: [
          "home",
          "payments",
          "teachers",
          "courses",
          "groups",
          "attendance",
          "rooms",
          "finance",
          "holidays",
          "notifications",
        ],
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
