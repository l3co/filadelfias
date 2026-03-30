import { useEffect } from "react";
import { CheckCircle, Download, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useDownloadStore } from "@/stores/downloadStore";

const AVAILABLE_DOWNLOADS = [
  { type: "bible" as const, id: "ARC", label: "Biblia ARC - Almeida Revista e Corrigida" },
  { type: "bible" as const, id: "NVI", label: "Biblia NVI - Nova Versao Internacional" },
  { type: "hymnal" as const, id: undefined, label: "Hinario Novo Cantico" },
  { type: "manual" as const, id: undefined, label: "Manual da IPB" },
];

export function DownloadsScreen() {
  const { isDownloading, progress, downloads, startDownload, refreshDownloads, deleteDownload } = useDownloadStore();

  useEffect(() => {
    refreshDownloads().catch(console.error);
  }, [refreshDownloads]);

  const isDownloaded = (type: string, id?: string) => {
    const key = id ? `${type}-${id}` : type;
    return downloads.some((download) => download.id === key);
  };

  return (
    <div className="space-y-4 p-4">
      <h1 className="text-xl font-bold">Conteudo Offline</h1>

      {isDownloading && progress ? (
        <div className="rounded-lg border p-4">
          <p className="mb-2 text-sm font-medium">{progress.name}</p>
          <Progress value={(progress.current / progress.total) * 100} />
          <p className="mt-1 text-xs text-muted-foreground">
            {progress.current} / {progress.total}
          </p>
        </div>
      ) : null}

      <div className="space-y-3">
        {AVAILABLE_DOWNLOADS.map(({ type, id, label }) => {
          const downloaded = isDownloaded(type, id);
          const downloadId = id ? `${type}-${id}` : type;

          return (
            <div key={downloadId} className="flex items-center justify-between gap-3 rounded-lg border p-4">
              <div>
                <p className="text-sm font-medium">{label}</p>
                {downloaded ? (
                  <p className="mt-1 flex items-center gap-1 text-xs text-green-600">
                    <CheckCircle size={12} /> Disponivel offline
                  </p>
                ) : null}
              </div>

              <div className="flex gap-2">
                {downloaded ? (
                  <Button variant="ghost" size="icon" onClick={() => deleteDownload(downloadId)}>
                    <Trash2 size={16} className="text-destructive" />
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isDownloading}
                    onClick={() => startDownload(type, id)}
                  >
                    {isDownloading ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                    <span className="ml-1">Baixar</span>
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
