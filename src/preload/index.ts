import { contextBridge, ipcRenderer } from "electron";

export type OpenedDocument = { path: string; content: string };
export type SavedDocument = { path: string };

const desktopApi = {
  openDocument: (): Promise<OpenedDocument | null> => ipcRenderer.invoke("document:open"),
  saveDocument: (path: string | null, content: string): Promise<SavedDocument | null> =>
    ipcRenderer.invoke("document:save", { path, content }),
};

contextBridge.exposeInMainWorld("desktop", desktopApi);

export type DesktopApi = typeof desktopApi;
