import { Command } from 'yunzai-core'
import fetch from 'node-fetch'

export default class WebCommand extends Command {
  constructor(plugin) {
    super({
      plugin,
      name: 'web-pic',
      regex: /^#网络图片$/,
      cooldown: 5000,
      permission: 'member'
    })
  }

  async execute() {
    const loading = await this.reply('🌐 获取网络中...')
    
    try {
      const { url, buffer } = await this.plugin.imageLoader.getWebImage()
      await this.plugin.cache.set(`web:${url}`, buffer, { persistent: true })
      
      this.editReply(loading, [
        segment.image(buffer),
        `\n📡 来源: ${url.replace(/\?.*/, '')}`
      ])
    } catch (err) {
      this.editReply(loading, '⚠️ 网络图片加载失败，请稍后重试')
      this.plugin.logger.error('网络图片错误:', err)
    }
  }
}