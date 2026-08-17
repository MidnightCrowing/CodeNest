import { debug, error, info, trace, warn } from '@tauri-apps/plugin-log'

type ConsoleMethod = 'log' | 'debug' | 'info' | 'warn' | 'error'
type LogFunction = (message: string) => Promise<void>

const logFunctions: Record<ConsoleMethod, LogFunction> = {
  log: trace,
  debug,
  info,
  warn,
  error,
}

function formatLogValue(value: unknown) {
  if (typeof value === 'string')
    return value
  if (value instanceof Error)
    return value.stack || value.message

  try {
    return JSON.stringify(value)
  }
  catch {
    return String(value)
  }
}

const browserConsole = globalThis.console

for (const method of Object.keys(logFunctions) as ConsoleMethod[]) {
  const original = browserConsole[method].bind(browserConsole)
  const logger = logFunctions[method]
  browserConsole[method] = (...values: unknown[]) => {
    original(...values)
    void logger(values.map(formatLogValue).join(' ')).catch(() => {})
  }
}
