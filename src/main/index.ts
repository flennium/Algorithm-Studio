import { app, BrowserWindow, dialog, ipcMain } from "electron";
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

// Electron can present a permanently blank Chromium surface on some Windows
// GPU/driver combinations even though the renderer loaded successfully.
app.disableHardwareAcceleration();

function createWindow(): void {
  const window = new BrowserWindow({
    show: false,
    width: 1360,
    height: 860,
    minWidth: 900,
    minHeight: 620,
    backgroundColor: "#f5f7f8",
    title: "Algorithm Studio",
    webPreferences: {
      preload: join(__dirname, "../preload/index.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  window.setMenuBarVisibility(false);
  window.once("ready-to-show", () => window.show());
  window.webContents.on("did-fail-load", (_event, code, description, url) => {
    console.error(`Renderer failed to load ${url}: ${code} ${description}`);
  });
  window.webContents.on("render-process-gone", (_event, details) => {
    console.error(`Renderer process stopped: ${details.reason}`);
  });

  if (process.env.ELECTRON_RENDERER_URL) {
    void window.loadURL(process.env.ELECTRON_RENDERER_URL).catch(console.error);
  } else {
    void window.loadFile(join(__dirname, "../renderer/index.html")).catch(console.error);
  }
}

app.whenReady().then(() => {
  ipcMain.handle("document:open", async () => {
    const result = await dialog.showOpenDialog({
      properties: ["openFile"],
      filters: [{ name: "Algorithm source", extensions: ["algo", "alg", "txt"] }],
    });

    if (result.canceled || !result.filePaths[0]) return null;
    const path = result.filePaths[0];
    return { path, content: await readFile(path, "utf8") };
  });

  ipcMain.handle(
    "document:save",
    async (_event, request: { path: string | null; content: string }) => {
      let path = request.path;
      if (!path) {
        const result = await dialog.showSaveDialog({
          defaultPath: "programme.algo",
          filters: [{ name: "Algorithm source", extensions: ["algo"] }],
        });
        if (result.canceled || !result.filePath) return null;
        path = result.filePath;
      }

      await writeFile(path, request.content, "utf8");
      return { path };
    },
  );

  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
