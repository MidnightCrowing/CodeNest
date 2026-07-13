import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const invokeMock = vi.hoisted(() => vi.fn())

vi.mock('@tauri-apps/api/core', () => ({
  invoke: invokeMock,
}))

async function loadDesktopApi() {
  vi.resetModules()
  vi.stubGlobal('window', {})
  await import('./api')
  return window.api
}

async function flushPromises() {
  await Promise.resolve()
  await Promise.resolve()
}

describe('desktop api', () => {
  beforeEach(() => {
    invokeMock.mockReset()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('maps path helpers to Tauri command names and argument keys', async () => {
    invokeMock.mockResolvedValueOnce('~/Projects/CodeNest')
    const api = await loadDesktopApi()

    await expect(api.formatPath('E:\\Projects\\CodeNest')).resolves.toBe('~/Projects/CodeNest')

    expect(invokeMock).toHaveBeenCalledWith('format_path', {
      filePath: 'E:\\Projects\\CodeNest',
    })
  })

  it('maps project launch commands', async () => {
    invokeMock.mockResolvedValueOnce(undefined)
    invokeMock.mockResolvedValueOnce(undefined)
    const api = await loadDesktopApi()

    await api.openProject('code {project}', 'E:\\Projects\\CodeNest', false)
    await api.openRemoteProject('devbox', '/srv/project', 'code --remote ssh-remote+{host} {project}', 'vscode')

    expect(invokeMock).toHaveBeenNthCalledWith(1, 'open_project', {
      editorCommand: 'code {project}',
      openInTerminal: false,
      projectPath: 'E:\\Projects\\CodeNest',
    })
    expect(invokeMock).toHaveBeenNthCalledWith(2, 'open_remote_project', {
      editorCommand: 'code --remote ssh-remote+{host} {project}',
      host: 'devbox',
      mode: 'vscode',
      remotePath: '/srv/project',
    })
  })

  it('logs fire-and-forget command failures instead of throwing', async () => {
    const error = new Error('open failed')
    invokeMock.mockRejectedValueOnce(error)
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const api = await loadDesktopApi()

    api.openExternal('https://example.com')
    await flushPromises()

    expect(invokeMock).toHaveBeenCalledWith('open_external', {
      url: 'https://example.com',
    })
    expect(console.error).toHaveBeenCalledWith(
      'Tauri command \'open_external\' failed:',
      error,
    )
  })
})
