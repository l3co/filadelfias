import { WebviewWindow } from "@tauri-apps/api/webviewWindow";

let win: WebviewWindow | null = null;

export async function openPresentationWindow(): Promise<WebviewWindow> {
  if (win) {
    await win.show();
    await win.setFocus();
    return win;
  }

  win = new WebviewWindow("presentation", {
    url: "/presentation",
    title: "Filadelfias — Apresentação",
    decorations: false,
    alwaysOnTop: true,
    resizable: true,
    width: 1920,
    height: 1080,
    center: true,
  });

  win.once("tauri://destroyed", () => {
    win = null;
  });
  win.once("tauri://error", () => {
    win = null;
  });

  return win;
}

export async function closePresentationWindow(): Promise<void> {
  if (win) {
    await win.destroy().catch(() => undefined);
    win = null;
  }
}

export function isPresentationWindowOpen(): boolean {
  return win !== null;
}
