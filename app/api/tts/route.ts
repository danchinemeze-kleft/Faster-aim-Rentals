// app/api/tts/route.ts — Nigerian male voice (Azure en-NG-AbeoNeural) for Mr. Rent chat replies
import { NextRequest } from "next/server";

export const runtime = "nodejs";

const KEY = process.env.AZURE_SPEECH_KEY;
const REGION = process.env.AZURE_SPEECH_REGION || "southafricanorth";
const VOICE = "en-NG-AbeoNeural";

// Best-effort limiter (per server instance): 30 requests/minute per IP
const hits = new Map<string, { n: number; t: number }>();
function limited(ip: string) {
  const now = Date.now();
  if (hits.size > 5000) hits.clear();
  const h = hits.get(ip);
  if (!h || now - h.t > 60_000) { hits.set(ip, { n: 1, t: now }); return false; }
  h.n++;
  return h.n > 30;
}

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export async function POST(req: NextRequest) {
  if (!KEY) return new Response("TTS not configured", { status: 503 });

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (limited(ip)) return new Response("Too many requests", { status: 429 });

  const { text, rate = 1 } = await req.json().catch(() => ({}));
  if (typeof text !== "string" || !text.trim() || text.length > 1200) {
    return new Response("Bad text", { status: 400 });
  }

  const pct = Math.round((Math.min(Math.max(Number(rate) || 1, 0.7), 1.6) - 1) * 100);
  const ssml = `<speak version="1.0" xml:lang="en-NG"><voice name="${VOICE}"><prosody rate="${
    pct >= 0 ? "+" : ""
  }${pct}%">${esc(text.trim())}</prosody></voice></speak>`;

  const r = await fetch(`https://${REGION}.tts.speech.microsoft.com/cognitiveservices/v1`, {
    method: "POST",
    headers: {
      "Ocp-Apim-Subscription-Key": KEY,
      "Content-Type": "application/ssml+xml",
      "X-Microsoft-OutputFormat": "audio-24khz-48kbitrate-mono-mp3",
      "User-Agent": "mr-rent-voice",
    },
    body: ssml,
  });

  if (!r.ok) return new Response("TTS failed", { status: 502 });

  return new Response(r.body, {
    headers: { "Content-Type": "audio/mpeg", "Cache-Control": "private, max-age=3600" },
  });
}