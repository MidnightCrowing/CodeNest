import { dialog, ipcMain } from 'electron'

// 注册处理程序
ipcMain.handle('open-folder-dialog', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory'],
  })
  return result.filePaths
})
