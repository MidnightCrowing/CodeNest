interface Window {
  api: {
    openFolderDialog: () => Promise<string[]>
  }
}
