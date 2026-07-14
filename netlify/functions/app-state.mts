import { eq } from "drizzle-orm";
import { db } from "../../db/index.js";
import { appState } from "../../db/schema.js";

const ALLOWED_KEYS = new Set(["school-app-data-v3", "director-data-v2"]);

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}

export default async (request: Request) => {
  const url = new URL(request.url);
  const key = url.searchParams.get("key") || "";

  if (!ALLOWED_KEYS.has(key)) {
    return jsonResponse({ error: "Noto'g'ri ma'lumot kaliti." }, 400);
  }

  if (request.method === "GET") {
    const [record] = await db.select().from(appState).where(eq(appState.key, key)).limit(1);
    return jsonResponse({ value: record?.value ?? null, updatedAt: record?.updatedAt ?? null });
  }

  if (request.method === "PUT") {
    const contentLength = Number(request.headers.get("content-length") || 0);
    if (contentLength > 5_000_000) {
      return jsonResponse({ error: "Ma'lumot hajmi juda katta." }, 413);
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return jsonResponse({ error: "JSON formati noto'g'ri." }, 400);
    }

    if (!body || typeof body !== "object" || !("value" in body) || typeof body.value !== "object" || body.value === null) {
      return jsonResponse({ error: "Saqlanadigan ma'lumot topilmadi." }, 400);
    }

    const value = body.value;

    const now = new Date();
    await db.insert(appState).values({ key, value, updatedAt: now }).onConflictDoUpdate({
      target: appState.key,
      set: { value, updatedAt: now },
    });

    return jsonResponse({ ok: true, updatedAt: now });
  }

  return jsonResponse({ error: "Metod qo'llab-quvvatlanmaydi." }, 405);
};
