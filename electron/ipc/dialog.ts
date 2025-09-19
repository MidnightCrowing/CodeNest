import { dialog, ipcMain } from 'electron'

// 打开文件夹选择对话框
ipcMain.handle('dialog:open-folder', async (_, options?: {
  title?: string
}): Promise<string[]> => {
  const result = await dialog.showOpenDialog({
    title: options?.title,
    properties: ['openDirectory'], // 只能选择文件夹
  })
  return result.filePaths
})

// 打开文件选择对话框
ipcMain.handle('dialog:open-file', async (_, options?: {
  title?: string
  fileTypes?: { name: string, extensions: string[] }[]
}): Promise<string[]> => {
  const result = await dialog.showOpenDialog({
    title: options?.title,
    filters: options?.fileTypes, // 如果有文件类型，设置过滤器
    properties: ['openFile'], // 只能选择文件
  })
  return result.filePaths
})
