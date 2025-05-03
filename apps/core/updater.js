import { execSync } from 'child_process'
import semver from 'semver'
import fs from 'fs/promises'

export default class Updater {
  constructor(plugin) {
    this.plugin = plugin
    this.repo = 'jiuzeyuli/jiujiu-plugin'
  }

  async check(force = false) {
    try {
      const current = this.plugin.version
      const latest = await this.fetchLatestVersion()

      if (!semver.gt(latest, current)) {
        return { updated: false }
      }

      await this.createBackup()
      execSync('git pull && npm install --production', {
        cwd: this.plugin.path,
        stdio: 'inherit'
      })

      return { 
        updated: true,
        version: latest 
      }
    } catch (err) {
      return { error: err.message }
    }
  }

  async fetchLatestVersion() {
    const res = await fetch(`https://api.github.com/repos/${this.repo}/releases/latest`)
    const data = await res.json()
    return data.tag_name.replace(/^v/, '')
  }

  async createBackup() {
    const backupDir = path.join(this.plugin.dataPath, 'backups')
    await fs.mkdir(backupDir, { recursive: true })
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    await fs.cp(
      this.plugin.path,
      path.join(backupDir, `backup-${timestamp}`),
      { recursive: true }
    )
  }
}