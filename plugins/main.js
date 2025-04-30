import plugin from "../../lib/plugins/plugin.js"
import config from "../../config/config.js"
import { Database } from "./database.js"
import { Updater } from "./updater.js"
import { Logger } from "./logger.js"
import { HelpCommand } from "./help.js"
import { UpdateCommand } from "./update.js"
import { WeatherCommand } from "./weather.js"
import { TranslateCommand } from "./translate.js"
import { CalculatorCommand } from "./calculator.js"
import { FortuneCommand } from "./fortune.js"
import { ImageCommand } from "./image.js"
import { JokeCommand } from "./joke.js"
import { StockCommand } from "./stock.js"
import { MusicCommand } from "./music.js"
import { RemindCommand } from "./remind.js"
import { GameCommand } from "./game.js"

export class JiuJiuPlugin extends plugin {
  constructor() {
    super({
      name: "JiuJiu-Plugin",
      dsc: "终极多功能QQ机器人插件",
      event: "message",
      priority: 10
    })

    this.config = config
    this.logger = new Logger('Main')
    this.services = {
      db: new Database(config.database),
      updater: new Updater(config)
    }

    // 初始化所有命令
    this.commands = {
      help: new HelpCommand(this),
      update: new UpdateCommand(this),
      weather: new WeatherCommand(this),
      translate: new TranslateCommand(this),
      calculator: new CalculatorCommand(this),
      fortune: new FortuneCommand(this),
      image: new ImageCommand(this),
      joke: new JokeCommand(this),
      stock: new StockCommand(this),
      music: new MusicCommand(this),
      remind: new RemindCommand(this),
      game: new GameCommand(this)
    }

    // 注册所有规则
    this.rule = Object.values(this.commands).flatMap(cmd => {
      if (!cmd.rules) return []
      return cmd.rules.map(rule => ({
        ...rule,
        log: true,
        event: "message"
      }))
    })
  }

  async init() {
    try {
      await this.services.db.connect()
      
      // 检查更新
      if (await this.services.updater.checkUpdate()) {
        this.logger.warn("检测到新版本可用，请使用 #九九更新 进行更新")
      }
      
      this.logger.success("插件初始化完成")
    } catch (err) {
      this.logger.error("初始化失败:", err)
      throw err
    }
  }
}