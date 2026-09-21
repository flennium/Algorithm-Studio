import type { DocumentApi, OpenedDocument, SavedDocument } from "../../shared/documents";

function ensureAlgoExtension(path: string): string {
  return /\.(algo|alg|txt)$/i.test(path) ? path : `${path}.algo`;
}

const browserDocuments: DocumentApi = {
  openDocument: () => new Promise<OpenedDocument | null>((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".algo,.alg,.txt,text/plain";
    input.addEventListener("change", async () => {
      const file = input.files?.[0];
      resolve(file ? { path: file.name, content: await file.text() } : null);
    }, { once: true });
    input.addEventListener("cancel", () => resolve(null), { once: true });
    input.click();
  }),
  saveDocument: async (path, content): Promise<SavedDocument> => {
    const name = ensureAlgoExtension(path?.split(/[\\/]/).pop() || "programme.algo");
    const url = URL.createObjectURL(new Blob([content], { type: "text/plain;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = name;
    link.click();
    URL.revokeObjectURL(url);
    return { path: name };
  },
};

export const documents: DocumentApi = window.desktop ?? browserDocuments;
export const platform = window.desktop ? "desktop" : "web";
