import { ipcMain } from 'electron'

import { getMainWindow } from '../main'

// 设置主题
ipcMain.handle('theme:set', async (_, theme: string): Promise<void> => {
  const colorSettings = theme === 'dark'
    ? { color: '#2B2D30', symbolColor: '#DFE1E5' }
    : { color: '#F2F2F2', symbolColor: '#222323' }

  getMainWindow().setTitleBarOverlay({
    color: colorSettings.color,
    symbolColor: colorSettings.symbolColor,
  })
})
