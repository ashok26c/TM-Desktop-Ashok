import { contextBridge, ipcRenderer } from 'electron';
import { electronAPI } from '@electron-toolkit/preload';

// Custom APIs
const customElectron = {
  getDesktopSources: () => ipcRenderer.invoke('get-desktop-sources'),
  stopRecording: () => ipcRenderer.send('stop-recording'),
};

const customApi = {
  send: (channel, data) => {
    const validChannels = ['start-ffmpeg', 'take-screenshot','ffmpeg-output']; // List of valid channels
    if (validChannels.includes(channel)) {
      ipcRenderer.invoke(channel, data);
    }
  },
  on: (channel, func) => {
    const validChannels = ['screenshot-data','ffmpeg-output'];
    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, (event, ...args) => func(...args));
    }
  },
};
// Check if context isolation is enabled and expose APIs accordingly
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', {
      ...electronAPI, // Expose Electron Toolkit APIs
      ...customElectron, 
      send:(channel,data)=>ipcRenderer.send(channel,data),
      on:(channel,func)=>ipcRenderer.on(channel,(event,...args)=>func(...args))
    });
    contextBridge.exposeInMainWorld('api', customApi);
  } catch (error) {
    console.error('Error exposing APIs:', error);
  }
} else {
  window.electron = {
    ...electronAPI, // Expose Electron Toolkit APIs
    ...customElectron, // Expose custom Electron APIs
    send: (channel, data) => ipcRenderer.send(channel, data), // Expose send method directly
    on: (channel, func) => ipcRenderer.on(channel, (event, ...args) => func(...args))
  };
  window.api = customApi;
}
