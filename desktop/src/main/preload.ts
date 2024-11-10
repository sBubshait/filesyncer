// Disable no-unused-vars, broken for spread args
/* eslint no-unused-vars: off */
import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';

export type Channels =
  | 'store-token'
  | 'get-token'
  | 'clear-token'
  | 'get-aws-config'
  | 'store-aws-config'
  | 'validate-aws-config'
  | 'get-sync-status'
  | 'start-sync'
  | 'restart-sync'
  | 'stop-sync'
  | 'get-watch-config'
  | 'add-watch-folder'
  | 'remove-watch-folder'
  | 'select-folder'
  | 'show-confirmation';

const electronHandler = {
  ipcRenderer: {
    sendMessage(channel: Channels, ...args: unknown[]) {
      ipcRenderer.send(channel, ...args);
    },
    on(channel: Channels, func: (...args: unknown[]) => void) {
      const subscription = (_event: IpcRendererEvent, ...args: unknown[]) =>
        func(...args);
      ipcRenderer.on(channel, subscription);

      return () => {
        ipcRenderer.removeListener(channel, subscription);
      };
    },
    once(channel: Channels, func: (...args: unknown[]) => void) {
      ipcRenderer.once(channel, (_event, ...args) => func(...args));
    },
    invoke: (channel: Channels) => {
      return ipcRenderer.invoke(channel);
    },
    invokeWithData: (channel: Channels, data: unknown) => {
      return ipcRenderer.invoke(channel, data);
    },
  },
};

contextBridge.exposeInMainWorld('electron', electronHandler);

export type ElectronHandler = typeof electronHandler;
