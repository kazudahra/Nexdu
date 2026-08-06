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

export async function loadStudentData() {
  const [
    { data: appData, error: appError },
    { data: session, error: sessionError },
  ] = await Promise.all([
    fetchAppState("studentAppData"),
    fetchAppState("studentSession"),
  ]);

  return {
    appData,
    session,
    errors: { appError, sessionError },
  };
}

export async function persistStudentAppData(appData) {
  return saveAppState("studentAppData", sanitizeForStorage(appData));
}

export async function persistStudentSession(session) {
  return saveAppState("studentSession", session);
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
