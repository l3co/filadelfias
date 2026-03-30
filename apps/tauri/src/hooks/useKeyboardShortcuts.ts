import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { usePlatform } from "./usePlatform";

export function useKeyboardShortcuts() {
  const navigate = useNavigate();
  const platform = usePlatform();

  useEffect(() => {
    if (platform !== "desktop") {
      return;
    }

    const handler = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isTypingContext =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.tagName === "SELECT" ||
        target?.isContentEditable;

      if (isTypingContext) {
        return;
      }

      const mod = event.metaKey || event.ctrlKey;
      if (!mod) {
        return;
      }

      switch (event.key.toLowerCase()) {
        case "b":
          event.preventDefault();
          navigate("/biblia");
          break;
        case "h":
          event.preventDefault();
          navigate("/hinario");
          break;
        case "p":
          event.preventDefault();
          navigate("/member/prayer");
          break;
        case "d":
          event.preventDefault();
          navigate("/member/directory");
          break;
        case "e":
          event.preventDefault();
          navigate("/member/events");
          break;
        case ",":
          event.preventDefault();
          navigate("/member/profile");
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [navigate, platform]);
}
