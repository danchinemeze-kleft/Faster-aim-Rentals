"use client";
import { useEffect, useState } from "react";

const SHOW_MS = 1800; // how long the splash stays before fading out
const FADE_MS = 400;

export default function SplashScreen() {
  const [show, setShow] = useState(false);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    // Only show inside the installed app, and only once per app session.
    const installed =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true;
    if (!installed) return;
    try {
      if (sessionStorage.getItem("mr-rent-splash-seen")) return;
      sessionStorage.setItem("mr-rent-splash-seen", "1");
    } catch {}

    let fadeTimer;
    let hideTimer;
    const showTimer = setTimeout(() => {
      setShow(true);
      fadeTimer = setTimeout(() => setFading(true), SHOW_MS);
      hideTimer = setTimeout(() => setShow(false), SHOW_MS + FADE_MS);
    }, 0);
    return () => {
      clearTimeout(showTimer);
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  if (!show) return null;

  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        background: "#d8d8d6",
        overflow: "hidden",
        opacity: fading ? 0 : 1,
        transition: `opacity ${FADE_MS}ms ease`,
      }}
    >
      {/* Blurred copy fills the whole screen so there are no empty edges */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/splash.jpg"
        alt=""
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          filter: "blur(28px)",
          transform: "scale(1.15)",
        }}
      />
      {/* Sharp logo image, fully visible in the middle */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/splash.jpg"
        alt="Mr. Rent"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "contain",
        }}
      />
    </div>
  );
}