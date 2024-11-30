import chalk, { ChalkInstance } from 'chalk'

type LogLevel = 'warn' | 'error' | 'info' | 'success' | 'debug'

/**
 * Custom logger function that formats the message and logs it to the console
 *
 * @param logFunction - The function to use for logging
 * @param color - The color to use for logging
 * @param shouldLog - Whether or not to log
 * @returns A function that logs a message to the console
 *
 */
const createLogger =
  (
    logFunction: (...data: any[]) => void,
    color: ChalkInstance,
    shouldLog: boolean
  ) =>
  (...message: any[]): void => {
    if (shouldLog) {
      const formattedMessage = message.map(m =>
        typeof m === 'object' ? JSON.stringify(m, null, 2) : m
      )
      logFunction(color(...formattedMessage))
    }
  }

/**
 * Custom logger object with different log levels
 *
 * @property warn - Log a warning message
 * @property error - Log an error message
 * @property info - Log an info message
 * @property success - Log a success message
 * @property debug - Log a debug message
 *
 */
const logger: { [level in LogLevel]: (...data: any[]) => void } = {
  warn: createLogger(console.warn, chalk.yellow, true),
  error: createLogger(console.error, chalk.red, true),
  info: createLogger(console.info, chalk.blueBright, true),
  success: createLogger(console.log, chalk.green, true),
  debug: createLogger(console.debug, chalk.gray, true)
}

export default logger
