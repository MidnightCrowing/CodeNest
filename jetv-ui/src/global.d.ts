interface Window {
  api: {
    openFolderDialog: (options?: {
      title?: string
    }) => Promise<string[]>
    openFileDialog: (options?: {
      title?: string
      fileTypes?: { name: string, extensions: string[] }[]
    }) => Promise<string[]>
  }
}
