import simpleGit from 'simple-git'
import { exec } from 'child_process'
import { promisify } from 'util'
const execAsync = promisify(exec)

export class Updater {
  constructor(config) {
    this.config = config
    this.git = simpleGit()
    this.logger = console
  }

  async checkUpdate() {
    try {
      await this.git.fetch()
      const status = await this.git.status()
      return status.behind > 0
    } catch (err) {
      this.logger.error('[Updater] 检查更新失败:', err)
      return false
    }
  }

  async doUpdate(force = false) {
    let currentCommit
    try {
      currentCommit = await this.git.revparse(['HEAD'])
      
      if (force) {
        await this.git.reset('hard')
      }
      
      const pullResult = await this.git.pull()
      
      if (pullResult.summary.changes > 0) {
        if (pullResult.files.includes('package.json')) {
          await this._installDependencies()
        }
        return { 
          success: true, 
          changes: pullResult.summary.changes,
          files: pullResult.files
        }
      }
      return { success: false, changes: 0 }
    } catch (err) {
      if (currentCommit) {
        await this.git.reset(['--hard', currentCommit])
      }
      return { 
        success: false, 
        error: err.message,
        commit: currentCommit
      }
    }
  }

  async _installDependencies() {
    try {
      const { stdout, stderr } = await execAsync('npm install --production')
      if (stderr) this.logger.warn('[Updater] 依赖安装警告:', stderr)
      return true
    } catch (err) {
      this.logger.error('[Updater] 依赖安装失败:', err)
      return false
    }
  }
}