import { Command } from 'yunzai-core'

export default class UpdateCommand extends Command {
  constructor(plugin) {
    super({
      plugin,
      name: 'update',
      regex: /^#啾啾(强制)?更新$/,
      permission: 'master'
    })
  }

  async execute() {
    const loading = await this.reply('🔄 检查更新中...')
    const force = this.event.msg.includes('强制')

    try {
      const { updated, version } = await this.plugin.updater.check(force)
      this.editReply(loading, 
        updated ? `✅ 已更新到 v${version}\n请重启生效` 
               : '✨ 当前已是最新版本'
      )
    } catch (err) {
      this.editReply(loading, `❌ 更新失败: ${err.message}`)
    }
  }
}