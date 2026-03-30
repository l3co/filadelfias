import { create } from "zustand";
import { type DownloadMeta, type DownloadProgress, offlineService } from "@/services/offline";

interface DownloadState {
  isDownloading: boolean;
  progress: DownloadProgress | null;
  downloads: DownloadMeta[];
  startDownload: (type: "bible" | "hymnal" | "manual", id?: string) => Promise<void>;
  refreshDownloads: () => Promise<void>;
  deleteDownload: (id: string) => Promise<void>;
  isDownloaded: (type: string, id?: string) => Promise<boolean>;
}

export const useDownloadStore = create<DownloadState>((set, get) => ({
  isDownloading: false,
  progress: null,
  downloads: [],

  startDownload: async (type, id) => {
    set({ isDownloading: true, progress: null });

    try {
      const onProgress = (progress: DownloadProgress) => set({ progress });

      if (type === "bible" && id) {
        await offlineService.downloadBibleVersion(id, onProgress);
      } else if (type === "hymnal") {
        await offlineService.downloadHymnal(onProgress);
      } else if (type === "manual") {
        await offlineService.downloadManual(onProgress);
      }

      await get().refreshDownloads();
    } finally {
      set({ isDownloading: false, progress: null });
    }
  },

  refreshDownloads: async () => {
    const downloads = await offlineService.getDownloadedContent();
    set({ downloads });
  },

  deleteDownload: async (id) => {
    await offlineService.deleteDownload(id);
    await get().refreshDownloads();
  },

  isDownloaded: async (type, id) => offlineService.isContentDownloaded(type, id),
}));
