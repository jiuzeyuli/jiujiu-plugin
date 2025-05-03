#!/usr/bin/env node
import { Plugin } from 'yunzai-core'
import path from 'path'
import fs from 'fs/promises'
import { logger } from '../lib/logger.js'

// 数据库模块
import Database from '../database'

// 核心服务
import ImageService from './core/image_service'
import CacheManager from './core/cache/manager'
import Updater from './core/updater'

// 命令加载器
import CommandLoader from './commands/loader'

export default class JiujiuPlugin extends Plugin {
  constructor() {
    super({
      name: 'jiujiu-plugin',
      version: '1.2.0',
      config: {
        // 配置优先级: local.json > default.json
        defaultPath: path.join(__dirname, '../../config/default.json'),
        userPath: path.join(__dirname, '../../config/local.json')
      },
      dependencies: ['yunzai-database'] // 声明依赖的其他插件
    })

    // 初始化服务模块
    this.services = {
      database: new Database(this),  // 数据库
      image: new ImageService(this), // 图片服务
      cache: new CacheManager(this), // 缓存系统
      updater: new Updater(this),    // 自动更新
      commands: new CommandLoader(this) // 命令加载
    }

    // 运行时状态
    this.state = {
      isReady: false,
      startTime: Date.now(),
      stats: {
        totalRequests: 0,
        cachedResponses: 0
      }
    }

    // 热重载监听器
    this.configWatcher = null
  }

  /**
   * 插件启用时执行
   */
  async onEnable() {
    try {
      // 1. 初始化数据库
      await this.services.database.connect()
      
      // 2. 加载图片资源
      await this.services.image.init()
      
      // 3. 注册所有命令
      await this.services.commands.load()
      
      // 4. 启动后台任务
      this.startBackgroundJobs()
      
      // 5. 监听配置变化
      this.watchConfigChanges()

      this.state.isReady = true
      logger.success(`🐥 啾啾插件 v${this.version} 已激活`)
      logger.info(`➤ 图片目录: ${this.config.get('local.path')}`)
      logger.info(`➤ 数据库位置: ${this.services.database.dbPath}`)

    } catch (err) {
      logger.error('插件启动失败:', err)
      throw err // 终止插件加载
    }
  }

  /**
   * 插件禁用时执行
   */
  async onDisable() {
    // 1. 关闭配置监听
    if (this.configWatcher) {
      this.configWatcher.close()
    }
    
    // 2. 清理缓存
    await this.services.cache.cleanup()
    
    // 3. 断开数据库
    await this.services.database.disconnect()

    logger.info('插件已卸载')
  }

  /**
   * 启动后台任务
   */
  startBackgroundJobs() {
    // 每小时扫描图片目录
    this.intervals = {
      imageScanner: setInterval(() => {
        this.services.image.scanLocalImages()
          .then(count => logger.debug(`扫描到 ${count} 张图片`))
      }, 3600 * 1000),
      
      // 每天检查更新
      updateChecker: setInterval(async () => {
        if (!this.config.get('update.autoCheck')) return
        const { updated } = await this.services.updater.check()
        if (updated) {
          logger.warn('检测到新版本，请通过 #啾啾更新 安装')
        }
      }, 24 * 3600 * 1000),
      
      // 每30分钟清理过期缓存
      cacheCleaner: setInterval(() => {
        this.services.cache.cleanExpired()
      }, 30 * 60 * 1000)
    }
  }

  /**
   * 监听配置变化
   */
  watchConfigChanges() {
    const configPath = path.join(__dirname, '../../config/local.json')
    this.configWatcher = fs.watch(configPath, async (eventType) => {
      if (eventType === 'change') {
        try {
          await this.reloadConfig()
          logger.info('配置已热重载')
          
          // 特殊配置项需要特殊处理
          if (this.config.changed('local.path')) {
            await this.services.image.scanLocalImages()
          }
        } catch (err) {
          logger.error('配置重载失败:', err)
        }
      }
    })
  }

  /**
   * 记录使用统计
   */
  async recordUsage(userId, command) {
    this.state.stats.totalRequests++
    
    try {
      await this.services.database.models.usage.record({
        userId,
        command,
        timestamp: Date.now()
      })
    } catch (err) {
      logger.error('统计记录失败:', err)
    }
  }

  // 快捷访问器
  get imageLoader() {
    return this.services.image
  }

  get cache() {
    return this.services.cache
  }

  get database() {
    return this.services.database
  }
}

// 插件自检（开发模式）
if (process.argv.includes('--self-check')) {
  const plugin = new JiujiuPlugin()
  plugin.onEnable().then(() => {
    setTimeout(() => plugin.onDisable(), 5000)
  })
}