const { app, BrowserWindow, ipcMain, shell } = require("electron");
const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");
const { spawn } = require("node:child_process");

let mainWindow;

function getChromeUserDataDir() {
  const home = os.homedir();
  if (process.platform === "win32") {
    return path.join(process.env.LOCALAPPDATA || path.join(home, "AppData", "Local"), "Google", "Chrome", "User Data");
  }
  if (process.platform === "darwin") {
    return path.join(home, "Library", "Application Support", "Google", "Chrome");
  }
  const candidates = [
    path.join(home, ".config", "google-chrome"),
    path.join(home, ".config", "chromium"),
    path.join(home, "snap", "chromium", "common", "chromium")
  ];
  return candidates.find((candidate) => fs.existsSync(path.join(candidate, "Local State"))) || candidates[0];
}

function getProfiles() {
  const userDataDir = getChromeUserDataDir();
  const localStatePath = path.join(userDataDir, "Local State");
  if (!fs.existsSync(localStatePath)) {
    throw new Error(`Chrome profile data was not found.\n\nChecked:\n${localStatePath}\n\nOpen Chrome once and try again. If you use Chromium or a custom profile folder, check the project README for configuration notes.`);
  }

  const state = JSON.parse(fs.readFileSync(localStatePath, "utf8"));
  const infoCache = state?.profile?.info_cache || {};
  return Object.entries(infoCache)
    .filter(([directory]) => !["Guest Profile", "System Profile"].includes(directory))
    .map(([directory, info]) => ({
      directory,
      name: info?.name || directory,
      email: info?.user_name || "",
      avatar: info?.avatar_icon || ""
    }))
    .sort((a, b) => a.name.localeCompare(b.name) || a.directory.localeCompare(b.directory));
}

function findChromeExecutable() {
  if (process.platform === "win32") {
    const roots = [
      process.env.PROGRAMFILES,
      process.env["PROGRAMFILES(X86)"],
      process.env.LOCALAPPDATA
    ].filter(Boolean);
    const candidates = roots.map((root) => path.join(root, "Google", "Chrome", "Application", "chrome.exe"));
    return candidates.find((candidate) => fs.existsSync(candidate)) || "chrome.exe";
  }
  if (process.platform === "darwin") {
    const candidates = [
      "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
      path.join(os.homedir(), "Applications/Google Chrome.app/Contents/MacOS/Google Chrome")
    ];
    return candidates.find((candidate) => fs.existsSync(candidate)) || "open";
  }
  return ["google-chrome", "google-chrome-stable", "chromium", "chromium-browser"]
    .find((command) => {
      try {
        const result = require("node:child_process").spawnSync("which", [command], { encoding: "utf8" });
        return result.status === 0 && result.stdout.trim().length > 0;
      } catch { return false; }
    }) || "google-chrome";
}

function launchProfile(directory) {
  const executable = findChromeExecutable();
  let child;
  if (process.platform === "darwin" && executable === "open") {
    child = spawn("open", ["-a", "Google Chrome", "--args", `--profile-directory=${directory}`], { detached: true, stdio: "ignore" });
  } else {
    child = spawn(executable, [`--profile-directory=${directory}`], { detached: true, stdio: "ignore" });
  }
  child.on("error", (error) => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send("launch-error", `Could not start Chrome: ${error.message}`);
    }
  });
  child.unref();
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 650,
    height: 700,
    minWidth: 480,
    minHeight: 520,
    title: "Chrome Quick Switch",
    backgroundColor: "#0b1020",
    autoHideMenuBar: true,
    icon: path.join(__dirname, "app-icon.png"),
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });
  mainWindow.loadFile(path.join(__dirname, "index.html"));
}

ipcMain.handle("profiles:list", () => getProfiles());
ipcMain.handle("profiles:open", (_event, directory) => {
  if (typeof directory !== "string" || !/^(Default|Profile \d+)$/.test(directory)) {
    throw new Error("That Chrome profile folder name is not valid.");
  }
  const profiles = getProfiles();
  if (!profiles.some((profile) => profile.directory === directory)) {
    throw new Error("That profile is no longer available. Refresh the list and try again.");
  }
  launchProfile(directory);
  return true;
});
ipcMain.handle("app:version", () => app.getVersion());
ipcMain.handle("app:open-external", (_event, url) => {
  if (typeof url === "string" && /^https:\/\/(github\.com|www\.google\.com)\//.test(url)) shell.openExternal(url);
});

app.whenReady().then(() => {
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
