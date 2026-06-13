import { WebviewWindow } from "@tauri-apps/api/webviewWindow";
import { emitTo } from "@tauri-apps/api/event";

const LABEL = "presentation";

export async function openPresentationWindow(): Promise<WebviewWindow> {
  const existing = await WebviewWindow.getByLabel(LABEL);
  if (existing) {
    await existing.show();
    await existing.setFocus();
    return existing;
  }

  const win = new WebviewWindow(LABEL, {
    url: "/presentation",
    title: "Filadelfias — Apresentação",
    decorations: true,
    alwaysOnTop: true,
    resizable: true,
    width: 1280,
    height: 720,
    center: true,
  });

  return win;
}

export async function closePresentationWindow(): Promise<void> {
  await emitTo(LABEL, "presentation:close").catch(() => undefined);
}

export async function isPresentationWindowOpen(): Promise<boolean> {
  const win = await WebviewWindow.getByLabel(LABEL);
  return win !== null;
}
