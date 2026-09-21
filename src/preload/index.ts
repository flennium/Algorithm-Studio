import { contextBridge, ipcRenderer } from "electron";
import type { DocumentApi, OpenedDocument, SavedDocument } from "../shared/documents";

const desktopApi: DocumentApi = {
  openDocument: (): Promise<OpenedDocument | null> => ipcRenderer.invoke("document:open"),
  saveDocument: (path: string | null, content: string): Promise<SavedDocument | null> =>
    ipcRenderer.invoke("document:save", { path, content }),
};

contextBridge.exposeInMainWorld("desktop", desktopApi);

export type DesktopApi = typeof desktopApi;
