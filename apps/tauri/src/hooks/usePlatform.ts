import { useEffect, useState } from "react";

type Platform = "mobile" | "desktop";

function detectFallbackPlatform(): Platform {
  const ua = navigator.userAgent.toLowerCase();

  if (ua.includes("android") || ua.includes("iphone") || ua.includes("ipad")) {
    return "mobile";
  }

  return window.innerWidth < 768 ? "mobile" : "desktop";
}

export function usePlatform(): Platform {
  const [platform, setPlatform] = useState<Platform>(detectFallbackPlatform);

  useEffect(() => {
    try {
      import("@tauri-apps/plugin-os")
        .then(({ platform: getPlatform }) => {
          const mobilePlatforms = ["android", "ios"];
          setPlatform(mobilePlatforms.includes(getPlatform()) ? "mobile" : "desktop");
        })
        .catch(() => {
          setPlatform(detectFallbackPlatform());
        });
    } catch {
      setPlatform(detectFallbackPlatform());
    }
  }, []);

  useEffect(() => {
    const onResize = () => setPlatform(detectFallbackPlatform());
    window.addEventListener("resize", onResize);

    return () => window.removeEventListener("resize", onResize);
  }, []);

  return platform;
}
