interface Window {
  api: {
    setWindowTheme: (currentTheme) => Promise<void>
    openFolderDialog: () => Promise<string[]>
    openExternal: (url: string) => Promise<void>
  }
}
