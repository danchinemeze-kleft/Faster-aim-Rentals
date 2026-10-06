"use client";
import Image from "next/image";
import { useEffect, useState } from "react";

const PLAY_STORE_URL = ""; // paste your Play Store link here when live

export default function DownloadPopup() {
  const [show, setShow] = useState(false);
  const [deferred, setDeferred] = useState(null);

  useEffect(() => {
    try {
      const dismissed = localStorage.getItem("mr-rent-dl-dismissed");
      if (dismissed && Date.now() - Number(dismissed) < 7 * 24 * 3600 * 1000) return;
    } catch {}

    // Already installed? Don't show.
    if (window.matchMedia("(display-mode: standalone)").matches) return;

    const onPrompt = (e) => {
      e.preventDefault();
      setDeferred(e);
    };

    window.addEventListener("beforeinstallprompt", onPrompt);

    const t = setTimeout(() => {
      setShow(true);
      try {
        const a = new Audio("/sounds/ding.mp3");
        a.volume = 0.4;
        a.play().catch(() => {}); // silently ignored if the browser blocks it
      } catch {}
    }, 5000);

    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      clearTimeout(t);
    };
  }, []);

  const close = () => {
    setShow(false);
    try {
      localStorage.setItem("mr-rent-dl-dismissed", String(Date.now()));
    } catch {}
  };

  const install = async () => {
    if (PLAY_STORE_URL) {
      window.open(PLAY_STORE_URL, "_blank");
    } else if (deferred) {
      deferred.prompt();
      await deferred.userChoice;
      setDeferred(null);
    } else {
      alert("On your browser menu, tap 'Add to Home screen' to install Mr. Rent.");
    }
    close();
  };

  if (!show) return null;

  return (
    <div
      style={{
        position: "fixed",
        left: 12,
        right: 12,
        bottom: 16,
        zIndex: 1000,
        maxWidth: 420,
        margin: "0 auto",
        background: "#fff",
        borderRadius: 16,
        padding: 16,
        boxShadow: "0 8px 30px rgba(0,0,0,.25)",
        border: "1px solid #0a7a3d",
        display: "flex",
        gap: 12,
        alignItems: "center",
      }}
    >
      <Image src="/icon.png" alt="Mr. Rent" width={48} height={48} style={{ borderRadius: 12 }} />
      <div style={{ flex: 1 }}>
        <strong>Get the Mr. Rent app</strong>
        <div style={{ fontSize: 13, color: "#555" }}>Find verified rentals faster, no scams.</div>
      </div>
      <button
        onClick={install}
        style={{
          background: "#0a7a3d",
          color: "#fff",
          border: 0,
          borderRadius: 10,
          padding: "10px 14px",
          fontWeight: 700,
          cursor: "pointer",
        }}
      >
        Download
      </button>
      <button
        onClick={close}
        aria-label="Close"
        style={{
          background: "none",
          border: 0,
          fontSize: 20,
          cursor: "pointer",
        }}
      >
        ×
      </button>
    </div>
  );
}

