import { dialog, ipcMain } from 'electron'

// 打开文件夹选择对话框
ipcMain.handle('dialog:open-folder', async (): Promise<string[]> => {
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory'], // 只能选择文件夹
  })
  return result.filePaths
})

// 打开文件选择对话框
ipcMain.handle('dialog:open-file', async (_, fileTypes: { name: string, extensions: string[] }[] = []): Promise<string[]> => {
  const result = await dialog.showOpenDialog({
    properties: ['openFile'], // 只能选择文件
    filters: fileTypes.length > 0 ? fileTypes : undefined, // 如果有文件类型，设置过滤器
  })
  return result.filePaths
})
