const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("chromeQuickSwitch", {
  getProfiles: () => ipcRenderer.invoke("profiles:list"),
  openProfile: (directory) => ipcRenderer.invoke("profiles:open", directory),
  getVersion: () => ipcRenderer.invoke("app:version"),
  onLaunchError: (callback) => ipcRenderer.on("launch-error", (_event, message) => callback(message))
});
