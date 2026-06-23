import { invoke } from '@tauri-apps/api/core'

function call<T>(command: string, args?: Record<string, unknown>) {
  return invoke<T>(command, args)
}

function fire(command: string, args?: Record<string, unknown>) {
  void call(command, args).catch(error => console.error(`Tauri command '${command}' failed:`, error))
}

window.api = {
  openFolderDialog: options => call('open_folder_dialog', { options }),
  openFileDialog: options => call('open_file_dialog', { options }),

  formatPath: filePath => call('format_path', { filePath }),
  checkPathExistence: path => call('check_path_existence', { path }),

  analyzeProject: folderPath => call('analyze_project', { folderPath }),
  getLanguageColor: languageName => call('get_language_color', { languageName }),
  readProjectLicense: (folderPath, maxLines = 20) =>
    call('read_project_license', { folderPath, maxLines }),
  openProject: (editorCommand, projectPath, openInTerminal) =>
    call('open_project', { editorCommand, projectPath, openInTerminal }),
  openRemoteProject: (host, remotePath, editorCommand, mode) =>
    call('open_remote_project', { host, remotePath, editorCommand, mode }),
  detectEditorCommand: editor => call('detect_editor_command', { editor }),
  deleteProject: projectPath => call('delete_project', { projectPath }),
  importProject: () => call('import_projects'),
  exportProject: () => call('export_projects'),

  saveData: (fileType, data) => call('save_data', { fileType, data }),
  loadData: fileType => call('load_data', { fileType }),
  openData: fileType => call('open_data', { fileType }),
  deleteData: fileType => call('delete_data', { fileType }),

  openExternal: url => fire('open_external', { url }),
  openInExplorer: path => fire('open_in_explorer', { path }),
  openInTerminal: (path, terminalCommand) =>
    call('open_in_terminal', { path, terminalCommand }),

  checkUpdate: () => call('check_update'),
  scanProjects: payload => call('scan_projects', { payload }),
  getSystemAccentColor: currentTheme => call('get_system_accent_color', { currentTheme }),
  detectJetBrainsConfigRootPath: () => call('detect_jetbrains_config_root_path'),
  detectRecentEditorStateDbPath: editor => call('detect_recent_editor_state_db_path', { editor }),
  detectCliHistoryRootPath: editor => call('detect_cli_history_root_path', { editor }),
  detectVscodeStateDbPath: () => call('detect_vscode_state_db_path'),
  loadWebDavPassword: () => call('load_webdav_password'),
  saveWebDavPassword: password => call('save_webdav_password', { password }),
  deleteWebDavPassword: () => call('delete_webdav_password'),
  webdavTestConnection: config => call('webdav_test_connection', { config }),
  webdavUploadData: config => call('webdav_upload_data', { config }),
  webdavPullData: config => call('webdav_pull_data', { config }),

  setWindowTheme: currentTheme => fire('set_window_theme', { currentTheme }),
  minimizeWindow: () => call('minimize_window'),
  toggleMaximizeWindow: () => call('toggle_maximize_window'),
  closeWindow: () => call('close_window'),
} satisfies Window['api']
