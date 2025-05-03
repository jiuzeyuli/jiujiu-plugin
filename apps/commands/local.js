import { Command } from 'yunzai-core'

export default class LocalCommand extends Command {
  constructor(plugin) {
    super({
      plugin,
      name: 'local-pic',
      regex: /^#随机图片$/,
      cooldown: 3000
    })
  }

  async execute() {
    try {
      const { path, buffer } = await this.plugin.imageLoader.getLocalRandom()
      await this.plugin.cache.set(`local:${path}`, buffer)
      this.reply(segment.image(`file://${path}`))
    } catch (err) {
      this.reply(`❌ 错误: ${err.message}`)
      this.plugin.logger.error(err)
    }
  }
}