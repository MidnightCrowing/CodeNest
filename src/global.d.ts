// src/global.d.ts
interface Window {
  api: {
    openFolderDialog: () => Promise<string[]>
  }
}
