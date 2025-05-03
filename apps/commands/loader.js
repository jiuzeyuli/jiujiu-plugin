import LocalCommand from './local'
import WebCommand from './web'
import AdminCommand from './admin'
import UpdateCommand from './update'

export default class CommandLoader {
  constructor(plugin) {
    this.plugin = plugin
    this.availableCommands = [
      LocalCommand,
      WebCommand,
      AdminCommand,
      UpdateCommand
    ]
  }

  async load() {
    for (const CommandClass of this.availableCommands) {
      const cmd = new CommandClass(this.plugin)
      this.plugin.registerCommand(cmd)
    }
    this.plugin.logger.info(`已加载 ${this.availableCommands.length} 个命令`)
  }
}