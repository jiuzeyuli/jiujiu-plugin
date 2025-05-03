import { Command } from 'yunzai-core'
import fs from 'fs/promises'

export default class AdminCommand extends Command {
  constructor(plugin) {
    super({
      plugin,
      name: 'admin',
      regex: /^#图片(状态|清理|目录\s(.+))$/,
      permission: 'master'
    })
  }

  async execute() {
    const [, action, arg] = this.event.msg.match(this.regex)
    
    switch (action) {
      case '状态':
        return this.showStatus()
      case '清理':
        return this.clearCache()
      case '目录':
        return this.setImageDir(arg)
      default:
        return this.reply('❌ 未知操作')
    }
  }

  async showStatus() {
    const stats = {
      '本地图片': `${this.plugin.imageLoader.localImages.length}张`,
      '内存缓存': `${this.plugin.cache.memory.size}项`,
      '插件版本': `v${this.plugin.version}`
    }
    
    this.reply([
      '📊 当前状态:',
      ...Object.entries(stats).map(([k, v]) => `• ${k}: ${v}`)
    ])
  }

  async clearCache() {
    await this.plugin.cache.clear()
    this.reply('✅ 已清理所有缓存')
  }

  async setImageDir(newPath) {
    try {
      await fs.access(newPath, fs.constants.R_OK)
      this.plugin.config.set('local.path', newPath)
      await this.plugin.imageLoader.scanLocalImages()
      this.reply(`✅ 图片目录已更新为:\n${newPath}`)
    } catch {
      this.reply('❌ 路径不可访问或不存在')
    }
  }
}