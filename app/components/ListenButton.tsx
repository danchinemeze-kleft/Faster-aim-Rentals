"use client";
// app/components/ListenButton.tsx
// Usage under an AI reply:  <ListenButton text={message.content} />
import { useCallback, useEffect, useId, useRef, useState } from "react";
import "./listen-button.css";

/** Turn a markdown chat reply into text that sounds natural when spoken. */
export function cleanForSpeech(md: string): string {
  return md
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/₦\s?([\d,]+(?:\.\d+)?)\s?(million|m|k)?\b/gi, (_m, n, u) =>
      `${n}${u ? (/^m/i.test(u) ? " million" : " thousand") : ""} naira`)
    .replace(/\/\s?(month|mo|year|yr|night|day)\b/gi, (_m, p: string) => {
      const w = p.toLowerCase();
      return " per " + (w === "mo" ? "month" : w === "yr" ? "year" : w);
    })
    .replace(/\bsqm\b/gi, "square metres")
    .replace(/\bbq\b/gi, "boys quarters")
    .replace(/^\s*[-*•]\s+/gm, "")
    .replace(/[*_`#>~|]+/g, "")
    .replace(/\p{Extended_Pictographic}/gu, "")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{2,}/g, "\n")
    .trim();
}

function chunkText(raw: string, max = 900): string[] {
  const out: string[] = [];
  let buf = "";
  const push = () => { if (buf.trim()) out.push(buf.trim()); buf = ""; };
  for (const p of raw.split("\n").map((s) => s.trim()).filter(Boolean)) {
    const parts = p.length > max ? p.match(/[^.!?]+[.!?]*\s*/g) || [p] : [p];
    for (const s of parts) {
      if (buf && (buf + " " + s).length > max) push();
      buf += (buf ? " " : "") + s;
    }
  }
  push();
  return out;
}

// Helper kept outside the component so the audio element can be configured safely
function loadAndPlay(a: HTMLAudioElement, url: string, onEnd: () => void) {
  a.src = url;
  a.onended = onEnd;
  return a.play();
}

type State = "idle" | "loading" | "playing" | "paused";

export default function ListenButton({ text }: { text: string }) {
  const id = useId();
  const [state, setState] = useState<State>("idle");
  const [note, setNote] = useState("");
  const audio = useRef<HTMLAudioElement | null>(null);
  const cache = useRef<Map<number, Promise<string>>>(new Map());
  const token = useRef(0);
  const browserMode = useRef(false);
  const chunksRef = useRef<string[]>([]);

  const stop = useCallback(() => {
    token.current++;
    audio.current?.pause();
    if (typeof speechSynthesis !== "undefined") speechSynthesis.cancel();
    setState("idle");
  }, []);

  // Stop when another reply starts, and when this one leaves the page
  useEffect(() => {
    const onOther = (e: Event) => {
      if ((e as CustomEvent<string>).detail !== id) stop();
    };
    window.addEventListener("faim-listen-start", onOther);
    return () => {
      window.removeEventListener("faim-listen-start", onOther);
      stop();
    };
  }, [id, stop]);

  const getAudio = (i: number) => {
    if (!cache.current.has(i)) {
      cache.current.set(
        i,
        fetch("/api/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: chunksRef.current[i] }),
        })
          .then(async (r) => {
            if (!r.ok) throw new Error("tts");
            return URL.createObjectURL(await r.blob());
          })
          .catch((e) => { cache.current.delete(i); throw e; })
      );
    }
    return cache.current.get(i)!;
  };

  const speakBrowser = (i: number, t: number) => {
    const u = new SpeechSynthesisUtterance(chunksRef.current[i]);
    const v = speechSynthesis.getVoices();
    const pick = v.find((x) => /en[-_]NG/i.test(x.lang)) || v.find((x) => /^en/i.test(x.lang));
    if (pick) u.voice = pick;
    u.lang = pick?.lang || "en-NG";
    u.onend = () => { if (t === token.current) next(i); };
    setState("playing");
    speechSynthesis.speak(u);
  };

  const next = (i: number) => {
    if (i + 1 >= chunksRef.current.length) { setState("idle"); return; }
    play(i + 1);
  };

  const play = async (i: number) => {
    const t = ++token.current;
    if (i === 0) window.dispatchEvent(new CustomEvent("faim-listen-start", { detail: id }));
    audio.current?.pause();
    if (typeof speechSynthesis !== "undefined") speechSynthesis.cancel();
    setState("loading");

    if (browserMode.current) { speakBrowser(i, t); return; }
    try {
      const url = await getAudio(i);
      if (t !== token.current) return;
      if (i + 1 < chunksRef.current.length) getAudio(i + 1).catch(() => {});
      if (!audio.current) audio.current = new Audio();
      await loadAndPlay(audio.current, url, () => {
        if (t === token.current) next(i);
      });
      if (t === token.current) setState("playing");
    } catch {
      if (t !== token.current) return;
      browserMode.current = true;
      setNote("Using your device voice");
      speakBrowser(i, t);
    }
  };

  const onClick = () => {
    if (state === "playing") {
      audio.current?.pause();
      if (browserMode.current) speechSynthesis.pause();
      setState("paused");
    } else if (state === "paused") {
      if (browserMode.current) speechSynthesis.resume();
      else audio.current?.play();
      setState("playing");
    } else if (state === "idle") {
      chunksRef.current = chunkText(cleanForSpeech(text));
      if (!chunksRef.current.length) return;
      cache.current.clear();
      play(0);
    }
  };

  const label =
    state === "loading" ? "Loading…" : state === "playing" ? "Pause" : state === "paused" ? "Resume" : "Listen";
  const icon = state === "playing" ? "❚❚" : state === "loading" ? "…" : "▶";

  return (
    <span className="faim-listen-wrap">
      <button
        type="button"
        className="faim-listen-btn"
        onClick={onClick}
        disabled={state === "loading"}
        aria-label={`${label} reply`}
      >
        <span aria-hidden="true">{icon}</span> {label}
      </button>
      {state !== "idle" && (
        <button type="button" className="faim-listen-stop" onClick={stop} aria-label="Stop">■</button>
      )}
      {note && <span className="faim-listen-note">{note}</span>}
    </span>
  );
}