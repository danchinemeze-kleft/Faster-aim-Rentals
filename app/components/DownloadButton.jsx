"use client";
import { useEffect, useState } from "react";

const PLAY_STORE_URL = ""; // paste your Play Store link here when it's live

export default function DownloadButton() {
  const [deferred, setDeferred] = useState(null);
  const [installed, setInstalled] = useState(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return false;
    }
    return window.matchMedia("(display-mode: standalone)").matches;
  });

  useEffect(() => {
    if (installed) return;

    const onPrompt = (e) => {
      e.preventDefault();
      setDeferred(e);
    };
    const onInstalled = () => setInstalled(true);
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, [installed]);

  if (installed) return null; // hide once the app is installed

  const onClick = async () => {
    if (PLAY_STORE_URL) {
      window.open(PLAY_STORE_URL, "_blank");
    } else if (deferred) {
      deferred.prompt();
      await deferred.userChoice;
      setDeferred(null);
    } else {
      alert("In your browser menu, tap 'Add to Home screen' to install Mr. Rent.");
    }
  };

  return (
    <button
      onClick={onClick}
      style={{
        background: "#0a7a3d",
        color: "#fff",
        border: 0,
        borderRadius: 999,
        padding: "8px 14px",
        fontWeight: 700,
        fontSize: 14,
        cursor: "pointer",
        whiteSpace: "nowrap",
        flexShrink: 0,
      }}
    >
      Download app
    </button>
  );
}