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

export async function loadDirectorData() {
  const [
    { data: directorData, error: directorError },
    { data: opData, error: opError },
    { data: session, error: sessionError },
    { data: notifLog, error: notifError },
  ] = await Promise.all([
    fetchAppState("directorData"),
    fetchAppState("opData"),
    fetchAppState("directorSession"),
    fetchAppState("directorNotifLog"),
  ]);

  return {
    directorData,
    opData,
    session,
    notifLog,
    errors: { directorError, opError, sessionError, notifError },
  };
}

export async function persistDirectorData(directorData) {
  return saveAppState("directorData", directorData);
}

export async function persistOpData(opData) {
  return saveAppState("opData", opData);
}

export async function persistDirectorSession(session) {
  return saveAppState("directorSession", session);
}

export async function persistDirectorNotifLog(notifLog) {
  return saveAppState("directorNotifLog", notifLog);
}
