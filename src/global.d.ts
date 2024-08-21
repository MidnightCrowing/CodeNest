interface Window {
  api: {
    setWindowTheme: (currentTheme) => Promise<void>
    openFolderDialog: () => Promise<string[]>
  }
}
