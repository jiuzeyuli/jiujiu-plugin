import chalk from 'chalk'
import dayjs from 'dayjs'

export class Logger {
  constructor(name) {
    this.name = name
  }

  _format(level, message) {
    const timestamp = dayjs().format('YYYY-MM-DD HH:mm:ss')
    return `[${timestamp}] [${this.name}] ${level} ${message}`
  }

  info(message) {
    console.log(chalk.blue(this._format('INFO', message)))
  }

  success(message) {
    console.log(chalk.green(this._format('SUCCESS', message)))
  }

  warn(message) {
    console.log(chalk.yellow(this._format('WARN', message)))
  }

  error(message) {
    console.log(chalk.red(this._format('ERROR', message)))
  }

  debug(message) {
    console.log(chalk.gray(this._format('DEBUG', message)))
  }
}