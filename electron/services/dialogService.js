import { dialog } from 'electron';
// 打开文件夹选择对话框
export async function openFolder(options) {
    const result = await dialog.showOpenDialog({
        title: options?.title,
        properties: ['openDirectory'],
    });
    return result.filePaths;
}
// 打开文件选择对话框
export async function openFile(options) {
    const result = await dialog.showOpenDialog({
        title: options?.title,
        filters: options?.fileTypes,
        properties: ['openFile'],
    });
    return result.filePaths;
}
