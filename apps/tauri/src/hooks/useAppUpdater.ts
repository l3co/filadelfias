import { useCallback, useEffect, useRef, useState } from "react";
import { relaunch } from "@tauri-apps/plugin-process";
import { check, type Update } from "@tauri-apps/plugin-updater";
import { toast } from "sonner";

type UpdateStatus = "idle" | "checking" | "available" | "downloading" | "installing";

interface CheckOptions {
  silent?: boolean;
}

export function useAppUpdater(enabled: boolean) {
  const [status, setStatus] = useState<UpdateStatus>("idle");
  const [update, setUpdate] = useState<Update | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const downloadedBytesRef = useRef(0);
  const totalBytesRef = useRef<number | null>(null);

  const checkForUpdates = useCallback(async ({ silent = false }: CheckOptions = {}) => {
    if (!enabled || status === "checking" || status === "downloading" || status === "installing") {
      return null;
    }

    setStatus("checking");

    try {
      const nextUpdate = await check({ timeout: 15000 });
      setUpdate(nextUpdate);

      if (nextUpdate) {
        setStatus("available");

        if (!silent) {
          toast.success(`Atualizacao ${nextUpdate.version} disponivel.`);
        }
      } else {
        setStatus("idle");

        if (!silent) {
          toast.message("Voce ja esta na versao mais recente.");
        }
      }

      return nextUpdate;
    } catch (error) {
      setStatus("idle");

      if (!silent) {
        const message = error instanceof Error ? error.message : "Falha ao verificar atualizacoes.";
        toast.error(message);
      }

      return null;
    }
  }, [enabled, status]);

  const installUpdate = async () => {
    if (!enabled || !update || status === "installing") {
      return;
    }

    setStatus("downloading");
    downloadedBytesRef.current = 0;
    totalBytesRef.current = null;
    setProgress(0);

    try {
      await update.downloadAndInstall((event) => {
        if (event.event === "Started") {
          totalBytesRef.current = event.data.contentLength ?? null;
          downloadedBytesRef.current = 0;
          setProgress(0);
          return;
        }

        if (event.event === "Progress") {
          const totalBytes = totalBytesRef.current;
          downloadedBytesRef.current += event.data.chunkLength;

          setProgress(() => {
            if (!totalBytes || totalBytes <= 0) {
              return null;
            }

            return Math.min(100, Math.round((downloadedBytesRef.current / totalBytes) * 100));
          });
          return;
        }

        setProgress(100);
      });

      setStatus("installing");
      toast.success("Atualizacao instalada. Reiniciando o app...");
      await relaunch();
    } catch (error) {
      setStatus("available");
      const message = error instanceof Error ? error.message : "Falha ao instalar a atualizacao.";
      toast.error(message);
    }
  };

  useEffect(() => {
    if (!enabled || import.meta.env.DEV) {
      return;
    }

    checkForUpdates({ silent: true }).catch(() => undefined);
  }, [enabled, checkForUpdates]);

  return {
    canCheck: enabled,
    currentVersion: update?.currentVersion ?? null,
    isChecking: status === "checking",
    isInstalling: status === "downloading" || status === "installing",
    progress,
    status,
    updateVersion: update?.version ?? null,
    hasUpdate: Boolean(update),
    checkForUpdates,
    installUpdate,
  };
}
