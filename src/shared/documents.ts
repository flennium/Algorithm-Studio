export type OpenedDocument = { path: string; content: string };
export type SavedDocument = { path: string };

export interface DocumentApi {
  openDocument(): Promise<OpenedDocument | null>;
  saveDocument(path: string | null, content: string): Promise<SavedDocument | null>;
}
