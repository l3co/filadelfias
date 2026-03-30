import { Bell, Download, LoaderCircle, Moon, RefreshCw, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAppUpdater } from "@/hooks/useAppUpdater";
import { usePlatform } from "@/hooks/usePlatform";
import { useThemeStore } from "@/stores/themeStore";

interface TopBarProps {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
}

export function TopBar({ title, showBack = false, onBack }: TopBarProps) {
  const { resolvedTheme, setTheme } = useThemeStore();
  const platform = usePlatform();
  const updater = useAppUpdater(platform === "desktop");
  const showUpdateProgress = updater.isInstalling && updater.progress !== null;

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
      <div className="flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          {showBack ? (
            <Button variant="ghost" size="icon" onClick={onBack} aria-label="Voltar">
              <span aria-hidden="true">←</span>
            </Button>
          ) : null}
          <h1 className="text-base font-semibold">{title}</h1>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-2 rounded-full border px-3 py-1 text-xs text-muted-foreground lg:flex">
            <span>Cmd/Ctrl+B Biblia</span>
            <span>Cmd/Ctrl+P Oracao</span>
          </div>
          {updater.canCheck ? (
            updater.hasUpdate ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => updater.installUpdate().catch(() => undefined)}
                disabled={updater.isInstalling}
                aria-label="Instalar atualizacao"
              >
                {updater.isInstalling ? <LoaderCircle className="animate-spin" /> : <Download />}
                {updater.isInstalling ? "Atualizando" : `Atualizar ${updater.updateVersion}`}
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => updater.checkForUpdates().catch(() => undefined)}
                disabled={updater.isChecking}
                aria-label="Verificar atualizacoes"
              >
                {updater.isChecking ? <LoaderCircle className="animate-spin" size={18} /> : <RefreshCw size={18} />}
              </Button>
            )
          ) : null}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            aria-label="Alternar tema"
          >
            {resolvedTheme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </Button>
          <Button variant="ghost" size="icon" aria-label="Notificacoes">
            <Bell size={18} />
          </Button>
        </div>
      </div>

      {showUpdateProgress ? (
        <div className="border-t px-4 py-2">
          <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
            <span>Baixando atualizacao {updater.updateVersion}</span>
            <span>{updater.progress}%</span>
          </div>
          <Progress value={updater.progress ?? 0} />
        </div>
      ) : null}
    </header>
  );
}
