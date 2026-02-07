import { app, BrowserWindow, Menu, ipcMain, screen } from "electron";
import { fileURLToPath } from "url";
import path from "node:path";
import { promises as fs } from "node:fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 🔁 Hot reload sadece dev modda aktif
if (process.env.NODE_ENV === "development") {
  import("electron-reloader")
    .then(reloader => {
      reloader.default(module);
    })
    .catch(err => {
      console.warn("⚠️ Hot reload modülü yüklenemedi:", err);
    });
}

let mainWin;
let optionsWin;
const createWindow = () => {
  mainWin = new BrowserWindow({
    width: 1280,
    height: 720,
    minWidth: 960,
    minHeight: 540,
    webPreferences: { preload: path.join(__dirname, "preload.js"), contextIsolation: true }
  });
  mainWin.loadFile(path.join(__dirname, "index.html"));
  mainWin.on("minimize", () => {
    mainWin.webContents.send("window-vis", false);
  });
  mainWin.on("restore", () => {
    mainWin.webContents.send("window-vis", true);
  });
  createMenu();
};

function createMenu() {
  const template = [
    { label: "File", submenu: [{ label: "Exit", accelerator: "Alt+F4", role: "quit" }] },
    { label: "View", submenu: [
        { role: "reload", label: "Reload" },
        { role: "forceReload", label: "Force Reload" },
        { type: "separator" },
        { role: "resetZoom", label: "Reset Zoom" },
        { role: "zoomIn", label: "Zoom In" },
        { role: "zoomOut", label: "Zoom Out" },
        { type: "separator" },
        { role: "toggleDevTools", label: "Toggle Dev Tools" }
      ]},
    {
      label: "Options",
      accelerator: "Ctrl+,",
      click: () => openOptions()
    },
    {
      label: "Help",
      submenu: [
        {
          label: "GitHub",
          click: () =>
            require("electron").shell.openExternal(
              "https://github.com/cinprens/Ragnarok-MVP-Timer"
            )
        }
      ]
    }
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

function openOptions() {
  if (optionsWin && !optionsWin.isDestroyed()) {
    optionsWin.focus();
    return;
  }
  optionsWin = new BrowserWindow({
    width: 600,
    height: 700,
    parent: mainWin,
    modal: true,
    webPreferences: { preload: path.join(__dirname, "preload.js"), contextIsolation: true },
  });
  optionsWin.setMenu(null); // alt pencerede menu olmasın
  optionsWin.loadFile(path.join(__dirname, "options.html"));
}

ipcMain.handle("open-options", () => openOptions());


// Renderer'a userData dizini yolunu döndürür
ipcMain.handle("get-user-data-path", () => app.getPath("userData"));


ipcMain.on("mvp-update", (_e, data) => {
  if (mainWin) mainWin.webContents.send("mvp-update", data);
});

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
