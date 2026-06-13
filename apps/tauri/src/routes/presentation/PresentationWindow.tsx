import { useEffect, useState } from "react";
import { listen } from "@tauri-apps/api/event";
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
import type { PresentationSettings, PresentedVerse } from "@/stores/presentationStore";

interface PresentationPayload {
  verse: PresentedVerse | null;
  settings: PresentationSettings;
  isBlank: boolean;
}

export function PresentationWindow() {
  const [verse, setVerse] = useState<PresentedVerse | null>(null);
  const [settings, setSettings] = useState<PresentationSettings>({
    bgColor: "#0f172a",
    textColor: "#f8fafc",
    fontSize: 64,
    logoPosition: "bottom-right",
    logoUrl: "",
  });
  const [isBlank, setIsBlank] = useState(false);

  useEffect(() => {
    const unlistenPresent = listen<PresentationPayload>("bible:present", (event) => {
      const { verse: v, settings: s, isBlank: blank } = event.payload;
      setVerse(v);
      setSettings(s);
      setIsBlank(blank);
    });

    const unlistenClose = listen("presentation:close", () => {
      getCurrentWebviewWindow().close();
    });

    return () => {
      unlistenPresent.then((fn) => fn());
      unlistenClose.then((fn) => fn());
    };
  }, []);

  const logoStyle: React.CSSProperties = {
    position: "absolute",
    ...(settings.logoPosition === "top-right" && { top: 32, right: 40 }),
    ...(settings.logoPosition === "bottom-right" && { bottom: 32, right: 40 }),
  };

  return (
    <div
      className="relative flex h-screen w-screen items-center justify-center overflow-hidden"
      style={{ backgroundColor: settings.bgColor }}
    >
      {/* Verse content */}
      {!isBlank && verse && (
        <div className="mx-auto max-w-5xl px-16 text-center">
          <p
            className="font-serif leading-snug tracking-wide"
            style={{
              color: settings.textColor,
              fontSize: `${settings.fontSize}px`,
              lineHeight: 1.35,
            }}
          >
            {verse.text}
          </p>
          <p
            className="mt-8 font-semibold uppercase tracking-[0.25em]"
            style={{
              color: settings.textColor,
              fontSize: `${Math.max(18, settings.fontSize * 0.28)}px`,
              opacity: 0.6,
            }}
          >
            {verse.reference}
          </p>
        </div>
      )}

      {/* Logo watermark */}
      {settings.logoUrl && settings.logoPosition !== "none" && (
        <img
          src={settings.logoUrl}
          alt="Logo da Igreja"
          style={{ ...logoStyle, maxHeight: 80, maxWidth: 200, opacity: 0.5, objectFit: "contain" }}
        />
      )}

      {/* Keyboard hint (operator only sees this in a brief moment) */}
      {!verse && !isBlank && (
        <p
          className="text-center text-sm tracking-widest uppercase opacity-20"
          style={{ color: settings.textColor }}
        >
          Aguardando apresentação…
        </p>
      )}
    </div>
  );
}
