export class HelpCommand {
  constructor(parent) {
    this.parent = parent
    this.config = parent.config
  }

  get rules() {
    return [{
      reg: `^${this.config.prefix}帮助$`,
      fnc: 'showHelp'
    }]
  }

  async showHelp() {
    const commands = [
      '🛠️ 系统命令:',
      `${this.config.prefix}帮助 - 显示本帮助`,
      `${this.config.prefix}九九更新 - 更新插件`,
      '',
      '🌦️ 实用工具:',
      `${this.config.prefix}天气 [城市] - 查询天气`,
      `${this.config.prefix}翻译 [从] [到] [文本] - 文本翻译`,
      `${this.config.prefix}计算 [表达式] - 数学计算`,
      '',
      '🎉 娱乐功能:',
      `${this.config.prefix}运势 - 今日运势`,
      `${this.config.prefix}随机图片 - 获取随机图片`,
      `${this.config.prefix}讲个笑话 - 随机笑话`
    ]

    return commands.join('\n')
  }
}