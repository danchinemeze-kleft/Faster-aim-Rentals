"use client";
import { useEffect } from "react";

const SHOW_MS = 1800;
const FADE_MS = 400;

export default function SplashScreen() {
  useEffect(() => {
    const root = document.documentElement;
    if (!root.classList.contains("splash-on")) return;
    try { sessionStorage.setItem("mr-rent-splash-seen", "1"); } catch {}

    const el = document.getElementById("splash");
    const t1 = setTimeout(() => el?.classList.add("fade"), SHOW_MS);
    const t2 = setTimeout(() => root.classList.remove("splash-on"), SHOW_MS + FADE_MS);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return null;
}